export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.enabled = true;
        this.volume = 0.5;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
            this.masterGain = audioContext.createGain();
            this.masterGain.connect(audioContext.destination);
            this.masterGain.gain.value = this.volume;
        } catch (e) {
            console.warn('AudioContext not supported');
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext || !this.enabled) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        filter.type = 'highpass';
        filter.frequency.value = 100;

        if (type === 'break') {
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'place') {
            osc.frequency.setValueAtTime(700, now);
            osc.frequency.exponentialRampToValueAtTime(250, now + 0.1);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }

    playJumpSound() {
        if (!this.audioContext || !this.enabled) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;

        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc1.frequency.setValueAtTime(350, now);
        osc1.frequency.exponentialRampToValueAtTime(550, now + 0.08);

        osc2.frequency.setValueAtTime(200, now);
        osc2.frequency.exponentialRampToValueAtTime(350, now + 0.08);

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.08);
        osc2.stop(now + 0.08);
    }

    playStepSound() {
        if (!this.audioContext || !this.enabled) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        filter.type = 'lowpass';
        filter.frequency.value = 150;

        osc.frequency.setValueAtTime(150 + Math.random() * 80, now);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.masterGain) {
            this.masterGain.gain.value = this.enabled ? this.volume : 0;
        }
    }
}
