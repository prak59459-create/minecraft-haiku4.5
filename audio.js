export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.lastStepTime = 0;
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
            this.playBreakSound(audioContext, now);
        } else if (type === 'place') {
            this.playPlaceSound(audioContext, now);
        }
    }

    playBreakSound(audioContext, now) {
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc1.type = 'sine';
        osc2.type = 'square';

        osc1.frequency.setValueAtTime(400, now);
        osc1.frequency.exponentialRampToValueAtTime(150, now + 0.12);

        osc2.frequency.setValueAtTime(200, now);
        osc2.frequency.exponentialRampToValueAtTime(80, now + 0.12);

        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.12);
        osc2.stop(now + 0.12);
    }

    playPlaceSound(audioContext, now) {
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.frequency.setValueAtTime(600 + Math.random() * 100, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.1);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.005, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playJumpSound() {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;

        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.type = 'triangle';
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.12);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playStepSound() {
        if (!this.audioContext) return;

        const now = Date.now();
        if (now - this.lastStepTime < 100) return;
        this.lastStepTime = now;

        const audioContext = this.audioContext;
        const currentTime = audioContext.currentTime;

        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.type = 'sine';
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const pitch = 150 + Math.random() * 80;
        osc.frequency.setValueAtTime(pitch, currentTime);
        gainNode.gain.setValueAtTime(0.03, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08);

        osc.start(currentTime);
        osc.stop(currentTime + 0.08);
    }
}
