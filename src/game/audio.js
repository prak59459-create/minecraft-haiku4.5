export class AudioSystem {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
        this.masterVolume = 0.3;
    }

    playBlockPlace() {
        if (!this.enabled) return;
        this.playTone(400, 0.1, 0.05, 'sine');
        setTimeout(() => this.playTone(500, 0.1, 0.05, 'sine'), 50);
    }

    playBlockBreak() {
        if (!this.enabled) return;
        this.playTone(300, 0.15, 0.05, 'sine');
        setTimeout(() => this.playTone(250, 0.15, 0.05, 'sine'), 60);
    }

    playJump() {
        if (!this.enabled) return;
        this.playTone(523, 0.08, 0.1, 'sine');
    }

    playFootstep() {
        if (!this.enabled) return;
        const freq = 200 + Math.random() * 50;
        this.playTone(freq, 0.05, 0.08, 'sine');
    }

    playTone(frequency, duration, attack, waveform = 'sine') {
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = waveform;
            oscillator.frequency.value = frequency;

            gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + attack);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + attack);
        } catch (e) {
            // Silent fail if audio context is not available
        }
    }

    toggleAudio() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}
