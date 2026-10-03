# Minecraft Clone - Haiku 4.5

A fully functional 3D Minecraft clone built with Three.js featuring terrain generation, block placement/destruction, and physics.

## Features

### Core Gameplay
- **Controls**: 
  - WASD: Movement
  - Mouse: Look around
  - Space: Jump
  - Shift: Sprint
  - Ctrl: Crouch
  - Left-click: Destroy blocks
  - Right-click: Place blocks
  - 1-9 / Scroll wheel: Block selection

### World & Terrain
- Procedural terrain generation using Perlin noise
- Multiple block types: Grass, Dirt, Stone, Wood, Leaves, Water, Sand, Cobblestone, Oak Log
- Dynamic chunk loading/unloading for performance
- Procedurally generated trees
- Height variation and caves simulation

### Physics & Collisions
- Gravity simulation
- Precise block-level collision detection
- Player height adjustment for crouching
- Raycasting for accurate block selection

### Environment
- Day/night cycle with dynamic lighting
- Directional light with shadows
- Ambient lighting for global illumination
- Real-time shadow mapping

### Visual Polish
- Clean UI with hotbar and stats display
- Block highlight outline when aiming
- Color variation per face for depth perception
- Efficient mesh generation with vertex colors

## How to Run

### Web Server
```bash
npm install
npm start
```

Or use Python's built-in server:
```bash
python3 -m http.server 8080
```

Then open http://localhost:8080 in your browser.

## Technical Details

- **Engine**: Three.js (r128)
- **Terrain**: Perlin noise procedural generation
- **Rendering**: WebGL with shadows and vertex colors
- **Performance**: Chunked world with dynamic loading (render distance: 8 chunks)
- **Physics**: Custom collision detection and gravity

## Game Mechanics

- Players spawn at Y=70 in a procedurally generated world
- Breaking blocks drops them for selection
- Placing blocks consumes from inventory (hotbar)
- Block types have different colors for visual distinction
- Sprint movement enabled with Shift key
- Crouch reduces player height and walking speed

## Future Optimizations

- Water flow simulation
- Better terrain generation with biomes
- Improved particle effects
- Sound effects
- Block placement animations
- Inventory system improvements
- Multiplayer support