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
- **Block Inventory** - Visual block selector with 9 slots and stacking (up to 64 per slot)
- **Inventory Count Display** - Shows item counts in inventory slots
- **Crosshair** - Center screen targeting reticle
- **Block Outline** - Pulsing animation on selected block for better visibility
- **Help Panel** - In-game control instructions (Press H)
- **Debug Display** - Detailed performance metrics (Press F3)

### Save & Load System
- **Auto-Save** - Automatic world saves every 60 seconds
- **Manual Save** - Ctrl+S to save your world
- **Manual Load** - Ctrl+L to load a previously saved world
- **Persistent Worlds** - Worlds stored in browser localStorage
- **Chunk Preservation** - Saves up to 32 chunks and player position

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
| **Ctrl+S** | Save World |
| **Ctrl+L** | Load World |
| **H** | Toggle Help |
| **F3** | Toggle Debug Info |

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

1. **Explore** - Walk around and explore the procedurally generated world
2. **Gather Blocks** - Left-click to destroy blocks and collect them
3. **Build** - Select a block from your inventory (1-9 keys) and right-click to place it
4. **Navigate** - Use WASD to move and mouse to look around
5. **Survive** - Manage gravity and avoid falling into water or off cliffs

## Technical Details

### Architecture

```
Core Game:
├── game.js           - Main game loop and rendering
├── world.js          - Terrain generation and chunk management
├── player.js         - Player physics and controls
└── blocks.js         - Block definitions and properties

Systems:
├── ui.js             - User interface management
├── particles.js      - Particle effects system
├── water.js          - Water rendering system
├── audio.js          - Sound effects generation
├── debug.js          - Debug display and statistics
├── blockoutline.js   - Block outline visualization
├── savesystem.js     - World save/load functionality
├── config.js         - Configuration management
└── config.json       - Game configuration file
```

### Technologies Used

- **Three.js** - 3D WebGL rendering
- **SimplexNoise** - Procedural terrain generation
- **Web Audio API** - Dynamic sound generation
- **Vanilla JavaScript** - Core game logic
- **HTML5/CSS3** - UI and styling

### Performance

- **Render Distance** - 8-chunk radius around player (configurable)
- **Optimized Rendering**:
  - Indexed geometry for reduced draw calls
  - Vertex colors for efficient coloring
  - Frustum culling for invisible meshes
  - Dynamic lighting updates for day/night cycle
- **Efficient Physics**:
  - 5-point collision detection
  - Optimized raycast with block caching
  - Smooth physics simulation
- **Memory Management**:
  - Automatic chunk unloading for distant areas
  - Proper resource disposal
  - Particle system with limits (2000 max)
- **Target Performance**: ~60 FPS on modern hardware
- **Memory Usage**: 200-400 MB typical with 8-chunk radius

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

### Future Enhancements

- [ ] Inventory UI with multiple stacks
- [ ] Creative mode with unlimited blocks
- [ ] Survival mode with health/hunger
- [ ] Multiplayer support
- [ ] Texture mapping for blocks
- [ ] Advanced weather systems
- [ ] More biome types
- [ ] Mob system
- [ ] Crafting system

## Performance Tips

1. **Reduce Render Distance** - Modify `renderDistance` in game.js for better FPS
2. **Lower Chunk Size** - Reduce `CHUNK_SIZE` for faster loading
3. **Disable Shadows** - Comment out shadow mapping for faster rendering
4. **Use Fullscreen** - Better GPU acceleration in fullscreen mode

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