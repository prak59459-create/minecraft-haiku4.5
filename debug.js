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

        this.render();
    }

    render() {
        const getHealthBar = (current, max) => {
            const filled = Math.round((current / max) * 10);
            const empty = 10 - filled;
            return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
        };

        const lines = [
            '╔════ DEBUG INFO ════╗',
            `║ FPS: ${this.stats.fps.toString().padStart(3)}`,
            `║ Chunks: ${this.stats.chunks.toString().padStart(3)}`,
            `║ Vertices: ${this.stats.vertices.toLocaleString().padStart(7)}`,
            `║ Triangles: ${this.stats.triangles.toLocaleString().padStart(7)}`,
            `║ Draw Calls: ${this.stats.drawCalls.toString().padStart(3)}`,
            `║ Particles: ${this.stats.particles.toString().padStart(4)}`,
            `║ Memory: ${this.stats.memory.padStart(6)} MB`,
            '╚════════════════════╝',
            '',
            'Controls:',
            'F3 - Toggle Debug',
            'H  - Toggle Help'
        ];

        this.container.innerHTML = lines.map(line => {
            if (line.startsWith('╔') || line.startsWith('╚')) {
                return `<div style="color: #00FF00;">${line}</div>`;
            }
            if (line.startsWith('║')) {
                const [label, value] = line.split(':');
                return `<div><span style="color: #00FF00;">${label}:</span> <span style="color: #FFFF00;">${value}</span></div>`;
            }
            if (line === '') return `<div>&nbsp;</div>`;
            if (line.startsWith('Controls:')) return `<div style="color: #00FFFF; margin-top: 5px;">${line}</div>`;
            return `<div style="color: #AAAAAA; font-size: 10px;">${line}</div>`;
        }).join('');
    }
}
