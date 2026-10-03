# Minecraft Clone - Haiku 4.5

A complete 3D Minecraft clone built with Three.js, featuring procedural terrain generation, physics simulation, and full block interaction.

## Features

### World & Terrain
- **Procedural Generation**: Perlin noise-based terrain with multiple octaves
  - Large scale mountains and valleys
  - Medium scale rolling hills
  - Fine-grained roughness and micro details
  - Height range from sea level (64) to 140 blocks
- **Chunk System**: Dynamic chunk loading/unloading with 8-chunk render distance
- **Procedural Trees**: Realistic tree generation with trunks and foliage
- **Block Types**: 12 unique block types with different properties
  - Solid blocks: Stone, Grass, Dirt, Cobblestone, Wood, Sand, Gravel
  - Transparent: Leaves
  - Liquid: Water
  - Decorative: Oak Log, Bookshelf

### Player & Controls
- **Movement**: WASD for movement with smooth acceleration
- **Look Around**: Mouse for camera control with smooth rotation
- **Jumping**: Space bar for jumping with realistic physics
- **Sprinting/Crouching**: Shift key for movement modifiers
- **Block Interaction**: 
  - Left click to destroy blocks
  - Right click to place blocks
  - 1-9 keys or scroll wheel for block selection

### Physics & Collision
- **Gravity**: Realistic falling and landing
- **Collision Detection**: Precise player-block collision with multiple faces
- **Raycasting**: Accurate block targeting with face detection
- **Momentum**: Maintains velocity for fluid movement

### Rendering & Visuals
- **WebGL Rendering**: Three.js with hardware acceleration
- **Dynamic Lighting**: 
  - Day/night cycle with smooth transitions
  - Real-time sun shadow casting
  - Ambient and directional lighting
- **Fog**: Atmospheric depth cueing
- **Materials**: Vertex-colored meshes for fast rendering
- **Optimization**: Face culling and efficient geometry batching

### User Interface
- **Crosshair**: Center screen aiming reticle
- **HUD Display**: Real-time statistics
  - Player position (X/Y/Z)
  - FPS counter
  - Loaded chunk count
  - In-game time (24-hour format)
- **Block Selector**: Visual hotbar with keyboard shortcuts
- **Control Display**: On-screen control reminders

### Audio
- **Web Audio API**: Sound effect generation
- **Sound Effects**: Block break, block place, jump, footsteps
- **Volume Control**: Master volume adjustment

### Visual Effects
- **Particles**: Block destruction particles with physics
- **Water**: Transparent water blocks with wave effects
- **Transparency**: Proper alpha blending for transparent blocks

## How to Run

### Prerequisites
- Python 3+ (for local server)
- Modern web browser with WebGL support

### Running Locally
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js
npx http-server
```

Then visit: `http://localhost:8000`

### Browser Compatibility
- Chrome/Chromium 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Controls

| Key | Action |
|-----|--------|
| W | Move Forward |
| A | Move Left |
| S | Move Backward |
| D | Move Right |
| Space | Jump |
| Shift | Sprint / Crouch |
| Mouse | Look Around |
| Left Click | Destroy Block |
| Right Click | Place Block |
| 1-9 | Select Block Type |
| Scroll Wheel | Change Block Type |

## Architecture

The project is organized into modular JavaScript files:

- **blocks.js**: Block type definitions and properties
- **util.js**: Utility functions (hashing, vectors, constants)
- **world.js**: Chunk management and terrain generation
- **player.js**: Player controller and physics
- **renderer.js**: Graphics rendering and lighting
- **particles.js**: Particle system for effects
- **water.js**: Water block rendering
- **audio.js**: Sound effect system
- **movement.js**: Movement controller with stamina
- **game.js**: Main game loop and initialization

## Performance

- **Optimizations**:
  - Uint8Array for compact chunk storage
  - BufferGeometry with indexed rendering
  - Automatic far chunk unloading
  - Frustum culling through scene management
  - Shadow map optimization (2048x2048)

- **Target Performance**: 60 FPS on mid-range hardware
- **Memory Usage**: ~50-100 MB for typical gameplay session

## Technical Details

### Terrain Generation
Uses Simplex noise with multiple octaves:
- **Octave 1** (0.004): 40 scale - large mountains
- **Octave 2** (0.015): 18 scale - rolling hills
- **Octave 3** (0.08): 3 scale - roughness
- **Octave 4** (0.3): 1 scale - detail

### Chunk Structure
- **Size**: 16x256x16 blocks
- **Storage**: Uint8Array (one byte per block)
- **Render Distance**: 8 chunks in each direction
- **Total Blocks Loaded**: ~512,000 blocks

### Physics
- **Gravity**: 0.02 units/frame²
- **Jump Force**: 0.5 units/frame
- **Walk Speed**: 0.15 units/frame
- **Sprint Speed**: 0.25 units/frame
- **Player Height**: 1.8 blocks
- **Eye Height**: 1.6 blocks

## Future Enhancements

- [ ] Improved water physics and flowing water
- [ ] Lava blocks and fire
- [ ] Ores and mining depth
- [ ] Inventory system with crafting
- [ ] Mobs and NPC AI
- [ ] Multiplayer support
- [ ] Texture mapping with UV coordinates
- [ ] Advanced shaders and post-processing
- [ ] Biome variation system
- [ ] Caves and underground generation

## Credits

Built with:
- [Three.js](https://threejs.org/) - 3D Graphics Library
- [Simplex Noise](https://github.com/jwagner/simplex-noise.js) - Procedural Generation

## License

MIT License - Free to use and modify

## Issues & Feedback

For bugs or feature requests, please open an issue on the GitHub repository.