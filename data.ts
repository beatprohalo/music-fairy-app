/**
 * @fileoverview All data for producers, prompts, and styles.
 * Replaces the need for an external prompts.json file.
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Producer, Prompt, PresetStyle } from './types';

const producers: Omit<Producer, 'producerId' | 'promptIds'>[] = [
  { name: 'Timbaland', displayName: 'Bouncy, Syncopated Rhythms', description: 'Crafts bouncy, syncopated rhythms with exotic world samples and his signature vocal chops.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3,15H5V21H3V15M7,12H9V21H7V12M11,9H13V21H11V9M15,12H17V21H15V12M19,9H21V21H19V9Z"/></svg>', weight: 0, cc: 1, color: '#00bcd4', type: 'producer', spice: { label: 'Beatbox Rhythm', text: 'with a human beatbox foundation' } },
  { name: 'Dr. Dre', displayName: 'Classic G-Funk', description: 'The definitive West Coast G-Funk sound, featuring clean, hard-hitting drums and melodic synth leads.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.9,12.6C19.7,13,19.2,13.1,18.8,12.9L15.4,11c0,0-0.1,0-0.1,0c-0.6,1.1-1.3,2.1-2.2,3l-0.1,0.1c-0.1,0-0.1,0-0.1,0.1l2.5,4.3c0.2,0.4,0.1,0.8-0.2,1.1c-0.3,0.3-0.8,0.4-1.1,0.2L12,17.2l-2.1,2.5c-0.3,0.3-0.8,0.4-1.1,0.2c-0.3-0.3-0.4-0.8-0.2-1.1l2.5-4.3c0,0,0-0.1-0.1-0.1l-0.1-0.1c-0.9-0.9-1.6-1.9-2.2-3c0,0,0,0-0.1,0l-3.4,1.9c-0.4,0.2-0.8,0.1-1.1-0.2c-0.3-0.3-0.4-0.8-0.2-1.1l4.3-7.5c0.2-0.4,0.7-0.6,1.1-0.4l3.5,2c0,0,0.1,0,0.1,0c0.5-0.3,1-0.6,1.5-0.8V3c0-0.6,0.4-1,1-1s1,0.4,1,1v1.5c0.5,0.2,1,0.5,1.5,0.8c0,0,0.1,0,0.1,0l3.5-2c0.4-0.2,0.9,0,1.1,0.4L19.9,12.6z"/></svg>', weight: 0, cc: 2, color: '#4caf50', type: 'producer', spice: { label: 'Electric Guitar', text: 'with Dr. Dre style electric guitar licks and riffs' } },
  { name: 'The Neptunes', displayName: 'Quirky Minimalism', description: 'A minimalist sound palette with quirky percussion, spacey synth chords, and driving basslines.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/></svg>', weight: 0, cc: 3, color: '#ffeb3b', type: 'producer', spice: { label: 'Electric Guitar', text: 'with Neptunes style electric guitar licks and riffs' }, secondarySpice: { label: 'No Chad', text: 'in the solo style of Pharrell Williams, focusing on his signature drum programming and melodic hooks' } },
  { name: 'Scott Storch', displayName: 'Lavish Piano & Strings', description: 'Builds tracks around lavish piano riffs and Middle Eastern strings over heavy 808s.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5C3.89,3,3,3.89,3,5v14c0,1.11,0.89,2,2,2h14c1.11,0,2-0.89,2-2V5C21,3.89,20.11,3,19,3z M8,18H6V6h2V18z M12,18h-2V6h2V18z M16,18h-2V6h2V18z"/></svg>', weight: 0, cc: 4, color: '#ff9800', type: 'producer', spice: { label: 'Exotic Scale', text: 'using an exotic, middle-eastern scale' } },
  { name: 'Kanye West', displayName: 'Soulful Sample Chops', description: 'Known for his innovative use of soulful sample chops, orchestral arrangements, and distorted synth bass.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,21.35L10.55,20.03C5.4,15.36,2,12.27,2,8.5C2,5.41,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.41,22,8.5c0,3.77-3.4,6.86-8.55,11.53L12,21.35Z"/></svg>', weight: 0, cc: 5, color: '#f44336', type: 'producer', spice: { label: 'Chipmunk Soul', text: 'with a pitched-up soul sample' } },
  { name: '808 Mafia', displayName: 'Dark, Epic Trap', description: 'Creates dark, epic trap beats with ominous bell melodies, rapid-fire hi-hats, and booming sub-bass.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,13.18 19.66,14.29 19,15.28L15.28,19C14.29,19.66 13.18,20 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M10,8A2,2 0 0,0 8,10A2,2 0 0,0 10,12A2,2 0 0,0 12,10A2,2 0 0,0 10,8M14,8A2,2 0 0,0 12,10A2,2 0 0,0 14,12A2,2 0 0,0 16,10A2,2 0 0,0 14,8M12,14C10.33,14 8.85,15.24 8.28,16.78C8.1,17.22 8.44,17.69 8.91,17.69H15.09C15.56,17.69 15.9,17.22 15.72,16.78C15.15,15.24 13.67,14 12,14Z"/></svg>', weight: 0, cc: 6, color: '#9c27b0', type: 'producer', spice: { label: 'Soft Clipper', text: 'with an aggressive soft clipper on the master for loudness' } },
  { name: 'Quincy Jones', displayName: 'Lush Jazz & Funk', description: 'A master of arrangement, blending lush jazz chords, funky horn sections, and live string ensembles.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8,8,8,0,0,1-8,8ZM11,7h2v6H11Zm1.5,10.5L11,16l1.5-1.5,1.5,1.5Z"/></svg>', weight: 0, cc: 7, color: '#e91e63', type: 'producer', spice: { label: 'Room for God', text: 'with space for unexpected magic' } },
  { name: 'Hans Zimmer', displayName: 'Epic Orchestral Scores', description: 'Produces epic, sweeping orchestral scores with powerful percussion and atmospheric synth textures.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20,2H4C2.9,2,2,2.9,2,4V20C2,21.1,2.9,22,4,22H20C21.1,22,22,21.1,22,20V4C22,2.9,21.1,2,20,2M5,17H3V15H5V17M5,13H3V11H5V13M5,9H3V7H5V9M13,17H11V7H13V17M9,17H7V7H9V17M17,17H15V7H17V17M21,17H19V15H21V17M21,13H19V11H21V13M21,9H19V7H21V9Z"/></svg>', weight: 0, cc: 8, color: '#3f51b5', type: 'producer', spice: { label: 'Low-end Brass', text: 'with a powerful low-end brass \'bwaaam\' sound' } },
  { name: 'Metro Boomin', displayName: 'Ominous Trap Melodies', description: 'Defines the modern trap sound with ominous, dark melodies, hard-hitting 808s, and crisp hi-hats.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.8,2.1L16.4,3.5c-1.1-0.7-2.5-1.1-4.4-1.1s-3.3,0.4-4.4,1.1L6.2,2.1C4.7,1.1,2.8,1.6,2,3.3l4,6.9V18c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2v-7.8l4-6.9C21.2,1.6,19.3,1.1,17.8,2.1z M8,16c-0.5,0-1-0.5-1-1s0.5-1,1-1s1,0.5,1,1S8.5,16,8,16z M12,5c0.6,0,1-0.4,1-1s-0.4-1-1-1s-1,0.4-1,1S11.4,5,12,5z M16,16c-0.5,0-1-0.5-1-1s0.5-1,1-1s1,0.5,1,1S16.5,16,16,16z"/></svg>', weight: 0, cc: 9, color: '#607d8b', type: 'producer', spice: { label: 'Dark Atmosphere', text: 'with a dark, cinematic atmosphere' } },
  { name: 'J Dilla', displayName: 'Off-Kilter Soulful Beats', description: 'The pioneer of "drunken" drums, featuring off-kilter, unquantized beats and warm, dusty soul chops.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8,8,8,0,0,1-8,8Zm-2.7-9.5A2.7,2.7,0,0,1,12,8.2a2.7,2.7,0,0,1,2.7,2.6,2.6,2.6,0,0,1-2.6,2.7A2.6,2.6,0,0,1,9.3,10.8Zm5.3,1.4a4,4,0,0,0-5.3-3.9,4,4,0,0,0-2.6,5.3,4,4,0,0,0,5.3,3.9,4,4,0,0,0,2.6-5.3Z M16.7,10.8a1.2,1.2,0,0,0-1.1-1.1,1.1,1.1,0,0,0-1.2,1.2,1.2,1.2,0,0,0,1.1,1.1,1.1,1.1,0,0,0,1.2-1.2Z"/></svg>', weight: 0, cc: 10, color: '#795548', type: 'producer', spice: { label: 'Dilla Swing', text: 'with a lazy, behind-the-beat Dilla swing' } },
  { name: 'Teddy Riley', displayName: 'New Jack Swing', description: 'The father of New Jack Swing, fusing R&B melodies with hip-hop beats, punchy brass, and funky synth bass.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7,6H5V18H7V6M20,6H18V18H20V6M16,6H8C6.9,6,6,6.9,6,8V16C6,17.1,6.9,18,8,18H16C17.1,18,18,17.1,18,16V8C18,6.9,17.1,6,16,6M12,16C9.79,16,8,14.21,8,12C8,9.79,9.79,8,12,8C14.21,8,16,9.79,16,12C16,14.21,14.21,16,12,16Z"/></svg>', weight: 0, cc: 11, color: '#ff5722', type: 'producer', spice: { label: 'R&B/Hip-Hop Fusion', text: 'fusing R&B chords with hip-hop drums' } },
  { name: 'Darkchild', displayName: 'Futuristic R&B', description: 'Creates futuristic R&B and pop hits with staccato synth stabs and complex, syncopated drum programming.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20,9V7H18V5H20V3H18V1H16V3H14V5H16V7H14V9H16V11H14V13H16V15H14V17H16V19H14V21H16V23H18V21H20V19H18V17H20V15H18V13H20V11H18V9H20M12,15H10V17H8V15H6V13H8V11H10V13H12V15M8,1H6V3H4V5H6V7H4V9H6V11H4V13H6V15H4V17H6V19H4V21H6V23H8V21H10V19H8V17H10V15H8V13H10V11H8V9H10V7H8V5H10V3H8V1Z"/></svg>', weight: 0, cc: 12, color: '#8bc34a', type: 'producer', spice: { label: 'Stutter Edit', text: 'with complex vocal stutter edits' } },
  { name: 'DJ Quik', displayName: 'Smooth G-Funk', description: 'A West Coast legend known for smooth, melodic G-Funk grooves with live-sounding bass and talkbox.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8,8,8,0,0,1-8,8Zm1-11a2,2,0,0,0-2,2v3a2,2,0,0,0,2,2h1.5c.8,0,1.5-.7,1.5-1.5v-2c0-.8-.7-1.5-1.5-1.5H13Zm.5,3h-1v-1h1Z"/></svg>', weight: 0, cc: 13, color: '#cddc39', type: 'producer', spice: { label: 'G-Funk Whine', text: 'with a high-pitched G-Funk synthesizer whine' } },
  { name: 'Questlove', displayName: 'Live Neo-Soul Drums', description: 'A master drummer providing live, in-the-pocket hip-hop drums with an earthy neo-soul groove.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2C9.5,2,7.5,4,7.5,6.5C7.5,8.7,9,10.6,11.1,11C11.5,11,12,11.4,12,12V13C12,13.6,11.6,14,11,14H9C7.9,14,7,14.9,7,16V17H17V16C17,14.9,16.1,14,15,14H13C12.4,14,12,13.6,12,13V12C12,11.4,12.5,11,12.9,11C15,10.6,16.5,8.7,16.5,6.5C16.5,4,14.5,2,12,2Z"/></svg>', weight: 0, cc: 14, color: '#03a9f4', type: 'producer', spice: { label: 'Live Feel', text: 'played with the feel of a live, in-the-pocket drummer' } },
  { name: 'Zaytoven', displayName: 'Gospel-Influenced Trap', description: 'Blends his signature gospel-influenced piano chords and bouncy 808s to create iconic trap beats.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19,3H5C3.89,3,3,3.89,3,5v14c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.89,20.11,3,19,3z M15,17H9v-2h4l-4-4v-2h6v2h-4l4,4V17z"/></svg>', weight: 0, cc: 15, color: '#2196f3', type: 'producer', spice: { label: 'Church Keys', text: 'played with a gospel church organ' } },
  { name: 'Mustard', displayName: 'West Coast Club Bangers', description: 'Creates minimalist, catchy synth melodies for West Coast club bangers, known as "ratchet music".', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15,3H9C8.4,3,8,3.4,8,4v4.4C6.8,8.8,6,10.3,6,12v6c0,2.2,1.8,4,4,4h4c2.2,0,4-1.8,4-4v-6c0-1.7-0.8-3.2-2-3.6V4C16,3.4,15.6,3,15,3z"/></svg>', weight: 0, cc: 16, color: '#ffc107', type: 'producer', spice: { label: 'Ratchet Bounce', text: 'with a minimalist, ratchet music bounce' } },
  { name: 'Jimi Hendrix', displayName: 'Psychedelic Blues Guitar', description: 'Revolutionized the electric guitar with psychedelic, blues-infused playing and innovative use of effects.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M14.4,6.4C13,6.4,11.9,7.5,11.9,8.9s1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5S15.8,6.4,14.4,6.4z M10,12v3.1l3.1,2.5H15v-1.8l-2.2-1.3V12H10z M12.8,2c-3.6,0-4.4,1.8-4.4,1.8v8.9c0,1-0.8,1.8-1.8,1.8S5,13.7,5,12.8V4h1.8V2H5C4,2,3.2,2.8,3.2,3.8v8.9c0,2,1.6,3.6,3.6,3.6s3.6-1.6,3.6-3.6V8s0.9-1.8,4.4-1.8S19,8,19,8v3.6c0,1,0.8,1.8,1.8,1.8s1.8-0.8,1.8-1.8V3.8S16.4,2,12.8,2z"/></svg>', weight: 0, cc: 17, color: '#9e9e9e', type: 'producer', spice: { label: 'Voodoo Chile', text: 'with heavy use of guitar feedback and a wah pedal' } },
  { name: 'Michael Hampton', displayName: 'Funk-Rock Acid Guitar', description: 'A P-Funk legend known for heavy, distorted funk-rock guitar solos and syncopated grooves.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2C9.5,2,7.5,4,7.5,6.5V13c0,1.7,1.3,3,3,3h1v3.5c0,0.8,0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5V16h1c1.7,0,3-1.3,3-3V6.5C16.5,4,14.5,2,12,2z M12,4c1.4,0,2.5,1.1,2.5,2.5V12h-5V6.5C9.5,5.1,10.6,4,12,4z"/></svg>', weight: 0, cc: 18, color: '#673ab7', type: 'producer', spice: { label: 'Acid Guitar', text: 'with screaming, psychedelic funk-rock acid guitar licks' } },
  { name: 'Cornell Dupree', displayName: 'Clean R&B/Soul Guitar', description: 'A legendary session guitarist who provides clean, melodic R&B fills and grooving soul rhythm.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2L2,7.4V16.6L12,22L22,16.6V7.4L12,2Z M12,4.5L19,8.7L12,13L5,8.7L12,4.5Z"/></svg>', weight: 0, cc: 19, color: '#009688', type: 'producer', spice: { label: 'In The Pocket', text: 'with an \'in the pocket\' session musician feel' } },
  { name: 'World Percussion', displayName: 'World-Class Percussion', description: 'A versatile percussionist providing complex, polyrhythmic rock, jazz, and world percussion.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8,3H6V21H8V3M18,3H16V21H18V3M14,3H10V21H14V3Z"/></svg>', weight: 0, cc: 20, color: '#4caf50', type: 'producer', spice: { label: 'Polyrhythm', text: 'with complex, layered polyrhythms' } },
  { name: 'Davido', displayName: 'Infectious Afrobeats', description: 'A global Afrobeats star, creating upbeat, infectious rhythms with lush synths and log drums.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21.2,12.7c-0.2-1.9-1.1-3.6-2.4-5c-1.3-1.3-3-2.2-4.8-2.4c-0.3,0-0.6,0.2-0.7,0.5C13.2,6,13,6.3,13.2,6.5l1,2.1c0.1,0.2,0.3,0.4,0.5,0.4c0,0,0.1,0,0.1,0c0.3,0,0.5-0.2,0.6-0.5l0.4-0.9c0.7,0.4,1.3,0.9,1.8,1.5c0.6,0.7,1,1.5,1.2,2.4c0,0.1,0.1,0.2,0.1,0.2c0,0.1,0.1,0.1,0.2,0.2c0,0,0,0,0,0c0.1,0.1,0.2,0.1,0.2,0.1c0.1,0.1,0.2,0.1,0.3,0.1c0.1,0,0.3-0.1,0.4-0.2C21.3,13.1,21.3,12.9,21.2,12.7z M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M10.4,15.1c-0.8,0.9-1.8,1.6-2.9,2c-0.1,0-0.2,0.1-0.2,0.1c-0.1,0-0.2,0.1-0.3,0.1c-0.1,0-0.3-0.1-0.4-0.2c-0.1-0.1-0.2-0.3-0.1-0.5c0-0.1,0-0.1,0.1-0.2c0.9-1.2,1.5-2.6,1.7-4c0.1-0.4,0.4-0.7,0.8-0.7c0.4,0,0.7,0.3,0.7,0.8C10.6,13.4,10.5,14.3,10.4,15.1z"/></svg>', weight: 0, cc: 21, color: '#ffeb3b', type: 'producer', spice: { label: 'Shekpe!', text: 'with an energetic \'shekpe!\' ad-lib' } },
  { name: 'Sarz', displayName: 'Minimalist Afropop', description: 'A pioneering Nigerian producer known for minimalist, hard-hitting Afropop with unique experimental synths.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15,4H9C6.2,4,4,6.2,4,9s2.2,5,5,5h4v-2H9c-1.7,0-3-1.3-3-3s1.3-3,3-3h6v2H11v2h4c2.8,0,5-2.2,5-5S17.8,4,15,4z"/></svg>', weight: 0, cc: 22, color: '#ff9800', type: 'producer', spice: { label: 'Really?', text: 'with a \'Really?\' vocal tag' } },
  { name: 'Afrobeats', description: 'Produce modern Afrobeats and Amapiano tracks with driving log drums and atmospheric synth pads.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17,3H7L2,12l5,9h10l5-9L17,3z M16.3,19H7.7L3.4,12l4.3-7h8.6l4.3,7L16.3,19z"/></svg>', weight: 0, cc: 23, color: '#f44336', type: 'producer' },
  { name: 'Sean John Combs', displayName: 'Flashy 90s Hip-Hop/R&B', description: 'The Bad Boy sound, featuring flashy funk and soul samples with polished, radio-friendly production.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,1L2,8.5V15.5L12,23L22,15.5V8.5L12,1Z M12,3.3L19,8.5L12,13.7L5,8.5L12,3.3M4,10.2L12,15.4L20,10.2V13.8L12,19L4,13.8V10.2Z"/></svg>', weight: 0, cc: 24, color: '#9c27b0', type: 'producer', spice: { label: 'Ad-libs', text: 'with his signature ad-libs and hype tracks' } },
  { name: 'Jermaine Dupri', displayName: 'Smooth Pop-Rap Crossovers', description: 'The So So Def sound, crafting smooth 90s R&B grooves and catchy pop-rap crossover beats.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9,7H7V17H9V11H11V17H13V7H9V7M19,7H15V17H17V13H19C20.1,13,21,12.1,21,11V9C21,7.9,20.1,7,19,7M19,11H17V9H19V11Z"/></svg>', weight: 0, cc: 25, color: '#e91e63', type: 'producer', spice: { label: 'Sample Mute', text: 'using the MPC mute group technique for smooth sample chops' } },
  { name: 'Mannie Fresh', displayName: 'New Orleans Bounce', description: 'The iconic Cash Money sound, built on bouncy New Orleans bounce rhythms with quirky synths and heavy 808s.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.25,10.25L12,12L10.75,10.25L12,9L13.25,10.25M12,2L5.5,9.5L7.5,10.5L9,9L9,15.5L7.5,17L8.5,22L12,19.5L15.5,22L16.5,17L15,15.5L15,9L16.5,10.5L18.5,9.5L12,2Z"/></svg>', weight: 0, cc: 26, color: '#3f51b5', type: 'producer', spice: { label: 'Ad-libs & Scratches', text: 'with signature Mannie Fresh ad-libs and DJ scratches' } },
  { name: 'Classic Blues', description: 'Create authentic 12-bar blues shuffles with emotional guitar solos and raw, heartfelt harmonica.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,4C8.69,4,6,6.69,6,10c0,2.13,1.08,4,2.68,5.06l-2.72,2.72C5.97,17.77,6,17.76,6,17.75c0,0-2-2.13-2-5.75c0-4.42,3.58-8,8-8s8,3.58,8,8c0,3.63-2,5.75-2,5.75c0,0.01,0.03,0.02,0.04,0.01l-2.72-2.72C14.92,14,16,12.13,16,10C16,6.69,13.31,4,12,4z M12,13c-1.66,0-3-1.34-3-3s1.34-3,3-3s3,1.34,3,3S13.66,13,12,13z"/></svg>', weight: 0, cc: 27, color: '#607d8b', type: 'producer' },
  { name: 'K-pop', description: 'Craft catchy, polished synth-pop hooks and powerful dance-pop drum beats for modern K-pop hits.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.33 19.14C13.63 20.24 14.7 21 15.86 21C17.03 21 18.1 20.24 18.4 19.14L19.5 15.65C19.82 14.5 19.12 13.38 18.03 13.11C16.95 12.83 15.83 13.5 15.5 14.65L14.4 18.14L13.33 19.14M12.94 11.23L12.06 12.11L11.5 9.25L10.33 10.42L10.5 16.5C10.5 18.43 8.93 20 7 20C5.07 20 3.5 18.43 3.5 16.5C3.5 14.57 5.07 13 7 13C8.17 13 9.19 13.56 9.8 14.44L12.94 11.23Z"/></svg>', weight: 0, cc: 28, color: '#795548', type: 'producer' },
  { name: 'Tricky Stewart', displayName: 'Infectious Pop-R&B Hooks', description: 'A hitmaker known for catchy, infectious synth riffs and hard-hitting, polished pop-R&B drums.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A9.09,9.09,0,0,0,3,11H21A9.09,9.09,0,0,0,12,2M12,15a1,1,0,0,0,1-1H11a1,1,0,0,0,1,1M8,17H16v2H8Z"/></svg>', weight: 0, cc: 29, color: '#ff5722', type: 'producer', spice: { label: 'Umbrella Structure', text: 'with the massive, anthemic structure of a proper pop record' } },
  { name: 'RZA', displayName: 'Gritty, Lo-fi Sample Beats', description: 'The architect of the Wu-Tang Clan sound, using gritty, lo-fi soul samples and kung-fu movie clips.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12.3,4.2L10.2,2L0,9.2l2.2,2l1.1-1l3.5,3.3l-2.4,2.9l2.1,2.1l3.1-4l2.5,2.2l-1,1.1l2,2.1l6.8-6.8L22,9.2l-9.7-5M7.8,11.5L4.2,8.5l3.5-2.2l3.5,3Z M19.8,9.5L16.2,12.5l-3.5-2.2l3.5-3Z"/></svg>', weight: 0, cc: 30, color: '#ffd700', type: 'producer', spice: { label: 'Kung-Fu Samples', text: 'with dialogue samples from classic kung-fu movies' } },

  // --- Instruments ---
  { name: 'Spanish Folk', description: 'Create authentic Spanish folk music, from fiery Flamenco to festive Jota.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.5 2H15v1.5h3.5v17H15V22h3.5a1.5 1.5 0 0 0 2-20.5v-17A1.5 1.5 0 0 0 18.5 2zM13 3.5a1.5 1.5 0 0 0-1.5 1.5v14a1.5 1.5 0 0 0 1.5 1.5h.5v-17h-.5zM5 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>', weight: 0, cc: 31, color: '#e67e22', type: 'instrument', basePrompt: 'A Spanish Folk music performance', styleSelectors: [
      { label: 'Style', options: ['Flamenco', 'Sardana', 'Fandango', 'Jota'], active: 'Flamenco' }
  ]},
  { name: 'Latin Music', description: 'Produce vibrant Latin rhythms like Salsa, Reggaeton, and Bachata.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M10.5,6.5L13.5,9.5L14.5,8.5L11.5,5.5L10.5,6.5M6.7,11.2L8.8,13.3L7.8,14.3L5.7,12.2L6.7,11.2M17.3,11.2L18.3,12.2L16.2,14.3L15.2,13.3L17.3,11.2M4.2,17.9L5.7,16.4L4.3,15L2.8,16.4C2.4,16.8 2.4,17.5 2.8,17.9C3.2,18.3 3.9,18.3 4.2,17.9M19.8,17.9C20.2,17.5 20.2,16.8 19.8,16.4L18.3,15L16.9,16.4L18.3,17.9C18.7,18.3 19.4,18.3 19.8,17.9M9,22H15V15H9V22M11,17H13V20H11V17Z"/></svg>', weight: 0, cc: 32, color: '#e74c3c', type: 'instrument', basePrompt: 'A Latin music performance', styleSelectors: [
      { label: 'Style', options: ['Salsa', 'Reggaeton', 'Bachata'], active: 'Salsa' }
  ]},
  { name: 'African Music', description: 'Explore a wide range of African genres, from Afrobeats and Amapiano to Soukous and Highlife.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 3H7L4 9v1.5C4 12.3 5.7 14 7.5 14h9c1.8 0 3.5-1.7 3.5-3.5V9l-3-6zM7 5h10l2.2 4.5H4.8L7 5z M18 16h-5v6l-2-2-2 2v-6H4c-1.1 0-2 .9-2 2v2h18v-2c0-1.1-.9-2-2-2z"/></svg>', weight: 0, cc: 33, color: '#2ecc71', type: 'instrument', basePrompt: 'An African music performance', styleSelectors: [
      { label: 'Style', options: ['Afrobeats', 'Amapiano', 'Soukous', 'Highlife', 'Jùjú music', 'Mbalax', 'South African jazz', 'Gnawa music', 'Mbaqanga', 'Makossa', 'Afrobeat'], active: 'Afrobeats' }
  ]},
  { name: 'Asian Music', description: 'Craft modern and traditional Asian sounds, including K-pop, J-pop, and Gamelan.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 4L2 11h1.5l8.5-5.5L20.5 11H22L12 4zM5.5 13H4L12 6l8 7h-1.5L12 8.5L5.5 13zM18 15l-6-4.5L6 15h12zm-6.5 6h11L12 16.5L6.5 21z"/></svg>', weight: 0, cc: 34, color: '#3498db', type: 'instrument', basePrompt: 'An Asian music performance', styleSelectors: [
      { label: 'Style', options: ['K-pop', 'J-pop', 'C-pop', 'Anison', 'Cantopop', 'Indonesian Pop', 'Korean Trot', 'Guofeng', 'Filipino Breakbeat', 'Traditional Chinese', 'Japanese Gagaku', 'Southeast Asian Gamelan', 'Indian Classical', 'Central Asian Folk'], active: 'K-pop' }
  ]},
  { name: 'Indian Music', description: 'Generate diverse Indian styles, from Bollywood and Bhangra to Hindustani Classical.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17,6H14V4h3M10,6H7V4h3M18,2H13a1,1 0 0,0 -1,1V6a1,1 0 0,0 1,1h5a1,1 0 0,0 1-1V3a1,1 0 0,0 -1-1M11,2H6a1,1 0 0,0 -1,1V6a1,1 0 0,0 1,1h5a1,1 0 0,0 1-1V3a1,1 0 0,0 -1-1M19,10H12l-2,8h11a1,1 0 0,0 1-1V11a1,1 0 0,0 -1-1M9,10H2l2,8h6a1,1 0 0,0 1-1V11a1,1 0 0,0 -1-1Z" /></svg>', weight: 0, cc: 35, color: '#f1c40f', type: 'instrument', basePrompt: 'An Indian music performance', styleSelectors: [
      { label: 'Style', options: ['Bollywood Music', 'Hindustani Classical', 'Carnatic Classical', 'Bhangra', 'Ghazal', 'Qawwali', 'Indian Pop', 'Indian Rock', 'Dhrupad', 'Khayal', 'Thumri', 'Tappa', 'Baul Folk', 'Lavani Folk', 'Bhajan', 'Kirtan'], active: 'Bollywood Music' }
  ]},
  { name: '70\'s Disco & Funk', description: 'Lay down groovy foundations with styles from 70s Disco, Funk, and Soul R&B.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14H9v-2h2zm4 0h-2v-2h2zm0-4h-2v-2h2zm-4 0H9v-2h2zm4-4h-2V7h2zm-4 0H9V7h2zm-4 0H5V7h2zM9 5h2v2H9zm4 0h2v2h-2z"/></svg>', weight: 0, cc: 36, color: '#1abc9c', type: 'instrument', basePrompt: 'A performance', styleSelectors: [
      { label: 'Style', options: ['70\'s', 'Soul R&B', '90\'s R&B', 'Disco', 'Funk', '80\'s R&B', 'Disruptive'], active: '70\'s' }
  ]},
  { name: 'Hip-Hop', description: 'Build regional Hip-Hop beats from different eras, from 80s East Coast to modern Down South.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>', weight: 0, cc: 37, color: '#d35400', type: 'instrument', basePrompt: 'A hip-hop performance', styleSelectors: [
      { label: 'Style', options: ['80\'s', '90\'s', '2000\'s', 'Modern'], active: '90\'s' },
      { label: 'Region', options: ['West Coast', 'East Coast', 'Midwest', 'Down South'], active: 'West Coast' }
  ]},
  { name: 'Drummer', description: 'A versatile session drummer. Choose from acoustic kits, classic drum machines, or live percussion.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.07,3.5L16.24,6.33L17.66,7.74L20.49,4.91C20.88,4.52 20.88,3.89 20.49,3.5C20.1,3.11 19.46,3.11 19.07,3.5M3.5,19.07L6.33,16.24L7.74,17.66L4.91,20.49C4.52,20.88 3.89,20.88 3.5,20.49C3.11,20.1 3.11,19.46 3.5,19.07M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>', weight: 0, cc: 38, color: '#F44336', type: 'instrument', basePrompt: 'A drum performance', styleSelectors: [
      { label: 'Drum Type', options: ['Acoustic Kit', '808 Machine', '909 Machine', 'LinnDrum', 'MPC Kit', 'Live Percussion', 'Human Beatbox'], active: 'Acoustic Kit' },
      { label: 'Regional Style', options: ['US Funk & Soul', 'New York Boom Bap', 'West Coast G-Funk', 'Southern Trap', 'UK Garage & Grime', 'Jamaican Reggae & Dub', 'Latin Percussion', 'Afrobeat'], active: 'US Funk & Soul' },
      { label: 'Performance Feel', options: ['In the pocket', 'Heavy hitting', 'Busy and syncopated', 'Swung and lazy', 'Driving and energetic', 'Minimalist pattern'], active: 'In the pocket' }
  ]},
  { name: 'Violin', description: 'Add solo violin performances in various styles, including Cinematic, Pop, and Hip-hop.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16,3A3,3 0 0,0 13,6C13,7.31 13.83,8.42 15,8.83V14.17C13.83,14.58 13,15.69 13,17A3,3 0 0,0 16,20A3,3 0 0,0 19,17C19,15.69 18.17,14.58 17,14.17V8.83C18.17,8.42 19,7.31 19,6A3,3 0 0,0 16,3M5,11L8.41,7.59L10,9.17L7.41,11.75L10,14.33L8.41,15.91L5,12.5V11Z"/></svg>', weight: 0, cc: 39, color: '#2980b9', type: 'instrument', basePrompt: 'A violin performance', styleSelectors: [
      { label: 'Style', options: ['Cinematic', 'Pop', 'Hip-hop', 'R&B', 'Disruptive'], active: 'Cinematic' }
  ]},
  { name: 'Viola', description: 'Incorporate viola performances in various styles, including Cinematic, Pop, and Hip-hop.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 5H13V19H11V5M17 9H15V11H17V13H15V15H17V17A2 2 0 0 1 15 19H13V17H15V15H13V13H15V11H13V9H15V7A2 2 0 0 1 17 5V9Z"/></svg>', weight: 0, cc: 40, color: '#27ae60', type: 'instrument', basePrompt: 'A viola performance', styleSelectors: [
      { label: 'Style', options: ['Cinematic', 'Pop', 'Hip-hop', 'R&B', 'Disruptive'], active: 'Cinematic' }
  ]},
  { name: 'Cello', description: 'Add rich cello performances in various styles, including Cinematic, Pop, and Hip-hop.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 3a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11zm0 2a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7zm6-2h-2v11a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1V3zM18 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>', weight: 0, cc: 41, color: '#8e44ad', type: 'instrument', basePrompt: 'A cello performance', styleSelectors: [
      { label: 'Style', options: ['Cinematic', 'Pop', 'Hip-hop', 'R&B', 'Disruptive'], active: 'Cinematic' }
  ]},
  { name: 'Double Bass', description: 'Lay down a deep foundation with double bass in styles like Cinematic, Pop, and Hip-hop.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15 2H9c-1.1 0-2 .9-2 2v13.54c-1.39-.53-2.94-.53-4.44 0C1.22 18.09 1 19.49 1 21c0 1.66 1.34 3 3 3c1.3 0 2.4-.84 2.82-2H17v-1.18c.84-.6 1.5-1.42 1.9-2.39L19.33 13H17V4c0-1.1-.9-2-2-2m-4 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>', weight: 0, cc: 42, color: '#c0392b', type: 'instrument', basePrompt: 'A double bass performance', styleSelectors: [
      { label: 'Style', options: ['Cinematic', 'Pop', 'Hip-hop', 'R&B', 'Disruptive'], active: 'Cinematic' }
  ]},
  { name: 'Brass Section', description: 'Add the power of a full brass section in styles ranging from Cinematic to Funk and R&B.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.8,3.2C18,2.5,17,2,16,2H10C8.9,2,8,2.9,8,4v6c0,1.1,0.9,2,2,2h1.6L10,18.8c-0.5,1.7,0.2,3.5,1.7,4.6c1.5,1.2,3.5,1.3,5.2,0.5l-0.8-1.3c-1.2,0.5-2.6,0.5-3.7-0.2c-1.1-0.7-1.6-2-1.2-3.2l1.6-6.4H16c1.1,0,2-0.9,2-2V4C18,3.7,18.9,3.3,18.8,3.2z M6,8v8H4V8H6z M2,10v4H0v-4H2z"/></svg>', weight: 0, cc: 43, color: '#f39c12', type: 'instrument', basePrompt: 'A brass section performance', styleSelectors: [
      { label: 'Style', options: ['Cinematic', 'Pop', 'Hip-hop', 'R&B', 'Disruptive'], active: 'Cinematic' }
  ]},
  { name: 'Marching Band', description: 'Incorporate the powerful sound of a marching band from different eras.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 10H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2zm-3 4H7v-2h10v2zM6.3 9.7l3.9-3.9 1.4 1.4-3.9 3.9-1.4-1.4zm11.4-1.4L14.3 4.9l1.4-1.4 3.4 3.4-1.4 1.4z"/></svg>', weight: 0, cc: 44, color: '#d35400', type: 'instrument', basePrompt: 'A marching band performance', styleSelectors: [
      { label: 'Era', options: ['40\'s', '50\'s', '60\'s', '70\'s', '80\'s', '90\'s', '2000\'s', 'Modern'], active: '80\'s' }
  ]},
  { name: 'SYNTH', description: 'A versatile synthesizer. Create leads, basses, pads, and arpeggios from any era.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2,16H5.17C5.61,14.26 7.13,13 9,13C10.87,13 12.39,14.26 12.83,16H15V11H22V8H15V3H13V8H2V11H13V16H11.17C10.73,17.74 9.21,19 7.33,19C5.46,19 3.94,17.74 3.5,16H2V16M9,15A1,1 0 0,0 8,16A1,1 0 0,0 9,17A1,1 0 0,0 10,16A1,1 0 0,0 9,15Z"/></svg>', weight: 0, cc: 45, color: '#9C27B0', type: 'instrument', basePrompt: 'A synthesizer performance', styleSelectors: [
      { label: 'Synth Type', options: ['Any Synth', 'Lead Synth', 'Bass Synth', 'Synth Pad', 'Arpeggiated Synth', 'Plucked Synth', 'Wobble Bass', 'Reese Bass', 'FM Synth', 'Wavetable Synth', 'Granular Synth'], active: 'Any Synth' },
      { label: 'Era', options: ['60\'s', '70\'s', '80\'s', '90\'s', '2000\'s', 'Modern'], active: '80\'s' }
  ]},
  { name: 'PiANO', description: 'A comprehensive keyboard instrument, from grand pianos and Rhodes to harpsichords and clavinet.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 20H5V4H19M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2M8 10H6V14H8M12 10H10V14H12M16 10H14V14H16Z"/></svg>', weight: 0, cc: 46, color: '#3F51B5', type: 'instrument', basePrompt: 'A piano performance', styleSelectors: [
      { label: 'Piano Type', options: ['Grand Piano', 'Upright Piano', 'Rhodes Electric Piano', 'Wurlitzer Electric Piano', 'Honky-Tonk Piano', 'Harpsichord', 'Clavinet'], active: 'Grand Piano' },
      { label: 'Style / Era', options: ['Baroque', 'Classical', 'Romantic', 'Ragtime', 'Bebop Jazz', 'Cool Jazz', 'Blues', 'Rock and Roll', 'Gospel', 'Modern Pop Ballad'], active: 'Modern Pop Ballad' },
      { label: 'Performance', options: ['Melodic', 'Chordal', 'Rhythmic', 'Arpeggiated', 'Virtuosic Solo'], active: 'Chordal' }
  ]},
  { name: 'Guitars', description: 'A collection of guitars, including acoustic, electric, and bass, for any style or performance.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.8,3.2C18,2.5,17,2,16,2H8C6.9,2,6,2.9,6,4v8.4l-4,4v2h2l4-4h2.6l-3.8,7.2C8.5,22.3,9.2,23,10,23h4c0.8,0,1.5-0.7,1.2-1.4l-3.8-7.2H16c1.1,0,2-0.9,2-2V4C18,3.7,18.9,3.3,18.8,3.2z M10,12H8V4h2V12z"/></svg>', weight: 0, cc: 47, color: '#009688', type: 'instrument', basePrompt: 'A guitar performance', styleSelectors: [
      { label: 'Guitar Type', options: ['Acoustic Guitar (Steel)', 'Acoustic Guitar (Nylon)', 'Electric Guitar (Clean)', 'Electric Guitar (Distorted)', '12-String Acoustic Guitar', 'Archtop Jazz Guitar', 'Lap Steel Guitar', 'Resonator Guitar', 'Bass Guitar'], active: 'Electric Guitar (Clean)' },
      { label: 'Style / Era', options: ['Delta Blues', 'Chicago Blues', '50s Rock and Roll', '60s Surf Rock', '70s Classic Rock', '80s Hard Rock', '90s Grunge', '00s Indie Rock', 'Modern Pop', 'Country', 'Jazz Fusion', 'Spanish Flamenco'], active: 'Modern Pop' },
      { label: 'Performance', options: ['Rhythm Chords', 'Fingerpicked Melody', 'Power Chords', 'Arpeggiated', 'Funky Strumming', 'Lead Solo'], active: 'Rhythm Chords' }
  ]},
  { name: 'Orchestra Percussion', description: 'Access a full orchestral percussion section, from timpani and snare to xylophone and tubular bells.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.31 9.22c-1.44-2.47-4.04-4.22-6.81-4.22s-5.37 1.75-6.81 4.22A5.993 5.993 0 0 0 3 15v3h18v-3a5.993 5.993 0 0 0-2.69-5.78zM5 16v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1H5zm6.5-7.5l-3 3h6l-3-3z"/></svg>', weight: 0, cc: 48, color: '#4CAF50', type: 'instrument', basePrompt: 'An orchestral percussion performance', styleSelectors: [
      { label: 'Instrument', options: ['Full Percussion Section', 'Timpani', 'Snare Drum', 'Tenor Drum', 'Bass Drum', 'Crash Cymbals', 'Suspended Cymbal', 'Triangle', 'Tambourine', 'Gong', 'Tam-Tam', 'Wood Block', 'Castanets', 'Glockenspiel', 'Xylophone', 'Vibraphone', 'Marimba', 'Tubular Bells', 'Celesta'], active: 'Full Percussion Section' }
  ]},
  { name: 'Wind', description: 'A collection of world wind instruments, including various flutes, reeds, and more.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.5,3.5L18,5l1.5,1.5L18,8l1.5,1.5L18,11l1.5,1.5L18,14l1.5,1.5L18,17l1.5,1.5l-1.4,1.4L4.9,6.2L6.3,4.8L19.5,3.5 M21,2l-4,1.5V2h-2v2.1L4.2,14.9L2.8,13.5L1.4,14.9L2.8,16.3l-1.4,1.4l1.4,1.4l1.4-1.4l1.4,1.4l1.4-1.4l1.4,1.4l1.4-1.4l1.4,1.4l1.4-1.4l1.4,1.4l1.4-1.4l-7.5-7.5l9-3.4V7h2V3.5L21,2z"/></svg>', weight: 0, cc: 49, color: '#FFC107', type: 'instrument', basePrompt: 'A wind instrument performance', styleSelectors: [
      { label: 'Style', options: ['Cinematic', 'Folk', 'Jazz Solo', 'Classical', 'Pop Melody', 'Avant-Garde'], active: 'Cinematic' },
      { label: 'Flute', options: ['None', 'Western Concert Flute', 'Piccolo', 'Pan Flute', 'Recorder', 'Irish Flute', 'Bansuri', 'Dizi', 'Shakuhachi', 'Ney', 'Quena', 'Ocarina', 'Suling', 'Native American Flute'], active: 'Western Concert Flute' },
      { label: 'Other Wind', options: ['None', 'Clarinet', 'Saxophone', 'Oboe', 'Duduk', 'Shehnai', 'Didgeridoo', 'Bagpipes', 'Accordion', 'Harmonica', 'Zurna'], active: 'None' }
  ]},
  { name: 'The Mellotron', description: 'The classic tape-replay keyboard. Select models from different years for an authentic vintage sound.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 5a6 6 0 1 0 0 12a6 6 0 0 0 0-12zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm10-2a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM7 19h10v-2H7v2z"/></svg>', weight: 0, cc: 50, color: '#795548', type: 'instrument', basePrompt: 'A Mellotron performance', styleSelectors: [
      { label: 'Model', options: ['1963 (Mk I)', '1964 (Mk II)', '1968 (M300)', '1970 (M400)', '2007 (M4000)'], active: '1970 (M400)' }
  ]},
  { name: 'Opera Singer', description: 'A virtual opera singer. Choose from all vocal ranges and performance styles.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 6c-2.4 0-4.47 1.67-4.89 3.86L6.05 12H4v6h2v-4.37l1.82 4.54L9.5 22l3.5-7.5V22h2v-7.5l2-1.5L14.88 18H18v-6h-2.05l-1.06 2.65C16.47 12.67 14.4 11 12 11z"/></svg>', weight: 0, cc: 51, color: '#607D8B', type: 'instrument', basePrompt: 'An opera singer performance', styleSelectors: [
      { label: 'Vocal Range', options: ['Soprano', 'Mezzo-Soprano', 'Contralto', 'Tenor', 'Baritone', 'Bass'], active: 'Soprano' },
      { label: 'Style', options: ['Lyrical', 'Dramatic', 'Coloratura', 'Bel Canto', 'Verismo', 'Wagnerian'], active: 'Lyrical' }
  ]},
  { name: 'Hand Drummer', description: 'A session hand percussionist. Add rhythms from around the world with congas, djembe, tabla, and more.', logo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 3H7L4 9v1h5V9L7 5h2V3m10 0h-2v2h2l-2 4v1h5V9l-3-6zM4 12v8h5v-8H4m11 0v8h5v-8h-5z"/></svg>', weight: 0, cc: 52, color: '#FF5722', type: 'instrument', basePrompt: 'A hand drummer performance', styleSelectors: [
      { label: 'Drum Type', options: ['Full Hand Percussion', 'Congas', 'Bongos', 'Djembe', 'Tabla', 'Cajon', 'Udu', 'Doumbek', 'Bodhrán', 'Frame Drums'], active: 'Full Hand Percussion' },
      { label: 'Regional Style', options: ['Afro-Cuban', 'West African', 'Middle Eastern', 'Indian Classical', 'Brazilian', 'Flamenco', 'Irish Folk', 'Modern Fusion'], active: 'Afro-Cuban' }
  ]},
  { name: 'Freestyle Studio', description: 'Your creative scratchpad. Describe any sound from drums to melodies and the AI will generate it.', logo: '<svg viewBox="0 0 24 24"><path d="M15 11H9v2h4v2H9v2h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2m-6-2V7h6v2M9 3h6a2 2 0 0 1 2 2v2h-2V5H9v14h6v-2h2v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="currentColor"/></svg>', weight: 0, cc: 100, color: '#9b59b6', type: 'freestyle' }
];

const promptsByProducer: { producerName: string, prompts: Omit<Prompt, 'promptId' | 'producerId' | 'color'>[] }[] = [
  { producerName: 'Timbaland', prompts: [
    { text: 'Bouncy, syncopated rhythm', weight: 0, cc: 52, label: 'Rhythm', options: ['Classic Timbaland beat', 'Uptempo dance rhythm', 'Laid-back groovy beat'] },
    { text: 'Exotic world samples', weight: 0, cc: 53, label: 'Sample', options: ['Indian sitar loop', 'Middle Eastern flute', 'African kalimba melody', 'Brazilian percussion sample'] },
    { text: 'Vocal chops and stutters', weight: 0, cc: 54, label: 'Vocal FX', options: ['Rhythmic vocal chop melody', 'Glitchy stutter edits', 'Pitched-up baby laugh sample'] }
  ]},
  { producerName: 'Dr. Dre', prompts: [
    { text: 'G-Funk synth lead', weight: 0, cc: 55, label: 'Lead', options: ['Classic high-pitched synth whine', 'Funky portamento lead', 'Smooth sawtooth lead'] },
    { text: 'Hard-hitting clean drums', weight: 0, cc: 56, label: 'Drums', options: ['Sparse G-Funk beat', 'Heavy kick and snare combo', 'Classic West Coast drum break'] },
    { text: 'Deep piano melody', weight: 0, cc: 57, label: 'Keys', options: ['Minor key piano riff', 'Single note piano melody', 'Cinematic piano chord progression'] }
  ]},
  { producerName: 'The Neptunes', prompts: [
    { text: 'Minimalist quirky percussion', weight: 0, cc: 58, label: 'Percussion', options: ['Woodblocks and cowbells', 'Clav and snap rhythm', 'Electronic bleeps and bloops'] },
    { text: 'Spacey synth chords', weight: 0, cc: 59, label: 'Chords', options: ['Jazzy Rhodes chords', 'Lush Juno synth pads', 'Staccato synth stabs'] },
    { text: 'Driving bassline', weight: 0, cc: 60, label: 'Bass', options: ['Funky synth bass', 'Deep 808 bassline', 'Live electric bass groove'] }
  ]},
  { producerName: 'Scott Storch', prompts: [
    { text: 'Lavish piano riff', weight: 0, cc: 61, label: 'Piano', options: ['Classical-inspired piano melody', 'Catchy pop piano chords', 'Dramatic minor key riff'] },
    { text: 'Middle Eastern strings', weight: 0, cc: 62, label: 'Strings', options: ['Pizzicato string pluck', 'Lush string ensemble', 'Solo violin melody'] },
    { text: 'Heavy 808s', weight: 0, cc: 63, label: '808s', options: ['Classic trap 808 pattern', 'Long decay 808 bassline', 'Distorted 808s'] }
  ]},
  { producerName: 'Kanye West', prompts: [
    { text: 'Soulful vocal sample chop', weight: 0, cc: 64, label: 'Sample', options: ['Pitched-up female vocal hook', 'Gospel choir sample', 'Chopped male soul singer phrase'] },
    { text: 'Orchestral arrangement', weight: 0, cc: 65, label: 'Orchestra', options: ['Epic string section', 'Dramatic brass stabs', 'Full orchestral swell'] },
    { text: 'Distorted synth bass', weight: 0, cc: 66, label: 'Bass', options: ['Aggressive synth bass', 'Fuzzy, warm bass', 'Industrial synth bass'] }
  ]},
  { producerName: '808 Mafia', prompts: [
    { text: 'Dark trap bell melody', weight: 0, cc: 67, label: 'Melody', options: ['Ominous bell pattern', 'Simple plucked melody', 'Haunting music box melody'] },
    { text: 'Rapid-fire hi-hats', weight: 0, cc: 68, label: 'Hi-Hats', options: ['Triplet hi-hat rolls', 'Syncopated 16th note hats', 'Sparse open hi-hats'] },
    { text: 'Booming sub-bass', weight: 0, cc: 69, label: 'Sub-bass', options: ['Long 808 notes', 'Sliding 808 pattern', 'Punchy sub-bass hits'] }
  ]},
  { producerName: 'Quincy Jones', prompts: [
    { text: 'Lush jazz chords', weight: 0, cc: 70, label: 'Chords', options: ['Smooth Rhodes piano chords', 'Big band brass chords', 'Jazzy guitar comping'] },
    { text: 'Funky horn section', weight: 0, cc: 71, label: 'Horns', options: ['Tight horn stabs', 'Soaring trumpet melody', 'Funky saxophone riff'] },
    { text: 'Live string ensemble', weight: 0, cc: 72, label: 'Strings', options: ['Sweeping cinematic strings', 'Disco-style string runs', 'Pizzicato string accents'] }
  ]},
  { producerName: 'Hans Zimmer', prompts: [
    { text: 'Epic, sweeping orchestral swells', weight: 0, cc: 73 },
    { text: 'Driving, powerful percussion', weight: 0, cc: 74 },
    { text: 'Atmospheric, evolving synth textures', weight: 0, cc: 75 }
  ]},
  { producerName: 'Metro Boomin', prompts: [
    { text: 'Ominous, dark synth melody', weight: 0, cc: 76, label: 'Melody', options: ['Ominous, dark synth melody', 'Haunting piano melody', 'Eerie plucked synth arpeggio'] },
    { text: 'Hard-hitting 808 bass', weight: 0, cc: 77, label: '808', options: ['Hard-hitting 808 bass', 'Distorted Spinz 808 pattern', 'Long sliding 808s'] },
    { text: 'Crisp, intricate hi-hat patterns', weight: 0, cc: 78, label: 'Hi-Hats', options: ['Crisp, intricate hi-hat patterns', 'Fast-paced triplet hi-hat rolls', 'Sparse, off-beat hi-hats'] }
  ]},
  { producerName: 'J Dilla', prompts: [
    { text: 'Off-kilter, unquantized drums', weight: 0, cc: 79, label: 'Drums', options: ['Off-kilter, unquantized drums', 'Swung MPC drum groove', 'Laid-back, behind-the-beat drums'] },
    { text: 'Warm, dusty soul sample chops', weight: 0, cc: 80, label: 'Sample', options: ['Warm, dusty soul sample chops', 'Filtered Rhodes piano sample', 'Obscure vocal chop melody'] },
    { text: 'Thick, walking bassline', weight: 0, cc: 81, label: 'Bass', options: ['Thick, walking bassline', 'Live groovy electric bass', 'Mellow Moog bassline'] }
  ]},
  { producerName: 'Teddy Riley', prompts: [
    { text: 'Classic new jack swing rhythm', weight: 0, cc: 82, label: 'Rhythm', options: ['Classic new jack swing rhythm', 'Uptempo swing beat with heavy snare', 'Gated reverb drum machine beat'] },
    { text: 'Punchy brass stabs and hits', weight: 0, cc: 83, label: 'Brass', options: ['Punchy brass stabs and hits', 'Synth brass melody', 'Funky horn section riff'] },
    { text: 'Upbeat, funky synth bass', weight: 0, cc: 84, label: 'Bass', options: ['Upbeat, funky synth bass', 'Classic FM synth bassline', 'Slap bass style synth'] }
  ]},
  { producerName: 'Darkchild', prompts: [
    { text: 'Futuristic, staccato synth stabs', weight: 0, cc: 85, label: 'Synths', options: ['Plucky synth melody', 'Filtered synth chord stabs', 'Arpeggiated synth line'] },
    { text: 'Complex, syncopated drum programming', weight: 0, cc: 86, label: 'Drums', options: ['Busy, syncopated hi-hats', 'Hard-hitting snare on upbeats', 'Sparse, impactful kick pattern'] },
    { text: 'Layered vocal harmonies and ad-libs', weight: 0, cc: 87, label: 'Vocals', options: ['Chopped vocal melody', 'Lush background harmonies', 'Rhythmic ad-lib track'] }
  ]},
  { producerName: 'DJ Quik', prompts: [
    { text: 'Smooth, melodic G-funk groove', weight: 0, cc: 88, label: 'Groove', options: ['Smooth, melodic G-funk groove', 'Laid-back West Coast beat', 'Driving party groove'] },
    { text: 'Live-sounding, funky bassline', weight: 0, cc: 89, label: 'Bass', options: ['Live-sounding, funky bassline', 'Moog-style synth bass', 'Slap electric bass'] },
    { text: 'Classic talkbox vocal melody', weight: 0, cc: 90, label: 'Talkbox', options: ['Classic talkbox vocal melody', 'Melodic talkbox harmony', 'Funky talkbox lead'] }
  ]},
  { producerName: 'Questlove', prompts: [
    { text: 'Live in-the-pocket hip-hop drums', weight: 0, cc: 91, label: 'Drums', options: ['Live in-the-pocket hip-hop drums', 'Deep, heavy kick and snare groove', 'Ghost-note heavy funk beat'] },
    { text: 'Earthy neo-soul groove', weight: 0, cc: 92, label: 'Groove', options: ['Earthy neo-soul groove', 'Jazzy Rhodes chord progression', 'Live band feel'] },
    { text: 'Layered, textured percussion', weight: 0, cc: 93, label: 'Percussion', options: ['Layered, textured percussion', 'Shakers and tambourine accents', 'Congas and bongos'] }
  ]},
  { producerName: 'Zaytoven', prompts: [
    { text: 'Signature gospel-influenced piano chords', weight: 0, cc: 94, label: 'Piano', options: ['Signature gospel-influenced piano chords', 'Simple, catchy piano melody', 'Church organ chords'] },
    { text: 'Bouncy, syncopated 808 patterns', weight: 0, cc: 95, label: '808s', options: ['Bouncy, syncopated 808 patterns', 'Fast-paced trap 808s', 'Minimal 808 rhythm'] },
    { text: 'Simple, catchy flute or bell melody', weight: 0, cc: 96, label: 'Melody', options: ['Simple, catchy flute melody', 'Bright bell melody', 'Ethereal synth pad melody'] }
  ]},
  { producerName: 'Mustard', prompts: [
    { text: 'Minimalistic, catchy synth melody', weight: 0, cc: 97, label: 'Melody', options: ['Minimalistic, catchy synth melody', 'Simple plucked synth line', 'Low-pitched synth lead'] },
    { text: 'Signature "Hey!" vocal chant', weight: 0, cc: 98, label: 'Chant', options: ['Signature "Hey!" vocal chant', 'Club-style vocal ad-libs', 'Repetitive vocal hook'] },
    { text: 'Deep, bouncy 808 bassline', weight: 0, cc: 99, label: 'Bass', options: ['Deep, bouncy 808 bassline', 'Simple two-note 808 pattern', 'Heavy sub-bass'] }
  ]},
  { producerName: 'Jimi Hendrix', prompts: [
    { text: 'Psychedelic, blues-infused electric guitar', weight: 0, cc: 100, label: 'Guitar', options: ['Psychedelic, blues-infused electric guitar', 'Fuzz-heavy guitar riff', 'Clean, melodic blues lick'] },
    { text: 'Innovative use of feedback and wah effects', weight: 0, cc: 101, label: 'Effects', options: ['Innovative use of feedback and wah effects', 'Heavy wah-wah pedal solo', 'Sustained guitar feedback drone'] },
    { text: 'Grooving, soulful drum and bass foundation', weight: 0, cc: 102, label: 'Rhythm', options: ['Grooving, soulful drum and bass foundation', 'Live, loose funk drum beat', 'Driving rock rhythm'] }
  ]},
  { producerName: 'Michael Hampton', prompts: [
    { text: 'Heavy, distorted funk-rock guitar solos', weight: 0, cc: 103, label: 'Guitar', options: ['Heavy, distorted funk-rock guitar solos', 'Screaming wah-wah lead', 'Psychedelic phaser guitar'] },
    { text: 'Driving, syncopated P-Funk groove', weight: 0, cc: 104, label: 'Groove', options: ['Driving, syncopated P-Funk groove', 'Heavy slap bassline', 'Tight horn section stabs'] },
    { text: 'Layered with psychedelic synth and clavinet', weight: 0, cc: 105, label: 'Keys', options: ['Layered with psychedelic synth and clavinet', 'Funky clavinet riff', 'Spacey synth pads'] }
  ]},
  { producerName: 'Cornell Dupree', prompts: [
    { text: 'Clean, melodic R&B guitar fills', weight: 0, cc: 106, label: 'Guitar Fills', options: ['Clean, melodic R&B guitar fills', 'Double-stop guitar licks', 'Smooth chord-melody playing'] },
    { text: 'Grooving soul and blues rhythm guitar', weight: 0, cc: 107, label: 'Rhythm Guitar', options: ['Grooving soul and blues rhythm guitar', 'Funky 16th-note strumming', 'Simple blues chord progression'] },
    { text: 'Smooth, tasteful jazz fusion licks', weight: 0, cc: 108, label: 'Lead Licks', options: ['Smooth, tasteful jazz fusion licks', 'Octave-style guitar melody', 'Bebop-influenced lines'] }
  ]},
  { producerName: 'World Percussion', prompts: [
    { text: 'Complex, polyrhythmic rock drum fills', weight: 0, cc: 109, label: 'Rock Drums', options: ['Complex, polyrhythmic rock drum fills', 'Heavy progressive rock drumming', 'Powerful fusion drum solo'] },
    { text: 'Swinging, virtuosic jazz drumming', weight: 0, cc: 110, label: 'Jazz Drums', options: ['Swinging, virtuosic jazz drumming', 'Fast bebop ride cymbal pattern', 'Brush-based ballad drumming'] },
    { text: 'Eclectic Brazilian and world percussion', weight: 0, cc: 111, label: 'World Percussion', options: ['Eclectic Brazilian and world percussion', 'Samba batucada rhythm', 'Afro-Cuban conga patterns'] }
  ]},
  { producerName: 'Davido', prompts: [
    { text: 'Upbeat, infectious Afrobeats rhythm', weight: 0, cc: 112, label: 'Rhythm', options: ['Upbeat, infectious Afrobeats rhythm', 'Driving amapiano log drum', 'Classic Afropop beat'] },
    { text: 'Catchy, melodic vocal ad-libs', weight: 0, cc: 113, label: 'Ad-libs', options: ['Catchy, melodic vocal ad-libs', 'Harmonized vocal hooks', 'Energetic call-and-response vocals'] },
    { text: 'Lush, layered synth and log drums', weight: 0, cc: 114, label: 'Instruments', options: ['Lush, layered synth and log drums', 'Bright synth pad chords', 'Deep, percussive log drum melody'] }
  ]},
  { producerName: 'Sarz', prompts: [
    { text: 'Signature "Sarz on the beat" vocal tag', weight: 0, cc: 115, label: 'Vocal Tag', options: ['Signature "Sarz on the beat" vocal tag', 'The "Really?" vocal tag', 'No vocal tag'] },
    { text: 'Minimalist, hard-hitting Afropop beat', weight: 0, cc: 116, label: 'Beat', options: ['Minimalist, hard-hitting Afropop beat', 'Syncopated percussion-heavy rhythm', 'Driving electronic beat'] },
    { text: 'Unique, experimental synth textures', weight: 0, cc: 117, label: 'Synths', options: ['Unique, experimental synth textures', 'Atmospheric synth pads', 'Glitchy, arpeggiated synth line'] }
  ]},
  { producerName: 'Afrobeats', prompts: [
    { text: 'Driving log drum patterns', weight: 0, cc: 118, label: 'Log Drum', options: ['Driving log drum patterns', 'Melodic amapiano log drum', 'Deep sub-bass log drum'] },
    { text: 'Lush, atmospheric synth pads', weight: 0, cc: 119, label: 'Pads', options: ['Lush, atmospheric synth pads', 'Bright, rhythmic synth chords', 'Evolving ambient pads'] },
    { text: 'Catchy, melodic vocal ad-libs', weight: 0, cc: 120, label: 'Vocals', options: ['Catchy, melodic vocal ad-libs', 'Repetitive vocal chant', 'Harmonized vocal chops'] }
  ]},
  { producerName: 'Sean John Combs', prompts: [
    { text: 'Flashy funk and soul samples', weight: 0, cc: 121, label: 'Sample', options: ['Flashy funk and soul samples', 'Big disco string sample', '70s soul vocal hook'] },
    { text: 'Polished, radio-friendly production', weight: 0, cc: 122, label: 'Production', options: ['Polished, radio-friendly production', 'Crisp, clean drum sounds', 'Lush, layered instruments'] },
    { text: 'Driving basslines and crisp drums', weight: 0, cc: 123, label: 'Rhythm', options: ['Driving basslines and crisp drums', 'Classic 90s hip-hop beat', 'Funky live bass and drum groove'] }
  ]},
  { producerName: 'Jermaine Dupri', prompts: [
    { text: 'Smooth 90s R&B groove', weight: 0, cc: 124, label: 'Groove', options: ['Smooth 90s R&B groove', 'Slow jam ballad beat', 'Uptempo R&B dance track'] },
    { text: 'Catchy pop-rap crossover beat', weight: 0, cc: 125, label: 'Beat', options: ['Catchy pop-rap crossover beat', 'Bouncy, radio-friendly rhythm', 'Classic Atlanta bass beat'] },
    { text: 'Bouncy basslines and crisp snaps', weight: 0, cc: 126, label: 'Rhythm Elements', options: ['Bouncy basslines and crisp snaps', 'Syncopated synth bass', 'Layered claps and snaps'] }
  ]},
  { producerName: 'Mannie Fresh', prompts: [
    { text: 'Bouncy New Orleans bounce rhythm', weight: 0, cc: 127, label: 'Rhythm', options: ['Bouncy New Orleans bounce rhythm', 'Classic Cash Money beat', 'Triggerman breakbeat pattern'] },
    { text: 'Layered, quirky synth melodies', weight: 0, cc: 128, label: 'Melody', options: ['Layered, quirky synth melodies', 'High-pitched synth leads', 'Video game-inspired synth sounds'] },
    { text: 'Heavy 808 bass and claps', weight: 0, cc: 129, label: 'Bass & Claps', options: ['Heavy 808 bass and claps', 'Boouncing 808 patterns', 'Signature syncopated clap rhythm'] }
  ]},
  { producerName: 'Classic Blues', prompts: [
    { text: '12-bar blues shuffle rhythm', weight: 0, cc: 130, label: 'Rhythm', options: ['12-bar blues shuffle rhythm', 'Slow blues groove', 'Up-tempo boogie-woogie rhythm'] },
    { text: 'Bending, emotional blues guitar solo', weight: 0, cc: 131, label: 'Guitar', options: ['Bending, emotional blues guitar solo', 'Acoustic slide guitar lick', 'Gritty electric blues riff'] },
    { text: 'Raw, heartfelt harmonica melody', weight: 0, cc: 132, label: 'Harmonica', options: ['Raw, heartfelt harmonica melody', 'Train-style harmonica rhythm', 'Wailing harmonica solo'] }
  ]},
  { producerName: 'K-pop', prompts: [
    { text: 'Catchy, polished synth-pop hooks', weight: 0, cc: 133, label: 'Hooks', options: ['Catchy, polished synth-pop hooks', 'Bright, energetic synth lead', 'Bubblegum pop melody'] },
    { text: 'Tight, powerful dance-pop drum beat', weight: 0, cc: 134, label: 'Drums', options: ['Tight, powerful dance-pop drum beat', 'Hard-hitting electronic drums', 'Trap-influenced hi-hat rolls'] },
    { text: 'Layered vocal harmonies and rap sections', weight: 0, cc: 135, label: 'Vocals', options: ['Layered vocal harmonies and rap sections', 'Smooth R&B style vocals', 'Aggressive rap verse'] }
  ]},
  { producerName: 'Tricky Stewart', prompts: [
    { text: 'Catchy, infectious synth riff', weight: 0, cc: 136, label: 'Riff', options: ['Catchy, infectious synth riff', 'Signature "three-note" synth melody', 'Pulsating synth chords'] },
    { text: 'Hard-hitting, polished pop-R&B drums', weight: 0, cc: 137, label: 'Drums', options: ['Hard-hitting, polished pop-R&B drums', 'Heavy, compressed kick and snare', 'Crisp, clean hi-hats'] },
    { text: 'Signature three-note vocal hook', weight: 0, cc: 138, label: 'Vocal Hook', options: ['Signature three-note vocal hook', '"Eh, eh, eh" vocal melody', 'Layered, anthemic vocal chant'] }
  ]},
  { producerName: 'RZA', prompts: [
    { text: 'Gritty, lo-fi soul samples', weight: 0, cc: 139, label: 'Sample', options: ['70s soul chops', 'Obscure funk sample', 'Raw, unfiltered sample'] },
    { text: 'Dusty, unquantized drums', weight: 0, cc: 140, label: 'Drums', options: ['Hard-hitting boom-bap drums', 'Loose, off-kilter groove', 'Raw drum break'] },
    { text: 'Haunting piano melody', weight: 0, cc: 141, label: 'Keys', options: ['Minor key piano loop', 'Dissonant piano chords', 'Simple, repetitive piano line'] }
  ]},
  
  // Single prompts for each instrument
  { producerName: 'Spanish Folk', prompts: [{ text: 'A Spanish Folk music performance Flamenco style', weight: 0, cc: 142 }]},
  { producerName: 'Latin Music', prompts: [{ text: 'A Latin music performance Salsa style', weight: 0, cc: 143 }]},
  { producerName: 'African Music', prompts: [{ text: 'An African music performance Afrobeats style', weight: 0, cc: 144 }]},
  { producerName: 'Asian Music', prompts: [{ text: 'An Asian music performance K-pop style', weight: 0, cc: 145 }]},
  { producerName: 'Indian Music', prompts: [{ text: 'An Indian music performance Bollywood Music style', weight: 0, cc: 146 }]},
  { producerName: '70\'s Disco & Funk', prompts: [{ text: 'A performance 70\'s style', weight: 0, cc: 147 }]},
  { producerName: 'Hip-Hop', prompts: [{ text: 'A hip-hop performance 90\'s West Coast style', weight: 0, cc: 148 }]},
  { producerName: 'Drummer', prompts: [{ text: 'A In the pocket US Funk & Soul drum beat using a Acoustic Kit.', weight: 0, cc: 149 }]},
  { producerName: 'Violin', prompts: [{ text: 'A violin performance Cinematic style', weight: 0, cc: 150 }]},
  { producerName: 'Viola', prompts: [{ text: 'A viola performance Cinematic style', weight: 0, cc: 151 }]},
  { producerName: 'Cello', prompts: [{ text: 'A cello performance Cinematic style', weight: 0, cc: 152 }]},
  { producerName: 'Double Bass', prompts: [{ text: 'A double bass performance Cinematic style', weight: 0, cc: 153 }]},
  { producerName: 'Brass Section', prompts: [{ text: 'A brass section performance Cinematic style', weight: 0, cc: 154 }]},
  { producerName: 'Marching Band', prompts: [{ text: 'A marching band performance 80\'s style', weight: 0, cc: 155 }]},
  { producerName: 'SYNTH', prompts: [{ text: 'An 80\'s Any Synth performance', weight: 0, cc: 156 }]},
  { producerName: 'PiANO', prompts: [{ text: 'A Modern Pop Ballad Chordal performance on a Grand Piano', weight: 0, cc: 157 }]},
  { producerName: 'Guitars', prompts: [{ text: 'A Modern Pop Rhythm Chords performance on a Electric Guitar (Clean)', weight: 0, cc: 158 }]},
  { producerName: 'Orchestra Percussion', prompts: [{ text: 'An orchestral percussion performance featuring the Full Percussion Section', weight: 0, cc: 159 }]},
  { producerName: 'Wind', prompts: [{ text: 'A Cinematic performance on Western Concert Flute', weight: 0, cc: 160 }]},
  { producerName: 'The Mellotron', prompts: [{ text: 'A performance on a 1970 (M400) Mellotron', weight: 0, cc: 161 }]},
  { producerName: 'Opera Singer', prompts: [{ text: 'An opera performance by a Soprano in a Lyrical style.', weight: 0, cc: 162 }]},
  { producerName: 'Hand Drummer', prompts: [{ text: 'An Afro-Cuban performance by a full hand percussion ensemble.', weight: 0, cc: 163 }]},

  // Freestyle Studio Prompts
  { producerName: 'Freestyle Studio', prompts: [
    { text: 'Freestyle: Drums & Percussion', weight: 0, cc: 164 },
    { text: 'Freestyle: Bassline', weight: 0, cc: 165 },
    { text: 'Freestyle: Chords & Harmony', weight: 0, cc: 166 },
    { text: 'Freestyle: Main Melody', weight: 0, cc: 167 },
    { text: 'Freestyle: Pads & Atmosphere', weight: 0, cc: 168 },
    { text: 'Freestyle: Sound FX', weight: 0, cc: 169 }
  ]},
];

let producerIdCounter = 1;
let promptIdCounter = 1;

export const ALL_PRODUCERS: Producer[] = producers.map(p => {
  const producerId = `producer-${producerIdCounter++}`;
  return {
    ...p,
    producerId,
    promptIds: [], // Will be populated next
  };
});

export const ALL_PROMPTS: Prompt[] = [];

promptsByProducer.forEach(({ producerName, prompts }) => {
  const producer = ALL_PRODUCERS.find(p => p.name === producerName);
  if (producer) {
    prompts.forEach(p => {
      const promptId = `prompt-${promptIdCounter++}`;
      producer.promptIds.push(promptId);
      ALL_PROMPTS.push({
        ...p,
        promptId,
        producerId: producer.producerId,
        color: producer.color,
      });
    });
  }
});

export const PRESET_STYLES: PresetStyle[] = [
    { name: "90's West Coast G-Funk", prompt: "A 90's West Coast G-Funk beat" },
    { name: 'Modern Trap Banger', prompt: 'A modern trap banger' },
    { name: 'Cinematic Orchestral Score', prompt: 'A cinematic orchestral score' },
    { name: 'Soulful R&B Groove', prompt: 'A soulful R&B groove' },
    { name: 'Funky Disco Party', prompt: 'A funky disco party track' },
    { name: 'Lo-fi Chill Hop', prompt: 'A lo-fi chill hop beat' },
    { name: 'Afrobeats & Amapiano Fusion', prompt: 'An Afrobeats and Amapiano fusion track' },
    { name: 'Bollywood Wedding Anthem', prompt: 'A Bollywood wedding anthem' },
    { name: 'Spicy Reggaeton Club Banger', prompt: 'A spicy reggaeton club banger' },
    { name: 'K-Pop Power Ballad', prompt: 'A K-Pop power ballad' },
    { name: 'Gritty Blues Rock Jam', prompt: 'A gritty blues rock jam' },
    { name: 'J-Pop Anime Opening', prompt: 'A J-Pop anime opening theme' },
    { name: 'Japanese City Pop', prompt: 'An 80s Japanese City Pop track with a smooth bassline and funky chords' },
    { name: '80s Synthwave', prompt: 'An 80s synthwave track with gated reverb drums and a driving arpeggiated bass' },
    { name: 'Classic Boom Bap', prompt: 'A classic 90s East Coast boom bap beat with a dusty soul sample' },
    { name: 'UK Drill Beat', prompt: 'A modern UK drill beat with sliding 808s and a dark piano melody' },
    { name: 'House Music Anthem', prompt: 'An uplifting house music anthem with a four-on-the-floor kick and soulful vocals' },
    { name: 'Ambient Downtempo', prompt: 'A chill, ambient downtempo track with atmospheric pads and a slow, simple beat' },
    { name: 'Indie Rock Ballad', prompt: 'An emotional indie rock ballad with clean electric guitars and a simple drum beat' },
    { name: 'Gospel Praise Break', prompt: 'An energetic gospel praise break with a fast tempo, organ, and live drums' }
];