# Minecraft Clone - Haiku 4.5

A fully-featured 3D Minecraft clone built with **Three.js** and **Vite**, featuring procedural terrain generation, realistic physics, and interactive gameplay.

## Features

### 🎮 Core Gameplay
- **3D Voxel World**: Infinite procedurally-generated terrain using Perlin noise
- **Chunk-based System**: Dynamic loading/unloading for performance
- **Block Interaction**: Place and destroy blocks in real-time
- **9 Block Types**: Grass, Dirt, Stone, Wood, Leaves, Water, Sand, Gravel, Cobblestone, Coal Ore

### 🎮 Player Controls
- **WASD**: Movement in all directions
- **Mouse**: First-person camera look
- **Space**: Jump
- **Shift**: Sprint/Crouch
- **LMB**: Destroy blocks
- **RMB**: Place blocks
- **1-9 / Scroll**: Quick block selection
- **Click**: Lock/unlock cursor

### 🌍 Physics & Collision
- Gravity-based movement
- Precise player-block collision detection
- Ground detection and jumping mechanics
- Raycasting for block targeting

### ✨ Visual Features
- **Day/Night Cycle**: Full 24-hour cycle with adaptive lighting
- **Dynamic Lighting**: Sun light, ambient light, and hemisphere light
- **Particle Effects**: Block destruction particles
- **Color-coded Blocks**: Realistic colors for each block type

### 🎵 Audio
- Block break sound effects
- Block place sound effects
- Jump and step sounds
- Volume control

### 📊 UI & HUD
- Real-time FPS counter
- Player position tracker
- Chunk loading display
- Time and light level indicator
- Visual block selector hotbar

### ⚡ Optimization
- Efficient chunk mesh generation
- Vertex color optimization
- Reduced draw calls
- Memory management system
- Performance profiling

## Installation

### Prerequisites
- Node.js (14+ recommended)
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
minecraft-haiku4.5/
├── index.html              # Main HTML entry
├── package.json            # Dependencies
├── vite.config.js          # Build configuration
├── src/
│   ├── main.js            # Application entry point
│   ├── player/
│   │   └── Player.js       # Player mechanics and inventory
│   ├── input/
│   │   └── InputManager.js # Keyboard and mouse controls
│   ├── world/
│   │   ├── ChunkManager.js # Chunk management
│   │   ├── Chunk.js        # Individual chunk rendering
│   │   ├── BlockType.js    # Block definitions
│   │   └── TerrainGenerator.js # Procedural terrain
│   ├── environment/
│   │   └── Lighting.js     # Day/night cycle and lighting
│   ├── effects/
│   │   └── ParticleSystem.js # Destruction particles
│   ├── ui/
│   │   └── UI.js           # HUD and stats display
│   └── utils/
│       ├── Sound.js        # Audio system
│       ├── Performance.js   # Performance optimization
│       └── SaveManager.js   # Save/load system
└── README.md               # This file
```

## How to Play

1. **Move Around**: Use WASD to walk through the world
2. **Look Around**: Move your mouse to look in different directions
3. **Jump**: Press Space to jump up to higher areas
4. **Break Blocks**: Left-click on blocks to destroy them
5. **Place Blocks**: Right-click to place selected blocks
6. **Select Blocks**: Use 1-9 keys or scroll wheel to change block type
7. **Sprint**: Hold Shift while moving to run faster

## Technical Details

### Terrain Generation
- Uses 3-layer Simplex noise for realistic terrain
- Configurable chunk size (16x16) and height (64 blocks)
- Water level at y=5
- Varied biome-like heights

### Rendering
- **Geometry Culling**: Only renders visible block faces
- **Vertex Colors**: Per-face coloring for block diversity
- **Instanced Rendering**: Prepared for future optimization
- **LOD System**: Distance-based quality adjustments

### Performance
- Render distance: 8 chunks (configurable)
- ~1000 chunks can be loaded simultaneously
- Particle limit: 1000 particles
- Adaptive quality based on FPS

### Physics
- Gravity: 0.08 blocks/frame
- Jump height: ~1.25 blocks
- Collision radius: 0.3 blocks
- Movement speed: 0.15 blocks/frame (0.3 when sprinting)

## Future Enhancements

- [ ] Texture mapping for blocks
- [ ] Advanced biomes (deserts, mountains, forests)
- [ ] Multiplayer support (WebSocket)
- [ ] Advanced water physics (flowing, swimming)
- [ ] Tools and mining speed variation
- [ ] Inventory system
- [ ] Crafting system
- [ ] NPCs and mobs
- [ ] Quest system
- [ ] World save/load persistence
- [ ] Shader-based effects

## Browser Compatibility

- Chrome/Edge 60+
- Firefox 55+
- Safari 11+
- Mobile browsers with WebGL support

## Performance Tips

- Close other applications for better FPS
- Reduce render distance for lower-end devices
- Disable particle effects for maximum performance
- Use Firefox for better WebGL performance on some systems

## Credits

Built with:
- **Three.js**: 3D graphics library
- **Simplex-noise**: Terrain generation
- **Vite**: Build tool and dev server

## License

MIT License - Free to use and modify