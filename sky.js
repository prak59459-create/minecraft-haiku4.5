export class SkyRenderer {
    constructor(scene) {
        this.scene = scene;
        this.skyMesh = null;
        this.clouds = [];
        this.cloudGroup = new THREE.Group();
        this.scene.add(this.cloudGroup);
        this.time = 0;

        this.setupSky();
        this.generateClouds();
    }

    setupSky() {
        const geometry = new THREE.SphereGeometry(500, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            color: 0x87CEEB
        });
        this.skyMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.skyMesh);
    }

    generateClouds() {
        const cloudCount = 20;
        for (let i = 0; i < cloudCount; i++) {
            const cloudGeometry = new THREE.BoxGeometry(
                20 + Math.random() * 30,
                10 + Math.random() * 15,
                20 + Math.random() * 30
            );

            const cloudMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.6
            });

            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 400,
                200 + Math.random() * 100,
                (Math.random() - 0.5) * 400
            );
            cloud.scale.set(1 + Math.random() * 0.5, 0.5, 1 + Math.random() * 0.5);

            this.cloudGroup.add(cloud);
            this.clouds.push({
                mesh: cloud,
                baseX: cloud.position.x,
                baseZ: cloud.position.z,
                speed: 0.02 + Math.random() * 0.05
            });
        }
    }

    update(playerPos) {
        this.time += 0.001;

        for (const cloud of this.clouds) {
            cloud.mesh.position.x = cloud.baseX + Math.sin(this.time * cloud.speed) * 50;
            cloud.mesh.position.z = cloud.baseZ + Math.cos(this.time * cloud.speed * 0.7) * 50;
            cloud.mesh.position.y = 200 + Math.sin(this.time * cloud.speed * 0.3) * 10;
        }

        if (this.skyMesh) {
            this.skyMesh.position.copy(playerPos);
            this.skyMesh.position.y = playerPos.y;
        }
    }

    updateSkyColor(sunIntensity) {
        if (this.skyMesh && this.skyMesh.material) {
            let hue = 0.6;
            let saturation = 0.5;
            let lightness = 0.45 + sunIntensity * 0.35;

            const color = new THREE.Color();
            if (sunIntensity < 0.3) {
                hue = 0.75;
                saturation = 0.2;
                lightness = 0.2;
            }
            color.setHSL(hue, saturation, lightness);
            this.skyMesh.material.color.copy(color);
        }
    }
}
