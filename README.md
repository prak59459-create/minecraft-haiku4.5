# 3D Minecraft Clone - Haiku 4.5

A high-performance 3D Minecraft-inspired game built with Three.js, featuring procedural terrain generation, dynamic lighting, and responsive physics.

## Features

### Core Gameplay
- **WASD Movement** - Navigate the world smoothly with physics-based movement
- **Mouse Look** - Full 360° camera control with adjustable sensitivity
- **Block Placement & Destruction** - Left-click to destroy, right-click to place blocks
- **Hotbar Selection** - 9 primary blocks (1-9 keys) + 4 extended blocks (G, O, B, M keys)
- **Block Picking** - Middle-click to pick block type from the world

### World & Terrain
- **Procedural Generation** - Infinite world using Perlin noise
- **Biome System** - Grass and sandy terrain variants with smooth transitions
- **Cave Generation** - 3D Perlin noise creates natural-looking underground caverns
- **Dynamic Lighting** - 24-hour day/night cycle with adaptive lighting
- **Water Rendering** - Semi-transparent water with wave animation
- **Tree Generation** - Procedurally generated trees with varied heights

### Block Types (18 Total)
1. Stone 2. Grass 3. Dirt 4. Cobblestone 5. Oak Log 6. Oak Leaves 7. Sand 8. Water 9. Gravel
10. Bedrock 11. Coal Ore 12. Iron Ore 13. Gold Ore 14. Diamond Ore 15. Glass 16. Obsidian 17. Bricks 18. Mossy Stone

### Physics & Collision
- Gravity and jumping with smooth acceleration
- Precise player-block collision detection
- Sprint and crouch mechanics
- Fall damage support
- Terminal velocity simulation

### Audio System
- Block breaking/placing sounds
- Jump sound effect
- Step sounds (vary with sprint speed)
- Responsive audio synthesis with Web Audio API
- Dynamic volume control

### Visual Quality
- Advanced lighting with height-based brightness
- Fog system for atmospheric depth
- Smooth day/night sky transitions
- Block outline highlighting
- Particle effects for block destruction
- Shadow mapping and normal calculations

### Performance Features
- **Dynamic Render Distance** - Automatically adjusts based on FPS
- **Chunk-Based Rendering** - Efficient mesh generation
- **Memory Management** - Proper geometry/material disposal
- **Performance Monitoring** - Real-time FPS and memory tracking

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Move |
| Space | Jump |
| Shift | Sprint/Crouch |
| Mouse | Look Around |
| Left Click | Destroy Block |
| Right Click | Place Block |
| Middle Click | Pick Block |
| 1-9 | Select Block |
| G, O, B, M | Extra Blocks |
| Scroll | Cycle Hotbar |
| C | Pick Type |
| [ ] | Adjust Sensitivity |
| F3 | Debug Display |
| H | Help Menu |

## Getting Started

```bash
python -m http.server 8000
# Visit http://localhost:8000
```

## Performance Tips

1. Adjust render distance for your machine
2. Monitor FPS with F3
3. Lower particle limit for better performance
4. Disable shadows on older machines

## Technical Stack

- **Three.js** - 3D rendering
- **Simplex Noise** - Terrain generation
- **Web Audio API** - Sound synthesis
- **Pure JavaScript** - No build tools required

## Architecture

- **World System** - Chunk-based generation
- **Physics Engine** - Collision detection
- **Rendering Pipeline** - Efficient mesh building
- **Audio Manager** - Procedural sounds
- **Performance Monitor** - Real-time metrics

---

Built with Three.js. Inspired by Minecraft. Enjoy building! 🎮✨
