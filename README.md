# Minecraft Clone - 3D Voxel World

A complete 3D Minecraft-inspired voxel game built with Three.js and JavaScript. Features procedurally generated infinite terrain, full block interaction, dynamic lighting, and real-time physics.

## ✨ Features

### World Generation
- **Perlin Noise Terrain**: Multi-octave Perlin noise for natural terrain variation
- **Biome System**: Beach, Plains, Hill, and Mountain biomes with terrain-appropriate blocks
- **Cave Generation**: 3D noise-based cave systems for exploration
- **Tree Generation**: Procedural tree generation with wood and leaves
- **Chunk System**: Circular view distance with dynamic loading/unloading

### Gameplay
- **Player Controller**: WASD movement, mouse look, jumping, sprinting, and swimming
- **Block Interaction**: Left-click to destroy, right-click to place blocks
- **13 Block Types**: Grass, Dirt, Stone, Oak/Spruce/Birch/Dark Oak Wood, Leaves, Water, Sand, Gravel, Cobblestone
- **Physics Engine**: Gravity, collision detection, water buoyancy, automatic step-up
- **Raycasting System**: Real-time block highlighting and face detection

### Environment
- **Day/Night Cycle**: 20-minute cycle with smooth lighting transitions
- **Dynamic Lighting**: Sun position and intensity changes throughout the day
- **Atmospheric Fog**: Distance fog with time-of-day color changes
- **Particle Effects**: Block destruction particles with physics simulation

### Audio & Visual Polish
- **Sound Effects**: Web audio synthesis for block placement, breaking, and jumping
- **Particle System**: GPU-accelerated particle rendering
- **UI System**: Crosshair, block selector, inventory display, FPS counter, position tracker, time indicator
- **Visual Feedback**: Color-coded FPS display, emoji-based inventory

## 🎮 Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move forward/left/backward/right |
| **Mouse** | Look around |
| **Left Click** | Destroy block |
| **Right Click** | Place selected block |
| **Space** | Jump (hold in water to swim) |
| **Shift** | Sprint |
| **1-9** | Select block type |
| **Scroll Wheel** | Cycle through block types |

## 🚀 Getting Started

1. Clone or download the repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
3. Click anywhere to lock the cursor
4. WASD to move, mouse to look around, click to interact

### System Requirements
- Modern browser with WebGL support
- JavaScript enabled
- Recommended: 4GB RAM, discrete GPU for optimal performance

## 🏗️ Technical Architecture

### Core Systems
- **Terrain Generator**: SimplexNoise-based procedural generation with height caching
- **World Management**: Infinite chunk system with dynamic loading
- **Rendering Engine**: Three.js with optimized BufferGeometry
- **Physics Engine**: AABB-based collision detection with smooth movement

### Optimization Techniques
- Circular view distance culling
- Height value caching (10,000 entry LRU cache)
- Vertex buffer geometry with face culling
- LOD-ready architecture for distant chunks
- Efficient particle system using Point materials
- WebGL high-performance settings

### File Structure
- `index.html` - Main entry point
- `main.js` - Game initialization
- `game.js` - Main game loop and orchestration
- `blocks.js` - Block type definitions
- `terrain.js` - World and terrain generation
- `player.js` - Player controller and physics
- `rendering.js` - Three.js rendering system
- `audio.js` - Sound synthesis engine
- `particles.js` - Particle system
- `styles.css` - UI styling

## 🎨 Customization

### Adding New Block Types
Edit `blocks.js` and add new block definitions:
```javascript
CUSTOM_BLOCK: { id: 14, name: 'Custom', solid: true, color: 0xFF5733 }
```

### Adjusting Terrain Parameters
Edit `terrain.js` to modify:
- `viewDistance`: Number of chunks visible in each direction
- `chunkSize`: Size of each chunk (default: 16)
- Noise frequencies and amplitudes for different terrain styles

### Modifying Day/Night Cycle
Edit `rendering.js`:
- `this.gameTime += deltaTime * 100` controls cycle speed
- `getSkyColor()` function defines day/night appearance

## 📊 Performance

- Target: 60 FPS on modern hardware
- ~6km² visible world at default view distance
- Efficient memory usage with chunk streaming
- WebGL context optimized for high performance

## 🔮 Potential Enhancements

- Save/load world functionality
- Crafting system with recipes
- Inventory management
- More biomes and structures
- Multiplayer networking
- Advanced water physics
- Weather system
- Entity system (mobs, animals)

## 📝 License

Created as a Three.js demo project.

## 🙏 Credits

Built with [Three.js](https://threejs.org/) - An amazing 3D JavaScript library