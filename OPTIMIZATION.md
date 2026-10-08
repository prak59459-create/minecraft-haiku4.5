# Performance Optimization Guide

This guide provides tips for optimizing performance and improving the gameplay experience.

## System Requirements

### Minimum Requirements
- CPU: Intel i5 / AMD Ryzen 5 (2017+)
- GPU: GTX 960 / RX 470 equivalent or better
- RAM: 4 GB
- Browser: Chrome/Firefox 2021+

### Recommended Requirements
- CPU: Intel i7 / AMD Ryzen 7 (2019+)
- GPU: RTX 2060 / RX 5700 equivalent or better
- RAM: 8+ GB
- Browser: Latest Chrome/Firefox/Edge

## Performance Tips

### In-Game Settings

1. **Render Distance**
   - Reduce render distance to improve FPS
   - Default is 8 chunks (128 blocks)
   - Minimum recommended: 4 chunks
   - Maximum recommended: 12 chunks

2. **Graphics Quality**
   - Disable shadows for better performance (already disabled by default)
   - Use flatShading for faster rendering (enabled by default)
   - Reduce particle limit if experiencing lag

3. **Monitor Performance**
   - Press F3 to view debug display
   - Check FPS counter in top-right corner
   - Monitor memory usage (should stay under 500 MB)
   - Watch triangle count to identify heavy areas

### Browser Optimization

1. **Browser Settings**
   - Close unnecessary tabs and extensions
   - Clear browser cache regularly
   - Use hardware acceleration (usually enabled by default)
   - Disable browser extensions that might interfere

2. **Hardware Acceleration**
   - Chrome: Settings → Advanced → System → Enable hardware acceleration
   - Firefox: about:config → gfx.webrender.enabled = true
   - Edge: Settings → System → Use hardware acceleration

3. **WebGL Settings**
   - Modern browsers auto-optimize WebGL
   - Some older GPUs may have slower WebGL support
   - Consider updating GPU drivers for better WebGL performance

## Performance Troubleshooting

### Low FPS Issues

**Symptoms**: FPS drops below 30

**Solutions**:
1. Reduce render distance (decrease from 8 to 4-6)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close background applications
4. Update GPU drivers
5. Restart browser

### High Memory Usage

**Symptoms**: Memory usage grows above 500 MB

**Solutions**:
1. Reduce render distance
2. Reduce particleLimit in config
3. Clear browser data
4. Restart browser
5. Check for memory leaks in browser dev tools

### Stuttering/Lag Spikes

**Symptoms**: Occasional frame rate drops

**Solutions**:
1. Reduce particle effects limit
2. Optimize chunk generation (closer chunks first - already implemented)
3. Close background applications
4. Ensure adequate GPU memory
5. Monitor system resources while playing

## Advanced Optimization

### Configuration Tuning

Edit `config.json` for advanced settings:

```json
{
  "world": {
    "renderDistance": 8,      // Reduce to 4-6 for better performance
    "seedOffset": 0
  },
  "graphics": {
    "renderScale": 1.0,       // Reduce to 0.75 or 0.5 for better FPS
    "particleLimit": 2000,    // Reduce to 1000 for less lag
    "fpsTarget": 60           // Match monitor refresh rate
  }
}
```

### Monitor Performance

**Debug Display (F3) Shows**:
- **FPS**: Current frames per second
- **Chunks**: Number of loaded chunks
- **Vertices**: Total vertices being rendered
- **Triangles**: Total triangles in scene
- **Draw Calls**: Number of GPU draw calls
- **Particles**: Active particles
- **Memory**: JavaScript heap size in MB

**Target Performance**:
- FPS: 60 (or match your monitor)
- Draw Calls: 50-200
- Memory: 100-400 MB
- Triangles: 1M-5M depending on render distance

## Performance Benchmarks

### Expected Performance

**High-End System (RTX 2080+)**
- Render Distance: 12+ chunks
- Expected FPS: 60+
- Memory: 300-500 MB

**Mid-Range System (GTX 1060)**
- Render Distance: 8 chunks
- Expected FPS: 45-60
- Memory: 200-300 MB

**Low-End System (GTX 960)**
- Render Distance: 4-6 chunks
- Expected FPS: 30-45
- Memory: 100-200 MB

## Optimization Checklist

- [ ] Reduce render distance if FPS < 30
- [ ] Monitor memory usage with F3
- [ ] Update GPU drivers
- [ ] Close background applications
- [ ] Clear browser cache
- [ ] Use hardware acceleration
- [ ] Check system temperature
- [ ] Verify WebGL 2.0 support

## Web Browser Compatibility

### Performance by Browser

1. **Chrome**: Best WebGL performance
2. **Firefox**: Good performance, slightly slower
3. **Edge**: Chromium-based, similar to Chrome
4. **Safari**: Acceptable performance on macOS
5. **Mobile Browsers**: Limited performance, not recommended

### WebGL Support Check

Test WebGL 2.0 support: https://www.khronos.org/webgl/wiki/Getting_Started_with_WebGL

## Reporting Issues

If experiencing performance problems:

1. Note your system specs (CPU, GPU, RAM, Browser)
2. Record FPS and memory usage
3. Check debug display statistics
4. Provide render distance and other settings
5. Test with different browsers

---

**Last Updated**: October 2026
**Version**: 1.0.0
