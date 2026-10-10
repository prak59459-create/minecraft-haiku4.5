export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.time = 0;
        this.createOutlineMaterial();
    }

    createOutlineMaterial() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 3,
            transparent: true,
            opacity: 0.85,
            fog: false
        });
    }

    setSelectedBlock(x, y, z) {
        if (this.outline) {
            this.scene.remove(this.outline);
        }

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const offset = 0.005;
        const positions = [
            [x - offset, y - offset, z - offset],
            [x + 1 + offset, y - offset, z - offset],
            [x + 1 + offset, y + 1 + offset, z - offset],
            [x - offset, y + 1 + offset, z - offset],
            [x - offset, y - offset, z + 1 + offset],
            [x + 1 + offset, y - offset, z + 1 + offset],
            [x + 1 + offset, y + 1 + offset, z + 1 + offset],
            [x - offset, y + 1 + offset, z + 1 + offset]
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
        this.scene.add(this.outline);
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline = null;
        }
    }

    update(raycastHit) {
        this.time += 0.016;

        if (raycastHit && raycastHit.block !== 0) {
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z);

            if (this.outline) {
                const pulse = Math.sin(this.time * 3) * 0.15 + 0.7;
                this.material.opacity = pulse;
            }
        } else {
            this.clear();
        }
    }
}
