export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playBlockBreak() {
        this.playSound(200, 0.1);
        this.playSound(150, 0.15, 'square');
    }

    playBlockPlace() {
        this.playSound(400, 0.05);
        this.playSound(500, 0.08);
    }

    playJump() {
        this.playSound(300, 0.1);
    }

    playFootstep() {
        this.playSound(150, 0.05);
    }
}
