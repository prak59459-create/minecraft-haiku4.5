export class Statistics {
    constructor() {
        this.metrics = {
            blocksBroken: 0,
            blocksPlaced: 0,
            distanceTraveled: 0,
            timeAlive: 0,
            jumpCount: 0,
            sprintCount: 0,
            chunksLoaded: 0
        };

        this.startTime = Date.now();
        this.lastPosition = null;
    }

    update(player, chunkManager) {
        this.metrics.chunksLoaded = chunkManager.loadedChunks.size;
        this.metrics.timeAlive = (Date.now() - this.startTime) / 1000;

        if (this.lastPosition) {
            const dx = player.camera.position.x - this.lastPosition.x;
            const dy = player.camera.position.y - this.lastPosition.y;
            const dz = player.camera.position.z - this.lastPosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            this.metrics.distanceTraveled += distance;
        }

        this.lastPosition = {
            x: player.camera.position.x,
            y: player.camera.position.y,
            z: player.camera.position.z
        };
    }

    recordBlockBreak() {
        this.metrics.blocksBroken++;
    }

    recordBlockPlace() {
        this.metrics.blocksPlaced++;
    }

    recordJump() {
        this.metrics.jumpCount++;
    }

    recordSprint() {
        this.metrics.sprintCount++;
    }

    getMetrics() {
        return { ...this.metrics };
    }

    reset() {
        this.metrics = {
            blocksBroken: 0,
            blocksPlaced: 0,
            distanceTraveled: 0,
            timeAlive: 0,
            jumpCount: 0,
            sprintCount: 0,
            chunksLoaded: 0
        };
        this.startTime = Date.now();
    }

    export() {
        return JSON.stringify(this.getMetrics(), null, 2);
    }
}
