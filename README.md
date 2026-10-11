# Minecraft Haiku 4.5 - 3D Minecraft Clone

A performant 3D Minecraft clone built with Three.js, featuring procedural terrain generation, real-time chunk loading, and complete game mechanics.

## Features

### Core Gameplay
- **WASD Movement**: Navigate the world smoothly with full 6-DOF camera control
- **Mouse Look**: Look around with the mouse (click to lock pointer)
- **Block Breaking**: Left-click to destroy blocks
- **Block Placement**: Right-click to place blocks from your inventory
- **Jump & Sprint**: Space to jump, Hold Shift to sprint
- **Inventory System**: Number keys 1-9 or scroll wheel to select block types

### World & Terrain
- **Procedural Generation**: Infinite world using Perlin noise-based terrain generation
- **Chunk System**: Dynamic chunk loading and unloading for optimal performance
- **Multiple Biomes**: Different terrain types (grass, sand) with varying heights
- **Ore Generation**: Coal, iron, gold, and diamond ores at appropriate depths
- **Tree Generation**: Procedurally generated trees with logs and leaves

### Graphics & Audio
- **Day/Night Cycle**: Dynamic lighting that changes throughout a game day
- **Water Rendering**: Water blocks with transparency and proper face culling
- **Particle Effects**: Block destruction particles with realistic physics
- **Sound Effects**: Break, place, jump, and footstep sounds
- **Block Outline**: Visual feedback showing selected block

### Performance
- **Frustum Culling**: Only renders visible chunks
- **Mesh Caching**: Chunks are generated once and cached
- **Shadow Mapping**: Real-time shadows with optimized shadow camera
- **Memory Management**: Proper geometry disposal to prevent memory leaks
- **Debug Mode**: F3 key shows FPS, vertex count, and memory usage

## How to Run

### Local Development
```bash
# Start a simple HTTP server
python -m http.server 8000

# Open in browser
http://localhost:8000
```

### Requirements
- Modern browser with WebGL support
- JavaScript enabled
- Mouse and keyboard for controls

## Controls

### Movement
- **W/A/S/D**: Move forward/left/backward/right
- **Mouse**: Look around (click to lock/unlock)
- **Space**: Jump
- **Shift**: Sprint (hold while moving)

### Block Interaction
- **Left Click**: Break block
- **Right Click**: Place block
- **C Key**: Pick block (copy selected block from world)

### UI
- **1-9 Keys**: Select block from inventory
- **Scroll Wheel**: Cycle through inventory blocks
- **Click Inventory**: Select block from hotbar
- **H Key**: Toggle help display
- **F3 Key**: Toggle debug display

## Configuration

Edit `config.json` to customize:
- World rendering distance
- Player movement speeds
- Graphics settings (shadow quality, particle limits)
- Audio settings
- Raycast parameters

### Example Configuration
```json
{
  "world": {
    "renderDistance": 8
  },
  "player": {
    "speed": 0.1,
    "sprintSpeed": 0.15,
    "jumpPower": 0.5
  },
  "graphics": {
    "shadowMapSize": 2048
  }
}
```

## Block Types

1. Stone - Gray solid block
2. Grass - Green top with dirt side
3. Dirt - Brown solid block
4. Cobblestone - Gray textured block
5. Oak Log - Brown log block
6. Oak Leaves - Green foliage (transparent)
7. Sand - Tan block, found on beaches
8. Water - Blue liquid, transparent
9. Gravel - Light gray gravel block
10. Bedrock - Bottom layer, indestructible (dark gray)
11. Coal Ore - Coal ore block
12. Iron Ore - Iron ore block
13. Gold Ore - Gold ore block
14. Diamond Ore - Diamond ore block

## Architecture

### File Structure
```
minecraft-haiku4.5/
├── game.js              # Main game loop and chunk management
├── world.js             # World generation and block storage
├── player.js            # Player physics and movement
├── blocks.js            # Block definitions and properties
├── ui.js                # UI and inventory system
├── particles.js         # Particle system for effects
├── water.js             # Water rendering
├── audio.js             # Audio synthesis and playback
├── blockoutline.js      # Block selection outline
├── debug.js             # Debug display
├── config.js            # Configuration system
├── style.css            # Styling
├── index.html           # Main HTML file
├── config.json          # Game configuration
└── package.json         # Project metadata
```

### Key Classes

- **MinecraftGame**: Main game controller, handles rendering and input
- **World**: Manages chunks, block storage, and terrain generation
- **Player**: Player physics, movement, and collision detection
- **Camera**: First-person camera control
- **UI**: Inventory and HUD management
- **ParticleSystem**: Handles block break particles
- **WaterRenderer**: Water block rendering
- **AudioManager**: Sound effects synthesis
- **BlockOutline**: Selection indicator for blocks
- **DebugDisplay**: Performance monitoring
- **Config**: Configuration management

## Performance Tips

1. **Render Distance**: Lower render distance increases FPS. Adjust in config.json
2. **Shadow Quality**: Reduce shadowMapSize for faster rendering
3. **Particle Effects**: Lower particleLimit to reduce effect performance impact
4. **Browser**: Use Chrome/Chromium-based browsers for best performance

## Known Limitations

- Single-player only (no multiplayer)
- Limited block types (14 solid + water)
- Water is non-flowing (decorative only)
- No swimming mechanics
- No cave systems
- Basic terrain generation (no biome transitions)

## Future Enhancements

- Advanced terrain generation with caves
- Water physics and flowing
- More block types and textures
- Crafting system
- Inventory management (item stacks)
- Day/night cycle effects on mobs
- Sound effects volume control
- Save/load world feature
- Performance profiling tools

## Technical Details

- **Engine**: Three.js (3D graphics)
- **Terrain**: Simplex noise for procedural generation
- **Audio**: Web Audio API for sound synthesis
- **Rendering**: WebGL with custom chunk mesh generation
- **Physics**: Simple AABB collision detection

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

Requires WebGL support and modern JavaScript (ES6+).

## License

MIT License - Feel free to use and modify this code.

## Credits

Built with Three.js and Simplex Noise libraries.
Game inspired by Minecraft by Mojang Studios.

Enjoy building! 🎮
