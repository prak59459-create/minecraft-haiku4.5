import * as THREE from 'three';

export class AssetManager {
    constructor() {
        this.textures = new Map();
        this.models = new Map();
        this.sounds = new Map();
        this.textureLoader = new THREE.TextureLoader();
    }

    loadTexture(name, url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    texture.magFilter = THREE.NearestFilter;
                    texture.minFilter = THREE.NearestFilter;
                    this.textures.set(name, texture);
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }

    getTexture(name) {
        return this.textures.get(name);
    }

    loadSound(name, url) {
        return fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                this.sounds.set(name, arrayBuffer);
                return arrayBuffer;
            });
    }

    getSound(name) {
        return this.sounds.get(name);
    }

    createCanvasTexture(width, height, drawFunction) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        drawFunction(ctx);

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return texture;
    }

    clear() {
        this.textures.forEach(texture => texture.dispose());
        this.textures.clear();
        this.sounds.clear();
    }
}
