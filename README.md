# Minecraft Clone - Haiku 4.5

A 3D Minecraft-inspired voxel game built with Three.js and procedurally generated terrain using Simplex noise.

## Features

### Core Mechanics
- **WASD Movement**: Move forward, backward, left, right
- **Mouse Look**: Right-click to unlock cursor, move mouse to look around
- **Jumping**: Press Space to jump (gravity affects the player)
- **Sprinting**: Hold Shift while moving to sprint faster
- **Block Interaction**: 
  - Left-click to destroy blocks (5 block radius)
  - Right-click to place blocks from inventory
  - Keys 1-9 or scroll wheel to select block type
  
### World & Terrain
- **Procedural Generation**: Perlin noise-based infinite terrain
- **Chunk System**: Dynamic chunk loading/unloading for performance
- **Multiple Block Types**:
  - Grass (surface blocks)
  - Dirt (subsurface)
  - Stone (deep blocks)
  - Water (oceans)
  - Sand, Gravel, Cobblestone (planned textures)
  - Wood and Leaves (tree generation planned)
  
### Physics & Collisions
- **Gravity System**: Player falls unless grounded
- **Collision Detection**: Precise block-based collision
- **Ground Detection**: Proper grounded state for jumping
- **Raycast Interaction**: Accurate block targeting for mining/placing

### Environment & Polish
- **Day/Night Cycle**: 20-second full cycle (24-hour simulation)
- **Dynamic Lighting**: Sun position affects lighting intensity
- **Ambient Occlusion**: Subtle shading effects
- **Particle System Ready**: Framework for block destruction particles
- **UI Elements**:
  - Player position display (X, Y, Z coordinates)
  - FPS counter
  - Time display (in-game 24-hour format)
  - Crosshair for block targeting
  - Block selector hotbar (1-9 slots)

## Controls

| Key | Action |
|-----|--------|
| W | Move Forward |
| A | Strafe Left |
| S | Move Backward |
| D | Strafe Right |
| Space | Jump |
| Shift | Sprint/Crouch |
| 1-9 | Select Block (Hotbar) |
| Scroll Wheel | Cycle Block Selection |
| Left Click | Destroy Block |
| Right Click | Place Block |
| Mouse Move | Look Around |

## Running the Game

### Option 1: Using Node.js HTTP Server
```bash
npm start
```
Then open http://localhost:8000 in your browser.

### Option 2: Using Python
```bash
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

### Option 3: Direct File Access
Open `index.html` directly in your web browser (may have CORS issues with some features).

## Technical Stack

- **Three.js**: 3D graphics rendering and scene management
- **Simplex Noise**: Terrain generation algorithm
- **WebGL**: Hardware-accelerated graphics
- **Vanilla JavaScript**: No external frameworks, pure ES6

## Performance Optimizations

- **InstancedMesh**: Ready for optimization with instanced rendering
- **Chunk-based Rendering**: Only renders loaded chunks
- **Frustum Culling**: Three.js handles automatic frustum culling
- **Geometry Pooling**: Chunks are regenerated on-demand
- **Shadow Maps**: Optimized 2048x2048 directional light shadows

## Architecture

```
├── index.html          # Main HTML structure and UI
├── game.js            # Core game logic and engine
├── package.json       # Project metadata
└── README.md          # This file
```

### Key Classes & Methods

**MinecraftGame**
- `generateTerrainChunk()`: Creates terrain geometry for a chunk
- `updatePlayer()`: Handles player movement and physics
- `updateChunks()`: Manages chunk loading/unloading
- `handleInteraction()`: Processes block mining/placing
- `updateDayNight()`: Manages time and lighting
- `animate()`: Main game loop

## Planned Enhancements

- [ ] Block texture atlas
- [ ] Tree/forest generation
- [ ] Cave systems
- [ ] Water physics and swimming
- [ ] Particle effects for block destruction
- [ ] Sound effects
- [ ] Save/load world state
- [ ] Multiplayer support
- [ ] Inventory management UI
- [ ] Crafting system
- [ ] Mob entities
- [ ] Weather system (rain, snow)

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Edge
- Safari (may have performance variations)

Requires WebGL 1.0 or higher support.

## License

MIT

## Author

Claude Haiku 4.5
Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>