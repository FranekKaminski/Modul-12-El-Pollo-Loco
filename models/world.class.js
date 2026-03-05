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
    throwKeyLocked = false;
    exchangeKeyLocked = false;

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

    triggerGameWon() {
        if (this.gameOver) {
            return;
        }
        this.gameOver = true;
        this.gameStarted = false;
        this.character.stopSound(this.character.walking_sound);
        this.character.stopSound(this.character.snoring_sound);
        if (window.showGameWonOverlay) {
            window.showGameWonOverlay();
        }
    }

    run() {
        setInterval(() => {
            if (this.gameStarted) {
                this.runGameTick();
            }
        }, 1000 / 60);
    }

    runGameTick() {
        this.checkCollisions();
        this.checkThrowObjects();
        this.checkCoinBottleExchange();
        if (this.character.isDead()) {
            this.triggerGameOver();
        }
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
        if (!this.keyboard.D) {
            this.throwKeyLocked = false;
            return;
        }

        if (this.throwKeyLocked || this.collectedBottles <= 0) {
            return;
        }

        this.throwBottle();
        this.throwKeyLocked = true;
    }

    throwBottle() {
        let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 50, this.character.otherDirection);
        bottle.world = this;
        this.throwableObjects.push(bottle);
        this.collectedBottles--;
        this.updateBottleStatusbar();
    }

    updateBottleStatusbar() {
        let bottlePercentage = (this.collectedBottles / this.level.bottles.length) * 100;
        this.bottleStatusbar.setPercentage(bottlePercentage);
    }

    checkCoinBottleExchange() {
        if (!this.keyboard.B) {
            this.exchangeKeyLocked = false;
            return;
        }

        if (this.exchangeKeyLocked || !this.canExchangeCoinForBottle()) {
            return;
        }
        this.exchangeCoinForBottle();
        this.lockExchangeKey();
    }

    canExchangeCoinForBottle() {
        return this.collectedCoins > 0 && this.collectedBottles < this.level.bottles.length;
    }

    exchangeCoinForBottle() {
        this.collectedCoins--;
        this.collectedBottles++;
        this.updateCoinStatusbar();
        this.updateBottleStatusbar();
    }

    lockExchangeKey() {
        this.exchangeKeyLocked = true;
    }

    updateCoinStatusbar() {
        let coinPercentage = (this.collectedCoins / this.level.coins.length) * 100;
        this.coinStatusbar.setPercentage(coinPercentage);
    }

    checkCollisions() {
        this.checkEnemyCollisions();
        this.checkCoinCollisions();
        this.checkBottleCollisions();
        this.checkThrowableEnemyCollisions();
    }

    checkEnemyCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (enemy.isDead()) {
                return;
            }
            if (this.isChickenEnemy(enemy) && this.isCharacterJumpingOnEnemy(enemy)) {
                this.squashEnemy(enemy);
                return;
            }
            this.applyEnemyContactDamage(enemy);
        });
    }

    applyEnemyContactDamage(enemy) {
        if (this.character.isColliding(enemy) && this.character.canTakeDamage(1000)) {
            this.character.hit(10);
            this.statusbar.setPercentage(this.character.energy);
        }
    }

    checkCoinCollisions() {
        this.level.coins.forEach((coin) => {
            if (this.character.isColliding(coin) && !coin.collected) {
                this.collectCoin(coin);
            }
        });
    }

    collectCoin(coin) {
        this.collectedCoins++;
        coin.collected = true;
        this.playSound(this.collectSound);
        this.updateCoinStatusbar();
    }

    checkBottleCollisions() {
        this.level.bottles.forEach((bottle) => {
            if (this.character.isColliding(bottle) && !bottle.collected) {
                this.collectBottle(bottle);
            }
        });
    }

    collectBottle(bottle) {
        this.collectedBottles++;
        bottle.collected = true;
        this.playSound(this.bottleCollectSound);
        this.updateBottleStatusbar();
    }

    checkThrowableEnemyCollisions() {
        this.throwableObjects.forEach((throwable) => {
            this.level.enemies.forEach((enemy) => {
                if (!throwable.hasHit && throwable.isColliding(enemy)) {
                    this.handleThrowableHitEnemy(throwable, enemy);
                }
            });
        });
    }

    handleThrowableHitEnemy(throwable, enemy) {
        enemy.hit();
        throwable.hasHit = true;
        this.playSound(this.bottleBreakSound);
        this.handleEnemyDeathByBottle(enemy);
        this.updateEndbossStatus(enemy);
    }

    handleEnemyDeathByBottle(enemy) {
        if (enemy.isDead() && this.isChickenEnemy(enemy)) {
            this.playSound(this.chickenDeadSound);
        }
    }

    updateEndbossStatus(enemy) {
        if (!(enemy instanceof Endboss)) {
            return;
        }
        let endbossPercentage = (enemy.energy / 5) * 100;
        this.endbossStatusbar.setPercentage(endbossPercentage);
        if (enemy.isDead()) {
            this.triggerGameWon();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.gameStarted && !this.gameOver) {
            this.addToMap(this.startScreen);
        } else {
            this.drawActiveGameScene();
        }

        requestAnimationFrame(() => this.draw());
    }

    drawActiveGameScene() {
        this.drawWorldBackground();
        this.drawHud();
        this.drawWorldEntities();
        this.ctx.translate(-this.camera_x, 0);
    }

    drawWorldBackground() {
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
    }

    drawHud() {
        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusbar);
        this.addToMap(this.coinStatusbar);
        this.addToMap(this.bottleStatusbar);
        this.ctx.translate(this.camera_x, 0);
    }

    drawWorldEntities() {
        this.addToMap(this.character);
        this.addEnemiesToMap();
        this.addToMap(this.endbossStatusbar);
        this.addCoinsToMap();
        this.addBottlesToMap();
        this.addThrowablestoMap();
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
            if (!this.shouldHideEnemy(enemy)) {
                this.addToMap(enemy);
            }
        });
    }

    shouldHideEnemy(enemy) {
        if (enemy instanceof Endboss) {
            return false;
        }
        if (typeof enemy.shouldDisappear === "function") {
            return enemy.shouldDisappear();
        }
        return enemy.isDead();
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

    isCharacterJumpingOnEnemy(enemy) {
        const stompBounds = this.getStompBounds(enemy);
        const isFalling = this.character.speedY < 0;
        const horizontalOverlap = stompBounds.characterRight > stompBounds.enemyLeft
            && stompBounds.characterLeft < stompBounds.enemyRight;
        const verticalOverlap = stompBounds.characterBottom >= stompBounds.enemyTop - 8
            && stompBounds.characterBottom <= stompBounds.enemyMiddleY;
        return isFalling && horizontalOverlap && verticalOverlap;
    }

    getStompBounds(enemy) {
        return {
            characterLeft: this.character.x + this.character.offset.left,
            characterRight: this.character.x + this.character.width - this.character.offset.right,
            characterBottom: this.character.y + this.character.height - this.character.offset.bottom,
            enemyLeft: enemy.x + enemy.offset.left - 10,
            enemyRight: enemy.x + enemy.width - enemy.offset.right + 10,
            enemyTop: enemy.y + enemy.offset.top,
            enemyMiddleY: enemy.y + enemy.height * 0.45
        };
    }

    isChickenEnemy(enemy) {
        return enemy instanceof Chicken || (typeof SmallChicken !== 'undefined' && enemy instanceof SmallChicken);
    }

    squashEnemy(enemy) {
        if (typeof enemy.markAsDead === "function") {
            enemy.markAsDead();
        } else {
            enemy.energy = 0;
        }
        this.playSound(this.chickenDeadSound);
    }

}