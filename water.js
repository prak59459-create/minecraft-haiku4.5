import { BLOCKS, isBlockSolid } from './blocks.js';

export class WaterRenderer {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.waterMeshes = new Map();
        this.time = 0;
        this.createWaterShader();
    }

    createWaterShader() {
        this.waterShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                waterColor: { value: new THREE.Color(0x4A90E2) }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform float time;

                void main() {
                    vUv = uv;
                    vPosition = position;

                    vec3 pos = position;
                    pos.y += sin(position.x * 0.5 + time) * 0.05;
                    pos.y += cos(position.z * 0.5 + time) * 0.05;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 waterColor;
                varying vec2 vUv;
                varying vec3 vPosition;

                void main() {
                    float wave = sin(vPosition.x * 0.5 + time) * 0.5 + 0.5;
                    wave += cos(vPosition.z * 0.5 + time) * 0.5;

                    vec3 color = waterColor * (0.7 + wave * 0.2);
                    gl_FragColor = vec4(color, 0.6);
                }
            `,
            side: THREE.FrontSide,
            transparent: true
        });
    }

    buildWaterMesh(chunk) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const uvs = [];
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

                    const faces = [
                        { dir: [1, 0, 0], verts: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]], uvs: [[0, 0], [1, 0], [1, 1], [0, 1]] },
                        { dir: [-1, 0, 0], verts: [[1, 0, 1], [1, 1, 1], [1, 1, 0], [1, 0, 0]], uvs: [[0, 0], [1, 0], [1, 1], [0, 1]] },
                        { dir: [0, 1, 0], verts: [[0, 1, 1], [0, 1, 0], [1, 1, 0], [1, 1, 1]], uvs: [[0, 0], [1, 0], [1, 1], [0, 1]] },
                        { dir: [0, -1, 0], verts: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]], uvs: [[0, 0], [1, 0], [1, 1], [0, 1]] },
                        { dir: [0, 0, 1], verts: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 0]], uvs: [[0, 0], [1, 0], [1, 1], [0, 1]] },
                        { dir: [0, 0, -1], verts: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]], uvs: [[0, 0], [1, 0], [1, 1], [0, 1]] }
                    ];

                    for (const face of faces) {
                        const [dx, dy, dz] = face.dir;
                        const neighborBlock = neighbor(dx, dy, dz);

                        if (neighborBlock !== BLOCKS.AIR && neighborBlock !== BLOCKS.WATER) continue;

                        const startIndex = vertices.length / 3;
                        for (let i = 0; i < face.verts.length; i++) {
                            const [vx, vy, vz] = face.verts[i];
                            vertices.push(wx + vx, wy + vy, wz + vz);
                            uvs.push(...face.uvs[i]);
                        }

                        indices.push(startIndex, startIndex + 1, startIndex + 2);
                        indices.push(startIndex, startIndex + 2, startIndex + 3);
                    }
                }
            }
        }

        if (vertices.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
            geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
            geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
            geometry.computeVertexNormals();

            const mesh = new THREE.Mesh(geometry, this.waterShaderMaterial);
            return mesh;
        }

        return null;
    }

    update() {
        this.time += 0.016;
        this.waterShaderMaterial.uniforms.time.value = this.time;
    }
}
