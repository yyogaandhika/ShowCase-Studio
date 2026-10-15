import { AudioConfig, AudioPresetId } from '../types';

export class AudioSynthesizer {
  private static instance: AudioSynthesizer | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;
  private currentPreset: AudioPresetId = 'cyber_pulse';
  private timerId: number | null = null;
  private step = 0;
  private bpm = 124;
  private customAudio: HTMLAudioElement | null = null;

  private constructor() {
    // Singleton
  }

  public static getInstance(): AudioSynthesizer {
    if (!AudioSynthesizer.instance) {
      AudioSynthesizer.instance = new AudioSynthesizer();
    }
    return AudioSynthesizer.instance;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setConfig(config: AudioConfig) {
    this.initContext();
    if (!this.masterGain || !this.ctx) return;

    this.currentPreset = config.preset;

    // Volume & Mute
    const targetGain = config.isMuted || !config.enabled || config.preset === 'none' ? 0 : config.volume;
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);

    // Custom Audio handling
    if (config.preset === 'custom' && config.customAudioUrl) {
      if (!this.customAudio || this.customAudio.src !== config.customAudioUrl) {
        if (this.customAudio) {
          this.customAudio.pause();
        }
        this.customAudio = new Audio(config.customAudioUrl);
        this.customAudio.loop = true;
      }
      this.customAudio.volume = config.isMuted || !config.enabled ? 0 : config.volume;
    }
  }

  public play(preset: AudioPresetId = this.currentPreset, config?: AudioConfig) {
    this.initContext();
    if (!this.ctx) return;
    this.isRunning = true;
    this.currentPreset = preset;

    if (config) {
      this.setConfig(config);
    }

    if (this.currentPreset === 'custom' && this.customAudio) {
      this.customAudio.play().catch(() => {});
      return;
    }

    if (this.currentPreset === 'none') {
      return;
    }

    // Determine BPM based on preset
    switch (preset) {
      case 'lofi_ambient':
        this.bpm = 84;
        break;
      case 'cyber_pulse':
        this.bpm = 128;
        break;
      case 'uplifting_saas':
        this.bpm = 120;
        break;
      default:
        this.bpm = 124;
    }

    this.scheduleNextBeat();
  }

  public pause() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public seek(normalizedTime: number, totalDurationSec: number) {
    if (this.customAudio && this.customAudio.duration) {
      this.customAudio.currentTime = (normalizedTime * totalDurationSec) % this.customAudio.duration;
    }
    // Calculate 16th note step based on time
    const beatsPerSecond = this.bpm / 60;
    const totalStepsInLoop = Math.floor(normalizedTime * totalDurationSec * beatsPerSecond * 4);
    this.step = totalStepsInLoop % 32;
  }

  private scheduleNextBeat() {
    if (!this.isRunning || !this.ctx || this.currentPreset === 'none') return;

    const secondsPer16th = 60 / this.bpm / 4;
    const now = this.ctx.currentTime;

    this.playStep(this.step, now);

    this.step = (this.step + 1) % 32;

    this.timerId = window.setTimeout(() => {
      this.scheduleNextBeat();
    }, secondsPer16th * 1000);
  }

  private playStep(step: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    switch (this.currentPreset) {
      case 'cyber_pulse':
        this.playCyberPulse(step, time);
        break;
      case 'lofi_ambient':
        this.playLofiAmbient(step, time);
        break;
      case 'minimal_tech':
        this.playMinimalTech(step, time);
        break;
      case 'uplifting_saas':
        this.playUpliftingSaas(step, time);
        break;
    }
  }

  // Preset 1: Cyber Pulse (Punchy Sub Kick, Snappy Synth Chords, Hi-hats)
  private playCyberPulse(step: number, time: number) {
    // Kick on 0, 4, 8, 12, 16, 20, 24, 28 (every 4 16ths = quarter note)
    if (step % 4 === 0) {
      this.triggerKick(time, 140, 45, 0.28, 0.6);
    }

    // Crisp closed hi-hat on every offbeat 16th (2, 6, 10, 14, etc)
    if (step % 2 === 1) {
      this.triggerHiHat(time, 0.04, 0.2);
    }

    // Snare / Clap on beat 2 and 4 (steps 4, 12, 20, 28)
    if (step % 8 === 4) {
      this.triggerSnare(time, 0.15, 0.35);
    }

    // Melodic Synth Chords (A minor -> F -> C -> G)
    const chordPattern = [
      [220.0, 261.63, 329.63], // Am (A3, C4, E4)
      [174.61, 220.0, 261.63],  // F (F3, A3, C4)
      [261.63, 329.63, 392.0],  // C (C4, E4, G4)
      [196.0, 246.94, 293.66],  // G (G3, B3, D4)
    ];
    const chordIndex = Math.floor(step / 8);
    const chord = chordPattern[chordIndex];

    if (step % 4 === 0 || step % 4 === 3) {
      chord.forEach((freq, idx) => {
        this.triggerSynthLead(time, freq, 0.25, 'sawtooth', 0.12 / (idx + 1));
      });
    }

    // Rolling bass note
    if (step % 2 === 0) {
      const root = chord[0] / 2;
      this.triggerBass(time, root, 0.15, 'sawtooth', 0.25);
    }
  }

  // Preset 2: Lo-Fi Ambient (Warm chords, soft beat, relaxed vinyl groove)
  private playLofiAmbient(step: number, time: number) {
    // Soft muted kick on 0, 10, 16, 26
    if (step === 0 || step === 10 || step === 16 || step === 26) {
      this.triggerKick(time, 90, 40, 0.35, 0.4);
    }

    // Soft rim click on 8, 24
    if (step === 8 || step === 24) {
      this.triggerSnare(time, 0.08, 0.2);
    }

    // Subtle brushed hat on every 2 steps
    if (step % 2 === 0) {
      this.triggerHiHat(time, 0.03, 0.1);
    }

    // Dreamy 7th chords: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
    const lofiChords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
    ];
    const chordIndex = Math.floor(step / 8);
    const chord = lofiChords[chordIndex];

    if (step % 8 === 0) {
      chord.forEach((freq) => {
        this.triggerSynthLead(time, freq, 1.2, 'triangle', 0.08);
      });
    }
  }

  // Preset 3: Minimal Tech (124 BPM, rolling sub, sharp percussion)
  private playMinimalTech(step: number, time: number) {
    // 4-on-the-floor kick
    if (step % 4 === 0) {
      this.triggerKick(time, 150, 42, 0.22, 0.65);
    }
    // Open hat on offbeat 16ths
    if (step % 4 === 2) {
      this.triggerHiHat(time, 0.12, 0.22);
    }
    // Sub bass syncopation
    if (step % 4 === 2 || step % 4 === 3) {
      const subFreq = step < 16 ? 55.0 : 49.0;
      this.triggerBass(time, subFreq, 0.2, 'sine', 0.4);
    }
    // Tech perc stab
    if (step === 14 || step === 30) {
      this.triggerSynthLead(time, 440, 0.08, 'square', 0.15);
    }
  }

  // Preset 4: Uplifting SaaS (Crystal chimes, optimistic progression)
  private playUpliftingSaas(step: number, time: number) {
    // Energetic driving kick
    if (step % 4 === 0) {
      this.triggerKick(time, 130, 50, 0.25, 0.5);
    }
    // Snare clap on 4, 12, 20, 28
    if (step % 8 === 4) {
      this.triggerSnare(time, 0.14, 0.3);
    }
    // Arpeggiator notes
    const arpHex = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 392.0];
    const note = arpHex[step % arpHex.length];
    this.triggerSynthLead(time, note, 0.12, 'sine', 0.18);
  }

  // --- Sound Generators ---

  private triggerKick(time: number, startFreq: number, endFreq: number, duration: number, volume: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerSnare(time: number, duration: number, volume: number) {
    if (!this.ctx || !this.masterGain) return;
    // Tone body
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + duration);
    oscGain.gain.setValueAtTime(volume * 0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration);

    // Noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(volume, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  private triggerHiHat(time: number, duration: number, volume: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 8500;
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + duration);
  }

  private triggerSynthLead(
    time: number,
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, time);
    filter.frequency.exponentialRampToValueAtTime(600, time + duration);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private triggerBass(
    time: number,
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }
}
