export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.outlineGlow = null;
        this.createOutlineMaterials();
    }

    createOutlineMaterials() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 3,
            transparent: true,
            opacity: 1.0
        });

        this.glowMaterial = new THREE.LineBasicMaterial({
            color: 0xFFAA00,
            linewidth: 2,
            transparent: true,
            opacity: 0.5
        });
    }

    setSelectedBlock(x, y, z) {
        if (this.outline) {
            this.scene.remove(this.outline);
        }
        if (this.outlineGlow) {
            this.scene.remove(this.outlineGlow);
        }

        const geometry = new THREE.BufferGeometry();
        const glowGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const glowVertices = [];

        const positions = [
            [x, y, z], [x + 1, y, z], [x + 1, y + 1, z], [x, y + 1, z],
            [x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]
        ];

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        const offset = 0.02;
        const glowPositions = positions.map(p => [p[0] - offset, p[1] - offset, p[2] - offset]);

        for (const [start, end] of edges) {
            const [x1, y1, z1] = positions[start];
            const [x2, y2, z2] = positions[end];
            vertices.push(x1, y1, z1, x2, y2, z2);

            const [gx1, gy1, gz1] = glowPositions[start];
            const [gx2, gy2, gz2] = glowPositions[end];
            glowVertices.push(gx1, gy1, gz1, gx2, gy2, gz2);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        glowGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowVertices), 3));

        this.outlineGlow = new THREE.LineSegments(glowGeometry, this.glowMaterial);
        this.scene.add(this.outlineGlow);

        this.outline = new THREE.LineSegments(geometry, this.material);
        this.scene.add(this.outline);
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline = null;
        }
        if (this.outlineGlow) {
            this.scene.remove(this.outlineGlow);
            this.outlineGlow = null;
        }
    }

    update(raycastHit) {
        if (raycastHit && raycastHit.block !== 0) {
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z);
        } else {
            this.clear();
        }
    }
}
