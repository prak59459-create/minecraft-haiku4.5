export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.masterVolume = 0.3;
        this.lastStepTime = 0;
        this.stepSoundInterval = 300;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;
            if (audioContext.state === 'suspended') {
                document.addEventListener('click', () => {
                    audioContext.resume();
                }, { once: true });
            }
        } catch (e) {
            console.warn('AudioContext not available');
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'break') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01 * this.masterVolume, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'place') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
            gainNode.gain.setValueAtTime(0.15 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01 * this.masterVolume, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
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
        gainNode.gain.setValueAtTime(0.1 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01 * this.masterVolume, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playStepSound() {
        if (!this.audioContext) return;

        const now = Date.now();
        if (now - this.lastStepTime < this.stepSoundInterval) return;
        this.lastStepTime = now;

        const audioContext = this.audioContext;
        const time = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.frequency.setValueAtTime(200 + Math.random() * 100, time);
        gainNode.gain.setValueAtTime(0.03 * this.masterVolume, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01 * this.masterVolume, time + 0.05);

        osc.start(time);
        osc.stop(time + 0.05);
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}
