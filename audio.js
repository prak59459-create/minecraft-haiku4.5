export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.3;
        this.soundCache = new Map();
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            if (audioContext.state === 'suspended') {
                document.addEventListener('click', () => {
                    audioContext.resume();
                }, { once: true });
            }
            this.audioContext = audioContext;
        } catch (e) {
            console.warn('AudioContext not available:', e);
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext) return;

        try {
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
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'place') {
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                gainNode.gain.setValueAtTime(0.15 * this.masterVolume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            }
        } catch (e) {
            console.warn('Error playing block sound:', e);
        }
    }

    playJumpSound() {
        if (!this.audioContext) return;

        try {
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
        } catch (e) {
            console.warn('Error playing jump sound:', e);
        }
    }

    playStepSound() {
        if (!this.audioContext) return;

        try {
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
        } catch (e) {
            console.warn('Error playing step sound:', e);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}
