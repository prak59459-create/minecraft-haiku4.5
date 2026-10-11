# Minecraft Clone - Improvements & Features

## Recent Optimizations & Enhancements

### Performance Improvements
- **Enhanced Shadow Rendering**: Increased shadow map size to 4096x4096 for better shadow quality
- **Better Lighting System**: Improved ambient and directional light calculations with reduced light bleeding
- **Optimized Mesh Generation**: Enhanced frustum culling and better mesh building with improved material properties
- **Particle System**: Better particle distribution with max cap of 2000 particles and improved physics

### Terrain Generation
- **Multi-layered Perlin Noise**: Improved terrain generation with multiple octaves for more varied landscapes
- **Better Ore Distribution**: More realistic ore distribution with depth-based generation
- **Expanded Block Variety**: Added new blocks - Oak Planks, Bricks, Clay, and Obsidian
- **Enhanced Biome Variety**: Better sand vs grass biome transitions

### Visual Enhancements
- **Improved Water Rendering**: Enhanced water material with better lighting and transparency
- **Better Color Lighting**: More sophisticated lighting calculations for better visual depth
- **Particle Effects**: Improved block break particles with better velocity distribution
- **Flat Shading**: Changed to flat shading for cleaner block appearance

### Gameplay Improvements
- **Better Controls**: Adjusted movement speeds for more responsive gameplay
  - Normal Movement Speed: 0.125 (was 0.1)
  - Sprint Speed: 0.18 (was 0.15)
  - Crouch Speed: 0.06 (was 0.05)
  - Jump Power: 0.55 (was 0.5)
  - Gravity: 0.025 (was 0.02)
- **Camera Sensitivity**: Slightly increased mouse sensitivity for better aiming
- **Enhanced Inventory**: Updated inventory with new block types

### New Blocks
- **Oak Planks** (15): Wooden block for construction
- **Brick** (16): Red decorative block
- **Clay** (17): Tan colored building block
- **Obsidian** (18): Dark rare block for advanced building

### Game Features
✓ WASD Movement
✓ Mouse Look (with pointer lock)
✓ Space to Jump
✓ Shift for Sprint/Crouch
✓ Left-click to destroy blocks
✓ Right-click to place blocks
✓ Number keys (1-9) or scroll wheel for block selection
✓ C to pick block
✓ F3 for debug display
✓ H for help display

### World Generation
- Procedural terrain with Perlin noise
- Dynamic chunk loading/unloading based on player position
- Multiple block types with realistic distribution
- Water at sea level (62)
- Trees with foliage
- Ore distribution by depth
- Multiple biome types (grass and sand)

### Technical Features
- Three.js based rendering
- WebGL with shadow mapping
- Dynamic lighting system with day/night cycle
- Web Audio API for sound effects
- Efficient chunk-based world management
- Pointer lock for immersive controls

## Configuration
Game settings can be modified in `config.json`:
- Render distance: 8 chunks
- Shadow map size: 4096
- Water level: 62
- Max particle limit: 2000
- Player movement speeds
- Camera sensitivity

## Browser Requirements
- Modern browser with WebGL support
- JavaScript enabled
- Pointer lock API support for full immersion

## Known Features
- Infinite terrain generation
- Destruction and placement mechanics
- Day/night cycle with dynamic lighting
- Particle effects on block destruction
- Sound effects for actions
- Comprehensive HUD display
- Multiple decorative and building materials
