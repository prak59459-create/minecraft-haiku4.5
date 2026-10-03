class GameLauncher {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-progress');
        this.loadingText = document.getElementById('loading-text');
        this.progress = 0;
        this.game = null;
        this.loaded = false;
    }

    updateProgress(percent, message) {
        this.progress = percent;
        this.loadingBar.style.width = percent + '%';
        if (message) {
            this.loadingText.textContent = message;
        }
    }

    hideLoadingScreen() {
        if (this.loadingScreen) {
            setTimeout(() => {
                this.loadingScreen.classList.add('hidden');
            }, 500);
        }
    }

    async initialize() {
        try {
            this.updateProgress(10, 'Loading configuration...');
            const config = loadConfig(getSavedConfig());

            this.updateProgress(20, 'Initializing Three.js...');
            await this.waitForLibraries();

            this.updateProgress(40, 'Setting up audio system...');
            SoundLibrary.preloadSounds(globalAudioManager);

            this.updateProgress(60, 'Initializing game engine...');
            this.game = new MinecraftGame();

            this.updateProgress(90, 'Generating initial terrain...');
            await this.waitForWorldGeneration();

            this.updateProgress(100, 'Ready to play!');

            this.loaded = true;
            this.hideLoadingScreen();

            return this.game;
        } catch (error) {
            console.error('Error during game initialization:', error);
            this.loadingText.textContent = 'Error: ' + error.message;
        }
    }

    async waitForLibraries() {
        return new Promise(resolve => {
            const checkLibs = () => {
                if (typeof THREE !== 'undefined' && typeof SimplexNoise !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkLibs, 100);
                }
            };
            checkLibs();
        });
    }

    async waitForWorldGeneration() {
        return new Promise(resolve => {
            if (!this.game) {
                resolve();
                return;
            }

            const checkWorld = () => {
                if (this.game.world && this.game.world.chunks.size > 0) {
                    resolve();
                } else {
                    setTimeout(checkWorld, 100);
                }
            };
            checkWorld();
        });
    }
}

const launcher = new GameLauncher();

document.addEventListener('DOMContentLoaded', () => {
    launcher.initialize().catch(error => {
        console.error('Fatal error:', error);
    });
});
