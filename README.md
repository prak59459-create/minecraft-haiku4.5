# Minecraft Clone - Haiku 4.5

A fully-functional 3D Minecraft-inspired game built with Three.js and Node.js. Features procedural terrain generation, dynamic lighting, block placement/destruction, and multiple biomes.

## Features

### Core Gameplay
- **WASD Movement** - Navigate the 3D world
- **Mouse Look** - Camera control with pointer lock
- **Block Placement** - Right-click to place blocks
- **Block Destruction** - Left-click to destroy blocks
- **Jumping** - Press Space to jump
- **Sprint/Crouch** - Hold Shift for faster movement or slower sneaking
- **Block Selection** - Press 1-9 or use scroll wheel to select from hotbar

### World Generation
- **Perlin Noise Terrain** - Procedurally generated landscape
- **Multiple Biomes** - Desert, Forest, Jungle, Snow, and Plains
- **Dynamic Chunks** - Chunks load/unload based on player position
- **Tree Generation** - Procedural tree placement in forests
- **9 Block Types** - Grass, Dirt, Stone, Wood, Leaves, Sand, Gravel, Cobblestone, Water

### Visual Features
- **Day/Night Cycle** - Dynamic sky colors and directional lighting
- **Particle Effects** - Block destruction particles
- **Shadow Mapping** - Realistic shadows from directional light
- **Proper Lighting** - Ambient and directional lighting with 3D shading
- **Water Rendering** - Semi-transparent water blocks
- **Block Highlighting** - Visual outline when looking at blocks

### Performance
- **Frustum Culling** - Only render visible chunks
- **Mesh Optimization** - Efficient face culling for block rendering
- **LOD System** - Distance-based rendering optimization
- **Chunk Caching** - Smart memory management for terrain

## Installation

### Requirements
- Node.js 14+
- npm or yarn

### Setup

```bash
# Clone or download the repository
cd minecraft-haiku4.5

# Install dependencies
npm install

# Start the server
npm start
```

The game will be available at `http://localhost:3000`

## Controls

| Key | Action |
|-----|--------|
| WASD | Move forward/backward/left/right |
| Mouse | Look around (click canvas to lock pointer) |
| Space | Jump |
| Shift | Sprint/Crouch |
| Left Click | Destroy block |
| Right Click | Place block |
| 1-9 | Select block from hotbar |
| Scroll Wheel | Cycle hotbar selection |

## Game Mechanics

### Block System
Nine different block types provide variety:
- **Grass** - Surface layer block
- **Dirt** - Common subsurface block
- **Stone** - Deep underground block
- **Wood** - Tree trunks (breakable)
- **Leaves** - Tree foliage (breakable)
- **Water** - Fluid blocks with transparency
- **Sand** - Desert biome surface
- **Gravel** - Mountain/cave material
- **Cobblestone** - Decorative stone variant

### Biome Variation
Different biomes generate unique terrain:
- **Desert** - Flat sand dunes, minimal vegetation
- **Forest** - Hilly terrain with trees
- **Jungle** - High terrain with dense trees
- **Snow** - High altitude with gravel surface
- **Plains** - Flat grassland terrain

### Physics
- **Gravity** - Realistic falling and jumping mechanics
- **Collision Detection** - Precise player-block collision
- **Block Placement** - Intelligent adjacent block detection
- **Water Interaction** - Can swim/walk through water

## Architecture

### File Structure
```
minecraft-haiku4.5/
├── server.js              # Express server
├── package.json           # Dependencies
└── public/
    ├── index.html        # Main page
    ├── game.js           # Core game loop
    ├── player.js         # Player controller
    ├── terrain.js        # Chunk & world system
    ├── biomes.js         # Biome generation
    ├── noise.js          # Perlin noise
    ├── particles.js      # Particle effects
    ├── water.js          # Water rendering
    └── optimization.js   # Performance utilities
```

### Key Classes

**World** - Manages chunk loading/unloading and block access
**Chunk** - Individual terrain chunks with mesh generation
**Player** - Player controller with physics and input handling
**BiomeGenerator** - Procedural biome and terrain generation
**ParticleSystem** - Block destruction effects
**Game** - Main game loop and scene management

## Performance Notes

- Chunks load/unload in a radius around the player
- Mesh generation happens asynchronously where possible
- Face culling removes hidden block faces from rendering
- LOD system reduces mesh complexity at distance
- Shadows use PCF filtering for smooth results

## Development

### Running in Development Mode
```bash
npm run dev
```

### Modifying Settings

Edit `public/terrain.js`:
- `CHUNK_SIZE` - Chunk dimensions
- `CHUNK_HEIGHT` - World height
- `TERRAIN_SCALE` - Terrain frequency
- `WATER_LEVEL` - Ocean water level

Edit `public/game.js`:
- `loadRadius` - How far chunks load
- Day/night cycle speed
- Lighting properties

## License

MIT

## Author

Generated with Claude Code