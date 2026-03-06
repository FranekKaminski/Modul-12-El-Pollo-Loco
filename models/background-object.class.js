/**
 * Parallax background element used by level scenery layers.
 * @extends MovableObject
 */
class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;
    /**
     * @param {string} imagePath Sprite path for this background segment.
     * @param {number} x Horizontal world position.
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }
}