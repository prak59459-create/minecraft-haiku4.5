export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.masterVolume = 0.5;
        this.lastSoundTime = {};
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
        } catch (e) {
            console.warn('AudioContext not available:', e);
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext) return;

        const now = Date.now();
        const soundKey = `sound_${type}`;
        if (now - (this.lastSoundTime[soundKey] || 0) < 30) return;
        this.lastSoundTime[soundKey] = now;

        try {
            const audioContext = this.audioContext;
            const currentTime = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'break') {
                osc.frequency.setValueAtTime(400, currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2 * this.masterVolume, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
                osc.start(currentTime);
                osc.stop(currentTime + 0.1);
            } else if (type === 'place') {
                osc.frequency.setValueAtTime(600, currentTime);
                osc.frequency.exponentialRampToValueAtTime(200, currentTime + 0.08);
                gainNode.gain.setValueAtTime(0.15 * this.masterVolume, currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.08);
                osc.start(currentTime);
                osc.stop(currentTime + 0.08);
            }
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    playJumpSound() {
        if (!this.audioContext) return;

        try {
            const audioContext = this.audioContext;
            const currentTime = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            osc.frequency.setValueAtTime(300, currentTime);
            osc.frequency.exponentialRampToValueAtTime(500, currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1 * this.masterVolume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);

            osc.start(currentTime);
            osc.stop(currentTime + 0.1);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    playStepSound() {
        if (!this.audioContext) return;

        try {
            const audioContext = this.audioContext;
            const currentTime = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            osc.frequency.setValueAtTime(200 + Math.random() * 100, currentTime);
            gainNode.gain.setValueAtTime(0.05 * this.masterVolume, currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.05);

            osc.start(currentTime);
            osc.stop(currentTime + 0.05);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}
