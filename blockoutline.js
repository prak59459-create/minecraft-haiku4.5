export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.lastBlock = { x: -1, y: -1, z: -1 };
        this.time = 0;
        this.createOutlineMaterial();
    }

    createOutlineMaterial() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFF00,
            linewidth: 3,
            transparent: true,
            opacity: 0.9,
            fog: false
        });
    }

    setSelectedBlock(x, y, z) {
        if (this.lastBlock.x === x && this.lastBlock.y === y && this.lastBlock.z === z) {
            return;
        }

        if (this.outline) {
            this.scene.remove(this.outline);
        }

        this.lastBlock = { x, y, z };

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const offset = 0.001;

        const positions = [
            [x - offset, y - offset, z - offset], [x + 1 + offset, y - offset, z - offset],
            [x + 1 + offset, y + 1 + offset, z - offset], [x - offset, y + 1 + offset, z - offset],
            [x - offset, y - offset, z + 1 + offset], [x + 1 + offset, y - offset, z + 1 + offset],
            [x + 1 + offset, y + 1 + offset, z + 1 + offset], [x - offset, y + 1 + offset, z + 1 + offset]
        ];

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        for (const [start, end] of edges) {
            const [x1, y1, z1] = positions[start];
            const [x2, y2, z2] = positions[end];
            vertices.push(x1, y1, z1, x2, y2, z2);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

        this.outline = new THREE.LineSegments(geometry, this.material);
        this.outline.renderOrder = 1;
        this.scene.add(this.outline);
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline = null;
            this.lastBlock = { x: -1, y: -1, z: -1 };
        }
    }

    update(raycastHit) {
        this.time += 0.016;

        if (raycastHit && raycastHit.block !== 0) {
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z);
            if (this.outline) {
                this.outline.material.opacity = 0.7 + Math.sin(this.time * 3) * 0.2;
            }
        } else {
            this.clear();
        }
    }
}
