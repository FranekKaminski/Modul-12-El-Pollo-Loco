class Bottle extends MovableObject {
    width = 60;
    height = 60;
    offset = {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
    };
    BOTTLE_IMAGE = ["img/6_salsa_bottle/salsa_bottle.png"];
    collected = false;

    constructor() {
        super().loadImage(this.BOTTLE_IMAGE[0]);
        this.loadImages(this.BOTTLE_IMAGE);
        this.y = 360;
        this.x = 300 + Math.random() * 1500;
    }
}
