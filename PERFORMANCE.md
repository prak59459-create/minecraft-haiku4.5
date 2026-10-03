# Performance Optimization Guide

## Overview

This document outlines performance considerations and optimizations for the Minecraft Haiku 4.5 clone.

## Key Performance Features

### 1. Chunk System
- **Dynamic Loading**: Chunks are loaded and unloaded based on player position
- **Render Distance**: Set to 3 chunks in each direction (configurable)
- **Caching**: Chunks are cached in a Map for quick access

### 2. Mesh Optimization
- **Greedy Meshing**: Only renders visible block faces
- **Face Culling**: Blocks with adjacent blocks don't render shared faces
- **Geometry Batching**: Each chunk uses a single BufferGeometry

### 3. Physics Optimization
- **Collision Detection**: Uses AABB (Axis-Aligned Bounding Box) testing
- **Selective Testing**: Only checks blocks near the player
- **Efficient Raycasting**: Ray-block intersection with early termination

### 4. Rendering Optimization
- **Three.js Optimizations**:
  - Double-sided rendering disabled where possible
  - Proper shadow map configuration
  - Viewport-relative fog

### 5. Audio
- **Web Audio API**: Procedural audio generation (no file downloads)
- **Efficient Synthesis**: Oscillator-based sounds with envelope shaping

## Performance Metrics

Monitor performance using the in-game HUD:
- **FPS**: Target 60 FPS on modern hardware
- **Chunks**: Monitor loaded chunk count
- **RAM**: JavaScript heap size in MB

## Optimization Tips

### For Better Performance:
1. **Reduce Render Distance**: Lower RENDER_DISTANCE constant in world.ts
2. **Disable Shadows**: Set shadowMap.enabled = false in renderer.ts
3. **Lower Mesh Quality**: Reduce vertices per chunk by increasing block size
4. **Disable Particles**: Comment out particle creation for instant performance boost

### For Better Visuals:
1. **Increase Shadow Resolution**: Raise shadowMap.mapSize values
2. **Improve Lighting**: Add more directional lights or increase intensity
3. **Better Textures**: Replace solid colors with texture maps
4. **Post-Processing**: Add bloom, FXAA, or other post-processing effects

## Browser Compatibility

- **Recommended**: Chrome 90+, Firefox 88+, Safari 15+
- **WebGL2 Required**: Modern GPUs and drivers
- **Mobile**: Limited performance, recommended desktop for best experience

## Future Optimization Ideas

- [ ] Octree spatial partitioning
- [ ] Frustum culling
- [ ] Level of Detail (LOD) system
- [ ] Instanced mesh rendering
- [ ] Work offloading to Web Workers
- [ ] Texture atlasing
- [ ] Deferred rendering
- [ ] Compute shader terrain generation

## Profiling

Use Chrome DevTools Performance tab to identify bottlenecks:
1. Open DevTools (F12)
2. Go to Performance tab
3. Start recording
4. Play for 30 seconds
5. Stop and analyze frame times

Look for:
- Long tasks (>16ms at 60 FPS)
- Garbage collection pauses
- Slow rendering passes
