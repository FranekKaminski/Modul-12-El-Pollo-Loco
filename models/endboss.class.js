/**
 * Endboss enemy with idle, walk, hurt and death states.
 * @extends MovableObject
 */
class Endboss extends MovableObject {

    height = 400;
    width = 250;
    y = 55;
    speed = 1.7;
    chaseActivated = false;
    isMoving = false;
    offset = {
        top: 12,
        bottom: 20,
        left: 18,
        right: 18,
    };

    IMAGES_WALKING = [
        "./img/4_enemie_boss_chicken/1_walk/G1.png",
        "./img/4_enemie_boss_chicken/1_walk/G2.png",
        "./img/4_enemie_boss_chicken/1_walk/G3.png",
        "./img/4_enemie_boss_chicken/1_walk/G4.png"
    ];

    IMAGES_ALERT = [
        "./img/4_enemie_boss_chicken/2_alert/G5.png",
        "./img/4_enemie_boss_chicken/2_alert/G6.png",
        "./img/4_enemie_boss_chicken/2_alert/G7.png",
        "./img/4_enemie_boss_chicken/2_alert/G8.png",
        "./img/4_enemie_boss_chicken/2_alert/G9.png",
        "./img/4_enemie_boss_chicken/2_alert/G10.png",
        "./img/4_enemie_boss_chicken/2_alert/G11.png",
        "./img/4_enemie_boss_chicken/2_alert/G12.png"
    ];

    IMAGES_HURT = [
        "./img/4_enemie_boss_chicken/4_hurt/G21.png",
        "./img/4_enemie_boss_chicken/4_hurt/G22.png",
        "./img/4_enemie_boss_chicken/4_hurt/G23.png"
    ];

    IMAGES_DEAD = [
        "./img/4_enemie_boss_chicken/5_dead/G24.png",
        "./img/4_enemie_boss_chicken/5_dead/G25.png",
        "./img/4_enemie_boss_chicken/5_dead/G26.png"
    ];

    /**
     * Creates the endboss and preloads all animation frames.
     */
    constructor() {
        super().loadImage("./img/4_enemie_boss_chicken/1_walk/G1.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 2500;
        this.energy = 5;
        this.world;
        this.animate();
    }

    /**
     * Starts movement and animation loops.
     * @returns {void}
     */
    animate() {
        this.startMovementLoop();
        this.startAnimationLoop();
    }

    startMovementLoop() {
        setInterval(() => {
            if (!this.world || !this.world.gameStarted || this.isDead()) {
                return;
            }
            if (!this.shouldChaseCharacter()) {
                this.isMoving = false;
                return;
            }
            this.followCharacter();
        }, 1000 / 60);
    }

    startAnimationLoop() {
        setInterval(() => {
            if (this.world && this.world.gameStarted) {
                if (this.isDead()) {
                    this.playAnimation(this.IMAGES_DEAD);
                } else if (this.isHurt()) {
                    this.playAnimation(this.IMAGES_HURT);
                } else if (this.isMoving) {
                    this.playAnimation(this.IMAGES_WALKING);
                } else {
                    this.playAnimation(this.IMAGES_ALERT);
                }
            }
        }, 200);
    }

    /**
     * Decides whether the endboss should actively chase the character.
     * @returns {boolean}
     */
    shouldChaseCharacter() {
        if (this.chaseActivated) {
            return true;
        }
        if (this.world.isObjectVisible(this)) {
            this.chaseActivated = true;
            return true;
        }
        return false;
    }

    /**
     * Moves endboss toward the character if outside a dead zone.
     * @returns {void}
     */
    followCharacter() {
        const characterCenterX = this.world.character.x + this.world.character.width / 2;
        const bossCenterX = this.x + this.width / 2;
        const deadZone = 6;
        this.isMoving = false;

        if (characterCenterX < bossCenterX - deadZone) {
            this.moveLeft();
            this.otherDirection = false;
            this.isMoving = true;
            return;
        }

        if (characterCenterX > bossCenterX + deadZone) {
            this.moveRight();
            this.otherDirection = true;
            this.isMoving = true;
        }
    }

    /**
     * Applies one point of damage to the endboss.
     * @returns {void}
     */
    hit() {
        this.energy -= 1;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }
}