class ThrowableObject extends MovableObject {

    constructor(x, y, direction) {
        super().loadImage("img/6_salsa_bottle/salsa_bottle.png");
        this.x = x;
        this.y = y;
        this.height = 100;
        this.width = 100;
        this.hasHit = false;
        this.throw(direction);
    }


    throw(direction) {
        this.speedY = 30;
        this.applyGravity();
        setInterval( () => {
            if (direction) {
                // Throw to the left
                this.x -= 5;
            } else {
                // Throw to the right
                this.x += 5;
            }
        }, 25);
    }
}