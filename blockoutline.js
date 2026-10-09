export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.currentPos = { x: -1, y: -1, z: -1 };
        this.createOutlineMaterial();
        this.createOutlineGeometry();
    }

    createOutlineMaterial() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 2,
            transparent: true,
            opacity: 0.8,
            fog: false
        });
    }

    createOutlineGeometry() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        const positions = [
            [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
            [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
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
        this.geometry = geometry;
    }

    setSelectedBlock(x, y, z) {
        if (this.currentPos.x === x && this.currentPos.y === y && this.currentPos.z === z) {
            return;
        }

        if (!this.outline) {
            this.outline = new THREE.LineSegments(this.geometry, this.material);
            this.scene.add(this.outline);
        }

        this.outline.position.set(x, y, z);
        this.currentPos = { x, y, z };
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline = null;
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
