class Chunk {
    constructor(x, z, noise) {
        this.x = x;
        this.z = z;
        this.noise = noise;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);
        this.mesh = null;
        this.loaded = false;
        this.dirty = false;
        this.generate();
    }

    generate() {
        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
                const wx = this.x * CHUNK_SIZE + lx;
                const wz = this.z * CHUNK_SIZE + lz;
                const height = this.noise.getTerrainHeight(wx, wz);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    const blockType = this.noise.getBlockType(wx, y, wz, height);
                    this.setBlock(lx, y, lz, blockType);
                }
            }
        }
        this.loaded = true;
        this.dirty = true;
    }

    getIndex(x, y, z) {
        return x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
    }

    getBlock(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return BLOCK_TYPES.AIR;
        }
        return this.blocks[this.getIndex(x, y, z)];
    }

    setBlock(x, y, z, type) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE) {
            return false;
        }
        this.blocks[this.getIndex(x, y, z)] = type;
        this.dirty = true;
        return true;
    }

    createMesh() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        let indexCount = 0;

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const blockType = this.getBlock(x, y, z);
                    if (blockType === BLOCK_TYPES.AIR) continue;

                    const color = new THREE.Color(BLOCK_COLORS[blockType]);
                    const faces = this.getVisibleFaces(x, y, z, blockType);

                    faces.forEach(([fx, fy, fz, dir]) => {
                        this.addFace(positions, colors, indices, indexCount, x, y, z, dir, color);
                        indexCount += 4;
                    });
                }
            }
        }

        if (positions.length === 0) {
            this.mesh = null;
            return;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            wireframe: false,
            flatShading: true
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x * CHUNK_SIZE, 0, this.z * CHUNK_SIZE);
        this.dirty = false;
    }

    getVisibleFaces(x, y, z, blockType) {
        const faces = [];
        const directions = [
            [x + 1, y, z], [x - 1, y, z],
            [x, y + 1, z], [x, y - 1, z],
            [x, y, z + 1], [x, y, z - 1]
        ];

        directions.forEach((pos, dir) => {
            const neighbor = this.getBlock(pos[0], pos[1], pos[2]);
            if (neighbor === BLOCK_TYPES.AIR || neighbor === BLOCK_TYPES.WATER) {
                faces.push([pos[0], pos[1], pos[2], dir]);
            }
        });

        return faces;
    }

    addFace(positions, colors, indices, indexCount, x, y, z, direction, color) {
        const verts = this.getFaceVertices(x, y, z, direction);
        const offset = indexCount;

        verts.forEach(v => {
            positions.push(...v);
            colors.push(color.r, color.g, color.b);
        });

        indices.push(offset, offset + 1, offset + 2);
        indices.push(offset, offset + 2, offset + 3);
    }

    getFaceVertices(x, y, z, direction) {
        const s = BLOCK_SIZE * 0.5;
        const cx = x + 0.5;
        const cy = y + 0.5;
        const cz = z + 0.5;

        const faceVertices = {
            0: [[cx + s, cy - s, cz + s], [cx + s, cy + s, cz + s], [cx + s, cy + s, cz - s], [cx + s, cy - s, cz - s]],
            1: [[cx - s, cy - s, cz - s], [cx - s, cy + s, cz - s], [cx - s, cy + s, cz + s], [cx - s, cy - s, cz + s]],
            2: [[cx - s, cy + s, cz - s], [cx + s, cy + s, cz - s], [cx + s, cy + s, cz + s], [cx - s, cy + s, cz + s]],
            3: [[cx - s, cy - s, cz + s], [cx + s, cy - s, cz + s], [cx + s, cy - s, cz - s], [cx - s, cy - s, cz - s]],
            4: [[cx + s, cy - s, cz + s], [cx + s, cy + s, cz + s], [cx - s, cy + s, cz + s], [cx - s, cy - s, cz + s]],
            5: [[cx - s, cy - s, cz - s], [cx - s, cy + s, cz - s], [cx + s, cy + s, cz - s], [cx + s, cy - s, cz - s]]
        };

        return faceVertices[direction];
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}
