# Minecraft Clone - Haiku 4.5

A full-featured 3D Minecraft clone built with Three.js, featuring procedural terrain generation, physics, and interactive gameplay.

## Features

### Controls
- **WASD**: Move forward/backward/strafe left/right
- **Mouse**: Look around (click to lock pointer)
- **Space**: Jump
- **Shift**: Sprint
- **Ctrl**: Crouch
- **F**: Toggle flying mode (creative mode)
- **1-9**: Select block type from hotbar
- **Scroll Wheel**: Cycle through block types
- **Left Click**: Destroy block
- **Right Click**: Place block
- **E**: Toggle inventory

### Gameplay
- **Procedural Terrain**: Infinite world generation using Simplex noise
- **Block Types**: Grass, dirt, stone, wood, leaves, water, and more
- **Chunk System**: Automatic chunk loading/unloading for performance
- **Physics**: Gravity, collision detection, jumping, sprinting
- **Block Interaction**: Place and destroy blocks with raycasting
- **Day/Night Cycle**: Dynamic lighting that changes throughout the day
- **Inventory System**: Hotbar for quick block selection
- **Flying Mode**: Creative mode for unrestricted movement

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The game will open in your browser at `http://localhost:5173`

## Building

Create a production build:

```bash
npm run build
```

## Project Structure

```
src/
├── main.js           # Game initialization and main loop
├── styles.css        # UI styling
├── game/
│   ├── world.js     # Terrain generation and chunk management
│   ├── player.js    # Player controller and input handling
│   ├── physics.js   # Collision detection and resolution
│   └── ui.js        # HUD and user interface
```

## Technical Details

- **Engine**: Three.js
- **Terrain**: Simplex noise for realistic procedural generation
- **Rendering**: WebGL with optimized mesh batching
- **Performance**: Chunk-based rendering with distance culling
- **Physics**: AABB-based collision detection with resolution

## Performance Optimizations

- Chunk-based world division for efficient memory management
- Frustum culling for distant chunks
- Mesh instancing where possible
- Optimized block face rendering (only visible faces)
- Efficient raycasting for block selection

## Future Enhancements

- Biome variation
- Advanced lighting and shadows
- Sound effects and music
- Multiplayer support
- More block types and tools
- Better water physics
- Particle effects for destruction
- NPC entities