export class GameStats {
    constructor() {
        this.blocksPlaced = 0;
        this.blocksDestroyed = 0;
        this.jumps = 0;
        this.distanceTraveled = 0;
        this.sprintDistance = 0;
        this.sessionStartTime = Date.now();
        this.lastPosition = { x: 0, y: 0, z: 0 };
        this.loadStats();
    }

    saveStats() {
        const stats = {
            blocksPlaced: this.blocksPlaced,
            blocksDestroyed: this.blocksDestroyed,
            jumps: this.jumps,
            distanceTraveled: this.distanceTraveled,
            sprintDistance: this.sprintDistance,
            totalSessionTime: this.getTotalSessionTime()
        };
        localStorage.setItem('minecraftStats', JSON.stringify(stats));
    }

    loadStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('minecraftStats'));
            if (stats) {
                this.blocksPlaced = stats.blocksPlaced || 0;
                this.blocksDestroyed = stats.blocksDestroyed || 0;
                this.jumps = stats.jumps || 0;
                this.distanceTraveled = stats.distanceTraveled || 0;
                this.sprintDistance = stats.sprintDistance || 0;
            }
        } catch (e) {
            console.log('No saved stats found');
        }
    }

    recordBlockPlaced() {
        this.blocksPlaced++;
        this.saveStats();
    }

    recordBlockDestroyed() {
        this.blocksDestroyed++;
        this.saveStats();
    }

    recordJump() {
        this.jumps++;
        this.saveStats();
    }

    updateDistance(playerPos, isSprinting) {
        const dx = playerPos.x - this.lastPosition.x;
        const dz = playerPos.z - this.lastPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 0 && distance < 1) {
            this.distanceTraveled += distance;
            if (isSprinting) {
                this.sprintDistance += distance;
            }
        }

        this.lastPosition = { x: playerPos.x, y: playerPos.y, z: playerPos.z };
    }

    getTotalSessionTime() {
        return Math.floor((Date.now() - this.sessionStartTime) / 1000);
    }

    getStats() {
        return {
            blocksPlaced: this.blocksPlaced,
            blocksDestroyed: this.blocksDestroyed,
            jumps: this.jumps,
            distanceTraveled: Math.floor(this.distanceTraveled),
            sprintDistance: Math.floor(this.sprintDistance),
            sessionTime: this.getTotalSessionTime(),
            sessionTimeFormatted: this.formatTime(this.getTotalSessionTime())
        };
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    reset() {
        this.blocksPlaced = 0;
        this.blocksDestroyed = 0;
        this.jumps = 0;
        this.distanceTraveled = 0;
        this.sprintDistance = 0;
        this.sessionStartTime = Date.now();
        this.lastPosition = { x: 0, y: 0, z: 0 };
        localStorage.removeItem('minecraftStats');
    }
}
