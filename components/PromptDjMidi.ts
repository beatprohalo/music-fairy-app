/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { css, html, LitElement, svg } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { throttle } from '../utils/throttle';

import './PromptController';
import './PlayPauseButton';
import './WeightKnob';
import type { PlaybackState, Prompt, Producer, ControlChange, PresetStyle, SongSection, ArrangementPart } from '../types';
import { MidiDispatcher } from '../utils/MidiDispatcher';
import { buildInstrumentPrompt } from '../utils/prompt-builder';

const FREESTYLE_LAYER_CATEGORIES = [
  'Drums & Percussion',
  'Drums',
  'Percussion',
  'Bassline',
  'Sub Bass',
  'Chords & Harmony',
  'Main Melody',
  'Lead Synth',
  'Counter Melody / Riff',
  'Pads & Atmosphere',
  'Vocal Chop / Sample',
  'Sound FX',
  'Rhythm Guitar',
  'Strings',
  'Brass',
];

const ARRANGEMENT_MARKERS = ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro', 'Solo', 'Build-up', 'Drop'];

const copyIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
const trashIcon = svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;


/** The grid of prompt inputs. */
@customElement('producer-collective')
export class ProducerCollective extends LitElement {
  static override styles = css`
    :host {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 0.5vmin;
    }
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5vmin;
      max-width: 100%;
      max-height: 100%;
      width: 100%;
      padding-bottom: 9vmin; /* Add padding to avoid overlap with fixed play button */
      overflow-y: auto;
    }
    #background {
      will-change: background-image;
      position: absolute;
      height: 100%;
      width: 100%;
      z-index: -1;
      background: #181818;
      transition: background-image 0.1s ease-out;
      overflow: hidden;
      --pulse-color: hsla(187, 100%, 50%, 0.5); /* Default color */
    }
    .light-source {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 150vmin;
        height: 150vmin;
        background: radial-gradient(circle, hsla(from var(--pulse-color) h s l / var(--beat-alpha)) 0%, transparent 60%);
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0;
        pointer-events: none;
        will-change: transform, opacity;
    }
    #background.beat .light-source {
        --beat-alpha: calc(0.1 + var(--beat-raw-intensity, 0) * 0.2); /* Softer, less intense glow */
        animation: mood-glow 2s ease-out; /* Slower, more atmospheric pulse */
    }
    @keyframes mood-glow {
      0% {
        transform: translate(-50%, -50%) scale(0.9);
        opacity: 0;
      }
      20% {
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0;
      }
    }
    header {
      color: #eee;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 1vmin 1.5vmin;
      width: 100%;
      max-width: 120vmin;
      background: rgba(24, 24, 24, 0.4);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      padding: 0.8vmin;
      border-radius: 8px;
      box-sizing: border-box;
    }
    .title-bar {
      display: flex;
      align-items: center;
      gap: 1.5vmin;
      margin: 0 auto 0 0;
    }
    header h1 {
      font-size: 1.6vmin;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin: 0;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
    }
    .bpm-display {
        font-family: monospace;
        font-size: 1.6vmin;
        font-weight: 600;
        color: #00e5ff;
        background: rgba(0, 30, 40, 0.5);
        padding: 0.3vmin 0.8vmin;
        border-radius: 4px;
        border: 1px solid rgba(0, 229, 255, 0.3);
    }
    .daw-sync-indicator {
        font-size: 1.1vmin;
        font-weight: 700;
        color: #fff;
        background: #e91e63;
        padding: 0.3vmin 0.8vmin;
        border-radius: 4px;
        text-transform: uppercase;
    }
    .header-controls {
      display: flex;
      align-items: center;
      gap: 0.8vmin;
      margin-left: auto;
    }
    .header-controls label {
        font-size: 1.1vmin;
        font-weight: 600;
        color: #ccc;
        text-transform: uppercase;
    }
    .header-controls select {
        font-family: inherit;
        font-size: 1.2vmin;
        font-weight: 500;
        background: rgba(255,255,255,0.1);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        padding: 0.4vmin 0.6vmin;
    }
    .header-controls select option {
        background: #222;
        color: #fff;
    }
    #pitch-slider-container {
      display: flex;
      align-items: center;
      gap: 0.5vmin;
    }
    #pitch-slider {
      width: 10vmin;
    }
    #pitch-value {
      font-family: monospace;
      font-size: 1.2vmin;
      width: 3ch;
      text-align: right;
    }

    .view-container {
      width: 100%;
      max-width: 120vmin;
    }

    .overview-container {
      padding: 1vmin;
      background: rgba(24, 24, 24, 0.4);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      border-radius: 8px;
    }
    
    .global-actions {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 1vmin;
    }
    .global-randomize-btn {
      background: linear-gradient(45deg, #673ab7, #9c27b0);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 1vmin 2vmin;
      font-size: 1.4vmin;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .global-randomize-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    }
    .global-randomize-btn:disabled {
      background: #555;
      cursor: wait;
      opacity: 0.7;
    }

    .producer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(12vmin, 1fr));
      gap: 0.8vmin;
      width: 100%;
    }
    .producer-grid button {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      font-family: 'Google Sans', sans-serif;
      font-size: 1.2vmin;
      font-weight: 600;
      padding: 2vmin 1vmin;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      line-height: 1.2;
      aspect-ratio: 1;
      --producer-color: #888; /* Default color */
    }
    .producer-grid button.has-logo {
        padding: 1.5vmin;
    }
    .producer-grid button.has-logo svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
    }
    .producer-grid button:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 5px 0px rgba(from var(--producer-color) r g b / 0.6);
      }
      50% {
        box-shadow: 0 0 12px 3px rgba(from var(--producer-color) r g b / 0.9);
      }
      100% {
        box-shadow: 0 0 5px 0px rgba(from var(--producer-color) r g b / 0.6);
      }
    }

    .producer-grid button.active {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid var(--producer-color);
      animation: pulse 2s infinite ease-in-out;
    }

    .producer-grid button.selected {
      border-color: #00e5ff;
      box-shadow: 0 0 12px rgba(0, 229, 255, 0.7);
    }
    .producer-grid button.freestyle-btn {
      color: #d1c4e9;
      border-color: #b39ddb;
    }

    .detail-view {
      padding: 1vmin;
      background: rgba(24, 24, 24, 0.4);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      border-radius: 8px;
    }
    .detail-description {
      font-size: 1.3vmin;
      color: #ccc;
      text-align: center;
      max-width: 60vmin;
      margin: -0.5vmin auto 1.5vmin auto;
      line-height: 1.5;
    }

    .detail-header {
      display: flex;
      align-items: center;
      margin-bottom: 1.5vmin;
      padding: 0 1vmin;
    }
    .detail-header .back-button {
      background: none;
      border: none;
      color: #ccc;
      cursor: pointer;
      font-size: 2.5vmin;
      padding: 0 1vmin 0 0;
      transition: color 0.2s;
    }
    .detail-header .back-button:hover {
      color: #fff;
    }
    .detail-header h2 {
      display: flex;
      align-items: center;
      gap: 1vmin;
      font-size: 2vmin;
      font-weight: 600;
      margin: 0;
    }
    .detail-header h2 svg {
      width: 3vmin;
      height: 3vmin;
      fill: currentColor;
    }
    .detail-header .solo-drums-button {
        margin-left: auto;
        font-size: 1.1vmin;
        font-weight: 600;
        background: rgba(255,255,255,0.1);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
        padding: 0.5vmin 1vmin;
        border-radius: 4px;
        cursor: pointer;
    }
    .detail-header .solo-drums-button.active {
        background: #e91e63;
        border-color: #ff80ab;
    }
    .detail-header .head-producer-button {
        margin-left: 0.5vmin;
        font-size: 1.1vmin;
        font-weight: 600;
        background: rgba(255,255,255,0.1);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
        padding: 0.5vmin 1vmin;
        border-radius: 4px;
        cursor: pointer;
    }
    .detail-header .head-producer-button.active {
        background: #00bcd4;
        border-color: #80deea;
    }
    
    .producer-controls {
      display: flex;
      gap: 1.5vmin;
      justify-content: center;
      align-items: flex-start;
      padding: 1vmin;
    }
    .master-knob-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1vmin;
    }
    .master-knob-container h3 {
        font-size: 1.3vmin;
        font-weight: 600;
        text-transform: uppercase;
        margin: 0;
    }
    .master-knob-container weight-knob {
      width: 12vmin;
      height: 12vmin;
    }

    .prompt-container {
      display: flex;
      gap: 1.5vmin;
      flex-grow: 1;
      justify-content: center;
      border-left: 1px solid rgba(255,255,255,0.1);
      padding-left: 1.5vmin;
    }
    
    .instrument-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1vmin;
        flex-grow: 1;
    }
    
    .instrument-controls .selectors {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1vmin 1.5vmin;
        margin-top: 1vmin;
    }
    
    .instrument-controls .selector-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5vmin;
    }
    
    .instrument-controls label {
        font-size: 1.1vmin;
        font-weight: 600;
        color: #ccc;
        text-transform: uppercase;
    }
    
    .instrument-controls select {
        font-family: inherit;
        font-size: 1.4vmin;
        font-weight: 500;
        background: rgba(0,0,0,0.3);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        padding: 0.6vmin 1vmin;
    }
    .instrument-controls select option {
        background: #222;
        color: #fff;
    }

    .spice-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.8vmin;
        margin-top: 1vmin;
        padding-left: 1vmin;
        border-left: 1px solid rgba(255,255,255,0.1);
    }
    .spice-button {
        font-family: inherit;
        font-size: 1.2vmin;
        font-weight: 600;
        background: rgba(255,255,255,0.1);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
        padding: 0.8vmin 1.2vmin;
        border-radius: 2vmin;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }
    .spice-button:hover {
        background: rgba(255,255,255,0.2);
    }
    .spice-button.active {
        background: #9c27b0;
        border-color: #ce93d8;
    }

    .freestyle-pod {
        padding: 2vmin;
        display: flex;
        flex-direction: column;
        gap: 2vmin;
    }
    .freestyle-layer {
        display: flex;
        gap: 1vmin;
        align-items: flex-start;
        position: relative;
    }
    .freestyle-layer .randomize-btn {
        position: absolute;
        top: 0;
        right: 0;
        background: none;
        border: 1px solid #ccc;
        color: #ccc;
        font-size: 1.2vmin;
        padding: 0.5vmin;
        border-radius: 4px;
        cursor: pointer;
    }
    .freestyle-layer .randomize-btn.loading {
        color: #888;
        cursor: default;
    }
    .freestyle-layer prompt-controller {
        flex-grow: 1;
    }

    .navigation-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(to top, #181818, rgba(24, 24, 24, 0.9));
        padding: 0.8vmin;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1.5vmin;
        z-index: 10;
        box-sizing: border-box;
    }
    .nav-button {
      background: none;
      border: 1px solid #555;
      color: #ccc;
      font-size: 1.2vmin;
      font-weight: 600;
      padding: 0.8vmin 1.5vmin;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
    }
    .nav-button:hover {
        background: #333;
        color: #fff;
    }
    .nav-button.active {
        background: #555;
        color: #fff;
        border-color: #888;
    }
    .nav-button.ai-prompt-btn.active { background: #673ab7; border-color: #9575cd; color: #fff;}
    .nav-button.styles-btn.active { background: #4caf50; border-color: #81c784; color: #fff;}
    .nav-button.macros-btn.active { background: #2196f3; border-color: #64b5f6; color: #fff;}
    .nav-button.arranger-btn.active { background: #e91e63; border-color: #f06292; color: #fff;}
    
    .nav-button.all-off-btn {
        background: #d32f2f;
        border-color: #f44336;
        color: #fff;
    }
    .nav-button.all-off-btn:hover {
        background: #e53935;
    }

    .nav-button .icon {
        margin-right: 0.5vmin;
    }

    .ai-prompt-view, .macros-view, .styles-view, .arranger-view {
      padding: 1vmin;
      background: rgba(24, 24, 24, 0.4);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 1vmin;
      width: 100%;
      box-sizing: border-box;
    }

    .ai-prompt-view .prompt-input-area {
        display: flex;
        gap: 1vmin;
    }
    .ai-prompt-view textarea {
        flex-grow: 1;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: #fff;
        border-radius: 6px;
        padding: 1vmin;
        font-size: 1.4vmin;
        font-family: inherit;
        resize: vertical;
        min-height: 8vmin;
    }
    .ai-prompt-view button {
        background: #673ab7;
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 0 2vmin;
        font-size: 1.4vmin;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }
    .ai-prompt-view button:hover {
        background: #7e57c2;
    }
    .filtered-prompts-list {
        margin-top: 1vmin;
        padding: 1vmin;
        background: rgba(0,0,0,0.2);
        border-radius: 6px;
    }
    .filtered-prompts-list h3 {
        margin: 0 0 0.5vmin 0;
        font-size: 1.2vmin;
        color: #ccc;
    }
    .filtered-prompts-list ul {
        margin: 0;
        padding-left: 2vmin;
    }
    .filtered-prompts-list li {
        font-size: 1.1vmin;
        color: #ff8a80;
    }
    
    .styles-view {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(15vmin, 1fr));
    }
    .style-button {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(76, 175, 80, 0.5);
      color: #a5d6a7;
      font-family: 'Google Sans', sans-serif;
      font-size: 1.2vmin;
      font-weight: 600;
      padding: 1vmin;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      aspect-ratio: 1.5;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      line-height: 1.2;
    }
    .style-button:hover {
        background: rgba(76, 175, 80, 0.3);
        color: #fff;
    }
    .style-button.loading {
        background: #555;
        cursor: default;
    }

    .macros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10vmin, 1fr));
      gap: 1.5vmin;
      padding: 1vmin;
    }
    .macro-pod {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5vmin;
    }
    .macro-pod weight-knob {
        width: 10vmin;
        height: 10vmin;
    }
    .macro-pod-label {
        font-size: 1.1vmin;
        font-weight: 600;
        color: #ccc;
        height: 3vmin;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .macro-pod-label svg {
        height: 100%;
        width: auto;
        max-width: 100%;
        fill: currentColor;
    }


    /* Arranger View Styles */
    .arranger-view {
        gap: 1.5vmin;
    }
    .arranger-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .arranger-header h2 {
        font-size: 2vmin;
        font-weight: 600;
        margin: 0;
    }
    .arranger-controls {
      display: flex;
      align-items: center;
      gap: 1vmin;
    }
    .arranger-controls button, .edit-mode-header button {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: #fff;
        padding: 0.6vmin 1.2vmin;
        font-size: 1.2vmin;
        border-radius: 6px;
        cursor: pointer;
    }
    .arranger-controls .capture-btn.capturing {
      animation: blink 1s infinite;
    }
    @keyframes blink {
      50% { opacity: 0.5; }
    }

    .capture-duration-select {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: #fff;
        padding: 0.5vmin;
        font-size: 1.2vmin;
        border-radius: 6px;
    }

    .arranger-controls .play-arr-btn { background: #4CAF50; }
    .arranger-controls .stop-arr-btn { background: #f44336; }

    #capture-monitor {
        width: 100%;
        background: rgba(0,0,0,0.3);
        border-radius: 8px;
        padding: 1vmin;
        box-sizing: border-box;
        height: 8vmin;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 1vmin;
    }
    #capture-monitor .progress-bar-container {
        width: 100%;
        height: 2vmin;
        background: rgba(0,0,0,0.5);
        border-radius: 1vmin;
        overflow: hidden;
    }
    #capture-monitor .progress-bar {
        width: 0%;
        height: 100%;
        background: #e91e63;
        transition: width 0.1s linear;
    }
    #capture-monitor .monitor-text {
        font-size: 1.4vmin;
        font-weight: 600;
        color: #fff;
        text-align: center;
    }
    .name-section-form {
      display: flex;
      gap: 1vmin;
      align-items: center;
    }
    .name-section-form input {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      padding: 0.6vmin 1.2vmin;
      font-size: 1.2vmin;
      border-radius: 6px;
      flex-grow: 1;
    }


    .bins-container {
        display: grid;
        grid-template-columns: 1fr 25%;
        gap: 1.5vmin;
    }

    #sections-bin, #markers-bin {
        display: flex;
        gap: 1vmin;
        padding: 1vmin;
        background: rgba(0,0,0,0.3);
        border-radius: 8px;
        min-height: 10vmin;
        flex-wrap: wrap;
        align-content: flex-start;
    }

    .song-section {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid;
        border-radius: 6px;
        color: #fff;
        cursor: grab;
        display: flex;
        flex-direction: column;
        gap: 0.5vmin;
        position: relative;
        overflow: hidden;
        width: 12vmin;
        height: 8vmin;
        box-sizing: border-box;
        justify-content: space-between;
        padding: 0.5vmin;
    }
    .song-section:active {
        cursor: grabbing;
    }
    .waveform-container {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        opacity: 0.6;
        z-index: 1;
        pointer-events: none;
    }
    .section-name {
        font-size: 1.4vmin;
        font-weight: 600;
        position: relative;
        z-index: 2;
        background: rgba(0,0,0,0.5);
        padding: 0.3vmin 0.5vmin;
        border-radius: 4px;
        align-self: flex-start;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
    .section-controls {
        display: flex;
        gap: 0.5vmin;
        position: relative;
        z-index: 2;
        align-self: center;
    }
    .section-controls button {
        background: rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.2);
        color: #ccc;
        font-size: 1.1vmin;
        padding: 0.4vmin 0.8vmin;
        border-radius: 4px;
        cursor: pointer;
        line-height: 1;
    }
    .section-controls button.delete-btn {
        padding: 0.4vmin;
    }
    .section-controls button.delete-btn svg {
        width: 1.2vmin;
        height: 1.2vmin;
    }
    .section-controls button:hover {
        background: rgba(0,0,0,0.7);
        color: #fff;
    }


    #markers-bin .arranger-marker {
        cursor: grab;
    }
    #markers-bin .arranger-marker:active {
        cursor: grabbing;
    }

    .timeline-wrapper {
        padding: 1vmin;
        background: rgba(0,0,0,0.3);
        border-radius: 8px;
        border: 2px solid rgba(255,255,255,0.2);
        transition: border-color 0.3s;
        overflow-x: auto;
    }

    #marker-track {
        display: flex;
        min-height: 4vmin;
        margin-bottom: 0.5vmin;
        position: relative;
    }
    .arranger-marker {
        background: rgba(0, 229, 255, 0.2);
        border: 1px solid rgba(0, 229, 255, 0.5);
        color: #80deea;
        font-size: 1.2vmin;
        font-weight: 600;
        text-transform: uppercase;
        padding: 0.5vmin 1vmin;
        border-radius: 4px;
        white-space: nowrap;
    }
    .marker-drop-zone {
      position: absolute;
      top: 0;
      height: 100%;
      width: 15vmin; /* Width of a part + dropzone */
      z-index: 1;
    }
    .marker-drop-zone.drag-over {
        background: rgba(0, 229, 255, 0.2);
    }
    
    #arrangement-timeline {
        display: flex;
        gap: 1vmin;
        align-items: center;
        min-height: 18vmin;
        min-width: 100%;
        width: max-content;
    }
    .timeline-placeholder {
        width: 100%;
        min-height: 18vmin;
        text-align: center;
        color: #888;
        font-size: 1.4vmin;
        flex-grow: 1;
        border: 2px dashed rgba(255,255,255,0.2);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }
    .timeline-placeholder.drag-over {
        background: rgba(0, 229, 255, 0.2);
        border-color: rgba(0, 229, 255, 0.8);
        color: #fff;
    }

    .arrangement-part {
        background: rgba(255,255,255,0.05);
        border: 1px solid;
        border-radius: 6px;
        padding: 1vmin;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1vmin;
        width: 12vmin;
        height: 10vmin;
        flex-shrink: 0;
        cursor: grab;
        position: relative;
        transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        justify-content: space-between;
        overflow: hidden;
    }
    .arrangement-part:active {
        cursor: grabbing;
    }
    .arrangement-part.active {
        box-shadow: 0 0 10px;
    }
    .arrangement-part.dragging {
      opacity: 0.4;
      transform: scale(0.95);
    }

    .arrangement-part .waveform-container {
        opacity: 0.4;
    }

    .part-name {
        font-size: 1.3vmin;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        text-align: center;
        position: relative;
        z-index: 2;
        background: rgba(0,0,0,0.4);
        border-radius: 4px;
        padding: 0.3vmin;
    }
    .part-bars {
        display: flex;
        align-items: center;
        gap: 0.5vmin;
        font-size: 1.2vmin;
        width: 100%;
        justify-content: center;
        position: relative;
        z-index: 2;
        background: rgba(0,0,0,0.4);
        padding: 0.3vmin;
        border-radius: 4px;
    }
    .part-bars input {
        width: 4.5vmin;
        background: rgba(0,0,0,0.5);
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        text-align: center;
        font-size: 1.4vmin;
        -moz-appearance: textfield;
        padding: 0.4vmin;
        box-sizing: border-box;
    }
    .part-bars input::-webkit-outer-spin-button,
    .part-bars input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    .duplicate-part-btn {
        position: absolute;
        top: 0.5vmin;
        right: 0.5vmin;
        background: rgba(0,0,0,0.5);
        border: none;
        color: #ccc;
        cursor: pointer;
        border-radius: 4px;
        width: 2vmin;
        height: 2vmin;
        padding: 0.3vmin;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        z-index: 3;
    }
    .arrangement-part:hover .duplicate-part-btn {
        opacity: 1;
    }
    .duplicate-part-btn svg {
        width: 100%;
        height: 100%;
    }

    .drop-zone {
      width: 1vmin;
      height: 10vmin;
      background: transparent;
      border-radius: 0.5vmin;
      transition: background-color 0.2s ease, box-shadow 0.2s ease;
      flex-shrink: 0;
    }
    .drop-zone.drag-over {
        background-color: rgba(0, 229, 255, 0.5);
        box-shadow: 0 0 10px rgba(0, 229, 255, 0.8);
    }

    .edit-mode-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5vmin;
        padding: 1vmin;
        background: rgba(233, 30, 99, 0.2);
        border-radius: 8px;
        width: 100%;
        box-sizing: border-box;
    }
    .edit-mode-header h3 {
        margin: 0;
        font-size: 1.6vmin;
        color: #fce4ec;
    }
    .edit-mode-header button {
        background: #e91e63;
        border-color: #f06292;
    }
    

    #play-button {
      position: fixed;
      bottom: 2vmin;
      left: 50%;
      transform: translateX(-50%);
      width: 10vmin;
      height: 10vmin;
      z-index: 100;
    }
    #midi-controls, #show-cc-toggle {
        display: flex;
        flex-direction: column;
        gap: 0.5vmin;
        align-items: center;
    }
    #midi-controls label, #show-cc-toggle label {
        font-size: 1.1vmin;
        font-weight: 600;
        color: #ccc;
        text-transform: uppercase;
    }
    #midi-controls select {
        font-family: inherit;
        font-size: 1.2vmin;
        font-weight: 500;
        background: rgba(255,255,255,0.1);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        padding: 0.4vmin 0.6vmin;
    }
    #show-cc-toggle input {
        width: 2vmin;
        height: 2vmin;
    }
    .close-modal-button {
      background: none;
      border: none;
      color: #fff;
      font-size: 3vmin;
      cursor: pointer;
      position: absolute;
      top: 1vmin;
      right: 1vmin;
    }

    .hidden {
        display: none !important;
    }

  `;

  @property({ type: Array }) producers: Map<string, Producer> = new Map();
  @property({ type: Array }) prompts: Map<string, Prompt> = new Map();
  @property({ type: String }) playbackState: PlaybackState = 'stopped';
  @property({ type: Number }) audioLevel = 0;
  @property({ type: Number }) bpm = 0;
  @property({ type: Array }) presetStyles: PresetStyle[] = [];
  @property({ type: String }) currentMood = 'None';
  @property({ type: String }) currentKey = 'Any';
  @property({ type: String }) currentScale = 'Any';
  @property({ type: String }) currentEra = 'Any';
  
  // View management
  @property({ type: String }) currentView: 'overview' | 'detail' | 'ai-prompt' | 'styles' | 'macros' | 'arranger' = 'overview';
  @property({ type: String }) activeProducerId: string | null = null;
  
  // Arrangement properties
  @property({ type: Array }) songSections: Map<string, SongSection> = new Map();
  @property({ type: Array }) arrangement: ArrangementPart[] = [];
  @property({ type: Number }) activeArrangementPartIndex = -1;
  @property({ type: String }) activeEditingSectionId: string | null = null;
  @property({ type: String }) activeEditingSectionName: string = '';
  
  @state() private showMidiSettings = false;
  @state() private showCC = false;
  @state() private midiInputs: { id: string, name: string | undefined }[] = [];
  @state() private midiDispatcher = new MidiDispatcher();
  @state() private activeMidiInputId: string | null = null;
  @state() private aiPromptText = '';
  @state() private filteredPromptsList: string[] = [];
  @state() private isAiPromptLoading = false;
  @state() private isMacroPromptLoading = false;
  @state() private macroPromptText = '';
  @state() private soloDrumsProducerId: string | null = null;
  @state() private headProducerId: string | null = null;
  @state() private randomizingPromptId: string | null = null;
  @state() private isGlobalRandomizing = false;
  @state() private isPlayingArrangement = false;
  @state() private _draggedPartIndex: number | null = null;
  
  // Timed capture states
  @state() private isCapturing = false;
  @state() private captureDurationBars = 4;
  @state() private captureProgress = 0;
  @state() private _captureTimeoutId: number | null = null;
  @state() private _captureIntervalId: number | null = null;
  @state() private _capturedStateToName: { producers: Map<string, Producer>, prompts: Map<string, Prompt> } | null = null;
  @state() private _beatReceivedForCapture = false;


  private freestyleProducer?: Producer;
  private freestylePrompts: Prompt[] = [];

  constructor(
    producers: Map<string, Producer>,
    prompts: Map<string, Prompt>,
    presetStyles: PresetStyle[],
  ) {
    super();
    this.producers = producers;
    this.prompts = prompts;
    this.presetStyles = presetStyles;
    
    this.freestyleProducer = [...this.producers.values()].find(p => p.type === 'freestyle');
    if (this.freestyleProducer) {
        this.freestylePrompts = this.freestyleProducer.promptIds.map(id => this.prompts.get(id)!);
    }
  }
  
  override connectedCallback() {
    super.connectedCallback();
    this.midiDispatcher.addEventListener('cc-message', (e) => this.handleMidiMessage(e as CustomEvent<ControlChange>));
    this.midiDispatcher.addEventListener('transport-message', (e) => {
        const command = (e as CustomEvent<'start' | 'continue' | 'stop'>).detail;
        this.dispatchEvent(new CustomEvent('daw-transport', { detail: command, bubbles: true, composed: true }));
    });
    this.midiDispatcher.addEventListener('midi-connections-changed', () => this.updateMidiInputs());
    this.updateMidiInputs();
  }

  private handleMidiMessage(e: CustomEvent<ControlChange>) {
    const { cc, value } = e.detail;
    if (this.currentView === 'macros') {
        const producer = [...this.producers.values()].find(p => p.cc === cc);
        if (producer) {
            producer.weight = (value / 127) * 2;
            this.dispatchControlsChanged();
            this.requestUpdate();
        }
    }
  }

  private dispatchControlsChanged() {
    this.dispatchEvent(
      new CustomEvent('controls-changed', {
        detail: {
            producers: this.producers,
            prompts: this.prompts,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private updateProducer(e: CustomEvent<Partial<Producer>>, producerId: string) {
    const producer = this.producers.get(producerId);
    if (producer) {
        Object.assign(producer, e.detail);
        if (producer.type === 'instrument' && e.detail.styleSelectors) {
            const newPromptText = buildInstrumentPrompt(producer);
            const prompt = this.prompts.get(producer.promptIds[0]);
            if (prompt) {
                prompt.text = newPromptText;
            }
        }
    }
    this.dispatchControlsChanged();
  }

  private updatePrompt(e: CustomEvent<Partial<Prompt>>) {
    const prompt = this.prompts.get(e.detail.promptId!);
    if (prompt) {
        Object.assign(prompt, e.detail);
    }
    this.dispatchControlsChanged();
  }
  
  public addFilteredPrompt(promptText: string) {
    if (!this.filteredPromptsList.includes(promptText)) {
      this.filteredPromptsList = [...this.filteredPromptsList, promptText];
    }
    const promptToDisable = [...this.prompts.values()].find(p => p.text === promptText);
    if (promptToDisable) {
        // We find the controller and set its filtered property
        const controller = this.shadowRoot?.querySelector(`prompt-controller[promptid="${promptToDisable.promptId}"]`);
        if (controller) {
            (controller as any).filtered = true;
        }
    }
  }
  
  public onAiPromptComplete() {
    this.isAiPromptLoading = false;
  }
  public onMacroPromptComplete() {
    this.isMacroPromptLoading = false;
  }
  public onRandomizeComplete() {
      this.randomizingPromptId = null;
  }
  public onGlobalRandomizeStart() {
    this.isGlobalRandomizing = true;
  }
  public onGlobalRandomizeComplete() {
    this.isGlobalRandomizing = false;
  }

  private togglePlayPause() {
    this.dispatchEvent(new CustomEvent('play-pause', { bubbles: true, composed: true }));
  }

  triggerBeatAnimation(intensity: number) {
    const bg = this.shadowRoot?.getElementById('background');
    if (!bg) return;
    
    // Logic for timed capture start
    if (this.isCapturing && !this._beatReceivedForCapture) {
        this._beatReceivedForCapture = true; // Prevents re-triggering
        this.executeTimedCapture();
    }
    
    const activeProducers = [...this.producers.values()].filter(p => p.weight > 0);
    let blendedColor = 'hsla(187, 100%, 50%)'; // Default color

    if (activeProducers.length > 0) {
        let totalWeight = 0;
        let r = 0, g = 0, b = 0;

        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        activeProducers.forEach(producer => {
            const rgb = hexToRgb(producer.color);
            if (rgb) {
                const weight = producer.weight;
                r += rgb.r * weight;
                g += rgb.g * weight;
                b += rgb.b * weight;
                totalWeight += weight;
            }
        });

        if (totalWeight > 0) {
            const finalR = Math.floor(r / totalWeight);
            const finalG = Math.floor(g / totalWeight);
            const finalB = Math.floor(b / totalWeight);
            blendedColor = `rgb(${finalR}, ${finalG}, ${finalB})`;
        }
    }
    
    bg.style.setProperty('--pulse-color', blendedColor);
    bg.style.setProperty('--beat-raw-intensity', intensity.toString());
    bg.classList.remove('beat');
    // This is a trick to restart the animation
    void bg.offsetWidth;
    bg.classList.add('beat');
  }

  private async updateMidiInputs() {
    try {
      this.midiInputs = await this.midiDispatcher.getMidiAccess();
      if (!this.activeMidiInputId && this.midiInputs.length > 0) {
        this.setActiveMidiInput(this.midiInputs[0].id);
      } else if (this.midiInputs.length === 0) {
        this.setActiveMidiInput(null);
      }
      this.requestUpdate();
    } catch (e: any) {
      console.error(e);
      // You could dispatch an error event to be shown in a toast by the main app
    }
  }

  private setActiveMidiInput(id: string | null) {
    this.activeMidiInputId = id;
    this.midiDispatcher.activeMidiInputId = id;
  }
  
  private handleMidiSelection(e: Event) {
    const select = e.target as HTMLSelectElement;
    this.setActiveMidiInput(select.value);
  }
  
  private handleMoodChange(e: Event) {
      const mood = (e.target as HTMLSelectElement).value;
      this.dispatchEvent(new CustomEvent('mood-changed', { detail: mood, bubbles: true, composed: true }));
  }
  
  private handleKeyScaleChange() {
      const key = (this.shadowRoot?.getElementById('key-select') as HTMLSelectElement).value;
      const scale = (this.shadowRoot?.getElementById('scale-select') as HTMLSelectElement).value;
      this.dispatchEvent(new CustomEvent('key-scale-changed', { detail: { key, scale }, bubbles: true, composed: true }));
  }

  private handleEraChange(e: Event) {
      const era = (e.target as HTMLSelectElement).value;
      this.dispatchEvent(new CustomEvent('era-changed', { detail: era, bubbles: true, composed: true }));
  }
  
  private handlePitchChange(e: Event) {
      const pitch = parseFloat((e.target as HTMLInputElement).value);
      this.dispatchEvent(new CustomEvent('pitch-changed', { detail: pitch, bubbles: true, composed: true }));
  }

  private submitAiPrompt() {
      if (this.aiPromptText.trim() && !this.isAiPromptLoading) {
          this.isAiPromptLoading = true;
          this.dispatchEvent(new CustomEvent('ai-prompt-submitted', { detail: this.aiPromptText, bubbles: true, composed: true }));
      }
  }
  
  private submitMacroPrompt() {
    if (this.macroPromptText.trim() && !this.isMacroPromptLoading) {
        this.isMacroPromptLoading = true;
        this.dispatchEvent(new CustomEvent('macro-prompt-submitted', { detail: this.macroPromptText, bubbles: true, composed: true }));
    }
  }
  
  private handleAiStyleSelected(prompt: string) {
      if (!this.isAiPromptLoading) {
          this.isAiPromptLoading = true;
          this.dispatchEvent(new CustomEvent('ai-style-selected', { detail: prompt, bubbles: true, composed: true }));
      }
  }
  
  private toggleSoloDrums(producerId: string) {
    const producer = this.producers.get(producerId);
    if (!producer) return;

    const wasActive = producer.soloDrumsActive;

    // Turn off solo for all producers
    this.producers.forEach(p => p.soloDrumsActive = false);
    
    // Toggle the selected one
    producer.soloDrumsActive = !wasActive;
    
    this.dispatchControlsChanged();
    this.requestUpdate();
  }

  private toggleHeadProducer(producerId: string) {
      const producer = this.producers.get(producerId);
      if (!producer) return;
      
      const wasActive = producer.headProducerActive;
      
      this.producers.forEach(p => p.headProducerActive = false);
      
      producer.headProducerActive = !wasActive;
      
      this.dispatchControlsChanged();
      this.requestUpdate();
  }

  private randomizeFreestyleLayer(promptId: string) {
    this.randomizingPromptId = promptId;
    this.dispatchEvent(new CustomEvent('randomize-freestyle-layer', { detail: promptId, bubbles: true, composed: true }));
  }
  
  private allOff() {
      this.producers.forEach(p => p.weight = 0);
      this.prompts.forEach(p => p.weight = 0);
      this.dispatchControlsChanged();
      this.requestUpdate();
  }
  
  // --- Arrangement Handlers ---

  private handleStartCapture() {
      if (this.isCapturing) return;
      this.isCapturing = true;
      this._beatReceivedForCapture = false; // Reset waiting for beat
      // If music isn't playing, we can't wait for a beat, so start immediately.
      if (this.playbackState !== 'playing') {
          this.executeTimedCapture();
      }
  }

  private executeTimedCapture() {
      const bpm = this.bpm > 0 ? this.bpm : 120;
      const beatDurationSec = 60 / bpm;
      const totalDurationSec = this.captureDurationBars * 4 * beatDurationSec;
      const updateInterval = 50; // ms
      let elapsed = 0;

      this._captureIntervalId = window.setInterval(() => {
          elapsed += updateInterval;
          this.captureProgress = Math.min(100, (elapsed / (totalDurationSec * 1000)) * 100);
      }, updateInterval);

      this._captureTimeoutId = window.setTimeout(() => {
          if(this._captureIntervalId) clearInterval(this._captureIntervalId);
          this._captureIntervalId = null;
          this.isCapturing = false;
          this.captureProgress = 0;
          this._beatReceivedForCapture = false;
          // Deep copy the maps and their contents for the captured state
          this._capturedStateToName = {
              producers: new Map(JSON.parse(JSON.stringify(Array.from(this.producers.entries())))),
              prompts: new Map(JSON.parse(JSON.stringify(Array.from(this.prompts.entries())))),
          };
      }, totalDurationSec * 1000);
  }

  private handleFinalizeSectionCapture(e: Event) {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const sectionName = formData.get('section-name') as string;
      
      if (sectionName && this._capturedStateToName) {
          this.dispatchEvent(new CustomEvent('capture-section', {
              detail: { name: sectionName, state: this._capturedStateToName }
          }));
      }
      this._capturedStateToName = null;
  }

  private handleDeleteSection(sectionId: string) {
    if (confirm('Are you sure you want to delete this section? This will also remove it from the timeline.')) {
        this.dispatchEvent(new CustomEvent('delete-section', { detail: sectionId, bubbles: true, composed: true }));
    }
  }

  private handleBarsChange(e: Event, index: number) {
      const input = e.target as HTMLInputElement;
      const newBars = parseInt(input.value, 10);
      if (isNaN(newBars) || newBars < 1) return;

      const newArrangement = [...this.arrangement];
      newArrangement[index] = { ...newArrangement[index], bars: newBars };
      this.dispatchEvent(new CustomEvent('update-arrangement', { detail: newArrangement }));
  }
  
  private handleDuplicatePart(e: Event, index: number) {
    e.stopPropagation();
    if (index < 0 || index >= this.arrangement.length) return;
    
    const partToDuplicate = this.arrangement[index];
    const newPart: ArrangementPart = { 
        ...partToDuplicate,
        id: `part-${Date.now()}-${Math.random()}` 
    };

    const newArrangement = [
        ...this.arrangement.slice(0, index + 1),
        newPart,
        ...this.arrangement.slice(index + 1)
    ];
    this.dispatchEvent(new CustomEvent('update-arrangement', { detail: newArrangement }));
  }

  private handleArrangementDragStart(e: DragEvent, index: number) {
      this._draggedPartIndex = index;
      if (e.target) {
          (e.target as HTMLElement).classList.add('dragging');
      }
      if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', index.toString());
      }
  }

  private handleArrangementDragOver(e: DragEvent) {
      e.preventDefault();
      if (e.dataTransfer) {
          // Check if we are dragging a new section from the bin vs. reordering
          if (this._draggedPartIndex === null) {
              e.dataTransfer.dropEffect = 'copy';
          } else {
              e.dataTransfer.dropEffect = 'move';
          }
      }
      const target = e.currentTarget as HTMLElement;
      target.classList.add('drag-over');
  }

  private handleArrangementDragLeave(e: DragEvent) {
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('drag-over');
  }

  private handleArrangementDrop(e: DragEvent, targetIndex: number) {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('drag-over');

      const sectionId = e.dataTransfer?.getData('text/section-id');

      // Case 1: Dropping a new section from the bin
      if (sectionId) {
          const newPart: ArrangementPart = { id: `part-${Date.now()}-${Math.random()}`, sectionId, bars: 4 };
          const newArrangement = [...this.arrangement];
          newArrangement.splice(targetIndex, 0, newPart);
          this.dispatchEvent(new CustomEvent('update-arrangement', { detail: newArrangement }));
      }
      // Case 2: Reordering an existing part
      else if (this._draggedPartIndex !== null) {
          // Prevent dropping on its own drop-zones
          if (this._draggedPartIndex === targetIndex || this._draggedPartIndex + 1 === targetIndex) {
              this.handleArrangementDragEnd();
              return;
          }

          const newArrangement = [...this.arrangement];
          const [draggedItem] = newArrangement.splice(this._draggedPartIndex, 1);

          const adjustedTargetIndex = this._draggedPartIndex < targetIndex ? targetIndex - 1 : targetIndex;

          newArrangement.splice(adjustedTargetIndex, 0, draggedItem);

          this.dispatchEvent(new CustomEvent('update-arrangement', { detail: newArrangement }));
      }

      this.handleArrangementDragEnd();
  }

  private handleArrangementDragEnd() {
      if (this._draggedPartIndex !== null) {
          this.shadowRoot?.querySelectorAll('.arrangement-part.dragging').forEach(el => {
              el.classList.remove('dragging');
          });
      }
      this._draggedPartIndex = null;
      this.shadowRoot?.querySelectorAll('.drop-zone.drag-over, .timeline-placeholder.drag-over').forEach(el => el.classList.remove('drag-over'));
  }
  
  private handleSectionDragStart(e: DragEvent, sectionId: string) {
      if (e.dataTransfer) {
          e.dataTransfer.setData('text/section-id', sectionId);
          e.dataTransfer.effectAllowed = 'copy';
      }
  }
  
  private handleTimelineDrop(e: DragEvent) {
      e.preventDefault();
      const sectionId = e.dataTransfer?.getData('text/section-id');
      if (sectionId) {
          const newPart: ArrangementPart = { id: `part-${Date.now()}-${Math.random()}`, sectionId: sectionId, bars: 4 };
          const newArrangement = [...this.arrangement, newPart];
          this.dispatchEvent(new CustomEvent('update-arrangement', { detail: newArrangement }));
      }
      this.shadowRoot?.querySelectorAll('.timeline-placeholder.drag-over').forEach(el => el.classList.remove('drag-over'));
  }
  
  private handleTimelineDragOver(e: DragEvent) {
      e.preventDefault();
      if(e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      const target = e.currentTarget as HTMLElement;
      if (this.arrangement.length === 0 && target.classList.contains('timeline-placeholder')) {
        target.classList.add('drag-over');
      }
  }
  
  private handleTimelineDragLeave(e: DragEvent) {
      const target = e.currentTarget as HTMLElement;
      target.classList.remove('drag-over');
  }


  override render() {
    return html`
      <div id="background">
        <div class="light-source"></div>
      </div>
      <main>
        <header>
          <div class="title-bar">
            <h1>Producer Collective</h1>
            ${this.bpm > 0 ? html`<div class="bpm-display">${this.bpm} BPM</div>` : ''}
            ${this.midiDispatcher.activeMidiInputId ? html`<div class="daw-sync-indicator">DAW SYNC ACTIVE</div>` : ''}
          </div>
          <div class="header-controls">
              <label for="era-select">Era</label>
              <select id="era-select" @change=${this.handleEraChange} .value=${this.currentEra}>
                  <option>Any</option>
                  <option>1950s</option>
                  <option>1960s</option>
                  <option>1970s</option>
                  <option>1980s</option>
                  <option>1990s</option>
                  <option>2000s</option>
                  <option>2010s</option>
                  <option>2020s</option>
              </select>
              <label for="mood-select">Mood</label>
              <select id="mood-select" @change=${this.handleMoodChange} .value=${this.currentMood}>
                  <option>None</option><option>Uplifting</option><option>Melancholy</option><option>Energetic</option><option>Chill</option><option>Dark</option><option>Romantic</option><option>Epic</option><option>Funky</option><option>Dreamy</option><option>Aggressive</option><option>Experimental</option><option>Disruptive</option>
              </select>
              <label for="key-select">Key</label>
              <select id="key-select" @change=${this.handleKeyScaleChange} .value=${this.currentKey}>
                  <option>Any</option><option>C</option><option>C#</option><option>D</option><option>D#</option><option>E</option><option>F</option><option>F#</option><option>G</option><option>G#</option><option>A</option><option>A#</option><option>B</option>
              </select>
              <label for="scale-select">Scale</label>
              <select id="scale-select" @change=${this.handleKeyScaleChange} .value=${this.currentScale}>
                  <option>Any</option><option>Major</option><option>Minor</option><option>Dorian</option><option>Phrygian</option><option>Lydian</option><option>Mixolydian</option><option>Locrian</option><option>Harmonic Minor</option><option>Melodic Minor</option><option>Blues</option><option>Pentatonic Major</option><option>Pentatonic Minor</option><option>Whole Tone</option><option>Diminished</option><option>Phrygian Dominant</option><option>Lydian Augmented</option><option>Japanese (Insen)</option><option>Hungarian Minor</option>
              </select>
              <div id="pitch-slider-container">
                  <label for="pitch-slider">Pitch</label>
                  <input type="range" id="pitch-slider" min="-12" max="12" step="1" value="0" @input=${this.handlePitchChange}>
                  <span id="pitch-value">${(this.shadowRoot?.getElementById('pitch-slider') as HTMLInputElement)?.value ?? 0}</span>
              </div>
          </div>
        </header>
        
        ${this.activeEditingSectionId ? this.renderEditModeHeader() : ''}

        <div class="view-container">
            ${this.currentView === 'overview' ? this.renderOverview() : ''}
            ${this.currentView === 'detail' ? this.renderDetailView() : ''}
            ${this.currentView === 'ai-prompt' ? this.renderAiPromptView() : ''}
            ${this.currentView === 'styles' ? this.renderStylesView() : ''}
            ${this.currentView === 'macros' ? this.renderMacrosView() : ''}
            ${this.currentView === 'arranger' ? this.renderArrangerView() : ''}
        </div>
      </main>

      <div class="navigation-bar">
        <button class="nav-button ${classMap({'active': this.currentView === 'overview' || this.currentView === 'detail'})}" @click=${() => this.currentView = 'overview'}>Overview</button>
        <button class="nav-button macros-btn ${classMap({'active': this.currentView === 'macros'})}" @click=${() => this.currentView = 'macros'}>Macros</button>
        <button class="nav-button ai-prompt-btn ${classMap({'active': this.currentView === 'ai-prompt'})}" @click=${() => this.currentView = 'ai-prompt'}>AI Prompt</button>
        <button class="nav-button styles-btn ${classMap({'active': this.currentView === 'styles'})}" @click=${() => this.currentView = 'styles'}>Styles</button>
        <button class="nav-button arranger-btn ${classMap({'active': this.currentView === 'arranger'})}" @click=${() => this.currentView = 'arranger'}>Arranger</button>
        <button class="nav-button all-off-btn" @click=${this.allOff}>All Off</button>
        <div id="midi-controls">
            <select @change=${this.handleMidiSelection} .value=${this.activeMidiInputId ?? ''}>
                <option value="">Select MIDI Input</option>
                ${this.midiInputs.map(input => html`<option value=${input.id}>${input.name}</option>`)}
            </select>
        </div>
        <div id="show-cc-toggle">
            <label for="show-cc">Show CC</label>
            <input id="show-cc" type="checkbox" ?checked=${this.showCC} @change=${(e: Event) => this.showCC = (e.target as HTMLInputElement).checked}>
        </div>
      </div>
      
      <play-pause-button
          id="play-button"
          playbackState=${this.playbackState}
          @click=${this.togglePlayPause}>
      </play-pause-button>
    `;
  }
  
  private renderOverview() {
    return html`
        <div class="overview-container">
            <div class="global-actions">
                <button 
                    class="global-randomize-btn" 
                    @click=${() => this.dispatchEvent(new CustomEvent('global-randomize', { bubbles: true, composed: true }))}
                    ?disabled=${this.isGlobalRandomizing}
                >
                    ${this.isGlobalRandomizing ? 'Randomizing...' : 'Global Randomize 🎲'}
                </button>
            </div>
            <div class="producer-grid">
                ${[...this.producers.values()].map(producer => {
                    const isSelected = this.activeProducerId === producer.producerId;
                    const isActive = producer.weight > 0;
                    const hasLogo = !!producer.logo;
                    
                    const buttonText = producer.displayName || producer.name;
                    const tooltipText = producer.displayName ? `${producer.name}: ${producer.description}` : producer.description ?? '';
    
                    const classes = {
                        'freestyle-btn': producer.type === 'freestyle',
                        'active': isActive,
                        'selected': isSelected,
                        'has-logo': hasLogo,
                    };
                    
                    const styles = {
                      '--producer-color': producer.color
                    };

                    return html`<button
                        class=${classMap(classes)}
                        style=${styleMap(styles)}
                        title=${tooltipText}
                        @click=${() => { this.activeProducerId = producer.producerId; this.currentView = 'detail'; }}
                    >${hasLogo ? unsafeHTML(producer.logo) : buttonText}</button>`
                })}
            </div>
        </div>
    `;
  }

  private renderDetailView() {
    const producer = this.producers.get(this.activeProducerId!);
    if (!producer) {
        this.currentView = 'overview';
        return;
    }

    if (producer.type === 'freestyle') {
        return this.renderFreestylePod(producer);
    }
    
    const producerPrompts = producer.promptIds.map(id => this.prompts.get(id)!);
    const hasLogo = !!producer.logo;

    return html`
        <div class="detail-view">
            <div class="detail-header">
                <button class="back-button" @click=${() => this.currentView = 'overview'}>&larr;</button>
                <h2>
                  ${hasLogo ? unsafeHTML(producer.logo) : ''}
                  <span>${producer.displayName || producer.name}</span>
                </h2>
                <button class="solo-drums-button ${classMap({active: !!producer.soloDrumsActive})}" @click=${() => this.toggleSoloDrums(producer.producerId)}>Solo Drums</button>
                <button class="head-producer-button ${classMap({active: !!producer.headProducerActive})}" @click=${() => this.toggleHeadProducer(producer.producerId)}>Head Producer</button>
            </div>
            ${producer.description ? html`<p class="detail-description">${producer.description}</p>` : ''}
            <div class="producer-controls">
                <div class="master-knob-container">
                    <h3>Master</h3>
                    <weight-knob
                        value=${producer.weight}
                        color=${producer.color}
                        .audioLevel=${this.audioLevel}
                        @input=${(e: CustomEvent<number>) => this.updateProducer(new CustomEvent('producer-changed', { detail: { weight: e.detail } }), producer.producerId)}
                    ></weight-knob>
                </div>
                ${producer.type === 'instrument' ? this.renderInstrumentControls(producer) : this.renderProducerPrompts(producer, producerPrompts)}
            </div>
        </div>
    `;
  }
  
  private renderProducerPrompts(producer: Producer, prompts: Prompt[]) {
      return html`
          <div class="prompt-container">
              ${prompts.map(p => html`
                  <prompt-controller
                      promptId=${p.promptId}
                      producerId=${p.producerId}
                      text=${p.text}
                      weight=${p.weight}
                      cc=${p.cc}
                      color=${p.color}
                      .audioLevel=${this.audioLevel}
                      .midiDispatcher=${this.midiDispatcher}
                      .showCC=${this.showCC}
                      .label=${p.label ?? ''}
                      .options=${p.options}
                      @prompt-changed=${this.updatePrompt}
                  ></prompt-controller>
              `)}
          </div>
          ${producer.spice || producer.secondarySpice ? html`
            <div class="spice-container">
                ${producer.spice ? html`<button class="spice-button ${classMap({active: !!producer.spiceActive})}" @click=${() => { producer.spiceActive = !producer.spiceActive; this.dispatchControlsChanged(); this.requestUpdate(); }}>${producer.spice.label}</button>`: ''}
                ${producer.secondarySpice ? html`<button class="spice-button ${classMap({active: !!producer.secondarySpiceActive})}" @click=${() => { producer.secondarySpiceActive = !producer.secondarySpiceActive; this.dispatchControlsChanged(); this.requestUpdate(); }}>${producer.secondarySpice.label}</button>`: ''}
            </div>
          ` : ''}
      `;
  }
  
  private renderInstrumentControls(producer: Producer) {
      return html`
          <div class="instrument-controls">
              <div class="selectors">
                  ${producer.styleSelectors?.map(selector => html`
                      <div class="selector-group">
                          <label for="${producer.producerId}-${selector.label}">${selector.label}</label>
                          <select 
                            id="${producer.producerId}-${selector.label}"
                            .value=${selector.active}
                            @change=${(e: Event) => {
                                selector.active = (e.target as HTMLSelectElement).value;
                                this.updateProducer(new CustomEvent('producer-changed', { detail: { styleSelectors: producer.styleSelectors } }), producer.producerId);
                                this.requestUpdate();
                            }}
                          >
                              ${selector.options.map(opt => html`<option .value=${opt}>${opt}</option>`)}
                          </select>
                      </div>
                  `)}
              </div>
          </div>
      `;
  }
  
  private renderFreestylePod(producer: Producer) {
    return html`
        <div class="detail-view freestyle-pod">
            <div class="detail-header">
                <button class="back-button" @click=${() => this.currentView = 'overview'}>&larr;</button>
                <h2>${producer.logo ? unsafeHTML(producer.logo) : ''} <span>${producer.displayName || producer.name}</span></h2>
            </div>
            ${producer.description ? html`<p class="detail-description">${producer.description}</p>` : ''}
            ${this.freestylePrompts.map(p => html`
                <div class="freestyle-layer">
                    <prompt-controller
                        class="freestyle-layer"
                        promptId=${p.promptId}
                        producerId=${p.producerId}
                        text=${p.text}
                        weight=${p.weight}
                        cc=${p.cc}
                        color=${p.color}
                        .audioLevel=${this.audioLevel}
                        .midiDispatcher=${this.midiDispatcher}
                        .showCC=${this.showCC}
                        @prompt-changed=${this.updatePrompt}
                    ></prompt-controller>
                    <button 
                        class="randomize-btn ${classMap({loading: this.randomizingPromptId === p.promptId})}"
                        ?disabled=${this.randomizingPromptId === p.promptId}
                        @click=${() => this.randomizeFreestyleLayer(p.promptId)}>
                        ${this.randomizingPromptId === p.promptId ? '...' : '🎲'}
                    </button>
                </div>
            `)}
        </div>
    `;
  }

  // START: Added missing render methods
  private renderEditModeHeader() {
    return html`
        <div class="edit-mode-header">
            <h3>Editing: ${this.activeEditingSectionName}</h3>
            <button @click=${() => this.dispatchEvent(new CustomEvent('edit-section-finish'))}>Finish Editing</button>
        </div>
    `;
  }

  private renderAiPromptView() {
    return html`
        <div class="ai-prompt-view">
            <div class="prompt-input-area">
                <textarea 
                    placeholder="Describe the music you want to hear..."
                    .value=${this.aiPromptText}
                    @input=${(e: Event) => this.aiPromptText = (e.target as HTMLTextAreaElement).value}
                    @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submitAiPrompt(); }}}
                ></textarea>
                <button @click=${this.submitAiPrompt} ?disabled=${this.isAiPromptLoading}>
                    ${this.isAiPromptLoading ? 'Generating...' : 'Send'}
                </button>
            </div>
            ${this.filteredPromptsList.length > 0 ? html`
                <div class="filtered-prompts-list">
                    <h3>Recently Filtered (Disabled) Prompts:</h3>
                    <ul>
                        ${this.filteredPromptsList.map(p => html`<li>${p}</li>`)}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
  }

  private renderStylesView() {
    const classes = { 'loading': this.isAiPromptLoading };
    return html`
        <div class="styles-view">
            ${this.presetStyles.map(style => html`
                <button 
                    class="style-button ${classMap(classes)}"
                    ?disabled=${this.isAiPromptLoading}
                    @click=${() => this.handleAiStyleSelected(style.prompt)}>
                    ${style.name}
                </button>
            `)}
        </div>
    `;
  }

  private renderMacrosView() {
    const macroProducers = [...this.producers.values()].filter(p => p.type !== 'freestyle');
    return html`
        <div class="macros-grid">
            ${macroProducers.map(producer => html`
                <div class="macro-pod">
                    <weight-knob
                        value=${producer.weight}
                        color=${producer.color}
                        .audioLevel=${this.audioLevel}
                        @input=${(e: CustomEvent<number>) => this.updateProducer(new CustomEvent('producer-changed', { detail: { weight: e.detail } }), producer.producerId)}
                    ></weight-knob>
                    <div class="macro-pod-label" title=${producer.name}>
                        ${producer.logo ? unsafeHTML(producer.logo) : (producer.displayName || producer.name)}
                    </div>
                </div>
            `)}
        </div>
    `;
  }
  
  private renderCaptureControls() {
    const captureBtnClasses = { 'capture-btn': true, 'capturing': this.isCapturing };
    return html`
        <div class="arranger-controls">
            <button class=${classMap(captureBtnClasses)} @click=${this.handleStartCapture} ?disabled=${this.isCapturing}>
                Capture Section
            </button>
            <select class="capture-duration-select" .value=${this.captureDurationBars.toString()} @change=${(e: Event) => this.captureDurationBars = parseInt((e.target as HTMLSelectElement).value)}>
                <option value="1">1 bar</option>
                <option value="2">2 bars</option>
                <option value="4">4 bars</option>
                <option value="8">8 bars</option>
                <option value="16">16 bars</option>
            </select>
            <span>- Captures the current live sound into a new section.</span>
        </div>
    `;
  }

  private renderCaptureMonitor() {
      if (this._capturedStateToName) {
        return html`
            <form class="name-section-form" @submit=${this.handleFinalizeSectionCapture}>
                <input name="section-name" type="text" placeholder="Name your new section..." required>
                <button type="submit">Save</button>
                <button type="button" @click=${() => this._capturedStateToName = null}>Cancel</button>
            </form>
        `;
      }
      return html`
        <div id="capture-monitor">
            <div class="monitor-text">
                ${(this.playbackState === 'playing' && this.isCapturing && !this._beatReceivedForCapture)
                    ? `Waiting for beat to start capturing for ${this.captureDurationBars} bars...`
                    : `Capturing for ${this.captureDurationBars} bars...`
                }
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style=${styleMap({width: `${this.captureProgress}%`})}></div>
            </div>
        </div>
      `;
  }

  private renderSongSection(section: SongSection) {
      return html`
        <div class="song-section"
            style=${styleMap({borderColor: section.color})}
            draggable="true"
            @dragstart=${(e: DragEvent) => this.handleSectionDragStart(e, section.id)}
        >
            <div class="section-name">${section.name}</div>
            <div class="section-controls">
                <button class="edit-btn" @click=${() => this.dispatchEvent(new CustomEvent('edit-section-start', { detail: section.id }))}>Edit</button>
                <button class="delete-btn" @click=${() => this.handleDeleteSection(section.id)}>${trashIcon}</button>
            </div>
        </div>
      `;
  }
  
  private renderMarkersBin() {
    return html`
        <div id="markers-bin">
            ${ARRANGEMENT_MARKERS.map(marker => html`
                <div class="arranger-marker">${marker}</div>
            `)}
        </div>
    `;
  }
  
  private renderMarkerTrack() {
    return html`<div id="marker-track"></div>`; // Placeholder for now
  }
  
  private renderArrangementTimeline() {
    return html`
        <div class="drop-zone"
            @dragover=${this.handleArrangementDragOver}
            @dragleave=${this.handleArrangementDragLeave}
            @drop=${(e: DragEvent) => this.handleArrangementDrop(e, 0)}
        ></div>
        ${repeat(this.arrangement, (part) => part.id, (part, index) => {
            const section = this.songSections.get(part.sectionId);
            if (!section) return '';
            const partClasses = {
                'arrangement-part': true,
                'active': this.isPlayingArrangement && index === this.activeArrangementPartIndex,
            };
            const partStyles = {
                borderColor: section.color,
                boxShadow: (this.isPlayingArrangement && index === this.activeArrangementPartIndex) ? `0 0 10px ${section.color}` : 'none'
            };
            return html`
                <div class=${classMap(partClasses)}
                    style=${styleMap(partStyles)}
                    draggable="true"
                    @dragstart=${(e: DragEvent) => this.handleArrangementDragStart(e, index)}
                    @dragend=${this.handleArrangementDragEnd}
                >
                    <div class="part-name">${section.name}</div>
                    <div class="part-bars">
                        <input type="number" min="1" .value=${part.bars.toString()} @change=${(e: Event) => this.handleBarsChange(e, index)}>
                        <span>Bars</span>
                    </div>
                    <button class="duplicate-part-btn" @click=${(e: Event) => this.handleDuplicatePart(e, index)}>${copyIcon}</button>
                </div>
                <div class="drop-zone"
                    @dragover=${this.handleArrangementDragOver}
                    @dragleave=${this.handleArrangementDragLeave}
                    @drop=${(e: DragEvent) => this.handleArrangementDrop(e, index + 1)}
                ></div>
            `;
        })}
    `;
  }

  private renderArrangerView() {
    return html`
        <div class="arranger-view">
            <div class="arranger-header">
                <h2>Arranger</h2>
                <div class="arranger-controls">
                    ${!this.isPlayingArrangement ? html`
                        <button class="play-arr-btn" @click=${() => this.dispatchEvent(new CustomEvent('play-arrangement'))}>Play Arrangement</button>
                    ` : html`
                        <button class="stop-arr-btn" @click=${() => this.dispatchEvent(new CustomEvent('stop-arrangement'))}>Stop Arrangement</button>
                    `}
                </div>
            </div>

            ${this.isCapturing || this._capturedStateToName ? this.renderCaptureMonitor() : this.renderCaptureControls()}

            <div class="bins-container">
                <div id="sections-bin"
                    @dragover=${this.handleArrangementDragOver}
                    @dragleave=${this.handleArrangementDragLeave}
                    @drop=${(e: DragEvent) => this.handleArrangementDrop(e, this.arrangement.length)}
                >
                    ${[...this.songSections.values()].map(section => this.renderSongSection(section))}
                </div>
                ${this.renderMarkersBin()}
            </div>
            
            <div class="timeline-wrapper">
                ${this.renderMarkerTrack()}
                <div id="arrangement-timeline"
                    @dragover=${(e: DragEvent) => e.preventDefault()}
                >
                    ${this.arrangement.length === 0 ? html`
                        <div class="timeline-placeholder"
                            @dragover=${this.handleTimelineDragOver}
                            @dragleave=${this.handleTimelineDragLeave}
                            @drop=${this.handleTimelineDrop}
                        >
                            Drag sections here to start arranging
                        </div>
                    ` : this.renderArrangementTimeline()}
                </div>
            </div>
        </div>
    `;
  }
  // END: Added missing render methods
}
