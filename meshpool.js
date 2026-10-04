export class MeshPool {
    constructor() {
        this.geometryPool = [];
        this.materialPool = [];
        this.meshPool = [];
        this.poolSize = 32;
    }

    acquireGeometry() {
        if (this.geometryPool.length > 0) {
            return this.geometryPool.pop();
        }
        return new THREE.BufferGeometry();
    }

    releaseGeometry(geometry) {
        geometry.dispose();
        this.geometryPool.push(geometry);
    }

    acquireMaterial() {
        if (this.materialPool.length > 0) {
            return this.materialPool.pop();
        }
        return new THREE.MeshPhongMaterial({
            vertexColors: true,
            wireframe: false,
            flatShading: false,
            side: THREE.FrontSide,
            shininess: 30
        });
    }

    releaseMaterial(material) {
        material.dispose();
        this.materialPool.push(material);
    }

    acquireMesh(geometry, material) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = true;
        return mesh;
    }

    releaseMesh(mesh) {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
    }

    clear() {
        this.geometryPool.forEach(g => g.dispose());
        this.materialPool.forEach(m => m.dispose());
        this.geometryPool = [];
        this.materialPool = [];
        this.meshPool = [];
    }
}
