# 3D Minecraft Clone - Haiku 4.5

A high-performance 3D Minecraft-inspired game built with Three.js and procedural generation, optimized for smooth gameplay and visual quality.

## Features

### Core Gameplay
- **WASD Movement** - Smooth player movement with momentum
- **Mouse Look** - Full 360-degree camera control
- **Jump** - Space bar to jump with physics simulation
- **Sprint/Crouch** - Shift key for faster/slower movement
- **Block Destruction** - Left-click to break blocks
- **Block Placement** - Right-click to place blocks
- **Block Selection** - Number keys 1-9, scroll wheel, or C key to pick blocks

### Terrain & World
- **Procedural Terrain Generation** - Infinite world with Perlin noise
- **Multiple Block Types**:
  - Basic: Stone, Grass, Dirt, Sand, Gravel
  - Decorative: Oak Logs, Oak Leaves, Cobblestone
  - Ores: Coal, Iron, Gold, Diamond, Lapis, Redstone
  - Special: Water, Bedrock
- **Cave Systems** - Procedurally generated caves for exploration
- **Dynamic Chunk Loading** - Only visible chunks are rendered
- **Varied Tree Generation** - Oak and spruce trees with natural distribution

### Physics & Collisions
- **Gravity System** - Realistic falling and jumping
- **Collision Detection** - Precise player-block interactions
- **Fall Damage** - Takes damage from falling more than 3 blocks
- **Block Breaking Particles** - Visual feedback when destroying blocks

### Visual Effects
- **Day/Night Cycle** - Dynamic sky and lighting changes
- **Dynamic Shadows** - Real-time shadow mapping
- **Fog Effect** - Distance-based fog for depth perception
- **Water Rendering** - Animated water with wave effects
- **Particle System** - Block breaking particles, dust effects
- **Block Outline** - Highlighted selection with pulsing animation

### Audio
- **Block Sounds** - Break and place sound effects
- **Jump Sound** - Feedback for player actions
- **Step Sounds** - Footstep audio while moving

### UI & Controls
- **Health Display** - Visual health bar (20 HP)
- **Coordinate Display** - Real-time position tracking
- **FPS Counter** - Performance monitoring
- **Block Info** - Current selected block name
- **Inventory Display** - Visual hotbar at bottom
- **Help Menu** - Control information (press H)
- **Debug Display** - Performance stats (press F3)

### Performance
- **Optimized Rendering** - Color caching and efficient mesh generation
- **Memory Management** - Automatic garbage collection for old chunks
- **Resource Disposal** - Proper cleanup of geometries and materials
- **Frustum Culling** - Only render visible chunks
- **Configurable Render Distance** - Adjust for performance/quality

## Controls

| Key | Action |
|-----|--------|
| **W** | Move Forward |
| **A** | Move Left |
| **S** | Move Backward |
| **D** | Move Right |
| **Space** | Jump |
| **Shift** | Sprint / Crouch |
| **Mouse Move** | Look Around |
| **Left Click** | Break Block |
| **Right Click** | Place Block |
| **1-9** | Select Block |
| **Scroll Wheel** | Change Block |
| **C** | Pick Block (copy from world) |
| **H** | Toggle Help |
| **F3** | Toggle Debug Info |

## Getting Started

### Prerequisites
- Modern web browser with WebGL support
- No installation required

### Running the Game

#### Using Python (Built-in)
```bash
npm start
# or
npm run dev
```

#### Using Any HTTP Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js with http-server
npx http-server
```

Then visit `http://localhost:8000` in your browser.

## Configuration

Edit `config.json` to customize gameplay:

```json
{
  "world": {
    "renderDistance": 10,
    "waterLevel": 62
  },
  "player": {
    "speed": 0.1,
    "sprintSpeed": 0.15,
    "jumpPower": 0.5
  },
  "graphics": {
    "shadowMapSize": 2048,
    "particleLimit": 2000
  }
}
```

## Project Structure

- `game.js` - Main game engine and rendering loop
- `world.js` - Terrain generation and chunk management
- `player.js` - Player physics and controls
- `blocks.js` - Block definitions and properties
- `ui.js` - User interface and inventory
- `particles.js` - Particle effects system
- `water.js` - Water rendering and animation
- `audio.js` - Sound effects and audio management
- `debug.js` - Performance monitoring
- `blockoutline.js` - Block selection visualization
- `config.json` - Game configuration
- `style.css` - UI styling
- `index.html` - HTML structure

## Technical Features

- Color caching for efficient rendering
- Optimized raycasting for block detection
- Dynamic memory management
- Frustum culling for performance
- Procedural terrain with multi-octave Perlin noise
- Cave system generation
- Varied tree generation based on terrain
- Height-based ore distribution

## Browser Compatibility

Works on:
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires WebGL support.

## Performance Tips

1. Reduce `renderDistance` in config.json for lower-end devices
2. Lower `particleLimit` to reduce particle effects
3. Close other browser tabs for better performance

## Credits

Built with Three.js and Simplex Noise libraries.

Inspired by Minecraft creative sandbox gameplay.

## License

MIT License
