import { Player } from '../player/player';
import { World } from '../world/world';
import { BLOCK_NAMES, BLOCK_TYPES } from '../world/blocks';
import { EnvironmentManager } from '../world/environment';
import { StatsMonitor } from '../util/stats';

export class UI {
  private hotbarContainer: HTMLElement;
  private infoContainer: HTMLElement;
  private blockNameToIndex: { [key: number]: number } = {
    1: 1, // GRASS
    2: 2, // DIRT
    3: 3, // STONE
    4: 4, // WOOD
    5: 5, // LEAVES
    6: 6, // WATER
  };

  constructor() {
    this.hotbarContainer = document.getElementById('hotbar')!;
    this.infoContainer = document.getElementById('info')!;
    this.initializeHotbar();
  }

  private initializeHotbar() {
    const blocks = [
      { id: 1, name: 'Grass' },
      { id: 2, name: 'Dirt' },
      { id: 3, name: 'Stone' },
      { id: 4, name: 'Wood' },
      { id: 5, name: 'Leaves' },
      { id: 6, name: 'Water' },
      { id: 0, name: 'Empty' },
      { id: 0, name: 'Empty' },
      { id: 0, name: 'Empty' },
    ];

    blocks.forEach((block, index) => {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot';
      if (index === 0) slot.classList.add('active');
      slot.textContent = (index + 1).toString();
      slot.title = block.name;
      this.hotbarContainer.appendChild(slot);
    });
  }

  update(player: Player, world: World, environment?: EnvironmentManager, stats?: StatsMonitor) {
    this.updateHotbar(player, world);
    this.updateInfo(player, world, environment, stats);
  }

  private updateHotbar(player: Player, world: World) {
    const slots = this.hotbarContainer.querySelectorAll('.hotbar-slot');
    slots.forEach((slot, index) => {
      if (index === world.selectedBlock - 1 || (world.selectedBlock === 0 && index === 0)) {
        slot.classList.add('active');
      } else {
        slot.classList.remove('active');
      }
    });
  }

  private updateInfo(player: Player, world: World, environment?: EnvironmentManager, stats?: StatsMonitor) {
    const blockName = BLOCK_NAMES[world.selectedBlock] || 'Unknown';
    const groundState = player.isOnGround ? 'On Ground' : 'Falling';
    const speedMagnitude = Math.sqrt(
      player.velocity.x ** 2 + player.velocity.z ** 2
    ).toFixed(1);

    const direction = this.getDirection(player.yaw);
    const timeOfDay = environment ? (environment.timeOfDay * 24).toFixed(1) : 'N/A';

    let info = `
Block: ${blockName}
Position: ${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)}
Speed: ${speedMagnitude} m/s
Direction: ${direction}
Status: ${groundState}
Time: ${timeOfDay}h`;

    if (stats) {
      info += `
FPS: ${stats.fps} | Chunks: ${stats.chunkCount} | RAM: ${stats.memoryUsage}MB`;
    }

    if (player.isSprinting) {
      info += '\nSprint: ON';
    }

    this.infoContainer.textContent = info.trim();
  }

  private getDirection(yaw: number): string {
    const angle = (yaw * 180) / Math.PI;
    const normalized = ((angle + 360) % 360 + 360) % 360;

    if (normalized < 45 || normalized >= 315) return '+Z';
    if (normalized < 135) return '-X';
    if (normalized < 225) return '-Z';
    return '+X';
  }
}
