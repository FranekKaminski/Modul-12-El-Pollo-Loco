/**
 * Container for all objects that define a playable level.
 */
class Level {
    enemies;
    clouds;
    backgroundObjects;
    coins;
    bottles;
    level_end_x = 2200;

    /**
     * @param {Array<MovableObject>} enemies Enemies in the level.
     * @param {Array<DrawableObject>} clouds Cloud objects.
     * @param {Array<DrawableObject>} backgroundObjects Background layer objects.
     * @param {Array<DrawableObject>} coins Collectible coins.
     * @param {Array<DrawableObject>} bottles Collectible bottles.
     */
    constructor(enemies, clouds, backgroundObjects, coins, bottles){
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;
        this.bottles = bottles;
    }
}