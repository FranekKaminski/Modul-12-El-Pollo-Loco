/**
 * Returns whether a dead enemy should no longer be rendered.
 * @param {MovableObject} enemy Enemy instance.
 * @returns {boolean}
 */
World.prototype.shouldHideEnemy = function(enemy) {
    if (enemy instanceof Endboss) {
        return false;
    }
    if (typeof enemy.shouldDisappear === "function") {
        return enemy.shouldDisappear();
    }
    return enemy.isDead();
};

/**
 * Adds a list of drawable objects to the map.
 * @param {DrawableObject[]} objects Objects to render.
 * @returns {void}
 */
World.prototype.addObjectsToMap = function(objects) {
    objects.forEach(o => {
        this.addToMap(o);
    });
};

/**
 * Draws one object on the map and handles mirrored rendering.
 * @param {DrawableObject} mo Object to render.
 * @returns {void}
 */
World.prototype.addToMap = function(mo) {
    if (mo.otherDirection) {
        this.flipImage(mo);
    }

    mo.draw(this.ctx);
    mo.drawFrame(this.ctx);

    if (mo.otherDirection) {
        this.flipImageBack(mo);
    }
};

/**
 * Applies canvas transform to draw mirrored sprites.
 * @param {DrawableObject} mo Object that should be mirrored.
 * @returns {void}
 */
World.prototype.flipImage = function(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
};

/**
 * Restores canvas transform after mirrored drawing.
 * @param {DrawableObject} mo Object that was mirrored.
 * @returns {void}
 */
World.prototype.flipImageBack = function(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
};

/**
 * Checks whether character is stomping an enemy from above.
 * @param {MovableObject} enemy Enemy instance.
 * @returns {boolean}
 */
World.prototype.isCharacterJumpingOnEnemy = function(enemy) {
    const stompBounds = this.getStompBounds(enemy);
    const isFalling = this.character.speedY < 0;
    const horizontalOverlap = stompBounds.characterRight > stompBounds.enemyLeft
        && stompBounds.characterLeft < stompBounds.enemyRight;
    const verticalOverlap = stompBounds.characterBottom >= stompBounds.enemyTop - 8
        && stompBounds.characterBottom <= stompBounds.enemyMiddleY;
    return isFalling && horizontalOverlap && verticalOverlap;
};

/**
 * Computes collision bounds used for stomp checks.
 * @param {MovableObject} enemy Enemy instance.
 * @returns {{characterLeft:number, characterRight:number, characterBottom:number, enemyLeft:number, enemyRight:number, enemyTop:number, enemyMiddleY:number}}
 */
World.prototype.getStompBounds = function(enemy) {
    return {
        characterLeft: this.character.x + this.character.offset.left,
        characterRight: this.character.x + this.character.width - this.character.offset.right,
        characterBottom: this.character.y + this.character.height - this.character.offset.bottom,
        enemyLeft: enemy.x + enemy.offset.left - 10,
        enemyRight: enemy.x + enemy.width - enemy.offset.right + 10,
        enemyTop: enemy.y + enemy.offset.top,
        enemyMiddleY: enemy.y + enemy.height * 0.45
    };
};

/**
 * Checks whether enemy is a chicken-type enemy.
 * @param {MovableObject} enemy Enemy instance.
 * @returns {boolean}
 */
World.prototype.isChickenEnemy = function(enemy) {
    return enemy instanceof Chicken || (typeof SmallChicken !== "undefined" && enemy instanceof SmallChicken);
};

/**
 * Kills a chicken enemy and plays death sound.
 * @param {MovableObject} enemy Enemy instance.
 * @returns {void}
 */
World.prototype.squashEnemy = function(enemy) {
    if (typeof enemy.markAsDead === "function") {
        enemy.markAsDead();
    } else {
        enemy.energy = 0;
    }
    this.playSound(this.chickenDeadSound);
};

/**
 * Draws all active world entities on top of background and HUD.
 * @returns {void}
 */
World.prototype.drawWorldEntities = function() {
    this.addToMap(this.character);
    this.addEnemiesToMap();
    this.addToMap(this.endbossStatusbar);
    this.addCoinsToMap();
    this.addBottlesToMap();
    this.addThrowablestoMap();
};

/**
 * Renders collectible coins and updates their idle animation.
 * @returns {void}
 */
World.prototype.addCoinsToMap = function() {
    const now = Date.now();
    this.level.coins.forEach((coin) => {
        if (!coin.collected) {
            if (!coin.lastAnimationUpdate) {
                coin.lastAnimationUpdate = now;
            }
            if (now - coin.lastAnimationUpdate >= 180) {
                coin.playAnimation(coin.COIN_IMAGE);
                coin.lastAnimationUpdate = now;
            }
            this.addToMap(coin);
        }
    });
};

/**
 * Renders all non-collected bottles.
 * @returns {void}
 */
World.prototype.addBottlesToMap = function() {
    this.level.bottles.forEach((bottle) => {
        if (!bottle.collected) {
            this.addToMap(bottle);
        }
    });
};

/**
 * Renders enemies and triggers endboss approach audio once.
 * @returns {void}
 */
World.prototype.addEnemiesToMap = function() {
    this.level.enemies.forEach((enemy) => {
        if (enemy instanceof Endboss && !this.endbossApproachPlayed && this.isObjectVisible(enemy)) {
            this.playSound(this.endbossApproachSound);
            this.endbossApproachPlayed = true;
        }
        if (!this.shouldHideEnemy(enemy)) {
            this.addToMap(enemy);
        }
    });
};

/**
 * Renders active throwable bottles until splash animation is complete.
 * @returns {void}
 */
World.prototype.addThrowablestoMap = function() {
    this.throwableObjects.forEach((throwable) => {
        if (!throwable.splashFinished) {
            this.addToMap(throwable);
        }
    });
};

/**
 * Plays a world sound once from the beginning.
 * @param {HTMLAudioElement} sound Sound instance.
 * @returns {void}
 */
World.prototype.playSound = function(sound) {
    this.applyCurrentVolume(sound);
    sound.currentTime = 0;
    sound.play().catch(() => {});
};

/**
 * Returns whether an object is within the visible camera viewport.
 * @param {MovableObject} mo World object to test.
 * @returns {boolean}
 */
World.prototype.isObjectVisible = function(mo) {
    let viewportLeft = -this.camera_x;
    let viewportRight = viewportLeft + this.canvas.width;
    let objectRight = mo.x + mo.width;
    return objectRight >= viewportLeft && mo.x <= viewportRight;
};

/**
 * Spawns throwable bottles while throw input is active.
 * @returns {void}
 */
World.prototype.checkThrowObjects = function() {
    if (!this.keyboard.D) {
        this.throwKeyLocked = false;
        return;
    }

    if (this.throwKeyLocked || this.collectedBottles <= 0) {
        return;
    }

    this.throwBottle();
    this.throwKeyLocked = true;
};

/**
 * Syncs bottle status bar with collected bottle count.
 * @returns {void}
 */
World.prototype.updateBottleStatusbar = function() {
    let bottlePercentage = (this.collectedBottles / this.level.bottles.length) * 100;
    this.bottleStatusbar.setPercentage(bottlePercentage);
};

/**
 * Draws world layers for active gameplay.
 * @returns {void}
 */
World.prototype.drawActiveGameScene = function() {
    this.drawWorldBackground();
    this.drawHud();
    this.drawWorldEntities();
    this.ctx.translate(-this.camera_x, 0);
};

/**
 * Draws parallax background and cloud layers.
 * @returns {void}
 */
World.prototype.drawWorldBackground = function() {
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);
};

/**
 * Draws the fixed HUD elements.
 * @returns {void}
 */
World.prototype.drawHud = function() {
    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.statusbar);
    this.addToMap(this.coinStatusbar);
    this.addToMap(this.bottleStatusbar);
    this.ctx.translate(this.camera_x, 0);
};
