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
        } catch (e) {
            console.warn('Audio context not available:', e);
        }
    }

    playSound(type = 'break') {
        if (!this.audioContext || !this.masterGain) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        const sounds = {
            break: { freq1: 400, freq2: 100, time: 0.1, gain1: 0.2, gain2: 0.01 },
            place: { freq1: 600, freq2: 200, time: 0.08, gain1: 0.15, gain2: 0.01 },
            jump: { freq1: 300, freq2: 500, time: 0.1, gain1: 0.1, gain2: 0.01 },
            step: { freq1: 200, freq2: 100, time: 0.05, gain1: 0.05, gain2: 0.01 }
        };

        const sound = sounds[type] || sounds.break;

        osc.frequency.setValueAtTime(sound.freq1, now);
        osc.frequency.exponentialRampToValueAtTime(sound.freq2, now + sound.time);
        gainNode.gain.setValueAtTime(sound.gain1, now);
        gainNode.gain.exponentialRampToValueAtTime(sound.gain2, now + sound.time);

        osc.start(now);
        osc.stop(now + sound.time);
    }

    playBlockSound(type = 'break') {
        this.playSound(type);
    }

    playJumpSound() {
        this.playSound('jump');
    }

    playStepSound() {
        const baseFreq = 200 + Math.random() * 100;
        if (!this.audioContext || !this.masterGain) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.frequency.setValueAtTime(baseFreq, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }
}
