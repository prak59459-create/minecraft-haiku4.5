export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.initAudioContext();
        this.masterVolume = 0.3;
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
            this.initialized = true;
        } catch (error) {
            console.warn('AudioContext not supported');
            this.initialized = false;
        }
    }

    playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext || this.audioContext.state === 'suspended') return;

        try {
            const audioContext = this.audioContext;
            const now = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();

            osc.type = type;
            osc.frequency.value = frequency;
            filter.type = 'lowpass';
            filter.frequency.value = 5000;

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);

            gainNode.gain.setValueAtTime(volume * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

            osc.start(now);
            osc.stop(now + duration);
        } catch (error) {
            console.warn('Audio playback error:', error);
        }
    }

    playBlockSound(type = 'break') {
        if (!this.initialized) return;

        if (type === 'break') {
            this.playSound(400, 0.12, 'sine', 0.15);
            setTimeout(() => this.playSound(200, 0.08, 'sine', 0.1), 30);
        } else if (type === 'place') {
            this.playSound(600, 0.1, 'sine', 0.12);
            setTimeout(() => this.playSound(450, 0.08, 'sine', 0.08), 40);
        }
    }

    playJumpSound() {
        if (!this.initialized) return;

        this.playSound(300, 0.15, 'sine', 0.12);
        setTimeout(() => this.playSound(500, 0.1, 'sine', 0.08), 50);
    }

    playStepSound() {
        if (!this.initialized) return;

        const freq = 200 + Math.random() * 150;
        this.playSound(freq, 0.06, 'sine', 0.06);
    }
}
