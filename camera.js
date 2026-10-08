export class CameraController {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;
        this.bobIntensity = 0.02;
        this.bobSpeed = 0.08;
        this.bobTime = 0;
        this.tiltIntensity = 0.01;
        this.baseHeight = 0.85;
    }

    update() {
        // Calculate head bob based on movement
        const isMoving = Math.abs(this.player.velocity.x) > 0.02 || Math.abs(this.player.velocity.z) > 0.02;

        if (isMoving && this.player.isOnGround) {
            this.bobTime += this.bobSpeed;
        } else {
            this.bobTime *= 0.95;
        }

        // Apply head bob to camera
        const bobY = Math.sin(this.bobTime) * this.bobIntensity * (isMoving ? 1 : 0.2);
        const tiltZ = Math.sin(this.bobTime * 0.5) * this.tiltIntensity * (isMoving ? 1 : 0.2);

        const eyePos = this.player.getEyePosition();
        this.camera.position.set(
            eyePos.x,
            eyePos.y + bobY,
            eyePos.z
        );

        // Optional: add subtle tilt when moving
        this.camera.rotation.z = tiltZ;
    }
}
