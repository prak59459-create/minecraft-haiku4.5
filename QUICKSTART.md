# Quick Start Guide

## Installation & Launch (30 seconds)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:3000` automatically.

## First Time Setup

1. **Click to Lock Cursor:** Click anywhere in the game to enable mouse look
2. **Select Block:** Use keys 1-9 or scroll wheel to select blocks
3. **Start Building:** Right-click to place, left-click to destroy

## Essential Controls

| Key | Action |
|-----|--------|
| **W/A/S/D** | Move Forward/Left/Back/Right |
| **Mouse** | Look Around |
| **Space** | Jump |
| **Shift** | Sprint (30% faster) |
| **1-9** | Select Block in Hotbar |
| **Scroll** | Change Selected Block |
| **Left Click** | Destroy Block |
| **Right Click** | Place Block |
| **ESC** | Release Cursor Lock |
| **`` ` ``** | Toggle Debug Console |

## First 5 Minutes

1. **Spawn in World** - You'll spawn at height 64
2. **Explore Terrain** - Walk around to see different biomes
3. **Try Building** - Place some blocks with right-click
4. **Destroy Blocks** - Left-click blocks to remove them
5. **Change Biomes** - Walk to see Plains, Desert, Forest, Mountains

## Game Information Panel

Top-left corner shows:
- **FPS:** Current frame rate
- **Pos:** Your position (X, Y, Z)
- **Chunks:** Number of loaded chunks
- **Blocks:** Total blocks in loaded world
- **Selected Block:** Current block type

## Hotbar Selection

The bottom of the screen shows your 9 available blocks:
- 1: Grass
- 2: Dirt
- 3: Stone
- 4: Cobblestone
- 5: Sand
- 6: Glass
- 7: Wood
- 8: Planks
- 9: Brick

## Biomes to Explore

1. **Plains** - Flat, grassy terrain (green border on map)
2. **Desert** - Sandy hills, great for building (yellow)
3. **Forest** - Dense trees, lumber resources (dark green)
4. **Mountain** - Steep terrain, high peaks (gray)
5. **Tundra** - Cold, sparse terrain (light blue)
6. **Swamp** - Waterlogged, vegetation-rich (olive)

## Performance Tips

- If FPS drops below 60:
  - Press **`` ` ``** to open debug console
  - Look for "Quality: low" if auto-adjusting
  - Try standing in one spot instead of moving
  - Close browser tabs to free memory

- For best performance on older computers:
  - Reduce render distance in config
  - Disable shadows in config
  - Use lower quality settings

## Common Issues

### Game Won't Open
- Check console for errors: Press F12
- Ensure port 3000 is not in use
- Try: `npm install` then `npm run dev` again

### FPS is Low
- Open debug console (`` ` ``)
- Check vertex count (should be <5M)
- Try reducing render distance in config
- Close other browser tabs

### Can't See Blocks
- Make sure you're not inside terrain
- Press J to jump up 30 blocks
- Check if day/night cycle is too dark

### Cursor Won't Lock
- Click in the center of the game window
- Try a different browser (Chrome recommended)
- Check browser permissions

## Configuration

Edit `src/config.js` to customize:
- **Render Distance:** How far terrain loads (default: 8)
- **Move Speed:** Base walking speed (default: 4.3)
- **Sprint Speed:** Running speed (default: 5.6)
- **Jump Force:** Jump height (default: 8)
- **Mouse Sensitivity:** Look around speed (default: 0.004)

After editing, save the file and refresh the browser.

## Next Steps

- Read **README.md** for detailed features
- See **ARCHITECTURE.md** for technical details
- Explore **src/** folder to understand code
- Modify config values to customize gameplay

## Tips for Building

1. **Start small** - Build a house first
2. **Use layers** - Stack blocks vertically
3. **Mix blocks** - Use different types for texture
4. **Plan layout** - Think before placing many blocks
5. **Destroy mistakes** - Left-click to remove blocks

## Fun Challenges

- [ ] Build a 10×10×10 stone cube
- [ ] Create a 3-biome border showcase
- [ ] Make a tall tower that reaches the clouds
- [ ] Build a circle or sphere
- [ ] Design a house with multiple rooms
- [ ] Create a bridge across water
- [ ] Make pixel art with different blocks

## Getting Help

- Check game console: Press `` ` `` to open debug console
- View stats: FPS, position, chunk info in top-left
- Report issues: Create an issue on GitHub
- Documentation: See README.md and ARCHITECTURE.md

## Keyboard Shortcuts Cheat Sheet

```
Movement       Camera         Building       Debug
W - Forward    Mouse - Look   1-9 - Select   ` - Console
A - Left       Scroll - Block J - Jump Up    F12 - DevTools
S - Back                       LClick - Break
D - Right                      RClick - Place
Space - Jump
Shift - Sprint
ESC - Unlock
```

---

**Ready to build?** Have fun exploring! 🎮
