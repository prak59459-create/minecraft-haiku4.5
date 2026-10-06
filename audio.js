export class AudioManager {
    constructor(enabled = true, masterVolume = 0.5) {
        this.audioContext = null;
        this.initialized = false;
        this.enabled = enabled;
        this.masterVolume = masterVolume;
        this.soundCache = new Map();
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    playBlockSound(type = 'break') {
        if (!this.enabled || !this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const volume = this.masterVolume;

        if (type === 'break') {
            const baseFreq = 300 + Math.random() * 200;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
            gainNode.gain.setValueAtTime(0.2 * volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'place') {
            const baseFreq = 500 + Math.random() * 200;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
            gainNode.gain.setValueAtTime(0.15 * volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }

    playJumpSound() {
        if (!this.enabled || !this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
        gainNode.gain.setValueAtTime(0.1 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}
