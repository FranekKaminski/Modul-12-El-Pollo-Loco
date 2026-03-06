/**
 * Base class for objects that can be rendered on the canvas.
 */
class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;

    /**
     * Loads a single image as the current sprite.
     * @param {string} path Relative image path.
     * @returns {void}
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Draws the current sprite to the canvas.
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context.
     * @returns {void}
     */
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Optional debug frame hook.
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context.
     * @returns {void}
     */
    drawFrame(ctx) {
        // Removed red border for cleaner visuals
    }

    /**
     * Preloads multiple images into the cache.
     * @param {string[]} arr List of image paths.
     * @returns {void}
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }
}