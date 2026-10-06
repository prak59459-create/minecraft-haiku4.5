export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.masterGain = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
            this.masterGain = audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(audioContext.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('Audio context failed to initialize');
        }
    }

    playSound(startFreq, endFreq, duration, gain = 0.2) {
        if (!this.audioContext || !this.initialized) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.type = 'sine';
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        gainNode.gain.setValueAtTime(gain, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }

    playBlockSound(type = 'break') {
        if (type === 'break') {
            this.playSound(400, 100, 0.1, 0.15);
        } else if (type === 'place') {
            this.playSound(600, 200, 0.08, 0.12);
        }
    }

    playJumpSound() {
        this.playSound(300, 500, 0.1, 0.1);
    }

    playStepSound() {
        this.playSound(200 + Math.random() * 100, 150, 0.05, 0.06);
    }
}
