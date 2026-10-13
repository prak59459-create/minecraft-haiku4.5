export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.lastSoundTime = {};
        this.initAudioContext();
    }

    initAudioContext() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
    }

    playBlockSound(type = 'break', pitch = 1.0) {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const basePitch = pitch || (0.9 + Math.random() * 0.2);

        if (type === 'break') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(400 * basePitch, now);
            osc.frequency.exponentialRampToValueAtTime(100 * basePitch, now + 0.12);
            gainNode.gain.setValueAtTime(0.18, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1000, now);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'place') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(700 * basePitch, now);
            osc.frequency.exponentialRampToValueAtTime(250 * basePitch, now + 0.1);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
    }

    playJumpSound() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        for (let i = 0; i < 2; i++) {
            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            const startFreq = 250 + i * 150;
            const endFreq = 450 + i * 200;
            const delay = i * 0.02;

            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(startFreq, now + delay);
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + delay + 0.15);
            gainNode.gain.setValueAtTime(0.12 / (i + 1), now + delay);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);

            osc.start(now + delay);
            osc.stop(now + delay + 0.15);
        }
    }

    playStepSound() {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150 + Math.random() * 100, now);
        gainNode.gain.setValueAtTime(0.04, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.start(now);
        osc.stop(now + 0.06);
    }
}
