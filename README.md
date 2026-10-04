# Minecraft Haiku 4.5

A fast, optimized 3D Minecraft clone built with Three.js and procedural terrain generation using Simplex noise.

## Features

- **3D World**: Procedurally generated infinite terrain with multiple biomes
- **Block Types**: Grass, Dirt, Stone, Wood, Leaves, Sand, Water, Coal, Obsidian
- **Player Controls**: 
  - WASD for movement
  - Mouse for look around
  - Space for jump
  - Shift for crouch
- **Block Interaction**:
  - Left-click to destroy blocks
  - Right-click to place blocks
  - 1-9 keys or scroll wheel to select blocks
- **Terrain Generation**: Perlin noise-based procedural world generation
- **Physics**: Gravity, jumping, collision detection
- **Chunk System**: Efficient chunk loading/unloading for infinite worlds
- **Day/Night Cycle**: Dynamic lighting that cycles throughout the day
- **Performance**: Optimized rendering with frustum culling and efficient mesh batching

## Installation

```bash
npm install
```

## Running

```bash
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Controls

| Key | Action |
|-----|--------|
| W | Move forward |
| A | Move left |
| S | Move backward |
| D | Move right |
| Space | Jump |
| Shift | Crouch/Sprint |
| Mouse | Look around (click to lock/unlock) |
| Left Click | Destroy block |
| Right Click | Place block |
| 1-9 | Select block type |
| Scroll Wheel | Cycle block types |

## Technical Details

- Built with Three.js for 3D rendering
- Simplex noise for procedural terrain generation
- Efficient chunk-based world system (16x128x16 blocks per chunk)
- Shadow mapping for realistic lighting
- Raycasting for accurate block interaction
- Particle system for block destruction effects
- Fog rendering for performance and visual depth
- Temperature-based biome generation

## Advanced Features

- **Terrain Generation**: 
  - Procedural height maps using Simplex noise
  - Temperature-based biomes (warm forests, cold tundra)
  - Ore distribution in stone layers (coal, obsidian)
  - Procedural tree generation with variable sizes
  - Water level management and coastlines

- **Physics System**:
  - Gravity with acceleration
  - Friction-based movement damping
  - Accurate collision detection
  - Jump mechanics with ground detection

- **Rendering**:
  - Face culling (only visible faces rendered)
  - Chunk-based mesh batching
  - Dynamic lighting with day/night cycle
  - Fog for draw distance optimization
  - Transparent material support

## Performance

- Targets 60 FPS on modern hardware
- Efficient memory management with chunk loading/unloading
- Optimized mesh generation with face culling
- Particle effects for visual feedback
- Render distance: 8 chunks (128 blocks)
- Proper garbage collection for terrain unloading

## Advanced Gameplay Features

- **Immersive Movement**: Head bob animation for realistic walking feel
- **Block Targeting**: Visual feedback showing targeted blocks for placement/destruction
- **Terrain Features**:
  - Procedural caves using noise functions
  - Temperature-based biomes affecting terrain type
  - Ore distribution throughout stone layers
  - Dynamic tree generation with variable sizes
  
- **User Preferences**:
  - Adjustable mouse sensitivity with +/- keys
  - Fullscreen mode support with F key
  - Number key hotbar for quick block selection
  
- **Visual Effects**:
  - Dynamic day/night cycle (20-second cycle)
  - Fog color changes with time of day
  - Water animations with wave effect
  - Per-face brightness shading for depth perception
  - Particle effects when destroying blocks

## System Requirements

- Modern browser with WebGL support
- Minimum: 4GB RAM, dedicated GPU recommended
- Internet connection for initial Three.js CDN load

## File Structure

```
minecraft-haiku4.5/
├── game.js          # Main game logic (878 lines)
├── index.html       # Game interface and styling
├── server.js        # Express.js development server
├── package.json     # Project dependencies
└── README.md        # This file
```