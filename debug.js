export class DebugDisplay {
    constructor() {
        this.visible = false;
        this.stats = {
            fps: 0,
            chunks: 0,
            vertices: 0,
            triangles: 0,
            drawCalls: 0,
            particles: 0,
            memory: 0,
            blocksDestroyed: 0,
            blocksPlaced: 0,
            jumps: 0,
            distance: 0
        };
        this.createDisplay();
    }

    createDisplay() {
        const container = document.createElement('div');
        container.id = 'debug-display';
        container.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00FF00;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            padding: 10px;
            border: 1px solid #00FF00;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 20;
        `;
        document.body.appendChild(container);
        this.container = container;
    }

    show() {
        this.visible = true;
        this.container.style.opacity = '1';
    }

    hide() {
        this.visible = false;
        this.container.style.opacity = '0';
    }

    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    update(game) {
        if (!this.visible) return;

        this.stats.fps = game.ui.fpsCounter;
        this.stats.chunks = game.world.chunks.size;
        this.stats.particles = game.particleSystem.particles.length;
        this.stats.blocksDestroyed = game.stats.blocksDestroyed;
        this.stats.blocksPlaced = game.stats.blocksPlaced;
        this.stats.jumps = game.stats.jumpsPerformed;
        this.stats.distance = game.stats.distanceTraveled.toFixed(1);

        let vertices = 0;
        let triangles = 0;
        let lodLevels = { 0: 0, 1: 0, 2: 0 };

        for (const [key, chunk] of game.world.chunks) {
            const lod = chunk.lodLevel || 0;
            lodLevels[lod] = (lodLevels[lod] || 0) + 1;
        }

        for (const mesh of game.chunkMeshes.values()) {
            if (mesh && mesh.geometry) {
                const positions = mesh.geometry.getAttribute('position');
                if (positions) {
                    vertices += positions.count;
                    const index = mesh.geometry.getIndex();
                    if (index) {
                        triangles += index.count / 3;
                    }
                }
            }
        }

        this.stats.vertices = vertices;
        this.stats.triangles = triangles;
        this.stats.drawCalls = game.chunkMeshes.size;
        this.stats.lodLevels = lodLevels;

        if (performance.memory) {
            this.stats.memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        }

        this.render();
    }

    render() {
        const lines = [
            '=== DEBUG INFO ===',
            `FPS: ${this.stats.fps}`,
            `Chunks: ${this.stats.chunks} (LOD0: ${this.stats.lodLevels[0]}, LOD1: ${this.stats.lodLevels[1]}, LOD2: ${this.stats.lodLevels[2]})`,
            `Vertices: ${this.stats.vertices.toLocaleString()}`,
            `Triangles: ${this.stats.triangles.toLocaleString()}`,
            `Draw Calls: ${this.stats.drawCalls}`,
            `Particles: ${this.stats.particles}`,
            `Memory: ${this.stats.memory} MB`,
            '--- STATS ---',
            `Blocks: ✗${this.stats.blocksDestroyed} ✓${this.stats.blocksPlaced}`,
            `Jumps: ${this.stats.jumps}`,
            `Distance: ${this.stats.distance}m`,
            '==================',
            'F3: Toggle | H: Help'
        ];

        this.container.innerHTML = lines.map(line => {
            if (line.startsWith('=')) return `<div>${line}</div>`;
            const parts = line.split(': ');
            if (parts.length === 2) {
                return `<div><span style="color: #00FF00;">${parts[0]}:</span> <span style="color: #FFFF00;">${parts[1]}</span></div>`;
            }
            return `<div>${line}</div>`;
        }).join('');
    }
}
