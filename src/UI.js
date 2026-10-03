export default class UI {
  constructor(player, world) {
    this.player = player
    this.world = world
    this.frameCount = 0
    this.lastFpsUpdate = Date.now()
    this.currentFps = 60
    this.isNight = false

    this.setupInventoryListeners()
  }

  setupInventoryListeners() {
    const slots = document.querySelectorAll('.inventory-slot')
    slots.forEach((slot, index) => {
      slot.addEventListener('click', () => {
        this.player.selectBlock(index)
      })
    })
  }

  update(player, world) {
    this.updateFps()
    this.updateCoordinates(player)
    this.updateChunkCount(world)
  }

  updateFps() {
    this.frameCount++
    const now = Date.now()
    const deltaTime = now - this.lastFpsUpdate

    if (deltaTime >= 1000) {
      this.currentFps = this.frameCount
      this.frameCount = 0
      this.lastFpsUpdate = now

      const fpsElement = document.getElementById('fps')
      if (fpsElement) {
        fpsElement.textContent = `FPS: ${this.currentFps}`
      }
    }
  }

  updateCoordinates(player) {
    const pos = player.getPosition()
    const coordsElement = document.getElementById('coords')
    if (coordsElement) {
      coordsElement.textContent = `X: ${Math.floor(pos.x)} Y: ${Math.floor(pos.y)} Z: ${Math.floor(pos.z)}`
    }
  }

  updateChunkCount(world) {
    const chunksElement = document.getElementById('chunks')
    if (chunksElement) {
      chunksElement.textContent = `Chunks: ${world.getChunkCount()}`
    }
  }

  setTimeOfDay(isNight) {
    if (this.isNight !== isNight) {
      this.isNight = isNight
      const dayNightElement = document.getElementById('day-night')
      if (dayNightElement) {
        dayNightElement.textContent = isNight ? '🌙 Night' : '🌤️ Day'
      }
    }
  }
}
