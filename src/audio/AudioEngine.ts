/**
 * Procedural Web Audio Engine for Somaliland Driving Simulator
 * Generates realistic real-time engine sounds, tire skid, horn, gear shifts,
 * and crash audio without external audio files.
 */

export class AudioEngine {
  private static instance: AudioEngine | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private volume: number = 0.8;

  // Engine audio nodes
  private engineGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineRunning: boolean = false;

  // Horn nodes
  private hornGain: GainNode | null = null;
  private hornOsc1: OscillatorNode | null = null;
  private hornOsc2: OscillatorNode | null = null;
  private isHornPlaying: boolean = false;

  // Skid nodes
  private skidGain: GainNode | null = null;
  private skidSource: AudioBufferSourceNode | null = null;

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.setupEngineSound();
      this.setupHorn();
      this.setupSkidSound();
    } catch {
      // AudioContext may be restricted until user gesture
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && this.enabled) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  private setupEngineSound() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0, now);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(400, now);
    this.engineFilter.Q.setValueAtTime(2.5, now);

    // Primary engine cylinder rumble
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(55, now);

    // Secondary harmonic engine roar
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(110, now);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
    this.engineRunning = true;
  }

  private setupHorn() {
    if (!this.ctx || !this.masterGain) return;
    this.hornGain = this.ctx.createGain();
    this.hornGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.hornGain.connect(this.masterGain);
  }

  private setupSkidSound() {
    if (!this.ctx || !this.masterGain) return;
    try {
      // Create pink noise buffer for tire friction
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.1;
      }

      this.skidSource = this.ctx.createBufferSource();
      this.skidSource.buffer = noiseBuffer;
      this.skidSource.loop = true;

      const skidFilter = this.ctx.createBiquadFilter();
      skidFilter.type = 'bandpass';
      skidFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      skidFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      this.skidGain = this.ctx.createGain();
      this.skidGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.skidSource.connect(skidFilter);
      skidFilter.connect(this.skidGain);
      this.skidGain.connect(this.masterGain);

      this.skidSource.start();
    } catch {
      // ignore
    }
  }

  updateEngine(rpm: number, throttle: number, speedKmH: number) {
    if (!this.ctx || !this.enabled || !this.engineRunning) return;
    const now = this.ctx.currentTime;

    // RPM 800 -> 6500 maps to 45Hz -> 280Hz
    const normalizedRPM = Math.max(0, Math.min(1, (rpm - 800) / (6500 - 800)));
    const baseFreq = 48 + normalizedRPM * 220;

    if (this.engineOsc1 && this.engineOsc2 && this.engineFilter && this.engineGain) {
      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
      this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.05);

      // Low pass opens with throttle
      const filterFreq = 300 + throttle * 1200 + normalizedRPM * 1800;
      this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);

      // Volume increases with throttle and speed
      const targetGain = 0.15 + throttle * 0.25 + Math.min(0.2, (speedKmH / 180) * 0.15);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.05);
    }
  }

  startEngine() {
    this.init();
    this.resume();
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0.2, this.ctx.currentTime, 0.1);
    }
  }

  stopEngine() {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  setHorn(active: boolean) {
    if (!this.ctx || !this.enabled) return;
    this.resume();
    const now = this.ctx.currentTime;

    if (active && !this.isHornPlaying && this.masterGain) {
      this.isHornPlaying = true;
      this.hornOsc1 = this.ctx.createOscillator();
      this.hornOsc2 = this.ctx.createOscillator();
      this.hornGain = this.ctx.createGain();

      this.hornOsc1.type = 'sawtooth';
      this.hornOsc2.type = 'sawtooth';
      this.hornOsc1.frequency.setValueAtTime(440, now); // A4
      this.hornOsc2.frequency.setValueAtTime(554.37, now); // C#5 - European / Toyota horn interval

      this.hornGain.gain.setValueAtTime(0.25, now);

      this.hornOsc1.connect(this.hornGain);
      this.hornOsc2.connect(this.hornGain);
      this.hornGain.connect(this.masterGain);

      this.hornOsc1.start();
      this.hornOsc2.start();
    } else if (!active && this.isHornPlaying) {
      this.isHornPlaying = false;
      if (this.hornGain) {
        this.hornGain.gain.setTargetAtTime(0, now, 0.05);
        setTimeout(() => {
          try {
            this.hornOsc1?.stop();
            this.hornOsc2?.stop();
            this.hornOsc1?.disconnect();
            this.hornOsc2?.disconnect();
          } catch {
            // ignore
          }
        }, 100);
      }
    }
  }

  updateSkid(intensity: number) {
    if (!this.ctx || !this.skidGain || !this.enabled) return;
    const now = this.ctx.currentTime;
    const targetGain = Math.max(0, Math.min(0.4, intensity * 0.4));
    this.skidGain.gain.setTargetAtTime(targetGain, now, 0.05);
  }

  playGearShift() {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playCrash(speedRatio: number) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.3);

    const hitVolume = Math.min(0.5, 0.15 + speedRatio * 0.35);
    gain.gain.setValueAtTime(hitVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  playButtonClick() {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }
}
