# Minecraft Clone - Haiku 4.5

A fully-featured 3D Minecraft clone built with Three.js featuring procedural terrain generation, block interactions, and physics.

## Features

### Terrain & World
- Perlin noise-based procedural infinite world generation
- Chunk-based loading/unloading system for performance
- Multiple block types: grass, dirt, stone, wood, leaves, water, sand, cobblestone, bedrock
- Procedurally generated trees with natural spacing
- Day/night cycle foundation (ready for implementation)

### Player Controls
- **Movement**: WASD keys for forward/back/strafe
- **Look**: Mouse movement for camera rotation
- **Jump**: Spacebar to jump with gravity physics
- **Sprint**: Hold Shift for increased movement speed
- **Block Selection**: Number keys 1-9 or scroll wheel to select blocks
- **Interactions**:
  - Left-click to destroy blocks
  - Right-click to place blocks

### Gameplay Systems
- Physics engine with gravity and collision detection
- Accurate block-level collision
- Player can traverse varied terrain naturally
- Water is navigable (no collision)
- Leaves are walkable but transparent

### Visual & Performance
- Three.js WebGL rendering with proper lighting
- Directional sunlight with shadows
- Ambient lighting for visibility underground
- Efficient chunk mesh generation
- Visible chunk radius: 8 chunks (128 blocks)
- Smooth camera controls with configurable sensitivity

### UI
- Crosshair for aiming
- FPS counter
- Player position display
- Chunk count indicator
- Block inventory selector with 9 slots
- Control instructions overlay

## Development Setup

### Requirements
- Node.js 18+ (for npm)
- Modern web browser with WebGL support

### Installation
```bash
npm install
```

### Running Development Server
```bash
npm start
```
The game opens at `http://localhost:3000`

### Building for Production
```bash
npm build
```

## Project Structure

```
├── index.html          # HTML entry point with HUD
├── src/
│   ├── main.js        # Game loop and Three.js setup
│   ├── world.js       # World management and chunk system
│   ├── chunk.js       # Chunk generation and mesh building
│   ├── player.js      # Player controller and physics
│   ├── blocks.js      # Block type definitions
│   └── ui.js          # HUD and UI updates
├── vite.config.js     # Build configuration
└── package.json       # Dependencies
```

## Technical Details

### Terrain Generation
- Uses Simplex noise for natural-looking terrain variation
- Height variations create mountains and valleys
- Terrain generation happens dynamically as chunks load

### Chunk System
- 16x16x256 block chunks
- Chunks load within render distance (8 chunks = 128 blocks)
- Chunks are unloaded when player moves far enough away
- Mesh is rebuilt when blocks are modified

### Collision Detection
- Player AABB (axis-aligned bounding box) collision
- Checks surrounding blocks in a cubic range
- Handles horizontal and vertical collision separately
- Proper handling of negative coordinates using modulo

### Block System
- 9 block types with different properties
- Solid blocks vs liquid blocks (water)
- Transparent blocks (leaves) don't block view but are walkable
- Bedrock cannot be destroyed

## Performance Optimization

- Dynamic chunk loading based on player position
- Frustum culling at renderer level
- Efficient mesh generation with BufferGeometry
- Memory management for unloaded chunks
- Modulo arithmetic for cross-chunk coordinate handling

## Future Enhancements

- Day/night cycle with dynamic lighting
- Biome system (snow, desert, forest variations)
- More block types and vegetation
- Sound effects for breaking/placing blocks, footsteps
- Particle effects for block destruction
- Inventory system with crafting
- Multiplayer support
- Better terrain features (caves, structures)