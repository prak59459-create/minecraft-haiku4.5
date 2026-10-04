export class DebugConsole {
    constructor() {
        this.logs = [];
        this.visible = false;
        this.maxLogs = 100;
        this.createUI();
    }

    createUI() {
        const console = document.createElement('div');
        console.id = 'debug-console';
        console.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 200px;
            background: rgba(0,0,0,0.8);
            color: #0f0;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            border-top: 2px solid #0f0;
        `;

        document.body.appendChild(console);
        this.element = console;

        window.addEventListener('keydown', (e) => {
            if (e.key === '`') {
                this.toggle();
            }
        });
    }

    log(message, color = '#0f0') {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push({ message, color, timestamp });

        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.render();
    }

    render() {
        if (!this.visible) return;

        const html = this.logs.map(log =>
            `<div style="color: ${log.color}">[${log.timestamp}] ${log.message}</div>`
        ).join('');

        this.element.innerHTML = html;
        this.element.scrollTop = this.element.scrollHeight;
    }

    toggle() {
        this.visible = !this.visible;
        this.element.style.display = this.visible ? 'block' : 'none';
        this.render();
    }

    clear() {
        this.logs = [];
        this.render();
    }
}

export class ChunkDebugger {
    constructor(world) {
        this.world = world;
        this.showChunkBorders = false;
    }

    getChunkInfo(chunkX, chunkZ) {
        const key = `${chunkX},${chunkZ}`;
        const chunk = this.world.chunks.get(key);

        if (!chunk) return null;

        let blockCount = 0;
        for (let i = 0; i < chunk.blocks.length; i++) {
            if (chunk.blocks[i] !== 0) blockCount++;
        }

        return {
            x: chunkX,
            z: chunkZ,
            blockCount,
            meshCount: chunk.meshes.length,
            generated: chunk.isGenerated
        };
    }

    getAllChunkInfo() {
        const chunks = [];
        for (let key of this.world.chunks.keys()) {
            const [x, z] = key.split(',').map(Number);
            chunks.push(this.getChunkInfo(x, z));
        }
        return chunks;
    }

    getWorldStats() {
        let totalBlocks = 0;
        let totalMeshes = 0;

        for (let key of this.world.chunks.keys()) {
            const [x, z] = key.split(',').map(Number);
            const info = this.getChunkInfo(x, z);
            if (info) {
                totalBlocks += info.blockCount;
                totalMeshes += info.meshCount;
            }
        }

        return {
            chunkCount: this.world.chunks.size,
            totalBlocks,
            totalMeshes,
            blockTypes: 18
        };
    }
}

export class BenchmarkTool {
    constructor() {
        this.results = [];
        this.currentBench = null;
    }

    start(name) {
        this.currentBench = {
            name,
            startTime: performance.now(),
            startMemory: performance.memory?.usedJSHeapSize || 0
        };
    }

    end() {
        if (!this.currentBench) return;

        const endTime = performance.now();
        const endMemory = performance.memory?.usedJSHeapSize || 0;

        const result = {
            name: this.currentBench.name,
            duration: endTime - this.currentBench.startTime,
            memoryDelta: endMemory - this.currentBench.startMemory
        };

        this.results.push(result);
        return result;
    }

    getResults() {
        return this.results;
    }

    clear() {
        this.results = [];
    }

    logResults() {
        console.log('=== Benchmark Results ===');
        for (let result of this.results) {
            console.log(`${result.name}: ${result.duration.toFixed(2)}ms (${(result.memoryDelta / 1024).toFixed(2)}KB)`);
        }
    }
}
