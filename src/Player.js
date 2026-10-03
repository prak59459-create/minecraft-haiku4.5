import * as THREE from 'three'
import { BlockTypes } from './BlockTypes.js'

export default class Player {
  constructor(camera) {
    this.camera = camera
    this.position = new THREE.Vector3(0, 100, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.acceleration = new THREE.Vector3(0, -0.3, 0)

    this.moveSpeed = 0.2
    this.sprintSpeed = 0.35
    this.jumpForce = 0.5

    this.isGrounded = false
    this.isSprinting = false
    this.isFlying = false
    this.flySpeed = 0.15

    this.width = 0.6
    this.height = 1.8
    this.depth = 0.6

    this.yaw = 0
    this.pitch = 0

    this.keys = {
      w: false, a: false, s: false, d: false,
      space: false, shift: false
    }

    this.selectedBlock = 1
    this.inventory = [1, 1, 2, 3, 5, 6, 7, 8, 9]

    this.setupControls()
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase()
      if (key === 'w') this.keys.w = true
      if (key === 'a') this.keys.a = true
      if (key === 's') this.keys.s = true
      if (key === 'd') this.keys.d = true
      if (key === ' ') {
        this.keys.space = true
        e.preventDefault()
      }
      if (key === 'shift') this.keys.shift = true

      if (key === 'h') {
        const help = document.getElementById('help-overlay')
        help.classList.toggle('hidden')
      }

      if (key === 'f') {
        this.isFlying = !this.isFlying
        if (this.isFlying) this.velocity.y = 0
      }

      const num = parseInt(key)
      if (num >= 1 && num <= 9) {
        this.selectBlock(num - 1)
      }
    })

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase()
      if (key === 'w') this.keys.w = false
      if (key === 'a') this.keys.a = false
      if (key === 's') this.keys.s = false
      if (key === 'd') this.keys.d = false
      if (key === ' ') this.keys.space = false
      if (key === 'shift') this.keys.shift = false
    })

    window.addEventListener('wheel', (e) => {
      e.preventDefault()
      const direction = e.deltaY > 0 ? 1 : -1
      const newIndex = (this.selectedBlock + direction + 9) % 9
      this.selectBlock(newIndex)
    })

    window.addEventListener('mousemove', (e) => {
      const movementX = e.movementX || 0
      const movementY = e.movementY || 0

      this.yaw -= movementX * 0.002
      this.pitch -= movementY * 0.002
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch))
    })

    document.addEventListener('click', () => {
      if (document.pointerLockElement === document.documentElement ||
          document.mozPointerLockElement === document.documentElement) {
        return
      }
      document.documentElement.requestPointerLock =
        document.documentElement.requestPointerLock ||
        document.documentElement.mozRequestPointerLock
      document.documentElement.requestPointerLock()
    })

    window.addEventListener('inventory-select', (e) => {
      this.selectBlock(e.detail.index)
    })
  }

  selectBlock(index) {
    if (index >= 0 && index < 9) {
      this.selectedBlock = index
      const slots = document.querySelectorAll('.inventory-slot')
      slots.forEach((slot, i) => {
        slot.classList.toggle('selected', i === index)
      })
    }
  }

  update(deltaTime) {
    const speed = this.keys.shift ? this.sprintSpeed : this.moveSpeed
    const moveDir = new THREE.Vector3()

    if (this.isFlying) {
      const forward = new THREE.Vector3(
        Math.sin(this.yaw),
        0,
        -Math.cos(this.yaw)
      ).normalize()
      const right = new THREE.Vector3(
        Math.cos(this.yaw),
        0,
        Math.sin(this.yaw)
      ).normalize()
      const up = new THREE.Vector3(0, 1, 0)

      if (this.keys.w) moveDir.addScaledVector(forward, this.flySpeed)
      if (this.keys.s) moveDir.addScaledVector(forward, -this.flySpeed)
      if (this.keys.a) moveDir.addScaledVector(right, -this.flySpeed)
      if (this.keys.d) moveDir.addScaledVector(right, this.flySpeed)
      if (this.keys.space) moveDir.y += this.flySpeed
      if (this.keys.shift) moveDir.y -= this.flySpeed

      this.position.add(moveDir)
      this.velocity.copy(moveDir)
    } else {
      const forward = new THREE.Vector3(
        Math.sin(this.yaw),
        0,
        -Math.cos(this.yaw)
      ).normalize()
      const right = new THREE.Vector3(
        Math.cos(this.yaw),
        0,
        Math.sin(this.yaw)
      ).normalize()

      if (this.keys.w) moveDir.addScaledVector(forward, speed)
      if (this.keys.s) moveDir.addScaledVector(forward, -speed)
      if (this.keys.a) moveDir.addScaledVector(right, -speed)
      if (this.keys.d) moveDir.addScaledVector(right, speed)

      this.velocity.x = moveDir.x
      this.velocity.z = moveDir.z

      if (this.keys.space && this.isGrounded) {
        this.velocity.y = this.jumpForce
        this.isGrounded = false
      }

      this.velocity.add(this.acceleration)
      this.position.add(this.velocity)

      this.isGrounded = false
    }

    this.updateCamera()
  }

  updateCamera() {
    this.camera.position.copy(this.position)
    this.camera.position.y += this.height * 0.9

    const forward = new THREE.Vector3(
      Math.sin(this.yaw),
      Math.tan(this.pitch),
      -Math.cos(this.yaw)
    ).normalize()

    const target = this.camera.position.clone().add(forward)
    this.camera.lookAt(target)
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z)
    this.updateCamera()
  }

  getPosition() {
    return this.position.clone()
  }

  getBody() {
    return new THREE.Group()
  }

  canMoveTo(pos, world) {
    if (!world) return true

    const hw = this.width / 2
    const hd = this.depth / 2

    const checkPoints = [
      [0, 0, 0], [hw, 0, hd], [-hw, 0, -hd], [hw, 0, -hd], [-hw, 0, hd],
      [0, this.height * 0.5, 0], [0, this.height - 0.1, 0]
    ]

    for (const offset of checkPoints) {
      const px = Math.floor(pos.x + offset[0])
      const py = Math.floor(pos.y + offset[1])
      const pz = Math.floor(pos.z + offset[2])

      const block = world.getBlock(px, py, pz)
      if (block !== 0 && BlockTypes.isSolid(block)) {
        return false
      }
    }

    return true
  }

  checkGround(world) {
    if (!world) return false

    const offset = 0.01
    for (let x = -this.width / 2; x <= this.width / 2; x += 0.3) {
      for (let z = -this.depth / 2; z <= this.depth / 2; z += 0.3) {
        const block = world.getBlock(
          Math.floor(this.position.x + x),
          Math.floor(this.position.y - offset),
          Math.floor(this.position.z + z)
        )
        if (block !== 0 && BlockTypes.isSolid(block)) {
          return true
        }
      }
    }

    return false
  }
}
