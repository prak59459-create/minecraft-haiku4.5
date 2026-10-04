export class SkyRenderer {
    constructor(scene) {
        this.scene = scene;
        this.time = 0;
        this.clouds = new Map();
        this.createClouds();
    }

    createClouds() {
        const cloudCount = 20;
        for (let i = 0; i < cloudCount; i++) {
            const x = Math.random() * 500 - 250;
            const z = Math.random() * 500 - 250;
            const y = 120 + Math.random() * 20;

            const cloudGeometry = new THREE.BoxGeometry(20, 5, 15);
            const cloudMaterial = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7,
                emissive: 0xcccccc
            });
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(x, y, z);
            this.scene.add(cloud);

            this.clouds.set(`cloud_${i}`, {
                mesh: cloud,
                baseX: x,
                baseZ: z,
                speed: Math.random() * 0.005 + 0.002
            });
        }
    }

    update() {
        this.time += 0.016;

        for (const cloud of this.clouds.values()) {
            cloud.mesh.position.x = cloud.baseX + Math.sin(this.time * cloud.speed) * 50;
            cloud.mesh.position.z = cloud.baseZ + Math.cos(this.time * cloud.speed * 0.7) * 50;

            const baseOpacity = 0.7;
            const opacityVariation = Math.sin(this.time * 0.5) * 0.1;
            cloud.mesh.material.opacity = Math.max(0.5, baseOpacity + opacityVariation);
        }
    }

    updateSkyColor(color) {
        for (const cloud of this.clouds.values()) {
            const mixedColor = new THREE.Color(color);
            mixedColor.lerp(new THREE.Color(0xffffff), 0.3);
            cloud.mesh.material.color.copy(mixedColor);
        }
    }
}
