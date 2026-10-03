# Minecraft Haiku 4.5

A 3D Minecraft clone built with Three.js featuring procedural terrain generation, block interactions, physics, and a dynamic day/night cycle.

## Features

### Controls
- **WASD**: Move forward, left, backward, right
- **Mouse**: Look around (click to lock)
- **Space**: Jump
- **Shift**: Sprint/crouch
- **1-9/Scroll Wheel**: Select block from hotbar
- **Left Click**: Destroy block
- **Right Click**: Place block

### Gameplay
- **Procedural Terrain**: Perlin noise-based terrain generation with multiple noise octaves
- **Chunk System**: Dynamic chunk loading/unloading for large worlds
- **Multiple Block Types**: Stone, dirt, grass, wood, leaves, sand, gravel, ores (coal, iron, gold), water, glass
- **Physics**: Gravity, jumping, collision detection with world
- **Raycasting**: Block highlight when looking at blocks, accurate block placement/destruction
- **Rendering**: Efficient mesh generation with face culling

### Environment
- **Day/Night Cycle**: Dynamic lighting that changes throughout the day
- **Sky**: Atmospheric sky that changes color based on time
- **Ambient Lighting**: Realistic ambient light with directional shadows
- **Trees**: Procedurally generated trees with logs and leaves

### UI
- **Hotbar**: Visual block selection hotbar
- **Crosshair**: Center screen crosshair for block targeting
- **Debug Info**: Position, chunk, FPS counter

## Running

```bash
npm start
# or
python3 -m http.server 8000
```

Open http://localhost:8000 in a web browser.

## Architecture

- **config.js**: Game configuration constants
- **utils.js**: Utility functions for coordinate transformations
- **block-types.js**: Block definitions and properties
- **physics.js**: Collision detection and raycast system
- **world.js**: Chunk generation and terrain
- **player.js**: Player state, movement, and camera
- **renderer.js**: Three.js scene setup and chunk mesh generation
- **input.js**: Keyboard and mouse input handling
- **main.js**: Main game loop and coordinator

## Performance

The game uses:
- Instanced chunk mesh generation with face culling
- Dynamic chunk loading/unloading
- Efficient collision detection
- WebGL rendering with Three.js

## Dependencies

- Three.js (from CDN)
- SimplexNoise (from CDN)