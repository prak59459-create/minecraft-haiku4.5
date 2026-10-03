// Simplex noise implementation
export class PerlinNoise {
  private permutation: number[] = [];
  private p: number[] = [];

  constructor(seed: number = 0) {
    const basePermutation = [];
    for (let i = 0; i < 256; i++) {
      basePermutation[i] = i;
    }

    for (let i = 255; i > 0; i--) {
      const j = Math.floor((seed + i * 73) % 256);
      [basePermutation[i], basePermutation[j]] = [basePermutation[j], basePermutation[i]];
    }

    this.permutation = basePermutation;
    this.p = [...basePermutation, ...basePermutation];
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 8 ? y : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number, z: number): number {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const zi = Math.floor(z) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);

    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    const a = this.p[xi] + yi;
    const aa = this.p[a] + zi;
    const ab = this.p[a + 1] + zi;
    const b = this.p[xi + 1] + yi;
    const ba = this.p[b] + zi;
    const bb = this.p[b + 1] + zi;

    const g000 = this.grad(this.p[aa], xf, yf, zf);
    const g100 = this.grad(this.p[ba], xf - 1, yf, zf);
    const g010 = this.grad(this.p[ab], xf, yf - 1, zf);
    const g110 = this.grad(this.p[bb], xf - 1, yf - 1, zf);
    const g001 = this.grad(this.p[aa + 1], xf, yf, zf - 1);
    const g101 = this.grad(this.p[ba + 1], xf - 1, yf, zf - 1);
    const g011 = this.grad(this.p[ab + 1], xf, yf - 1, zf - 1);
    const g111 = this.grad(this.p[bb + 1], xf - 1, yf - 1, zf - 1);

    const l00 = this.lerp(u, g000, g100);
    const l10 = this.lerp(u, g010, g110);
    const l0 = this.lerp(v, l00, l10);
    const l01 = this.lerp(u, g001, g101);
    const l11 = this.lerp(u, g011, g111);
    const l1 = this.lerp(v, l01, l11);

    return this.lerp(w, l0, l1);
  }
}

export function getTerrainHeight(perlin: PerlinNoise, x: number, z: number): number {
  const scale1 = 0.01;
  const scale2 = 0.05;
  const scale3 = 0.1;

  const height = 64 +
    perlin.noise(x * scale1, 0, z * scale1) * 32 +
    perlin.noise(x * scale2, 0, z * scale2) * 16 +
    perlin.noise(x * scale3, 0, z * scale3) * 8;

  return Math.floor(height);
}

export function getBlockType(x: number, y: number, z: number, perlin: PerlinNoise): number {
  const height = getTerrainHeight(perlin, x, z);

  if (y > height) return 0; // air

  if (y === height) {
    const surfaceVariation = perlin.noise(x * 0.1, 0, z * 0.1);
    if (surfaceVariation > 0.3) {
      return 5; // leaves (vegetation)
    }
    return 1; // grass
  }

  if (y > height - 4) return 2; // dirt
  if (y > height - 20) return 3; // stone
  return 3; // deep stone
}
