# Minecraft Clone - Haiku 4.5

A fully-featured 3D Minecraft-inspired voxel game built with Three.js and JavaScript. Experience procedural terrain generation, block destruction and placement, and an immersive 3D environment.

## Features

### Core Gameplay
- **WASD Movement** - Move through the world naturally
- **Mouse Look** - Free camera control with mouse
- **Space Jump/Swim** - Jump and gravity physics, or swim upward in water
- **Shift Sprint/Crouch** - Sprint for speed or crouch for stealth
- **Block Destruction** - Left-click to destroy blocks
- **Block Placement** - Right-click to place blocks
- **Block Selection** - Use 1-9 or scroll wheel to switch between blocks
- **Pick Block** - Press C to pick the block you're looking at
- **Escape Key** - Unlock pointer lock for quick exit

### World & Terrain
- **Procedural Generation** - Infinite world generation using multi-octave Perlin noise
- **Multiple Biomes** - Grass, sand, gravel, and varied terrain types with moisture-based variation
- **Chunk System** - Dynamic chunk loading and unloading for performance
- **Cave Systems** - Procedurally generated underground caves at depths 10-80
- **Multiple Block Types**:
  - Stone, Grass, Dirt, Cobblestone
  - Oak/Spruce/Birch Logs and Leaves
  - Sand, Water, Gravel, Bedrock, Lava
  - Coal Ore, Iron Ore, Gold Ore, Diamond Ore
- **Ore Generation** - Procedural ore generation at various depths with improved distribution
- **Tree Generation** - Multiple tree types (Oak, Spruce, Birch) with natural placement
- **World Save/Load** - localStorage-based chunk persistence (experimental)

### Physics & Collision
- **Gravity System** - Realistic falling and landing
- **Collision Detection** - Precise player-block collision detection
- **Raycasting** - Accurate block selection and targeting (optimized)
- **Block Highlight** - Visual feedback for the block you're looking at

### Survival & Health
- **Health System** - 20-heart health with damage and regeneration
- **Hunger System** - Hunger bar that depletes over time
- **Fall Damage** - Realistic damage calculation based on fall height
- **Health Regeneration** - Heals automatically when well-fed
- **Death & Respawn** - Automatic respawn at spawn point when health depletes
- **Visual HUD** - Real-time health and hunger bars with smooth animations

### Visual Features
- **3D Voxel Rendering** - Full 3D block-based world with face shading
- **Dynamic Lighting** - Sun and ambient lighting system with proper shadows
- **Day/Night Cycle** - Real-time sky color transitions
- **Cloud System** - 20 dynamic clouds that move and fade with time
- **Per-Face Shading** - Top/bottom/side brightness variations for depth
- **Particle Effects** - Block destruction particles with color feedback
- **Water Rendering** - Semi-transparent water with proper face culling and wave effects

### Audio
- **Procedural Sound Effects**:
  - Block break sounds with frequency variation
  - Block place sounds with pitch modulation
  - Jump sounds with rising tone
  - Step sounds for ground and water movement
  - Fall damage sounds with descending pitch
  - Drown sounds for underwater damage
- **Web Audio API** - Dynamic audio generation
- **Contextual Audio** - Different sounds for different surfaces and actions

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
| **Space** | Jump / Swim Upward |
| **Shift** | Sprint / Crouch |
| **Mouse** | Look Around (Click to enable) |
| **Escape** | Unlock Pointer Lock |
| **Left-Click** | Destroy Block |
| **Right-Click** | Place Block |
| **1-9** | Select Block Slot |
| **Scroll Wheel** | Change Selected Block |
| **C** | Pick Block (Pick the block you're looking at) |
| **H** | Toggle Help |
| **F3** | Toggle Debug Info |

## Version

**Current Version:** 1.1.0  
**Last Updated:** October 4, 2026  
**Status:** Actively developed

### Recent Updates (v1.1.0)
- Swimming mechanics and water physics
- Health and hunger system with visual HUD
- Cave generation and improved biomes
- Multiple tree types (Oak, Spruce, Birch)
- Dynamic sky with clouds
- Per-face block shading for better depth
- Enhanced audio with step sounds and fall damage feedback
- World save/load system (experimental)
- Performance optimizations and better rendering

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

1. **Explore** - Walk around and explore the procedurally generated world with diverse biomes
2. **Gather Blocks** - Left-click to destroy blocks and collect them
3. **Build** - Select a block from your inventory (1-9 keys) and right-click to place it
4. **Navigate** - Use WASD to move, mouse to look around, Space to jump or swim
5. **Survive** - Manage your health and hunger, avoid falling damage, and stay safe
6. **Discover** - Find caves, different ore types, and various tree species
7. **Day/Night** - Experience dynamic day/night cycles with changing lighting and sky colors

## Technical Details

### Architecture

```
Core Game:
  game.js          - Main game loop and rendering engine
  world.js         - Terrain generation, caves, and chunk management
  player.js        - Player physics, controls, and swimming
  blocks.js        - Block definitions and properties

Systems:
  ui.js            - User interface and HUD management
  particles.js     - Particle effects for block destruction
  water.js         - Water rendering and interaction
  audio.js         - Procedural sound effects generation
  health.js        - Health, hunger, and survival system
  sky.js           - Dynamic sky and cloud rendering
  debug.js         - Performance monitoring and debug display
  
Utilities:
  config.js        - Configuration management
  config.json      - Game settings
  storage.js       - World save/load system (localStorage)
  blockoutline.js  - Block selection highlight
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