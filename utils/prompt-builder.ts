/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Producer } from '../types';

/**
 * Builds the text prompt for an instrument based on its currently
 * active style selectors.
 * @param producer The instrument producer object.
 * @returns The generated prompt string.
 */
export function buildInstrumentPrompt(producer: Producer): string {
  if (producer.type !== 'instrument' || !producer.styleSelectors) {
    return producer.basePrompt || '';
  }

  switch (producer.name) {
    case 'Brass Section': {
      const style = producer.styleSelectors.find(s => s.label === 'Style')?.active;
      const arrangement = producer.styleSelectors.find(s => s.label === 'Arrangement')?.active;
      
      if (arrangement?.toLowerCase().includes('solo')) {
        return `A ${style} ${arrangement} performance.`;
      }
      return `A ${style} brass ${arrangement?.toLowerCase()} performance.`;
    }
    case 'Wind': {
      const style = producer.styleSelectors.find(s => s.label === 'Style')?.active;
      const instruments = producer.styleSelectors
        .filter(s => s.label !== 'Style')
        .map(s => s.active)
        .filter(s => s !== 'None');

      if (instruments.length > 0) {
        const instrumentsText = instruments.join(' and ');
        return `A ${style} performance on ${instrumentsText}`;
      } else {
        return 'Muted wind instruments';
      }
    }
    case 'Orchestra Percussion': {
      const activeStyle = producer.styleSelectors[0].active;
      if (activeStyle === 'Full Percussion Section') {
        return 'An orchestral performance by the full percussion section';
      } else {
        return `An orchestral percussion performance featuring the ${activeStyle}`;
      }
    }
    case 'SYNTH': {
      const synthType = producer.styleSelectors.find(s => s.label === 'Synth Type')?.active;
      const era = producer.styleSelectors.find(s => s.label === 'Era')?.active;
      if (synthType === 'Any Synth') {
          return `An ${era} synthesizer performance`;
      } else {
          return `An ${era} ${synthType} performance`;
      }
    }
    case 'PiANO': {
      const pianoType = producer.styleSelectors.find(s => s.label === 'Piano Type')?.active;
      const styleEra = producer.styleSelectors.find(s => s.label === 'Style / Era')?.active;
      const performance = producer.styleSelectors.find(s => s.label === 'Performance')?.active;
      return `A ${styleEra} ${performance} performance on a ${pianoType}`;
    }
    case 'Guitars': {
      const guitarType = producer.styleSelectors.find(s => s.label === 'Guitar Type')?.active;
      const styleEra = producer.styleSelectors.find(s => s.label === 'Style / Era')?.active;
      const performance = producer.styleSelectors.find(s => s.label === 'Performance')?.active;
      return `A ${styleEra} ${performance} performance on a ${guitarType}`;
    }
    case 'Drummer': {
      const drumType = producer.styleSelectors.find(s => s.label === 'Drum Type')?.active;
      const regionalStyle = producer.styleSelectors.find(s => s.label === 'Regional Style')?.active;
      const feel = producer.styleSelectors.find(s => s.label === 'Performance Feel')?.active;
      return `A ${feel} ${regionalStyle} drum beat using a ${drumType}.`;
    }
    case 'Hand Drummer': {
      const drumType = producer.styleSelectors.find(s => s.label === 'Drum Type')?.active;
      const regionalStyle = producer.styleSelectors.find(s => s.label === 'Regional Style')?.active;
      if (drumType === 'Full Hand Percussion') {
          return `An ${regionalStyle} performance by a full hand percussion ensemble.`;
      } else {
          return `An ${regionalStyle} performance on ${drumType}.`;
      }
    }
    case 'The Mellotron': {
      const model = producer.styleSelectors[0].active;
      return `A performance on a ${model} Mellotron`;
    }
    case 'Opera Singer': {
      const vocalRange = producer.styleSelectors.find(s => s.label === 'Vocal Range')?.active;
      const style = producer.styleSelectors.find(s => s.label === 'Style')?.active;
      return `An opera performance by a ${vocalRange} in a ${style} style.`;
    }
    case 'Vocalists': {
      const vocalType = producer.styleSelectors.find(s => s.label === 'Vocal Type')?.active;
      const genre = producer.styleSelectors.find(s => s.label === 'Genre / Style')?.active;
      const performance = producer.styleSelectors.find(s => s.label === 'Performance')?.active;
      const effect = producer.styleSelectors.find(s => s.label === 'Vocal Effect')?.active;

      let promptText = `A ${performance} ${genre} vocal performance featuring ${vocalType}`;
      if (effect && effect !== 'None') {
          promptText += ` with ${effect}`;
      }
      promptText += '.';
      return promptText;
    }
    default: {
      // Generic fallback for simple instruments
      const stylesText = producer.styleSelectors.map(s => s.active).join(' ');
      return `${producer.basePrompt} ${stylesText} style`;
    }
  }
}