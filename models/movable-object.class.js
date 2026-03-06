/**
 * Adds movement, gravity and collision behavior to drawable objects.
 * @extends DrawableObject
 */
class MovableObject extends DrawableObject {
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;
    offset = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    };

    /**
     * Starts the gravity loop for the object.
     * @returns {void}
     */
    applyGravity() {
        setInterval(() => {
            if (this.world && (!this.world.gameStarted || this.world.gameOver)) {
                return;
            }
            if (this.IsAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 25);
    }

    /**
     * Checks whether the object is currently above ground.
     * @returns {boolean}
     */
    IsAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            return this.y < 150;
        }
    }

    /**
     * Performs an axis-aligned bounding box collision check.
     * @param {MovableObject} mo Other movable object.
     * @returns {boolean}
     */
    isColliding(mo) {
        return this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
            this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
            this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
            this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom;
    }

    /**
     * Applies damage to this object.
     * @param {number} [damage=5] Damage points.
     * @returns {void}
     */
    hit(damage = 5) {
        this.energy -= damage;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    /**
     * Checks whether damage cooldown has passed.
     * @param {number} [cooldownMs=1000] Cooldown in milliseconds.
     * @returns {boolean}
     */
    canTakeDamage(cooldownMs = 1000) {
        return new Date().getTime() - this.lastHit >= cooldownMs;
    }

    /**
     * Returns whether the object is in a short hurt state.
     * @returns {boolean}
     */
    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 0.3;
    }

    /**
     * Returns whether the object has no energy left.
     * @returns {boolean}
     */
    isDead() {
        return this.energy == 0;
    }


    //     if(character.x + character.width > chicken.x &&
    //         character.y + character.height > chicken.y &&
    //         character.x < chicken.x &&
    //         character.y < chicken.y + chicken.height
    // )

    /**
     * Advances to the next frame in an animation sprite list.
     * @param {string[]} images Sprite frame paths.
     * @returns {void}
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /**
     * Moves the object to the right.
     * @returns {void}
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * Moves the object to the left.
     * @returns {void}
     */
    moveLeft() {
        this.x -= this.speed;
    }

    /**
     * Applies upward jump impulse.
     * @returns {void}
     */
    jump() {
        this.speedY = 30;
    }
}