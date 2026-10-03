class WaterSystem {
    constructor(scene) {
        this.scene = scene;
        this.waterMeshes = new Map();
    }

    createWaterMesh(chunkX, chunkZ, world) {
        const hash = hashChunkCoords(chunkX, chunkZ);
        if (this.waterMeshes.has(hash)) {
            this.scene.remove(this.waterMeshes.get(hash));
        }

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];

        let vertexIndex = 0;
        const chunk = world.chunks.get(hash);

        if (!chunk) return null;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockId = chunk.getBlock(x, y, z);

                    if (blockId !== BLOCKS.WATER) continue;

                    // Create water cube with transparency
                    // Top face only (water surfaces are visible from above)
                    const topBlockId = y + 1 >= CHUNK_HEIGHT ? BLOCKS.AIR : chunk.getBlock(x, y + 1, z);

                    if (!isBlockSolid(topBlockId) || topBlockId === BLOCKS.WATER) {
                        const posX = chunkX * CHUNK_SIZE + x;
                        const posY = y;
                        const posZ = chunkZ * CHUNK_SIZE + z;

                        // Add slight wave effect
                        const waveOffset = Math.sin((posX + posZ) * 0.2) * 0.1;

                        vertices.push(
                            x, y + 1 + waveOffset, z,
                            x + 1, y + 1 + waveOffset, z,
                            x + 1, y + 1 + waveOffset, z + 1,
                            x, y + 1 + waveOffset, z + 1
                        );

                        indices.push(
                            vertexIndex, vertexIndex + 1, vertexIndex + 2,
                            vertexIndex, vertexIndex + 2, vertexIndex + 3
                        );

                        vertexIndex += 4;
                    }
                }
            }
        }

        if (vertices.length === 0) return null;

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

        const material = new THREE.MeshPhongMaterial({
            color: 0x4fa3ff,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);

        this.scene.add(mesh);
        this.waterMeshes.set(hash, mesh);

        return mesh;
    }

    cleanup(renderDistance) {
        const toRemove = [];

        for (const [hash, mesh] of this.waterMeshes.entries()) {
            const [cx, cz] = unhashChunkCoords(hash);
            const distance = Math.max(Math.abs(cx), Math.abs(cz));

            if (distance > renderDistance + 2) {
                this.scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
                toRemove.push(hash);
            }
        }

        toRemove.forEach(hash => this.waterMeshes.delete(hash));
    }
}
