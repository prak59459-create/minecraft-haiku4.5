export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.sounds = {};
        this.masterVolume = 0.5;
    }

    init() {
        if (this.initialized) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
            this.initialized = true;
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playBlockBreak() {
        if (!this.audioContext) return;
        this.playTone(200, 50);
    }

    playBlockPlace() {
        if (!this.audioContext) return;
        this.playTone(400, 80);
    }

    playStep() {
        if (!this.audioContext) return;
        this.playTone(100, 30);
    }

    playJump() {
        if (!this.audioContext) return;
        this.playTone(500, 100);
    }

    playTone(frequency, duration) {
        try {
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.value = frequency;
            gain.gain.setValueAtTime(0.1 * this.masterVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

            osc.start(now);
            osc.stop(now + duration / 1000);
        } catch (e) {
            // Silently fail if audio is not available
        }
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}
