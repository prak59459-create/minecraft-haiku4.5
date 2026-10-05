export class CommandSystem {
    constructor(game) {
        this.game = game;
        this.commands = new Map();
        this.registerBuiltinCommands();
    }

    registerCommand(name, callback, help = '') {
        this.commands.set(name.toLowerCase(), { callback, help });
    }

    registerBuiltinCommands() {
        this.registerCommand('clear', () => {
            this.game.saveGameManager.clearAllData();
            console.log('Game data cleared');
        }, 'Clear all saved game data');

        this.registerCommand('teleport', (args) => {
            if (args.length < 3) {
                console.log('Usage: /teleport <x> <y> <z>');
                return;
            }
            const x = parseFloat(args[0]);
            const y = parseFloat(args[1]);
            const z = parseFloat(args[2]);
            if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                this.game.player.position = { x, y, z };
                console.log(`Teleported to ${x}, ${y}, ${z}`);
            }
        }, 'Teleport to coordinates (x y z)');

        this.registerCommand('gamemode', (args) => {
            if (args[0] === 'creative') {
                console.log('Creative mode would be enabled');
            } else if (args[0] === 'survival') {
                console.log('Survival mode would be enabled');
            }
        }, 'Change game mode (creative/survival)');

        this.registerCommand('help', () => {
            console.log('=== Available Commands ===');
            for (const [name, { help }] of this.commands) {
                console.log(`/${name}: ${help}`);
            }
        }, 'Show help for all commands');

        this.registerCommand('fps', () => {
            console.log(`Current FPS: ${this.game.ui.fpsCounter}`);
        }, 'Show current FPS');

        this.registerCommand('chunks', () => {
            console.log(`Active chunks: ${this.game.world.chunks.size}`);
        }, 'Show active chunk count');
    }

    execute(input) {
        if (!input.startsWith('/')) return false;

        const parts = input.slice(1).split(' ');
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (!this.commands.has(commandName)) {
            console.log(`Unknown command: ${commandName}`);
            return false;
        }

        const { callback } = this.commands.get(commandName);
        try {
            callback(args);
            return true;
        } catch (error) {
            console.error(`Error executing command: ${error.message}`);
            return false;
        }
    }
}
