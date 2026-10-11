# Changelog

All notable changes to the Minecraft Haiku 4.5 clone are documented in this file.

## [Latest]

### Added
- Comprehensive README with feature documentation and guides
- Health system with fall damage mechanics
- Health display UI with visual health bar
- Footstep sound system with movement tracking
- Dust particles for fall landing effects
- Cave system generation using Perlin noise
- New block types: Lapis Ore and Redstone Ore
- Block outline with pulsing opacity animation
- Pick block functionality (C key) with inventory search
- Better tree generation with oak and spruce varieties
- Fog effect for depth perception
- Memory cleanup system for long gameplay sessions
- Water wave animation effects
- Improved raycasting with block caching
- Comprehensive debug display with color-coded FPS

### Improved
- Terrain generation with larger height variations
- Mesh generation performance with color caching
- Day/night cycle with better color transitions
- Shadow mapping with larger camera bounds
- Inventory UI with block tooltips
- Block selection with scroll wheel timeout
- Water rendering with double-sided material
- Game feel with enhanced audio feedback
- Chunk disposal with proper resource cleanup
- Particle system with multiple effect types
- Player collision detection
- Visual feedback for block breaking

### Fixed
- Memory leaks in chunk mesh disposal
- Water rendering visibility issues
- Raycasting accuracy improvements
- Block outline disappearing issue
- Inventory selection edge cases
- Fog color not updating with day/night cycle

### Performance
- Added color caching for mesh generation
- Optimized chunk loading distance to 10 chunks
- Implemented automatic garbage collection
- Improved frustum culling
- Reduced redundant block checks in raycasting
- Better memory management for long sessions

## [0.1.0] - Initial Release

### Added
- 3D Minecraft-inspired gameplay
- Procedural terrain generation with Perlin noise
- Multiple block types (Stone, Grass, Dirt, Sand, Water, etc.)
- Block placing and breaking mechanics
- Player movement with gravity and jumping
- Camera controls with mouse look
- Inventory system with 9 block slots
- Particle effects for block destruction
- Dynamic lighting and shadows
- Water rendering
- Audio system with block sounds
- Debug display for performance monitoring
- Block outline visualization
- Chunk-based world loading/unloading
- Configuration system
- Responsive UI with HUD elements

### Features
- WASD movement
- Jump with space bar
- Sprint/crouch with shift
- Mouse look camera
- Left-click to destroy blocks
- Right-click to place blocks
- Number keys 1-9 for block selection
- Scroll wheel for block cycling
- Day/night cycle
- Dynamic shadows
- Block breaking particles
- Sound effects
