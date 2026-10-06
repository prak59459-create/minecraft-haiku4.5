export class GameMode {
    static SURVIVAL = 'survival';
    static CREATIVE = 'creative';

    constructor(mode = GameMode.SURVIVAL) {
        this.mode = mode;
        this.canFly = mode === GameMode.CREATIVE;
        this.unlimitedBlocks = mode === GameMode.CREATIVE;
        this.takeDamage = mode === GameMode.SURVIVAL;
        this.hunger = mode === GameMode.SURVIVAL;
    }

    setMode(mode) {
        this.mode = mode;
        this.canFly = mode === GameMode.CREATIVE;
        this.unlimitedBlocks = mode === GameMode.CREATIVE;
        this.takeDamage = mode === GameMode.SURVIVAL;
        this.hunger = mode === GameMode.SURVIVAL;
    }

    isCreative() {
        return this.mode === GameMode.CREATIVE;
    }

    isSurvival() {
        return this.mode === GameMode.SURVIVAL;
    }

    toggleMode() {
        this.setMode(this.mode === GameMode.CREATIVE ? GameMode.SURVIVAL : GameMode.CREATIVE);
    }
}
