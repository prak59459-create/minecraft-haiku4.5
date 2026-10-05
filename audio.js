export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
        this.volume = 0.4;
        this.soundCache = new Map();
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
            this.masterGain = audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(audioContext.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Audio context not available');
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext || !this.initialized) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        filter.type = 'lowpass';
        filter.frequency.value = 800;

        if (type === 'break') {
            const baseFreq = 350 + Math.random() * 100;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + 0.12);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'place') {
            const baseFreq = 550 + Math.random() * 100;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.1);
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }

    playJumpSound() {
        if (!this.audioContext || !this.initialized) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    playStepSound() {
        if (!this.audioContext || !this.initialized) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        filter.type = 'highpass';
        filter.frequency.value = 500;

        osc.frequency.setValueAtTime(180 + Math.random() * 80, now);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    getVolume() {
        return this.volume;
    }
}
