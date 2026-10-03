class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.soundLibrary = new Map();
        this.isMuted = false;
        this.masterVolume = 0.5;

        this.initAudioContext();
    }

    initAudioContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
        } catch (e) {
            console.log('Web Audio API not supported');
            return;
        }

        this.registerSounds();
    }

    registerSounds() {
        // Register all game sounds here
        const sounds = ['break', 'place', 'jump', 'step'];
        sounds.forEach(name => {
            this.soundLibrary.set(name, {
                name: name,
                volume: 1.0,
                pitch: 1.0
            });
        });
    }

    playSound(soundName, options = {}) {
        if (!this.audioContext || this.isMuted) return;

        const sound = this.soundLibrary.get(soundName);
        if (!sound) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        // Create simple beep sounds for now (can be replaced with actual audio files)
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        // Set pitch based on sound type
        let frequency = 440; // Default
        let duration = 0.1;

        switch (soundName) {
            case 'break':
                frequency = 600;
                duration = 0.1;
                break;
            case 'place':
                frequency = 700;
                duration = 0.08;
                break;
            case 'jump':
                frequency = 500;
                duration = 0.15;
                break;
            case 'step':
                frequency = 350;
                duration = 0.05;
                break;
        }

        frequency *= (options.pitch || 1.0);

        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(sound.volume * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
    }
}

const audioSystem = new AudioSystem();
