export class AudioManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.masterGain.gain.value = 0.5;
    this.enabled = true;
  }

  playBlockPlace() {
    if (!this.enabled) return;
    this.playTone(440, 0.1, 0.1);
  }

  playBlockBreak() {
    if (!this.enabled) return;
    this.playTone(220, 0.15, 0.05);
  }

  playJump() {
    if (!this.enabled) return;
    this.playTone(330, 0.08, 0.1);
  }

  playTone(frequency, duration, fadeTime) {
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.frequency.value = frequency;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + fadeTime);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  playNoiseEffect(duration = 0.1, frequency = 200) {
    if (!this.enabled) return;

    const now = this.context.currentTime;
    const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();

    filter.type = 'highpass';
    filter.frequency.value = frequency;

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
  }

  setVolume(value) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, value));
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
