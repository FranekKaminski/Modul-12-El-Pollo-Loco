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
    collectSound = new Audio("./audio/collectibles/collectSound.wav");
    bottleCollectSound = new Audio("./audio/collectibles/bottleCollectSound.wav");
    endbossApproachSound = new Audio("./audio/endboss/endbossApproach.wav");
    gameStartSound = new Audio("./audio/game/gameStart.mp3");
    bottleBreakSound = new Audio("./audio/throwable/bottleBreak.mp3");
    chickenDeadSound = new Audio("./audio/chicken/chickenDead.mp3");
    endbossApproachPlayed = false;
    gameOver = false;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.endbossStatusbar = new EndbossStatusbar(this.level.enemies[this.level.enemies.length - 1]);
        this.registerAudioAssets();
        this.draw();
        this.setWorld();
        this.run();
    }

    registerAudioAssets() {
        if (window.registerGameAudio) {
            window.registerGameAudio(this.collectSound);
            window.registerGameAudio(this.bottleCollectSound);
            window.registerGameAudio(this.endbossApproachSound);
            window.registerGameAudio(this.gameStartSound);
            window.registerGameAudio(this.bottleBreakSound);
            window.registerGameAudio(this.chickenDeadSound);
        }
    }

    applyCurrentVolume(sound) {
        if (window.getGameVolume) {
            sound.volume = window.getGameVolume();
            sound.muted = sound.volume === 0;
        }
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => {
            enemy.world = this;
        });
    }

    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.playSound(this.gameStartSound);
    }

    triggerGameOver() {
        if (this.gameOver) {
            return;
        }
        this.gameOver = true;
        this.gameStarted = false;
        this.character.stopSound(this.character.walking_sound);
        this.character.stopSound(this.character.snoring_sound);
        if (window.showGameOverOverlay) {
            window.showGameOverOverlay();
        }
    }

    run() {
        setInterval(() => {
            if (this.gameStarted) {
                this.checkCollisions();
                this.checkThrowObjects();
                if (this.character.isDead()) {
                    this.triggerGameOver();
                }
            }
        }, 200);
    }

    playSound(sound) {
        this.applyCurrentVolume(sound);
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    isObjectVisible(mo) {
        let viewportLeft = -this.camera_x;
        let viewportRight = viewportLeft + this.canvas.width;
        let objectRight = mo.x + mo.width;
        return objectRight >= viewportLeft && mo.x <= viewportRight;
    }

    checkThrowObjects() {
        if(this.keyboard.D && this.collectedBottles > 0) {
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 50, this.character.otherDirection);
            bottle.world = this;
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
                this.playSound(this.collectSound);
                let coinPercentage = (this.collectedCoins / this.level.coins.length) * 100;
                this.coinStatusbar.setPercentage(coinPercentage);
            }
        });

        this.level.bottles.forEach((bottle) => {
            if (this.character.isColliding(bottle) && !bottle.collected) {
                this.collectedBottles++;
                bottle.collected = true;
                this.playSound(this.bottleCollectSound);
                let bottlePercentage = (this.collectedBottles / this.level.bottles.length) * 100;
                this.bottleStatusbar.setPercentage(bottlePercentage);
            }
        });

        this.throwableObjects.forEach((throwable) => {
            this.level.enemies.forEach((enemy) => {
                if (!throwable.hasHit && throwable.isColliding(enemy)) {
                    enemy.hit();
                    throwable.hasHit = true;
                    this.playSound(this.bottleBreakSound);
                    if (enemy instanceof Chicken && enemy.isDead()) {
                        this.playSound(this.chickenDeadSound);
                    }
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

        if (!this.gameStarted && !this.gameOver) {
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
            if (enemy instanceof Endboss && !this.endbossApproachPlayed && this.isObjectVisible(enemy)) {
                this.playSound(this.endbossApproachSound);
                this.endbossApproachPlayed = true;
            }
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