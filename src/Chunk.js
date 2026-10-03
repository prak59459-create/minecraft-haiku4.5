import * as THREE from 'three'
import { BlockTypes } from './BlockTypes.js'

export default class Chunk {
  constructor(chunkX, chunkZ, size, noise) {
    this.chunkX = chunkX
    this.chunkZ = chunkZ
    this.size = size
    this.height = 256
    this.noise = noise

    this.blocks = new Uint8Array(size * size * this.height)
    this.mesh = null
    this.isDirty = true
  }

  generate() {
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        this.generateColumn(x, z)
      }
    }
    this.rebuild()
  }

  generateColumn(x, z) {
    const worldX = this.chunkX * this.size + x
    const worldZ = this.chunkZ * this.size + z

    const baseHeight = this.getTerrainHeight(worldX, worldZ)

    for (let y = 0; y < this.height; y++) {
      if (y === 0) {
        this.setBlock(x, y, z, BlockTypes.BEDROCK)
      } else if (y < baseHeight - 3) {
        this.setBlock(x, y, z, BlockTypes.STONE)
      } else if (y < baseHeight) {
        this.setBlock(x, y, z, BlockTypes.DIRT)
      } else if (y === baseHeight) {
        this.setBlock(x, y, z, BlockTypes.GRASS)
      } else if (y < baseHeight + 1 && Math.random() < 0.3) {
        this.setBlock(x, y, z, BlockTypes.GRASS)
      } else if (y === baseHeight + 1 && Math.random() < 0.1) {
        this.setBlock(x, y, z, BlockTypes.LEAVES)
      }
    }
  }

  getTerrainHeight(x, z) {
    const scale1 = this.noise.noise2D(x * 0.01, z * 0.01) * 30
    const scale2 = this.noise.noise2D(x * 0.05, z * 0.05) * 15
    const scale3 = this.noise.noise2D(x * 0.1, z * 0.1) * 8

    const height = scale1 + scale2 + scale3 + 64
    return Math.max(4, Math.min(150, Math.floor(height)))
  }

  getBlock(x, y, z) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
      return 0
    }
    return this.blocks[y * this.size * this.size + z * this.size + x]
  }

  setBlock(x, y, z, type) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.height || z < 0 || z >= this.size) {
      return false
    }
    const index = y * this.size * this.size + z * this.size + x
    if (this.blocks[index] === type) return false
    this.blocks[index] = type
    this.isDirty = true
    return true
  }

  rebuild() {
    if (this.mesh) {
      this.mesh.geometry.dispose()
      this.mesh.material.dispose()
    }

    const geometry = new THREE.BufferGeometry()
    const positions = []
    const normals = []
    const colors = []
    const indices = []

    let vertexIndex = 0

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.size; z++) {
          const blockType = this.getBlock(x, y, z)
          if (blockType === 0) continue

          const blockColor = BlockTypes.getColor(blockType)

          const faces = [
            { offset: [0, 0, 1], normal: [0, 0, 1] },
            { offset: [0, 0, -1], normal: [0, 0, -1] },
            { offset: [1, 0, 0], normal: [1, 0, 0] },
            { offset: [-1, 0, 0], normal: [-1, 0, 0] },
            { offset: [0, 1, 0], normal: [0, 1, 0] },
            { offset: [0, -1, 0], normal: [0, -1, 0] }
          ]

          for (const face of faces) {
            const adjX = x + face.offset[0]
            const adjY = y + face.offset[1]
            const adjZ = z + face.offset[2]

            const neighbor = this.getBlock(adjX, adjY, adjZ)
            if (neighbor !== 0) continue

            const base = [x, y, z]
            const verts = this.getFaceVertices(face.offset, base)

            const startIndex = vertexIndex
            for (const v of verts) {
              positions.push(...v)
              normals.push(...face.normal)
              colors.push(blockColor.r, blockColor.g, blockColor.b)
            }

            indices.push(startIndex, startIndex + 1, startIndex + 2)
            indices.push(startIndex, startIndex + 2, startIndex + 3)

            vertexIndex += 4
          }
        }
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1))

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      flatShading: true
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.position.set(this.chunkX * this.size, 0, this.chunkZ * this.size)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

    this.isDirty = false
  }

  getFaceVertices(faceOffset, blockPos) {
    const x = blockPos[0], y = blockPos[1], z = blockPos[2]

    if (faceOffset[2] === 1) {
      return [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]]
    } else if (faceOffset[2] === -1) {
      return [[x + 1, y, z], [x, y, z], [x, y + 1, z], [x + 1, y + 1, z]]
    } else if (faceOffset[0] === 1) {
      return [[x + 1, y, z], [x + 1, y, z + 1], [x + 1, y + 1, z + 1], [x + 1, y + 1, z]]
    } else if (faceOffset[0] === -1) {
      return [[x, y, z + 1], [x, y, z], [x, y + 1, z], [x, y + 1, z + 1]]
    } else if (faceOffset[1] === 1) {
      return [[x, y + 1, z], [x + 1, y + 1, z], [x + 1, y + 1, z + 1], [x, y + 1, z + 1]]
    } else {
      return [[x, y, z + 1], [x + 1, y, z + 1], [x + 1, y, z], [x, y, z]]
    }
  }

  dispose() {
    if (this.mesh && this.mesh.geometry) {
      this.mesh.geometry.dispose()
      this.mesh.material.dispose()
    }
  }
}
