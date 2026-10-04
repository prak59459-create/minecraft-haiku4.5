export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.masterVolume = 0.5;
        this.enabled = true;
        this.masterGain = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
            this.masterGain = audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(audioContext.destination);
        } catch (e) {
            console.warn('AudioContext not supported');
        }
    }

    setVolume(vol) {
        this.masterVolume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    toggleMute() {
        this.enabled = !this.enabled;
        if (this.masterGain) {
            this.masterGain.gain.value = this.enabled ? this.masterVolume : 0;
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext || !this.enabled) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        if (type === 'break') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'place') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        }
    }

    playJumpSound() {
        if (!this.audioContext || !this.enabled) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.12);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playStepSound() {
        if (!this.audioContext || !this.enabled) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.frequency.setValueAtTime(180 + Math.random() * 80, now);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0, now + 0.06);

        osc.start(now);
        osc.stop(now + 0.06);
    }
}
