/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { PlaybackState, Prompt, Producer } from '../types';
import type { AudioChunk, GoogleGenAI, LiveMusicFilteredPrompt, LiveMusicServerMessage, LiveMusicSession } from '@google/genai';
import { decode, decodeAudioData } from './audio';
import { throttle } from './throttle';

export class LiveMusicHelper extends EventTarget {

  private ai: GoogleGenAI;
  private model: string;

  private session: LiveMusicSession | null = null;
  private sessionPromise: Promise<LiveMusicSession> | null = null;

  private connectionError = true;

  private filteredPrompts = new Set<string>();
  private nextStartTime = 0;
  private bufferTime = 2;

  public readonly audioContext: AudioContext;
  public extraDestination: AudioNode | null = null;

  private outputNode: GainNode;
  private _playbackState: PlaybackState = 'stopped';

  private producers: Map<string, Producer>;
  private prompts: Map<string, Prompt>;
  private currentMood: string = 'None';
  private currentKey: string = 'Any';
  private currentScale: string = 'Any';
  private currentEra: string = 'Any';
  private pitchShift = 0; // In semitones
  private modifiedToOriginalPromptMap = new Map<string, string>();

  public get playbackState(): PlaybackState {
    return this._playbackState;
  }

  constructor(ai: GoogleGenAI, model: string) {
    super();
    this.ai = ai;
    this.model = model;
    this.producers = new Map();
    this.prompts = new Map();
    this.audioContext = new AudioContext({ sampleRate: 48000 });
    this.outputNode = this.audioContext.createGain();
  }

  private getSession(): Promise<LiveMusicSession> {
    if (!this.sessionPromise) this.sessionPromise = this.connect();
    return this.sessionPromise;
  }

  private async connect(): Promise<LiveMusicSession> {
    this.sessionPromise = this.ai.live.music.connect({
      model: this.model,
      callbacks: {
        onmessage: async (e: LiveMusicServerMessage) => {
          if (e.setupComplete) {
            this.connectionError = false;
          }
          if (e.filteredPrompt) {
            const originalPromptText = this.modifiedToOriginalPromptMap.get(e.filteredPrompt.text!) ?? e.filteredPrompt.text!;
            this.filteredPrompts = new Set([...this.filteredPrompts, originalPromptText]);
            const originalFilteredPrompt: LiveMusicFilteredPrompt = {
                text: originalPromptText,
                filteredReason: e.filteredPrompt.filteredReason
            };
            this.dispatchEvent(new CustomEvent<LiveMusicFilteredPrompt>('filtered-prompt', { detail: originalFilteredPrompt }));
          }
          if (e.serverContent?.audioChunks) {
            await this.processAudioChunks(e.serverContent.audioChunks);
          }
        },
        onerror: () => {
          this.connectionError = true;
          this.stop();
          this.dispatchEvent(new CustomEvent('error', { detail: 'Connection error, please restart audio.' }));
        },
        onclose: () => {
          this.connectionError = true;
          this.stop();
          this.dispatchEvent(new CustomEvent('error', { detail: 'Connection error, please restart audio.' }));
        },
      },
    });
    return this.sessionPromise;
  }

  private setPlaybackState(state: PlaybackState) {
    this._playbackState = state;
    this.dispatchEvent(new CustomEvent('playback-state-changed', { detail: state }));
  }

  private async processAudioChunks(audioChunks: AudioChunk[]) {
    if (this._playbackState === 'paused' || this._playbackState === 'stopped') return;
    const audioBuffer = await decodeAudioData(
      decode(audioChunks[0].data!),
      this.audioContext,
      48000,
      2,
    );
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = Math.pow(2, this.pitchShift / 12);
    source.connect(this.outputNode);
    if (this.nextStartTime === 0) {
      this.nextStartTime = this.audioContext.currentTime + this.bufferTime;
      setTimeout(() => {
        this.setPlaybackState('playing');
      }, this.bufferTime * 1000);
    }
    if (this.nextStartTime < this.audioContext.currentTime) {
      this.setPlaybackState('loading');
      this.nextStartTime = 0;
      return;
    }
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration / source.playbackRate.value;
  }

  public setMood(mood: string) {
      this.currentMood = mood;
      if (this._playbackState === 'playing' || this._playbackState === 'loading') {
          this.setControls({ producers: this.producers, prompts: this.prompts });
      }
  }

  public setKeyAndScale(key: string, scale: string) {
    this.currentKey = key;
    this.currentScale = scale;
    if (this._playbackState === 'playing' || this._playbackState === 'loading') {
      this.setControls({ producers: this.producers, prompts: this.prompts });
    }
  }

  public setEra(era: string) {
    this.currentEra = era;
    if (this._playbackState === 'playing' || this._playbackState === 'loading') {
      this.setControls({ producers: this.producers, prompts: this.prompts });
    }
  }

  public setPitch(pitchShift: number) {
    this.pitchShift = pitchShift;
    // No need to change existing sources, subsequent chunks will have the new rate.
  }

  public readonly setControls = throttle(async (controls: {producers: Map<string, Producer>, prompts: Map<string, Prompt>}) => {
    const { producers, prompts } = controls;
    this.producers = producers;
    this.prompts = prompts;
    this.modifiedToOriginalPromptMap.clear();
    
    let promptsToSend: { text: string; weight: number; }[] = [];

    const soloedDrumProducer = [...this.producers.values()].find(p => p.soloDrumsActive);

    if (soloedDrumProducer) {
        promptsToSend.push({
            text: `A performance of drums and percussion in the style of ${soloedDrumProducer.name}`,
            weight: 2
        });
    } else {
        const activePrompts = Array.from(this.prompts.values())
          .filter((p) => {
            const producer = this.producers.get(p.producerId);
            if (!producer) return false;
    
            const producerWeight = producer.weight ?? 0;
            if (producerWeight <= 0 || this.filteredPrompts.has(p.text)) {
              return false;
            }
            
            // An instrument is active if its master knob is up.
            if (producer.type === 'instrument') {
              return true;
            }
    
            // A standard producer's prompt is active if its own knob is up.
            return p.weight > 0;
          });

        if (activePrompts.length === 0) {
          if (this._playbackState === 'playing' || this._playbackState === 'loading') {
            this.pause();
          }
          return;
        }

        const headProducer = [...this.producers.values()].find(p => p.headProducerActive);

        promptsToSend = activePrompts.map(p => {
            let modifiedText = p.text;
            const producer = this.producers.get(p.producerId)!;

            if (producer.spiceActive && producer.spice) {
                modifiedText = `${modifiedText} ${producer.spice.text}`;
            }
            
            if (producer.secondarySpiceActive && producer.secondarySpice) {
                modifiedText = `${modifiedText} ${producer.secondarySpice.text}`;
            }
        
            if (this.currentMood !== 'None') {
                modifiedText = `${this.currentMood} ${modifiedText}`;
            }

            if (this.currentEra !== 'Any') {
                modifiedText = `A ${this.currentEra} version of ${modifiedText}`;
            }

            const key = this.currentKey;
            const scale = this.currentScale;
            let keyScaleString = '';
            if (key !== 'Any') {
                keyScaleString += ` in the key of ${key}`;
                if (scale !== 'Any') {
                    keyScaleString += ` ${scale}`;
                }
            } else if (scale !== 'Any') {
                keyScaleString += ` in a ${scale} scale`;
            }
            modifiedText += keyScaleString;
            
            if (headProducer && producer.producerId !== headProducer.producerId) {
                modifiedText = `${modifiedText}, performed to compliment a song produced in the style of ${headProducer.name}`;
            }

            if (modifiedText !== p.text) {
                this.modifiedToOriginalPromptMap.set(modifiedText, p.text);
            }
            
            let finalWeight = producer.type === 'instrument' ? producer.weight : p.weight * producer.weight;
        
            return { text: modifiedText, weight: Math.min(2, finalWeight) };
        });
    }


    if (!this.session) return;

    try {
      await this.session.setWeightedPrompts({
        weightedPrompts: promptsToSend,
      });
    } catch (e: any) {
      this.dispatchEvent(new CustomEvent('error', { detail: e.message }));
      this.pause();
    }
  }, 200);

  public async play() {
    const activePrompts = Array.from(this.prompts.values())
        .filter((p) => {
          const producer = this.producers.get(p.producerId);
          if (!producer) return false;
    
          const producerWeight = producer.weight ?? 0;
          if (producerWeight <= 0 || this.filteredPrompts.has(p.text)) {
            return false;
          }
          
          if (producer.type === 'instrument') {
            return true;
          }
    
          return p.weight > 0;
        });

    if (activePrompts.length === 0) {
      this.dispatchEvent(new CustomEvent('error', { detail: 'Turn up a knob to start the music.' }));
      return;
    }
    
    this.setPlaybackState('loading');
    this.session = await this.getSession();
    await this.setControls({ producers: this.producers, prompts: this.prompts });
    this.audioContext.resume();
    this.session.play();
    this.outputNode.connect(this.audioContext.destination);
    if (this.extraDestination) this.outputNode.connect(this.extraDestination);
    this.outputNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.outputNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.1);
  }

  public pause() {
    if (this.session) this.session.pause();
    this.setPlaybackState('paused');
    this.outputNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.outputNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
    this.nextStartTime = 0;
    this.outputNode = this.audioContext.createGain();
  }

  public stop() {
    if (this.session) this.session.stop();
    this.setPlaybackState('stopped');
    this.outputNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.outputNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.1);
    this.nextStartTime = 0;
    this.session = null;
    this.sessionPromise = null;
  }

  public async playPause() {
    switch (this._playbackState) {
      case 'playing':
        return this.pause();
      case 'paused':
      case 'stopped':
        return this.play();
      case 'loading':
        return this.stop();
    }
  }

}