# Minecraft Clone - Built with Three.js

A fully-featured 3D Minecraft clone built with Three.js, featuring procedural terrain generation, physics, particle effects, and more.

## Features

### Core Gameplay
- **3D World Generation**: Infinite procedurally generated terrain using Perlin noise
- **Block System**: 20 different block types with full interaction
- **Physics**: Gravity, collision detection, and realistic movement
- **Day/Night Cycle**: Dynamic lighting that changes throughout the day

### World Generation
- **Biome System**: Multiple biomes (Grass, Sand, Snow) with unique characteristics
- **Terrain Variation**: Height variation, caves, and ore distribution
- **Trees**: Procedural tree generation in grass biomes
- **Ores**: Coal, Iron, Gold, and Diamond ores at varying depths

### Interaction
- **Block Breaking**: Left-click to destroy blocks with particle effects
- **Block Placement**: Right-click to place blocks
- **Block Selection**: 9 hotbar slots (keys 1-9 or scroll wheel)
- **Raycasting**: Precise block targeting with highlight outline

### Visual Effects
- **Particle System**: Block break effects with pooled particles
- **Water Rendering**: Transparent water with proper rendering
- **Shadows**: Dynamic lighting with shadow mapping
- **Outline Highlighting**: Visual feedback for targeted blocks

### Audio
- **Sound Effects**: Block break/place sounds using Web Audio API
- **Jump Sound**: Distinct audio feedback for jumping
- **Procedural Audio**: All sounds generated at runtime

## Controls

| Key | Action |
|-----|--------|
| **WASD** | Move forward/backward/left/right |
| **Mouse** | Look around (click to lock) |
| **Space** | Jump |
| **Shift** | Sprint/Crouch |
| **1-9** | Select block hotbar slot |
| **Scroll** | Cycle through blocks |
| **Left Click** | Destroy block |
| **Right Click** | Place block |
| **F3** | Toggle debug display |
| **H** | Toggle help menu |

## Block Types

| Block | Type |
|-------|------|
| Stone | Solid |
| Grass | Solid (surface) |
| Dirt | Solid |
| Cobblestone | Solid (ore-like) |
| Oak Log | Solid (wood) |
| Oak Leaves | Transparent (foliage) |
| Sand | Solid (desert) |
| Water | Transparent (liquid) |
| Gravel | Solid (ore-like) |
| Bedrock | Solid (bottom layer) |
| Coal Ore | Solid (ore) |
| Iron Ore | Solid (ore) |
| Gold Ore | Solid (ore) |
| Diamond Ore | Solid (ore) |
| Oak Planks | Solid (crafted) |
| Bricks | Solid (crafted) |
| Mossy Cobblestone | Solid (rare) |
| Obsidian | Solid (dense) |
| Snow | Solid (cold biome) |
| Ice | Transparent (cold biome) |

## Getting Started

### Installation
```bash
npm install
```

### Running
```bash
npm start
```
Then open `http://localhost:8000` in your browser.

### Configuration
Edit `config.json` to customize:
- Render distance
- Player movement speed
- Graphics settings
- Audio settings
- Terrain parameters

## Technical Details

### Architecture
- **Engine**: Three.js (WebGL rendering)
- **Terrain**: Simplex noise procedural generation
- **Physics**: Custom collision detection
- **Rendering**: Vertex-colored mesh system with frustum culling
- **Audio**: Web Audio API with procedural sound synthesis

### Performance
- **Target FPS**: 60
- **Render Distance**: 8 chunks (128x128 blocks)
- **Optimization Techniques**:
  - Chunk-based mesh generation
  - Frustum culling
  - Face culling (hidden face removal)
  - Object pooling (particles)
  - Vertex color caching

### Browser Requirements
- Modern browser with WebGL 2.0 support
- Chrome, Firefox, Safari, Edge (latest versions)
- Desktop or laptop (mobile may have performance issues)

## Project Structure
```
├── game.js              # Main game engine
├── world.js             # World and chunk generation
├── player.js            # Player physics and controls
├── blocks.js            # Block definitions
├── particles.js         # Particle system
├── water.js             # Water rendering
├── audio.js             # Audio manager
├── ui.js                # UI and HUD
├── debug.js             # Debug display
├── blockoutline.js      # Block highlighting
├── config.js            # Configuration system
├── config.json          # Game settings
├── style.css            # Styling
└── index.html           # HTML entry point
```

## Performance Tips

1. **Reduce Render Distance**: Decrease `world.renderDistance` in config.json
2. **Lower Particle Count**: Adjust `graphics.particleLimit`
3. **Disable Shadows**: Set shadow intensity to 0
4. **Optimize Graphics Settings**: Reduce `graphics.renderScale`

## Future Enhancements

- [ ] Chunk persistence (save/load worlds)
- [ ] Multiplayer support
- [ ] Creative and Survival modes
- [ ] More biomes (Ocean, Mountain, Forest)
- [ ] Inventory management system
- [ ] Crafting system
- [ ] Mob generation
- [ ] Dynamic weather
- [ ] Improved lighting model (Voxel GI)

## License
MIT

## Credits
Built with Three.js, Simplex Noise, and modern web APIs.

---

**Version**: 1.0.0  
**Last Updated**: 2026-10-05
