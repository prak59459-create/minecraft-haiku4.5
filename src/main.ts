import * as THREE from 'three';
import { World } from './world/world';
import { Player } from './player/player';
import { Renderer } from './renderer/renderer';
import { UI } from './ui/ui';

let world: World;
let player: Player;
let renderer: Renderer;
let ui: UI;

async function init() {
  renderer = new Renderer();
  ui = new UI();

  world = new World(renderer.scene);
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
  renderer.render();
  ui.update(player, world);
}

init().catch(console.error);
