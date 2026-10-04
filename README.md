# Minecraft Clone - Haiku 4.5

A fully-featured, production-quality 3D Minecraft clone built with Three.js, featuring procedural terrain generation, physics simulation, dynamic environments, and extensive gameplay features.

## Features

### Core Gameplay
- **3D World**: Rendered using Three.js with proper lighting and shadows
- **Procedural Terrain**: Infinite world generation using 3D Perlin noise
- **Block System**: 10 different block types (grass, dirt, stone, wood, leaves, water, sand, gravel, coal ore, iron ore)
- **Block Interaction**: Place and destroy blocks with left/right click
- **Chunk System**: Optimized chunk loading/unloading with 5x5 chunk render window
- **Biome System**: Three biome types (hot/desert, wet/forest, normal/plains) with terrain variation
- **Cave Generation**: Procedural cave systems using 3D noise for exploration
- **Tree Generation**: Automatic tree spawning in forest biomes
- **Ore Deposits**: Iron and coal ore deposits at varying depths

### Advanced Physics
- **Gravity System**: Realistic falling and jumping mechanics
- **Water Mechanics**: Reduced gravity and velocity damping in water
- **Collision Detection**: Precise block-based collision with terrain clamping
- **Flight Mode**: Creative mode-like flight for exploration (Press F)
- **Acceleration/Friction**: Smooth movement with realistic feeling

### Controls
- **Movement**: WASD keys with smooth acceleration
- **Camera Look**: Mouse movement with pointer lock
- **Jump**: Space bar (gravity mode) or fly up (flight mode)
- **Sprint/Crouch**: Hold Shift (sprint when moving, crouch when stationary)
- **Flight Toggle**: Press F to toggle flight mode
- **Block Destruction**: Left-click with audio feedback
- **Block Placement**: Right-click with distance checking
- **Block Selection**: Number keys 1-9 or mouse scroll wheel

### Visual Effects & Environment
- **Day/Night Cycle**: Dynamic 20-minute cycle with smooth transitions
- **Dynamic Lighting**: Sun moves and changes intensity throughout day
- **Starfield**: Stars appear at night with opacity transitions
- **Fog System**: Distance-based fog for performance and atmosphere
- **Shadows**: Real-time shadow mapping for depth and realism
- **Particle System**: Block destruction particles with physics
- **Materials**: PBR materials with color, roughness, and metalness properties

### User Interface
- **Crosshair**: Center screen targeting
- **Block Selector**: Visual selector bar with color-coded blocks
- **Selected Block Display**: Shows currently selected block with color
- **Flight Mode Indicator**: Yellow indicator when in flight mode
- **Block Tooltip**: Hover information showing block type and distance
- **Performance Stats**: FPS, chunk count, particle count, memory usage
- **Info Panel**: Controls and help text
- **Position Display**: Real-time player position, chunk, and biome info

## How to Play

### Getting Started
1. Open `index.html` in a modern web browser
2. Click anywhere on the screen to enable pointer lock and start playing
3. The game will start at coordinates (50, 80, 50) above the terrain

### Basic Gameplay
1. **Explore**: Use WASD to move, mouse to look around
2. **Destroy Blocks**: Left-click on blocks to destroy them and collect resources
3. **Place Blocks**: Right-click on adjacent blocks to place your selected block
4. **Select Blocks**: Use number keys 1-9 or scroll wheel to switch block types
5. **Sprint**: Hold Shift while moving to sprint faster
6. **Crouch**: Hold Shift while standing still to crouch lower
7. **Jump**: Press Space to jump (press Space again mid-air for consecutive jumps)

### Advanced Features
- **Flight Mode**: Press F to toggle creative flight mode - explore freely without gravity
- **Block Information**: Hover over blocks to see their type, position, and distance
- **Performance Monitoring**: Check FPS and memory usage in the stats panel
- **Biome Exploration**: Travel to find different biomes with unique terrain and resources

## Technical Implementation

### Technologies
- **Three.js r128**: 3D WebGL rendering engine
- **SimplexNoise**: JavaScript implementation of Perlin noise for procedural generation
- **Web Audio API**: Sound effects and feedback

### Architecture Highlights
- **Chunk System**: 16x16x128 block chunks for efficient memory and rendering
  - Dynamic loading/unloading based on player position (5x5 chunk window)
  - Automatic garbage collection for distant chunks
  
- **Terrain Generation**: Multi-layered Perlin noise
  - Base height map for terrain shape
  - Biome noise for climate variation
  - Cave noise for underground caverns
  - Ore deposit randomization
  
- **Physics System**: 
  - Gravity and velocity-based movement
  - Collision detection with block grid
  - Water physics with buoyancy
  - Flight mode with boundary clamping
  
- **Rendering Optimization**:
  - Material reuse across identical block types
  - Shadow map rendering for realistic lighting
  - Distance-based fog for performance
  - Frustum culling via Three.js default behavior

### Performance Metrics
- **FPS**: Real-time frame rate display
- **Memory**: JavaScript heap usage tracking
- **Chunks**: Active loaded chunks counter
- **Particles**: Active destruction particles counter

## Browser Compatibility

Requires a modern browser with WebGL support:
- **Chrome/Chromium**: 60+
- **Firefox**: 55+
- **Safari**: 15+
- **Edge**: 79+

WebGL 2.0 recommended for best performance.

## Planned Enhancements
- Advanced sound effects (footsteps, ambient music, block-specific sounds)
- Water flow and swimming mechanics
- Inventory system with crafting
- Multiple game modes (survival, creative, adventure)
- Mob system with basic AI
- Better terrain biomes (tundra, jungle, ocean)
- Redstone and circuits system
- Building mode with undo/redo
- Multiplayer synchronization
- Custom world generation settings