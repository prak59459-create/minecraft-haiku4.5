# Development Guide

## Project Structure

```
minecraft-haiku4.5/
├── src/
│   ├── main.js                 # Application entry point
│   ├── player/
│   │   ├── Player.js           # Player mechanics and state
│   │   └── Inventory.js        # Inventory management
│   ├── input/
│   │   └── InputManager.js     # Input handling
│   ├── world/
│   │   ├── ChunkManager.js     # Chunk management
│   │   ├── Chunk.js            # Individual chunk rendering
│   │   ├── BlockType.js        # Block definitions
│   │   ├── TerrainGenerator.js # Procedural terrain
│   │   ├── BiomeGenerator.js   # Biome system
│   │   ├── TreeGenerator.js    # Tree generation
│   │   ├── BlockHighlight.js   # Target block highlight
│   │   └── WaterShader.js      # Water effects
│   ├── environment/
│   │   ├── Lighting.js         # Day/night cycle
│   │   └── Weather.js          # Weather system
│   ├── effects/
│   │   └── ParticleSystem.js   # Particle effects
│   ├── physics/
│   │   └── CollisionDetector.js # Collision detection
│   ├── ui/
│   │   ├── UI.js               # HUD management
│   │   └── Hotbar.js           # Hotbar display
│   ├── config/
│   │   └── Settings.js         # Game settings
│   ├── debug/
│   │   └── DebugMode.js        # Debug utilities
│   └── utils/
│       ├── Sound.js            # Audio system
│       ├── Performance.js       # Performance monitoring
│       ├── SaveManager.js       # Save/load system
│       ├── Profiler.js          # Execution profiling
│       ├── ChunkCache.js        # Caching system
│       ├── Logger.js            # Logging utility
│       ├── ResourceManager.js   # Asset management
│       ├── GameState.js         # State management
│       ├── InputBinder.js       # Key binding
│       ├── Statistics.js        # Stats tracking
│       ├── CameraController.js  # Camera effects
│       └── Constants.js         # Configuration
├── index.html                  # Main HTML file
├── package.json                # Dependencies
├── vite.config.js              # Build configuration
└── README.md                   # User documentation
```

## Setting Up Development Environment

### 1. Install Dependencies

```bash
npm install
```

This installs:
- **three**: 3D graphics library
- **simplex-noise**: Terrain generation
- **vite**: Development server and build tool

### 2. Start Development Server

```bash
npm run dev
```

This starts the Vite development server, usually at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

Creates optimized production files in the `dist/` directory.

## Key Concepts

### Chunk System

Chunks are 16×16×64 block sections that divide the world into manageable units.

- **Loading**: Chunks load/unload based on player position (render distance = 8 chunks)
- **Rendering**: Only visible faces are rendered (face culling)
- **Memory**: Chunk data stored in Uint8Array for efficiency

### Physics

- **Gravity**: 0.08 units/frame
- **Collision**: AABB-based with cylinder approximation
- **Raycasting**: Line-of-sight for block targeting

### Terrain Generation

Multi-octave Perlin noise generates terrain:
- Layer 1 (0.005 scale): Large-scale terrain features
- Layer 2 (0.05 scale): Medium-scale variation
- Layer 3 (0.1 scale): Fine-detail features

### Day/Night Cycle

- Completes every ~14 minutes of gameplay
- Dynamically adjusts lighting and sky color
- Supports sunrise/sunset transitions

## Adding New Features

### Adding a New Block Type

1. Add to `BlockType.js`:
```javascript
export const BlockType = {
    // ... existing blocks
    NEW_BLOCK: 11,
    // ... add color in getColor()
    // ... add name in getName()
};
```

2. Use in terrain generation or place manually.

### Adding a New Tool/Item

1. Create item definition in inventory system
2. Add interaction logic in Player.js
3. Update hotbar and UI

### Adding Particles

```javascript
this.particles.createDestructionParticles(position, blockType);
```

### Adding Sound Effects

```javascript
this.soundManager.playTone(frequency, duration);
```

## Performance Optimization

### Profiling

Use the built-in Profiler:
```javascript
this.profiler.start('label');
// ... code to measure
this.profiler.end('label');
this.profiler.printReport();
```

### Debug Mode

Press **F3** to open debug panel showing:
- FPS
- Position
- Chunk count
- Memory usage
- Execution times

### Optimization Techniques

1. **Chunk Cache**: LRU cache with configurable size
2. **Face Culling**: Only render visible faces
3. **Vertex Colors**: Avoid texture lookups
4. **Draw Call Reduction**: Batch geometry where possible
5. **LOD**: Distant chunks render simpler geometry

## Testing

### Manual Testing Checklist

- [ ] Player movement in all directions
- [ ] Block placement and destruction
- [ ] Chunk loading/unloading
- [ ] Day/night cycle transitions
- [ ] Collision detection
- [ ] Sound effects
- [ ] Particle effects
- [ ] Block selection (1-9, scroll)
- [ ] Jump and sprint mechanics
- [ ] Camera look around

### Performance Testing

1. Enable debug mode (F3)
2. Monitor FPS, chunk count, and draw calls
3. Test with various render distances
4. Profile with browser DevTools

## Common Issues

### Low FPS

- Reduce render distance in Settings
- Disable particles
- Check browser hardware acceleration
- Close other applications

### Memory Issues

- Monitor chunk count (should stay within render distance)
- Clear debug panel logs
- Use ChunkCache efficiently

### Physics Issues

- Verify collision detection is enabled
- Check gravity constant
- Test with simple geometry first

## Extending the System

### Adding Multiplayer

1. Implement WebSocket communication
2. Synchronize player positions
3. Handle block updates across clients
4. Implement conflict resolution

### Adding Mobs/NPCs

1. Create entity system
2. Implement AI pathfinding
3. Add animations
4. Handle spawning/despawning

### Adding Crafting

1. Define recipes
2. Create crafting UI
3. Implement recipe validation
4. Handle inventory updates

## Code Style Guidelines

- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Comments**: Only for non-obvious logic
- **Imports**: ES6 modules
- **Error Handling**: Try-catch for critical operations
- **Performance**: Profile before optimizing

## Resources

- Three.js Documentation: https://threejs.org/docs/
- Minecraft Wiki: https://minecraft.wiki/
- WebGL: https://khronos.org/webgl/
- Vite: https://vitejs.dev/

## Contributing

When submitting improvements:
1. Test thoroughly
2. Profile performance impact
3. Update documentation
4. Follow code style
5. Write clear commit messages

## Support

For issues or questions:
1. Check the README
2. Enable debug mode (F3)
3. Review browser console for errors
4. Check GitHub issues
