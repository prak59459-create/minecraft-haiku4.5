# Minecraft Clone Development Guidelines

## Architecture Overview

### Module Organization
- **constants.js**: All game constants and configuration values
- **perlin.js**: Noise generation (SimplexNoise wrapper)
- **block.js**: Block type definitions and properties
- **chunk.js**: 16×256×16 chunk data structure and mesh generation
- **world.js**: World management, chunk loading/unloading
- **player.js**: Player controller, input handling, camera
- **physics.js**: Collision detection and physics simulation
- **game.js**: Main game loop, initialization, rendering

### Performance Considerations
- Chunks use typed arrays (Uint8Array) for memory efficiency
- Mesh generation uses BufferGeometry for GPU optimization
- Face culling removes hidden faces before mesh creation
- Chunks are regenerated only when blocks change (dirty flag)
- Render distance limits loaded chunks for performance

## Code Standards

### Naming Conventions
- Classes: PascalCase (e.g., `NoiseGenerator`, `Player`)
- Methods/functions: camelCase (e.g., `getBlock`, `update`)
- Constants: UPPER_SNAKE_CASE (e.g., `CHUNK_SIZE`, `GRAVITY`)
- Private properties: prefix with underscore (e.g., `_internalCache`)

### Physics Implementation
- AABB collisions for simplicity and performance
- Gravity applied as constant downward acceleration
- Velocity clamped to prevent excessive falling
- Collision resolution pushes player out of blocks

### Block Management
- Blocks stored as Uint8Array for compact storage
- Chunk coordinates are local (0-15), world coordinates are absolute
- Block placement/destruction triggers chunk mesh regeneration
- Neighbor chunks also updated when edge blocks change

## Adding New Features

### Adding a New Block Type
1. Add constant to `BLOCK_TYPES` in constants.js
2. Add color to `BLOCK_COLORS`
3. Add name mapping to `BLOCK_NAMES`
4. Update terrain generation in perlin.js if needed
5. Add UI slot in index.html if desired

### Optimizations to Implement
1. **Ambient Occlusion**: Calculate shadow at block edges
2. **Texture Support**: Map UV coordinates to block faces
3. **Particle Effects**: Use InstancedMesh for destruction particles
4. **Sound System**: Add Web Audio API for block sounds
5. **Inventory**: Persistent item storage with crafting
6. **Biomes**: Multiple terrain types with different blocks

### Testing
- Verify chunk loading/unloading at boundaries
- Test collision detection with complex shapes
- Validate raycasting accuracy for placement/breaking
- Monitor FPS on low-end devices
- Check memory usage during long sessions

## Known Issues & TODOs

### Current Limitations
- [ ] No texture mapping (solid colors only)
- [ ] No inventory system
- [ ] No particle effects
- [ ] No sound effects
- [ ] No networking/multiplayer
- [ ] No save/load functionality

### Potential Improvements
- [ ] Optimized mesh generation (greedy meshing)
- [ ] LOD (Level of Detail) for distant chunks
- [ ] Frustum culling for chunk rendering
- [ ] WebWorkers for terrain generation
- [ ] Texture atlasing for performance
- [ ] Better lighting with shadowmaps

## Debugging Tips

### Performance Profiling
- Use Chrome DevTools Performance tab
- Monitor GPU memory with WebGL extensions
- Check draw calls per frame (target: <100)
- Profile chunk generation timing

### Visual Debugging
- Add wireframe mode toggle (renderer.wireframe)
- Highlight chunk boundaries with colored grids
- Visualize collision boxes around player
- Display raycast path when breaking/placing blocks

## File Size & Complexity Guidelines

### Per-Module Limits
- Individual JS files should stay under 500 lines
- Each class should have clear, single responsibility
- Functions should be pure when possible
- Avoid circular dependencies

### Resource Usage
- Memory: Efficient chunk storage (<1MB per chunk)
- GPU: Optimize draw calls through batching
- CPU: Keep physics updates under 16ms per frame
- Network: Prepare for multiplayer with efficient serialization

## Release Checklist

Before pushing to main:
- [ ] FPS stable above 30 on target hardware
- [ ] No console errors or warnings
- [ ] All controls responsive and working
- [ ] Chunks load/unload without crashes
- [ ] Physics accurate and player movement smooth
- [ ] Day/night cycle working correctly
- [ ] Block placement and destruction working
- [ ] UI displays correct information
- [ ] README documentation complete

## External Resources

- **Three.js Documentation**: https://threejs.org/docs/
- **SimplexNoise Library**: https://github.com/jwagner/simplex-noise.js
- **WebGL Specs**: https://www.khronos.org/webgl/
- **Game Physics**: http://www.aabb.xyz/
