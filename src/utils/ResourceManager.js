export class ResourceManager {
    constructor() {
        this.geometries = new Map();
        this.materials = new Map();
        this.textures = new Map();
        this.meshes = new Map();
    }

    createGeometry(key, geometry) {
        if (!this.geometries.has(key)) {
            this.geometries.set(key, geometry);
        }
        return this.geometries.get(key);
    }

    createMaterial(key, material) {
        if (!this.materials.has(key)) {
            this.materials.set(key, material);
        }
        return this.materials.get(key);
    }

    cloneMaterial(key) {
        const material = this.materials.get(key);
        return material ? material.clone() : null;
    }

    disposeMaterial(key) {
        const material = this.materials.get(key);
        if (material) {
            material.dispose();
            this.materials.delete(key);
        }
    }

    disposeGeometry(key) {
        const geometry = this.geometries.get(key);
        if (geometry) {
            geometry.dispose();
            this.geometries.delete(key);
        }
    }

    getMemoryUsage() {
        return {
            geometries: this.geometries.size,
            materials: this.materials.size,
            textures: this.textures.size,
            meshes: this.meshes.size
        };
    }

    clear() {
        this.geometries.forEach(g => g.dispose());
        this.materials.forEach(m => m.dispose());
        this.textures.forEach(t => t.dispose());

        this.geometries.clear();
        this.materials.clear();
        this.textures.clear();
        this.meshes.clear();
    }
}
