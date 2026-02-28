class Chicken extends MovableObject {
    y = 345;
    height = 85;
    width = 85;
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

    constructor(x) {
        super().loadImage("./img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.loadImages(this.IMAGES_WALKING);
        this.x = x !== undefined ? x : 200 + Math.random() * 500;
        this.speed = 0.15 + Math.random() * 0.5;
        this.energy = 1;
        this.world;
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (this.world && this.world.gameStarted) {
                this.moveLeft();
            }
        }, 1000 / 60)
        setInterval(() => {
            if (this.world && this.world.gameStarted) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 100);
    }
}