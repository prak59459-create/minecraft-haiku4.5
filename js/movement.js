class MovementController {
    constructor() {
        this.moveDirection = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.stamina = 100;
        this.maxStamina = 100;
        this.staminaDrain = 0.3; // Per frame while sprinting
        this.staminaRecover = 0.2; // Per frame while resting

        this.canSprint = true;
        this.isSprinting = false;

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                    this.moveForward = true;
                    break;
                case 'a':
                    this.moveLeft = true;
                    break;
                case 's':
                    this.moveBackward = true;
                    break;
                case 'd':
                    this.moveRight = true;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w':
                    this.moveForward = false;
                    break;
                case 'a':
                    this.moveLeft = false;
                    break;
                case 's':
                    this.moveBackward = false;
                    break;
                case 'd':
                    this.moveRight = false;
                    break;
            }
        });
    }

    updateStamina() {
        if (this.isSprinting && (this.moveForward || this.moveBackward)) {
            this.stamina = Math.max(0, this.stamina - this.staminaDrain);

            if (this.stamina === 0) {
                this.canSprint = false;
            }
        } else {
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRecover);

            if (this.stamina > this.maxStamina * 0.5) {
                this.canSprint = true;
            }
        }
    }

    getMovementVector(forward, right, speed) {
        const moveDir = new THREE.Vector3();

        if (this.moveForward) moveDir.addScaledVector(forward, speed);
        if (this.moveBackward) moveDir.addScaledVector(forward, -speed);
        if (this.moveRight) moveDir.addScaledVector(right, speed);
        if (this.moveLeft) moveDir.addScaledVector(right, -speed);

        return moveDir;
    }

    getStaminaPercentage() {
        return this.stamina / this.maxStamina;
    }
}
