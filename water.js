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
        const waterColor = new THREE.Color(0x4488DD);

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                for (let y = 1; y < WORLD_HEIGHT; y++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId !== BLOCKS.WATER) continue;

                    const wx = chunk.x * CHUNK_SIZE + x;
                    const wy = y;
                    const wz = chunk.z * CHUNK_SIZE + z;

                    const neighbor = (dx, dy, dz) => {
                        return this.world.getBlock(wx + dx, wy + dy, wz + dz);
                    };

                    const faces = [
                        { dir: [1, 0, 0], verts: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]], bright: 0.85 },
                        { dir: [-1, 0, 0], verts: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]], bright: 0.85 },
                        { dir: [0, 1, 0], verts: [[0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1]], bright: 1.0 },
                        { dir: [0, -1, 0], verts: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]], bright: 0.7 },
                        { dir: [0, 0, 1], verts: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]], bright: 0.9 },
                        { dir: [0, 0, -1], verts: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]], bright: 0.9 }
                    ];

                    for (const face of faces) {
                        const [dx, dy, dz] = face.dir;
                        const neighborBlock = neighbor(dx, dy, dz);

                        if (neighborBlock !== BLOCKS.AIR && neighborBlock !== BLOCKS.WATER) continue;

                        const startIndex = vertices.length / 3;
                        const faceColor = waterColor.clone().multiplyScalar(face.bright);

                        for (const [vx, vy, vz] of face.verts) {
                            vertices.push(wx + vx, wy + vy, wz + vz);
                            colors.push(faceColor.r * 255, faceColor.g * 255, faceColor.b * 255);
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
                opacity: 0.6,
                side: THREE.FrontSide
            });

            const mesh = new THREE.Mesh(geometry, material);
            return mesh;
        }

        return null;
    }

    update() {
        this.time += 0.016;

        for (const mesh of this.waterMeshes.values()) {
            if (mesh && mesh.material) {
                const waveOffset = Math.sin(this.time * 2) * 0.02;
                mesh.position.y += waveOffset * 0.1;
            }
        }
    }

    updateWaterMeshes(world) {
        const chunksToRender = new Map();
        for (const [key, chunk] of world.chunks) {
            chunksToRender.set(key, chunk);
        }

        for (const key of this.waterMeshes.keys()) {
            if (!chunksToRender.has(key)) {
                this.scene.remove(this.waterMeshes.get(key));
                this.waterMeshes.delete(key);
            }
        }

        for (const [key, chunk] of chunksToRender) {
            if (!this.waterMeshes.has(key)) {
                const mesh = this.buildWaterMesh(chunk);
                if (mesh) {
                    this.scene.add(mesh);
                    this.waterMeshes.set(key, mesh);
                }
            }
        }
    }
}
