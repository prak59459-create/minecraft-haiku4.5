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
- **H**: Show/hide help text

### Gameplay
- **Procedural Terrain**: Infinite world generation using multi-scale Simplex noise
- **Biome System**: Forest and desert biomes with appropriate terrain features
- **Block Types**: Grass, dirt, stone, wood, leaves, water, and more
- **Chunk System**: Automatic chunk loading/unloading for performance
- **Physics**: Gravity, collision detection, jumping, sprinting, and crouching
- **Block Interaction**: Place and destroy blocks with raycasting and instant feedback
- **Day/Night Cycle**: Dynamic 20-second cycle with sky color transitions
- **Lighting System**: Sun-based directional lighting with dynamic intensity
- **Inventory System**: Hotbar for quick block selection with keyboard and scroll
- **Flying Mode**: Creative mode for unrestricted movement

### Audio & Feedback
- **Sound Effects**: Block placement, destruction, and footstep sounds
- **Web Audio API**: Procedurally generated audio with adjustable volume
- **Particle Effects**: Visual feedback when breaking blocks
- **Head Bobbing**: Realistic head movement when walking/sprinting

### Settings & Performance
- **Customizable Settings**: FOV, render distance, mouse sensitivity, volume
- **Performance Monitoring**: Real-time FPS tracking and frame metrics
- **Dynamic Quality**: Automatic adjustments based on performance
- **Shadow Rendering**: Toggle shadows for better performance on slower hardware
- **Persistent Settings**: Game settings saved to localStorage

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