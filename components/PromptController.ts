/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import './WeightKnob';
import type { WeightKnob } from './WeightKnob';

import type { MidiDispatcher } from '../utils/MidiDispatcher';
import type { Prompt, ControlChange } from '../types';

/** A single prompt input associated with a MIDI CC. */
@customElement('prompt-controller')
export class PromptController extends LitElement {
  static override styles = css`
    .prompt {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .freestyle-kit-pod & .prompt, .freestyle-layer & .prompt {
      flex-direction: row; /* Side-by-side knob and text area */
      gap: 1vmin;
      position: relative; /* For positioning midi cc */
      align-items: flex-start;
    }

    weight-knob {
      width: 7.5vmin;
      height: 7.5vmin;
      flex-shrink: 0;
    }
    .freestyle-kit-pod & weight-knob, .freestyle-layer & weight-knob {
      width: 8vmin;
      height: 8vmin;
      align-self: flex-start;
    }

    #midi {
      font-family: monospace;
      text-align: center;
      font-size: 1.1vmin;
      border: 0.2vmin solid #fff;
      border-radius: 0.5vmin;
      padding: 2px 5px;
      color: #fff;
      background: #0006;
      cursor: pointer;
      visibility: hidden;
      user-select: none;
      margin-top: 0.5vmin;
    }
    .learn-mode #midi {
        color: orange;
        border-color: orange;
    }
    .show-cc #midi {
        visibility: visible;
    }


    .freestyle-kit-pod & #midi, .freestyle-layer & #midi {
      position: absolute;
      top: 2.5vmin;
      left: 9vmin;
      margin-top: 0;
    }
    
    .prompt-input-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 0.5vmin;
    }

    #text, #prompt-select {
      font-weight: 500;
      font-size: 1.2vmin;
      width: 100%;
      max-width: 12vmin;
      padding: 0.3em 0.3em;
      margin-top: 0.5vmin;
      flex-shrink: 0;
      border-radius: 0.25vmin;
      border: 1px solid #555;
      outline: none;
      -webkit-font-smoothing: antialiased;
      background: #000;
      color: #fff;
      font-family: inherit;
      box-sizing: border-box;
    }
    #prompt-select {
      cursor: pointer;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27292.4%27%20height%3D%27292.4%27%3E%3Cpath%20fill%3D%27%23ffffff%27%20d%3D%27M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%27%2F%3E%3C%2Fsvg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5vmin center;
      background-size: 0.8vmin;
      padding-right: 2vmin;
    }
    #prompt-select:hover {
        border-color: #888;
    }
    #prompt-select option {
        background: #222;
        color: #fff;
    }

    #prompt-label {
        font-size: 1.1vmin;
        font-weight: 600;
        color: #ccc;
        margin-top: 0.8vmin;
        text-transform: uppercase;
        text-align: center;
    }

    #text {
      resize: none;
      &:not(:focus) {
        text-overflow: ellipsis;
      }
    }
    
    .freestyle-kit-pod & #text, .freestyle-layer & #text {
        flex-grow: 1;
        max-width: none;
        text-align: left;
        background: rgba(255,255,255,0.1);
        padding: 1vmin;
        border-radius: 0.5vmin;
        border: 1px solid rgba(255,255,255,0.2);
        font-size: 1.6vmin;
        margin-top: 0;
        min-height: 8vmin;
        width: 100%;
        box-sizing: border-box;
    }
    .freestyle-kit-pod & #text::placeholder,
    .freestyle-layer & #text::placeholder {
        color: #888;
        font-style: italic;
    }

    :host([filtered]) {
      weight-knob { 
        opacity: 0.5;
      }
      #text, #prompt-select {
        background: #da2000;
        z-index: 1;
      }
    }
    @media only screen and (max-width: 600px) {
      #text {
        font-size: 2.1vmin;
      }
      weight-knob {
        width: 60%;
      }
    }
  `;

  @property({ type: String }) promptId = '';
  @property({ type: String }) producerId = '';
  @property({ type: String }) text = '';
  @property({ type: Number }) weight = 0;
  @property({ type: String }) color = '';
  @property({ type: Boolean, reflect: true }) filtered = false;

  @property({ type: Number }) cc = 0;
  @property({ type: Number }) channel = 0; // Not currently used

  @property({ type: Boolean }) learnMode = false;
  @property({ type: Boolean }) showCC = false;
  
  @property({ type: String }) label = '';
  @property({ type: Array }) options?: string[];

  @query('weight-knob') private weightInput!: WeightKnob;
  @query('#text') private textInput?: HTMLTextAreaElement;

  @property({ type: Object })
  midiDispatcher: MidiDispatcher | null = null;

  @property({ type: Number }) audioLevel = 0;

  private lastValidText!: string;
  private categoryText = '';

  override connectedCallback() {
    super.connectedCallback();
    this.midiDispatcher?.addEventListener('cc-message', (e: Event) => {
      const customEvent = e as CustomEvent<ControlChange>;
      const { channel, cc, value } = customEvent.detail;
      if (this.learnMode) {
        this.cc = cc;
        this.channel = channel;
        this.learnMode = false;
        this.dispatchPromptChange();
      } else if (cc === this.cc) {
        this.weight = (value / 127) * 2;
        this.dispatchPromptChange();
      }
    });
  }

  override update(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('showCC') && !this.showCC) {
      this.learnMode = false;
    }
    super.update(changedProperties);
  }

  override firstUpdated() {
    this.setTextAreaState();
  }
  
  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('text')) {
      this.setTextAreaState();
    }
  }

  private setTextAreaState() {
    if (!this.textInput) return;

    if (this.text.startsWith('Freestyle:')) {
        this.categoryText = this.text;
        this.textInput.placeholder = `Describe the sound for ${this.text.replace('Freestyle: ', '')}...`;
        this.textInput.value = '';
        this.lastValidText = '';
    } else {
        this.categoryText = '';
        this.textInput.placeholder = '';
        this.textInput.value = this.text;
        this.lastValidText = this.text;
    }
  }

  public updateTextFromRandomize(newText: string) {
    if (this.textInput) {
        this.textInput.value = newText;
        this.text = newText;
        this.lastValidText = newText;
        this.categoryText = ''; // It's no longer just a category
        this.dispatchPromptChange();
    }
  }

  private dispatchPromptChange() {
    // If it's a freestyle layer and the text is empty, send the category text back.
    const isFreestyleCategory = !!this.categoryText;
    const textToSend = isFreestyleCategory && this.text.trim() === ''
        ? this.categoryText
        : this.text;

    this.dispatchEvent(
      new CustomEvent<Partial<Prompt>>('prompt-changed', {
        detail: {
          promptId: this.promptId,
          text: textToSend,
          weight: this.weight,
          cc: this.cc,
        },
      }),
    );
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.textInput?.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      this.resetText();
      this.textInput?.blur();
    }
  }

  private resetText() {
    this.text = this.lastValidText;
    if(this.textInput) {
        this.textInput.value = this.lastValidText;
    }
  }

  private async updateText() {
    if (!this.textInput) return;
    const newText = this.textInput.value?.trim() ?? '';
    this.text = newText;

    if (newText) {
        this.lastValidText = newText;
        this.categoryText = ''; // User has entered custom text
    } else if (this.textInput.placeholder.startsWith('Describe the sound')) {
        // User cleared the text, revert to category mode
        const category = this.textInput.placeholder.replace('Describe the sound for ', '').replace('...', '');
        this.categoryText = `Freestyle: ${category}`;
    }

    this.dispatchPromptChange();
    // Show the prompt from the beginning if it's cropped
    this.textInput.scrollTop = 0;
    this.textInput.scrollLeft = 0;
  }

  private onFocus() {
    this.textInput?.select();
  }

  private updateWeight() {
    this.weight = this.weightInput.value;
    this.dispatchPromptChange();
  }

  private toggleLearnMode() {
    this.learnMode = !this.learnMode;
  }
  
  private handleSelectChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.text = select.value;
    this.dispatchPromptChange();
  }
  
  private renderInput() {
    if (this.options && this.options.length > 0) {
      return html`
        <div class="prompt-input-wrapper">
            <label id="prompt-label" for="prompt-select">${this.label}</label>
            <select id="prompt-select" .value=${this.text} @change=${this.handleSelectChange}>
                ${this.options.map(opt => html`<option .value=${opt}>${opt}</option>`)}
            </select>
        </div>
      `;
    } else {
      return html`
        <div class="prompt-input-wrapper">
            <textarea
                id="text"
                spellcheck="false"
                @focus=${this.onFocus}
                @keydown=${this.onKeyDown}
                @blur=${this.updateText}></textarea>
        </div>
      `;
    }
  }

  override render() {
    const hostClasses = classMap({
      'learn-mode': this.learnMode,
      'show-cc': this.showCC,
    });
    return html`<div class="prompt ${hostClasses}">
      <weight-knob
        id="weight"
        value=${this.weight}
        color=${this.filtered ? '#888' : this.color}
        audioLevel=${this.filtered ? 0 : this.audioLevel}
        @input=${this.updateWeight}></weight-knob>
      ${this.renderInput()}
      <div id="midi" @click=${this.toggleLearnMode}>
        ${this.learnMode ? 'Learn' : `CC:${this.cc}`}
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'prompt-controller': PromptController;
  }
}
