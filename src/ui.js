export class UI {
  constructor(player) {
    this.statsElement = document.getElementById('stats');
    this.player = player;
  }

  update(player, world) {
    const chunks = world.chunks.size;
    const chunkX = Math.floor(player.position.x / 16);
    const chunkZ = Math.floor(player.position.z / 16);
    const velocity = Math.sqrt(
      player.velocity.x * player.velocity.x +
      player.velocity.z * player.velocity.z
    ).toFixed(2);

    this.statsElement.innerHTML = `
      FPS: ${Math.round(1000 / (performance.now() % 1000 || 1))}
      Pos: ${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)}
      Chunk: [${chunkX}, ${chunkZ}]
      Chunks: ${chunks} | Speed: ${velocity} m/s
      Grounded: ${player.isGrounded ? 'Yes' : 'No'} | ${player.isSprinting ? 'Sprint' : player.isCrouching ? 'Crouch' : 'Walk'}
    `;
  }
}
