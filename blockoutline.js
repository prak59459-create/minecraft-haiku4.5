export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.geometry = null;
        this.currentBlock = null;
        this.createOutlineMaterial();
        this.createOutlineGeometry();
        this.createOutlineObject();
    }

    createOutlineMaterial() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 2,
            transparent: true,
            opacity: 0.9,
            fog: false
        });
    }

    createOutlineGeometry() {
        this.geometry = new THREE.BufferGeometry();
        const positions = [
            [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
            [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]
        ];

        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        const vertices = [];
        for (const [start, end] of edges) {
            const [x1, y1, z1] = positions[start];
            const [x2, y2, z2] = positions[end];
            vertices.push(x1, y1, z1, x2, y2, z2);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    }

    createOutlineObject() {
        this.outline = new THREE.LineSegments(this.geometry, this.material);
        this.outline.visible = false;
        this.scene.add(this.outline);
    }

    update(raycastHit) {
        if (raycastHit && raycastHit.block !== 0) {
            const blockKey = `${raycastHit.x},${raycastHit.y},${raycastHit.z}`;
            if (this.currentBlock !== blockKey) {
                this.outline.position.set(raycastHit.x, raycastHit.y, raycastHit.z);
                this.currentBlock = blockKey;
            }
            this.outline.visible = true;
        } else {
            this.outline.visible = false;
            this.currentBlock = null;
        }
    }
}
