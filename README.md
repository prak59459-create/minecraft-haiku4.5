# Minecraft Haiku 4.5

A 3D Minecraft clone built with Three.js and TypeScript featuring procedural terrain generation, physics, and interactive block placement/destruction.

## Features

- **3D Graphics**: Built with Three.js for smooth rendering
- **Procedural Terrain**: Perlin noise-based terrain generation with multiple biomes
- **Chunk System**: Dynamic chunk loading/unloading for infinite worlds
- **Player Controls**:
  - WASD for movement
  - Mouse for look around
  - Space for jumping
  - Shift for sprinting/crouching
- **Interaction**:
  - Left-click to destroy blocks
  - Right-click to place blocks
  - Number keys 1-6 for block selection
- **Block Types**: Grass, Dirt, Stone, Wood, Leaves, Water
- **Physics**: Gravity, collision detection, jumping mechanics
- **Lighting**: Dynamic lighting with day/night cycle support
- **UI**: Hotbar, crosshair, position/speed display

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Controls

- **W/A/S/D** - Move forward/left/backward/right
- **Space** - Jump
- **Shift** - Sprint
- **Mouse** - Look around (click to lock pointer)
- **Left Click** - Destroy block
- **Right Click** - Place block
- **1-6** - Select block type

## Game Mechanics

- Gravity and collision detection enable realistic movement
- Blocks are placed/destroyed at raycast intersection points
- Terrain generates indefinitely using Perlin noise
- Chunks load/unload dynamically based on player position
- Multiple block types with different visual colors