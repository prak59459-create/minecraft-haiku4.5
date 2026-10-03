# Development Guide

## Project Structure

```
minecraft-haiku4.5/
├── index.html          # Main HTML file with HUD layout
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite bundler configuration
├── src/
│   ├── main.js         # Entry point with scene setup
│   ├── world.js        # Terrain generation and chunk management
│   ├── player.js       # Player controller and input handling
│   ├── physics.js      # Physics engine and collision detection
│   └── ui.js           # HUD and statistics display
├── README.md           # User documentation
└── DEVELOPMENT.md      # This file
```

## Key Components

### World.js
- **Terrain Generation**: Uses Perlin noise with multiple octaves
- **Chunk System**: 16×256×16 blocks per chunk with dynamic loading
- **Block Types**: Grass, Dirt, Stone, Wood, Leaves, Water, Sand
- **Mesh Optimization**: Face culling to reduce draw calls
- **Tree Generation**: Procedural tree placement using noise

### Player.js
- **Movement**: WASD with momentum-based acceleration
- **Camera**: Free-look with mouse (requires pointer lock)
- **Jumping**: Gravity-based with ground detection
- **Block Interaction**: Raycasting for placement/destruction
- **Block Selector**: 9 block types with visual feedback

### Physics.js
- **Gravity**: Constant acceleration downward
- **Collision Detection**: AABB collision with block grid
- **Response**: Separates player from blocks along proper axis
- **Ground Detection**: Detects when player is standing on solid ground

### Main.js
- **Scene Setup**: Three.js scene with proper lighting
- **Lighting**: Sun/moon cycle with dynamic intensity
- **Rendering**: WebGL with shadow mapping
- **Game Loop**: RAF-based animation with physics updates

## Performance Optimizations

1. **Chunk Culling**: Only loads chunks near player
2. **Mesh Optimization**: Combines block faces, removes internal faces
3. **Flat Shading**: Blocky appearance with simpler lighting
4. **Object Sorting**: Proper depth testing and rendering order
5. **Memory**: Uint8Array for block storage

## Future Enhancements

- Particle effects for block breaking
- Sound effects for actions
- More biome types
- Inventory and crafting system
- NPCs and mobs
- Multiplayer support
- Advanced lighting/shadow improvements
- Block textures instead of vertex colors
- Improved physics with sliding

## Development Workflow

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm build

# View built version
npm run preview
```

## Terrain Parameters

- **Sea Level**: Y=64
- **Chunk Size**: 16×256×16 blocks
- **View Distance**: 4 chunks in each direction
- **Noise Scale**: Multi-octave with scales of 0.04, 0.12, 0.25
- **Tree Threshold**: Noise > 0.4
- **Tree Density**: Proportional to terrain features

## Lighting System

- **Sun Cycle**: 10-minute full cycle (5 min day, 5 min night)
- **Moon**: Opposite sun position, visible at night
- **Ambient**: Adjusts with sun/moon intensity
- **Shadows**: 2048×2048 shadow maps with PCF filtering

## Known Limitations

- No texture system (vertex colors only)
- Simplified collision detection (AABB only)
- No liquid physics
- Limited LOD system
- Single-threaded chunk generation
