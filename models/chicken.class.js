/**
 * Standard chicken enemy with walk and death animation states.
 * @extends MovableObject
 */
class Chicken extends MovableObject {
    y = 345;
    height = 85;
    width = 85;
    deadAt = null;
    DEAD_REMOVE_DELAY = 2000;
    offset = {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
    };
    IMAGES_WALKING = [
        "./img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "./img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "./img/3_enemies_chicken/chicken_normal/1_walk/3_w.png"
    ];

    IMAGES_DEAD = [
        "./img/3_enemies_chicken/chicken_normal/2_dead/dead.png"
    ];

    /**
     * @param {number} [x] Optional start x position.
     */
    constructor(x) {
        super().loadImage("./img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
        this.x = x !== undefined ? x : 200 + Math.random() * 500;
        this.speed = 0.15 + Math.random() * 0.5;
        this.energy = 1;
        this.world;
        this.animate();
    }

    /**
     * Starts movement and animation loops.
     * @returns {void}
     */
    animate() {
        setInterval(() => {
            if (this.world && this.world.gameStarted && !this.isDead()) {
                this.moveLeft();
            }
        }, 1000 / 60);

        setInterval(() => {
            if (this.world && this.world.gameStarted) {
                if (this.isDead()) {
                    this.playAnimation(this.IMAGES_DEAD);
                } else {
                    this.playAnimation(this.IMAGES_WALKING);
                }
            }
        }, 100);
    }

    /**
     * Sets the enemy as dead and stores the death timestamp.
     * @returns {void}
     */
    markAsDead() {
        if (this.deadAt !== null) {
            return;
        }
        this.energy = 0;
        this.deadAt = Date.now();
    }

    /**
     * Returns true when dead enemy can be removed from rendering.
     * @returns {boolean}
     */
    shouldDisappear() {
        return this.deadAt !== null && Date.now() - this.deadAt >= this.DEAD_REMOVE_DELAY;
    }
}