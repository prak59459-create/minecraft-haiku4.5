import * as THREE from 'three';
import { CHUNK_SIZE, CHUNK_HEIGHT } from './config.js';
import { BLOCK_INFO } from './block-types.js';
import { hash3 } from './utils.js';

const CS = CHUNK_SIZE;

// Corners are wound counter-clockwise when viewed from outside the cube.
const FACES = [
    { dir: [1, 0, 0], shade: 0.8, kind: 'side', corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
    { dir: [-1, 0, 0], shade: 0.8, kind: 'side', corners: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]] },
    { dir: [0, 1, 0], shade: 1.0, kind: 'top', corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
    { dir: [0, -1, 0], shade: 0.5, kind: 'bottom', corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
    { dir: [0, 0, 1], shade: 0.65, kind: 'side', corners: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [0, 0, 1]] },
    { dir: [0, 0, -1], shade: 0.65, kind: 'side', corners: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] }
];

export const MATERIALS = {
    solid: new THREE.MeshBasicMaterial({ vertexColors: true }),
    transparent: new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        side: THREE.DoubleSide
    })
};

class GeometryBuffer {
    constructor() {
        this.positions = [];
        this.colors = [];
        this.indices = [];
    }

    addFace(x, y, z, face, color) {
        const base = this.positions.length / 3;
        for (const c of face.corners) {
            this.positions.push(x + c[0], y + c[1], z + c[2]);
            this.colors.push(color[0], color[1], color[2]);
        }
        this.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    toMesh(material, renderOrder) {
        if (this.indices.length === 0) return null;
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
        geometry.setIndex(this.indices);
        geometry.computeBoundingSphere();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = renderOrder;
        mesh.matrixAutoUpdate = false;
        return mesh;
    }
}

export function buildChunkMesh(world, chunk) {
    const solid = new GeometryBuffer();
    const transparent = new GeometryBuffer();
    const blocks = chunk.blocks;
    const ox = chunk.cx * CS;
    const oz = chunk.cz * CS;
    const color = [0, 0, 0];

    for (let y = 0; y < CHUNK_HEIGHT; y++) {
        for (let z = 0; z < CS; z++) {
            for (let x = 0; x < CS; x++) {
                const id = blocks[(y * CS + z) * CS + x];
                if (id === 0) continue;
                const info = BLOCK_INFO[id];
                const target = info.transparent ? transparent : solid;
                const tint = 0.9 + hash3(ox + x, y, oz + z) * 0.1;

                for (const face of FACES) {
                    const nx = x + face.dir[0];
                    const ny = y + face.dir[1];
                    const nz = z + face.dir[2];
                    let neighbor;
                    if (ny < 0) continue;
                    if (ny >= CHUNK_HEIGHT) neighbor = 0;
                    else if (nx >= 0 && nx < CS && nz >= 0 && nz < CS) neighbor = blocks[(ny * CS + nz) * CS + nx];
                    else neighbor = world.getBlock(ox + nx, ny, oz + nz);

                    if (neighbor === id || BLOCK_INFO[neighbor].opaque) continue;

                    const base = info[face.kind];
                    const k = face.shade * tint;
                    color[0] = base[0] * k;
                    color[1] = base[1] * k;
                    color[2] = base[2] * k;
                    target.addFace(x, y, z, face, color);
                }
            }
        }
    }

    const meshes = [];
    const solidMesh = solid.toMesh(MATERIALS.solid, 0);
    const transparentMesh = transparent.toMesh(MATERIALS.transparent, 1);
    for (const mesh of [solidMesh, transparentMesh]) {
        if (!mesh) continue;
        mesh.position.set(ox, 0, oz);
        mesh.updateMatrix();
        meshes.push(mesh);
    }
    return meshes;
}
