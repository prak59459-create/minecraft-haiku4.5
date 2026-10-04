# Minecraft Haiku 4.5

A fully-featured 3D Minecraft clone built with Three.js and TypeScript, featuring procedural terrain generation, physics-based player movement, and a complete building/destruction system.

## Features

- **Terrain Generation**: Perlin noise-based procedural world generation with multiple octaves for varied terrain
- **Block System**: 12+ block types (grass, dirt, stone, wood, leaves, water, sand, gravel, coal ore, iron ore, gold ore)
- **Player Controls**: 
  - WASD movement with dynamic speed (walk/sprint/crouch)
  - Mouse look with smooth camera controls
  - Space to jump with gravity physics
  - Block interaction (destroy with left-click, place with right-click)
  - Block selection with 1-9 keys or scroll wheel
- **Inventory System**:
  - 9-slot inventory with configurable stack sizes (max 64 per stack)
  - Block pickup on destruction
  - Block consumption on placement
  - Starting inventory with common blocks
- **Physics & Collisions**: 
  - Gravity and jump mechanics
  - AABB-based collision detection
  - Precise block-level physics
  - Raycasting for block targeting
- **Chunk System**: Dynamic chunk loading/unloading (10-chunk render distance) for infinite worlds
- **Lighting & Visuals**: 
  - Day/night cycle (20-second cycle) with dynamic sun position
  - Ambient and directional lighting
  - Shadow mapping for realistic rendering
  - Per-face brightness shading
  - Block outline highlighting for targeted blocks
- **Audio System**:
  - Web Audio API-based procedurally generated sound effects
  - Block break/place sounds
  - Jump and footstep sounds
  - Volume control
- **Particle Effects**:
  - Destruction particles when breaking blocks
  - Physics-based particle movement with gravity
  - Color-coded particles matching block types
- **UI/HUD**: 
  - Real-time FPS counter
  - Player position display (X, Y, Z)
  - Current chunk coordinates
  - Target block information
  - Inventory display with item counts
  - Block selector with visual feedback
  - Time of day indicator
  - On-screen control hints

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Building

```bash
npm run build
npm run preview
```

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Move forward/left/backward/right |
| Mouse | Look around |
| Space | Jump |
| Shift | Sprint (hold) / Crouch (hold) |
| Left Click | Destroy block |
| Right Click | Place block |
| 1-9 / Scroll Wheel | Select block type |

## Architecture

### Core Modules

- **src/main.ts**: Game initialization, render loop, scene setup, and day/night cycle
- **src/world.ts**: Chunk system, terrain generation (Perlin noise), tree generation, mesh building
- **src/player.ts**: Player physics, controls, collision detection, block interaction, rayc asting
- **src/blocks.ts**: Block type definitions, colors, and properties
- **src/ui.ts**: HUD elements, block selector, time display

### Feature Modules

- **src/particles.ts**: Particle system for destruction effects with physics
- **src/audio.ts**: Web Audio API interface for sound effects
- **src/inventory.ts**: Inventory management system with slots and stacking
- **src/highlight.ts**: Block targeting and visual outline system

### Key Systems

**Terrain Generation**: Multi-octave Perlin noise creates natural-looking terrain with varied elevation
**Chunk System**: Automatic loading/unloading maintains memory efficiency for infinite worlds
**Physics**: AABB-based collision detection with per-axis handling for smooth movement
**Rendering**: Instanced geometry and proper face culling minimize draw calls
**Audio**: Procedurally generated tones provide feedback without external audio files

## Performance Optimizations

- Chunk-based world rendering with frustum culling
- Instanced mesh rendering for blocks
- Dynamic chunk loading based on player position (10-chunk render distance)
- Efficient collision detection
- Shadow map optimization with appropriate resolution and bounds

## Future Enhancements

- **Multiplayer**: WebSocket-based multiplayer support with player synchronization
- **Crafting System**: Crafting recipes and workbench mechanics
- **More Content**: Expanded block types, more diverse biomes, decorative blocks
- **Advanced Lighting**: Torch placement, dynamic light sources, better water rendering
- **Persistence**: World saving/loading with IndexedDB or server-side storage
- **NPCs & Mobs**: Creatures with AI, animations, and interactions
- **Weather System**: Rain, snow, and weather-based visibility changes
- **Advanced Physics**: Water flow, lava, and more realistic fluid simulation
- **Animation System**: Block breaking animation, player hand/tool animation
- **Mobile Support**: Touch controls for mobile devices
- **Performance**: GPU-based instancing for even better performance, LOD system