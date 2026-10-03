import * as THREE from 'three';

function createTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

export const BLOCK_TYPES = {
    grass: {
        color: 0x90ee90,
        texture: createTexture('#90ee90'),
        solid: true
    },
    dirt: {
        color: 0x8b7355,
        texture: createTexture('#8b7355'),
        solid: true
    },
    stone: {
        color: 0x808080,
        texture: createTexture('#808080'),
        solid: true
    },
    wood: {
        color: 0x8b4513,
        texture: createTexture('#8b4513'),
        solid: true
    },
    leaves: {
        color: 0x228b22,
        texture: createTexture('#228b22'),
        solid: true,
        transparent: true
    },
    water: {
        color: 0x4169e1,
        texture: createTexture('#4169e1'),
        solid: false,
        liquid: true
    },
    sand: {
        color: 0xedc9af,
        texture: createTexture('#edc9af'),
        solid: true
    },
    cobblestone: {
        color: 0xa0a0a0,
        texture: createTexture('#a0a0a0'),
        solid: true
    },
    bedrock: {
        color: 0x4a4a4a,
        texture: createTexture('#4a4a4a'),
        solid: true
    }
};

export const BLOCK_NAMES = Object.keys(BLOCK_TYPES);
