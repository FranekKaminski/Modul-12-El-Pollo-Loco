/**
 * Central game orchestrator that manages entities, collisions and rendering.
 */
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
    buyCoinSound = new Audio("./audio/buycoin/buycoin.wav");
    endbossApproachSound = new Audio("./audio/endboss/endbossApproach.wav");
    gameStartSound = new Audio("./audio/game/gameStart.mp3");
    bottleBreakSound = new Audio("./audio/throwable/bottleBreak.mp3");
    chickenDeadSound = new Audio("./audio/chicken/chickenDead.mp3");
    endbossApproachPlayed = false;
    gameOver = false;
    destroyed = false;
    throwKeyLocked = false;
    exchangeKeyLocked = false;

    /**
     * @param {HTMLCanvasElement} canvas Game canvas element.
     * @param {Keyboard} keyboard Keyboard state container.
     */
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

    /**
     * Registers world-level audio in global volume handling.
     * @returns {void}
     */
    registerAudioAssets() {
        if (window.registerGameAudio) {
            window.registerGameAudio(this.collectSound);
            window.registerGameAudio(this.bottleCollectSound);
            window.registerGameAudio(this.buyCoinSound);
            window.registerGameAudio(this.endbossApproachSound);
            window.registerGameAudio(this.gameStartSound);
            window.registerGameAudio(this.bottleBreakSound);
            window.registerGameAudio(this.chickenDeadSound);
        }
    }

    /**
     * Applies current global volume to a world sound effect.
     * @param {HTMLAudioElement} sound Sound instance.
     * @returns {void}
     */
    applyCurrentVolume(sound) {
        if (window.getGameVolume) {
            sound.volume = window.getGameVolume();
            sound.muted = sound.volume === 0;
        }
    }

    /**
     * Links world references to child entities.
     * @returns {void}
     */
    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => {
            enemy.world = this;
        });
    }

    /**
     * Starts active gameplay from the start screen.
     * @returns {void}
     */
    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.character.idleSince = Date.now();
        this.playSound(this.gameStartSound);
    }

    /**
     * Marks game as lost and shows lose overlay.
     * @returns {void}
     */
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

    /**
     * Marks game as won and shows win overlay.
     * @returns {void}
     */
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

    /**
     * Starts the main game tick loop.
     * @returns {void}
     */
    run() {
        setInterval(() => {
            if (this.destroyed) {
                return;
            }
            if (this.gameStarted) {
                this.runGameTick();
            }
        }, 1000 / 60);
    }

    /**
     * Cleans up world runtime state for restart.
     * @returns {void}
     */
    destroy() {
        this.destroyed = true;
        this.gameStarted = false;
        this.gameOver = true;
        this.character.stopSound(this.character.walking_sound);
        this.character.stopSound(this.character.snoring_sound);
    }

    /**
     * Executes one gameplay tick.
     * @returns {void}
     */
    runGameTick() {
        this.checkCollisions();
        this.checkThrowObjects();
        this.checkCoinBottleExchange();
        if (this.character.isDead()) {
            this.triggerGameOver();
        }
    }

    /**
     * Spawns a throwable bottle and updates inventory.
     * @returns {void}
     */
    throwBottle() {
        let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 50, this.character.otherDirection);
        bottle.world = this;
        this.throwableObjects.push(bottle);
        this.collectedBottles--;
        this.updateBottleStatusbar();
    }

    /**
     * Handles coin-to-bottle exchange input and locking.
     * @returns {void}
     */
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

    /**
     * Returns whether a coin can currently be exchanged for a bottle.
     * @returns {boolean}
     */
    canExchangeCoinForBottle() {
        return this.collectedCoins > 0 && this.collectedBottles < this.level.bottles.length;
    }

    /**
     * Exchanges one coin for one bottle and updates HUD.
     * @returns {void}
     */
    exchangeCoinForBottle() {
        this.collectedCoins--;
        this.collectedBottles++;
        this.playSound(this.buyCoinSound);
        this.updateCoinStatusbar();
        this.updateBottleStatusbar();
    }

    /**
     * Locks coin exchange until key is released.
     * @returns {void}
     */
    lockExchangeKey() {
        this.exchangeKeyLocked = true;
    }

    /**
     * Syncs coin status bar with collected coin count.
     * @returns {void}
     */
    updateCoinStatusbar() {
        let coinPercentage = (this.collectedCoins / this.level.coins.length) * 100;
        this.coinStatusbar.setPercentage(coinPercentage);
    }

    /**
     * Runs all world collision checks.
     * @returns {void}
     */
    checkCollisions() {
        this.checkEnemyCollisions();
        this.checkCoinCollisions();
        this.checkBottleCollisions();
        this.checkThrowableEnemyCollisions();
    }

    /**
     * Handles character-vs-enemy interactions each frame.
     * @returns {void}
     */
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

    /**
     * Applies contact damage when the character touches an enemy.
     * @param {MovableObject} enemy Enemy instance.
     * @returns {void}
     */
    applyEnemyContactDamage(enemy) {
        if (this.character.isColliding(enemy) && this.character.canTakeDamage(1000)) {
            this.character.hit(10);
            this.statusbar.setPercentage(this.character.energy);
        }
    }

    /**
     * Checks coin pickup collisions.
     * @returns {void}
     */
    checkCoinCollisions() {
        this.level.coins.forEach((coin) => {
            if (this.character.isColliding(coin) && !coin.collected) {
                this.collectCoin(coin);
            }
        });
    }

    /**
     * Collects a coin and updates related state.
     * @param {Coin} coin Coin instance.
     * @returns {void}
     */
    collectCoin(coin) {
        this.collectedCoins++;
        coin.collected = true;
        this.playSound(this.collectSound);
        this.updateCoinStatusbar();
    }

    /**
     * Checks bottle pickup collisions.
     * @returns {void}
     */
    checkBottleCollisions() {
        this.level.bottles.forEach((bottle) => {
            if (this.character.isColliding(bottle) && !bottle.collected) {
                this.collectBottle(bottle);
            }
        });
    }

    /**
     * Collects a bottle and updates related state.
     * @param {Bottle} bottle Bottle instance.
     * @returns {void}
     */
    collectBottle(bottle) {
        this.collectedBottles++;
        bottle.collected = true;
        this.playSound(this.bottleCollectSound);
        this.updateBottleStatusbar();
    }

    /**
     * Handles collisions between thrown bottles and enemies.
     * @returns {void}
     */
    checkThrowableEnemyCollisions() {
        this.throwableObjects.forEach((throwable) => {
            this.level.enemies.forEach((enemy) => {
                if (throwable.hasHit) {
                    return;
                }
                const hasCollision = enemy instanceof Endboss
                    ? this.isThrowableCollidingWithEndboss(throwable, enemy)
                    : throwable.isColliding(enemy);
                if (hasCollision) {
                    this.handleThrowableHitEnemy(throwable, enemy);
                }
            });
        });
    }

    /**
     * Uses tighter bounds for throwable collisions against the endboss.
     * @param {ThrowableObject} throwable Thrown bottle instance.
     * @param {Endboss} endboss Endboss instance.
     * @returns {boolean}
     */
    isThrowableCollidingWithEndboss(throwable, endboss) {
        const throwableBounds = {
            left: throwable.x + 28,
            right: throwable.x + throwable.width - 28,
            top: throwable.y + 24,
            bottom: throwable.y + throwable.height - 24
        };

        const endbossBounds = {
            left: endboss.x + endboss.offset.left + 20,
            right: endboss.x + endboss.width - endboss.offset.right - 20,
            top: endboss.y + endboss.offset.top + 12,
            bottom: endboss.y + endboss.height - endboss.offset.bottom - 10
        };

        return throwableBounds.right > endbossBounds.left
            && throwableBounds.left < endbossBounds.right
            && throwableBounds.bottom > endbossBounds.top
            && throwableBounds.top < endbossBounds.bottom;
    }

    /**
     * Applies hit effects for throwable-enemy collisions.
     * @param {ThrowableObject} throwable Thrown bottle instance.
     * @param {MovableObject} enemy Enemy instance.
     * @returns {void}
     */
    handleThrowableHitEnemy(throwable, enemy) {
        enemy.hit();
        throwable.markAsHit();
        this.playSound(this.bottleBreakSound);
        this.handleEnemyDeathByBottle(enemy);
        this.updateEndbossStatus(enemy);
    }

    /**
     * Plays chicken death sound when a bottle kill is confirmed.
     * @param {MovableObject} enemy Enemy instance.
     * @returns {void}
     */
    handleEnemyDeathByBottle(enemy) {
        if (enemy.isDead() && this.isChickenEnemy(enemy)) {
            this.playSound(this.chickenDeadSound);
        }
    }

    /**
     * Updates endboss health bar and triggers win state on death.
     * @param {MovableObject} enemy Enemy instance.
     * @returns {void}
     */
    updateEndbossStatus(enemy) {
        if (!(enemy instanceof Endboss)) {
            return;
        }
        let endbossPercentage = (enemy.energy / 5) * 100;
        this.endbossStatusbar.setPercentage(endbossPercentage);
        if (enemy.isDead()) {
            // Let the dead sprite sequence play before showing the win overlay.
            setTimeout(() => {
                if (enemy.isDead() && !this.gameOver) {
                    this.triggerGameWon();
                }
            }, 650);
        }
    }

    /**
     * Main render loop for menu/game scenes.
     * @returns {void}
     */
    draw() {
        if (this.destroyed) {
            return;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.gameStarted && !this.gameOver) {
            this.addToMap(this.startScreen);
        } else {
            this.drawActiveGameScene();
        }

        requestAnimationFrame(() => this.draw());
    }

}