/**
 * @fileoverview Control real time music with a MIDI controller
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PlaybackState, Prompt, Producer, PresetStyle, SongSection, ArrangementPart } from './types';
import { GoogleGenAI, LiveMusicFilteredPrompt, Type } from '@google/genai';
import { ProducerCollective } from './components/PromptDjMidi';
import { ToastMessage } from './components/ToastMessage';
import { LiveMusicHelper } from './utils/LiveMusicHelper';
import { AudioAnalyser } from './utils/AudioAnalyser';
import { ALL_PRODUCERS, ALL_PROMPTS, PRESET_STYLES } from './data';
import './components/OnboardingGuide';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const musicModel = 'lyria-realtime-exp';
const textModel = 'gemini-2.5-flash';

async function generateRandomLayerPrompt(layerName: string): Promise<string> {
    const systemInstruction = `You are an expert music producer's assistant. Your task is to generate a short, creative, and descriptive musical idea for a specific instrumental layer of a song.
The response should be a concise phrase, like one you would find on a sample pack.
Do not use punctuation.
Do not add any conversational text or introductions. Just provide the musical idea.
The idea should be specific and inspiring. For example, for "Bassline", a good response would be "Deep 808 sub bass with a slow decay" or "Funky slap bass with a wah filter". For "Main Melody", a good response could be "Plucked kalimba melody with a tape delay".`;

    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: `Generate a creative idea for this layer: ${layerName}`,
            config: {
                systemInstruction,
            }
        });
        // Clean up response, remove quotes and extra spaces
        return response.text.trim().replace(/["'.]/g, '');
    } catch (e) {
        console.error('Error generating random layer prompt:', e);
        return 'Error generating prompt';
    }
}

class App {
  private readonly liveMusicHelper: LiveMusicHelper;
  private readonly audioAnalyser: AudioAnalyser;

  private producers: Map<string, Producer> = new Map();
  private prompts: Map<string, Prompt> = new Map();
  private songSections: Map<string, SongSection> = new Map();
  private arrangement: ArrangementPart[] = [];
  
  private isPlayingArrangement = false;
  private arrangementTimeoutId: number | null = null;
  private activeArrangementPartIndex = -1;
  private activeEditingSectionId: string | null = null;
  private _playbackStateBeforeEdit: { producers: Map<string, Producer>, prompts: Map<string, Prompt> } | null = null;
  
  private sectionColors = ['#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#009688', '#8bc34a', '#ffeb3b', '#ff9800', '#795548'];
  private nextColorIndex = 0;

  private producerPalettes = [
    { name: 'West Coast G-Funk', producers: ['Dr. Dre', 'DJ Quik', 'Scott Storch', 'Guitars', 'SYNTH', 'The Neptunes', 'Mannie Fresh'] },
    { name: 'Modern Trap', producers: ['808 Mafia', 'Metro Boomin', 'Zaytoven', 'PiANO', 'Sarz', 'Mustard', 'Freestyle Studio'] },
    { name: 'Soulful Boom Bap', producers: ['J Dilla', 'Questlove', 'RZA', 'Kanye West', 'PiANO', 'Cornell Dupree', 'Double Bass'] },
    { name: 'Cinematic Score', producers: ['Hans Zimmer', 'Orchestra Percussion', 'Brass Section', 'Violin', 'Cello', 'Opera Singer', 'The Mellotron'] },
    { name: '90s R&B', producers: ['Teddy Riley', 'Darkchild', 'Jermaine Dupri', 'The Neptunes', 'PiANO', 'SYNTH'] },
    { name: 'Afrobeats Party', producers: ['Davido', 'Sarz', 'Afrobeats', 'World Percussion', 'Guitars', 'SYNTH', 'Latin Music'] },
    { name: 'Psychedelic Rock', producers: ['Jimi Hendrix', 'Michael Hampton', 'Drummer', 'Guitars', 'The Mellotron', 'Classic Blues'] },
    { name: 'Global Fusion', producers: ['World Percussion', 'Indian Music', 'African Music', 'Spanish Folk', 'SYNTH', 'Hand Drummer'] },
    { name: 'Pop Anthem', producers: ['Tricky Stewart', 'Darkchild', 'K-pop', 'SYNTH', 'Guitars', 'Drummer', 'Freestyle Studio'] }
  ];


  private readonly producerCollective: ProducerCollective;
  private readonly toastMessage: ToastMessage;

  constructor(
    initialProducers: Producer[],
    initialPrompts: Prompt[],
    presetStyles: PresetStyle[],
  ) {
    this.liveMusicHelper = new LiveMusicHelper(ai, musicModel);
    this.audioAnalyser = new AudioAnalyser(this.liveMusicHelper.audioContext);
    this.liveMusicHelper.extraDestination = this.audioAnalyser.node;

    initialProducers.forEach((p) => this.producers.set(p.producerId, p));
    initialPrompts.forEach((p) => this.prompts.set(p.promptId, p));

    this.producerCollective = new ProducerCollective(
      this.producers,
      this.prompts,
      presetStyles,
    );
    this.toastMessage = new ToastMessage();
    document.body.append(this.producerCollective, this.toastMessage, document.createElement('onboarding-guide'));

    this.addEventListeners();
    this.updateLoop();
  }

  private addEventListeners() {
    this.liveMusicHelper.addEventListener('playback-state-changed', (e) => {
      this.producerCollective.playbackState = (e as CustomEvent<PlaybackState>).detail;
      if ((e as CustomEvent<PlaybackState>).detail === 'playing') {
        this.audioAnalyser.start();
      } else {
        this.audioAnalyser.stop();
      }
    });
    this.liveMusicHelper.addEventListener('error', (e) => {
      this.toastMessage.show((e as CustomEvent<string>).detail);
    });
    this.liveMusicHelper.addEventListener('filtered-prompt', (e) => {
        const filteredPrompt = (e as CustomEvent<LiveMusicFilteredPrompt>).detail;
        this.producerCollective.addFilteredPrompt(filteredPrompt.text!);
        this.toastMessage.show(`AI Filtered Prompt: "${filteredPrompt.text}". Reason: ${filteredPrompt.filteredReason}. This prompt is now disabled.`);
    });
    this.audioAnalyser.addEventListener('audio-level-changed', (e) => {
      this.producerCollective.audioLevel = (e as CustomEvent<number>).detail;
    });
    this.audioAnalyser.addEventListener('beat', (e) => {
      this.producerCollective.triggerBeatAnimation((e as CustomEvent<number>).detail);
    });
    this.audioAnalyser.addEventListener('bpm-changed', (e) => {
      this.producerCollective.bpm = (e as CustomEvent<number>).detail;
    });
    
    this.producerCollective.addEventListener('play-pause', () => this.liveMusicHelper.playPause());
    this.producerCollective.addEventListener('controls-changed', (e) => {
      const { producers, prompts } = (e as CustomEvent<{producers: Map<string, Producer>, prompts: Map<string, Prompt>}>).detail;
      this.producers = producers;
      this.prompts = prompts;
      this.liveMusicHelper.setControls({ producers: this.producers, prompts: this.prompts });
    });
    this.producerCollective.addEventListener('mood-changed', (e) => {
      const mood = (e as CustomEvent<string>).detail;
      this.producerCollective.currentMood = mood;
      this.liveMusicHelper.setMood(mood);
    });
    this.producerCollective.addEventListener('key-scale-changed', (e) => {
      const { key, scale } = (e as CustomEvent<{key: string, scale: string}>).detail;
      this.producerCollective.currentKey = key;
      this.producerCollective.currentScale = scale;
      this.liveMusicHelper.setKeyAndScale(key, scale);
    });
    this.producerCollective.addEventListener('era-changed', (e) => {
        const era = (e as CustomEvent<string>).detail;
        this.producerCollective.currentEra = era;
        this.liveMusicHelper.setEra(era);
    });
    this.producerCollective.addEventListener('pitch-changed', (e) => {
        const pitch = (e as CustomEvent<number>).detail;
        this.liveMusicHelper.setPitch(pitch);
    });
    this.producerCollective.addEventListener('ai-prompt-submitted', async (e) => {
        const prompt = (e as CustomEvent<string>).detail;
        await this.processAiPrompt(prompt);
        this.producerCollective.onAiPromptComplete();
    });
    this.producerCollective.addEventListener('ai-style-selected', async (e) => {
        const prompt = (e as CustomEvent<string>).detail;
        await this.processAiPrompt(prompt, true);
        this.producerCollective.onAiPromptComplete();
    });
    this.producerCollective.addEventListener('macro-prompt-submitted', async (e) => {
      const prompt = (e as CustomEvent<string>).detail;
      await this.processMacroPrompt(prompt);
      this.producerCollective.onMacroPromptComplete();
    });
    this.producerCollective.addEventListener('daw-transport', (e) => {
        const command = (e as CustomEvent<'start' | 'continue' | 'stop'>).detail;
        if (command === 'start' || command === 'continue') {
            if (this.liveMusicHelper.playbackState !== 'playing') {
                this.liveMusicHelper.play();
            }
        } else if (command === 'stop') {
            if (this.liveMusicHelper.playbackState === 'playing') {
                this.liveMusicHelper.pause();
            }
        }
    });
    this.producerCollective.addEventListener('randomize-freestyle-layer', async (e) => {
        const promptId = (e as CustomEvent<string>).detail;
        const prompt = this.prompts.get(promptId);
        if (!prompt) return;
        
        const layerCategory = prompt.text.replace('Freestyle: ', '');
        const generatedText = await generateRandomLayerPrompt(layerCategory);

        if (generatedText !== 'Error generating prompt') {
            prompt.text = generatedText;
            // Find the prompt controller and set its text directly
            const producer = this.producers.get(prompt.producerId);
            if (producer) {
              const freestyleProducer = [...this.producers.values()].find(p => p.name === 'Freestyle Studio');
              if (freestyleProducer) {
                  const promptController = this.producerCollective.shadowRoot?.querySelector(`prompt-controller[promptid="${promptId}"]`);
                  if (promptController) {
                      (promptController as any).updateTextFromRandomize(generatedText);
                  }
              }
            }
            prompt.weight = Math.max(prompt.weight, 1.0); // Turn it up if it was off
        }
        
        this.liveMusicHelper.setControls({ producers: this.producers, prompts: this.prompts });
        this.producerCollective.onRandomizeComplete();
        this.producerCollective.requestUpdate();
    });
    this.producerCollective.addEventListener('global-randomize', () => this.handleGlobalRandomize());
    
    // --- Arrangement Event Listeners ---
    this.producerCollective.addEventListener('capture-section', (e) => {
        this.handleCaptureSection((e as CustomEvent<{name: string, state: {producers: Map<string, Producer>, prompts: Map<string, Prompt>}}>).detail);
    });
    this.producerCollective.addEventListener('delete-section', (e) => {
        this.handleDeleteSection((e as CustomEvent<string>).detail);
    });
    this.producerCollective.addEventListener('update-arrangement', (e) => {
        this.arrangement = (e as CustomEvent<ArrangementPart[]>).detail;
        this.producerCollective.arrangement = this.arrangement; // Keep UI in sync
    });
    this.producerCollective.addEventListener('play-arrangement', () => this.handlePlayArrangement());
    this.producerCollective.addEventListener('stop-arrangement', () => this.handleStopArrangement());
    this.producerCollective.addEventListener('edit-section-start', (e) => this.handleEditSectionStart((e as CustomEvent<string>).detail));
    this.producerCollective.addEventListener('edit-section-finish', () => this.handleEditSectionFinish());

  }
  
  /**
   * Robustly parses a JSON string from an AI's text response.
   * It handles markdown code blocks and other surrounding text.
   * @param rawText The raw text response from the AI.
   * @returns The parsed JSON object.
   */
  private parseAiJsonResponse(rawText: string): any {
    const trimmedText = rawText.trim();
    
    // Attempt to find and parse a JSON code block first
    const jsonBlockMatch = trimmedText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch && jsonBlockMatch[1]) {
        try {
            return JSON.parse(jsonBlockMatch[1]);
        } catch (e) {
            console.warn('AI response contained a malformed JSON code block. Falling back to broader search.', e);
        }
    }

    // If no code block, find the first '{' or '[' and last '}' or ']'
    const firstBrace = trimmedText.indexOf('{');
    const lastBrace = trimmedText.lastIndexOf('}');
    const firstBracket = trimmedText.indexOf('[');
    const lastBracket = trimmedText.lastIndexOf(']');

    let firstChar = -1;
    let lastChar = -1;

    if (firstBrace !== -1 && firstBracket !== -1) {
        firstChar = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
        firstChar = firstBrace;
    } else {
        firstChar = firstBracket;
    }

    if (lastBrace !== -1 && lastBracket !== -1) {
        lastChar = Math.max(lastBrace, lastBracket);
    } else if (lastBrace !== -1) {
        lastChar = lastBrace;
    } else {
        lastChar = lastBracket;
    }
    
    if (firstChar !== -1 && lastChar > firstChar) {
        const potentialJson = trimmedText.substring(firstChar, lastChar + 1);
        try {
            return JSON.parse(potentialJson);
        } catch (e) {
            console.error('Failed to parse extracted JSON from AI response.', { error: e, text: potentialJson });
            throw new Error("Could not extract a valid JSON object from the AI's response.");
        }
    }
    
    // As a last resort, try parsing the whole string directly
    try {
        return JSON.parse(trimmedText);
    } catch(e) {
        throw new Error("The AI response was not in a recognizable JSON format.");
    }
  }

  private async processAiPrompt(prompt: string, isPreset = false) {
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                systemInstruction: `You are an expert music producer and DJ. Your task is to translate a user's natural language request into a specific configuration for a virtual mixing board.
The user is interacting with a UI that has several 'producers', each with a main volume ('weight') and several 'ingredient' knobs (also with 'weight').
The weights are floating point numbers from 0.0 (off) to 2.0 (max). 1.0 is the default 'on' state.

You MUST respond in JSON format. The JSON should be an object with a single key "producers", which is an array of objects.
Each object in the array represents a producer to be updated and must have a "name" property and a "weight" property.
If the user's prompt implies adjusting the ingredients of a producer, you can also include a "prompts" key, which is an array of objects, each with a "text" and "weight" property.

Here is the list of available producers and their prompts (ingredients):
${JSON.stringify(Array.from(this.producers.values()).map(p => ({
    name: p.name,
    prompts: p.promptIds.map(id => this.prompts.get(id)?.text)
})))}

Example Request: "Give me a 90s west coast g-funk beat"
Example Response:
{
  "producers": [
    { "name": "Dr. Dre", "weight": 1.2 },
    { "name": "DJ Quik", "weight": 0.8 },
    { "name": "Timbaland", "weight": 0.0 }
  ]
}

Example Request: "Make the Dr. Dre drums hit harder"
Example Response:
{
  "producers": [
    {
      "name": "Dr. Dre",
      "prompts": [
        { "text": "Hard-hitting clean drums", "weight": 1.5 }
      ]
    }
  ]
}

If the user gives a vague or creative prompt, interpret it and map it to the most appropriate producers and settings. For example, for "something dark and epic", you might turn up "808 Mafia" and "Hans Zimmer".
If a producer is not mentioned or implied in the new configuration, you do not need to include it in the response. Do not turn off producers unless explicitly asked (e.g., "turn off timbaland").
If the user provides a full musical prompt (like a preset style), turn OFF all producers not mentioned in your response to create a clean slate. You can do this by setting their weight to 0.

Your response should ONLY be the JSON object, with no markdown formatting or other conversational text.`,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        producers: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    weight: { type: Type.NUMBER },
                                    prompts: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                text: { type: Type.STRING },
                                                weight: { type: Type.NUMBER }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        let config;
        try {
            config = this.parseAiJsonResponse(response.text);
        } catch (parseError: any) {
            console.error("Failed to parse AI response as JSON:", parseError.message);
            console.error("Raw response text:", response.text);
            this.toastMessage.show("Sorry, the AI returned a response in an unexpected format. Please try rephrasing.");
            return;
        }
        
        if (isPreset) {
            // Turn all producers off first for a clean slate
            for (const producer of this.producers.values()) {
                producer.weight = 0;
            }
        }

        config.producers.forEach((pConfig: {name: string, weight?: number, prompts?: {text: string, weight: number}[]}) => {
            const producer = [...this.producers.values()].find(p => p.name === pConfig.name);
            if (producer) {
                if (pConfig.weight !== undefined) {
                    producer.weight = pConfig.weight;
                }
                if (pConfig.prompts) {
                    pConfig.prompts.forEach(promptConfig => {
                        const promptToUpdate = [...this.prompts.values()].find(pr => pr.producerId === producer.producerId && pr.text === promptConfig.text);
                        if (promptToUpdate) {
                            promptToUpdate.weight = promptConfig.weight;
                        }
                    });
                }
            }
        });

        this.liveMusicHelper.setControls({ producers: this.producers, prompts: this.prompts });
        this.producerCollective.requestUpdate();

    } catch (e) {
        console.error("AI Prompt Error:", e);
        this.toastMessage.show("Sorry, I couldn't process that request. Please try rephrasing.");
    }
  }
  
  private async processMacroPrompt(prompt: string) {
    try {
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                systemInstruction: `You are a helpful assistant controlling a music application's master volume knobs for different 'producers'.
The user will give you a simple command to adjust these volumes.
Your task is to respond with a JSON object detailing which producers' volumes ('weight') to change.
The weight is a float from 0.0 (off) to 2.0 (max).
Here are the available producers: ${JSON.stringify([...this.producers.values()].map(p => p.name))}
You MUST respond ONLY with the JSON object, no other text or markdown.

Example Request: "turn up dr dre and timbaland"
Example Response:
{
  "producers": [
    { "name": "Dr. Dre", "weight": 1.2 },
    { "name": "Timbaland", "weight": 1.2 }
  ]
}
Example Request: "a little less kanye, turn off scott storch"
Example Response:
{
  "producers": [
    { "name": "Kanye West", "weight": 0.7 },
    { "name": "Scott Storch", "weight": 0.0 }
  ]
}
`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        producers: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    weight: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        let config;
        try {
            config = this.parseAiJsonResponse(response.text);
        } catch (parseError: any) {
            console.error("Failed to parse Macro response as JSON:", parseError.message);
            console.error("Raw response text:", response.text);
            this.toastMessage.show("Sorry, I had trouble with that command's format. Please try again.");
            return;
        }

        config.producers.forEach((pConfig: {name: string, weight: number}) => {
            const producer = [...this.producers.values()].find(p => p.name === pConfig.name);
            if (producer) {
                producer.weight = pConfig.weight;
            }
        });

        this.liveMusicHelper.setControls({ producers: this.producers, prompts: this.prompts });
        this.producerCollective.requestUpdate();

    } catch (e) {
        console.error("Macro Prompt Error:", e);
        this.toastMessage.show("Sorry, I had trouble with that command.");
    }
  }

  private async handleGlobalRandomize() {
    this.producerCollective.onGlobalRandomizeStart();
    try {
        // 1. Turn off all producers for a clean slate.
        this.producers.forEach(producer => {
            producer.weight = 0;
        });

        // 2. Pick a random palette based on music theory principles of genre and harmony.
        const palette = this.producerPalettes[Math.floor(Math.random() * this.producerPalettes.length)];

        // 3. Shuffle the producers in the chosen palette and select 3 to 5 to activate.
        const producersToActivate = [...palette.producers].sort(() => 0.5 - Math.random());
        const countToActivate = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5 producers
        const selectedNames = producersToActivate.slice(0, countToActivate);

        // 4. Activate the selected producers with varied, dynamic weights.
        selectedNames.forEach(name => {
            const producer = [...this.producers.values()].find(p => p.name === name);
            if (producer) {
                // Assign a random weight for a more natural mix.
                producer.weight = 0.7 + Math.random() * 0.7;
            }
        });
        
        this.toastMessage.show(`Randomized Palette: ${palette.name}`);

        // 5. Randomize any placeholder Freestyle Studio prompts.
        const freestyleProducer = [...this.producers.values()].find(p => p.type === 'freestyle');
        if (freestyleProducer) {
            let promptsWereRandomized = false;
            
            const freestylePrompts = freestyleProducer.promptIds.map(id => this.prompts.get(id)!);
            
            const randomizationPromises = freestylePrompts.map(async (prompt) => {
                if (!prompt || !prompt.text.startsWith('Freestyle:')) return;
                
                promptsWereRandomized = true;
                const layerCategory = prompt.text.replace('Freestyle: ', '');
                const generatedText = await generateRandomLayerPrompt(layerCategory);

                if (generatedText !== 'Error generating prompt') {
                    prompt.text = generatedText;
                    prompt.weight = 1.0;

                    const promptController = this.producerCollective.shadowRoot?.querySelector(`prompt-controller[promptid="${prompt.promptId}"]`);
                    if (promptController) {
                        (promptController as any).updateTextFromRandomize(generatedText);
                    }
                }
            });

            await Promise.all(randomizationPromises);

            // If Freestyle was selected OR one of its prompts was randomized, ensure its master volume is on.
            if (selectedNames.includes('Freestyle Studio') || promptsWereRandomized) {
                freestyleProducer.weight = Math.max(freestyleProducer.weight, 0.7 + Math.random() * 0.6);
            }
        }

        // 6. Apply all new settings to the music model and update the UI.
        this.liveMusicHelper.setControls({ producers: this.producers, prompts: this.prompts });
        this.producerCollective.requestUpdate();

    } catch (e) {
        console.error('Global Randomize Error:', e);
        this.toastMessage.show("Sorry, an error occurred during randomization.");
    } finally {
        this.producerCollective.onGlobalRandomizeComplete();
    }
  }


  // --- Arrangement Methods ---

  private handleCaptureSection(detail: {name: string, state: {producers: Map<string, Producer>, prompts: Map<string, Prompt>}}) {
    const { name, state } = detail;
    if (!name) return;

    const color = this.sectionColors[this.nextColorIndex % this.sectionColors.length];
    this.nextColorIndex++;

    const newSection: SongSection = {
        id: `section-${Date.now()}`,
        name: name,
        color: color,
        state: {
            producers: state.producers,
            prompts: state.prompts,
        }
    };

    this.songSections.set(newSection.id, newSection);
    this.producerCollective.songSections = this.songSections; // Update UI
  }

  private handleDeleteSection(sectionId: string) {
    if (!this.songSections.has(sectionId)) return;

    this.songSections.delete(sectionId);
    
    // Also remove any instances of this section from the arrangement timeline
    this.arrangement = this.arrangement.filter(part => part.sectionId !== sectionId);

    // Update the UI component's state
    this.producerCollective.songSections = this.songSections;
    this.producerCollective.arrangement = this.arrangement;
  }

  private handlePlayArrangement() {
    if (this.arrangement.length === 0) {
        this.toastMessage.show("Your arrangement timeline is empty. Drag some sections onto it first!");
        return;
    }
    this.isPlayingArrangement = true;
    this.playArrangementSection(0);
  }

  private handleStopArrangement() {
    this.isPlayingArrangement = false;
    if (this.arrangementTimeoutId) {
        clearTimeout(this.arrangementTimeoutId);
        this.arrangementTimeoutId = null;
    }
    if (this.liveMusicHelper.playbackState !== 'stopped') {
        this.liveMusicHelper.pause();
    }
    this.activeArrangementPartIndex = -1;
    this.producerCollective.activeArrangementPartIndex = -1;
  }
  
  private async playArrangementSection(index: number) {
      if (!this.isPlayingArrangement || index >= this.arrangement.length) {
          this.handleStopArrangement();
          return;
      }

      this.activeArrangementPartIndex = index;
      this.producerCollective.activeArrangementPartIndex = index;

      const part = this.arrangement[index];
      const section = this.songSections.get(part.sectionId);

      if (!section) {
          console.error(`Section with id ${part.sectionId} not found!`);
          this.playArrangementSection(index + 1); // Skip to next
          return;
      }
      
      // Load section state
      this.producers = section.state.producers;
      this.prompts = section.state.prompts;
      this.producerCollective.producers = this.producers;
      this.producerCollective.prompts = this.prompts;
      
      await this.liveMusicHelper.setControls({ producers: this.producers, prompts: this.prompts });
      
      if (this.liveMusicHelper.playbackState !== 'playing' && this.liveMusicHelper.playbackState !== 'loading') {
          await this.liveMusicHelper.play();
      }

      // Calculate duration and schedule next section
      const bpm = this.producerCollective.bpm > 0 ? this.producerCollective.bpm : 120; // Default to 120 if no BPM yet
      const beatsPerSecond = bpm / 60;
      const partDurationSeconds = (part.bars * 4) / beatsPerSecond;

      this.arrangementTimeoutId = window.setTimeout(() => {
          this.playArrangementSection(index + 1);
      }, partDurationSeconds * 1000);
  }

  private handleEditSectionStart(sectionId: string) {
    const section = this.songSections.get(sectionId);
    if (!section) return;

    // Snapshot current live state for later restoration
    this._playbackStateBeforeEdit = {
        producers: new Map(JSON.parse(JSON.stringify(Array.from(this.producers.entries())))),
        prompts: new Map(JSON.parse(JSON.stringify(Array.from(this.prompts.entries()))))
    };

    // Load section state into the main controls
    this.producers = new Map(JSON.parse(JSON.stringify(Array.from(section.state.producers.entries()))));
    this.prompts = new Map(JSON.parse(JSON.stringify(Array.from(section.state.prompts.entries()))));
    
    this.activeEditingSectionId = sectionId;

    // Update the UI
    this.producerCollective.producers = this.producers;
    this.producerCollective.prompts = this.prompts;
    this.producerCollective.activeEditingSectionId = sectionId;
    this.producerCollective.activeEditingSectionName = section.name;
    
    // Find an active producer in the section to show its detail view
    const firstActiveProducer = [...this.producers.values()].find(p => p.weight > 0);
    this.producerCollective.activeProducerId = firstActiveProducer?.producerId ?? [...this.producers.keys()][0];
    this.producerCollective.currentView = 'detail';
  }

  private handleEditSectionFinish() {
    if (!this.activeEditingSectionId) return;

    const section = this.songSections.get(this.activeEditingSectionId);
    if (!section) return;
    
    // Save the modified state back to the section
    section.state = {
        producers: new Map(JSON.parse(JSON.stringify(Array.from(this.producers.entries())))),
        prompts: new Map(JSON.parse(JSON.stringify(Array.from(this.prompts.entries()))))
    };

    // Restore the pre-edit live state
    if (this._playbackStateBeforeEdit) {
        this.producers = this._playbackStateBeforeEdit.producers;
        this.prompts = this._playbackStateBeforeEdit.prompts;
        this.liveMusicHelper.setControls({ producers: this.producers, prompts: this.prompts });
    }
    
    this._playbackStateBeforeEdit = null;
    this.activeEditingSectionId = null;

    // Update UI
    this.producerCollective.producers = this.producers;
    this.producerCollective.prompts = this.prompts;
    this.producerCollective.activeEditingSectionId = null;
    this.producerCollective.songSections = this.songSections;
    this.producerCollective.currentView = 'arranger';
  }


  private updateLoop() {
    requestAnimationFrame(() => this.updateLoop());
  }
}

// Initialize the application with the embedded data
try {
    if (!Array.isArray(ALL_PRODUCERS) || !Array.isArray(ALL_PROMPTS) || !Array.isArray(PRESET_STYLES)) {
        throw new Error('Invalid data format: All data collections must be arrays.');
    }
    new App(ALL_PRODUCERS, ALL_PROMPTS, PRESET_STYLES);
} catch (error) {
    console.error('Fatal error during application initialization:', error);
    // Display a clear error message on the page instead of a blank screen
    document.body.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #181818; color: #ff8a80; font-family: 'Google Sans', sans-serif; display: flex; align-items: center; justify-content: center; text-align: center; padding: 2em;">
        <div>
          <h1 style="color: #fff; font-weight: 500;">Application Error</h1>
          <p style="font-size: 1.2em; max-width: 600px;">Could not start the application due to a critical error. The internal data might be corrupted.</p>
          <p style="background: #333; padding: 1em; border-radius: 8px; font-family: monospace; text-align: left; font-size: 1em;">${(error as Error).message}</p>
          <p style="color: #ccc;">Please check the browser's developer console for more details.</p>
        </div>
      </div>
    `;
}