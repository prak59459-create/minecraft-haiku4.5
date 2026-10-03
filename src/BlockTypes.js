export const BlockTypes = {
  EMPTY: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
  LEAVES: 5,
  WATER: 6,
  SAND: 7,
  GRAVEL: 8,
  LAVA: 9,
  BEDROCK: 10,

  getColor(type) {
    const colors = {
      0: { r: 0, g: 0, b: 0 },
      1: { r: 0.55, g: 0.71, b: 0.27 },
      2: { r: 0.55, g: 0.35, b: 0.22 },
      3: { r: 0.5, g: 0.5, b: 0.5 },
      4: { r: 0.55, g: 0.35, b: 0.15 },
      5: { r: 0.13, g: 0.55, b: 0.13 },
      6: { r: 0.25, g: 0.41, b: 0.88 },
      7: { r: 0.96, g: 0.96, b: 0.86 },
      8: { r: 0.66, g: 0.66, b: 0.66 },
      9: { r: 0.88, g: 0.3, b: 0.0 },
      10: { r: 0.2, g: 0.2, b: 0.2 }
    }
    return colors[type] || colors[0]
  },

  isWater(type) {
    return type === this.WATER
  },

  isLava(type) {
    return type === this.LAVA
  },

  isSolid(type) {
    return type !== 0 && type !== this.WATER && type !== this.LAVA
  }
}
