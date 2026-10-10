# Minecraft Clone - Haiku 4.5

A fully functional 3D Minecraft clone built with Three.js, featuring procedural terrain generation, physics, and interactive gameplay.

## Features

### Core Gameplay
- **WASD Movement**: Navigate the world with standard FPS controls
- **Mouse Look**: First-person camera control with mouse movement
- **Block Interaction**: 
  - Left-click: Destroy blocks
  - Right-click: Place blocks
  - Keys 1-9 / Scroll Wheel: Select blocks from inventory
- **Jumping & Sprinting**: Space to jump, Shift to sprint/crouch
- **Inventory System**: 9-slot hotbar with different block types

### World & Terrain
- **Procedural Generation**: Infinite world using Perlin noise
- **Chunk System**: 16×256×16 chunk-based terrain loading
- **Multiple Block Types**:
  - Grass, Dirt, Stone, Cobblestone
  - Sand, Gravel
  - Wood logs and leaves (with realistic tree generation)
  - Water and lava
  - Ores: Coal, Iron, Gold, Diamond
  - Obsidian and Bedrock
- **Dynamic Chunk Loading**: Chunks load/unload based on player position
- **Terrain Features**: 
  - Varied heights with multiple Perlin noise octaves
  - Forest generation with procedurally generated trees
  - Water levels with proper rendering

### Physics & Collision
- **Gravity System**: Realistic falling and jumping mechanics
- **Collision Detection**: 
  - Precise block collision detection
  - Smooth movement along terrain
  - Proper ground detection
- **Raycasting**: Block selection with distance-based targeting (6 blocks)
- **Block Outline**: Visual feedback showing selected block with white outline

### Rendering
- **Dynamic Lighting**:
  - Day/night cycle with moving sun
  - Dynamic ambient light based on time
  - Directional light with shadow mapping
- **Visual Effects**:
  - Fog for distance rendering optimization
  - Block break particles
  - Water with semi-transparent rendering
  - Proper material lighting
- **Performance Optimization**:
  - Frustum culling for hidden chunks
  - Efficient mesh generation
  - Optimized particle system with limits
  - Dynamic shadow quality

### Audio
- **Sound Effects**:
  - Block breaking sounds
  - Block placement sounds
  - Jump sounds
  - Step sounds (procedurally generated)
- **Web Audio API**: Synthesized sounds for low bandwidth

### UI & Controls
- **HUD Display**: 
  - Player coordinates
  - FPS counter
  - Current block info
- **Crosshair**: Center screen indicator
- **Inventory Display**: Visual block selection UI
- **Help System**: Accessible with H key
- **Debug Display**: F3 toggles performance metrics
  - FPS counter
  - Active chunks
  - Vertex/triangle count
  - Memory usage

### Advanced Features
- **Smart Spawn System**: Auto-detection of safe spawn points
- **Respawn Mechanics**: Falls too far → respawn at spawn point
- **Mobile Support**: Touch support for inventory
- **Pointer Lock**: Full mouse control when looking at canvas

## Controls

| Key | Action |
|-----|--------|
| WASD | Move forward/left/back/right |
| Space | Jump |
| Shift | Sprint (while moving) / Crouch (while standing) |
| Mouse Move | Look around |
| Left Click | Destroy block |
| Right Click | Place block |
| 1-9 | Select inventory slot |
| Scroll Wheel | Cycle inventory |
| C | Pick block (copy selected block type) |
| F3 | Toggle debug display |
| H | Toggle help text |

## Technical Details

### Architecture
- **Three.js**: 3D rendering engine
- **Simplex Noise**: Procedural terrain generation
- **Chunk-based System**: Efficient world management
- **WebGL**: Hardware-accelerated rendering

### Performance
- **Render Distance**: Default 8 chunks (configurable)
- **Particle Limit**: 2000 particles max
- **Shadow Resolution**: 2048×2048
- **Target FPS**: 60+ on modern hardware

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Getting Started

### Running the Game
1. Start a local server: `npm start` or `python -m http.server 8000`
2. Open `http://localhost:8000` in your browser
3. Click to lock pointer, then play!

### Configuration
Edit `config.json` to customize:
- Render distance
- Player speed and controls
- Raycast distance
- Particle limits
- Audio settings

## Recent Improvements (Latest Update)

### Performance & Optimization
- Improved raycast step size (0.1 units)
- Scene fog for distance optimization
- Better chunk visibility tracking
- Optimized particle color calculations
- Improved material shading (flatShading enabled)

### Terrain & World
- Enhanced terrain height variation with more Perlin octaves
- Better ore distribution system
- Improved tree generation with better foliage
- Better terrain type detection

### Lighting & Visuals
- Dynamic ambient light cycling
- Improved day/night color transitions
- Synchronized fog and background colors
- Better water material with higher opacity
- Enhanced block outline visibility

### Physics & Controls
- Fixed crouch mechanic
- Better collision detection
- Improved ground detection
- Smart spawn point detection
- Better player respawn system

### UI & Interaction
- Improved inventory responsiveness
- Touch support for mobile devices
- Better visual feedback
- Enhanced debug display
- Better pointer lock handling

## Future Enhancements
- [ ] Multiple biomes with unique characteristics
- [ ] Inventory management system
- [ ] Crafting system
- [ ] Mobs/NPCs
- [ ] Multiplayer support
- [ ] Improved water physics
- [ ] Cave system generation
- [ ] Better tree variety
- [ ] Weather system
- [ ] Day/night mob spawning

## License
MIT

## Credits
Built with Three.js and Simplex Noise
