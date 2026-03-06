/**
 * Decorative cloud object moving through the background.
 * @extends MovableObject
 */
class Cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
 

    /**
     * Creates a cloud with randomized start position.
     */
    constructor() {
        super().loadImage("./img/5_background/layers/4_clouds/1.png");

        this.x = Math.random() * 500;
        this.animate();

    }
    /**
     * Applies cloud movement.
     * @returns {void}
     */
    animate() {
        this.moveLeft();
    }



}