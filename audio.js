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
                document.addEventListener('click', () => audioContext.resume());
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
            osc.frequency.setValueAtTime(350 + Math.random() * 100, now);
            osc.frequency.exponentialRampToValueAtTime(80 + Math.random() * 40, now + 0.12);
            gainNode.gain.setValueAtTime(0.15 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'place') {
            osc.frequency.setValueAtTime(550 + Math.random() * 100, now);
            osc.frequency.exponentialRampToValueAtTime(150 + Math.random() * 100, now + 0.1);
            gainNode.gain.setValueAtTime(0.12 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.005, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
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

        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.12);
        gainNode.gain.setValueAtTime(0.08 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.005, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playStepSound() {
        if (!this.audioContext) return;

        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);

        osc.frequency.setValueAtTime(180 + Math.random() * 80, now);
        gainNode.gain.setValueAtTime(0.04 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.005, now + 0.06);

        osc.start(now);
        osc.stop(now + 0.06);
    }
}
