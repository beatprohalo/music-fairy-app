/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';

const ONBOARDING_SEEN_KEY = 'producer-collective-onboarding-seen';

const STEPS = [
  {
    title: 'Welcome to Producer Collective!',
    text: 'This is your creative space for making music. Let\'s take a quick tour of the controls.',
    illustration: svg`<svg viewBox="0 0 24 24"><path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 12 2.5zm0 17a7.5 7.5 0 1 1 7.5-7.5A7.5 7.5 0 0 1 12 19.5z"/><path d="M11.25 8.75v6.5h1.5v-6.5zm0-2.25h1.5v1.5h-1.5z"/></svg>`
  },
  {
    title: 'The Producer Grid',
    text: 'This is your home base. Each button represents a legendary producer or a playable instrument. Click one to dive in and shape its sound.',
    illustration: svg`<svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zm8 0h6v6h-6zM4 14h6v6H4zm8 0h6v6h-6z"/></svg>`
  },
  {
    title: 'Mix & Blend',
    text: 'Inside a producer\'s page, turn the large knob for overall volume. Use the small knobs to blend their signature "ingredients" in real-time.',
    illustration: svg`<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm0 16a7 7 0 1 1 7-7 7 7 0 0 1-7 7z"/><path d="M12 8a.9.9 0 0 0-1 .9 1.1 1.1 0 0 0 1.1 1.1 1 1 0 0 0 0-2z" transform="rotate(-45 12 10)"/></svg>`
  },
  {
    title: 'Use The AI',
    text: 'Don\'t know where to start? Use the "AI Prompt" to describe any music you can imagine, or use "Styles" for quick-start genre templates.',
    illustration: svg`<svg viewBox="0 0 24 24"><path d="M15 4H9v2h6zm4 2H5v12h14zm-2 10H7v-2h10zm-4-4H7v-2h6z"/></svg>`
  },
  {
    title: 'Capture Your Ideas',
    text: 'When you create a loop you love, click "Capture Section" to save it as a building block for your song.',
    illustration: svg`<svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-2.76-2.24-5-5-5S7 4.24 7 7v3.5c-1.68.59-3 2.16-3 4v3h16v-3c0-1.84-1.32-3.41-3-4zM9 7c0-1.66 1.34-3 3-3s3 1.34 3 3v3H9z"/></svg>`
  },
  {
    title: 'Arrange Your Song',
    text: 'Go to the "Arranger" to sequence your captured sections. Just drag and drop them onto the timeline to build your full track.',
    illustration: svg`<svg viewBox="0 0 24 24"><path d="M4 10h16v2H4zm0 4h10v2H4zm0-8h16v2H4z"/></svg>`
  },
  {
    title: 'You\'re Ready to Create!',
    text: 'That\'s it! Press the big Play button at any time to listen to your creation. Have fun exploring the sounds.',
    illustration: svg`<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`
  }
];

@customElement('onboarding-guide')
export class OnboardingGuide extends LitElement {
  static override styles = css`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .overlay.active {
      opacity: 1;
      pointer-events: auto;
    }
    .modal {
      background: #2c2c2c;
      color: #fff;
      border-radius: 12px;
      padding: 24px;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transform: scale(0.95);
      transition: transform 0.3s ease;
    }
    .overlay.active .modal {
        transform: scale(1);
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .illustration {
        width: 80px;
        height: 80px;
        margin-bottom: 16px;
        fill: #fff;
        opacity: 0.9;
    }

    h2 {
      margin: 0 0 10px 0;
      font-size: 22px;
    }

    p {
      margin: 0 0 24px 0;
      font-size: 16px;
      line-height: 1.6;
      color: #ccc;
    }

    .progress-dots {
        display: flex;
        gap: 8px;
        margin-bottom: 24px;
    }
    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #555;
        transition: background 0.3s ease;
    }
    .dot.active {
        background: #fff;
    }

    .navigation {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    button {
      font-family: 'Google Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .skip-btn {
      background: transparent;
      color: #999;
    }
    .skip-btn:hover {
        color: #fff;
    }

    .next-btn {
      background: #fff;
      color: #222;
    }
    .next-btn:hover {
        transform: scale(1.05);
    }
    .back-btn {
        background: #444;
        color: #fff;
    }
  `;

  @state() private step = 0;
  @state() private active = false;

  constructor() {
    super();
    const seen = localStorage.getItem(ONBOARDING_SEEN_KEY);
    if (!seen) {
      // Use a short timeout to ensure the rest of the app has loaded
      setTimeout(() => {
        this.active = true;
      }, 500);
    }
  }

  private nextStep() {
    if (this.step < STEPS.length - 1) {
      this.step++;
    } else {
      this.finish();
    }
  }

  private prevStep() {
    if (this.step > 0) {
      this.step--;
    }
  }

  private finish() {
    this.active = false;
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
  }

  override render() {
    if (!this.active) return html``;

    const currentStep = STEPS[this.step];
    const isLastStep = this.step === STEPS.length - 1;

    return html`
      <div class="overlay active" @click=${(e: Event) => { if (e.target === this.shadowRoot?.querySelector('.overlay')) this.finish() }}>
        <div class="modal">
          <div class="modal-content">
            <div class="illustration">${currentStep.illustration}</div>
            <h2>${currentStep.title}</h2>
            <p>${currentStep.text}</p>
            <div class="progress-dots">
                ${STEPS.map((_, i) => html`<div class="dot ${i === this.step ? 'active' : ''}"></div>`)}
            </div>
          </div>
          <div class="navigation">
            ${this.step > 0 ? html`<button class="back-btn" @click=${this.prevStep}>Back</button>` : html`<button class="skip-btn" @click=${this.finish}>Skip Tour</button>`}
            <button class="next-btn" @click=${this.nextStep}>${isLastStep ? 'Finish' : 'Next'}</button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'onboarding-guide': OnboardingGuide;
  }
}