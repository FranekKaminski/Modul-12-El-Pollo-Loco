class ThrowableObject extends MovableObject {
    world;

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
        this.startThrowLoop(direction);
    }

    startThrowLoop(direction) {
        setInterval( () => {
            if (this.shouldSkipThrowFrame()) {
                return;
            }
            this.moveThrownBottle(direction);
        }, 25);
    }

    shouldSkipThrowFrame() {
        return this.world && (!this.world.gameStarted || this.world.gameOver);
    }

    moveThrownBottle(direction) {
        if (direction) {
            this.x -= 5;
            return;
        }
        this.x += 5;
    }
}