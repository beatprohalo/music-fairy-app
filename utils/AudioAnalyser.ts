/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/** Simple class for getting the current audio level. */
export class AudioAnalyser extends EventTarget {
  readonly node: AnalyserNode;
  private readonly freqData: Uint8Array;
  private rafId: number | null = null;
  
  // --- New Multi-band Beat Detection Properties ---
  private bassHistory: number[] = [];
  private midHistory: number[] = [];
  private highHistory: number[] = [];
  private readonly bandHistorySize = 60; // ~1s of data at 60fps

  // Timestamps for individual band debouncing
  private lastBassPeakTime = 0;
  private lastMidPeakTime = 0;
  private lastHighPeakTime = 0;

  // Master debounce to prevent single events causing multiple triggers
  private lastBeatTime = 0;
  private readonly masterDebounceInterval = 0.05; // 50ms

  // Tunable thresholds for different frequency bands
  private readonly bassPeakThreshold = 1.2;
  private readonly midPeakThreshold = 1.5;
  private readonly highPeakThreshold = 1.8;

  // Minimum interval between peaks for each band to be considered distinct
  private readonly minBassInterval = 60 / 200; // Max BPM of 200 for bass hits
  private readonly minMidInterval = 60 / 400;  // Allow faster snare/clap patterns
  private readonly minHighInterval = 60 / 800; // Allow very fast hi-hat patterns

  // --- BPM Detection Properties (now driven by bass) ---
  private readonly minInterval = 60 / 220; // Max BPM 220
  private readonly maxInterval = 60 / 60;  // Min BPM 60
  private lastBpmPeakTime = 0; // Exclusively for BPM calculation interval
  private bpmHistory: number[] = [];
  private readonly bpmHistorySize = 30;
  private bpm = 0;

  constructor(context: AudioContext) {
    super();
    this.node = context.createAnalyser();
    this.node.smoothingTimeConstant = 0.3; // A little smoothing helps stabilize analysis
    this.node.fftSize = 2048; // Higher resolution for frequency analysis
    this.freqData = new Uint8Array(this.node.frequencyBinCount); // frequencyBinCount will be 1024
    this.loop = this.loop.bind(this);
  }

  /**
   * Calculates the average value of a slice of the frequency data array.
   * @param start The starting index of the slice.
   * @param end The ending index of the slice.
   * @returns The normalized average value (0-1).
   */
  private getBandAverage(start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end; i++) {
        sum += this.freqData[i];
    }
    return (sum / (end - start)) / 255.0;
  }

  private loop() {
    this.rafId = requestAnimationFrame(this.loop);
    this.node.getByteFrequencyData(this.freqData);
    const currentTime = this.node.context.currentTime;

    // --- Band Level Calculation ---
    // Freq per bin = 48000 / 2048 = 23.4Hz
    // Bass (60-250Hz) -> bins 2-10
    const bassLevel = this.getBandAverage(2, 10);
    // Mids (Snare: 1-4kHz) -> bins 42-170
    const midLevel = this.getBandAverage(40, 180);
    // Highs (Hats: 6-12kHz) -> bins 250-550
    const highLevel = this.getBandAverage(250, 550);

    // --- Update Histories ---
    this.bassHistory.push(bassLevel);
    if (this.bassHistory.length > this.bandHistorySize) this.bassHistory.shift();
    
    this.midHistory.push(midLevel);
    if (this.midHistory.length > this.bandHistorySize) this.midHistory.shift();

    this.highHistory.push(highLevel);
    if (this.highHistory.length > this.bandHistorySize) this.highHistory.shift();

    // Wait for histories to fill
    if (this.highHistory.length < this.bandHistorySize) {
        return;
    }

    // --- Peak Detection ---
    const bassAvg = this.bassHistory.reduce((a, b) => a + b, 0) / this.bandHistorySize;
    const midAvg = this.midHistory.reduce((a, b) => a + b, 0) / this.bandHistorySize;
    const highAvg = this.highHistory.reduce((a, b) => a + b, 0) / this.bandHistorySize;

    const isBassPeak = bassLevel > bassAvg * this.bassPeakThreshold && currentTime - this.lastBassPeakTime > this.minBassInterval;
    const isMidPeak = midLevel > midAvg * this.midPeakThreshold && currentTime - this.lastMidPeakTime > this.minMidInterval;
    const isHighPeak = highLevel > highAvg * this.highPeakThreshold && currentTime - this.lastHighPeakTime > this.minHighInterval;

    // --- BPM Calculation (driven by bass peaks) ---
    if (isBassPeak) {
        const interval = currentTime - this.lastBpmPeakTime;
        if (interval > this.minInterval) {
            this.lastBpmPeakTime = currentTime;
            if (interval < this.maxInterval) {
                const currentBpm = 60 / interval;
                this.bpmHistory.push(currentBpm);
                if (this.bpmHistory.length > this.bpmHistorySize) {
                    this.bpmHistory.shift();
                }

                const sortedBpm = [...this.bpmHistory].sort((a, b) => a - b);
                const mid = Math.floor(sortedBpm.length / 2);
                const medianBpm = Math.round(
                    sortedBpm.length % 2 !== 0
                    ? sortedBpm[mid]
                    : (sortedBpm[mid - 1] + sortedBpm[mid]) / 2
                );

                if (this.bpm !== medianBpm) {
                    this.bpm = medianBpm;
                    this.dispatchEvent(new CustomEvent('bpm-changed', { detail: this.bpm }));
                }
            }
        }
    }
    
    // --- Beat Event Dispatch ---
    const hasPeak = isBassPeak || isMidPeak || isHighPeak;
    if (hasPeak && currentTime - this.lastBeatTime > this.masterDebounceInterval) {
        let intensity = 0;
        if (isBassPeak) intensity = Math.max(intensity, bassLevel);
        if (isMidPeak) intensity = Math.max(intensity, midLevel);
        if (isHighPeak) intensity = Math.max(intensity, highLevel);

        this.dispatchEvent(new CustomEvent('beat', { detail: intensity }));
        this.lastBeatTime = currentTime;

        // Update individual peak timers only when a beat is actually fired
        if (isBassPeak) this.lastBassPeakTime = currentTime;
        if (isMidPeak) this.lastMidPeakTime = currentTime;
        if (isHighPeak) this.lastHighPeakTime = currentTime;
    }

    // Dispatch overall audio level for UI knobs
    const overallLevel = this.freqData.reduce((a, b) => a + b, 0) / (this.freqData.length * 255.0);
    this.dispatchEvent(new CustomEvent('audio-level-changed', { detail: overallLevel }));
  }

  private resetBpmDetection() {
    this.bassHistory = [];
    this.midHistory = [];
    this.highHistory = [];
    this.bpmHistory = [];
    this.lastBpmPeakTime = 0;
    this.lastBassPeakTime = 0;
    this.lastMidPeakTime = 0;
    this.lastHighPeakTime = 0;
    this.lastBeatTime = 0;

    if (this.bpm !== 0) {
      this.bpm = 0;
      this.dispatchEvent(new CustomEvent('bpm-changed', { detail: 0 }));
    }
  }

  start() {
    this.resetBpmDetection();
    if (this.node.context.state === 'running') {
        const now = this.node.context.currentTime;
        this.lastBpmPeakTime = now;
        this.lastBeatTime = now;
        this.lastBassPeakTime = now;
        this.lastMidPeakTime = now;
        this.lastHighPeakTime = now;
    }
    if (!this.rafId) {
      this.loop();
    }
  }

  stop() {
    if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
    }
    this.resetBpmDetection();
  }
}
