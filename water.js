import { BLOCKS, isBlockSolid } from './blocks.js';

export class WaterRenderer {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.waterMeshes = new Map();
        this.lavaMeshes = new Map();
        this.time = 0;
    }

    buildLiquidMesh(chunk, liquidType) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const indices = [];

        const CHUNK_SIZE = 16;
        const WORLD_HEIGHT = 256;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 1; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId !== liquidType) continue;

                    const wx = chunk.x * CHUNK_SIZE + x;
                    const wy = y;
                    const wz = chunk.z * CHUNK_SIZE + z;

                    const neighbor = (dx, dy, dz) => {
                        return this.world.getBlock(wx + dx, wy + dy, wz + dz);
                    };

                    const faces = [
                        { dir: [1, 0, 0], verts: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] },
                        { dir: [-1, 0, 0], verts: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]] },
                        { dir: [0, 1, 0], verts: [[0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1]] },
                        { dir: [0, -1, 0], verts: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]] },
                        { dir: [0, 0, 1], verts: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]] },
                        { dir: [0, 0, -1], verts: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]] }
                    ];

                    for (const face of faces) {
                        const [dx, dy, dz] = face.dir;
                        const neighborBlock = neighbor(dx, dy, dz);

                        if (neighborBlock !== BLOCKS.AIR && neighborBlock !== liquidType) continue;

                        const startIndex = vertices.length / 3;
                        const wave = Math.sin(this.time + wx * 0.3 + wz * 0.3) * 0.1;

                        let r, g, b;
                        if (liquidType === BLOCKS.WATER) {
                            const colorBright = 70 + Math.floor(wave * 20);
                            r = Math.max(0, Math.min(255, colorBright - 20));
                            g = Math.max(0, Math.min(255, colorBright + 10));
                            b = Math.max(0, Math.min(255, colorBright + 30));
                        } else if (liquidType === BLOCKS.LAVA) {
                            const colorBright = 200 + Math.floor(wave * 30);
                            r = Math.max(0, Math.min(255, colorBright));
                            g = Math.max(0, Math.min(255, colorBright - 100));
                            b = Math.max(0, Math.min(255, colorBright - 150));
                        }

                        for (const [vx, vy, vz] of face.verts) {
                            vertices.push(wx + vx, wy + vy + (face.dir[1] > 0 ? wave : 0), wz + vz);
                            colors.push(r, g, b);
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

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                wireframe: false,
                transparent: true,
                opacity: liquidType === BLOCKS.LAVA ? 0.85 : 0.7,
                side: THREE.FrontSide,
                shininess: liquidType === BLOCKS.LAVA ? 50 : 100
            });

            const mesh = new THREE.Mesh(geometry, material);
            return mesh;
        }

        return null;
    }

    buildWaterMesh(chunk) {
        return this.buildLiquidMesh(chunk, BLOCKS.WATER);
    }

    buildLavaMesh(chunk) {
        return this.buildLiquidMesh(chunk, BLOCKS.LAVA);
    }

    update() {
        this.time += 0.016;
    }
}
