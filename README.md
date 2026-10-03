# Minecraft Clone - Haiku 4.5

A full-featured 3D Minecraft clone built with Three.js, featuring procedural terrain generation, block building/destruction, day/night cycle, and physics-based player movement.

## Features

### Core Gameplay
- **World Generation**: Procedural terrain with Perlin noise-based height maps
- **Block Types**: Grass, Dirt, Stone, Wood, Leaves, Water, Sand, Gravel, Logs (9 block types)
- **Player Interaction**: Left-click to destroy blocks, right-click to place blocks
- **Block Selection**: Hotbar with 9 slots (keys 1-9 or scroll wheel)

### Controls
- **Movement**: WASD to move, Mouse to look around
- **Jump**: Space bar to jump
- **Sprint/Crouch**: Shift to toggle sprint/crouch mode
- **Block Interaction**: 
  - Left Click: Destroy block
  - Right Click: Place block
  - 1-9 or Scroll: Select block type

### Visual Features
- **Day/Night Cycle**: Dynamic lighting with realistic sun position
- **Chunk System**: Efficient terrain loading/unloading based on player position
- **Physics**: Gravity, collision detection, and realistic player movement
- **HUD**: Real-time FPS, position, chunk count, and block counter
- **Crosshair**: Center screen targeting reticle
- **Block Highlighting**: Visual feedback for raycasted blocks

### Environment
- **Render Distance**: 8 chunks in each direction for optimal performance
- **Fog**: Distance-based fog effect for visual depth
- **Shadows**: Dynamic shadow mapping with directional light
- **Block Faces**: Smart face culling to hide interior block faces

## Project Structure

```
minecraft-haiku4.5/
├── index.html          # Main HTML file with UI styling
├── package.json        # Project dependencies
└── src/
    ├── main.js         # Game loop and scene initialization
    ├── player.js       # Player controller and camera
    ├── world.js        # Chunk and world management
    ├── terrain.js      # Procedural terrain generation
    ├── physics.js      # Player physics and collision detection
    ├── blocks.js       # Block definitions and properties
    └── ui.js           # HUD and UI management
```

## Installation & Running

### Local Development
```bash
npm install
npm start
```

Then open `http://localhost:8080` in your browser.

### Using Python HTTP Server
```bash
python -m http.server 8080
```

## Technical Details

### Terrain Generation
- Uses a custom Perlin noise implementation
- Multiple noise layers for varied terrain
- Tree generation with natural placement
- Block type variation based on height

### Physics System
- Gravity with terminal velocity
- AABB collision detection
- Ground detection for jumping
- Sprint/crouch movement modifiers

### Chunk Management
- 16×16×256 block chunks
- Dynamic loading/unloading based on render distance
- Mesh generation with optimized face culling
- Efficient block storage with Map-based lookups

### Rendering
- Three.js for 3D graphics
- WebGL with shadow mapping
- Lambert material with vertex colors for block faces
- Frustum culling for performance

## Browser Compatibility
- Chrome/Chromium
- Firefox
- Safari
- Edge

Requires WebGL support and modern ES6 JavaScript.