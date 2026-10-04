export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.soundCache = new Map();
        this.masterGain = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContextClass();
            this.audioContext = audioContext;

            this.masterGain = audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(audioContext.destination);

            document.addEventListener('click', () => {
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
            }, { once: true });
        } catch (e) {
            console.warn('Audio context initialization failed:', e);
        }
    }

    playBlockSound(type = 'break') {
        if (!this.audioContext || !this.masterGain) return;

        try {
            const audioContext = this.audioContext;
            const now = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            if (type === 'break') {
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'place') {
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                gainNode.gain.setValueAtTime(0.15, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            }
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    playJumpSound() {
        if (!this.audioContext || !this.masterGain) return;

        try {
            const audioContext = this.audioContext;
            const now = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {
            console.warn('Error playing jump sound:', e);
        }
    }

    playStepSound() {
        if (!this.audioContext || !this.masterGain) return;

        try {
            const audioContext = this.audioContext;
            const now = audioContext.currentTime;
            const osc = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc.connect(gainNode);
            gainNode.connect(this.masterGain);

            osc.frequency.setValueAtTime(200 + Math.random() * 100, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {
            console.warn('Error playing step sound:', e);
        }
    }

    setMasterVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }
}
