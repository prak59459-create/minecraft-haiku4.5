# Development Guide

This document provides guidance for developers working on the Minecraft Clone project.

## Project Structure

```
minecraft-haiku4.5/
├── server.js              # Express server entry point
├── package.json           # Project dependencies
├── README.md             # User-facing documentation
├── DEVELOPMENT.md        # This file
└── public/
    ├── index.html        # Main HTML page
    ├── game.js           # Main game loop and orchestration
    ├── config.js         # Central configuration
    ├── renderer.js       # Advanced rendering and optimization
    │
    ├── player.js         # Player controller and movement
    ├── physics.js        # Physics engine and collision
    │
    ├── terrain.js        # Chunk system and world generation
    ├── biomes.js         # Biome generation and features
    ├── terrain-features.js # Caves, ores, structures
    ├── noise.js          # Perlin noise implementation
    │
    ├── particles.js      # Particle effect system
    ├── water.js          # Water rendering and effects
    ├── audio.js          # Sound effects manager
    ├── optimization.js   # Performance utilities
    │
    └── inventory.js      # Inventory and crafting system
```

## Key Components

### Game Loop (game.js)
- Main orchestrator for all game systems
- Handles input, rendering, and updates
- Manages scene construction and cleanup

### Terrain Generation (terrain.js, biomes.js, terrain-features.js)
- Chunk-based world with dynamic loading
- Perlin noise-based procedural generation
- Biome system with distinct characteristics
- Feature generation: trees, caves, ore deposits

### Physics (physics.js, player.js)
- Collision detection and resolution
- Gravity and velocity simulation
- Player movement and jumping
- Raycasting for block targeting

### Rendering (renderer.js, optimization.js)
- Three.js WebGL renderer
- Shadow mapping and lighting
- Frustum culling and LOD system
- Performance monitoring

### Effects (particles.js, audio.js, water.js)
- Particle system for destruction
- Procedural sound generation
- Water shader effects

## Configuration

Edit `public/config.js` to modify:
- Rendering settings (FOV, shadow quality, fog distance)
- Terrain parameters (chunk size, scale, load radius)
- Physics constants (gravity, speeds, collision)
- Gameplay values (day/night cycle, break distance)
- Audio settings (volume, frequencies)

## Adding Features

### Adding a New Block Type

1. Add to `BLOCK_TYPES` in `terrain.js`:
```javascript
export const BLOCK_TYPES = {
  // ... existing blocks
  NEWBLOCK: 10
};
```

2. Add color in `terrain.js`:
```javascript
const BLOCK_COLORS = {
  // ... existing colors
  [BLOCK_TYPES.NEWBLOCK]: 0xabcdef
};
```

3. Add name in `game.js`:
```javascript
const BLOCK_NAMES = {
  // ... existing names
  [BLOCK_TYPES.NEWBLOCK]: 'New Block'
};
```

### Adding a New Biome

1. Update `BiomeGenerator.getBiome()` in `biomes.js`
2. Add biome constants to `CONFIG.biomes` in `config.js`
3. Implement generation logic in `BiomeGenerator.getSurfaceBlock()`

### Adding Sound Effects

1. Add method to `AudioManager` in `audio.js`:
```javascript
playSoundEffect() {
  this.playTone(frequency, duration, fadeTime);
}
```

2. Call in appropriate game event (e.g., in `game.js`)

## Performance Tips

1. **Chunk Optimization**: Adjust `loadRadius` in config for balance between memory and visibility
2. **Shadow Quality**: Lower `shadowMapSize` for better performance on weak machines
3. **Particle Limits**: Reduce `maxParticles` if FPS is low
4. **Draw Calls**: Monitor with debug stats; use LOD system for distant chunks
5. **Mesh Optimization**: Face culling already reduces geometry significantly

## Debugging

Enable debug mode in `config.js`:
```javascript
debug: {
  enabled: true,
  showStats: true,
  showChunkBounds: false
}
```

This displays:
- Current FPS
- Position coordinates
- Active chunks
- Draw call count
- Triangle count

## Testing

### Manual Testing Checklist
- [ ] Player movement (WASD) responds correctly
- [ ] Mouse look works with pointer lock
- [ ] Block placement succeeds at various distances
- [ ] Block destruction produces particles
- [ ] Jump mechanics feel smooth
- [ ] Day/night cycle progresses
- [ ] Audio plays on interactions
- [ ] No memory leaks during extended play
- [ ] Chunks load/unload smoothly
- [ ] FPS remains stable (60+ on modern hardware)

## Common Issues

**Low FPS**
- Reduce chunk load radius
- Lower shadow map quality
- Reduce particle count
- Check for memory leaks

**Chunks not loading**
- Verify `CHUNK_SIZE` and coordinate math
- Check `BiomeGenerator.getHeight()` returns valid values
- Ensure `world.updateChunksAround()` is called

**Physics glitches**
- Verify collision box dimensions
- Check gravity constant
- Ensure player height is reasonable

## Future Enhancements

1. **Rendering**
   - Greedy mesh optimization
   - Deferred rendering
   - Bloom effects

2. **Gameplay**
   - Crafting UI
   - Inventory management
   - Health/damage system

3. **World**
   - Structures (dungeons, villages)
   - Biome-specific mobs
   - Weather system

4. **Performance**
   - Multi-threaded chunk generation
   - Instanced rendering
   - Custom chunk compression

## Building for Production

```bash
# Minify JavaScript (optional, not included)
npm install -g terser
terser public/*.js -o public/game.min.js

# Deploy to server
npm run start
```

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise)
- [Minecraft Wiki](https://minecraft.wiki/)
- [WebGL Best Practices](https://www.khronos.org/webgl/wiki/Best_Practices)

## Contributing

When contributing:
1. Follow existing code style
2. Update config.js for new tunable parameters
3. Add comments for non-obvious logic
4. Test on multiple hardware configurations
5. Update README.md if adding major features
