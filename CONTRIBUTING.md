# Contributing to Minecraft 3D Clone

Thank you for your interest in contributing! This document provides guidelines and instructions for developers.

## Code Style

### JavaScript
- Use ES6+ syntax
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use UPPER_SNAKE_CASE for constants
- Keep lines under 100 characters when possible

### Comments
- Add comments for non-obvious logic
- Document public methods with JSDoc style comments
- Explain WHY, not WHAT (good code shows what it does)

### Example
```javascript
class BlockRegistry {
    constructor() {
        this.blocks = new Map();
    }

    /**
     * Registers a new block type
     * @param {BlockType} blockType - The block to register
     */
    register(blockType) {
        this.blocks.set(blockType.id, blockType);
    }
}
```

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Open http://localhost:8080 in your browser

## Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes with meaningful commits
3. Push to your fork: `git push origin feature/your-feature`
4. Create a Pull Request with a description

### Commit Messages
```
Feature: Add block textures

- Implement UV mapping for all block types
- Add texture atlas generation
- Update material system to use textures
- Fix UV coordinate calculations

Fixes #123
```

## Project Structure

```
js/
├── config.js       # Configuration & settings
├── blocks.js       # Block definitions
├── world.js        # World & chunk management
├── terrain.js      # Terrain generation
├── collision.js    # Physics system
├── player.js       # Player controller
├── particles.js    # Particle effects
├── sound.js        # Audio system
├── performance.js  # Monitoring
├── ui.js           # User interface
├── main.js         # Game loop
└── launcher.js     # Game initialization

css/
└── style.css       # Styling

Documentation/
├── README.md       # User guide
├── FEATURES.md     # Feature list
├── DEVELOPMENT.md  # Development guide
└── CONTRIBUTING.md # This file
```

## Adding New Features

### 1. New Block Type
```javascript
// In blocks.js, add to BlockRegistry constructor:
this.register(new BlockType(12, 'MyBlock', 0xAABBCC, 0.0, 0.8));
```

### 2. New Terrain Feature
```javascript
// In terrain.js or chunk generation:
generateFeature(x, y, z) {
    // Your feature generation logic
}
```

### 3. New UI Element
```javascript
// In ui.js, update GameUI class:
updateMyNewElement() {
    const element = document.getElementById('my-element');
    element.textContent = 'Updated!';
}
```

## Testing

Before submitting a PR:

1. **Performance Testing**
   - Check FPS with development console
   - Monitor memory usage
   - Verify no memory leaks

2. **Functionality Testing**
   - Test all new features
   - Verify no regressions in existing features
   - Test on different browser sizes
   - Test on different devices if possible

3. **Code Review**
   - Check for console errors
   - Verify code follows style guide
   - Ensure no commented-out code remains

## Common Tasks

### Adding a Configuration Option

1. Add to `GameConfig` in `config.js`
2. Update `loadConfig()` function if needed
3. Use `GameConfig.category.option` in code
4. Document in `README.md`

### Adding Performance Tracking

1. Use `ProfilingTimer` class from `performance.js`
2. Create timer: `const timer = new ProfilingTimer('name')`
3. Call `timer.start()` and `timer.end()`
4. Get report: `timer.getReport()`

### Adding Sound Effects

1. Create sound in `SoundLibrary.sounds`
2. Define duration and frequency
3. Call `globalAudioManager.playSound('soundName')`
4. Adjust volume as needed

## Performance Guidelines

- Keep chunk generation under 50ms
- Keep frame updates under 16ms (for 60 FPS)
- Reuse geometries and materials when possible
- Dispose of unused geometries
- Use frustum culling for distant chunks

## Code Review Checklist

- [ ] Code follows style guide
- [ ] Comments are clear and helpful
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] No memory leaks detected
- [ ] Features work as described
- [ ] Documentation is updated
- [ ] Commit messages are descriptive

## Reporting Bugs

1. Check if bug already exists in Issues
2. Provide steps to reproduce
3. Include browser and OS information
4. Include console errors if applicable
5. Attach screenshots if helpful

### Bug Report Template
```
**Browser**: Chrome 90 on Windows 10
**Issue**: Chunks not loading after moving far
**Steps**:
1. Start game
2. Move in one direction for ~30 seconds
3. Notice chunk loading stops

**Expected**: Chunks should continue loading
**Actual**: Chunks stop appearing after certain distance

**Console Errors**: [Include if any]
```

## Feature Requests

1. Check if feature already requested
2. Describe the feature clearly
3. Explain why it would be useful
4. Suggest implementation approach if possible

### Feature Request Template
```
**Feature**: Swimming mechanics
**Description**: Allow player to swim in water blocks
**Motivation**: Makes water interactive and improves gameplay
**Implementation**: 
- Detect when player is in water block
- Modify movement controls for water
- Show water particle effects
```

## Questions?

- Check existing documentation
- Look at similar code for examples
- Open a discussion issue
- Check commit history for similar changes

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Last Updated**: October 3, 2026
**Version**: 1.0.0
