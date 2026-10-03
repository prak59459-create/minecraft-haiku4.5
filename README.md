# Minecraft Haiku 4.5

A full-featured 3D Minecraft clone built with Three.js, featuring procedural terrain generation, physics, and complete block interaction system.

## Features

### Gameplay
- **Block Interaction**: Left-click to destroy, right-click to place blocks
- **Block Selector**: Choose from 9 different block types using 1-9 keys or scroll wheel
- **Movement**: WASD for movement with smooth acceleration
- **Camera**: Mouse look with pointer lock for immersive first-person view
- **Jump**: Space key to jump with gravity-based physics
- **Sprint**: Shift to sprint for faster movement
- **Crouch**: Control key for stealth movement

### World Generation
- **Procedural Terrain**: Perlin noise-based world generation with multiple octaves
- **Chunk System**: Dynamic chunk loading/unloading based on player position
- **Natural Features**: Trees with variable heights and foliage, varied terrain elevation
- **Block Types**: Grass, Dirt, Stone, Wood, Leaves, Water, Sand
- **Biome Variation**: Terrain adapts based on elevation and noise patterns

### Graphics & Environment
- **Day/Night Cycle**: Dynamic 10-minute full day cycle with sun positioning
- **Dynamic Lighting**: Intensity changes throughout the day
- **Sky Colors**: Realistic sky transitions from day to night
- **Fog**: Distance fog for visual continuity
- **Shadows**: Real-time shadow mapping for all blocks
- **Vertex Colors**: Per-block color system for visual variety

### Physics & Collisions
- **Gravity**: Realistic gravity with acceleration
- **Collision Detection**: Precise AABB collision detection with ground detection
- **Velocity System**: Momentum-based movement with friction
- **Block-aware Physics**: Proper collision response for horizontal and vertical collisions

### Performance Optimization
- **Frustum Culling**: Only renders visible blocks
- **Mesh Optimization**: Face culling to reduce draw calls
- **Chunk Management**: Smart loading/unloading system
- **Adaptive Pixel Ratio**: Automatic quality scaling based on device

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Move forward/left/backward/right |
| Mouse | Look around (requires click to activate pointer lock) |
| Space | Jump |
| Shift | Sprint (faster movement) |
| Control | Crouch |
| Left Click | Destroy block |
| Right Click | Place block |
| 1-9 | Select block type |
| Scroll Wheel | Cycle through block types |

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The game will be available at `http://localhost:5173`

### Building

```bash
npm build
```

## Architecture

- **src/main.js**: Entry point with scene setup and game loop
- **src/world.js**: Terrain generation, chunk management, and block system
- **src/player.js**: Player controller, camera, and input handling
- **src/physics.js**: Gravity, collision detection, and velocity system
- **src/ui.js**: HUD rendering and game statistics

## Technology Stack

- **Three.js**: 3D graphics library
- **Simplex Noise**: Procedural terrain generation
- **Vite**: Fast build tool and development server

## Performance Notes

- Targets 60 FPS on modern hardware
- Configurable chunk loading distance
- Optimized geometry culling for efficiency
- Shadow maps set to 2048x2048 for quality

## Future Enhancements

- Sound effects and ambient music
- Particle effects for block destruction
- More diverse biomes and block types
- Multiplayer support
- Inventory system
- Crafting mechanics
- NPCs and mobs
