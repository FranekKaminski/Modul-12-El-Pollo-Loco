class SmallChicken extends MovableObject {
    y = 360;
    height = 60;
    width = 60;
    deadAt = null;
    DEAD_REMOVE_DELAY = 2000;
    offset = {
        top: 8,
        bottom: 8,
        left: 8,
        right: 8,
    };
    IMAGES_WALKING = [
        "./img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
        "./img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
        "./img/3_enemies_chicken/chicken_small/1_walk/3_w.png"
    ];

    IMAGES_DEAD = [
        "./img/3_enemies_chicken/chicken_small/2_dead/dead.png"
    ];

    constructor(x) {
        super().loadImage("./img/3_enemies_chicken/chicken_small/1_walk/1_w.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
        this.x = x !== undefined ? x : 300 + Math.random() * 800;
        this.speed = 0.25 + Math.random() * 0.3;
        this.energy = 1;
        this.world;
        this.animate();
    }

    animate() {
        this.startMoveLoop();
        this.startAnimationLoop();
    }

    startMoveLoop() {
        setInterval(() => {
            if (this.world && this.world.gameStarted && !this.isDead()) {
                this.moveLeft();
            }
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
        }, 100);
    }

    markAsDead() {
        if (this.deadAt !== null) {
            return;
        }
        this.energy = 0;
        this.deadAt = Date.now();
    }

    shouldDisappear() {
        return this.deadAt !== null && Date.now() - this.deadAt >= this.DEAD_REMOVE_DELAY;
    }
}
