# Changelog - Minecraft Clone (Haiku 4.5)

All notable changes to this project will be documented in this file.

## [Latest] - 2026-10-05

### Performance Optimizations
- **Raycast Optimization**: Increased step size from 0.05 to 0.1, added directional caching to skip duplicate block positions
- **Mesh Generation**: Use bitwise color operations instead of Three.js Color objects
- **Particle System**: Implemented object pooling to reduce garbage collection pressure
- **Collision Detection**: Optimized player collision checks from 16+ angle checks to 8 key directions
- **Terrain Generation**: Reduced Perlin noise function calls, optimized ore distribution with single noise calculation
- **Tree Generation**: Simplified circle iteration using square distance instead of trigonometry
- **Chunk Updates**: Added position caching to prevent redundant mesh rebuilds

### New Features
- **Expanded Blocks**: Added 6 new block types (Oak Planks, Bricks, Mossy Cobblestone, Obsidian, Snow, Ice)
- **Biome System**: Implemented biome-based terrain generation with separate snow biome support
- **Improved Inventory**: Dynamic block selection from 9 slots
- **Enhanced UI**: Better visual feedback for inventory selection

### Terrain Generation
- **Biomes**: Grass biome (default), Sand biome (warm/humid), Snow biome (cold)
- **Features**: Procedural tree generation, ore distribution by depth, terrain height variation
- **Block Types**: Grass, dirt, sand, stone, ores (coal, iron, gold, diamond)

### Controls
- **Movement**: WASD for movement, Mouse for look, Space for jump, Shift for sprint/crouch
- **Interaction**: Left-click to break blocks, Right-click to place blocks
- **Block Selection**: Keys 1-9 or scroll wheel to select blocks
- **Debug**: F3 to toggle debug display, H for help

### Bug Fixes
- Fixed collision detection edge cases
- Improved camera smoothness
- Better water rendering
- Optimized particle lifetime management

### Technical Details
- Framework: Three.js
- Terrain: Simplex/Perlin noise with multiple octaves
- Physics: Custom collision detection with raycast support
- Audio: Web Audio API for sound effects

## Previous Features
- Full 3D Minecraft-like world generation
- Day/night cycle with dynamic lighting
- Particle effects for block breaking
- Water rendering with transparency
- Sound effects for block interactions
- Configurable settings (config.json)
- Debug information display
- Block outline highlighting

---

## Performance Metrics
- Target FPS: 60
- Render Distance: 8 chunks (128 blocks)
- Max Particles: 2000
- Shadow Map Size: 2048x2048

## Known Limitations
- No chunk persistence (world resets on page reload)
- Single player only
- No creative mode/survival mechanics
- Simplified lighting model
