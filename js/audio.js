class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.3;

        this.soundEffects = {};
        this.initializeSoundEffects();
    }

    initializeSoundEffects() {
        this.soundEffects.blockBreak = {
            frequency: 150,
            duration: 0.1,
            type: 'square',
            envelope: { attack: 0.01, decay: 0.1 }
        };

        this.soundEffects.blockPlace = {
            frequency: 400,
            duration: 0.08,
            type: 'sine',
            envelope: { attack: 0.01, decay: 0.08 }
        };

        this.soundEffects.step = {
            frequency: 100,
            duration: 0.05,
            type: 'square',
            envelope: { attack: 0.005, decay: 0.05 }
        };

        this.soundEffects.jump = {
            frequency: 300,
            duration: 0.15,
            type: 'triangle',
            envelope: { attack: 0.02, decay: 0.15 }
        };
    }

    playSoundEffect(soundName) {
        const sound = this.soundEffects[soundName];
        if (!sound) return;

        try {
            const now = this.audioContext.currentTime;
            const oscillator = this.audioContext.createOscillator();
            const envelope = this.audioContext.createGain();

            oscillator.type = sound.type;
            oscillator.frequency.value = sound.frequency;
            oscillator.connect(envelope);
            envelope.connect(this.masterGain);

            envelope.gain.setValueAtTime(0, now);
            envelope.gain.linearRampToValueAtTime(1, now + sound.envelope.attack);
            envelope.gain.exponentialRampToValueAtTime(0.01, now + sound.envelope.attack + sound.envelope.decay);

            oscillator.start(now);
            oscillator.stop(now + sound.envelope.attack + sound.envelope.decay);
        } catch (e) {
            console.log('Audio playback not available');
        }
    }

    playBlockBreakSound() {
        this.playSoundEffect('blockBreak');
    }

    playBlockPlaceSound() {
        this.playSoundEffect('blockPlace');
    }

    playJumpSound() {
        this.playSoundEffect('jump');
    }

    setVolume(volume) {
        this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }

    dispose() {
        this.audioContext.close();
    }
}
