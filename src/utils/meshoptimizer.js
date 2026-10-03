export class MeshOptimizer {
    static createOptimizedChunkMesh(geometry, material) {
        geometry.computeVertexNormals();
        geometry.boundingSphere.radius = 20;

        return new THREE.Mesh(geometry, material);
    }

    static poolGeometries() {
        this.geometryPool = [];
    }

    static getGeometry() {
        if (this.geometryPool.length > 0) {
            return this.geometryPool.pop();
        }
        return new THREE.BufferGeometry();
    }

    static returnGeometry(geometry) {
        geometry.dispose();
    }

    static createSimplifiedMaterial() {
        return new THREE.MeshLambertMaterial({
            flatShading: true,
            side: THREE.FrontSide,
            wireframe: false
        });
    }
}

import * as THREE from 'three';
