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
- Efficient chunk-based world system
- InstancedMesh for performance optimization
- Shadow mapping for realistic lighting
- Raycasting for accurate block interaction

## Performance

- Targets 60 FPS on modern hardware
- Efficient memory management with chunk loading/unloading
- Optimized mesh generation with face culling
- Dynamic draw distance based on performance