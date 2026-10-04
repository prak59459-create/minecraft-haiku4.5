# Minecraft Haiku 4.5

A fully-featured 3D Minecraft clone built with Three.js and TypeScript, featuring procedural terrain generation, physics-based player movement, and a complete building/destruction system.

## Features

- **Terrain Generation**: Perlin noise-based procedural world generation with multiple biomes
- **Block System**: 12+ block types (grass, dirt, stone, wood, leaves, water, sand, gravel, ores)
- **Player Controls**: 
  - WASD movement with dynamic speed (walk/sprint/crouch)
  - Mouse look with smooth camera controls
  - Space to jump with gravity physics
  - Block interaction (destroy/place)
  - Block selection with 1-9 keys or scroll wheel
- **Physics & Collisions**: 
  - Gravity and jump mechanics
  - Precise player-block collision detection
  - Raycasting for block targeting
- **Chunk System**: Dynamic chunk loading/unloading for infinite worlds
- **Lighting**: 
  - Day/night cycle with dynamic sun position
  - Ambient and directional lighting
  - Shadow mapping for realistic rendering
- **UI/HUD**: 
  - Real-time FPS counter
  - Player position display
  - Target block information
  - Block selector with visual feedback
  - Control hints

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

- **src/main.ts**: Game initialization and main render loop
- **src/world.ts**: Chunk system and terrain generation
- **src/player.ts**: Player physics, controls, and interaction
- **src/blocks.ts**: Block types and properties
- **src/ui.ts**: HUD and UI element management

## Performance Optimizations

- Chunk-based world rendering with frustum culling
- Instanced mesh rendering for blocks
- Dynamic chunk loading based on player position (10-chunk render distance)
- Efficient collision detection
- Shadow map optimization with appropriate resolution and bounds

## Future Enhancements

- Multiplayer support
- Inventory system with crafting
- More block types and biomes
- Particle effects for block destruction
- Sound effects and music
- Saving/loading world state
- Advanced lighting with torch placement
- Water physics
- Mobs and creatures