import * as THREE from 'three'
import Chunk from './Chunk.js'
import { SimplexNoise } from 'simplex-noise'

export default class World {
  constructor(scene) {
    this.scene = scene
    this.chunkSize = 16
    this.chunks = new Map()
    this.activeChunks = new Set()
    this.noise = new SimplexNoise()
    this.renderDistance = 5

    this.scene.background = new THREE.Color(0x87CEEB)
    this.scene.fog = new THREE.Fog(0x87CEEB, 200, 500)
  }

  update(playerPosition) {
    const chunkX = Math.floor(playerPosition.x / this.chunkSize)
    const chunkZ = Math.floor(playerPosition.z / this.chunkSize)

    const chunksToLoad = new Set()

    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
        const key = `${chunkX + x},${chunkZ + z}`
        chunksToLoad.add(key)

        if (!this.chunks.has(key)) {
          this.loadChunk(chunkX + x, chunkZ + z)
        }
      }
    }

    for (const key of this.activeChunks) {
      if (!chunksToLoad.has(key)) {
        this.unloadChunk(key)
      }
    }

    this.activeChunks = chunksToLoad
  }

  loadChunk(chunkX, chunkZ) {
    const key = `${chunkX},${chunkZ}`

    if (this.chunks.has(key)) return

    const chunk = new Chunk(chunkX, chunkZ, this.chunkSize, this.noise)
    chunk.generate()
    this.scene.add(chunk.mesh)

    this.chunks.set(key, chunk)
  }

  unloadChunk(key) {
    const chunk = this.chunks.get(key)
    if (chunk) {
      this.scene.remove(chunk.mesh)
      chunk.dispose()
      this.chunks.delete(key)
    }
    this.activeChunks.delete(key)
  }

  getBlock(x, y, z) {
    if (y < 0 || y >= 256) return 0

    const chunkX = Math.floor(x / this.chunkSize)
    const chunkZ = Math.floor(z / this.chunkSize)
    const key = `${chunkX},${chunkZ}`

    const chunk = this.chunks.get(key)
    if (!chunk) return 0

    const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize
    const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize

    return chunk.getBlock(localX, y, localZ)
  }

  setBlock(x, y, z, type) {
    if (y < 0 || y >= 256) return false

    const chunkX = Math.floor(x / this.chunkSize)
    const chunkZ = Math.floor(z / this.chunkSize)
    const key = `${chunkX},${chunkZ}`

    const chunk = this.chunks.get(key)
    if (!chunk) return false

    const localX = ((x % this.chunkSize) + this.chunkSize) % this.chunkSize
    const localZ = ((z % this.chunkSize) + this.chunkSize) % this.chunkSize

    const changed = chunk.setBlock(localX, y, localZ, type)
    if (changed) {
      chunk.rebuild()
      this.rebuildAdjacentChunks(chunkX, chunkZ, localX, localZ)
    }

    return changed
  }

  rebuildAdjacentChunks(chunkX, chunkZ, localX, localZ) {
    if (localX === 0) {
      const west = this.chunks.get(`${chunkX - 1},${chunkZ}`)
      if (west) west.rebuild()
    }
    if (localX === this.chunkSize - 1) {
      const east = this.chunks.get(`${chunkX + 1},${chunkZ}`)
      if (east) east.rebuild()
    }
    if (localZ === 0) {
      const north = this.chunks.get(`${chunkX},${chunkZ - 1}`)
      if (north) north.rebuild()
    }
    if (localZ === this.chunkSize - 1) {
      const south = this.chunks.get(`${chunkX},${chunkZ + 1}`)
      if (south) south.rebuild()
    }
  }

  raycast(origin, direction, maxDistance = 1000) {
    let currentPos = origin.clone()
    const step = 0.05
    let distance = 0
    let lastBlock = null

    while (distance < maxDistance) {
      currentPos.addScaledVector(direction, step)
      distance += step

      const x = Math.floor(currentPos.x)
      const y = Math.floor(currentPos.y)
      const z = Math.floor(currentPos.z)

      const block = this.getBlock(x, y, z)
      if (block !== 0) {
        if (lastBlock === null || lastBlock.x !== x || lastBlock.y !== y || lastBlock.z !== z) {
          lastBlock = { x, y, z }
          const face = this.getFaceNormal(origin, currentPos)
          return { hit: true, position: new THREE.Vector3(x, y, z), face }
        }
      }
    }

    return { hit: false }
  }

  getFaceNormal(origin, hitPos) {
    const dx = Math.abs(hitPos.x - origin.x)
    const dy = Math.abs(hitPos.y - origin.y)
    const dz = Math.abs(hitPos.z - origin.z)

    if (dx > dy && dx > dz) return hitPos.x > origin.x ? '+x' : '-x'
    if (dy > dx && dy > dz) return hitPos.y > origin.y ? '+y' : '-y'
    return hitPos.z > origin.z ? '+z' : '-z'
  }

  getChunkCount() {
    return this.chunks.size
  }
}
