class GameRenderer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(CONFIG.FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(CONFIG.FOG_COLOR);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);

        this.scene.fog = new THREE.Fog(CONFIG.FOG_COLOR, CONFIG.FOG_NEAR, CONFIG.FOG_FAR);

        document.body.appendChild(this.renderer.domElement);

        this.light = new THREE.DirectionalLight(0xffffff, 0.8);
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = 1024;
        this.light.shadow.mapSize.height = 1024;
        this.light.shadow.camera.near = 0.5;
        this.light.shadow.camera.far = 500;
        this.light.shadow.camera.left = -200;
        this.light.shadow.camera.right = 200;
        this.light.shadow.camera.top = 200;
        this.light.shadow.camera.bottom = -200;
        this.light.shadow.bias = -0.0001;
        this.scene.add(this.light);
        this.scene.add(this.light.target);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        this.chunkMeshes = new Map();
        this.time = 0;

        window.addEventListener('resize', () => this.onWindowResize());

        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({ color: 0x87ceeb });
        const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
        this.skyMesh = skyMesh;
        this.scene.add(skyMesh);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    buildChunkMesh(chunk) {
        if (!chunk.isDirty && chunk.mesh) return chunk.mesh;

        if (chunk.mesh) {
            if (Array.isArray(chunk.mesh)) {
                chunk.mesh.forEach(m => this.scene.remove(m));
                chunk.mesh.forEach(m => {
                    m.geometry.dispose();
                    m.material.dispose();
                });
            } else {
                this.scene.remove(chunk.mesh);
                chunk.mesh.geometry.dispose();
                chunk.mesh.material.dispose();
            }
        }

        const opaqueData = { vertices: [], normals: [], colors: [], indices: [] };
        const transparentData = { vertices: [], normals: [], colors: [], indices: [] };

        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            for (let y = 0; y < CONFIG.CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
                    const block = chunk.getBlock(x, y, z);
                    if (block === BLOCK_TYPES.AIR) continue;

                    const props = BLOCK_PROPERTIES[block];
                    const [r, g, b] = props.color;
                    const color = [r / 255, g / 255, b / 255];

                    const data = props.transparent ? transparentData : opaqueData;
                    const vertexIndex = data.indices.length / 3;

                    this.addBlockFaces(chunk, x, y, z, block, data.vertices, data.normals, data.colors, data.indices, vertexIndex, color);
                }
            }
        }

        const meshes = [];

        if (opaqueData.vertices.length > 0) {
            const mesh = this.createMesh(opaqueData, false);
            mesh.position.set(chunk.x * CONFIG.CHUNK_SIZE, 0, chunk.z * CONFIG.CHUNK_SIZE);
            this.scene.add(mesh);
            meshes.push(mesh);
        }

        if (transparentData.vertices.length > 0) {
            const mesh = this.createMesh(transparentData, true);
            mesh.position.set(chunk.x * CONFIG.CHUNK_SIZE, 0, chunk.z * CONFIG.CHUNK_SIZE);
            this.scene.add(mesh);
            meshes.push(mesh);
        }

        chunk.mesh = meshes.length === 0 ? null : (meshes.length === 1 ? meshes[0] : meshes);
        chunk.isDirty = false;

        return chunk.mesh;
    }

    shouldRenderFace(chunk, x, y, z, isSelfTransparent) {
        const adjacentBlock = chunk.getBlock(x, y, z);
        if (adjacentBlock === BLOCK_TYPES.AIR) return true;

        const adjacentProps = BLOCK_PROPERTIES[adjacentBlock];
        if (adjacentProps.transparent === isSelfTransparent) return false;

        return true;
    }

    createMesh(data, isTransparent) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(data.vertices), 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(data.normals), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(data.colors), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(data.indices), 1));

        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.FrontSide,
            flatShading: false,
            transparent: isTransparent,
            opacity: isTransparent ? 0.8 : 1.0
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = !isTransparent;
        mesh.receiveShadow = true;

        return mesh;
    }

    addBlockFaces(chunk, x, y, z, block, vertices, normals, colors, indices, startIndex, color) {
        const size = CONFIG.BLOCK_SIZE;

        const faces = [
            { dir: [1, 0, 0], verts: [[x+size,y,z],[x+size,y+size,z],[x+size,y+size,z+size],[x+size,y,z+size]], norm: [1,0,0] },
            { dir: [-1, 0, 0], verts: [[x,y,z+size],[x,y+size,z+size],[x,y+size,z],[x,y,z]], norm: [-1,0,0] },
            { dir: [0, 1, 0], verts: [[x,y+size,z],[x,y+size,z+size],[x+size,y+size,z+size],[x+size,y+size,z]], norm: [0,1,0] },
            { dir: [0, -1, 0], verts: [[x,y,z+size],[x+size,y,z+size],[x+size,y,z],[x,y,z]], norm: [0,-1,0] },
            { dir: [0, 0, 1], verts: [[x,y,z+size],[x,y+size,z+size],[x+size,y+size,z+size],[x+size,y,z+size]], norm: [0,0,1] },
            { dir: [0, 0, -1], verts: [[x+size,y,z],[x+size,y+size,z],[x,y+size,z],[x,y,z]], norm: [0,0,-1] }
        ];

        const checkX = [x+faces[0].dir[0], x+faces[1].dir[0]];
        const checkY = [y+faces[2].dir[1], y+faces[3].dir[1]];
        const checkZ = [z+faces[4].dir[2], z+faces[5].dir[2]];

        const isSelfTransparent = BLOCK_PROPERTIES[block].transparent;

        const facesToRender = [
            this.shouldRenderFace(chunk, checkX[0], y, z, isSelfTransparent),
            this.shouldRenderFace(chunk, checkX[1], y, z, isSelfTransparent),
            this.shouldRenderFace(chunk, x, checkY[0], z, isSelfTransparent),
            this.shouldRenderFace(chunk, x, checkY[1], z, isSelfTransparent),
            this.shouldRenderFace(chunk, x, y, checkZ[0], isSelfTransparent),
            this.shouldRenderFace(chunk, x, y, checkZ[1], isSelfTransparent)
        ];

        for (let i = 0; i < faces.length; i++) {
            if (!facesToRender[i]) continue;

            const face = faces[i];
            const baseIndex = indices.length / 3;

            for (const vert of face.verts) {
                vertices.push(vert[0], vert[1], vert[2]);
                normals.push(...face.norm);
                colors.push(...color);
            }

            indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
            indices.push(baseIndex, baseIndex + 2, baseIndex + 3);
        }
    }

    updateChunks(world, playerX, playerZ) {
        const playerChunkX = Math.floor(playerX / CONFIG.CHUNK_SIZE);
        const playerChunkZ = Math.floor(playerZ / CONFIG.CHUNK_SIZE);
        const renderDist = CONFIG.RENDER_DISTANCE;

        for (let cx = playerChunkX - renderDist; cx <= playerChunkX + renderDist; cx++) {
            for (let cz = playerChunkZ - renderDist; cz <= playerChunkZ + renderDist; cz++) {
                const chunk = world.getChunk(cx, cz);
                if (chunk && chunk.isDirty) {
                    this.buildChunkMesh(chunk);
                }
            }
        }
    }

    updateSkyLight(time) {
        const dayDuration = CONFIG.DAY_DURATION / 1000;
        const timeOfDay = (time % dayDuration) / dayDuration;

        const nightStart = CONFIG.NIGHT_START / 24;
        const nightEnd = CONFIG.NIGHT_END / 24;

        let brightness = 0.8;
        let skyColor = 0x87ceeb;

        if (timeOfDay > nightStart && timeOfDay < nightEnd) {
            const nightProgress = (timeOfDay - nightStart) / (nightEnd - nightStart);
            brightness = 0.2 + Math.cos(nightProgress * Math.PI) * 0.3;
            skyColor = 0x0a0a2e;
        } else if (timeOfDay < 0.25) {
            const dawnProgress = timeOfDay / 0.25;
            brightness = 0.2 + dawnProgress * 0.6;
            skyColor = Utils.lerpColor(0x0a0a2e, 0x87ceeb, dawnProgress);
        } else if (timeOfDay > 0.75) {
            const duskProgress = (timeOfDay - 0.75) / 0.25;
            brightness = 0.8 - duskProgress * 0.6;
            skyColor = Utils.lerpColor(0x87ceeb, 0xff6b9d, duskProgress);
        } else {
            brightness = 0.8;
            skyColor = 0x87ceeb;
        }

        this.skyMesh.material.color.setHex(skyColor);
        this.light.intensity = brightness;
        this.scene.children[1].intensity = 0.3 + brightness * 0.3;
    }

    render(player) {
        this.camera.position.copy(player.getEyePosition());
        this.camera.lookAt(player.cameraTarget);
        this.renderer.render(this.scene, this.camera);
    }
}
