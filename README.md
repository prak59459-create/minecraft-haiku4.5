# Minecraft Haiku 4.5 - 3D Web-Based Minecraft Clone

A complete 3D Minecraft-inspired voxel game built with Three.js and vanilla JavaScript. Features procedural terrain generation, block placement/destruction, day/night cycles, and physics-based movement.

## Features

### Core Gameplay
- **3D Rendering**: Real-time 3D graphics using Three.js
- **Block System**: 10 block types (grass, dirt, stone, wood, leaves, water, sand, gravel, cobblestone, bedrock)
- **Terrain Generation**: Procedural Perlin noise-based terrain with natural variation
- **World System**: Infinite chunk-based world with dynamic loading/unloading
- **Block Interaction**: Left-click to destroy, right-click to place blocks

### Player Mechanics
- **Movement**: WASD keys with smooth camera control
- **Physics**: Gravity, collision detection, jump mechanics
- **Sprint**: Shift key for faster movement
- **Crouch**: Ctrl key
- **Camera**: First-person mouse-look with pointer lock

### Environmental Features
- **Biome System**: 5 biomes (Plains, Mountains, Desert, Forest, Ocean)
- **Day/Night Cycle**: Dynamic lighting that changes throughout game time
- **Water Mechanics**: Water blocks with proper rendering
- **Procedural Trees**: Automatic tree generation in forest biomes
- **Fog Effect**: Distance fog for better visual depth

### Audio & Visuals
- **Sound Effects**: Procedurally generated sounds for block breaking/placing
- **Particles**: Visual feedback with particle effects on block destruction
- **Shadows**: Dynamic shadow mapping with PCF filtering
- **Textures**: Procedurally generated block textures

### UI & Controls
- **Hotbar**: 9-slot block selection with number keys 1-9
- **Performance Monitoring**: Real-time FPS counter and position tracking
- **Control Guide**: On-screen controls display
- **Info Panel**: Current block info and game statistics

### Optimization
- **Chunk Rendering**: Efficient mesh generation with face culling
- **Texture Caching**: Shared texture atlas across chunks
- **Raycasting**: Optimized block lookup for fast block targeting
- **Memory Management**: Automatic height/humidity/temperature caching
- **GPU Optimization**: High-performance rendering preferences

## Controls

| Key | Action |
|-----|--------|
| WASD | Move forward/backward/strafe |
| Mouse | Look around (click to enable) |
| Space | Jump |
| Shift | Sprint |
| Ctrl | Crouch |
| Left Click | Destroy block |
| Right Click | Place block |
| 1-9 | Select block in hotbar |
| Scroll Wheel | Cycle block selection |

## Technical Architecture

### File Structure
```
src/
├── index.js              # Entry point
├── game.js              # Main game loop and state
├── player.js            # Player controller and state
├── input.js             # Input handling and hotbar
├── physics.js           # Physics engine with gravity/collisions
├── config.js            # Game configuration
├── particles.js         # Particle system
├── sound.js             # Audio system
├── inventory.js         # Item management
├── profiler.js          # Performance profiling
├── utils/
│   ├── math.js          # Math utilities
│   ├── logger.js        # Logging system
│   └── meshoptimizer.js # Mesh optimization
└── world/
    ├── world.js         # World management and chunk system
    ├── chunk.js         # Individual chunk data and rendering
    ├── blocks.js        # Block database
    ├── terrain.js       # Perlin noise terrain generation
    └── biome.js         # Biome system
```

### Key Systems

#### Chunk System
- 16x16x256 block chunks
- Dynamic loading within render distance (3 chunks)
- Mesh generation with vertex/UV attributes
- Texture caching for performance

#### Physics
- Accurate gravity simulation
- Multi-point collision detection
- Block collision with player hitbox
- Jump and gravity state management

#### Terrain Generation
- 3-octave Perlin noise implementation
- Height/humidity/temperature calculation
- Biome-based block selection
- Procedural tree generation

## Getting Started

### Requirements
- Modern web browser with WebGL support
- Node.js (for development server)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd minecraft-haiku4.5

# Install dependencies
npm install

# Start development server
npm start

# Open in browser
# http://localhost:8080
```

## Performance Tips

1. **Render Distance**: Adjust in `src/config.js` (lower = faster)
2. **Chunk Size**: Can be modified in config for different detail levels
3. **Shadow Quality**: Adjust `shadowMapSize` in config
4. **Fog**: Adjust fog distances in `game.js` for better performance

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with WebGL enabled)
- Mobile browsers: Limited support (touch controls not implemented)

## Future Improvements

- [ ] Multiplayer support
- [ ] Touch controls for mobile
- [ ] Crafting system
- [ ] Different biome decorations
- [ ] Weather system
- [ ] Smooth terrain generation
- [ ] Better UI/UX
- [ ] Save/load functionality
- [ ] NPCs and entities
- [ ] More block types

## License

MIT License - Feel free to use this project as a learning resource or basis for your own games.

## Credits

Built with:
- [Three.js](https://threejs.org/) - 3D graphics
- Vanilla JavaScript for game logic
- Web Audio API for sound synthesis

Inspired by Minecraft and voxel-based games.