# Minecraft Clone - Haiku 4.5

A fully-featured 3D Minecraft clone built with Three.js and modern web technologies. Experience block-building gameplay with procedurally generated terrain, physics, and dynamic lighting.

## Features

### Core Gameplay
- **Block Building & Destruction**: Place and destroy blocks with left/right mouse clicks
- **Procedural Terrain Generation**: Infinite terrain using Perlin noise with multiple biomes
- **Chunk System**: Efficient chunk loading/unloading for seamless world exploration
- **Physics & Collisions**: Realistic gravity, jumping, and collision detection
- **Day/Night Cycle**: Dynamic lighting that changes throughout the game day

### World & Terrain
- **Multiple Biomes**: Grass, Sand, and Snow terrains with unique block types
- **Trees**: Oak and Spruce trees with natural generation
- **Ores**: Coal, Iron, Gold, and Diamond ores with depth-based distribution
- **Water**: Flowing water with animated wave effects
- **Block Variety**: 20+ different block types including decorative and building blocks

### Player & Controls

#### Movement
- **WASD**: Move forward, backward, left, right
- **Mouse**: Look around (click to lock pointer)
- **Space**: Jump
- **Shift**: Sprint or crouch (toggle with Control key)

#### Building & Interaction
- **Left-Click**: Destroy blocks
- **Right-Click**: Place blocks
- **1-9 or Scroll Wheel**: Select blocks from inventory
- **C**: Pick block (copy block you're looking at)

#### UI & Debug
- **H**: Toggle help menu
- **F3**: Toggle debug display (coordinates, FPS, etc.)
- **ESC**: Unlock cursor (in most browsers)

### Visual Features
- **Dynamic Lighting**: Realistic lighting with height-based brightness
- **Fog Effect**: Atmospheric fog for better depth perception
- **Particle Effects**: Block break particles with physics
- **Block Outline**: Visual highlight of targeted block
- **Smooth Shading**: Optimized geometry rendering
- **HUD Display**: Real-time coordinates, FPS, and selected block info

### Available Blocks
1. Stone
2. Grass
3. Dirt
4. Cobblestone
5. Oak Log
6. Oak Leaves
7. Sand
8. Water
9. Gravel
10. Bedrock
11. Coal Ore
12. Iron Ore
13. Gold Ore
14. Diamond Ore
15. Bricks
16. Glass
17. Clay
18. Snow
19. Spruce Log
20. Spruce Leaves

## Performance Optimizations

- **GPU-Accelerated Rendering**: High-performance Three.js rendering
- **Chunk Mesh Caching**: Dirty flag system prevents unnecessary mesh regeneration
- **Memory Management**: Proper geometry and material disposal
- **Fog Culling**: Atmospheric fog improves far-distance performance
- **Optimized Materials**: Flat shading and efficient vertex colors
- **Frustum Culling**: Only renders visible chunks

## Technical Details

### Technologies
- **Three.js**: 3D WebGL rendering
- **Simplex Noise**: Procedural terrain generation
- **JavaScript ES Modules**: Modern modular code structure

### Architecture
- **Game Engine**: Main game loop and rendering system (game.js)
- **World Management**: Chunk system and block management (world.js)
- **Player Physics**: Movement, collision, and camera control (player.js)
- **Visual Systems**: Particles, water, UI, and debug display
- **Audio System**: Sound effects for blocks and actions

### Project Structure
```
minecraft-haiku4.5/
├── index.html          # Main HTML file
├── style.css           # UI styling
├── game.js             # Main game engine
├── world.js            # World and chunk management
├── player.js           # Player movement and physics
├── blocks.js           # Block definitions and properties
├── particles.js        # Particle system
├── water.js            # Water rendering
├── audio.js            # Audio management
├── ui.js               # User interface
├── debug.js            # Debug display
├── blockoutline.js     # Block selection outline
├── config.js           # Configuration system
└── package.json        # Project metadata
```

## Getting Started

### Prerequisites
- Modern web browser with WebGL support
- Python 3 (for running local server)

### Installation & Running

1. Clone or download the repository
2. Navigate to the project directory
3. Start a local web server:
   ```bash
   python -m http.server 8000
   ```
4. Open your browser and navigate to `http://localhost:8000`

### Configuration

Edit `config.json` or `config.js` to customize:
- Render distance (default: 8 chunks)
- Player movement speed
- Graphics quality
- Audio settings
- World terrain parameters

## Tips & Tricks

- **Efficient Building**: Use number keys for quick block selection
- **Exploring**: Use Shift to sprint and cover terrain faster
- **Building High**: Hold space while moving forward to climb blocks
- **Block Picking**: Press C while looking at a block to select it
- **Performance**: Reduce render distance if experiencing lag

## Browser Compatibility

Works best in:
- Chrome/Chromium 90+
- Firefox 88+
- Edge 90+
- Safari 14+

Requires WebGL 2.0 support for optimal performance.

## Known Limitations

- Single-player only (no multiplayer)
- No inventory management UI (uses fixed slots)
- Limited block types compared to Minecraft
- No redstone, mobs, or crafting systems
- No save/load functionality

## Future Improvements

- [ ] Inventory management system
- [ ] Crafting recipes
- [ ] More decorative blocks
- [ ] Cave generation
- [ ] Mob spawning and AI
- [ ] Block damage/durability
- [ ] Falling sand/water physics
- [ ] Enhanced texturing system
- [ ] Performance profiling tools

## Performance Benchmarks

- **Target FPS**: 60 FPS on modern hardware
- **Render Distance**: 8-16 chunks (adjustable)
- **Chunk Size**: 16x256x16 blocks
- **Memory Usage**: Varies with render distance (100-500 MB typical)

## Credits

Built with Claude Haiku 4.5 using Three.js and Simplex Noise libraries.

## License

MIT License - Feel free to use, modify, and distribute this project.

## Support

For issues, questions, or suggestions, please check the project repository or documentation.

---

**Last Updated**: October 2026
**Version**: 1.0.0
