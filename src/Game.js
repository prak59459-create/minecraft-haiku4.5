import * as THREE from 'three'
import World from './World.js'
import Player from './Player.js'
import Interaction from './Interaction.js'
import UI from './UI.js'

export default class Game {
  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap

    document.getElementById('game-container').appendChild(this.renderer.domElement)

    this.world = null
    this.player = null
    this.interaction = null
    this.ui = null
    this.clock = new THREE.Clock()

    window.addEventListener('resize', () => this.onWindowResize())
  }

  init() {
    this.setupLighting()
    this.world = new World(this.scene)
    this.player = new Player(this.camera)
    this.interaction = new Interaction(this.camera, this.world, this.player)
    this.ui = new UI(this.player, this.world)

    this.player.setPosition(50, 80, 50)
    this.scene.add(this.player.getBody())
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    this.sunLight = new THREE.DirectionalLight(0xffffff, 1)
    this.sunLight.position.set(200, 300, 200)
    this.sunLight.castShadow = true
    this.sunLight.shadow.camera.left = -500
    this.sunLight.shadow.camera.right = 500
    this.sunLight.shadow.camera.top = 500
    this.sunLight.shadow.camera.bottom = -500
    this.sunLight.shadow.camera.far = 1000
    this.scene.add(this.sunLight)
  }

  animate = () => {
    requestAnimationFrame(this.animate)

    const deltaTime = this.clock.getDelta()
    const elapsedTime = this.clock.getElapsedTime()

    this.player.update(deltaTime)
    this.world.update(this.camera.position)
    this.interaction.update()
    this.updateLighting(elapsedTime)

    this.renderer.render(this.scene, this.camera)
    this.ui.update(this.player, this.world)
  }

  updateLighting(elapsedTime) {
    const cycle = (elapsedTime / 120) % 1
    const angle = cycle * Math.PI * 2

    const sunX = Math.cos(angle - Math.PI / 2) * 400
    const sunY = Math.sin(angle - Math.PI / 2) * 300 + 200
    const sunZ = 200

    this.sunLight.position.set(sunX, sunY, sunZ)

    const brightness = Math.sin(angle - Math.PI / 2) * 0.5 + 0.7
    this.sunLight.intensity = Math.max(0.2, brightness)

    const isNight = brightness < 0.4
    this.ui.setTimeOfDay(isNight)
  }

  onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }
}
