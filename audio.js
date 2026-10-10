export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.masterVolume = 0.3;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;

        try {
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'break') {
                osc.frequency.setValueAtTime(450 + Math.random() * 100, now);
                osc.frequency.exponentialRampToValueAtTime(80 + Math.random() * 40, now + 0.12);
                gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'place') {
                osc.frequency.setValueAtTime(650 + Math.random() * 100, now);
                osc.frequency.exponentialRampToValueAtTime(220 + Math.random() * 80, now + 0.1);
                gainNode.gain.setValueAtTime(0.15 * this.masterVolume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            }
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    playJumpSound() {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;

        try {
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
            gainNode.gain.setValueAtTime(0.12 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {
            console.warn('Error playing jump sound:', e);
        }
    }

    playStepSound() {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;

        try {
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            osc.frequency.setValueAtTime(180 + Math.random() * 120, now);
            gainNode.gain.setValueAtTime(0.06 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

            osc.start(now);
            osc.stop(now + 0.06);
        } catch (e) {
            console.warn('Error playing step sound:', e);
        }
    }
}
