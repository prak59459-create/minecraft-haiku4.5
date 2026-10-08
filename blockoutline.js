export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.time = 0;
        this.createOutlineMaterials();
    }

    createOutlineMaterials() {
        this.materialBreakable = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 2,
            transparent: true,
            opacity: 0.9
        });

        this.materialUnbreakable = new THREE.LineBasicMaterial({
            color: 0xFF6B6B,
            linewidth: 2,
            transparent: true,
            opacity: 0.7
        });
    }

    setSelectedBlock(x, y, z, material) {
        if (this.outline) {
            this.scene.remove(this.outline);
            if (this.outline.geometry) {
                this.outline.geometry.dispose();
            }
        }

        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const offset = 0.01;
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

        this.outline = new THREE.LineSegments(geometry, material);
        this.outline.renderOrder = 1;
        this.scene.add(this.outline);
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            if (this.outline.geometry) {
                this.outline.geometry.dispose();
            }
            this.outline = null;
        }
    }

    update(raycastHit) {
        this.time += 0.016;

        if (raycastHit && raycastHit.block !== 0) {
            const isBreakable = raycastHit.block !== 10;
            const material = isBreakable ? this.materialBreakable : this.materialUnbreakable;
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z, material);
        } else {
            this.clear();
        }
    }
}
