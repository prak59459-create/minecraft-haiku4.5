export class SoundManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
    }

    playBlockBreakSound() {
        this.playSound(200, 0.1, 0.1);
    }

    playBlockPlaceSound() {
        this.playSound(300, 0.1, 0.1);
    }

    playJumpSound() {
        this.playSound(400, 0.08, 0.1);
    }

    playFootstepSound() {
        this.playSound(150, 0.05, 0.05);
    }

    playSound(frequency, duration, volume) {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.frequency.setValueAtTime(frequency, now);
        osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + duration);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }

    playBlockStepSound(blockType) {
        const frequencies = {
            'grass': 180,
            'dirt': 160,
            'stone': 200,
            'wood': 220,
            'leaves': 140,
            'water': 120,
            'sand': 170,
            'gravel': 190,
            'cobblestone': 210
        };

        const freq = frequencies[blockType] || 150;
        this.playSound(freq, 0.06, 0.03);
    }
}
