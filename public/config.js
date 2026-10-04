export const CONFIG = {
  rendering: {
    fov: 75,
    near: 0.1,
    far: 1000,
    antialias: true,
    shadowMapSize: 2048,
    fogNear: 200,
    fogFar: 400,
    maxDrawCalls: 1000
  },

  terrain: {
    chunkSize: 16,
    chunkHeight: 128,
    terrainScale: 80,
    waterLevel: 32,
    loadRadius: 3,
    unloadRadius: 5,
    chunkLOD: {
      nearDistance: 50,
      mediumDistance: 100,
      farDistance: 150
    }
  },

  physics: {
    gravity: 0.0098,
    walkSpeed: 0.1,
    sprintSpeed: 0.18,
    crouchSpeed: 0.05,
    jumpForce: 0.25,
    playerHeight: 1.8,
    playerWidth: 0.6,
    friction: 0.99,
    restitution: 0
  },

  gameplay: {
    dayNightCycleSpeed: 0.00005,
    dayNightCycleDuration: 20000,
    breakDistance: 6,
    placeDistance: 5,
    hotbarSlots: 9,
    inventorySlots: 36
  },

  particles: {
    maxParticles: 500,
    particleSize: 0.1,
    particleLife: 1,
    particleCount: 12
  },

  audio: {
    masterVolume: 0.5,
    blockBreakFrequency: 220,
    blockPlaceFrequency: 440,
    jumpFrequency: 330
  },

  debug: {
    enabled: true,
    showStats: true,
    showChunkBounds: false,
    showCollisionBoxes: false
  },

  biomes: {
    desert: {
      heightMultiplier: 0.7,
      vegetation: 0.3
    },
    forest: {
      heightMultiplier: 1.2,
      vegetation: 0.8
    },
    jungle: {
      heightMultiplier: 1.5,
      vegetation: 0.95
    },
    snow: {
      heightMultiplier: 1.1,
      vegetation: 0.1
    },
    plains: {
      heightMultiplier: 0.8,
      vegetation: 0.5
    }
  }
};

export function getConfig() {
  return CONFIG;
}

export function updateConfig(path, value) {
  const keys = path.split('.');
  let obj = CONFIG;
  for (let i = 0; i < keys.length - 1; i++) {
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
}
