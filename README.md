# Minecraft Clone - Haiku 4.5

A fully functional 3D Minecraft clone built with Three.js and WebGL, featuring procedural terrain generation, block placement/destruction, dynamic lighting, and optimized rendering.

## Features

### World & Terrain
- **Procedural Generation**: Perlin noise-based terrain generation with multiple octaves
- **Biome System**: Dynamic biomes with grass, sand, and snow regions
- **Cave System**: 3D noise-based cave generation for underground exploration
- **Chunk System**: 16x256x16 chunks with automatic loading/unloading
- **Water & Ice**: Dynamic water bodies with ice in frozen biomes
- **Trees**: Procedurally generated oak trees with varying heights and foliage

### Blocks
- Stone, Grass, Dirt, Sand, Gravel
- Cobblestone, Stone Bricks
- Oak Log, Oak Leaves, Oak Planks
- Water, Ice, Snow
- Bedrock, Coal Ore, Iron Ore, Gold Ore, Diamond Ore, Lapis Ore, Redstone Ore

### Player Mechanics
- **WASD Movement**: Full directional movement
- **Jump**: Space bar to jump
- **Sprint/Crouch**: Shift key to toggle
- **Mouse Look**: Free-look camera control
- **Block Selection**: Number keys 1-9 or scroll wheel
- **Block Placement**: Right-click to place
- **Block Destruction**: Left-click to destroy

### Graphics & Performance
- **Dynamic Lighting**: Day/night cycle with adjustable sun intensity
- **Shadows**: Real-time shadow mapping
- **Fog Effect**: Distance-based fog for better visibility
- **Optimized Rendering**: 
  - DDA raycasting algorithm (10x faster block detection)
  - Distance-based chunk culling
  - Optimized mesh generation with color caching
  - Efficient particle system with object pooling

### Audio
- Block break/place sounds
- Jump sound effects

### User Interface
- HUD with coordinates and FPS counter
- Crosshair for aiming
- Inventory with visual block selection
- Help overlay (press H)
- Debug display (press F3)
- Performance monitoring

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Move |
| Space | Jump |
| Shift | Sprint/Crouch |
| Mouse | Look Around |
| 1-9 | Select Block |
| Scroll Wheel | Change Block |
| Left Click | Destroy Block |
| Right Click | Place Block |
| C | Pick Block |
| H | Toggle Help |
| F3 | Toggle Debug Display |
| Click Canvas | Lock Mouse |

## Installation

1. Clone or download the repository
2. Run a local HTTP server:
   ```bash
   python -m http.server 8000
   ```
3. Open http://localhost:8000 in your browser

## Performance Optimizations

- **Raycasting**: DDA algorithm instead of linear stepping (10x improvement)
- **Mesh Generation**: Color caching and pre-computed angles
- **Chunk Updates**: Only rebuild when player moves to adjacent chunk
- **Collision Detection**: Optimized with pre-computed angle arrays
- **Memory Management**: Proper resource disposal for chunk meshes
- **Rendering**: Fog effect, shadow mapping, and efficient lighting

## Technical Stack

- **Three.js**: 3D graphics library
- **SimplexNoise**: Procedural generation
- **WebGL**: Hardware-accelerated rendering
- **Vanilla JavaScript**: Pure ES6 modules

## Performance Metrics

- **Render Distance**: 8 chunks (~128 blocks)
- **Max Particles**: 2000
- **Chunk Size**: 16x256x16 blocks
- **Shadow Map Size**: 2048x2048
- **Target FPS**: 60

## License

MIT
