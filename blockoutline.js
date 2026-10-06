export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.glowOutline = null;
        this.createOutlineMaterials();
    }

    createOutlineMaterials() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFF00,
            linewidth: 3,
            transparent: true,
            opacity: 0.95,
            fog: false
        });

        this.glowMaterial = new THREE.LineBasicMaterial({
            color: 0xFFFF88,
            linewidth: 1,
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

        const positions = [
            [x, y, z], [x + 1, y, z], [x + 1, y + 1, z], [x, y + 1, z],
            [x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]
        ];

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        const buildGeometry = () => {
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            for (const [start, end] of edges) {
                const [x1, y1, z1] = positions[start];
                const [x2, y2, z2] = positions[end];
                vertices.push(x1, y1, z1, x2, y2, z2);
            }
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            return geometry;
        };

        this.outline = new THREE.LineSegments(buildGeometry(), this.material);
        this.scene.add(this.outline);

        const expandedPositions = positions.map(p => [
            p[0] + (p[0] === x ? -0.1 : 0.1),
            p[1] + (p[1] === y ? -0.1 : 0.1),
            p[2] + (p[2] === z ? -0.1 : 0.1)
        ]);

        const glowVertices = [];
        for (const [start, end] of edges) {
            const [x1, y1, z1] = expandedPositions[start];
            const [x2, y2, z2] = expandedPositions[end];
            glowVertices.push(x1, y1, z1, x2, y2, z2);
        }

        const glowGeometry = new THREE.BufferGeometry();
        glowGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(glowVertices), 3));
        this.glowOutline = new THREE.LineSegments(glowGeometry, this.glowMaterial);
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
        if (raycastHit && raycastHit.block !== 0) {
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z);
        } else {
            this.clear();
        }
    }
}
