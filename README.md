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
- **Auto Step Climbing** - Automatically climb 0.5-block heights
- **Water Physics** - Reduced falling speed and movement drag in water
- **Creative Mode** - Toggle with G for unlimited blocks and flight

### World & Terrain
- **Procedural Generation** - Infinite world generation using Perlin noise
- **Multiple Biomes** - Grass, sand, and varied terrain types
- **Chunk System** - Dynamic chunk loading and unloading for performance
- **Multiple Block Types** (20 types):
  - Terrain: Stone, Grass, Dirt, Cobblestone, Sand, Gravel, Bedrock, Clay, Mossy Stone
  - Vegetation: Oak Log, Oak Leaves, Spruce Log, Dark Oak Log, Birch Log
  - Liquids: Water, Lava
  - Ores: Coal Ore, Iron Ore, Gold Ore, Diamond Ore
- **Ore Generation** - Procedural ore generation at various depths
- **Tree Generation** - Natural tree placement in suitable terrain

### Physics & Collision
- **Gravity System** - Realistic falling and landing
- **Collision Detection** - Precise player-block collision detection
- **Raycasting** - Accurate block selection and targeting
- **Block Highlight** - Visual feedback for the block you're looking at

### Visual Features
- **3D Voxel Rendering** - Full 3D block-based world
- **Dynamic Lighting** - Sun and ambient lighting system with circular orbit
- **Day/Night Cycle** - Real-time sky color transitions with dynamic ambient lighting
- **Particle Effects** - Block destruction particles with color matching
- **Water Rendering** - Semi-transparent water with proper face culling
- **Lava Rendering** - Lava blocks with emissive glow effect
- **Block Outline** - Glowing white outline around targeted blocks with coordinates

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
| **W/A/S/D** | Move (Forward/Left/Backward/Right) |
| **Space** | Jump / Ascend (in Creative mode) |
| **Shift** | Sprint / Crouch / Descend (in Creative mode) |
| **Mouse** | Look Around (Click to enable) |
| **Left-Click** | Destroy Block |
| **Right-Click** | Place Block |
| **1-9** | Select Block Slot |
| **Scroll Wheel** | Change Selected Block |
| **C** | Pick Block |
| **E** | Toggle Inventory |
| **G** | Toggle Game Mode (Creative/Survival) |
| **H** | Toggle Help |
| **F3** | Toggle Debug Info |
| **F5** | Save Player Position |
| **F9** | Load Player Position |

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
lava.js          - Lava rendering system
audio.js         - Sound effects generation
gamemode.js      - Creative/Survival mode system
saves.js         - Save/load game state
blockoutline.js  - Block selection outline
debug.js         - Debug information display
config.js        - Configuration management
```

### Technologies Used

- **Three.js** - 3D WebGL rendering
- **SimplexNoise** - Procedural terrain generation
- **Web Audio API** - Dynamic sound generation
- **Vanilla JavaScript** - Core game logic
- **HTML5/CSS3** - UI and styling

### Performance

- Renders 8-chunk radius around player
- Optimized mesh generation with indexed geometry
- Dynamic lighting updates for day/night cycle
- Particle system for visual effects
- ~60 FPS on modern hardware

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

### Completed Features

- [x] Creative mode with unlimited blocks and flight
- [x] Survival mode with physics
- [x] Save/load player position
- [x] Step climbing for better navigation
- [x] Water physics with drag and reduced falling
- [x] Lava rendering with glow effect
- [x] Multiple tree types (Oak, Spruce, Birch)
- [x] Cave and lava generation
- [x] Multiple biome types
- [x] Block coordinate display in HUD

### Future Enhancements

- [ ] Inventory UI with multiple stacks
- [ ] Health/hunger system in Survival mode
- [ ] Multiplayer support
- [ ] Texture mapping for blocks
- [ ] Advanced weather systems
- [ ] Mob system with simple AI
- [ ] Crafting system
- [ ] Tools and equipment system
- [ ] Enchantments
- [ ] End/Nether dimensions

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