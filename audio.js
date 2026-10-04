class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.3;
    }

    playSound(type, frequency = 440, duration = 0.1, volume = 0.1) {
        try {
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            oscillator.connect(gain);
            gain.connect(this.masterGain);

            const now = this.audioContext.currentTime;

            if (type === 'place') {
                oscillator.frequency.setValueAtTime(440, now);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + duration);
                gain.gain.setValueAtTime(volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                oscillator.start(now);
                oscillator.stop(now + duration);
            } else if (type === 'break') {
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(200, now + duration);
                gain.gain.setValueAtTime(volume * 1.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                oscillator.start(now);
                oscillator.stop(now + duration);
            } else if (type === 'jump') {
                oscillator.frequency.setValueAtTime(300, now);
                oscillator.frequency.exponentialRampToValueAtTime(600, now + duration * 0.5);
                gain.gain.setValueAtTime(volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
                oscillator.start(now);
                oscillator.stop(now + duration);
            }
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    playPlaceSound() {
        this.playSound('place', 440, 0.1, 0.1);
    }

    playBreakSound() {
        this.playSound('break', 800, 0.15, 0.12);
    }

    playJumpSound() {
        this.playSound('jump', 300, 0.08, 0.08);
    }

    setVolume(value) {
        this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
}
