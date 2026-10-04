export class AudioManager {
    audioContext: AudioContext;
    masterGain: GainNode;
    sfxGain: GainNode;
    musicGain: GainNode;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.sfxGain = this.audioContext.createGain();
        this.musicGain = this.audioContext.createGain();

        this.masterGain.connect(this.audioContext.destination);
        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);

        this.masterGain.gain.value = 0.5;
        this.sfxGain.gain.value = 0.7;
        this.musicGain.gain.value = 0.3;
    }

    playBlockPlace(): void {
        this.playTone(800, 0.1, 0.08);
    }

    playBlockBreak(): void {
        this.playTone(600, 0.15, 0.1);
    }

    playJump(): void {
        this.playTone(1200, 0.08, 0.05);
    }

    playStep(): void {
        this.playTone(500, 0.05, 0.04);
    }

    private playTone(frequency: number, gain: number, duration: number): void {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.value = frequency;

        gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.sfxGain);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + duration);
    }

    setMasterVolume(volume: number): void {
        this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }

    setSfxVolume(volume: number): void {
        this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
    }

    setMusicVolume(volume: number): void {
        this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
    }
}
