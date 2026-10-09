import { BLOCKS, isBlockSolid } from './blocks.js';

export class WaterRenderer {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.waterMeshes = new Map();
        this.time = 0;
    }

    buildWaterMesh(chunk) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const indices = [];

        const CHUNK_SIZE = 16;
        const WORLD_HEIGHT = 256;
        const waterColorTop = new THREE.Color(0x5BA3E8);
        const waterColorDeep = new THREE.Color(0x2B5A9B);

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 1; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId !== BLOCKS.WATER) continue;

                    const wx = chunk.x * CHUNK_SIZE + x;
                    const wy = y;
                    const wz = chunk.z * CHUNK_SIZE + z;

                    const neighbor = (dx, dy, dz) => {
                        return this.world.getBlock(wx + dx, wy + dy, wz + dz);
                    };

                    const faces = [
                        { dir: [1, 0, 0], verts: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]], top: false },
                        { dir: [-1, 0, 0], verts: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]], top: false },
                        { dir: [0, 1, 0], verts: [[0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1]], top: true },
                        { dir: [0, -1, 0], verts: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]], top: false },
                        { dir: [0, 0, 1], verts: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]], top: false },
                        { dir: [0, 0, -1], verts: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]], top: false }
                    ];

                    for (const face of faces) {
                        const [dx, dy, dz] = face.dir;
                        const neighborBlock = neighbor(dx, dy, dz);

                        if (neighborBlock !== BLOCKS.AIR && neighborBlock !== BLOCKS.WATER) continue;

                        const startIndex = vertices.length / 3;
                        const baseColor = face.top ? waterColorTop.clone() : waterColorDeep.clone();
                        if (face.top) {
                            baseColor.multiplyScalar(0.9 + Math.sin(wx * 0.1 + wz * 0.1) * 0.1);
                        } else {
                            baseColor.multiplyScalar(0.8 + Math.random() * 0.15);
                        }

                        for (const [vx, vy, vz] of face.verts) {
                            vertices.push(wx + vx, wy + vy, wz + vz);
                            colors.push(baseColor.r, baseColor.g, baseColor.b);
                        }

                        indices.push(startIndex, startIndex + 1, startIndex + 2);
                        indices.push(startIndex, startIndex + 2, startIndex + 3);
                    }
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            geometry.computeVertexNormals();

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                wireframe: false,
                transparent: true,
                opacity: 0.65,
                side: THREE.FrontSide,
                shininess: 50
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }

        return null;
    }

    update() {
        this.time += 0.016;
    }
}
