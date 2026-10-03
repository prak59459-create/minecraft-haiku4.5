# API Documentation

## Core Systems

### Player

```javascript
class Player {
    // Properties
    camera: THREE.Camera
    position: THREE.Vector3
    velocity: THREE.Vector3
    selectedBlock: number
    selectedSlot: number

    // Methods
    jump(): void
    destroy(): void
    place(): void
    selectBlock(index: number): void
    updatePhysics(velocity, gravity, chunkManager): void
}
```

### ChunkManager

```javascript
class ChunkManager {
    // Methods
    getBlock(x: number, y: number, z: number): number
    setBlock(x: number, y: number, z: number, blockType: number): void
    getChunk(x: number, z: number): Chunk
    raycast(origin: Vector3, direction: Vector3, maxDistance?: number): RaycastHit | null
    updateVisibleChunks(centerX: number, centerZ: number): void
}

interface RaycastHit {
    blockPos: THREE.Vector3
    placePos: THREE.Vector3
    distance: number
}
```

### Lighting

```javascript
class Lighting {
    // Properties
    timeOfDay: number // 0-1
    lightLevel: number // 0-1
    skyColor: THREE.Color
    fogColor: THREE.Color

    // Methods
    update(): void
}
```

### ParticleSystem

```javascript
class ParticleSystem {
    // Methods
    createDestructionParticles(blockPos: Vector3, blockType: number): void
    update(): void
    clear(): void
}
```

### InputManager

```javascript
class InputManager {
    // Properties
    locked: boolean
    keys: {forward, backward, left, right}

    // Methods
    setupKeyboardListeners(): void
    setupMouseListeners(): void
    updateBlockSelector(): void
}
```

## Configuration

### Constants

```javascript
WORLD_CONFIG = {
    chunkSize: 16
    chunkHeight: 64
    renderDistance: 8
    seed: 12345
    // ... more options
}
```

### Settings

```javascript
class Settings {
    getSetting(path: string): any
    setSetting(path: string, value: any): void
    getAll(): object
    resetSettings(): void
    saveSettings(): void
    loadSettings(): void
}

// Available paths:
// graphics.renderDistance
// graphics.particlesEnabled
// audio.soundVolume
// gameplay.difficulty
// controls.mouseSensitivity
```

## Utilities

### Logger

```javascript
class Logger {
    info(message: string, data?: any): void
    warn(message: string, data?: any): void
    error(message: string, data?: any): void
    debug(message: string, data?: any): void
    getLogs(): Log[]
    export(): string
}
```

### Profiler

```javascript
class Profiler {
    start(label: string): void
    end(label: string): number
    getReport(label: string): Measurement
    getAllReports(): Map<string, Measurement>
    printReport(): void
    reset(): void
}

interface Measurement {
    count: number
    total: number
    min: number
    max: number
    avg: number
}
```

### Statistics

```javascript
class Statistics {
    metrics: {
        blocksBroken: number
        blocksPlaced: number
        distanceTraveled: number
        timeAlive: number
        jumpCount: number
        sprintCount: number
        chunksLoaded: number
    }

    update(player, chunkManager): void
    recordBlockBreak(): void
    recordBlockPlace(): void
    recordJump(): void
    recordSprint(): void
    getMetrics(): object
    reset(): void
    export(): string
}
```

### GameState

```javascript
class GameState {
    states = {
        LOADING, PLAYING, PAUSED, MENU, SETTINGS
    }

    setState(newState: string): boolean
    getState(): string
    isState(state: string): boolean
    on(event: string, callback: Function): void
    off(event: string, callback: Function): void
    emit(event: string, data?: any): void
}
```

### SoundManager

```javascript
class SoundManager {
    init(): void
    playBlockBreak(): void
    playBlockPlace(): void
    playStep(): void
    playJump(): void
    playTone(frequency: number, duration: number): void
    setVolume(volume: number): void
}
```

## Block Types

```javascript
BlockType = {
    STONE: 1
    DIRT: 2
    GRASS: 3
    WOOD: 4
    LEAVES: 5
    WATER: 6
    SAND: 7
    GRAVEL: 8
    COBBLESTONE: 9
    COAL_ORE: 10

    getColor(type: number): {r, g, b}
    getName(type: number): string
}
```

## World Generation

### TerrainGenerator

```javascript
class TerrainGenerator {
    getHeight(x: number, z: number): number // 0-1
    isWater(x: number, z: number, height: number): boolean
    isMountain(x: number, z: number, height: number): boolean
}
```

### BiomeGenerator

```javascript
class BiomeGenerator {
    getBiome(x: number, z: number): string // 'desert', 'snow', etc.
    getSurfaceBlock(x: number, z: number, height: number): number
    getSubsurfaceBlocks(x: number, z: number, height: number, terrainHeight: number): Block[]
    shouldGenerateTree(x: number, z: number): boolean
}
```

### TreeGenerator

```javascript
class TreeGenerator {
    static generateTree(chunkManager, x: number, y: number, z: number): void
    static shouldGenerateTree(x: number, z: number): boolean
}
```

## Physics

### CollisionDetector

```javascript
class CollisionDetector {
    isBlockSolid(blockType: number): boolean
    checkPointCollision(point: Vector3): boolean
    checkSphereCollision(center: Vector3, radius: number): boolean
    checkCylinderCollision(position: Vector3, radius: number, height: number): boolean
    resolveCollision(position: Vector3, velocity: Vector3, radius: number, height: number): CollisionResult
}

interface CollisionResult {
    collision: boolean
    position: THREE.Vector3
}
```

## UI Components

### UI

```javascript
class UI {
    update(player, chunkManager, lighting): void
    updateFPS(): void
    updatePosition(player): void
    updateChunkInfo(chunkManager): void
    updateBlockSelector(): void
    updateEnvironment(lighting): void
}
```

### Hotbar

```javascript
class Hotbar {
    updateDisplay(): void
    selectSlot(index: number): void
}
```

### BlockHighlight

```javascript
class BlockHighlight {
    updateHighlight(raycastHit: RaycastHit | null): void
    dispose(): void
}
```

## Events

### Game State Events

```javascript
// Listen to state changes
gameState.on('stateChanged', (data) => {
    console.log(data.previous, data.current);
});
```

### Custom Events

```javascript
// Create custom event
gameState.emit('playerJumped', { height: 1.5 });

// Listen
gameState.on('playerJumped', (data) => {
    console.log('Jump height:', data.height);
});
```

## Extending the System

### Creating a Custom Block

```javascript
// 1. Add to BlockType
BlockType.CUSTOM = 11;

// 2. Add color
BlockType.getColor = function(type) {
    // ... existing code
    case 11: return { r: 1, g: 0, b: 0 }; // Red
}

// 3. Use in world
chunkManager.setBlock(x, y, z, BlockType.CUSTOM);
```

### Creating a Custom Tool

```javascript
class Tool {
    constructor(name, blockType, speed) {
        this.name = name;
        this.blockType = blockType;
        this.miningSpeed = speed;
    }

    mine(chunkManager, blockPos) {
        // Custom mining logic
    }
}
```

### Adding Custom Terrain

```javascript
class CustomTerrainGenerator extends TerrainGenerator {
    getHeight(x, z) {
        // Custom implementation
        return super.getHeight(x, z) * 0.5;
    }
}
```

## Error Handling

### Try-Catch Pattern

```javascript
try {
    chunkManager.setBlock(x, y, z, blockType);
} catch (error) {
    logger.error('Failed to set block', error);
}
```

### Validation

```javascript
if (x < 0 || y < 0 || z < 0) {
    throw new Error('Invalid block coordinates');
}

if (blockType < 0 || blockType > 10) {
    throw new Error('Invalid block type');
}
```

## Performance Tips

### Batch Operations

```javascript
// Instead of:
for (let i = 0; i < 1000; i++) {
    chunkManager.setBlock(x, y + i, z, blockType);
}

// Do:
const changes = [];
for (let i = 0; i < 1000; i++) {
    changes.push({ x, y: y + i, z, blockType });
}
// Batch process changes
```

### Use Profiler

```javascript
profiler.start('terrain-generation');
// ... generate terrain
const time = profiler.end('terrain-generation');
console.log(`Took ${time}ms`);
```

### Enable Cache

```javascript
const cache = new ChunkCache(512);
cache.set(key, chunk);
const hit = cache.get(key);
console.log(`Hit rate: ${cache.getHitRate()}`);
```

## Debugging

### Enable Debug Mode

Press F3 in-game to open debug panel.

### Log Information

```javascript
logger.info('Custom event', { x, y, z });
```

### Export Logs

```javascript
const logsJSON = logger.export();
console.log(logsJSON);
```

### Check Performance

```javascript
profiler.printReport();
```

## Version Info

- **API Version**: 1.0.0
- **Three.js**: r128+
- **Target**: WebGL 2.0
- **Node**: 14+

---

*For more information, see README.md and DEVELOPMENT.md*
