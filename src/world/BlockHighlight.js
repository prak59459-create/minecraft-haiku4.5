import * as THREE from 'three';

export class BlockHighlight {
    constructor(scene) {
        this.scene = scene;
        this.highlightedBlock = null;
        this.highlightMesh = this.createHighlightMesh();
        this.scene.add(this.highlightMesh);
    }

    createHighlightMesh() {
        const geometry = new THREE.BoxGeometry(1.002, 1.002, 1.002);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = false;
        return mesh;
    }

    updateHighlight(raycastHit) {
        if (raycastHit) {
            const pos = raycastHit.blockPos;
            this.highlightMesh.position.set(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);
            this.highlightMesh.visible = true;
            this.highlightedBlock = pos;
        } else {
            this.highlightMesh.visible = false;
            this.highlightedBlock = null;
        }
    }

    dispose() {
        this.highlightMesh.geometry.dispose();
        this.highlightMesh.material.dispose();
        this.scene.remove(this.highlightMesh);
    }
}
