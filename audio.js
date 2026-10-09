export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.masterVolume = 0.3;
        this.soundEnabled = true;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;

            if (audioContext.state === 'suspended') {
                document.addEventListener('click', () => {
                    if (audioContext.state === 'suspended') {
                        audioContext.resume();
                    }
                }, { once: true });
            }
        } catch (error) {
            console.warn('AudioContext not supported:', error);
            this.soundEnabled = false;
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext || !this.soundEnabled) return;

        try {
            const audioContext = this.audioContext;
            const now = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const baseVolume = 0.2 * this.masterVolume;

            if (type === 'break') {
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gainNode.gain.setValueAtTime(baseVolume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'place') {
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                gainNode.gain.setValueAtTime(baseVolume * 0.75, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            }
        } catch (error) {
            console.warn('Audio playback error:', error);
        }
    }

    playJumpSound() {
        if (!this.audioContext || !this.soundEnabled) return;

        try {
            const audioContext = this.audioContext;
            const now = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const baseVolume = 0.15 * this.masterVolume;

            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
            gainNode.gain.setValueAtTime(baseVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);
        } catch (error) {
            console.warn('Jump sound error:', error);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }
}
