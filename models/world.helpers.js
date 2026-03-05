World.prototype.shouldHideEnemy = function(enemy) {
    if (enemy instanceof Endboss) {
        return false;
    }
    if (typeof enemy.shouldDisappear === "function") {
        return enemy.shouldDisappear();
    }
    return enemy.isDead();
};

World.prototype.addObjectsToMap = function(objects) {
    objects.forEach(o => {
        this.addToMap(o);
    });
};

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

World.prototype.flipImage = function(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
};

World.prototype.flipImageBack = function(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
};

World.prototype.isCharacterJumpingOnEnemy = function(enemy) {
    const stompBounds = this.getStompBounds(enemy);
    const isFalling = this.character.speedY < 0;
    const horizontalOverlap = stompBounds.characterRight > stompBounds.enemyLeft
        && stompBounds.characterLeft < stompBounds.enemyRight;
    const verticalOverlap = stompBounds.characterBottom >= stompBounds.enemyTop - 8
        && stompBounds.characterBottom <= stompBounds.enemyMiddleY;
    return isFalling && horizontalOverlap && verticalOverlap;
};

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

World.prototype.isChickenEnemy = function(enemy) {
    return enemy instanceof Chicken || (typeof SmallChicken !== "undefined" && enemy instanceof SmallChicken);
};

World.prototype.squashEnemy = function(enemy) {
    if (typeof enemy.markAsDead === "function") {
        enemy.markAsDead();
    } else {
        enemy.energy = 0;
    }
    this.playSound(this.chickenDeadSound);
};
