# Development Guide

## Project Structure

This Minecraft clone is organized into several key modules:

### Game Loop (`src/game.js`)
- Manages the main render loop and frame timing
- Coordinates updates between all systems
- Handles window resizing and pointer lock
- Updates lighting and UI each frame

### Player System (`src/player.js`)
- Manages player position and velocity
- Handles camera control and rotation
- Tracks selected block and inventory
- Calculates forward/right directions for movement

### Input System (`src/input.js`)
- Handles keyboard input (WASD, Space, Shift, Ctrl)
- Processes mouse movement and clicks
- Manages block selection (1-9 keys, scroll wheel)
- Triggers block placement and destruction

### Physics Engine (`src/physics.js`)
- Simulates gravity and acceleration
- Detects collisions with blocks
- Manages grounded state for jumping
- Applies friction and air resistance

### World System (`src/world/`)
- **world.js**: Manages chunks, loading/unloading, raycasting
- **chunk.js**: Individual chunk data, block storage, mesh generation
- **blocks.js**: Block type database and properties
- **terrain.js**: Perlin noise-based terrain generation with caching
- **biome.js**: Biome system for terrain variation

### Effects & Audio
- **particles.js**: Particle system for block destruction
- **sound.js**: Web Audio API sound synthesis
- **config.js**: Centralized configuration

### Utilities
- **profiler.js**: Performance measurement and reporting
- **inventory.js**: Item management system
- **utils/math.js**: Mathematical utilities
- **utils/logger.js**: Logging system
- **utils/meshoptimizer.js**: Mesh optimization

## Adding New Block Types

1. Add to `BlockDatabase.blocks` in `src/world/blocks.js`:
```javascript
'myblock': { id: 11, name: 'myblock', type: 'myblock', solid: true }
```

2. Add UV coordinates in `Chunk.getBlockUV()`:
```javascript
'myblock': [0.5, 0.75]
```

3. Add color in `Chunk.getBlockTexture()`:
```javascript
const blocks = ['bedrock', ..., 'myblock'];
const colors = ['#1a1a1a', ..., '#ff00ff'];
```

4. Add placement logic in biome system if needed

## Modifying Terrain Generation

Edit `src/world/terrain.js` to change:
- `scale`: Height variation amount
- `baseHeight`: Starting terrain height
- Noise octaves and frequencies in `getHeightAt()`

For biome changes, modify `src/world/biome.js`:
- Add new biome types
- Adjust height ranges for biome transitions
- Change tree generation frequency

## Performance Optimization

### Profiling
Use the `Profiler` class to measure performance:
```javascript
profiler.start('operation');
// ... code to measure
profiler.end('operation');
console.log(profiler.report());
```

### Chunk Optimization
- Reduce `renderDistance` in `src/config.js`
- Increase `chunkSize` for fewer chunks (less overhead)
- Decrease `worldHeight` if high terrain height not needed

### Graphics Optimization
- Lower `shadowMapSize` for faster shadow rendering
- Reduce `ambientLightIntensity` and `directionalLightIntensity`
- Increase fog distances to reduce draw distance

## Memory Management

### Caching
- Height/humidity/temperature use LRU caching (10,000 entries max)
- Texture is cached at chunk level to share across all chunks
- Clear caches if memory usage becomes excessive

### Chunk Unloading
Chunks beyond render distance are automatically unloaded:
```javascript
// In world.js
if (Math.abs(cx - chunkX) > this.renderDistance) {
    this.unloadChunk(cx, cz);
}
```

## Raycasting

The raycasting system is used for:
- Block selection (which block is player looking at)
- Block placement detection
- Block destruction
- Collision detection

Located in `World.rayCastFromPlayer()`, it traces a ray from the player's eye in the look direction.

## Sound System

Sounds are procedurally generated using the Web Audio API:
- Different frequencies for different block types
- Exponential falloff for natural decay
- Dynamic volume control

Add new sounds in `SoundManager`:
```javascript
playMySound() {
    this.playSound(frequency, duration, volume);
}
```

## Particle System

Particles are created for visual feedback. They:
- Spawn with random velocities
- Apply gravity and acceleration
- Fade out over time
- Are rendered as point sprites

Create particles:
```javascript
this.particles.createBlockBreakParticles(position, color);
```

## Testing

While there are no automated tests, manual testing should cover:
1. **Movement**: WASD, jumping, sprinting
2. **Block Interaction**: Placing and destroying blocks
3. **Terrain**: Verify biomes generate correctly
4. **Performance**: Monitor FPS in different scenarios
5. **Edge Cases**: Movement at chunk boundaries

## Debugging

Enable debug logging:
```javascript
Logger.setLevel(Logger.levels.DEBUG);
```

Monitor performance:
```javascript
const report = profiler.report();
console.table(report);
```

Check Three.js statistics:
```javascript
console.log(renderer.info);
```

## Future Enhancement Ideas

1. **More Blocks**: Add stairs, slabs, doors, lights
2. **Entities**: Mobs, animals, NPCs
3. **Inventory**: Full crafting/smelting system
4. **Saving**: Persist worlds to localStorage/IndexedDB
5. **Multiplayer**: WebSocket-based networking
6. **Advanced Terrain**: Caves, ores, structures
7. **Weather**: Rain, snow, storms
8. **Better UI**: Pause menu, settings, inventory screen

## Common Issues & Solutions

### Low FPS
- Reduce render distance
- Lower chunk size
- Disable shadows or reduce shadow map size

### Chunks not loading
- Check `world.generateTerrain()` is called in `Game.init()`
- Verify chunk coordinates are calculated correctly
- Check browser console for errors

### Physics issues
- Adjust gravity value in `Physics` constructor
- Fine-tune collision detection in `checkVerticalCollisions()`
- Check player radius and eye height constants

### Missing blocks
- Verify block ID is unique and not conflicting
- Check block texture UV coordinates are in valid range
- Ensure block type is added to all relevant systems
