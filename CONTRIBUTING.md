# Contributing to Minecraft Haiku Clone

Thank you for your interest in contributing to this project! This document provides guidelines for development.

## Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- A modern code editor (VS Code recommended)

### Getting Started
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open http://localhost:5173 in your browser

## Project Structure

```
minecraft-haiku4.5/
├── src/
│   ├── main.js                 # Entry point
│   ├── Game.js                 # Main game class
│   ├── Player.js               # Player controller
│   ├── WorldManager.js         # World and chunk management
│   ├── BlockSystem.js          # Block definitions
│   ├── TerrainGenerator.js     # Procedural terrain
│   ├── CameraController.js     # Camera management
│   ├── LightingSystem.js       # Lighting and day/night
│   ├── InputManager.js         # Input handling
│   ├── Settings.js             # Game configuration
│   ├── PerformanceMonitor.js   # Performance tracking
│   ├── EventBus.js             # Event system
│   ├── AssetManager.js         # Resource management
│   └── ParticleSystem.js       # Visual effects
├── index.html                  # Main HTML file
├── package.json                # Dependencies
├── vite.config.js              # Build configuration
├── README.md                   # User documentation
└── CONTRIBUTING.md             # This file
```

## Code Style

### Naming Conventions
- Classes: PascalCase (e.g., `WorldManager`)
- Functions: camelCase (e.g., `updateChunks`)
- Constants: UPPER_SNAKE_CASE (e.g., `CHUNK_SIZE`)
- Private methods: Prefix with underscore (e.g., `_processData`)

### File Organization
- One main export per file
- Group related functions together
- Keep files under 500 lines when possible
- Add JSDoc comments for public methods

### ES6+ Standards
- Use `import`/`export` for modules
- Use `const`/`let` instead of `var`
- Use arrow functions where appropriate
- Use template literals for string interpolation

## Performance Guidelines

### Optimization Tips
1. **Chunk Management**
   - Properly dispose of off-screen chunk geometries
   - Use indexed geometry for reduced vertex count
   - Implement view frustum culling

2. **Physics**
   - Cache frequently calculated vectors
   - Use vector reuse instead of creating new instances
   - Profile with PerformanceMonitor

3. **Rendering**
   - Face culling for invisible block faces
   - Flat shading reduces light calculations
   - Use proper LOD techniques for distant chunks

4. **Memory**
   - Dispose of Three.js objects (geometries, materials)
   - Clear maps and arrays when no longer needed
   - Monitor heap size with PerformanceMonitor

## Adding Features

### Adding a New Block Type
1. Add to `BlockSystem.js`:
   ```javascript
   11: { name: 'obsidian', color: 0x0a0a0a, solid: true }
   ```
2. Update terrain generation in `TerrainGenerator.js` if needed
3. Update UI selector in `Game.js`

### Adding a New Game System
1. Create a new file in `src/` (e.g., `src/NewSystem.js`)
2. Implement your system class
3. Integrate with `Game.js`
4. Use `EventBus` for inter-system communication

### Modifying Terrain Generation
- Edit `TerrainGenerator.js` methods
- Adjust Perlin noise scales and amplitudes
- Test with multiple seeds
- Profile for performance impact

## Testing

### Manual Testing Checklist
- [ ] Chunks load and unload properly
- [ ] No memory leaks during extended play
- [ ] FPS remains stable (60+)
- [ ] Block placement/destruction works correctly
- [ ] Day/night cycle operates smoothly
- [ ] Controls are responsive
- [ ] UI displays correctly at different resolutions

### Performance Testing
1. Use PerformanceMonitor to track metrics
2. Test with various render distances
3. Monitor memory usage over time
4. Check FPS with many visible chunks

## Debugging

### Built-in Tools
- **FPS Counter**: Top-left corner shows frame rate
- **Chunk Counter**: Displays loaded chunk count
- **Position Display**: Shows player coordinates
- **PerformanceMonitor**: Track detailed metrics

### Console Commands
- Open browser DevTools (F12)
- Access game state: `window.game`
- Check player position: `window.game.player.position`
- Monitor world: `window.game.world`

## Git Workflow

### Commit Messages
Use clear, descriptive commit messages:
```
Add day/night cycle implementation

- Implement 30-second day/night cycle
- Add sky color transitions
- Update ambient and directional lighting
- Add time-of-day tracking in LightingSystem
```

### Pull Requests
1. Keep changes focused and atomic
2. Test thoroughly before submitting
3. Update documentation as needed
4. Reference any related issues

## Performance Targets

Aim for these metrics:
- **FPS**: 60+ on modern hardware
- **Chunk Load Time**: <100ms per chunk
- **Memory**: <100MB typical usage
- **Startup Time**: <2 seconds

## Documentation

### Adding Comments
```javascript
// Only comment WHY, not WHAT - the code shows WHAT
// Needed because Three.js doesn't auto-dispose on scene.remove()
geometry.dispose();
```

### JSDoc Format
```javascript
/**
 * Updates the world chunks based on player position
 * @param {THREE.Vector3} playerPos - Current player position
 */
updateChunks(playerPos) {
  // implementation
}
```

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Minecraft Wiki](https://minecraft.fandom.com/)
- [WebGL Best Practices](https://www.khronos.org/webgl/wiki/Best_Practices)

## Questions or Issues?

- Check existing documentation
- Review similar implementations in codebase
- File an issue with clear description
- Include performance metrics if relevant

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing!
