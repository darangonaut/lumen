import type { GameEvent } from '@/game/game';

/** Pentatonika (D dur) pre hracie strojčeky a zvonenie svetlušiek. */
const SCALE = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25, 739.99, 880, 987.77];

/** Syntetizované zvuky a tichá hudba (Web Audio, bez súborov). */
export class Sound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private echo: DelayNode | null = null;
  private muted = false;
  private musicTimer = 0;
  private chime = 0;
  private chimeTime = 0;
  private padNodes: AudioNode[] = [];

  start(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.6;
    this.master.connect(ctx.destination);
    // Ozvena pre hudbu a zvonenie.
    this.echo = ctx.createDelay(1);
    this.echo.delayTime.value = 0.38;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.35;
    const wet = ctx.createGain();
    wet.gain.value = 0.4;
    this.echo.connect(feedback).connect(this.echo);
    this.echo.connect(wet).connect(this.master);
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.5;
    this.musicBus.connect(this.master);
    this.musicBus.connect(this.echo);
    this.startPad();
  }

  suspend(): void {
    void this.ctx?.suspend();
  }

  resume(): void {
    void this.ctx?.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx)
      this.master.gain.setTargetAtTime(muted ? 0 : 0.6, this.ctx.currentTime, 0.05);
  }

  get isMuted(): boolean {
    return this.muted;
  }

  /** Tichý pad a vietor v pozadí. */
  private startPad(): void {
    const ctx = this.ctx!;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    const gain = ctx.createGain();
    gain.gain.value = 0.05;
    filter.connect(gain).connect(this.musicBus!);
    for (const f of [73.42, 110, 146.83, 147.6]) {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(filter);
      o.start();
      this.padNodes.push(o);
    }
    // Vietor: filtrovaný šum s pomalým kolísaním.
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(2);
    noise.loop = true;
    const wind = ctx.createBiquadFilter();
    wind.type = 'bandpass';
    wind.frequency.value = 500;
    wind.Q.value = 0.6;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.025;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(wind.frequency);
    noise.connect(wind).connect(windGain).connect(this.master!);
    noise.start();
    lfo.start();
    this.padNodes.push(noise, lfo);
  }

  /** Hrací strojček: náhodné tóny pentatoniky (volať každý snímok). */
  update(dt: number, tension: number): void {
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.musicTimer -= dt;
    this.chimeTime -= dt;
    if (this.chimeTime <= 0) this.chime = 0;
    if (this.musicTimer > 0) return;
    this.musicTimer = (tension > 0.5 ? 0.35 : 0.7) + Math.random() * 0.8;
    const note = SCALE[Math.floor(Math.random() * 7)]!;
    this.tone(note * (tension > 0.5 ? 0.5 : 1), 'sine', 0.06, 1.6, this.musicBus!);
    if (Math.random() < 0.3) this.tone(note * 1.5, 'sine', 0.03, 1.2, this.musicBus!, 0.12);
  }

  play(events: GameEvent[]): void {
    if (!this.ctx) return;
    for (const e of events) {
      switch (e.type) {
        case 'jump':
          this.sweep(320, 620, 'square', 0.05, 0.1);
          break;
        case 'land':
          this.noise(0.06, 400, 0.08);
          break;
        case 'firefly': {
          // Stúpajúce zvonenie pri zbieraní za sebou.
          const note = SCALE[Math.min(SCALE.length - 1, this.chime)]!;
          this.chime++;
          this.chimeTime = 1.2;
          this.tone(note * 2, 'sine', 0.12, 0.6, this.echo ?? this.master!);
          this.tone(note * 2, 'sine', 0.1, 0.4);
          break;
        }
        case 'crystal':
          [0, 2, 4, 7].forEach((n, i) =>
            this.tone(SCALE[n]! * 2, 'triangle', 0.1, 0.8, this.master!, i * 0.08),
          );
          break;
        case 'lantern':
          this.noise(0.5, 1200, 0.12, 'bandpass');
          [0, 2, 4].forEach((n, i) =>
            this.tone(SCALE[n]!, 'triangle', 0.09, 1.5, this.master!, 0.1 + i * 0.1),
          );
          break;
        case 'flare':
          this.noise(0.45, 900, 0.18, 'bandpass');
          this.sweep(90, 180, 'sawtooth', 0.06, 0.4);
          break;
        case 'lunge':
          this.noise(0.35, 2500, 0.06, 'highpass');
          break;
        case 'hurt':
          this.sweep(300, 90, 'sawtooth', 0.12, 0.3);
          break;
        case 'shadeDie':
          this.sweep(700, 120, 'triangle', 0.1, 0.5);
          this.noise(0.4, 3000, 0.06, 'highpass');
          break;
        case 'died':
          this.sweep(440, 60, 'triangle', 0.14, 1);
          break;
        case 'respawn':
          this.tone(SCALE[0]!, 'sine', 0.08, 0.6);
          break;
        case 'exit':
          [0, 2, 4, 5, 7, 9].forEach((n, i) =>
            this.tone(SCALE[n]!, 'triangle', 0.1, 1.4, this.master!, i * 0.12),
          );
          this.noise(1.2, 800, 0.1, 'bandpass');
          break;
      }
    }
  }

  private tone(
    freq: number,
    type: OscillatorType,
    volume: number,
    length: number,
    out: AudioNode = this.master!,
    delay = 0,
  ): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + length + 0.05);
  }

  private sweep(
    from: number,
    to: number,
    type: OscillatorType,
    volume: number,
    length: number,
  ): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + length);
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + length + 0.05);
  }

  private noise(
    length: number,
    freq: number,
    volume: number,
    type: BiquadFilterType = 'lowpass',
  ): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(length);
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t);
  }

  private noiseCache = new Map<number, AudioBuffer>();

  private noiseBuffer(length: number): AudioBuffer {
    const cached = this.noiseCache.get(length);
    if (cached) return cached;
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseCache.set(length, buffer);
    return buffer;
  }
}
