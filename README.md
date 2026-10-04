# Minecraft Haiku 4.5

A high-performance 3D Minecraft clone built with Three.js and WebGL. Features procedural terrain generation, physics, particles, water rendering, and audio effects.

## Features

### Terrain & World
- **Procedural Generation**: Simplex noise-based infinite world with varied terrain
- **Multiple Biomes**: Grass plains and sandy beaches with dynamic terrain
- **Block Types**: Stone, Dirt, Grass, Sand, Wood, Leaves, Water, Ores (Coal, Iron, Gold, Diamond), Bedrock
- **Ore Distribution**: Height-based ore rarity with natural probability curves
- **Trees**: Procedural tree generation with wood and leaf blocks

### Gameplay
- **Movement**: WASD movement with gravity and collision detection
- **Jumping & Sprinting**: Space to jump, Shift to sprint/crouch with FOV zoom effect
- **Building**: Left-click to destroy, right-click to place blocks
- **Block Selection**: 1-9 keys or scroll wheel to select from inventory
- **Pick Block**: C key to pick the block you're looking at

### Physics & Collision
- **Gravity System**: Realistic falling with collision detection
- **Precise Collisions**: AABB-based collision with multiple sample points
- **Player Dimensions**: Proper player height and width constraints
- **Fall Damage**: Respawn if you fall too far

### Visual Effects
- **Dynamic Lighting**: Day/night cycle with smooth transitions
- **Shadows**: Real-time shadow mapping for realistic shading
- **Particle System**: Block break particles with physics
- **Water Rendering**: Semi-transparent water with subtle animations
- **Fog**: Atmospheric fog that adapts to time of day
- **Camera Bobbing**: Smooth camera movement when walking
- **Block Outline**: Visual highlighting of targeted blocks

### Audio
- **Procedural Sounds**: Web Audio API-based sound effects
- **Block Sounds**: Different sounds for breaking and placing blocks
- **Jump Sound**: Audio feedback for jumping
- **Volume Control**: Master volume adjustment

### Performance
- **Chunk System**: Efficient terrain loading/unloading
- **Frustum Culling**: Automatic culling of off-screen chunks
- **LOD System**: Distance-based render distance optimization
- **Memory Management**: Proper resource disposal for garbage collection
- **Shadow Optimization**: PCF shadow mapping for smooth shadows

### UI & Controls
- **HUD Display**: Real-time FPS, coordinates, and current block info
- **Inventory Display**: Visual block selector with highlighting
- **Help System**: In-game help documentation (H key)
- **Debug Display**: Performance statistics (F3 key)
- **Pointer Lock**: Seamless mouse control for FPS gameplay

## Controls

| Key | Action |
|-----|--------|
| **WASD** | Move forward, left, back, right |
| **Space** | Jump |
| **Shift** | Sprint (hold) or Crouch |
| **Mouse** | Look around (requires pointer lock) |
| **Left Click** | Destroy block |
| **Right Click** | Place block |
| **1-9** | Select block from inventory |
| **Scroll Wheel** | Cycle through blocks |
| **C** | Pick block (copy selected block) |
| **F3** | Toggle debug display |
| **H** | Toggle help screen |

## Technical Details

### Technology Stack
- **Three.js**: 3D rendering
- **Simplex Noise**: Procedural terrain generation
- **Web Audio API**: Sound generation
- **WebGL**: Hardware-accelerated graphics

### Optimizations
- Geometry disposal for memory management
- Efficient raycasting with grid-based traversal
- Color pre-calculation to reduce garbage collection
- Texture atlasing-ready material system
- Frustum culling and LOD distance calculation

## Performance Tips

1. **FPS Optimization**:
   - Reduce render distance in config.js
   - Disable shadows for slower devices
   - Use debug display (F3) to monitor performance

2. **Memory Usage**:
   - The game automatically unloads distant chunks
   - Particle count is limited to prevent memory leaks
   - Geometry is properly disposed when chunks unload

## Browser Compatibility

Requires a modern browser with:
- WebGL support
- ES6 module support
- Pointer Lock API
- Web Audio API

## Building & Running

```bash
npm run dev
# Or use Python
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

---

Built with Three.js and Simplex Noise. Inspired by Minecraft.
