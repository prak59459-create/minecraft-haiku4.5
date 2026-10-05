export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.currentBlock = null;
        this.geometry = null;
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });
        this.createGeometry();
    }

    createGeometry() {
        this.geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(24 * 3);

        const positions = [
            [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
            [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
        ];

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        for (let i = 0; i < edges.length; i++) {
            const [start, end] = edges[i];
            const [x1, y1, z1] = positions[start];
            const [x2, y2, z2] = positions[end];
            vertices[i * 6] = x1;
            vertices[i * 6 + 1] = y1;
            vertices[i * 6 + 2] = z1;
            vertices[i * 6 + 3] = x2;
            vertices[i * 6 + 4] = y2;
            vertices[i * 6 + 5] = z2;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    }

    setSelectedBlock(x, y, z) {
        if (this.currentBlock && this.currentBlock.x === x && this.currentBlock.y === y && this.currentBlock.z === z) {
            return;
        }

        this.currentBlock = { x, y, z };

        if (!this.outline) {
            this.outline = new THREE.LineSegments(this.geometry, this.material);
            this.scene.add(this.outline);
        }

        this.outline.position.set(x, y, z);
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline = null;
        }
        this.currentBlock = null;
    }

    update(raycastHit) {
        if (raycastHit && raycastHit.block !== 0) {
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z);
        } else {
            this.clear();
        }
    }
}
