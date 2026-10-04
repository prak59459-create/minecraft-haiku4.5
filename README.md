# Minecraft Clone - Haiku 4.5

A complete 3D Minecraft-like game built with Three.js featuring procedural terrain generation, block placement/destruction, and realistic physics.

## Features

### Core Gameplay
- **Terrain Generation**: Procedural Perlin noise-based terrain with varied biomes
- **Block System**: 12+ different block types (Grass, Dirt, Stone, Wood, Leaves, Water, Sand, etc.)
- **Block Interactions**: 
  - Left-click to destroy blocks
  - Right-click to place blocks
  - Hotbar with 9 slots (1-9 keys or scroll wheel)
- **Physics**: Gravity, jumping, collision detection
- **Movement**: WASD for movement, Mouse for look, Space to jump, Shift to sprint

### Graphics & Polish
- Dynamic day/night cycle with sun movement
- Directional lighting with shadow mapping
- Smooth camera movement with mouse look
- Particle effects for block destruction
- Crosshair and block coordinate display
- Real-time performance metrics (FPS, position, chunk count)

### Audio
- Web Audio API sound effects
- Block break and place sounds
- Footstep sounds (ready to implement)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/prak59459-create/minecraft-haiku4.5.git
cd minecraft-haiku4.5
```

2. Install dependencies:
```bash
npm install
```

### Running the Game

#### Development Mode
```bash
npm run dev
```
This starts a local development server at `http://localhost:3000` with hot-reload.

#### Production Build
```bash
npm run build
```
This creates an optimized build in the `dist/` directory.

#### Preview Build
```bash
npm run preview
```
This previews the production build locally.

## Controls

| Key | Action |
|-----|--------|
| `W` | Move Forward |
| `A` | Move Left |
| `S` | Move Backward |
| `D` | Move Right |
| `Space` | Jump |
| `Shift` | Sprint |
| `1-9` | Select block in hotbar |
| `Scroll Wheel` | Cycle through hotbar |
| `Left Click` | Destroy block |
| `Right Click` | Place block |
| `Mouse Move` | Look around |
| `J` | Jump to height (debug) |

## Project Structure

```
src/
├── main.js          # Main game loop and Three.js setup
├── player.js        # Player controller and movement
├── world.js         # Terrain generation and chunk management
├── physics.js       # Collision detection and gravity
├── blocks.js        # Block system and definitions
├── ui.js            # User interface and HUD
├── particles.js     # Particle effects system
└── sounds.js        # Audio effects manager

index.html          # Main HTML entry point
vite.config.js      # Vite build configuration
package.json        # Project dependencies
```

## Technical Details

### Rendering
- Three.js WebGL renderer
- Chunk-based world with dynamic loading/unloading
- Face culling optimization for better performance
- Vertex-colored blocks for visual variation
- Shadows with PCF shadow mapping

### Terrain
- SimplexNoise for natural-looking terrain
- Chunk size: 16×128×16 blocks
- Render distance: 8 chunks in each direction
- Procedural tree generation
- Water level at Y=62

### Physics
- Gravity: 20 units/second²
- Jump force: 8 units/second
- Walk speed: 4.3 units/second
- Sprint speed: 5.6 units/second
- Collision detection with step-by-step resolution

## Performance

- FPS Counter: Top-left corner
- Chunk statistics in debug info
- Memory-efficient chunk management with unloading
- Optimized mesh generation

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL 2.0 and modern JavaScript ES6+ support.

## Future Improvements

- [ ] Inventory system
- [ ] Crafting recipes
- [ ] More block types and textures
- [ ] Mobs and enemies
- [ ] Multiplayer support
- [ ] Texture mapping
- [ ] Water physics and swimming
- [ ] Tool durability
- [ ] Proper sound effects
- [ ] Advanced lighting system

## License

MIT License - See LICENSE file for details

## Author

Created with Claude Code - AI-assisted development