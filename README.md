# Minecraft Clone - Haiku 4.5

A fully-featured 3D Minecraft-inspired voxel game built with Three.js and JavaScript. Experience procedural terrain generation, block destruction and placement, and an immersive 3D environment.

## Features

### Core Gameplay
- **WASD Movement** - Move through the world naturally
- **Mouse Look** - Free camera control with mouse
- **Space Jump** - Jump and gravity physics
- **Shift Sprint/Crouch** - Sprint for speed or crouch for stealth
- **Block Destruction** - Left-click to destroy blocks
- **Block Placement** - Right-click to place blocks
- **Block Selection** - Use 1-9 or scroll wheel to switch between blocks
- **Pick Block** - Press C to pick the block you're looking at

### World & Terrain
- **Procedural Generation** - Infinite world generation using Perlin noise
- **Multiple Biomes** - Grass, sand, and varied terrain types
- **Chunk System** - Dynamic chunk loading and unloading for performance
- **Multiple Block Types**:
  - Stone, Grass, Dirt, Cobblestone
  - Oak Log, Oak Leaves
  - Sand, Water, Gravel, Bedrock
  - Coal Ore, Iron Ore, Gold Ore, Diamond Ore
- **Ore Generation** - Procedural ore generation at various depths
- **Tree Generation** - Natural tree placement in suitable terrain

### Physics & Collision
- **Gravity System** - Realistic falling and landing
- **Collision Detection** - Precise player-block collision detection
- **Raycasting** - Accurate block selection and targeting
- **Block Highlight** - Visual feedback for the block you're looking at

### Visual Features
- **3D Voxel Rendering** - Full 3D block-based world
- **Dynamic Lighting** - Sun and ambient lighting system
- **Day/Night Cycle** - Real-time sky color transitions
- **Particle Effects** - Block destruction particles
- **Water Rendering** - Semi-transparent water with proper face culling

### Audio
- **Procedural Sound Effects**:
  - Block break sounds
  - Block place sounds
  - Jump sounds (prepared)
  - Step sounds (prepared)
- **Web Audio API** - Dynamic audio generation

### User Interface
- **HUD Display** - Real-time coordinates, FPS, and block info
- **Block Inventory** - Visual block selector with 9 slots
- **Crosshair** - Center screen targeting reticle
- **Help Panel** - In-game control instructions (Press H)

### Performance Optimization
- **Chunk-based Rendering** - Only visible chunks are rendered
- **Indexed Geometry** - Efficient mesh generation with indices
- **Vertex Colors** - Per-vertex coloring for variations
- **Memory Management** - Automatic chunk cleanup for distant areas

## Controls

| Key | Action |
|-----|--------|
| **W** | Move Forward |
| **A** | Move Left |
| **S** | Move Backward |
| **D** | Move Right |
| **Space** | Jump |
| **Shift** | Sprint / Crouch |
| **Mouse** | Look Around (Click to enable) |
| **Left-Click** | Destroy Block |
| **Right-Click** | Place Block |
| **1-9** | Select Block Slot |
| **Scroll Wheel** | Change Selected Block |
| **C** | Pick Block (Pick the block you're looking at) |
| **H** | Toggle Help |
| **F3** | Toggle Debug Info |
| **Ctrl+S** | Save World |
| **Ctrl+L** | Load World |
| **Ctrl+G** | Toggle Creative Mode |

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local server)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/prak59459-create/minecraft-haiku4.5.git
cd minecraft-haiku4.5
```

2. Start a local server:
```bash
python -m http.server 8000
```

3. Open in your browser:
```
http://localhost:8000
```

## How to Play

### Survival Mode (Default)
1. **Explore** - Walk around and explore the procedurally generated world
2. **Gather Blocks** - Left-click to destroy blocks and collect them
3. **Build** - Select a block from your inventory (1-9 keys) and right-click to place it
4. **Navigate** - Use WASD to move and mouse to look around
5. **Survive** - Manage gravity and avoid falling into water or off cliffs

### Creative Mode
Press **Ctrl+G** to toggle Creative Mode:
- Fly freely with **Space** to ascend and **Shift** to descend
- No gravity or collision damage
- Unlimited block placement
- Perfect for creative building and exploration

### Save & Load
- **Ctrl+S** - Save your current world to browser storage
- **Ctrl+L** - Load your previously saved world
- Worlds are stored locally in your browser's localStorage

## Technical Details

### Architecture

```
Core Game:
├── game.js              - Main game loop and rendering
├── world.js             - Terrain generation and chunk management
├── player.js            - Player physics and controls
└── config.js            - Configuration management

Systems:
├── blocks.js            - Block definitions and properties
├── ui.js                - User interface management
├── particles.js         - Particle effects system (optimized with pooling)
├── water.js             - Water rendering system
├── audio.js             - Sound effects generation
├── debug.js             - Debug display and statistics
└── blockoutline.js      - Block selection outline

Features:
├── creativemode.js      - Creative mode system
└── worldsave.js         - World persistence system

Configuration:
└── config.json          - Game settings and parameters
```

### Technologies Used

- **Three.js** - 3D WebGL rendering
- **SimplexNoise** - Procedural terrain generation
- **Web Audio API** - Dynamic sound generation
- **Vanilla JavaScript** - Core game logic
- **HTML5/CSS3** - UI and styling

### Performance Optimizations (Session 3)

- **Particle System**
  - Memory pooling to avoid garbage collection
  - Pre-allocated fixed particle pool
  - Configurable particle limit (default 2000)
  - Optimized geometry updates with draw range

- **Rendering**
  - Configurable render distance (default 8 chunks)
  - Distance-based chunk visibility culling
  - Optimized frustum culling
  - Indexed BufferGeometry for reduced draw calls

- **Raycasting**
  - Early termination optimization
  - Caching of block position checks
  - Configurable step size (default 0.05)

- **Configuration**
  - All parameters configurable via config.json
  - No hardcoded values in code
  - Per-player collision detection settings
  - Graphics quality options

- **Results**
  - ~60 FPS on modern hardware
  - Renders 8-chunk radius around player
  - Reduced memory usage with pooling
  - Smooth gameplay on mid-range systems

## Game Design

### Terrain Generation

The world uses multi-octave Perlin noise for natural-looking terrain:
- Large scale features for mountains and valleys
- Medium scale for terrain variation
- Small scale for detail and randomness

### Biomes

- **Grass Biome** - Natural terrain with trees and water
- **Sand Biome** - Desert-like areas with sand blocks

### Ore Distribution

- **Coal Ore** - Common, up to height 160
- **Iron Ore** - Medium frequency, up to height 120
- **Gold Ore** - Rare, up to height 80
- **Diamond Ore** - Very rare, up to height 40

## Development

### Code Structure

- **Modular Design** - Each system in its own file
- **Clean Separation** - Game logic, rendering, and physics separate
- **Extensible** - Easy to add new block types or biomes

### Recent Enhancements (Session 3)

- [x] **World Save/Load System** - Persistent world storage with Ctrl+S/Ctrl+L
- [x] **Creative Mode** - Unlimited blocks and free flight with Ctrl+G
- [x] **Performance Optimizations**:
  - Particle system memory pooling
  - Config-based render distance
  - Optimized raycasting with early termination
  - Better chunk visibility culling
- [x] **Configuration System** - Full config.json support for all parameters
- [x] **UI Improvements** - Message system for user feedback

### Future Enhancements

- [ ] Inventory UI with multiple stacks
- [ ] Survival mode with health/hunger
- [ ] Multiplayer support
- [ ] Texture mapping for blocks
- [ ] Advanced weather systems
- [ ] More biome types
- [ ] Mob system with AI
- [ ] Crafting system
- [ ] Level-of-Detail (LOD) system for distant chunks
- [ ] Advanced lighting and shadows

## Performance Tips

1. **Adjust Render Distance** - Edit `world.renderDistance` in config.json (default: 8)
   - Lower values = better FPS but less view distance
   - Recommended: 4-6 for low-end systems, 10-12 for high-end

2. **Reduce Particle Limit** - Edit `graphics.particleLimit` in config.json (default: 2000)
   - Lower values reduce particle system overhead

3. **Collision Detection** - Edit `player.collisionCheckPoints` in config.json (default: 4)
   - Lower values improve performance but reduce accuracy

4. **Shadow Map Size** - Edit `graphics.shadowMapSize` in config.json (default: 2048)
   - Lower values improve FPS (try 1024 for low-end systems)

5. **Use Fullscreen** - Better GPU acceleration in fullscreen mode
6. **Close Background Apps** - Reduce system load for better game performance

## Troubleshooting

### Low FPS
- Reduce render distance in game.js
- Close other browser tabs
- Update graphics drivers
- Use a modern browser (Chrome or Firefox recommended)

### Blocks Not Rendering
- Reload the page
- Check browser console for errors
- Ensure JavaScript is enabled
- Try a different browser

### No Sound
- Check browser audio permissions
- Enable audio in browser settings
- Try different browser
- Check volume settings

## Credits

Built with:
- Three.js (https://threejs.org/)
- SimplexNoise (https://github.com/jwagner/simplex-noise.js)

Inspired by Minecraft (© Mojang Studios)

## License

MIT License - Feel free to use, modify, and distribute

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Author

Claude Haiku 4.5 - AI Assistant by Anthropic