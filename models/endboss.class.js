class Endboss extends MovableObject {

    height = 400;
    width = 250;
    y = 55;
    speed = 1.7;
    chaseActivated = false;

    IMAGES_WALKING = [
        "./img/4_enemie_boss_chicken/2_alert/G5.png",
        "./img/4_enemie_boss_chicken/2_alert/G6.png",
        "./img/4_enemie_boss_chicken/2_alert/G7.png",
        "./img/4_enemie_boss_chicken/2_alert/G8.png",
        "./img/4_enemie_boss_chicken/2_alert/G9.png",
        "./img/4_enemie_boss_chicken/2_alert/G10.png",
        "./img/4_enemie_boss_chicken/2_alert/G11.png",
        "./img/4_enemie_boss_chicken/2_alert/G12.png"
    ];

    IMAGES_DEAD = [
        "./img/4_enemie_boss_chicken/5_dead/G24.png",
        "./img/4_enemie_boss_chicken/5_dead/G25.png",
        "./img/4_enemie_boss_chicken/5_dead/G26.png"
    ];

    constructor() {
        super().loadImage("./img/4_enemie_boss_chicken/2_alert/G5.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
        this.x = 2500;
        this.energy = 5;
        this.world;
        this.animate();
    }

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
                } else {
                    this.playAnimation(this.IMAGES_WALKING);
                }
            }
        }, 200);
    }

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

    followCharacter() {
        const characterCenterX = this.world.character.x + this.world.character.width / 2;
        const bossCenterX = this.x + this.width / 2;
        const deadZone = 6;

        if (characterCenterX < bossCenterX - deadZone) {
            this.moveLeft();
            this.otherDirection = false;
            return;
        }

        if (characterCenterX > bossCenterX + deadZone) {
            this.moveRight();
            this.otherDirection = true;
        }
    }

    hit() {
        this.energy -= 1;
        if (this.energy < 0) {
            this.energy = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }
}