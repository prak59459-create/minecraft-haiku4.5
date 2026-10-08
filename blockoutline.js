export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.outlineBox = null;
        this.createOutlineMaterial();
        this.time = 0;
    }

    createOutlineMaterial() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFF00,
            linewidth: 3,
            transparent: true,
            opacity: 0.9
        });

        this.boxMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.1,
            emissive: 0xFFFF00,
            emissiveIntensity: 0.3,
            wireframe: false
        });
    }

    setSelectedBlock(x, y, z) {
        if (this.outline) {
            this.scene.remove(this.outline);
        }
        if (this.outlineBox) {
            this.scene.remove(this.outlineBox);
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
        this.scene.add(this.outline);

        const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.outlineBox = new THREE.Mesh(boxGeometry, this.boxMaterial);
        this.outlineBox.position.set(x + 0.5, y + 0.5, z + 0.5);
        this.scene.add(this.outlineBox);
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline = null;
        }
        if (this.outlineBox) {
            this.scene.remove(this.outlineBox);
            this.outlineBox = null;
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
