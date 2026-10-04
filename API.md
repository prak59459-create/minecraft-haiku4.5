# API Reference

Complete API documentation for the Minecraft Clone project.

## Core Classes

### Game
Main game controller orchestrating all systems.

**Properties:**
- `scene: THREE.Scene` - Three.js scene
- `camera: THREE.PerspectiveCamera` - Player camera
- `renderer: THREE.WebGLRenderer` - WebGL renderer
- `world: World` - Game world
- `player: Player` - Player controller
- `particles: ParticleSystem` - Particle effects
- `audio: AudioManager` - Sound management

**Methods:**
- `animate(): void` - Main game loop
- `updateScene(): void` - Update game state
- `handleLeftClick(): void` - Block destruction
- `handleRightClick(): void` - Block placement
- `updateDayNightCycle(): void` - Update lighting

---

### World
Manages chunks and world state.

**Properties:**
- `chunks: Map<string, Chunk>` - Active chunks
- `biomeGen: BiomeGenerator` - Terrain generator
- `loadRadius: number` - Chunk loading distance

**Methods:**
- `getChunk(x: number, z: number): Chunk` - Get chunk by coordinates
- `loadChunk(x: number, z: number): Chunk` - Create/load chunk
- `unloadChunk(x: number, z: number): void` - Unload chunk
- `getBlock(x: number, y: number, z: number): number` - Get block ID
- `setBlock(x: number, y: number, z: number, type: number): void` - Set block
- `updateChunksAround(playerPos: Vector3): void` - Update loaded chunks
- `getMeshes(): Array<Mesh>` - Get all visible meshes

---

### Chunk
Individual terrain chunk (16×128×16 blocks).

**Properties:**
- `x: number` - Chunk X coordinate
- `z: number` - Chunk Z coordinate
- `blocks: Uint8Array` - Block data
- `mesh: Mesh` - Three.js mesh

**Methods:**
- `generate(): void` - Generate terrain
- `setBlock(x: number, y: number, z: number, type: number): void`
- `getBlock(x: number, y: number, z: number): number`
- `buildMesh(): void` - Create/update Three.js mesh
- `dispose(): void` - Clean up resources

---

### Player
Player controller and physics.

**Properties:**
- `camera: PerspectiveCamera` - Camera object
- `position: Vector3` - Player position
- `velocity: Vector3` - Player velocity
- `onGround: boolean` - Ground contact flag

**Methods:**
- `update(world: World): void` - Update physics and position
- `jump(): void` - Jump (if on ground)
- `getDirection(): Vector3` - Get forward direction
- `getBlockInSight(world: World, maxDistance: number): Object` - Raycast
- `handleCollisions(world: World): void` - Process collisions

---

### BiomeGenerator
Procedural terrain and biome generation.

**Methods:**
- `getBiome(x: number, z: number): string` - Get biome name
- `getHeight(x: number, z: number): number` - Get terrain height
- `getSurfaceBlock(x: number, y: number, z: number, height: number, biome: string): number`
- `generateTrees(chunk: Chunk, biome: string): void`
- `placeTree(chunk: Chunk, x: number, y: number, z: number, biome: string): void`

**Biomes:**
- `'desert'` - Flat sand terrain
- `'forest'` - Hilly with trees
- `'jungle'` - High terrain, dense trees
- `'snow'` - High altitude
- `'plains'` - Flat grassland

---

### ParticleSystem
Block destruction effects.

**Methods:**
- `createBlockParticles(position: Vector3, color: Color, count: number): void`
- `update(deltaTime: number): void`

---

### AudioManager
Sound effect generation.

**Methods:**
- `playBlockPlace(): void` - Place sound
- `playBlockBreak(): void` - Break sound
- `playJump(): void` - Jump sound
- `playTone(frequency: number, duration: number, fadeTime: number): void`
- `playNoiseEffect(duration: number, frequency: number): void`
- `setVolume(value: number): void`
- `toggle(): boolean` - Enable/disable audio

---

### PhysicsEngine
Collision and physics simulation.

**Methods:**
- `checkBlockCollision(pos: Vector3, width: number, height: number, world: World): Object`
- `resolveCollisions(pos: Vector3, velocity: Vector3, collisions: Object, width: number): Vector3`
- `raycast(origin: Vector3, direction: Vector3, world: World, maxDistance: number): Object`

**Collision Object:**
```javascript
{
  below: boolean,  // Block below player
  above: boolean,  // Block above player
  x: boolean,      // Block to side (X axis)
  z: boolean       // Block to side (Z axis)
}
```

**Raycast Result:**
```javascript
{
  hit: boolean,
  distance: number,
  point: Vector3,
  blockPos: { x, y, z }
}
```

---

### AdvancedRenderer
Rendering pipeline with optimization.

**Methods:**
- `updateStats(scene: Scene): void` - Calculate mesh statistics
- `render(scene: Scene, camera: Camera): void`
- `getStats(): Object` - Get render statistics
- `resize(width: number, height: number): void`

**Stats Object:**
```javascript
{
  fps: number,           // Frames per second
  drawCalls: number,     // Number of meshes rendered
  triangles: number,     // Triangle count
  vertices: number,      // Vertex count
  totalMemory: string    // MB used
}
```

---

### Inventory
Player inventory system.

**Methods:**
- `addBlock(blockType: number, count: number): boolean`
- `removeBlock(blockType: number, count: number): boolean`
- `getSelectedBlock(): number`
- `getBlockCount(blockType: number): number`
- `selectSlot(index: number): boolean`

---

### CraftingSystem
Crafting recipe management.

**Methods:**
- `getRecipes(): Array<CraftingRecipe>`
- `getRecipeByName(name: string): CraftingRecipe`
- `craftByName(name: string, inventory: Inventory): boolean`

---

## Constants

### BLOCK_TYPES
```javascript
{
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
  LEAVES: 5,
  WATER: 6,
  SAND: 7,
  GRAVEL: 8,
  COBBLESTONE: 9
}
```

### BLOCK_COLORS
Hex color values for each block type.

### BLOCK_NAMES
Display names for each block type.

---

## Configuration

Access via `CONFIG` object in `config.js`:

```javascript
import { CONFIG } from './config.js';

// Rendering
CONFIG.rendering.fov          // Camera field of view
CONFIG.rendering.shadowMapSize // Shadow texture size

// Terrain
CONFIG.terrain.chunkSize      // Blocks per chunk side
CONFIG.terrain.terrainScale   // Noise frequency

// Physics
CONFIG.physics.gravity        // Gravity constant
CONFIG.physics.walkSpeed      // Player walk speed

// Gameplay
CONFIG.gameplay.breakDistance // Max block break distance
CONFIG.gameplay.hotbarSlots   // Number of quick-select blocks
```

---

## Events & Callbacks

### Player Jump Callback
```javascript
player.onJumpCallback = () => {
  console.log('Player jumped!');
};
```

### Block Interaction
```javascript
// Left click
const target = player.getBlockInSight(world);
world.setBlock(target.blockPos.x, target.blockPos.y, target.blockPos.z, BLOCK_TYPES.AIR);

// Right click
world.setBlock(x, y, z, BLOCK_TYPES.GRASS);
```

---

## Utility Functions

### PerlinNoise
```javascript
const noise = new PerlinNoise(seed);
const value = noise.noise(x, y, z);           // Single value
const turbulence = noise.turbulence(x, y, z, octaves);
```

### Vector3 Operations
```javascript
position.x += velocity.x;
position.addScaledVector(direction, distance);
position.distanceToSquared(otherPosition);
```

---

## Memory Management

- Chunks are automatically unloaded based on distance
- Dispose methods should be called on removed objects
- Texture objects are cached to avoid duplicates
- Particle effects have maximum count limits

---

## Performance Metrics

Monitor via `getStats()`:
- FPS target: 60+
- Draw calls: Keep under 1000
- Memory: Keep under 500MB
- Triangle count: 100k-500k depending on view distance

---

## Best Practices

1. Always call `dispose()` on removed chunks
2. Use `updateChunksAround()` to manage chunk loading
3. Avoid rapid block updates (batch when possible)
4. Monitor FPS and adjust `loadRadius` if needed
5. Use `CONFIG` for all tunable parameters
6. Check `onGround` before allowing jump
7. Use raycasting for block targeting
8. Limit particles for better performance
