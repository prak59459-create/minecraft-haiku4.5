import * as THREE from 'three';

export class BlockHighlight {
    mesh: THREE.LineSegments | null = null;
    scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    update(targetBlock: { x: number, y: number, z: number } | null): void {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            (this.mesh.material as THREE.Material).dispose();
            this.mesh = null;
        }

        if (!targetBlock) return;

        const geometry = new THREE.EdgesGeometry(
            new THREE.BoxGeometry(1, 1, 1)
        );

        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });

        this.mesh = new THREE.LineSegments(geometry, material);
        this.mesh.position.set(
            targetBlock.x + 0.5,
            targetBlock.y + 0.5,
            targetBlock.z + 0.5
        );

        this.scene.add(this.mesh);
    }
}
