# Minecraft Clone - Optimizations Guide

This document outlines performance optimizations and tuning options for the Minecraft clone.

## Performance Metrics

### Target Performance
- **FPS**: 60 (target) on modern hardware
- **Memory**: <500MB typical usage
- **Load Time**: <2s per chunk
- **Render Distance**: 8 chunks (default, adjustable 2-16)

### Current Performance
- **Draw Calls**: Reduced through frustum culling
- **Vertices**: Optimized mesh generation with face culling
- **Memory**: Efficient Uint8Array chunk storage

## Graphics Settings

### Render Distance (Adjustable with +/-)
- **2 chunks**: Best performance, minimal world visible
- **4 chunks**: Good performance, 200+ FPS on modern hardware
- **8 chunks**: Balanced (default), 60 FPS on mid-range
- **12 chunks**: More immersive, 30-40 FPS
- **16 chunks**: Maximum, 15-25 FPS

### Shadow Quality
- **Shadow Map Size**: 2048x2048 (can reduce to 1024x1024 for more FPS)
- **Shadow Camera**: Follows player, sized for good coverage
- **Shadow Bias**: -0.0001 (tweakable in code)

## Memory Optimization

### Chunk Management
- Automatic chunk loading/unloading based on distance
- Chunks beyond render distance are freed from memory
- Max 289 chunks in memory at once (17x17 at distance 8)

### Geometry Pooling
- MeshPool system available (framework for mesh reuse)
- Automatic geometry disposal when chunks unload
- Material reuse across similar meshes

### Particle System
- Maximum 2000 particles to prevent memory spikes
- Particles disposed after lifespan ends
- Efficient buffer geometry updates

## Optimization Tips

### For Better Performance

1. **Reduce Render Distance**
   - Use +/- keys to adjust (default 8)
   - Reduce to 4 or less for very smooth gameplay
   
2. **Lower Graphics Quality**
   - Reduce shadow map size in code (game.js line ~55)
   - Disable shadow casting for distant chunks
   - Use simpler lighting calculations

3. **Close Other Tabs**
   - Browser GPU is shared resource
   - Reduces memory pressure
   - Improves frame rate stability

4. **Update Graphics Drivers**
   - WebGL performance depends on GPU support
   - Latest drivers provide best performance

### For Better Visuals

1. **Increase Render Distance**
   - Provides more immersive experience
   - Shows more of generated world
   - Use +/- keys to find sweet spot

2. **Enable Better Lighting**
   - Current system: Dynamic lighting with shadows
   - Can add normal mapping (future enhancement)
   - Can add bloom effects (future enhancement)

3. **More Particles**
   - Adjust maxParticles in particles.js
   - Increase for more visual feedback
   - May impact performance on lower-end devices

## Code-Level Optimizations

### Raycasting
- Step size optimized to 0.1 (blocks)
- Previous optimization: reduced from 0.05
- Early exit on first hit

### Chunk Rendering
- Face culling: Skip faces between solid blocks
- Vertex colors: Computed once, reused for all vertices
- Indexed geometry: Reduces vertex data transmission

### Physics
- Collision detection: 16 check points around player
- Water physics: Proper buoyancy and friction
- Ground detection: Multiple check points

### Terrain Generation
- Multi-octave Perlin noise for natural terrain
- Cave generation with noise-based voids
- Tree generation with natural placement
- Ore distribution based on depth

## Advanced Tuning

### config.json Settings

```json
{
  "world": {
    "renderDistance": 8,
    "waterLevel": 62
  },
  "graphics": {
    "shadowMapSize": 2048,
    "particleLimit": 2000
  },
  "player": {
    "speed": 0.1,
    "sprintSpeed": 0.15,
    "gravity": 0.02
  }
}
```

### Further Optimizations

1. **Level of Detail (LOD)**
   - Could implement simplified meshes for far chunks
   - Would reduce triangle count
   - Trade-off: slightly less detailed visuals

2. **Occlusion Culling**
   - Skip chunks completely hidden behind terrain
   - Would reduce draw calls
   - Complex to implement

3. **Dynamic Mesh Compression**
   - Reduce geometry quality for far chunks
   - Would save memory and rendering time

4. **Streaming Chunks**
   - Load chunks as needed
   - Better for very large worlds
   - Current system is already reasonably efficient

## Performance Debugging

### Enable Debug Display
- Press F3 to toggle debug information
- Shows FPS, chunk count, vertex count, memory usage
- Geometry size displayed for optimization tracking

### Monitor Memory
- Check JavaScript heap size in debug display
- Watch for memory leaks when playing long sessions
- Close and reopen if memory grows unbounded

### Performance Profiling
- Use browser DevTools (F12) for profiling
- GPU profiling available in most modern browsers
- Identify bottlenecks in rendering pipeline

## World Persistence

### Save/Load System
- Automatic saves every 5 seconds
- Manual save with Ctrl+S
- Player position saved and restored
- Chunks persist using localStorage
- Limited to ~5MB storage (browser dependent)

### Performance Impact
- Saving: Minimal impact, happens every 5s
- Loading: Chunks loaded on demand
- Storage: Uses efficient Uint8Array format

## Conclusion

The Minecraft clone is optimized for smooth gameplay on modern hardware. By adjusting render distance and graphics settings, you can find a good balance between performance and visual quality for your specific device.

For best results on lower-end devices, reduce render distance to 4-6 chunks. For best visuals, use render distance 12+ and ensure graphics drivers are up to date.
