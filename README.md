# Minecraft Clone - 3D Voxel World

A complete 3D Minecraft-inspired voxel game built with Three.js and JavaScript. Features procedurally generated terrain, full block interaction, and real-time rendering with dynamic lighting.

## Features

- **Procedural Terrain Generation**: Perlin noise-based infinite world with varying terrain heights
- **Chunk System**: Dynamic chunk loading/unloading for memory efficiency
- **Player Controller**: Smooth WASD movement, mouse look, jumping, and sprinting
- **Block Interaction**: Place and destroy blocks in real-time
- **Multiple Block Types**: Grass, Dirt, Stone, Wood, Leaves, Water, Sand, Gravel, Cobblestone
- **Physics**: Gravity, collision detection, and water swimming mechanics
- **Dynamic Lighting**: Day/night cycle with smooth lighting transitions
- **Tree Generation**: Procedural tree generation on terrain
- **Raycasting**: Block highlighting and selection system
- **Clean UI**: Crosshair, FPS counter, position tracker, block selector

## Controls

- **W/A/S/D**: Move forward/left/backward/right
- **Mouse**: Look around (click to lock cursor)
- **Space**: Jump (hold in water to swim up)
- **Shift**: Sprint
- **Left Click**: Destroy block
- **Right Click**: Place block
- **1-9**: Select block type
- **Scroll Wheel**: Cycle through block types

## How to Run

1. Open `index.html` in a modern web browser
2. Click to lock cursor and start playing
3. WASD to move, mouse to look around

## Technical Details

- **Engine**: Three.js
- **Terrain**: Simplex noise implementation
- **Rendering**: Optimized vertex buffer geometry with face culling
- **Collision**: AABB-based collision detection
- **Memory**: Efficient chunk storage with view distance culling