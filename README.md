# Minecraft Clone - Haiku 4.5

A 3D Minecraft-inspired game built with Three.js, featuring procedurally generated terrain, physics, particles, and immersive gameplay.

## Features

### Core Gameplay
- **WASD Movement** - Navigate the world with smooth controls
- **Mouse Look** - First-person camera control
- **Block Interaction** - Left-click to destroy, right-click to place blocks
- **Block Selection** - Use 1-9, scroll wheel, or 'C' key to pick blocks
- **Physics System** - Gravity, collision detection, and smooth movement

### World Generation
- **Procedural Terrain** - Perlin noise-based infinite terrain generation
- **Chunk System** - Efficient chunk-based loading and unloading
- **Multiple Biomes** - Grass, sand, and varied terrain types
- **Tree Generation** - Multiple tree types (Oak, Birch, Spruce) with realistic foliage
- **Ore Distribution** - Coal, Iron, Gold, and Diamond ores at varying depths

### Graphics & Effects
- **Dynamic Lighting** - Day/night cycle with realistic sun positioning
- **Particle Effects** - Block break particles with physics simulation
- **Water Rendering** - Semi-transparent water with proper blending
- **Smooth Shading** - Optimized Lambert material for fast rendering
- **Block Outline** - Visual highlight for targeted blocks

### Block Types
1. Stone - Primary underground block
2. Grass - Top layer of terrain
3. Dirt - Subsurface terrain
4. Wood (Oak, Birch, Spruce) - Tree logs
5. Leaves - Decorative foliage
6. Sand - Desert terrain
7. Water - Liquid block
8. Gravel - Mountain terrain
9. Bedrock - Bottom layer (unbreakable)
10. Ores - Coal, Iron, Gold, Diamond
11. Clay - Mountain material
12. Obsidian - Rare block

### Optimizations
- **Efficient Rendering** - Uses batched geometry and frustum culling
- **Memory Management** - Automatic chunk cleanup outside render distance
- **Physics Optimization** - Reduced collision check points for performance
- **Raycasting** - Optimized block targeting with early termination
- **UI Caching** - Cached DOM elements for reduced layout thrashing

## Controls

### Movement
- **W/A/S/D** - Move forward/left/back/right
- **Space** - Jump
- **Shift** - Sprint (while moving) or Crouch (hold without moving)
- **Mouse** - Look around (click to capture pointer)

### Interaction
- **Left Click** - Destroy block
- **Right Click** - Place block
- **1-9 Keys** - Select block from inventory
- **Scroll Wheel** - Cycle through inventory blocks
- **C Key** - Pick block (copy selected block type)

### UI
- **F3** - Toggle debug display
- **H** - Toggle help menu

## Configuration

Edit `config.json` to customize:
- Render distance
- Player movement speed
- Raycast distance
- Graphics quality settings
- Terrain generation parameters

## Technical Details

### Architecture
- **Modular Design** - Separate modules for world, player, physics, rendering
- **Three.js** - WebGL rendering engine
- **SimplexNoise** - Procedural terrain generation
- **Web Audio API** - Procedural sound effects

### Performance
- **Target FPS** - 60 FPS optimization
- **Low Precision** - Reduced precision for mobile compatibility
- **Chunk Culling** - Manhattan distance-based frustum culling
- **Material Optimization** - Lambert material with flat shading
- **Particle Pooling** - Efficient particle memory management

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari (iOS)
- Any WebGL 2.0 capable browser

## Getting Started

1. Clone the repository
2. Run `python -m http.server 8000`
3. Open `http://localhost:8000` in your browser
4. Click in the game window to capture the mouse
5. Start building!

## File Structure

```
minecraft-haiku4.5/
├── game.js           - Main game loop and logic
├── world.js          - Terrain generation and chunk management
├── player.js         - Player physics and camera
├── blocks.js         - Block definitions and properties
├── ui.js             - User interface and HUD
├── particles.js      - Particle system
├── water.js          - Water rendering
├── audio.js          - Sound effects
├── debug.js          - Debug display
├── blockoutline.js   - Block selection outline
├── config.js         - Configuration system
├── style.css         - UI styling
├── index.html        - Main HTML page
└── README.md         - This file
```

## Future Improvements

- Multiple game modes (Creative, Survival, Adventure)
- Inventory management with item counts
- More block types and mechanics
- Cave systems and underground structures
- Biome-specific generation
- Multiplayer support
- Inventory saving/loading
- Mobile touch controls
- Settings UI

## Performance Tips

- Lower render distance for better performance on slower devices
- Disable shadows in config (already disabled by default)
- Use Firefox for generally better performance
- Close other browser tabs for optimal FPS

## Credits

Built with:
- Three.js - 3D rendering
- SimplexNoise - Noise generation
- Web Audio API - Sound synthesis

Inspired by Minecraft - Copyright Mojang Studios

## License

MIT License - Feel free to modify and use this project!
