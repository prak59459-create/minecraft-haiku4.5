# Minecraft Clone - 3D Voxel Game

A fully-featured 3D Minecraft-inspired voxel game built with Three.js and WebGL.

## Features

### World Generation
- **Procedural Terrain**: Multi-octave Perlin noise generates infinite varied terrain
- **Cave Systems**: Natural 3D Perlin noise caves appear in stone layers
- **Tree Generation**: Procedurally generated trees with varied heights and canopies
- **Chunk System**: 16×16 block chunks with 128 block height
- **Render Distance**: 3 chunks around player for smooth gameplay
- **Biome Variety**: Different block types at different elevations (sand, gravel, grass, stone)

### Block Types
1. **Grass** - Top layer of grass-covered blocks
2. **Dirt** - Below grass, natural earth
3. **Stone** - Deep terrain
4. **Cobblestone** - Darker stone variant
5. **Wood** - Solid oak/birch/spruce logs
6. **Leaves** - Tree foliage with transparency
7. **Water** - Swimmable liquid with physics
8. **Sand** - Beach and desert blocks
9. **Gravel** - Mountain terrain
10. **Oak/Birch/Spruce Logs** - Different wood types

### Controls
- **WASD** - Move forward/back/left/right
- **Mouse** - Look around (pointer lock)
- **Space** - Jump / Swim up in water
- **Shift** - Sprint / Crouch
- **Left-Click** - Destroy blocks with particle effects
- **Right-Click** - Place blocks
- **1-9 / Scroll** - Select blocks from hotbar

### Gameplay Mechanics
- **Gravity & Physics**: Realistic falling and jumping
- **Collision Detection**: Precise block-level collision
- **Water Mechanics**: Swimming with reduced gravity and movement boost
- **Block Selection**: 8 block types available on hotbar
- **Raycasting**: Block highlighting and targeting
- **Particle Effects**: Color-matched destruction particles with physics

### Visual Features
- **Dynamic Lighting**: Day/night cycle with rotating sun
- **Shadow Mapping**: Realistic shadows throughout the world
- **Transparency**: Proper water and leaf transparency rendering
- **Fog**: Distance fog for performance and ambiance
- **Material System**: Vertex colors for varied appearance

### UI/UX
- **Crosshair**: Center screen targeting indicator
- **Hotbar**: Visual block selection bar at bottom
- **FPS Counter**: Real-time performance monitoring
- **Coordinates Display**: Current player position
- **Block Info**: Name and position of targeted block

### Audio
- **Sound Effects**: Web Audio API feedback for placement/destruction
- **Procedural Sounds**: Generated tones for different block types

## Performance

- **Optimized Rendering**: Separate opaque and transparent passes
- **Chunked Geometry**: Efficient BufferGeometry with face culling
- **Deferred Updates**: Async mesh building spreads load over frames
- **Memory Management**: Chunk unloading for distant areas
- **LOD System**: Render distance scaling for smooth gameplay

## Technical Details

### Technologies
- **Three.js** - 3D graphics and rendering
- **SimplexNoise.js** - Perlin noise for terrain generation
- **WebGL** - Hardware acceleration
- **Web Audio API** - Sound effects

### Browser Requirements
- Modern browser with WebGL 2.0 support
- Hardware acceleration enabled
- Pointer lock API support for mouse look

## Getting Started

1. Open `index.html` in a web browser
2. Click to lock pointer and start playing
3. Use controls to explore the world
4. Select blocks from the hotbar and build!

## Performance Tips

- **Adjust Render Distance**: Edit `renderDistance` in game.js
- **Reduce Chunk Size**: Smaller chunks use less memory
- **Update Limit**: Modify mesh update queue size in update()
- **Disable Shadows**: Comment out shadow mapping for faster rendering

## Future Enhancements

- Inventory system with crafting
- More block types (glass, obsidian, ore)
- Better tree generation with different tree types
- Mob system and NPCs
- Day/night sleep mechanics
- Hunger and health system
- More complex structures and generation
- Multiplayer support

## Development

To modify the game:
1. Edit `game.js` for game logic
2. Edit `index.html` for UI/styling
3. Adjust constants at top of `game.js` for tuning

## License

Open source - Free to modify and distribute