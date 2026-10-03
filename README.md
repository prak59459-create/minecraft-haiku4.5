# Minecraft Clone - Haiku 4.5

A fully-featured 3D Minecraft clone built with Three.js, featuring procedural terrain generation, dynamic lighting, physics, and multiplayer-ready architecture.

## Features

### Core Gameplay
- **WASD Movement**: Full directional movement with smooth acceleration
- **Mouse Look**: 6-DOF camera control with pitch/yaw rotation
- **Jump & Gravity**: Realistic physics with gravity and jumping mechanics
- **Sprint & Crouch**: Speed variations for different movement styles
- **Block Selection**: 1-9 keys or scroll wheel to select from 9 block types
- **Audio Feedback**: Sound effects for block breaking, placing, and jumping
- **Particle Effects**: Visual feedback with destruction particles

### World & Terrain
- **Procedural Generation**: Simplex noise-based terrain with multiple octaves
- **Chunk System**: Dynamic chunk loading/unloading for infinite worlds
- **Biome System**: Five distinct biomes with unique characteristics
  * Desert: Sandy terrain with sparse vegetation
  * Plains: Grassland with moderate elevation
  * Forest: Dense forests with trees
  * Mountain: High elevation rocky terrain
  * Ocean: Water-based biomes
- **9 Block Types**: Grass, dirt, stone, wood, leaves, water, sand, gravel, coal
- **Render Distance**: Configurable chunk loading radius for performance tuning
- **Height Variation**: Terrain ranges from sea level to mountain peaks

### Physics & Interactions
- **Collision Detection**: Precise AABB-based player-block collisions
- **Raycasting**: Block-accurate targeting for placement and destruction
- **Block Breaking**: Left-click to destroy blocks within reach
- **Block Placement**: Right-click to place blocks adjacent to existing blocks
- **Water Physics**: Separate handling for water blocks
- **Camera Collision**: Camera stays outside solid blocks for better view

### Advanced Systems
- **Persistence System**: Save/load player position and chunk data
- **Inventory System**: 36-slot inventory with item stacking
- **Performance Monitoring**: Real-time FPS, draw calls, vertex count tracking
- **Frustum Culling**: Optimized rendering of visible chunks only
- **Detail Levels**: Distance-based rendering optimization

### Visual Polish
- **Day/Night Cycle**: 20-minute in-game day with dynamic lighting
- **Dynamic Sky**: Color-shifting sky based on time of day (sunrise/sunset)
- **Directional Lighting**: Realistic sun position throughout the day
- **Ambient Lighting**: Fallback lighting for visibility in darkness
- **Face Culling**: Automatic removal of hidden block faces
- **Camera Head Bobbing**: Realistic movement animation
- **Smooth Interpolation**: Interpolated camera movement for smoothness
- **Particle System**: Colorful destruction particles on block breaking

### Audio
- **Block Break Sound**: Low-frequency sound effect
- **Block Place Sound**: Mid-frequency melodic effect
- **Jump Sound**: Higher-pitched audio feedback
- **Web Audio API**: Procedural sound synthesis
- **Master Volume Control**: Global sound level adjustment

### User Interface
- **FPS Counter**: Real-time performance monitoring
- **Position Display**: Current player coordinates
- **Chunk Counter**: Active loaded chunks display
- **Time Display**: In-game time in 24-hour format
- **Block Selector**: Visual hotbar with current selection highlight
- **Help Panel**: Toggleable controls reference (Press P)
- **Crosshair**: Center-screen targeting reticle
- **Performance Stats**: Optional performance monitoring display

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
├── index.html           # Main HTML entry point with UI
├── package.json         # Dependencies and scripts
├── README.md            # This documentation
├── CLAUDE.md            # Development guidelines
├── .gitignore           # Git ignore rules
└── js/
    ├── constants.js     # Game constants and block definitions
    ├── perlin.js        # Simplex noise terrain generation
    ├── block.js         # Block type system and properties
    ├── biomes.js        # Biome system with terrain variation
    ├── chunk.js         # Chunk data structure and mesh generation
    ├── world.js         # World management and chunk loading
    ├── physics.js       # Physics simulation and collision detection
    ├── particles.js     # Particle system for destruction effects
    ├── audio.js         # Web Audio API sound effects
    ├── optimization.js  # Performance monitoring and optimization
    ├── camera.js        # Advanced camera system with head bobbing
    ├── persistence.js   # World saving and inventory systems
    ├── player.js        # Player controller and input handling
    └── game.js          # Main game loop and scene setup
```

## Configuration

Edit `js/constants.js` to customize:

```javascript
CHUNK_SIZE = 16;          // Blocks per chunk edge
CHUNK_HEIGHT = 256;       // Vertical blocks per chunk
RENDER_DISTANCE = 3;      // Chunks to load around player
BLOCK_SIZE = 1;           // Individual block size

WALK_SPEED = 0.2;         // Normal movement speed
SPRINT_SPEED = 0.35;      // Sprint speed multiplier
JUMP_FORCE = 0.15;        // Jump strength
GRAVITY = 0.008;          // Gravity acceleration
MOUSE_SENSITIVITY = 0.003; // Camera sensitivity

DAY_CYCLE_MINUTES = 20;   // Full day length in minutes
```

## Performance Tips

### For Better FPS
1. **Reduce Render Distance**: Lower `RENDER_DISTANCE` in constants.js (2-3 for weak hardware)
2. **Disable Post-Processing**: Comment out advanced effects in game.js
3. **Use Chrome**: Usually fastest performance
4. **Close Other Tabs**: Frees up GPU memory
5. **Monitor Performance**: Check FPS counter in top-left

### For Better Visuals
1. **Increase Render Distance**: Higher chunks loaded around player
2. **Enable Shadows**: Uncomment shadow settings in setupLighting()
3. **Optimize Textures**: When textures are added, use atlasing
4. **Use Anti-aliasing**: Already enabled, improves edge quality

### Memory Management
- Chunks are cached in RAM up to render distance
- Older chunks automatically unload
- LocalStorage caches up to 100 chunk blocks
- Total memory usage typically 50-200MB

### Network Optimization (Future)
- Chunk compression for multiplayer sync
- Delta compression for block changes
- Priority-based chunk streaming
- Bandwidth-aware LOD system

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

**Currently Implemented:**
- [x] Particle effects for block destruction
- [x] Sound effects (mining, placing, jumping)
- [x] Save/load world data
- [x] Biome system with varied terrain
- [x] Performance monitoring and optimization
- [x] Inventory system foundation
- [x] Advanced camera with head bobbing

**Future Features:**
- [ ] Textures instead of solid colors
- [ ] Advanced lighting (ambient occlusion, bloom)
- [ ] Multiplayer support with WebSockets
- [ ] Tool durability and crafting system
- [ ] NPC mobs and hostile creatures
- [ ] More block types (ores, doors, stairs, slabs)
- [ ] Redstone system and automation
- [ ] Enchantment system
- [ ] Dimension system (nether, end)
- [ ] Weather system (rain, snow, thunderstorms)

## Known Limitations & TODOs

- Blocks have solid colors (no textures)
- Limited initial block types (can be expanded)
- Single-player only (multiplayer planned)
- No crafting or tool system yet
- No NPC mobs or creatures
- No Redstone/automation mechanics
- Camera can clip through blocks in rare cases
- Water physics simplified (no swimming yet)

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
