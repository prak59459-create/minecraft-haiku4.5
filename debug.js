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

        this.gameData = {
            playerX: game.player.position.x.toFixed(2),
            playerY: game.player.position.y.toFixed(2),
            playerZ: game.player.position.z.toFixed(2),
            rotX: (game.gameCamera.rotation.x * 180 / Math.PI).toFixed(1),
            rotY: (game.gameCamera.rotation.y * 180 / Math.PI).toFixed(1),
            renderDist: game.world.renderDistance,
            inventorySlot: game.ui.selectedSlot + 1
        };

        this.render();
    }

    render() {
        const lines = [
            '═══ DEBUG INFO ═══',
            `FPS: ${this.stats.fps}`,
            '',
            '─ Position ─',
            `X: ${this.gameData.playerX}`,
            `Y: ${this.gameData.playerY}`,
            `Z: ${this.gameData.playerZ}`,
            '',
            '─ Rotation ─',
            `Yaw: ${this.gameData.rotY}°`,
            `Pitch: ${this.gameData.rotX}°`,
            '',
            '─ Rendering ─',
            `Chunks: ${this.stats.chunks}`,
            `Vertices: ${this.stats.vertices.toLocaleString()}`,
            `Triangles: ${this.stats.triangles.toLocaleString()}`,
            `Draw Calls: ${this.stats.drawCalls}`,
            `Particles: ${this.stats.particles}`,
            '',
            '─ System ─',
            `Memory: ${this.stats.memory} MB`,
            `Inv: ${this.gameData.inventorySlot}/9`,
            '',
            '═════════════════',
            'F3: Toggle | H: Help'
        ];

        this.container.innerHTML = lines.map((line, idx) => {
            if (line.startsWith('═') || line.startsWith('─')) {
                return `<div style="opacity: 0.6;">${line}</div>`;
            }
            const parts = line.split(': ');
            if (parts.length === 2 && line.includes(':')) {
                return `<div><span style="color: #00FF00;">${parts[0]}:</span> <span style="color: #FFFF00;">${parts[1]}</span></div>`;
            }
            return `<div>${line}</div>`;
        }).join('');
    }
}
