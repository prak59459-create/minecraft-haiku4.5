# Development Guide

## Project Overview

This is a fully-functional 3D Minecraft clone built with Three.js, featuring procedural terrain generation, physics simulation, and a complete gameplay loop.

## Architecture

The game follows a modular architecture with clear separation of concerns:

```
src/
├── main.js                 # Game initialization and main loop
├── styles.css              # UI styling
└── game/
    ├── world.js            # Terrain generation, chunks, blocks
    ├── player.js           # Player controller, input handling
    ├── physics.js          # Collision detection and resolution
    ├── ui.js               # HUD and user interface
    ├── particles.js        # Particle effects system
    ├── audio.js            # Sound effects and Web Audio API
    ├── camera.js           # Camera controller with head bobbing
    ├── settings.js         # Game configuration and persistence
    ├── performance.js      # Performance monitoring
    └── optimization.js     # Optimization utilities
```

## Core Systems

### World System (world.js)
Handles terrain generation and chunk management:
- **Chunk Generation**: Creates terrain using multi-scale Simplex noise
- **Block Management**: Stores and manages block data
- **Mesh Building**: Converts block data to Three.js geometries
- **Face Culling**: Only renders visible block faces
- **Dynamic Chunks**: Loads/unloads chunks based on player position

### Player System (player.js)
Manages player movement and interaction:
- **Input Handling**: Processes keyboard and mouse input
- **Movement**: Implements walking, sprinting, and crouching
- **Camera Control**: Mouse look with pointer lock
- **Block Interaction**: Raycasting for block selection
- **Flying Mode**: Creative mode movement

### Physics System (physics.js)
Implements collision detection:
- **AABB Collision**: Axis-aligned bounding box detection
- **Collision Resolution**: Resolves player-block collisions
- **Ground Detection**: Determines if player is grounded
- **Gravity**: Simulates falling and jumping

### UI System (ui.js)
Displays game information:
- **Hotbar**: Block selection interface
- **HUD**: Coordinates, FPS, time of day
- **Game State**: Current player status
- **Help Text**: Control instructions

### Audio System (audio.js)
Generates and manages sound effects:
- **Sound Synthesis**: Uses Web Audio API to generate tones
- **Block Sounds**: Place and break block effects
- **Footsteps**: Walking sounds
- **Volume Control**: Adjustable master volume

### Particle System (particles.js)
Creates visual effects:
- **Destruction Particles**: Spawned when blocks are broken
- **Physics**: Particles have velocity and gravity
- **Fade Out**: Particles fade and disappear over time

### Settings System (settings.js)
Persists player preferences:
- **LocalStorage**: Saves settings across sessions
- **Configuration**: FOV, render distance, sensitivity, volume
- **Reset**: Restore default settings

## Adding New Features

### Adding a New Block Type

1. Update block types in `world.js`:
```javascript
this.blockTypes = {
    // ... existing blocks
    7: { name: 'sand', color: 0xc2b280, solid: true },
};
```

2. Update terrain generation in `generateChunk()`:
```javascript
if (isDesert && y === terrainHeight) {
    blockType = 7; // sand
}
```

### Adding Sound Effects

1. Add a method to `audio.js`:
```javascript
playSandFootstep() {
    const freq = 150 + Math.random() * 50;
    this.playTone(freq, 0.05, 0.08, 'sine');
}
```

2. Call from relevant location (e.g., in `player.js` block interaction)

### Adding a Particle Effect

1. Create a new method in `particles.js`:
```javascript
createExplosionParticles(x, y, z) {
    for (let i = 0; i < 20; i++) {
        this.addParticle({
            position: new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 30,
                Math.random() * 30,
                (Math.random() - 0.5) * 30
            ),
            color: 0xff6600,
            life: 1.0,
            maxLife: 1.0,
            gravity: 25
        });
    }
}
```

### Modifying Terrain Generation

Edit the `generateChunk()` method in `world.js`:
```javascript
// Change noise scales
const heightNoise1 = this.noise.noise2D(worldX * 0.003, worldZ * 0.003);
const heightNoise2 = this.noise.noise2D(worldX * 0.01, worldZ * 0.01);

// Adjust terrain height range
const terrainHeight = Math.floor(normalizedNoise * 120) + 30;
```

## Performance Considerations

### Optimization Techniques

1. **Chunk Culling**: Only load chunks within render distance
2. **Face Culling**: Don't render faces between solid blocks
3. **Mesh Instancing**: Reuse materials across chunks
4. **LOD (Level of Detail)**: Simplify distant chunks
5. **Memory Management**: Clean up unused resources

### Profiling

Use the `PerformanceMonitor` class:
```javascript
this.performanceMonitor.startMeasure('myTask');
// ... code to measure ...
const time = this.performanceMonitor.endMeasure('myTask');
console.log(`Task took ${time.toFixed(2)}ms`);
```

## Testing & Debugging

### Browser DevTools

1. **Renderer Info**: `renderer.info` contains geometry and render stats
2. **Three.js Inspector**: Use browser extensions for scene inspection
3. **Console**: Log performance metrics and debug messages

### Performance Testing

Run benchmarks:
```javascript
import { benchmarkScene } from './game/optimization.js';
const results = benchmarkScene(scene, camera, renderer);
console.log(`FPS: ${results.fps}`);
```

## Build & Deployment

### Development

```bash
npm install
npm run dev
```

### Production

```bash
npm run build
```

Build output goes to `dist/` directory.

## Best Practices

1. **Modular Code**: Keep features in separate modules
2. **Comments**: Add WHY, not WHAT (code should be self-documenting)
3. **Performance**: Always measure impact of new features
4. **Testing**: Test features in various scenarios
5. **Git**: Use clear, descriptive commit messages

## Common Tasks

### Changing Game Speed

In `main.js`:
```javascript
// Adjust player speed in player.js
this.moveSpeed = 25; // Default 20
this.sprintSpeed = 35; // Default 30
```

### Adding UI Elements

1. Add to `index.html`
2. Style in `styles.css`
3. Update in `ui.js` update loop

### Changing Day/Night Cycle

In `main.js`:
```javascript
this.dayDuration = 30; // 30 seconds per day
```

### Adjusting Lighting

In `main.js` `setupLighting()`:
```javascript
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
sunLight.intensity = 0.8;
```

## Troubleshooting

### Game Runs Slowly
- Reduce render distance in settings
- Disable shadows
- Disable particles
- Close other browser tabs

### Textures Look Blocky
- This is intentional - Minecraft style flat colors
- Modify `buildChunkMesh()` to add actual textures

### Player Falls Through Blocks
- Check `physics.js` collision logic
- Verify AABB dimensions match player height

## Future Enhancements

1. **Water Physics**: Implement flowing water
2. **Advanced Lighting**: Better shadows and lighting
3. **Mobs**: Add creatures and entities
4. **Inventory**: Full item management
5. **Crafting**: Recipe system
6. **Multiplayer**: Network support
7. **Modding**: Plugin API

## References

- [Three.js Documentation](https://threejs.org/docs/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise)
- [AABB Collision Detection](https://en.wikipedia.org/wiki/Axis-aligned_bounding_box)
