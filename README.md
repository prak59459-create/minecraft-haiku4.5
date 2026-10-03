# Minecraft Haiku 4.5

A 3D Minecraft clone built with Three.js and TypeScript. Experience infinite procedurally-generated worlds with full physics-based gameplay, dynamic lighting, and interactive block placement/destruction.

## ✨ Features

### Core Gameplay
- **3D Rendering**: High-performance Three.js rendering with dynamic shadows
- **Infinite Worlds**: Procedural terrain generation using Perlin noise
- **Chunk System**: Dynamic chunk loading/unloading for seamless exploration
- **Block Interactions**: 
  - Left-click to destroy blocks
  - Right-click to place blocks
  - Number keys 1-6 for block selection
  - Real-time visual feedback

### Player Control & Physics
- **WASD Movement**: Smooth directional movement
- **Mouse Look**: First-person camera with pointer lock
- **Jumping**: Space bar with proper gravity simulation
- **Sprinting**: Shift key for increased movement speed
- **Collision Detection**: Precise AABB-based collision with smooth resolution

### World & Environment
- **Block Types**: Grass, Dirt, Stone, Wood, Leaves, Water
- **Terrain Variation**: Multi-octave Perlin noise for diverse landscapes
- **Vegetation**: Procedural tree-like structures on terrain
- **Day/Night Cycle**: Dynamic sky colors and lighting changes
- **Adaptive Lighting**: Sky-based ambient lighting that changes with time

### Audio & Feedback
- **Procedural Sound Effects**:
  - Unique block break sounds (frequency varies by type)
  - Block placement audio
  - Jump and landing sounds
  - Footstep effects
- **Particle Effects**: Block destruction particles with physics

### User Interface
- **Hotbar**: Quick block selection UI
- **Crosshair**: Center screen aiming reticle
- **Info Panel**: Real-time stats including:
  - Player position and velocity
  - FPS counter
  - Chunk count
  - Memory usage
  - Compass direction
  - Time of day

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Modern web browser with WebGL2 support

### Installation

```bash
# Clone or download the repository
cd minecraft-haiku4.5

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Building for Production

```bash
# Create optimized build
npm run build

# Preview production build locally
npm run preview
```

## 🎮 Controls

| Action | Key(s) |
|--------|--------|
| Move Forward | W |
| Move Left | A |
| Move Backward | S |
| Move Right | D |
| Jump | Space |
| Sprint | Shift (hold) |
| Look Around | Mouse Movement |
| Lock/Unlock Pointer | Click Canvas |
| Destroy Block | Left Click |
| Place Block | Right Click |
| Select Block (1-6) | Number Keys 1-6 |

## 🌍 Game Mechanics

### Terrain Generation
- **Procedural**: Every playable area is generated on-the-fly using Perlin noise
- **Seamless**: Terrain tiles seamlessly across chunk boundaries
- **Varied**: Multiple noise octaves create diverse landscapes

### Block System
- Blocks are placed on integer coordinates
- Each block occupies 1x1x1 unit space
- Adjacent faces with solid blocks are culled for performance
- Supports 6 different block types (plus air)

### Physics
- **Gravity**: Continuous downward acceleration (9.8 m/s²)
- **Velocity-based Movement**: Smooth acceleration/deceleration
- **Collision Resolution**: Proper side-based collision handling
- **Ground Detection**: Accurate grounded state for jump ability

### Lighting
- **Time-based**: Sun position changes with day/night cycle
- **Sky-relative**: Ambient lighting follows sky color
- **Shadow Support**: Real-time shadow mapping on directional light
- **Fog**: Distance-based fog for performance and atmosphere

## 📋 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Developer guide, architecture, and how to add features
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Performance optimization tips and profiling guide

## 🛠 Technical Stack

- **Runtime**: TypeScript + ES2020
- **Graphics**: Three.js r128
- **Build Tool**: Vite 5
- **Procedural Generation**: Perlin noise (hand-implemented)
- **Physics**: Custom AABB collision detection
- **Audio**: Web Audio API

## 📊 Performance

- **Target**: 60 FPS on modern hardware
- **Optimization**: Dynamic chunk loading, face culling, efficient raycasting
- **Memory**: Typical usage 50-200MB depending on render distance
- **Network**: Single-player only (no server communication)

## 🤝 Contributing

To extend or improve the game:

1. See [DEVELOPMENT.md](./DEVELOPMENT.md) for architecture details
2. Follow TypeScript best practices
3. Test changes in browser
4. Monitor performance with in-game stats

## 📝 License

This project is open source and available for personal and educational use.

## 🎯 Future Enhancements

- [ ] Inventory system with 36 slots
- [ ] More block types (sand, glass, ice, etc.)
- [ ] Water physics and swimming
- [ ] Tree generation
- [ ] Biome system
- [ ] Mob entities
- [ ] Improved textures and materials
- [ ] Multiplayer support
- [ ] Mobile touch controls
- [ ] VR support

## 🐛 Known Issues

- Audio requires user interaction to initialize (browser policy)
- Performance degrades significantly in extreme render distances
- Water blocks don't have realistic fluid physics
- No collision with falling blocks

## 📞 Support

For issues or questions:
1. Check [DEVELOPMENT.md](./DEVELOPMENT.md) troubleshooting section
2. Review browser console for error messages
3. Use Chrome DevTools Performance tab for profiling

---

**Happy building!** 🏗️