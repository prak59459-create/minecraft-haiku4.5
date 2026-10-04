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
        let vertexCount = 0;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 1; y < WORLD_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);
                    if (blockId !== BLOCKS.WATER) continue;

                    const wx = chunk.x * CHUNK_SIZE + x;
                    const wy = y;
                    const wz = chunk.z * CHUNK_SIZE + z;

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
                        const nx = wx + dx;
                        const ny = wy + dy;
                        const nz = wz + dz;
                        const neighborBlock = this.world.getBlock(nx, ny, nz);

                        if (neighborBlock !== BLOCKS.AIR && neighborBlock !== BLOCKS.WATER) continue;

                        const baseColor = waterColor.clone().multiplyScalar(0.8 + Math.sin(this.time + wx * 0.1 + wz * 0.1) * 0.1);

                        for (const [vx, vy, vz] of face.verts) {
                            vertices.push(wx + vx, wy + vy, wz + vz);
                            colors.push(
                                Math.floor(baseColor.r * 255),
                                Math.floor(baseColor.g * 255),
                                Math.floor(baseColor.b * 255)
                            );
                        }

                        indices.push(vertexCount, vertexCount + 1, vertexCount + 2);
                        indices.push(vertexCount, vertexCount + 2, vertexCount + 3);
                        vertexCount += 4;
                    }
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
            if (indices.length > 0) {
                geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            }

            const material = new THREE.MeshPhongMaterial({
                vertexColors: true,
                wireframe: false,
                transparent: true,
                opacity: 0.6,
                side: THREE.FrontSide,
                shininess: 100
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData.geometry = geometry;
            return mesh;
        }

        return null;
    }

    updateVisibleWater(playerChunkX, playerChunkZ) {
        const renderDistance = 8;
        const chunksToRender = new Set();

        for (const [key, chunk] of this.world.chunks) {
            const [cx, cz] = key.split(',').map(Number);

            if (Math.abs(cx - playerChunkX) <= renderDistance && Math.abs(cz - playerChunkZ) <= renderDistance) {
                if (!this.waterMeshes.has(key)) {
                    const mesh = this.buildWaterMesh(chunk);
                    if (mesh) {
                        this.scene.add(mesh);
                        this.waterMeshes.set(key, mesh);
                    }
                }
                chunksToRender.add(key);
            }
        }

        const meshesToRemove = [];
        for (const [key] of this.waterMeshes) {
            if (!chunksToRender.has(key)) {
                meshesToRemove.push(key);
            }
        }

        meshesToRemove.forEach(key => {
            const mesh = this.waterMeshes.get(key);
            if (mesh) {
                this.scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                this.waterMeshes.delete(key);
            }
        });
    }

    update(playerX, playerZ) {
        this.time += 0.016;
        const playerChunkX = Math.floor(playerX / 16);
        const playerChunkZ = Math.floor(playerZ / 16);
        this.updateVisibleWater(playerChunkX, playerChunkZ);
    }
}
