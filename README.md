# Minecraft Clone - Haiku 4.5

A fully-featured 3D Minecraft clone built with Three.js and vanilla JavaScript. Experience procedurally generated terrain, dynamic lighting, block interaction, and smooth first-person gameplay.

## Features

### Terrain & World
- **Procedural Terrain Generation**: Multi-scale Perlin noise for realistic terrain
- **Chunk System**: 16x16 blocks per chunk with dynamic loading/unloading
- **Biome System**: Forest, plains, desert, and cold biomes with unique characteristics
- **Block Types**: 9 different block types including dirt, grass, stone, wood, leaves, water, sand, gravel, and cobblestone
- **Tree Generation**: Biome-specific tree generation with proper spacing

### Player Controls
- **WASD**: Move forward, left, backward, right
- **Mouse**: Look around (click to lock mouse)
- **Space**: Jump
- **Shift**: Sprint (2x movement speed)
- **Control/C**: Crouch (0.5x movement speed)
- **Left Click**: Destroy blocks
- **Right Click**: Place blocks
- **1-9 / Scroll**: Select block type

### Physics & Collision
- **Gravity System**: Realistic falling with proper acceleration
- **Ground Friction**: Smooth walking with deceleration
- **Air Resistance**: Affects movement in air
- **Collision Detection**: Proper player-terrain collision
- **Block Raycasting**: Accurate block targeting for interaction

### Graphics & Lighting
- **Day/Night Cycle**: Dynamic 30-second day/night cycle
- **Dynamic Lighting**: Sun position and intensity changes throughout the day
- **Sky Color Transitions**: Realistic sky color changes based on time
- **Fog Effects**: Distance fog for atmospheric effect
- **Shadows**: Shadow-mapped directional lighting
- **Flat Shading**: Clean blocky aesthetic

### UI
- **Crosshair**: Centered crosshair for block targeting
- **Block Selector**: Hot bar at bottom with selected block highlight
- **Debug Info**: FPS counter, chunk count, and player position
- **Control Instructions**: On-screen help text

## Installation & Setup

### Prerequisites
- Node.js and npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## Architecture

### Core Components

#### Game.js
Main game coordinator that manages:
- Scene setup and lighting
- UI initialization
- Game loop and FPS counter
- Day/night cycle management
- Block selection

#### WorldManager.js
Handles terrain and world state:
- Chunk generation and management
- Block storage and retrieval
- Mesh building with optimized geometry
- Dynamic chunk loading/unloading
- Block placement and destruction

#### Player.js
First-person player controller with:
- Input handling (keyboard and mouse)
- Physics simulation
- Raycasting for block interaction
- Movement and jumping
- Pointer lock management

#### TerrainGenerator.js
Procedural terrain generation:
- Perlin noise-based height generation
- Biome determination
- Block placement logic
- Tree generation

#### BlockSystem.js
Block type definitions and properties:
- Block registry with colors and properties
- Solidity checking
- Block name and color mapping

#### ParticleSystem.js
Visual effects system:
- Destruction particle generation
- Particle physics simulation

## Performance Optimizations

- **Indexed Geometry**: Uses index buffers to reduce vertex count by ~60%
- **Face Culling**: Only renders visible block faces
- **Chunk-based Rendering**: Loads/unloads chunks based on player distance
- **Flat Shading**: Reduces lighting calculations
- **Geometry Disposal**: Proper cleanup of unused meshes
- **Render Distance**: Configurable render distance for performance

## Game Mechanics

### Block Interaction
- **Destroy**: Left-click a block to remove it
- **Place**: Right-click in the air to place a selected block
- **Selection**: Use 1-9 keys or scroll wheel to select blocks

### Terrain Features
- **Water**: Generates at height 40
- **Trees**: Generate naturally in forests and plains
- **Vegetation**: Leaves above tree trunks
- **Varied Terrain**: Mountains, valleys, and plains

### Day/Night Cycle
- **Cycle Duration**: 30 seconds per full day
- **Dynamic Lighting**: Sun moves and changes intensity
- **Sky Color**: Transitions from blue (day) to dark (night)
- **Ambient Lighting**: Adjusts based on time of day

## Browser Compatibility

Requires a modern browser with WebGL support:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

- [ ] Sound effects and background music
- [ ] Inventory system
- [ ] Caves and underground generation
- [ ] More block types and textures
- [ ] Mobs and creatures
- [ ] Survival mechanics (hunger, health)
- [ ] Creative and survival modes
- [ ] Multiplayer support
- [ ] Advanced shader effects

## License

MIT License - Feel free to use and modify this project.

## Credits

Built with:
- [Three.js](https://threejs.org/) - 3D graphics library
- [Simplex Noise](https://github.com/jwagner/simplex-noise.js) - Procedural noise generation
- [Vite](https://vitejs.dev/) - Build tool and dev server
