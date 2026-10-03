# Minecraft 3D Clone - Haiku 4.5

A fully functional 3D Minecraft-like game built with Three.js, featuring procedural terrain generation, block placement/destruction, day/night cycles, and dynamic lighting.

## Features

### Core Gameplay
- **3D World Exploration**: Navigate an infinite procedurally generated world
- **Block Interaction**: Place and destroy blocks with click-based controls
- **Inventory System**: Hotbar with 9 selectable blocks (keys 1-9 or scroll wheel)
- **Block Variety**: 11 different block types including stone, dirt, grass, wood, leaves, water, and more

### Player Controls
- **Movement**: WASD keys for directional movement
- **Camera**: Mouse look controls with pointer lock
- **Jumping**: Spacebar to jump (disabled when flying)
- **Sprint**: Hold Shift while moving to run faster
- **Crouch**: Ctrl to crouch (impacts collision height)
- **Flight Mode**: Press F to toggle creative flight mode

### World & Terrain
- **Procedural Generation**: Perlin noise-based terrain with realistic height variation
- **Chunk System**: 16x16x256 chunks that load/unload based on player position
- **Biome Variation**: Multiple terrain features at different heights
- **Tree Generation**: Natural tree placement with trunks and foliage

### Physics & Collisions
- **Gravity System**: Realistic falling and landing physics
- **Collision Detection**: Precise player-block collision testing
- **Raycasting**: Block targeting system for placement and destruction
- **Block Highlighting**: Visual feedback for targeted blocks

### Environment & Polish
- **Day/Night Cycle**: Dynamic 20-minute in-game day cycle
- **Dynamic Lighting**: Real-time sun position and sky color changes
- **Lighting System**: Sun and ambient lighting that adjusts with time
- **Fog Effects**: Distance-based fog for performance optimization

### UI & Debug
- **Crosshair**: Center-screen targeting reticle
- **Hotbar Display**: Visual block selector with active block highlighting
- **Debug Info**: FPS counter, player position, and loaded chunk count
- **Time Display**: Current in-game time with sun position indicator

### Performance
- **Chunk Rendering**: Efficient geometry batching and mesh generation
- **LOD System**: Render distance optimization for distant chunks
- **Particle Effects**: Block destruction particles with physics simulation
- **Memory Management**: Automatic chunk unloading and garbage collection

## How to Run

### Using npm
```bash
npm install
npm start
```

### Direct Browser
1. Open `index.html` in a modern web browser
2. Click to lock pointer
3. Use WASD to move, mouse to look around

### Requirements
- Modern browser with WebGL support
- JavaScript enabled
- Stable internet connection (for CDN resources)

## Controls Reference

| Control | Action |
|---------|--------|
| W | Move forward |
| A | Move left |
| S | Move backward |
| D | Move right |
| Mouse | Look around |
| Left Click | Destroy block |
| Right Click | Place block |
| Space | Jump |
| Shift | Sprint (hold while moving) |
| Ctrl | Crouch |
| F | Toggle flight mode |
| 1-9 | Select block in hotbar |
| Scroll Wheel | Cycle through hotbar |
| ESC | Unlock pointer |

## Game Statistics

- **Render Distance**: 8 chunks (128+ blocks)
- **Max Particles**: 5,000 simultaneous particles
- **Block Types**: 11 distinct block types
- **Terrain Height**: 50-120 blocks
- **Chunk Size**: 16×16×256 blocks per chunk
- **Day Length**: 1,200 frames (~20 seconds at 60 FPS)

## Architecture

- `index.html` - Main HTML container
- `css/style.css` - UI styling and layout
- `js/blocks.js` - Block type definitions and registry
- `js/player.js` - Player controller and physics
- `js/world.js` - World and chunk management
- `js/particles.js` - Particle system for effects
- `js/ui.js` - UI updates and input handling
- `js/main.js` - Game initialization and main loop

## Technical Details

### Dependencies
- **Three.js** (r128): 3D rendering engine
- **SimplexNoise**: Procedural noise generation

### Rendering
- WebGL with Three.js
- Standard materials with Phong lighting
- Shadow mapping for realistic lighting
- Fog for performance optimization

### Physics
- Gravity: 0.015 units per frame
- Jump Force: 0.6 units per frame
- Movement Speed: 0.15-0.25 units per frame
- Collision Radius: 0.3 units

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Limitations

- Water is currently non-interactive (visual only)
- No block textures (colors based on block type)
- No sound effects (prepared in UI structure)
- Limited to 5,000 particles at once
- No multiplayer/networking

## Future Enhancements

- [ ] Block textures and UV mapping
- [ ] Water physics and swimming
- [ ] Sound effects and music
- [ ] Item drops and collection
- [ ] Inventory management UI
- [ ] Crafting system
- [ ] More block types and biomes
- [ ] Multiplayer support

## Performance Tips

1. **Reduce Render Distance**: Edit `RENDER_DISTANCE` in blocks.js
2. **Lower Particle Limit**: Edit `maxParticles` in particles.js
3. **Disable Shadows**: Comment out shadowMap settings in main.js
4. **Resolution**: Browser zoom (Ctrl +/-) affects performance

## License

This is a fan project created for educational purposes.

---

Built with Three.js | Powered by Claude AI
