export class DebugMode {
    constructor() {
        this.enabled = false;
        this.showChunks = false;
        this.showCollision = false;
        this.showRaycast = false;
        this.showPerformance = false;
        this.stats = {};

        this.setupDebugPanel();
        this.setupKeyBindings();
    }

    setupDebugPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'debug-panel';
        this.panel.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #0f0;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border: 1px solid #0f0;
            max-width: 300px;
            display: none;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
        `;
        document.body.appendChild(this.panel);
    }

    setupKeyBindings() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F3') {
                e.preventDefault();
                this.toggle();
            }
            if (e.key === 'F4') {
                e.preventDefault();
                this.showChunks = !this.showChunks;
            }
            if (e.key === 'F5') {
                e.preventDefault();
                this.showCollision = !this.showCollision;
            }
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        this.panel.style.display = this.enabled ? 'block' : 'none';
    }

    updateStats(stats) {
        this.stats = stats;
        if (this.enabled) {
            this.render();
        }
    }

    render() {
        let html = `<div><strong>Debug Mode</strong></div>`;
        html += `<div>F3: Toggle Debug</div>`;
        html += `<div>F4: Chunk Borders</div>`;
        html += `<div>F5: Collision</div>`;
        html += `<hr style="border: none; border-top: 1px solid #0f0; margin: 5px 0;">`;

        for (const [key, value] of Object.entries(this.stats)) {
            if (typeof value === 'number') {
                html += `<div>${key}: ${value.toFixed(2)}</div>`;
            } else {
                html += `<div>${key}: ${value}</div>`;
            }
        }

        this.panel.innerHTML = html;
    }

    logInfo(message) {
        if (this.enabled) {
            console.log(`[DEBUG] ${message}`);
        }
    }

    logWarn(message) {
        if (this.enabled) {
            console.warn(`[DEBUG] ${message}`);
        }
    }

    logError(message) {
        console.error(`[DEBUG] ${message}`);
    }
}
