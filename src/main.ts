import * as THREE from 'three';
import { World } from './world/world';
import { Player } from './player/player';
import { Renderer } from './renderer/renderer';
import { UI } from './ui/ui';
import { EnvironmentManager } from './world/environment';
import { ParticleSystem } from './fx/particles';

let world: World;
let player: Player;
let renderer: Renderer;
let ui: UI;
let environment: EnvironmentManager;
let particles: ParticleSystem;

async function init() {
  renderer = new Renderer();
  ui = new UI();

  environment = new EnvironmentManager(renderer.scene);
  particles = new ParticleSystem(renderer.scene);

  world = new World(renderer.scene, particles);
  await world.initialize();

  player = new Player(renderer.camera, renderer.canvas);

  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';

  animate();
}

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = 1 / 60;
  player.update(deltaTime, world);
  world.update(player.position);
  environment.update(deltaTime);
  particles.update(deltaTime);
  renderer.render();
  ui.update(player, world, environment);
}

init().catch(console.error);
