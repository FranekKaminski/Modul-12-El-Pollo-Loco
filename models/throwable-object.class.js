/**
 * Throwable bottle projectile with splash animation on impact.
 * @extends MovableObject
 */
class ThrowableObject extends MovableObject {
    world;
    GROUND_Y = 360;
    SPLASH_IMAGES = [
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
        "img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png"
    ];

    /**
     * @param {number} x Start x position.
     * @param {number} y Start y position.
     * @param {boolean} direction Throw direction (true for left).
     */
    constructor(x, y, direction) {
        super().loadImage("img/6_salsa_bottle/salsa_bottle.png");
        this.loadImages(this.SPLASH_IMAGES);
        this.x = x;
        this.y = y;
        this.height = 100;
        this.width = 100;
        this.hasHit = false;
        this.splashFinished = false;
        this.splashAnimationStarted = false;
        this.throw(direction);
    }


    /**
     * Initializes throw physics and movement loop.
     * @param {boolean} direction Throw direction (true for left).
     * @returns {void}
     */
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
            if (this.hasHit) {
                return;
            }
            this.moveThrownBottle(direction);
            this.checkGroundImpact();
        }, 25);
    }

    /**
     * Returns true if projectile logic should pause for current frame.
     * @returns {boolean}
     */
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

    checkGroundImpact() {
        if (this.y >= this.GROUND_Y) {
            this.y = this.GROUND_Y;
            this.markAsHit();
        }
    }

    /**
     * Marks projectile as hit and starts splash sequence.
     * @returns {void}
     */
    markAsHit() {
        if (this.hasHit) {
            return;
        }
        this.hasHit = true;
        this.speedY = 0;
        this.startSplashAnimation();
    }

    /**
     * Plays splash frames and flags projectile as finished.
     * @returns {void}
     */
    startSplashAnimation() {
        if (this.splashAnimationStarted) {
            return;
        }
        this.splashAnimationStarted = true;
        let splashFrameIndex = 0;

        const splashInterval = setInterval(() => {
            if (this.shouldSkipThrowFrame()) {
                return;
            }

            if (splashFrameIndex >= this.SPLASH_IMAGES.length) {
                clearInterval(splashInterval);
                this.splashFinished = true;
                return;
            }

            const framePath = this.SPLASH_IMAGES[splashFrameIndex];
            this.img = this.imageCache[framePath];
            splashFrameIndex++;
        }, 60);
    }
}