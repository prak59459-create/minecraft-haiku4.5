export class UI {
  constructor(player) {
    this.statsElement = document.getElementById('stats');
    this.player = player;
  }

  update(player, world) {
    const chunks = world.chunks.size;
    const blockCount = chunks * 16 * 256 * 16;

    this.statsElement.innerHTML = `
      FPS: ${Math.round(1000 / (performance.now() % 1000 || 1))}
      Pos: ${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)}
      Chunks: ${chunks}
      Grounded: ${player.isGrounded}
      Sprint: ${player.isSprinting ? 'ON' : 'OFF'}
    `;
  }
}
