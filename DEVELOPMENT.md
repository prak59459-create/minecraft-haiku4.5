# Development Guide

## Project Structure

```
minecraft-haiku4.5/
├── src/
│   ├── main.ts              # Entry point
│   ├── player/              # Player controller & input handling
│   ├── world/               # World generation & terrain
│   ├── renderer/            # Three.js rendering setup
│   ├── ui/                  # UI components and HUD
│   ├── physics/             # Collision detection & physics
│   ├── fx/                  # Particle effects
│   ├── audio/               # Sound effects
│   └── util/                # Utilities & stats
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

## Module Descriptions

### `src/main.ts`
- Initializes all game systems
- Runs the main animation loop
- Coordinates updates between systems

### `src/player/player.ts`
- **Controls**: WASD movement, mouse look, jumping
- **Physics**: Velocity-based movement with gravity
- **Interaction**: Block placement/destruction raycasting
- **Features**: Sprint mode, pointer lock

### `src/world/`
- **world.ts**: World manager, chunk handling, block operations
- **chunk.ts**: Chunk structure, mesh generation, block storage
- **perlin.ts**: Procedural terrain generation with Perlin noise
- **blocks.ts**: Block type definitions and properties
- **environment.ts**: Day/night cycle and dynamic lighting

### `src/renderer/renderer.ts`
- Three.js scene setup
- Lighting configuration (ambient + directional)
- Shadow map setup
- Viewport management

### `src/ui/ui.ts`
- HUD rendering and updates
- Block hotbar display
- Crosshair rendering
- Info panel with player stats

### `src/physics/collision.ts`
- AABB collision testing
- Collision resolution
- Ground detection

### `src/fx/particles.ts`
- Block destruction particle effects
- Physics-based particle movement
- Particle lifecycle management

### `src/audio/sound.ts`
- Procedural audio generation
- Sound effects for interactions
- Jump and landing sounds

### `src/util/stats.ts`
- FPS monitoring
- Memory usage tracking
- Performance metrics display

## Adding New Features

### Adding a New Block Type

1. Add to `BLOCK_TYPES` in `src/world/blocks.ts`:
```typescript
export const BLOCK_TYPES = {
  WATER: 6,
  CUSTOM: 7,  // New block
};
```

2. Update `BLOCK_NAMES`:
```typescript
export const BLOCK_NAMES: { [key: number]: string } = {
  7: 'Custom Block',
};
```

3. Add color in `src/world/chunk.ts` `buildMesh()`:
```typescript
const textures: { [key: number]: [number, number, number] } = {
  7: [1.0, 0.5, 0.25],  // Custom orange color
};
```

4. Update terrain generation in `src/world/perlin.ts` if needed

### Adding a New Sound Effect

1. Add method to `SoundManager` in `src/audio/sound.ts`:
```typescript
playCustomSound(frequency: number = 440) {
  if (!this.enabled || !this.audioContext) return;
  
  const now = this.audioContext.currentTime;
  const osc = this.audioContext.createOscillator();
  const gain = this.audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(this.audioContext.destination);
  
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  osc.start(now);
  osc.stop(now + 0.2);
}
```

2. Call from appropriate location (e.g., in player or world class)

### Adding UI Elements

1. Add HTML to `index.html` if needed
2. Add styling to the `<style>` block
3. Add update logic to `src/ui/ui.ts` `update()` method

## Building for Production

```bash
npm run build
```

Creates optimized build in `dist/` directory.

## Debugging Tips

1. **Visual Debugging**:
   - Use Chrome DevTools camera rotation to inspect world
   - Look for wireframe rendering (Ctrl+Shift+I, then three.js tools)

2. **Console Logging**:
   - Add `console.log()` in TypeScript files
   - Check browser console for messages

3. **Performance Profiling**:
   - Use Chrome DevTools Performance tab
   - Look for frame time violations (>16.67ms at 60 FPS)

4. **Memory Leaks**:
   - Monitor heap size in Stats panel
   - Use DevTools Memory profiler for heap snapshots

## Common Issues

### "Cannot read property 'x' of undefined"
- Player position might not be initialized
- Check that world.initialize() completes before game loop starts

### Low FPS / Stuttering
- Reduce RENDER_DISTANCE in world.ts
- Disable shadows: `renderer.shadowMap.enabled = false`
- Profile with DevTools to find bottleneck

### Blocks not appearing
- Check chunk generation is complete
- Verify Perlin noise is returning valid heights
- Check block colors in chunk.ts textures object

### Audio not playing
- Requires user interaction to start (browser autoplay policy)
- Check browser console for audio context errors
- Verify SoundManager is instantiated

## Testing

Currently no automated tests. To test manually:
1. Run `npm run dev`
2. Test each control (WASD, space, mouse, clicks)
3. Check block placement/destruction
4. Verify audio plays on block interactions
5. Monitor performance with stats display

## Next Steps for Enhancement

- [ ] Add more block types
- [ ] Implement water physics
- [ ] Add inventory system
- [ ] Create command block system
- [ ] Add multiplayer support
- [ ] Implement mod API
- [ ] Add more detailed textures
- [ ] Create custom shader materials
