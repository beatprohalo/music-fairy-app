/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { ControlChange } from '../types';

/** Simple class for dispatching MIDI CC messages as events. */
export class MidiDispatcher extends EventTarget {
  private access: MIDIAccess | null = null;
  activeMidiInputId: string | null = null;

  private attachMessageListeners() {
    if (!this.access) return;
    for (const input of this.access.inputs.values()) {
      input.onmidimessage = (event: MIDIMessageEvent) => {
        if (input.id !== this.activeMidiInputId) return;

        const { data } = event;
        if (!data) {
          console.error('MIDI message has no data');
          return;
        }

        const statusByte = data[0];

        // Handle System Real-Time Messages for DAW sync
        if (statusByte === 0xFA) { // START
          this.dispatchEvent(new CustomEvent('transport-message', { detail: 'start' }));
          return;
        }
        if (statusByte === 0xFB) { // CONTINUE
          this.dispatchEvent(new CustomEvent('transport-message', { detail: 'continue' }));
          return;
        }
        if (statusByte === 0xFC) { // STOP
          this.dispatchEvent(new CustomEvent('transport-message', { detail: 'stop' }));
          return;
        }
        
        const channel = statusByte & 0x0f;
        const messageType = statusByte & 0xf0;

        const isControlChange = messageType === 0xb0;
        if (!isControlChange) return;

        const detail: ControlChange = { cc: data[1], value: data[2], channel };
        this.dispatchEvent(
          new CustomEvent<ControlChange>('cc-message', { detail }),
        );
      };
    }
  }

  async getMidiAccess(): Promise<{ id: string; name: string | undefined }[]> {
    if (!this.access) {
      if (!navigator.requestMIDIAccess) {
        throw new Error('Your browser does not support the Web MIDI API. For a list of compatible browsers, see https://caniuse.com/midi');
      }

      this.access = await navigator
        .requestMIDIAccess({ sysex: false })
        .catch((error) => error);

      if (this.access === null) {
        throw new Error('Unable to acquire MIDI access.');
      }

      this.access.onstatechange = () => {
        this.attachMessageListeners(); // Re-attach listeners to all current devices
        this.dispatchEvent(new CustomEvent('midi-connections-changed'));
      };
    }
  
    this.attachMessageListeners();
    const inputs = [...this.access.inputs.values()];
    return inputs.map(input => ({ id: input.id, name: input.name }));
  }
}