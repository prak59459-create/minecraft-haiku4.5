export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.masterVolume = 0.5;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioContext = audioContext;

            if (audioContext.state === 'suspended') {
                document.addEventListener('click', () => {
                    if (audioContext.state === 'suspended') {
                        audioContext.resume().catch(e => console.warn('Audio context resume failed', e));
                    }
                }, { once: true });
            }
        } catch (error) {
            console.warn('AudioContext not supported', error);
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext) return;

        try {
            const audioContext = this.audioContext;
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

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
        } catch (error) {
            console.warn('Block sound playback failed', error);
        }
    }

    playJumpSound() {
        if (!this.audioContext) return;

        try {
            const audioContext = this.audioContext;
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

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
        } catch (error) {
            console.warn('Jump sound playback failed', error);
        }
    }

    playStepSound() {
        if (!this.audioContext) return;

        try {
            const audioContext = this.audioContext;
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

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
        } catch (error) {
            console.warn('Step sound playback failed', error);
        }
    }
}
