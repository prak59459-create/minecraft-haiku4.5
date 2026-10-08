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
        const waterColor = new THREE.Color(0x4A90E2);
        const baseColorR = Math.floor(waterColor.r * 255);
        const baseColorG = Math.floor(waterColor.g * 255);
        const baseColorB = Math.floor(waterColor.b * 255);

        const faces = [
            { dir: [1, 0, 0], verts: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] },
            { dir: [-1, 0, 0], verts: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]] },
            { dir: [0, 1, 0], verts: [[0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1]] },
            { dir: [0, -1, 0], verts: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]] },
            { dir: [0, 0, 1], verts: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]] },
            { dir: [0, 0, -1], verts: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]] }
        ];

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 1; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId !== BLOCKS.WATER) continue;

                    const wx = chunk.x * CHUNK_SIZE + x;
                    const wy = y;
                    const wz = chunk.z * CHUNK_SIZE + z;

                    const variance = 0.8 + Math.random() * 0.2;
                    const r = Math.floor(baseColorR * variance);
                    const g = Math.floor(baseColorG * variance);
                    const b = Math.floor(baseColorB * variance);

                    for (const face of faces) {
                        const [dx, dy, dz] = face.dir;
                        const neighborBlock = this.world.getBlock(wx + dx, wy + dy, wz + dz);

                        if (neighborBlock !== BLOCKS.AIR && neighborBlock !== BLOCKS.WATER) continue;

                        const startIndex = vertices.length / 3;

                        for (const [vx, vy, vz] of face.verts) {
                            vertices.push(wx + vx, wy + vy, wz + vz);
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
    }
}
