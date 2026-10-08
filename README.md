# Minecraft Clone - Haiku 4.5

A high-performance 3D Minecraft-inspired game built with Three.js and WebGL.

## Features

### Core Gameplay
- **WASD Movement**: Smooth first-person camera controls
- **Mouse Look**: Free-form camera rotation
- **Block Placement & Destruction**: Left-click to destroy, right-click to place
- **Block Selection**: Press 1-9 or scroll wheel to select blocks
- **Jump & Sprint**: Press Space to jump, Shift to sprint/crouch
- **Collision Detection**: Precise player-block collision system with multi-point raycasting

### World & Terrain
- **Procedural Terrain Generation**: Uses Simplex noise for natural terrain variation
- **Chunk-Based World**: 16x256x16 chunks loaded dynamically around the player
- **Multiple Block Types**:
  - Stone, Grass, Dirt, Sand, Gravel, Bedrock
  - Wood (Oak Log, Oak Leaves)
  - Ores (Coal, Iron, Gold, Diamond)
  - Water

- **Dynamic Tree Generation**: Procedurally generated trees with varied heights
- **Ore Distribution**: Height-based ore generation with Perlin noise variation
- **Biome Variation**: Terrain type variation based on noise functions

### Rendering & Graphics
- **Optimized Mesh Generation**: Efficient vertex/face culling with ambient occlusion
- **Dynamic Lighting**: 
  - Real-time day/night cycle
  - Directional sun with intensity changes
  - Height-based lighting for visual depth
  
- **Block Highlighting**: Visual outline of targeted blocks with blue highlight
- **Particle Effects**: 
  - Block destruction particles with physics
  - Particle pooling and garbage collection
  - Color-matched block particles

- **Water Rendering**: Transparent water blocks with special rendering
- **Sky Gradient**: Dynamic sky color changes throughout day/night cycle
- **Smooth Shading**: Phong material for realistic block surfaces

### Performance
- **Web Workers**: Asynchronous chunk generation using dedicated workers
- **Render Distance**: Configurable chunk loading (default 8 chunks)
- **Frustum Culling**: Automatic culling of off-screen chunks
- **Geometry Optimization**: Indexed geometry with shared vertices
- **Memory Management**: Proper cleanup of disposed meshes

### User Interface
- **HUD Display**: Real-time coordinates, FPS, and selected block info
- **Crosshair**: Centered target indicator with pulsing animation
- **Inventory Bar**: Quick-access block selector at bottom of screen
- **Help Menu**: Toggle with 'H' key for control reference
- **Debug Display**: Toggle with F3 for performance metrics

### Audio
- **Sound Effects**: 
  - Block breaking sounds with cooldown
  - Block placement sounds
  - Jump sounds
  - Audio manager with volume control

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Movement |
| Mouse | Look Around |
| Space | Jump |
| Shift | Sprint (hold) / Crouch |
| 1-9 | Select Block |
| Mouse Wheel | Cycle Block Selection |
| Left Click | Destroy Block |
| Right Click | Place Block |
| C | Pick Block (copy block type) |
| H | Toggle Help Menu |
| F3 | Toggle Debug Display |
| ESC | Exit Pointer Lock |

## Building & Running

### Prerequisites
- Modern web browser with WebGL support
- Node.js (optional, for development server)

### Development Server
```bash
npm install
npm start
```
Then open `http://localhost:8000` in your browser

### Manual Server
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser

## Configuration

Edit `config.json` to customize:
- World render distance
- Player movement speed and physics
- Graphics quality settings
- Audio volume and settings
- Terrain generation parameters

## Architecture

### File Structure
- `game.js` - Main game loop and rendering
- `world.js` - World management, chunk system
- `chunkWorker.js` - Web Worker for async chunk generation
- `player.js` - Player physics and input handling
- `blocks.js` - Block definitions and properties
- `particles.js` - Particle system for effects
- `water.js` - Water rendering and physics
- `audio.js` - Audio manager
- `ui.js` - User interface management
- `blockoutline.js` - Block selection outline
- `debug.js` - Debug display overlay
- `config.js` - Configuration management

### Key Classes

**MinecraftGame**: Main game class managing scene, renderer, and game loop

**World**: Chunk-based world management with dynamic loading

**Chunk**: Individual terrain block storage with generation

**Player**: Player physics, collision detection, and movement

**ParticleSystem**: Manages particle effects for environmental feedback

**Camera**: First-person camera control

## Performance Tips

1. Reduce render distance in config for lower-end devices
2. Disable shadows for better performance
3. Limit particle effects for smoother gameplay
4. Use web workers for chunk generation (enabled by default)

## Future Enhancements

- Proper inventory system with item counts
- Crafting system
- More block types and variants
- Better water physics with flowing water
- Caves and underground structures
- Mobs and NPCs
- Save/load world functionality
- Multiplayer support
- Mobile touch controls

## Technical Highlights

- **Web Workers**: Non-blocking chunk generation
- **Efficient Mesh Generation**: Face culling and vertex optimization
- **Ambient Occlusion**: Simple but effective lighting enhancement
- **Dynamic LOD**: Proper chunk loading/unloading
- **Physics**: Multi-point collision detection system
- **Memory Management**: Proper resource disposal and garbage collection

## Browser Compatibility

- Chrome/Chromium 70+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT

## Development

This is a demonstration of a high-performance 3D game built with WebGL. It showcases:
- Real-time 3D rendering
- Procedural generation
- Physics simulation
- Web Worker integration
- Game loop optimization
