# Minecraft Clone - Haiku 4.5

A fully-featured 3D Minecraft clone built with Three.js, featuring procedural terrain generation, physics, and dynamic day/night cycles.

## Features

### Core Gameplay
- **3D World**: Rendered using Three.js with proper lighting and shadows
- **Procedural Terrain**: Infinite world generation using Perlin noise
- **Block System**: 10+ different block types (grass, dirt, stone, wood, leaves, water, sand, gravel, coal ore, iron ore)
- **Block Interaction**: Place and destroy blocks with left/right click
- **Chunk System**: Optimized chunk loading/unloading based on player position

### Controls
- **Movement**: WASD keys
- **Camera Look**: Mouse movement (pointer lock required)
- **Jump**: Space bar
- **Sprint/Crouch**: Hold Shift
- **Block Destruction**: Left-click
- **Block Placement**: Right-click
- **Block Selection**: Number keys 1-9 or mouse scroll wheel

### Physics & Collision
- Gravity and jumping mechanics
- Precise block collision detection
- Raycasting for block interaction
- Block highlighting on hover

### Visual Effects
- **Day/Night Cycle**: Dynamic lighting that changes over time
- **Dynamic Lighting**: Sun position affects scene brightness
- **Fog**: Distance fog for performance
- **Shadows**: Real-time shadow mapping
- **Materials**: Standard materials with roughness and metalness

### UI Elements
- Crosshair in center of screen
- Block selection bar at bottom
- Player position display
- Information panel with controls
- Status messages

## How to Play

1. Open `index.html` in a modern web browser
2. Click anywhere to start (enables pointer lock)
3. Use WASD to move around
4. Move your mouse to look around
5. Scroll wheel or press 1-9 to select different blocks
6. Right-click to place blocks
7. Left-click to destroy blocks
8. Use Shift+WASD to sprint forward or crouch

## Technical Implementation

### Libraries Used
- **Three.js**: 3D graphics rendering
- **SimplexNoise**: Perlin noise generation for terrain

### Architecture
- **Chunk-based world**: Organized into 16x16 block chunks for efficient rendering
- **Raycasting**: Used for block selection and interaction
- **Object pooling**: Reused materials for similar blocks
- **Shadow mapping**: Real-time shadows for improved visuals

### Performance Optimizations
- Chunk-based rendering reduces draw calls
- Material reuse for similar block types
- Lazy chunk generation
- Distance-based chunk loading
- Fog for depth culling

## Browser Compatibility

Requires a modern browser with WebGL support:
- Chrome/Chromium 60+
- Firefox 55+
- Safari 15+
- Edge 79+

## Future Enhancements
- Sound effects (mining, placing blocks, footsteps)
- Particle effects for block destruction
- More sophisticated terrain generation
- Biomes with different block types
- Inventory system
- Crafting mechanics
- NPCs and enemies
- Multiplayer support