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
