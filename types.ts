/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Producer {
  readonly producerId: string;
  name: string;
  displayName?: string;
  description?: string;
  logo?: string;
  weight: number;
  cc: number;
  color: string;
  promptIds: string[];
  spice?: {
    label: string;
    text: string;
  };
  spiceActive?: boolean;
  secondarySpice?: {
    label: string;
    text: string;
  };
  secondarySpiceActive?: boolean;
  soloDrumsActive?: boolean;
  headProducerActive?: boolean;
  type?: 'producer' | 'instrument' | 'freestyle';
  basePrompt?: string;
  styleSelectors?: {
    label: string;
    options: string[];
    active: string;
  }[];
}

export interface Prompt {
  readonly promptId: string;
  readonly producerId: string;
  text: string;
  weight: number;
  cc: number;
  color: string;
  label?: string;
  options?: string[];
}

export interface ControlChange {
  channel: number;
  cc: number;
  value: number;
}

export type PlaybackState = 'stopped' | 'playing' | 'loading' | 'paused';

export interface PresetStyle {
  name: string;
  prompt: string;
}

export interface SongSection {
  id: string;
  name: string;
  color: string;
  state: {
    producers: Map<string, Producer>;
    prompts: Map<string, Prompt>;
  }
}

export interface ArrangementPart {
  id: string;
  sectionId: string;
  bars: number;
}