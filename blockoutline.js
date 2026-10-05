export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.time = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.currentZ = 0;
        this.createOutlineMaterial();
    }

    createOutlineMaterial() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 3,
            transparent: true,
            opacity: 0.9,
            fog: false
        });
    }

    setSelectedBlock(x, y, z) {
        if (this.outline && this.currentX === x && this.currentY === y && this.currentZ === z) {
            return;
        }

        this.currentX = x;
        this.currentY = y;
        this.currentZ = z;

        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline.geometry.dispose();
        }

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const positions = [
            [x, y, z], [x + 1, y, z], [x + 1, y + 1, z], [x, y + 1, z],
            [x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]
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
        this.outline.renderOrder = 999;
        this.scene.add(this.outline);
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline.geometry.dispose();
            this.outline = null;
        }
        this.currentX = 0;
        this.currentY = 0;
        this.currentZ = 0;
    }

    update(raycastHit) {
        this.time += 0.016;

        if (raycastHit && raycastHit.block !== 0) {
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z);
            if (this.outline) {
                const pulse = 0.6 + Math.sin(this.time * 3) * 0.4;
                this.material.opacity = 0.6 + pulse * 0.3;
            }
        } else {
            this.clear();
        }
    }
}
