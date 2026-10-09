export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.lastPos = null;
        this.time = 0;
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
        const key = `${x},${y},${z}`;
        if (this.lastPos === key && this.outline) {
            return;
        }

        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline.geometry.dispose();
        }

        this.lastPos = key;
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
            this.lastPos = null;
        }
    }

    update(raycastHit) {
        this.time += 0.016;
        const pulse = Math.sin(this.time * 4) * 0.05 + 0.85;
        this.material.opacity = Math.max(0.7, pulse);

        if (raycastHit && raycastHit.block !== 0) {
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z);
        } else {
            this.clear();
        }
    }
}
