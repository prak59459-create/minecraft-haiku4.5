# Minecraft Clone - 3D Voxel Game

A full-featured 3D Minecraft clone built with Three.js, featuring procedural terrain generation, block interaction, physics, and a complete UI system.

## Features

### Core Gameplay
- **Procedural Terrain Generation**: Uses Perlin noise for infinite, varied terrain
- **Block Types**: Grass, Dirt, Stone, Wood, Leaves, Water, Sand, Gravel, Lava, and Bedrock
- **Chunk System**: Dynamic chunk loading/unloading for efficient memory usage
- **Tree Generation**: Procedurally generated trees with trunks and foliage

### Player Interaction
- **Block Breaking**: Left-click to destroy blocks
- **Block Placement**: Right-click to place blocks from your inventory
- **Block Selection**: Use 1-9 keys or scroll wheel to select block types
- **Flight Mode**: Press F to toggle flight mode for creative exploration

### Controls & Physics
- **Movement**: WASD for movement in cardinal directions
- **Camera**: Mouse look (click to enable pointer lock)
- **Jump**: Spacebar to jump (in survival mode)
- **Sprint**: Hold Shift to run faster
- **Flight**: Use Shift and Space to move up/down when flying

### Visual Features
- **Day/Night Cycle**: Dynamic sun positioning with lighting changes
- **Shadow Mapping**: Realistic shadows from the sun
- **Block Variation**: Subtle color variation on blocks based on position
- **Particle Effects**: Visual feedback for block breaking and placement
- **HUD Display**: FPS counter, coordinates, chunk count, day/night indicator
- **Help Overlay**: Press H to view controls

### Audio
- **Sound Effects**: Web Audio API for block breaking and placement sounds
- **Dynamic Audio**: Different pitches for break and place actions

## Project Structure

```
minecraft-haiku4.5/
├── index.html           # Main HTML file
├── package.json         # Project dependencies
├── vite.config.js       # Vite build configuration
├── src/
│   ├── main.js         # Entry point
│   ├── Game.js         # Main game orchestrator
│   ├── World.js        # World management & chunk handling
│   ├── Chunk.js        # Individual chunk generation & meshing
│   ├── Player.js       # Player controller & physics
│   ├── Interaction.js  # Block interaction & raycasting
│   ├── BlockTypes.js   # Block definitions & properties
│   ├── UI.js          # HUD and UI management
│   └── styles.css     # UI styling
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Then open your browser to the development server URL (typically `http://localhost:5173`).

## Technical Details

### Technologies Used
- **Three.js**: 3D rendering engine
- **Vite**: Build tool and development server
- **simplex-noise**: Procedural terrain generation
- **Web Audio API**: Sound effects
- **Vanilla JavaScript**: Pure ES6 modules

### Terrain Generation
The terrain uses three octaves of Perlin noise at different scales to create varied, interesting landscapes:
- Large scale (0.01): Mountain ranges and valleys
- Medium scale (0.05): Hills and terrain features
- Small scale (0.1): Local detail and variation

### Chunk System
- Chunks are 16×16×256 blocks
- Dynamic loading/unloading based on player position
- Render distance: 5 chunks in each direction (configurable)
- Efficient frustum culling and visibility management

### Optimization Techniques
- Chunk-based mesh generation (not per-block)
- Greedy meshing (faces only rendered where exposed)
- Buffer geometry reuse across chunks
- Flat shading for consistent blocky aesthetic
- Shadow maps for efficient lighting

## Gameplay Tips

1. **Finding Resources**: Higher terrain has stone and grass; lower areas have sand and dirt
2. **Building**: Collect wood from trees to start building
3. **Exploration**: Use flight mode (F) to explore freely without gravity constraints
4. **Block Selection**: The hotbar at the bottom shows your 9 available block types
5. **Precision**: Use raycasting for accurate block placement through the crosshair

## Browser Compatibility

- Chrome/Chromium 60+
- Firefox 55+
- Safari 11+
- Edge 79+

Requires WebGL 2.0 support and modern ES6 JavaScript features.

## Performance

- Target: 60 FPS on modern hardware
- Chunk generation: ~10-20ms per chunk
- Memory: Scales with render distance (typically 50-200MB)
- Optimizations: LOD chunks, frustum culling, efficient meshing

## Future Enhancements

- Biome system (desert, forest, mountain, ocean)
- Liquid simulation (water/lava flow)
- Inventory system with quantities
- Crafting and tools
- Mobs and enemies
- Multiplayer networking
- Smooth lighting and ambient occlusion
- Block textures with UV mapping