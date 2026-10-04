export class PerlinNoise {
  constructor(seed = 0) {
    this.seed = seed;
    this.permutation = this.generatePermutation(seed);
    this.p = [...this.permutation, ...this.permutation];
  }

  generatePermutation(seed) {
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(this.seededRandom(seed + i) * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    return p;
  }

  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 8 ? y : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y, z) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const zi = Math.floor(z) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const zf = z - Math.floor(z);

    const u = this.fade(xf);
    const v = this.fade(yf);
    const w = this.fade(zf);

    const aa = this.p[this.p[xi] + yi];
    const ab = this.p[this.p[xi] + yi + 1];
    const ba = this.p[this.p[xi + 1] + yi];
    const bb = this.p[this.p[xi + 1] + yi + 1];

    const aaa = this.p[aa + zi];
    const aab = this.p[aa + zi + 1];
    const aba = this.p[ab + zi];
    const abb = this.p[ab + zi + 1];
    const baa = this.p[ba + zi];
    const bab = this.p[ba + zi + 1];
    const bba = this.p[bb + zi];
    const bbb = this.p[bb + zi + 1];

    let x1 = this.lerp(u, this.grad(aaa, xf, yf, zf), this.grad(baa, xf - 1, yf, zf));
    let x2 = this.lerp(u, this.grad(aba, xf, yf - 1, zf), this.grad(bba, xf - 1, yf - 1, zf));
    let y1 = this.lerp(v, x1, x2);

    x1 = this.lerp(u, this.grad(aab, xf, yf, zf - 1), this.grad(bab, xf - 1, yf, zf - 1));
    x2 = this.lerp(u, this.grad(abb, xf, yf - 1, zf - 1), this.grad(bbb, xf - 1, yf - 1, zf - 1));
    let y2 = this.lerp(v, x1, x2);

    return (this.lerp(w, y1, y2) + 1) / 2;
  }

  turbulence(x, y, z, octaves = 4, persistence = 0.5, lacunarity = 2) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }
}

export function getNoise2D(x, y, scale = 1, octaves = 4) {
  const noise = new PerlinNoise(12345);
  return noise.turbulence(x / scale, y / scale, 0, octaves);
}
