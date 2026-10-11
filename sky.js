export class SkyRenderer {
    constructor(scene) {
        this.scene = scene;
        this.cloudMesh = null;
        this.createClouds();
        this.time = 0;
    }

    createClouds() {
        const cloudGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];

        const gridSize = 8;
        const scale = 64;

        for (let x = -gridSize; x <= gridSize; x++) {
            for (let z = -gridSize; z <= gridSize; z++) {
                const vx = x * scale;
                const vz = z * scale;
                const vy = 200;

                vertices.push(vx, vy, vz);
                colors.push(1, 1, 1);
            }
        }

        cloudGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        cloudGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

        const cloudMaterial = new THREE.PointsMaterial({
            size: 30,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.4,
            fog: false
        });

        this.cloudMesh = new THREE.Points(cloudGeometry, cloudMaterial);
        this.scene.add(this.cloudMesh);
    }

    update(playerPos) {
        this.time += 0.0001;

        if (this.cloudMesh) {
            this.cloudMesh.position.x = Math.floor(playerPos.x / 64) * 64;
            this.cloudMesh.position.z = Math.floor(playerPos.z / 64) * 64;

            const material = this.cloudMesh.material;
            material.opacity = 0.3 + Math.sin(this.time * 2) * 0.1;
        }
    }
}
