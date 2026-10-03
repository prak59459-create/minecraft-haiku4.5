class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.masterVolume = 0.7;
        this.sounds = new Map();
        this.musicVolume = 0.5;
        this.sfxVolume = 0.8;

        this.initAudio();
    }

    initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.enabled = true;

            if (this.audioContext.state === 'suspended') {
                document.addEventListener('click', () => {
                    if (this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                });
            }
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    loadSound(name, audioBuffer) {
        if (this.enabled) {
            this.sounds.set(name, audioBuffer);
        }
    }

    playSound(name, volume = 1.0) {
        if (!this.enabled || !this.sounds.has(name)) {
            return null;
        }

        try {
            const audioBuffer = this.sounds.get(name);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = audioBuffer;
            gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start(0);

            return source;
        } catch (e) {
            console.warn('Error playing sound:', e);
            return null;
        }
    }

    playMusic(name, volume = 1.0, loop = true) {
        if (!this.enabled || !this.sounds.has(name)) {
            return null;
        }

        try {
            const audioBuffer = this.sounds.get(name);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = audioBuffer;
            source.loop = loop;
            gainNode.gain.value = volume * this.musicVolume * this.masterVolume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start(0);

            return { source, gainNode };
        } catch (e) {
            console.warn('Error playing music:', e);
            return null;
        }
    }

    stopSound(source) {
        if (source) {
            try {
                source.stop();
            } catch (e) {
                console.warn('Error stopping sound:', e);
            }
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    mute() {
        this.masterVolume = 0;
    }

    unmute() {
        this.masterVolume = 0.7;
    }
}

class SoundLibrary {
    static sounds = {
        // Block interaction sounds
        blockPlace: { duration: 0.15, frequency: 800 },
        blockBreak: { duration: 0.1, frequency: 1200 },
        blockStep: { duration: 0.05, frequency: 600 },

        // Player sounds
        jump: { duration: 0.08, frequency: 500 },
        land: { duration: 0.1, frequency: 400 },
        damage: { duration: 0.15, frequency: 200 },

        // Environment sounds
        ambientLoop: { duration: 30, frequency: 50 },
        waterSplash: { duration: 0.2, frequency: 1000 }
    };

    static createSoundBuffer(audioContext, frequency, duration) {
        const sampleRate = audioContext.sampleRate;
        const samples = duration * sampleRate;
        const buffer = audioContext.createBuffer(1, samples, sampleRate);
        const channel = buffer.getChannelData(0);

        const omega = 2 * Math.PI * frequency / sampleRate;
        const decayRate = Math.exp(-6 * duration);

        for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-6 * t / duration);
            const harmonic = Math.sin(omega * i) +
                           0.5 * Math.sin(omega * i * 2) +
                           0.25 * Math.sin(omega * i * 3);
            channel[i] = decay * harmonic * 0.1;
        }

        return buffer;
    }

    static preloadSounds(audioManager) {
        if (!audioManager.enabled) return;

        const audioContext = audioManager.audioContext;
        for (const [name, spec] of Object.entries(this.sounds)) {
            const buffer = this.createSoundBuffer(audioContext, spec.frequency, spec.duration);
            audioManager.loadSound(name, buffer);
        }
    }
}

const globalAudioManager = new AudioManager();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SoundLibrary.preloadSounds(globalAudioManager);
    });
} else {
    SoundLibrary.preloadSounds(globalAudioManager);
}
