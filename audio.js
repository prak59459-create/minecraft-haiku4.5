export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.masterVolume = 0.5;
        this.lastSoundTime = 0;
        this.minSoundInterval = 20;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
            this.initialized = true;
        } catch (e) {
            console.warn('AudioContext not supported:', e);
        }
    }

    playBlockSound(type = 'break', blockType = 0) {
        if (!this.audioContext || !this.initialized) return;

        const now = Date.now();
        if (now - this.lastSoundTime < this.minSoundInterval) return;
        this.lastSoundTime = now;

        const audioContext = this.audioContext;
        const currentTime = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const variation = 0.9 + Math.random() * 0.2;

        if (type === 'break') {
            const baseFreq = 300 + blockType * 20;
            osc.frequency.setValueAtTime(baseFreq * variation, currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2 * this.masterVolume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
            osc.start(currentTime);
            osc.stop(currentTime + 0.1);
        } else if (type === 'place') {
            const baseFreq = 500 + blockType * 15;
            osc.frequency.setValueAtTime(baseFreq * variation, currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, currentTime + 0.08);
            gainNode.gain.setValueAtTime(0.15 * this.masterVolume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.08);
            osc.start(currentTime);
            osc.stop(currentTime + 0.08);
        }
    }

    playJumpSound() {
        if (!this.audioContext || !this.initialized) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
        gainNode.gain.setValueAtTime(0.1 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playStepSound() {
        if (!this.audioContext || !this.initialized) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.frequency.setValueAtTime(200 + Math.random() * 100, now);
        gainNode.gain.setValueAtTime(0.05 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}
