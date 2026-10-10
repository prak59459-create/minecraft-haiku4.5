export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.lastBlockSoundTime = 0;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioCtx();
            this.initialized = true;
        } catch (e) {
            console.warn('AudioContext not supported');
            this.audioContext = null;
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        if (now - this.lastBlockSoundTime < 0.05) return;
        this.lastBlockSoundTime = now;

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        if (type === 'break') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'place') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
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

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playStepSound() {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.frequency.setValueAtTime(200 + Math.random() * 100, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }
}
