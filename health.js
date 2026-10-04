export class HealthSystem {
    constructor() {
        this.health = 20;
        this.maxHealth = 20;
        this.hunger = 20;
        this.maxHunger = 20;
        this.saturation = 5;
        this.damageCooldown = 0;
        this.damageRegenTime = 300;
        this.lastDamageTime = 0;
    }

    takeDamage(amount) {
        const now = Date.now();
        if (now - this.lastDamageTime < 500) return;

        this.health = Math.max(0, this.health - amount);
        this.lastDamageTime = now;

        if (this.health <= 0) {
            this.respawn();
        }

        return this.health;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    consumeFood(foodValue, saturationValue) {
        if (this.hunger >= this.maxHunger) return false;

        this.hunger = Math.min(this.maxHunger, this.hunger + foodValue);
        this.saturation = Math.min(this.saturation + saturationValue, this.hunger);
        return true;
    }

    update() {
        const now = Date.now();
        if (now - this.lastDamageTime > this.damageRegenTime && this.hunger > 18 && this.health < this.maxHealth) {
            this.heal(0.5);
        }

        if (Math.random() < 0.01) {
            this.hunger = Math.max(0, this.hunger - 0.1);
        }

        this.saturation = Math.max(0, this.saturation - 0.01);
    }

    respawn() {
        this.health = this.maxHealth;
        this.hunger = 20;
        this.saturation = 5;
    }

    isDead() {
        return this.health <= 0;
    }

    getHealthPercentage() {
        return (this.health / this.maxHealth) * 100;
    }

    getHungerPercentage() {
        return (this.hunger / this.maxHunger) * 100;
    }
}
