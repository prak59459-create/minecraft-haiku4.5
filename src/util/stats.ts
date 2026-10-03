export class StatsMonitor {
  fps: number = 0;
  frameCount: number = 0;
  lastTime: number = performance.now();
  memoryUsage: number = 0;
  chunkCount: number = 0;
  drawnFaces: number = 0;

  update() {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round(this.frameCount * 1000 / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
      this.updateMemory();
    }
  }

  private updateMemory() {
    if ((performance as any).memory) {
      this.memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / 1048576);
    }
  }

  getStats(): string {
    return `FPS: ${this.fps} | Chunks: ${this.chunkCount} | Memory: ${this.memoryUsage}MB`;
  }
}
