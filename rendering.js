class Renderer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87ceeb);
        this.renderer.shadowMap.enabled = false;
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        document.body.appendChild(this.renderer.domElement);

        this.chunkMeshes = new Map();
        this.light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
        this.scene.add(this.light);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(100, 100, 100);
        this.scene.add(this.directionalLight);

        this.fog = new THREE.Fog(0x87ceeb, 100, 400);
        this.scene.fog = this.fog;

        this.timeOfDay = 0;
        this.setupLighting();
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        this.light.intensity = 1;
        this.directionalLight.intensity = 0.8;
    }

    updateTime(time) {
        this.timeOfDay = time % 20000;
        const timePercent = this.timeOfDay / 20000;
        const sunRotation = timePercent * Math.PI * 2 - Math.PI / 2;

        const sunY = Math.sin(sunRotation) * 150;
        const sunX = Math.cos(sunRotation) * 150;

        this.directionalLight.position.set(sunX, Math.max(10, sunY), 150);

        const brightness = Math.max(0.3, Math.sin(sunRotation) + 0.5);
        this.directionalLight.intensity = brightness;
        this.light.intensity = brightness * 0.5 + 0.5;

        const skyColor = this.getSkyColor(timePercent);
        this.renderer.setClearColor(skyColor);
        this.updateFog(timePercent);
    }

    getSkyColor(timePercent) {
        if (timePercent < 0.25 || timePercent > 0.75) {
            return 0x1a1a2e;
        }
        if (timePercent < 0.35) {
            const t = (timePercent - 0.25) / 0.1;
            return new THREE.Color().lerpColors(
                new THREE.Color(0x1a1a2e),
                new THREE.Color(0x87ceeb),
                t
            ).getHex();
        }
        if (timePercent > 0.65) {
            const t = (timePercent - 0.65) / 0.1;
            return new THREE.Color().lerpColors(
                new THREE.Color(0x87ceeb),
                new THREE.Color(0x1a1a2e),
                t
            ).getHex();
        }
        return 0x87ceeb;
    }

    updateFog(timePercent) {
        const skyColor = this.getSkyColor(timePercent);
        this.fog.color.setHex(skyColor);
    }

    renderChunk(world, chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        if (world.isChunkModified(chunkX, chunkZ) && this.chunkMeshes.has(key)) {
            const oldMesh = this.chunkMeshes.get(key);
            this.scene.remove(oldMesh);
            oldMesh.geometry.dispose();
            oldMesh.material.dispose();
            this.chunkMeshes.delete(key);
            world.clearChunkModified(chunkX, chunkZ);
        }
        if (this.chunkMeshes.has(key)) {
            return this.chunkMeshes.get(key);
        }

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const indices = [];
        let vertexCount = 0;

        const chunk = world.getChunk(chunkX, chunkZ);
        const worldX = chunkX * 16;
        const worldZ = chunkZ * 16;

        for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 256; y++) {
                for (let z = 0; z < 16; z++) {
                    const idx = x + y * 16 + z * 16 * 256;
                    const blockId = chunk[idx];

                    if (blockId === BLOCKS.AIR.id || blockId === BLOCKS.WATER.id) continue;

                    const blockX = worldX + x;
                    const blockY = y;
                    const blockZ = worldZ + z;
                    const color = getBlockColor(blockId);

                    this.addBlockFace(positions, colors, indices, vertexCount, blockX, blockY, blockZ, color, 0, 0, 0, world);
                    this.addBlockFace(positions, colors, indices, vertexCount, blockX, blockY, blockZ, color, 1, 0, 0, world);
                    this.addBlockFace(positions, colors, indices, vertexCount, blockX, blockY, blockZ, color, 2, 0, 0, world);
                    this.addBlockFace(positions, colors, indices, vertexCount, blockX, blockY, blockZ, color, 3, 0, 0, world);
                    this.addBlockFace(positions, colors, indices, vertexCount, blockX, blockY, blockZ, color, 4, 0, 0, world);
                    this.addBlockFace(positions, colors, indices, vertexCount, blockX, blockY, blockZ, color, 5, 0, 0, world);
                }
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Uint8Array(colors), 3, true));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            flatShading: true,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.chunkMeshes.set(key, mesh);

        return mesh;
    }

    addBlockFace(positions, colors, indices, vertexCount, x, y, z, color, face, checkAdjacent, dummy, world) {
        const neighbors = {
            0: (bx, by, bz) => world.getBlock(bx, by + 1, bz), // top
            1: (bx, by, bz) => world.getBlock(bx, by - 1, bz), // bottom
            2: (bx, by, bz) => world.getBlock(bx, by, bz - 1), // front
            3: (bx, by, bz) => world.getBlock(bx, by, bz + 1), // back
            4: (bx, by, bz) => world.getBlock(bx - 1, by, bz), // left
            5: (bx, by, bz) => world.getBlock(bx + 1, by, bz)  // right
        };

        const neighborBlockId = neighbors[face](x, y, z);
        if (isBlockSolid(neighborBlockId)) return;

        const r = (color >> 16) & 255;
        const g = (color >> 8) & 255;
        const b = color & 255;

        const faceMap = {
            0: { verts: [[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]] },
            1: { verts: [[x, y, z], [x, y, z + 1], [x + 1, y, z + 1], [x + 1, y, z]] },
            2: { verts: [[x, y, z], [x + 1, y, z], [x + 1, y + 1, z], [x, y + 1, z]] },
            3: { verts: [[x + 1, y, z + 1], [x, y, z + 1], [x, y + 1, z + 1], [x + 1, y + 1, z + 1]] },
            4: { verts: [[x, y, z + 1], [x, y, z], [x, y + 1, z], [x, y + 1, z + 1]] },
            5: { verts: [[x + 1, y, z], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z]] }
        };

        const verts = faceMap[face].verts;
        const startIdx = vertexCount;

        for (let v of verts) {
            positions.push(...v);
            colors.push(r, g, b);
        }

        indices.push(
            startIdx, startIdx + 1, startIdx + 2,
            startIdx, startIdx + 2, startIdx + 3
        );
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    clearChunks() {
        this.chunkMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        this.chunkMeshes.clear();
    }
}

function updateBlockSelector() {
    const selector = document.getElementById('block-selector');
    const block = BLOCK_TYPES[game.player.selectedIndex];
    selector.textContent = `📦 ${block.name}`;
}

function updateInventoryDisplay() {
    const inventory = document.getElementById('inventory');
    inventory.innerHTML = '';
    const blockEmojis = ['🌱', '⬜', '🪨', '🌳', '🍃', '💧', '🏖️', '⬛', '📦', '🪵', '🌲', '🌕', '🪵'];
    for (let i = 0; i < Math.min(9, BLOCK_TYPES.length); i++) {
        const block = BLOCK_TYPES[i];
        const item = document.createElement('div');
        item.className = 'inventory-item' + (i === game.player.selectedIndex ? ' selected' : '');
        item.textContent = blockEmojis[i] || (i + 1);
        item.title = `${block.name} (${i + 1})`;
        item.style.backgroundColor = '#' + block.color.toString(16).padStart(6, '0');
        inventory.appendChild(item);
    }
}
