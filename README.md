# Minecraft Clone - Haiku 4.5

A fully-featured 3D Minecraft clone built with Three.js, featuring procedural terrain generation, dynamic lighting, physics, and multiplayer-ready architecture.

## Features

### Core Gameplay
- **WASD Movement**: Full directional movement with smooth acceleration
- **Mouse Look**: 6-DOF camera control with pitch/yaw rotation
- **Jump & Gravity**: Realistic physics with gravity and jumping mechanics
- **Sprint & Crouch**: Speed variations for different movement styles
- **Block Selection**: 1-9 keys or scroll wheel to select from 9 block types

### World & Terrain
- **Procedural Generation**: Simplex noise-based terrain with multiple octaves
- **Chunk System**: Dynamic chunk loading/unloading for infinite worlds
- **16 Block Types**: Grass, dirt, stone, wood, leaves, water, sand, gravel, coal, and more
- **Render Distance**: Configurable chunk loading radius for performance tuning
- **Height Variation**: Terrain ranges from sea level to mountain peaks

### Physics & Interactions
- **Collision Detection**: Precise AABB-based player-block collisions
- **Raycasting**: Block-accurate targeting for placement and destruction
- **Block Breaking**: Left-click to destroy blocks within reach
- **Block Placement**: Right-click to place blocks adjacent to existing blocks
- **Water**: Separate handling for water blocks with special physics

### Visual Polish
- **Day/Night Cycle**: 20-minute in-game day with dynamic lighting
- **Dynamic Sky**: Color-shifting sky based on time of day
- **Directional Lighting**: Sun position changes throughout the day
- **Ambient Lighting**: Fallback lighting for dark areas
- **Face Culling**: Automatic removal of hidden block faces for optimization

### User Interface
- **FPS Counter**: Real-time performance monitoring
- **Position Display**: Current player coordinates
- **Chunk Counter**: Active loaded chunks
- **Time Display**: In-game time in 24-hour format
- **Block Selector**: Visual hotbar with current selection highlight
- **Help Panel**: Toggleable controls reference (Press P)
- **Crosshair**: Center-screen targeting reticle

## Controls

| Key | Action |
|-----|--------|
| W | Move forward |
| A | Move left |
| S | Move backward |
| D | Move right |
| Space | Jump |
| Shift | Sprint |
| Mouse Movement | Look around |
| Left Click | Break block |
| Right Click | Place block |
| 1-9 | Select block type |
| Scroll Wheel | Cycle blocks |
| P | Toggle help panel |

## Technical Architecture

### Performance Optimizations
- **Chunk-based Rendering**: Divides world into 16×256×16 block chunks
- **Greedy Mesh Generation**: Combines adjacent faces to reduce draw calls
- **Frustum Culling**: Only renders visible chunks
- **Dynamic Mesh Updates**: Only regenerates chunks when blocks change
- **Vertex Compression**: Efficient GPU memory usage with typed arrays

### Terrain Generation
- **Simplex Noise**: Smooth, gradient-based noise for natural terrain
- **Multi-octave Fractal**: Combines multiple noise scales for detail
- **Height-based Block Placement**: Different blocks at different elevations
- **Biome Influence**: Moisture-based variation for diverse terrain

### Physics System
- **AABB Collision Boxes**: Fast rectangular collision detection
- **Gravity Integration**: Smooth falling with terminal velocity
- **Collision Resolution**: Pushes player out of colliding blocks
- **Ground Detection**: Accurate landing detection for jumping

### Lighting & Rendering
- **Three.js WebGL**: Hardware-accelerated 3D rendering
- **Directional Lighting**: Sun-like light source with shadows
- **Ambient Lighting**: Base illumination for visibility
- **Sky Sphere**: Infinite background sky
- **Phong Shading**: Per-vertex lighting with colors

## Installation & Running

### Requirements
- Modern web browser with WebGL support (Chrome, Firefox, Safari, Edge)
- Internet connection (for CDN resources)

### Quick Start
```bash
# Start HTTP server on port 8080
npm start

# Open in browser
http://localhost:8080
```

Or use any HTTP server:
```bash
python3 -m http.server 8080
php -S localhost:8080
```

## Project Structure

```
minecraft-haiku4.5/
├── index.html           # Main HTML entry point
├── package.json         # Dependencies and scripts
└── js/
    ├── constants.js     # Game constants and configuration
    ├── perlin.js        # Noise generation for terrain
    ├── block.js         # Block type definitions and properties
    ├── chunk.js         # Chunk generation and mesh creation
    ├── world.js         # World management and chunk loading
    ├── player.js        # Player controller and camera
    ├── physics.js       # Physics simulation and collision
    └── game.js          # Main game loop and initialization
```

## Configuration

Edit `js/constants.js` to customize:

```javascript
CHUNK_SIZE = 16;          // Blocks per chunk edge
RENDER_DISTANCE = 3;      // Chunks to load around player
WALK_SPEED = 0.2;         // Normal movement speed
SPRINT_SPEED = 0.35;      // Sprint multiplier
JUMP_FORCE = 0.15;        // Jump strength
DAY_CYCLE_MINUTES = 20;   // Full day length in minutes
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL 1.0 or higher.

## Dependencies

- **Three.js** (r128): 3D graphics library
- **Simplex Noise**: Noise generation for procedural terrain
- No other external dependencies required

## Future Enhancements

- [ ] Multiplayer support with WebSockets
- [ ] Inventory system
- [ ] Tool durability
- [ ] Crafting recipes
- [ ] NPC mobs
- [ ] Particle effects for block destruction
- [ ] Sound effects (mining, walking, etc.)
- [ ] Save/load world data
- [ ] Textures instead of solid colors
- [ ] Advanced lighting (ambient occlusion, bloom)

## Known Limitations

- Blocks have solid colors (no textures)
- No inventory system yet
- Limited block types (can be expanded)
- Single-player only
- No undo/redo functionality

## Performance Tips

- Lower `RENDER_DISTANCE` for better performance on weak hardware
- Disable shadows on mobile devices
- Use Chrome for best performance
- Close other browser tabs to free up GPU memory

## License

MIT License - Feel free to use, modify, and distribute

## Credits

Built with Three.js and Simplex Noise library. Inspired by Minecraft.

---

**Version**: 1.0.0  
**Last Updated**: October 2024
