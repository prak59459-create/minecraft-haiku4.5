export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.glowOutline = null;
        this.time = 0;
        this.createOutlineMaterials();
    }

    createOutlineMaterials() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 3,
            transparent: true,
            opacity: 0.9,
            fog: false
        });

        this.glowMaterial = new THREE.LineBasicMaterial({
            color: 0xFFAA00,
            linewidth: 2,
            transparent: true,
            opacity: 0.3,
            fog: false
        });
    }

    setSelectedBlock(x, y, z) {
        if (this.outline) {
            this.scene.remove(this.outline);
        }
        if (this.glowOutline) {
            this.scene.remove(this.glowOutline);
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
        this.outline.renderOrder = 2;
        this.scene.add(this.outline);

        const glowGeometry = new THREE.BufferGeometry();
        const glowVertices = [];
        const offset = 0.01;

        for (const [start, end] of edges) {
            const [x1, y1, z1] = positions[start];
            const [x2, y2, z2] = positions[end];
            glowVertices.push(x1 - offset, y1 - offset, z1 - offset, x2 - offset, y2 - offset, z2 - offset);
        }

        glowGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowVertices), 3));
        this.glowOutline = new THREE.LineSegments(glowGeometry, this.glowMaterial);
        this.glowOutline.renderOrder = 1;
        this.scene.add(this.glowOutline);
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline = null;
        }
        if (this.glowOutline) {
            this.scene.remove(this.glowOutline);
            this.glowOutline = null;
        }
    }

    update(raycastHit) {
        this.time += 0.016;
        if (raycastHit && raycastHit.block !== 0) {
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z);

            if (this.glowMaterial) {
                const pulse = Math.sin(this.time * 3) * 0.15 + 0.3;
                this.glowMaterial.opacity = pulse;
            }
        } else {
            this.clear();
        }
    }
}
