# Minecraft Clone - Haiku Edition

A fully-featured 3D Minecraft clone built with Three.js, featuring procedural terrain generation, block placement/destruction, day-night cycles, and dynamic lighting.

## Features

### Core Gameplay
- **WASD Movement** - Navigate through the world
- **Mouse Look** - First-person camera control
- **Space Jump** - Jump to reach higher areas
- **Shift Sprint/Crouch** - Faster movement when held

### Interaction System
- **Left-Click Destroy** - Remove blocks from the world
- **Right-Click Place** - Add blocks to the world
- **1-9 / Scroll Wheel** - Quick block selection hotbar

### World & Terrain
- **Perlin Noise Generation** - Naturally varying terrain heights
- **Chunk System** - Efficient 16x16 chunk loading/unloading
- **Multiple Block Types** - Grass, dirt, stone, wood, leaves, water, sand
- **Procedural Trees** - Auto-generated trees on grass blocks
- **Water Terrain** - Water blocks below sea level (y=64)

### Physics & Collisions
- **Gravity System** - Player falls naturally
- **Y-Axis Clamping** - Walking on ground at y=64
- **Raycasting** - Accurate block selection and interaction
- **Block Highlighting** - See exactly which block you're targeting

### Environment & Polish
- **Day/Night Cycle** - 20-second cycle with dynamic lighting
- **Dynamic Sun Lighting** - Directional light follows sun position
- **Ambient Lighting** - Soft shadow casting and ambient occlusion
- **Sky Gradient** - Changes color based on time of day
- **Clean UI** - FPS counter, position display, block info, hotbar

## Controls

| Key | Action |
|-----|--------|
| **W** | Move Forward |
| **A** | Move Left |
| **S** | Move Backward |
| **D** | Move Right |
| **Space** | Jump |
| **Shift** | Sprint/Crouch (hold) |
| **Left Click** | Destroy Block |
| **Right Click** | Place Block |
| **1-9** | Select Block Hotbar Slot |
| **Scroll Wheel** | Cycle Block Selection |
| **Mouse** | Look Around |

## Block Types

- **Grass Block** - Default terrain surface
- **Dirt** - Subsurface terrain
- **Stone** - Deep underground blocks
- **Wood** - Tree trunks
- **Leaves** - Tree foliage
- **Water** - Liquid blocks (non-interactive)
- **Sand** - Desert-like blocks

## Technical Details

### Architecture
- **Three.js** - 3D rendering engine
- **SimplexNoise** - Perlin noise terrain generation
- **First-Person Controls** - Smooth camera and movement system
- **Chunk Manager** - Dynamic chunk loading based on player position
- **Raycasting** - Precise block interaction detection

### Performance Optimizations
- Chunk-based rendering with distance culling
- Instanced geometry where possible
- Efficient block mesh generation
- Dynamic memory management for chunk loading/unloading
- Render distance optimization (8 chunks radius)

### Game Loop
- 60+ FPS target with smooth deltatime-based movement
- Efficient camera matrix updates
- Optimized raycasting for block selection
- Frame-rate independent physics and movement

## Getting Started

1. Open `index.html` in a modern web browser
2. Click to enable mouse lock (required for controls)
3. Use WASD to move, mouse to look around
4. Click blocks to destroy, right-click to place
5. Use 1-9 or scroll wheel to select different block types

## Browser Requirements

- WebGL support
- Modern JavaScript (ES6+)
- Pointer Lock API support
- Canvas 3D context

## Performance Notes

- Render distance set to 8 chunks (128 blocks) for balance
- Chunk size: 16x16x256 blocks
- Total world height: 256 blocks
- Dynamic mesh generation for visible chunks only
- Automatic chunk unloading when out of range

## Future Enhancements

- Sound effects and ambient audio
- Particles and destruction effects
- Inventory system
- Crafting mechanics
- Multiple game modes
- Multiplayer support
- Advanced lighting (torches, block-based light)
- Biome variations
- Underground cavern generation
