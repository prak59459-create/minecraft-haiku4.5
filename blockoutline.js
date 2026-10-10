export class BlockOutline {
    constructor(scene) {
        this.scene = scene;
        this.outline = null;
        this.faceHighlight = null;
        this.createOutlineMaterial();
        this.createFaceMaterial();
    }

    createOutlineMaterial() {
        this.material = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 2,
            transparent: true,
            opacity: 0.8
        });
    }

    createFaceMaterial() {
        this.faceMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.15,
            side: THREE.FrontSide
        });
    }

    setSelectedBlock(x, y, z, normal = null) {
        if (this.outline) {
            this.scene.remove(this.outline);
        }
        if (this.faceHighlight) {
            this.scene.remove(this.faceHighlight);
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

        if (normal) {
            this.highlightFace(x, y, z, normal);
        }
    }

    highlightFace(x, y, z, normal) {
        const faceGeometry = new THREE.PlaneGeometry(0.98, 0.98);

        const faceVertices = {
            '[1,0,0]': {
                pos: [x + 1.01, y + 0.01, z + 0.01],
                rot: [0, Math.PI / 2, 0]
            },
            '[-1,0,0]': {
                pos: [x - 0.01, y + 0.01, z + 0.01],
                rot: [0, -Math.PI / 2, 0]
            },
            '[0,1,0]': {
                pos: [x + 0.01, y + 1.01, z + 0.01],
                rot: [Math.PI / 2, 0, 0]
            },
            '[0,-1,0]': {
                pos: [x + 0.01, y - 0.01, z + 0.01],
                rot: [-Math.PI / 2, 0, 0]
            },
            '[0,0,1]': {
                pos: [x + 0.01, y + 0.01, z + 1.01],
                rot: [0, 0, 0]
            },
            '[0,0,-1]': {
                pos: [x + 0.01, y + 0.01, z - 0.01],
                rot: [0, Math.PI, 0]
            }
        };

        const key = `[${normal.x},${normal.y},${normal.z}]`;
        if (faceVertices[key]) {
            const face = faceVertices[key];
            this.faceHighlight = new THREE.Mesh(faceGeometry, this.faceMaterial);
            this.faceHighlight.position.set(...face.pos);
            this.faceHighlight.rotation.order = 'YXZ';
            this.faceHighlight.rotation.set(...face.rot);
            this.scene.add(this.faceHighlight);
        }
    }

    clear() {
        if (this.outline) {
            this.scene.remove(this.outline);
            this.outline = null;
        }
        if (this.faceHighlight) {
            this.scene.remove(this.faceHighlight);
            this.faceHighlight = null;
        }
    }

    update(raycastHit) {
        if (raycastHit && raycastHit.block !== 0) {
            this.setSelectedBlock(raycastHit.x, raycastHit.y, raycastHit.z, raycastHit.normal);
        } else {
            this.clear();
        }
    }
}
