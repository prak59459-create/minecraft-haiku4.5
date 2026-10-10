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
            memory: 0
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

        let vertices = 0;
        let triangles = 0;
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

        if (performance.memory) {
            this.stats.memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        }

        this.playerPos = game.player.position;
        this.playerChunk = {
            x: Math.floor(game.player.position.x / 16),
            z: Math.floor(game.player.position.z / 16)
        };

        this.render();
    }

    render() {
        const lines = [
            '╔═ DEBUG INFO ═╗',
            `│ FPS: ${this.stats.fps}`.padEnd(16) + '│',
            `│ Chunks: ${this.stats.chunks}`.padEnd(16) + '│',
            `│ Draw Calls: ${this.stats.drawCalls}`.padEnd(16) + '│',
            `│ Vertices: ${(this.stats.vertices / 1000).toFixed(1)}K`.padEnd(16) + '│',
            `│ Triangles: ${(this.stats.triangles / 1000).toFixed(1)}K`.padEnd(16) + '│',
            `│ Particles: ${this.stats.particles}`.padEnd(16) + '│',
            `│ Memory: ${this.stats.memory}MB`.padEnd(16) + '│',
            `│ Pos: ${this.playerPos.x.toFixed(1)}, ${this.playerPos.y.toFixed(1)}, ${this.playerPos.z.toFixed(1)}`.padEnd(42) + '│',
            `│ Chunk: ${this.playerChunk.x}, ${this.playerChunk.z}`.padEnd(16) + '│',
            '╚═══════════════╝'
        ];

        this.container.innerHTML = lines.map(line => {
            if (line.startsWith('╔') || line.startsWith('╚') || line.includes('═')) {
                return `<div style="color: #00FF00;">${line}</div>`;
            }
            return `<div>${line}</div>`;
        }).join('');
    }
}
