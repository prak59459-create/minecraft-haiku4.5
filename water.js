import { BLOCKS, isBlockSolid } from './blocks.js';

export class WaterRenderer {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.waterMeshes = new Map();
        this.time = 0;
        this.material = new THREE.MeshPhongMaterial({
            color: 0x4A90E2,
            transparent: true,
            opacity: 0.6,
            shininess: 50
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
                    const wy = y;
                    const wz = chunk.z * CHUNK_SIZE + z;

                    const neighbor = (dx, dy, dz) => {
                        return this.world.getBlock(wx + dx, wy + dy, wz + dz);
                    };

                    if (neighbor(0, 1, 0) !== BLOCKS.WATER && neighbor(0, 1, 0) !== BLOCKS.AIR) continue;

                    const startIndex = vertices.length / 3;
                    const verts = [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]];

                    for (const [vx, vy, vz] of verts) {
                        vertices.push(wx + vx, wy + vy, wz + vz);
                    }

                    indices.push(startIndex, startIndex + 1, startIndex + 2);
                    indices.push(startIndex, startIndex + 2, startIndex + 3);
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            geometry.computeVertexNormals();

            const mesh = new THREE.Mesh(geometry, this.material);
            return mesh;
        }

        return null;
    }

    update() {
        this.time += 0.016;
    }
}
