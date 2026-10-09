# Technical Guide - Minecraft Haiku 4.5

## Architecture Overview

### Core Systems

#### Game Engine (`game.js`)
- **Main loop**: 60 FPS animation loop with fixed update rate
- **Rendering**: Three.js WebGL renderer with optimized chunk meshes
- **Physics**: Integration with player movement and collision detection
- **Interaction**: Raycasting for block selection and placement

#### World Generation (`world.js`)
- **Chunk-based terrain**: 16x256x16 voxel chunks
- **Perlin noise**: Multi-octave procedural terrain generation
- **Seeded randomness**: Deterministic world generation with custom SeededRandom class
- **Cave systems**: 3D Perlin noise-based hollow voids
- **Ore distribution**: Height-based ore placement with varied rarity
- **Trees**: Procedurally generated with varying heights and foliage

#### Player System (`player.js`)
- **Physics simulation**: Gravity, velocity, acceleration
- **Collision detection**: Multi-point sphere collision checking
- **Movement**: WASD controls with sprint/crouch modifiers
- **Camera**: First-person perspective with mouse look

#### Block System (`blocks.js`)
- **Block definitions**: 17 block types with properties
- **Collision detection**: Solid/transparent block classification
- **Color mapping**: Vertex-based color rendering
- **Light emission**: Extensible light system (currently empty)

### Rendering Pipeline

1. **Chunk Mesh Generation**
   - Extracts solid blocks from chunk data
   - Culls faces between solid blocks
   - Calculates vertex colors based on height and position
   - Creates indexed BufferGeometry with optimized layout

2. **Visibility Culling**
   - Distance-based chunk loading/unloading
   - Frustum culling with bounding boxes
   - Lazy mesh building on first visibility

3. **Material System**
   - MeshPhongMaterial for main geometry
   - Vertex colors for per-vertex coloring
   - Shadow casting/receiving enabled
   - No texture mapping (uses procedural colors)

### Performance Optimizations

#### Chunk Management
- **Lazy generation**: Chunks generated on-demand
- **Pooling**: Chunk objects reused from object pool
- **Radius-based loading**: Only chunks within render distance loaded
- **Memory cleanup**: Geometry/material disposal on unload

#### Mesh Rendering
- **Face culling**: Only visible faces rendered
- **Geometry caching**: Color pre-computation per block
- **Vertex normal calculation**: Smooth lighting
- **Index reuse**: Efficient triangle lists

#### Physics
- **Multi-point collision**: 8 radial check points per height level
- **Early exit detection**: Skip unnecessary checks on collision
- **Efficient neighbor lookup**: Direct chunk access

#### Audio
- **Procedural synthesis**: Web Audio API oscillators
- **Frequency variation**: Random pitch modulation
- **Sound throttling**: Rate-limited to prevent overlap

### Memory Architecture

#### Chunk Storage
- `Uint8Array(16 * 256 * 16)` = 65,536 bytes per chunk
- Linear indexing: `x + y * 16 + z * 16 * 256`
- Sparse storage: Only loaded chunks kept in memory

#### Particle System
- Dynamic array with max particle limit (5000)
- Position/velocity/color per particle
- Single GPU buffer update per frame

#### Mesh Cache
- Map of chunk coordinates to Three.js Mesh objects
- Automatic disposal on unload
- Single material shared across all chunk meshes

### Network Potential

The architecture supports future multiplayer with:
- Chunk-based synchronization
- Position/velocity updates
- Block change replication
- Client-side prediction

### Extensibility Points

1. **New Block Types**: Add to `BLOCKS` object and update colors/properties
2. **Lighting System**: Extend `LIGHT_EMITTING` set and implement light propagation
3. **Biome System**: Add biome selection in terrain height/type functions
4. **Textures**: Replace vertex colors with UV-mapped textures
5. **Save System**: Implement in `persistence.js` with compression
6. **Sound Variety**: Extend `audio.js` with block-type-specific sounds

## Performance Metrics

### Target Performance
- **FPS**: 60 (stable on modern hardware)
- **Memory**: <500MB (typical scene)
- **Render distance**: 8 chunks (128 blocks)
- **Vertices**: ~500K-2M per frame
- **Draw calls**: 1 per chunk (batched geometry)

### Optimization Techniques Applied
1. Frustum culling
2. Face culling (occlusion)
3. Vertex color caching
4. Geometry indexing
5. Distance-based LOD
6. Material batching
7. Physics point sampling

## Future Enhancement Opportunities

### High Priority
- Level of Detail (LOD) system for distant chunks
- Chunk compression for storage
- Biome system with varied terrain types
- Cave structure generation

### Medium Priority
- Texture atlasing
- Advanced lighting (dynamic shadows)
- Mob system with pathfinding
- Crafting interface

### Long Term
- Multiplayer networking
- Persistent world saves
- Weather system
- Dungeon generation
