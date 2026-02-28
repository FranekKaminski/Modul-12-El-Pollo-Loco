class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusbar = new Statusbar();
    coinStatusbar = new CoinStatusbar();
    bottleStatusbar = new BottleStatusbar();
    endbossStatusbar;
    startScreen = new StartScreen();
    gameStarted = false;
    throwableObjects = [];
    collectedCoins = 0;
    collectedBottles = 0;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.endbossStatusbar = new EndbossStatusbar(this.level.enemies[this.level.enemies.length - 1]);
        this.draw();
        this.setWorld();
        this.run();
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => {
            enemy.world = this;
        });
    }

    startGame() {
        this.gameStarted = true;
    }

    run() {
        setInterval(() => {
            if (this.gameStarted) {
                this.checkCollisions();
                this.checkThrowObjects();
            }
        }, 200);
    }

    checkThrowObjects() {
        if(this.keyboard.D && this.collectedBottles > 0) {
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 50, this.character.otherDirection);
            this.throwableObjects.push(bottle);
            this.collectedBottles--;
            let bottlePercentage = (this.collectedBottles / this.level.bottles.length) * 100;
            this.bottleStatusbar.setPercentage(bottlePercentage);
        }
    }

    checkCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (!enemy.isDead() && this.character.isColliding(enemy)) {
                this.character.hit();
                this.statusbar.setPercentage(this.character.energy);
            }
        });

        this.level.coins.forEach((coin) => {
            if (this.character.isColliding(coin) && !coin.collected) {
                this.collectedCoins++;
                coin.collected = true;
                let coinPercentage = (this.collectedCoins / this.level.coins.length) * 100;
                this.coinStatusbar.setPercentage(coinPercentage);
            }
        });

        this.level.bottles.forEach((bottle) => {
            if (this.character.isColliding(bottle) && !bottle.collected) {
                this.collectedBottles++;
                bottle.collected = true;
                let bottlePercentage = (this.collectedBottles / this.level.bottles.length) * 100;
                this.bottleStatusbar.setPercentage(bottlePercentage);
            }
        });

        this.throwableObjects.forEach((throwable) => {
            this.level.enemies.forEach((enemy) => {
                if (!throwable.hasHit && throwable.isColliding(enemy)) {
                    enemy.hit();
                    throwable.hasHit = true;
                    if (enemy instanceof Endboss) {
                        let endbossPercentage = (enemy.energy / 5) * 100;
                        this.endbossStatusbar.setPercentage(endbossPercentage);
                    }
                }
            });
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.gameStarted) {
            this.addToMap(this.startScreen);
        } else {
            this.ctx.translate(this.camera_x, 0);
            this.addObjectsToMap(this.level.backgroundObjects);
            this.addObjectsToMap(this.level.clouds);



            this.ctx.translate(-this.camera_x, 0);
            this.addToMap(this.statusbar);
            this.addToMap(this.coinStatusbar);
            this.addToMap(this.bottleStatusbar);
            this.ctx.translate(this.camera_x, 0);


            this.addToMap(this.character);
            this.addEnemiesToMap();
            this.addToMap(this.endbossStatusbar);
            this.addCoinsToMap();
            this.addBottlesToMap();
            this.addThrowablestoMap();

            this.ctx.translate(-this.camera_x, 0);
        }

        // draw() wird immer wieder aufgerufen
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    addCoinsToMap() {
        this.level.coins.forEach((coin) => {
            if (!coin.collected) {
                coin.playAnimation(coin.COIN_IMAGE);
                this.addToMap(coin);
            }
        });
    }

    addBottlesToMap() {
        this.level.bottles.forEach((bottle) => {
            if (!bottle.collected) {
                this.addToMap(bottle);
            }
        });
    }

    addEnemiesToMap() {
        this.level.enemies.forEach((enemy) => {
            if (enemy instanceof Endboss || !enemy.isDead()) {
                this.addToMap(enemy);
            }
        });
    }

    addThrowablestoMap() {
        this.throwableObjects.forEach((throwable) => {
            if (!throwable.hasHit) {
                this.addToMap(throwable);
            }
        });
    }

    addObjectsToMap(objects) {
        objects.forEach(o => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo)
        }

        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);

        if (mo.otherDirection) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }

}