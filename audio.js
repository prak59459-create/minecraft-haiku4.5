export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.initAudioContext();
    }

    initAudioContext() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;

        if (type === 'break') {
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const startFreq = 350 + Math.random() * 100;
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'place') {
            for (let i = 0; i < 2; i++) {
                const osc = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                osc.connect(gainNode);
                gainNode.connect(audioContext.destination);

                const freq = 400 + i * 200;
                osc.frequency.setValueAtTime(freq, now + i * 0.02);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.08 + i * 0.02);
                gainNode.gain.setValueAtTime(0.12, now + i * 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08 + i * 0.02);
                osc.start(now + i * 0.02);
                osc.stop(now + 0.08 + i * 0.02);
            }
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
