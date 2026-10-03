import * as THREE from 'three';
import { Game } from './game.js';

const canvas = document.querySelector('canvas');
if (!canvas) {
    const newCanvas = document.createElement('canvas');
    document.body.appendChild(newCanvas);
}

const game = new Game();
game.init();
game.animate();
