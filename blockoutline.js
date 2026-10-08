export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.lastX = null;
        this.lastY = null;
        this.lastZ = null;
        this.createOutlineMaterial();
        this.createOutline();
    }

    createOutlineMaterial() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });
    }

    createOutline() {
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

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.outline = new THREE.LineSegments(geometry, this.material);
        this.outline.visible = false;
        this.scene.add(this.outline);
    }

    update(raycastHit) {
        if (raycastHit && raycastHit.block !== 0 &&
            (this.lastX !== raycastHit.x || this.lastY !== raycastHit.y || this.lastZ !== raycastHit.z)) {
            this.outline.position.set(raycastHit.x, raycastHit.y, raycastHit.z);
            this.outline.visible = true;
            this.lastX = raycastHit.x;
            this.lastY = raycastHit.y;
            this.lastZ = raycastHit.z;
        } else if (!raycastHit || raycastHit.block === 0) {
            this.outline.visible = false;
        }
    }
}
