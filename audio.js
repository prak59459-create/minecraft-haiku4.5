export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.masterVolume = 0.3;
        this.initAudioContext();
    }

    initAudioContext() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
    }

    createCompressor() {
        if (!this.audioContext) return null;
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        compressor.connect(this.audioContext.destination);
        return compressor;
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const compressor = this.createCompressor();
        const dest = compressor || audioContext.destination;

        osc.connect(gainNode);
        gainNode.connect(dest);

        if (type === 'break') {
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
            gainNode.gain.setValueAtTime(0.15 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'place') {
            osc.frequency.setValueAtTime(700, now);
            osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
            gainNode.gain.setValueAtTime(0.12 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        }
    }

    playJumpSound() {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const compressor = this.createCompressor();
        const dest = compressor || audioContext.destination;

        osc.connect(gainNode);
        gainNode.connect(dest);

        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
        gainNode.gain.setValueAtTime(0.08 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playStepSound() {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const compressor = this.createCompressor();
        const dest = compressor || audioContext.destination;

        osc.connect(gainNode);
        gainNode.connect(dest);

        osc.frequency.setValueAtTime(180 + Math.random() * 80, now);
        gainNode.gain.setValueAtTime(0.03 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.start(now);
        osc.stop(now + 0.06);
    }
}
