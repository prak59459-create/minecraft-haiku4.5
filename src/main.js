import { Game } from './Game.js';

const game = new Game();
game.init();
game.animate();

window.addEventListener('resize', () => game.onWindowResize());
