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
- **Multiple Biomes** - Grass, sand, and varied terrain types with moisture-based variation
- **Cave Generation** - Procedural caves using 3D Perlin noise for exploration
- **Chunk System** - Dynamic chunk loading/unloading with LOD support
- **Multiple Block Types** (25 blocks):
  - Stone, Grass, Dirt, Cobblestone, Bedrock, Brick
  - Oak/Birch/Spruce Log and Leaves (3 tree types)
  - Sand, Water, Lava, Gravel, Clay
  - Stone Variants: Granite, Diorite, Andesite
  - Coal, Iron, Gold, Diamond Ore
  - Obsidian
- **Ore Generation** - Depth-aware ore placement with realistic distribution
- **Tree Generation** - Multiple tree species with natural placement
- **Level of Detail (LOD)** - Different render qualities for distant terrain

### Physics & Collision
- **Gravity System** - Realistic falling and landing physics
- **Collision Detection** - Multi-point player-block collision with early exit optimization
- **Step Climbing** - Automatic climbing over single-block obstacles
- **Ground Detection** - Intelligent surface detection for smooth movement
- **Raycasting** - Accurate block selection with proper face normal calculation
- **Block Highlight** - Visual feedback with white wireframe outline

### Visual Features
- **3D Voxel Rendering** - Full 3D block-based world
- **Dynamic Lighting** - Sun and ambient lighting system
- **Day/Night Cycle** - Real-time sky color transitions
- **Particle Effects** - Block destruction particles
- **Water Rendering** - Semi-transparent water with proper face culling

### Audio
- **Procedural Sound Effects**:
  - Block break sounds with frequency modulation
  - Block place sounds with pitch variation
  - Jump sounds with multi-harmonic support
  - Step sounds with dynamic pitch
- **Web Audio API** - Dynamic audio generation with filtering
- **Frequency-based Audio** - Realistic sound variation per block type
- **Gain Control** - Smart volume management and decay

### User Interface
- **HUD Display** - Real-time coordinates, FPS, and block info
- **Block Inventory** - Visual block selector with 9 slots
- **Crosshair** - Center screen targeting reticle
- **Help Panel** - In-game control instructions (Press H)

### Performance Optimization
- **Chunk-based Rendering** - Only visible chunks are rendered
- **Level of Detail (LOD) System** - Progressive quality reduction with distance
- **Indexed Geometry** - Efficient mesh generation with indices
- **Vertex Colors** - Per-vertex coloring with height-based variation
- **Memory Management** - Automatic chunk cleanup every 30 frames
- **Extended Render Distance** - 12 chunks with intelligent LOD fallback
- **Optimized Collisions** - Multi-point collision detection with early exit

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
game.js          - Main game loop and rendering
world.js         - Terrain generation and chunk management
player.js        - Player physics and controls
blocks.js        - Block definitions and properties
ui.js            - User interface management
particles.js     - Particle effects system
water.js         - Water rendering system
audio.js         - Sound effects generation
```

### Technologies Used

- **Three.js** - 3D WebGL rendering
- **SimplexNoise** - Procedural terrain generation
- **Web Audio API** - Dynamic sound generation
- **Vanilla JavaScript** - Core game logic
- **HTML5/CSS3** - UI and styling

### Performance

- Renders 12-chunk radius with LOD fallback for distant chunks
- Optimized mesh generation with indexed geometry and color caching
- Dynamic lighting with depth-based darkening for caves
- Particle system with configurable limit (2000 max)
- Memory cleanup every 30 frames for long play sessions
- Level of Detail system reduces geometry at distance
- ~60 FPS on modern hardware (can vary with render distance)

## Game Design

### Terrain Generation

The world uses multi-octave Perlin noise for natural-looking terrain:
- Large scale features for mountains and valleys
- Medium scale for terrain variation
- Small scale for detail and randomness

### Biomes

- **Grass Biome** - Natural terrain with trees, water, and diverse blocks
- **Sand Biome** - Desert-like areas with sand, clay, and minimal vegetation
- **Temperature/Moisture** - Dynamic biome transitions based on noise values

### Cave Systems

- **Procedural Caves** - 3D Perlin noise-based underground exploration
- **Height Range** - Caves generate between y=10 and y=120
- **Natural Connection** - Caves connect and form larger systems

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