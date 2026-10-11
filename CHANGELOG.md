# Changelog - Minecraft Haiku 4.5

## Latest Improvements

### Performance & Optimization
- Added config system integration for flexible tuning of game parameters
- Optimized shadow mapping with proper camera setup for better lighting quality
- Implemented color caching in chunk mesh generation to reduce redundant calculations
- Optimized raycast function to skip duplicate block checks with position tracking
- Improved WebGL renderer settings with high-performance preference and proper shadow map type
- Enhanced camera near/far planes for better render performance

### Features & Gameplay
- Added water mesh rendering with proper integration into chunk loading system
- Implemented step sounds with configurable timing when player moves on ground
- Improved transparent block (leaves) rendering with proper face culling
- Enhanced player controls with fixed sprint/crouch logic
- Added proper block outline geometry disposal for memory management

### Graphics & Visuals
- Enhanced day/night cycle with improved lighting transitions
- Better ambient and directional light management during day/night cycles
- Improved UI with enhanced inventory slot hover effects
- Better block selection outline with proper geometry disposal
- Optimized water rendering to avoid redundant color calculations

### Bug Fixes
- Fixed particle color handling with proper Uint8Array normalization
- Fixed memory leaks by properly disposing mesh geometries and materials
- Corrected player movement controls to prevent conflicting sprint/crouch states
- Fixed inventory block selection to properly sync with UI system

### Memory Management
- Implemented proper geometry and material disposal for chunk meshes
- Added proper cleanup for off-screen chunks to prevent memory buildup
- Improved particle system color buffer management
- Better resource management during day/night cycles

## Configuration System
The game uses a flexible configuration system (config.js) allowing for easy tuning of game parameters without code changes.

## Debug Features
- Performance monitoring with FPS counter
- Real-time vertex and triangle count tracking
- Chunk and particle system statistics
- Memory usage monitoring
- Accessible via F3 key toggle

## Known Limitations
- Water doesn't flow or have proper physics simulation
- No swimming mechanics
- Limited block types (15 total)
- Single biome terrain generation
- No structures beyond basic terrain generation

## Future Improvements
- Water physics and flowing mechanics
- Swimming mechanics
- More block types and textures
- Cave generation
- Structure placement (trees, villages)
- Multiple biome types
- Better performance with LOD (Level of Detail)
