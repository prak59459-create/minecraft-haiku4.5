# Performance Optimization Guide

This guide provides tips and techniques to optimize the Minecraft clone's performance on your system.

## Performance Metrics

### Good Performance
- **FPS**: 50-60+ FPS on modern hardware
- **Frame Time**: 16-20ms per frame
- **Chunks Loaded**: 15-20 visible chunks
- **Memory Usage**: 200-400 MB JavaScript heap

### Optimal Settings
- **Browser**: Chrome or Firefox (latest version)
- **Display**: 1920x1080 or higher resolution
- **GPU**: Modern integrated or discrete GPU
- **Network**: N/A (single-player only)

## Performance Tips

### 1. Browser Optimization
```
✓ Use Chrome or Firefox (best WebGL support)
✓ Close other browser tabs
✓ Disable browser extensions
✓ Use fullscreen mode for better GPU acceleration
✗ Avoid Safari (slower WebGL implementation)
```

### 2. Graphics Settings
Edit `config.json` to adjust:

```json
{
  "graphics": {
    "shadowMapSize": 1024,      // Reduce to 512 for old GPUs
    "antiAlias": false,         // Keep disabled for performance
    "flatShading": true,        // Keep enabled
    "particleLimit": 1500       // Reduce to 500-1000
  }
}
```

### 3. Render Distance
Modify world render distance in `config.json`:

```json
{
  "world": {
    "renderDistance": 8         // Reduce to 4-6 for old hardware
  }
}
```

### Performance Impact:
- **Distance 4**: 25-30 FPS (low-end devices)
- **Distance 6**: 40-50 FPS (mid-range devices)
- **Distance 8**: 50-60+ FPS (modern hardware)

### 4. Hardware Acceleration
Ensure hardware acceleration is enabled:
- **Chrome**: Settings → Advanced → System → Hardware Acceleration: ON
- **Firefox**: about:config → layers.acceleration.force-enabled: true

### 5. System Settings
- Update graphics drivers regularly
- Close background applications
- Disable resource-heavy programs
- Restart browser if experiencing slowdowns

## Performance Problems & Solutions

### Problem: Low FPS (under 30)
**Solution 1**: Reduce render distance
- Edit `config.json` and set `renderDistance` to 4-6

**Solution 2**: Reduce shadow quality
- Edit `config.json` and set `shadowMapSize` to 512

**Solution 3**: Disable anti-aliasing
- Edit `config.json` and set `antiAlias` to false

**Solution 4**: Reduce particles
- Edit `config.json` and set `particleLimit` to 500

### Problem: Memory Usage Growing
**Solution 1**: Reduce render distance
- Fewer chunks = less memory usage

**Solution 2**: Clear browser cache
- Ctrl+Shift+Delete (Chrome) or Ctrl+Shift+A (Firefox)

**Solution 3**: Reload page periodically
- Completely resets memory usage

### Problem: Stuttering/Frame Drops
**Solution 1**: Progressive loading helps
- Game only builds 2 chunk meshes per frame
- Stuttering should be minimal

**Solution 2**: Reduce graphics settings
- Lower shadow map size
- Disable unnecessary effects

**Solution 3**: Close other applications
- Frees up system resources

### Problem: Chunks Loading Slowly
**Solution 1**: Reduce movement speed
- Gives generation more time
- Use Crouch mode (Shift)

**Solution 2**: Wait when loading new areas
- Terrain generates as you explore

**Solution 3**: Reduce render distance
- Fewer chunks to generate

## Advanced Optimization

### For Developers
Edit `game.js` for advanced tuning:

```javascript
// Rendering
this.renderer.setPixelRatio(0.75);  // Lower resolution
this.raycastDistance = 4;            // Closer reach

// Physics
PLAYER_SPEED = 0.08;                 // Faster = more processing
GRAVITY = 0.015;                     // Different feel

// Terrain
renderDistance = 4;                  // Fewer chunks loaded
```

### Code Optimizations Included
- ✓ Flat shading (no normal recalculation)
- ✓ Indexed geometry (efficient rendering)
- ✓ Color caching (no recalculation)
- ✓ Outline reuse (single geometry)
- ✓ Progressive mesh building (2/frame)
- ✓ Optimized raycasting algorithm
- ✓ Chunk culling (unload distance chunks)

## System Requirements

### Minimum (Playable)
- **GPU**: Intel UHD Graphics or equivalent
- **CPU**: 4th Gen Intel Core i5 or equivalent
- **RAM**: 4 GB
- **Browser**: Chrome 60+, Firefox 55+
- **Target FPS**: 25-35 FPS

### Recommended (Smooth)
- **GPU**: GTX 1050 or equivalent
- **CPU**: 6th Gen Intel Core i5 or equivalent
- **RAM**: 8 GB
- **Browser**: Chrome 90+, Firefox 88+
- **Target FPS**: 50-60 FPS

### High-End (Ultra)
- **GPU**: RTX 2060 or better
- **CPU**: Ryzen 5 3600 or equivalent
- **RAM**: 16+ GB
- **Browser**: Latest Chrome or Firefox
- **Target FPS**: 60+ FPS at 1440p+

## Benchmarking

### Test Your Performance
1. Start game and wait 30 seconds for chunks to load
2. Press F3 to show debug display
3. Move around for 1 minute
4. Average FPS = your performance

### Recommended Targets
- **Low-End**: 25-35 FPS is acceptable
- **Mid-Range**: 40-50 FPS is good
- **High-End**: 55-60+ FPS is excellent

## Troubleshooting Checklist

- [ ] Latest browser version installed
- [ ] Hardware acceleration enabled
- [ ] Graphics drivers updated
- [ ] No other heavy applications running
- [ ] Render distance set appropriately
- [ ] Anti-aliasing disabled
- [ ] Browser cache cleared
- [ ] Page reloaded completely

## Performance Timeline

As you explore the world, you may notice:
- **First Load**: Chunks generating (may be slow for 10-30s)
- **Normal Play**: Smooth 50-60 FPS
- **Chunk Loading**: Brief pause when hitting new terrain
- **Long Sessions**: Gradual memory increase (reload after 1-2 hours)

## Optimal Settings by Device

### Desktop Computer
```json
{
  "renderDistance": 8,
  "shadowMapSize": 1024,
  "antiAlias": false,
  "particleLimit": 1500
}
```
Expected: 55-60 FPS

### Laptop
```json
{
  "renderDistance": 6,
  "shadowMapSize": 512,
  "antiAlias": false,
  "particleLimit": 1000
}
```
Expected: 40-50 FPS

### Low-End Laptop
```json
{
  "renderDistance": 4,
  "shadowMapSize": 256,
  "antiAlias": false,
  "particleLimit": 500
}
```
Expected: 25-35 FPS

## Future Optimizations Planned
- Worker thread for terrain generation
- Level-of-detail (LOD) system
- Frustum culling optimization
- Instanced rendering for repeated blocks
- Texture atlasing (if textures added)
- Memory pooling for particles

## Reporting Performance Issues

If you experience issues:
1. Record your browser and system details
2. Note your render distance setting
3. Check FPS with F3 debug display
4. Test with render distance = 4
5. Report findings with system specs

## Performance FAQ

**Q: Why is FPS low on my MacBook?**  
A: Safari has slower WebGL. Try Chrome or Firefox for 2-3x better performance.

**Q: Can I improve performance with render distance 12+?**  
A: Not recommended. Your system would need to be very high-end. Stay at 8 or lower.

**Q: Should I disable particles?**  
A: Set particleLimit to 0 in config if you need every FPS, but they add great feedback.

**Q: How much memory does this use?**  
A: Typically 200-400 MB. Can reach 600+ MB in long sessions. Reload page if it grows too much.

**Q: Why does it stutter when placing blocks?**  
A: Progressive chunk loading. Only 2 chunks build per frame. Should improve quickly.

---

**Last Updated**: October 2026  
**Version**: 1.0.0
