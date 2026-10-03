import * as THREE from 'three';

export class EnvironmentManager {
  scene: THREE.Scene;
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
  timeOfDay: number = 0.25; // 0-1, where 0.25 is sunrise

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);

    this.scene.add(this.ambientLight);
    this.scene.add(this.directionalLight);

    this.updateLighting();
  }

  update(deltaTime: number) {
    this.timeOfDay += deltaTime * 0.0001; // Very slow cycle
    if (this.timeOfDay > 1) this.timeOfDay -= 1;
    this.updateLighting();
  }

  private updateLighting() {
    const time = this.timeOfDay * Math.PI * 2;

    // Sky color changes based on time of day
    const skyColor = this.getSkyColor(this.timeOfDay);
    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.Fog(skyColor, 256, 512);

    // Sun position
    const sunDistance = 200;
    this.directionalLight.position.set(
      Math.cos(time - Math.PI / 2) * sunDistance,
      Math.sin(time - Math.PI / 2) * sunDistance + 100,
      50
    );

    // Lighting intensity based on time
    const lightIntensity = Math.max(0.1, Math.sin(time - Math.PI / 2 + Math.PI) * 0.5 + 0.5);
    this.directionalLight.intensity = lightIntensity * 0.8;
    this.ambientLight.intensity = lightIntensity * 0.6 + 0.2;
  }

  private getSkyColor(time: number): string {
    const hour = time * 24;

    if (hour < 6 || hour > 20) {
      // Night
      return '#001a4d';
    } else if (hour < 7) {
      // Sunrise
      const t = (hour - 6);
      return this.lerpColor('#001a4d', '#87ceeb', t);
    } else if (hour < 18) {
      // Day
      return '#87ceeb';
    } else {
      // Sunset
      const t = (hour - 18) / 2;
      return this.lerpColor('#87ceeb', '#ff6b35', t);
    }
  }

  private lerpColor(color1: string, color2: string, t: number): string {
    const c1 = parseInt(color1.substring(1), 16);
    const c2 = parseInt(color2.substring(1), 16);

    const r1 = (c1 >> 16) & 255;
    const g1 = (c1 >> 8) & 255;
    const b1 = c1 & 255;

    const r2 = (c2 >> 16) & 255;
    const g2 = (c2 >> 8) & 255;
    const b2 = c2 & 255;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}
