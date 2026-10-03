import * as THREE from 'three'
import { BlockTypes } from './BlockTypes.js'

export default class Interaction {
  constructor(camera, world, player) {
    this.camera = camera
    this.world = world
    this.player = player
    this.raycaster = new THREE.Raycaster()
    this.raycasterDir = new THREE.Vector3(0, 0, -1)

    this.reachDistance = 5
    this.lastClickTime = 0
    this.clickCooldown = 100

    this.setupControls()
  }

  setupControls() {
    document.addEventListener('mousedown', (e) => {
      const now = Date.now()
      if (now - this.lastClickTime < this.clickCooldown) return
      this.lastClickTime = now

      if (e.button === 0) this.breakBlock()
      if (e.button === 2) this.placeBlock()
    })

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
    })
  }

  update() {
    const origin = this.camera.position
    const direction = new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.camera.rotation.x)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y)

    const result = this.world.raycast(origin, direction, this.reachDistance)

    const highlight = document.querySelector('#crosshair')
    if (result.hit) {
      highlight.style.borderColor = '#FFD700'
    } else {
      highlight.style.borderColor = 'rgba(255, 255, 255, 0.8)'
    }
  }

  breakBlock() {
    const origin = this.camera.position
    const direction = new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.camera.rotation.x)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y)

    const result = this.world.raycast(origin, direction, this.reachDistance)

    if (result.hit) {
      const { position } = result
      this.world.setBlock(position.x, position.y, position.z, BlockTypes.EMPTY)
      this.playSound('break')
      this.spawnParticles(position)
    }
  }

  placeBlock() {
    const origin = this.camera.position
    const direction = new THREE.Vector3(0, 0, -1)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.camera.rotation.x)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y)

    const result = this.world.raycast(origin, direction, this.reachDistance)

    if (result.hit) {
      const { position, face } = result
      const adjacentPos = this.getAdjacentPosition(position, face)

      const block = this.player.inventory[this.player.selectedBlock]
      this.world.setBlock(adjacentPos.x, adjacentPos.y, adjacentPos.z, block)
      this.playSound('place')
    }
  }

  getAdjacentPosition(pos, face) {
    const adjacent = pos.clone()

    if (face === '+x') adjacent.x++
    else if (face === '-x') adjacent.x--
    else if (face === '+y') adjacent.y++
    else if (face === '-y') adjacent.y--
    else if (face === '+z') adjacent.z++
    else if (face === '-z') adjacent.z--

    return adjacent
  }

  spawnParticles(position) {
    const particleCount = 8
    for (let i = 0; i < particleCount; i++) {
      const particle = {
        pos: position.clone().addScaledVector(
          new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5),
          0.5
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          Math.random() * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        lifetime: 30 + Math.random() * 20,
        age: 0
      }

      this.updateParticle(particle)
    }
  }

  updateParticle(particle) {
    if (particle.age < particle.lifetime) {
      particle.age++
      particle.vel.y -= 0.01
      particle.pos.add(particle.vel)
    }
  }

  playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const now = audioContext.currentTime

    if (type === 'break') {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()

      osc.connect(gain)
      gain.connect(audioContext.destination)

      osc.frequency.setValueAtTime(400, now)
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)

      osc.start(now)
      osc.stop(now + 0.1)
    } else if (type === 'place') {
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()

      osc.connect(gain)
      gain.connect(audioContext.destination)

      osc.frequency.setValueAtTime(300, now)
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.15)
      gain.gain.setValueAtTime(0.1, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

      osc.start(now)
      osc.stop(now + 0.15)
    }
  }
}
