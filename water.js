import { BLOCKS, isBlockSolid } from './blocks.js';

export class WaterRenderer {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.waterMeshes = new Map();
        this.time = 0;
        this.waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x4A90E2,
            transparent: true,
            opacity: 0.5,
            emissive: 0x2A5AE2,
            emissiveIntensity: 0.2,
            side: THREE.FrontSide
        });
    }

    buildWaterMesh(chunk) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];

        const CHUNK_SIZE = 16;
        const WORLD_HEIGHT = 256;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 1; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId !== BLOCKS.WATER) continue;

                    const wx = chunk.x * CHUNK_SIZE + x;
                    const wy = y + 0.8;
                    const wz = chunk.z * CHUNK_SIZE + z;

                    const faces = [
                        { dir: [1, 0, 0], verts: [[0, 0, 0], [0, 0.8, 0], [0, 0.8, 1], [0, 0, 1]] },
                        { dir: [-1, 0, 0], verts: [[1, 0, 1], [1, 0.8, 1], [1, 0.8, 0], [1, 0, 0]] },
                        { dir: [0, 1, 0], verts: [[0, 0.8, 1], [0, 0.8, 0], [1, 0.8, 0], [1, 0.8, 1]] },
                        { dir: [0, -1, 0], verts: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]] },
                        { dir: [0, 0, 1], verts: [[1, 0, 0], [1, 0.8, 0], [0, 0.8, 0], [0, 0, 0]] },
                        { dir: [0, 0, -1], verts: [[0, 0, 1], [0, 0.8, 1], [1, 0.8, 1], [1, 0, 1]] }
                    ];

                    for (const face of faces) {
                        const [dx, dy, dz] = face.dir;
                        const neighborBlock = this.world.getBlock(wx + dx, wy + dy - 0.8, wz + dz);

                        if (neighborBlock !== BLOCKS.AIR && neighborBlock !== BLOCKS.WATER) continue;

                        const startIndex = vertices.length / 3;
                        for (const [vx, vy, vz] of face.verts) {
                            vertices.push(wx + vx, wy + vy - 0.8, wz + vz);
                        }

                        indices.push(startIndex, startIndex + 1, startIndex + 2, startIndex, startIndex + 2, startIndex + 3);
                    }
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            if (indices.length > 0) {
                geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            }
            geometry.computeVertexNormals();

            const mesh = new THREE.Mesh(geometry, this.waterMaterial);
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
