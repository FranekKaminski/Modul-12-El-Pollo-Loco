/**
 * Status bar that follows the endboss and shows remaining health.
 * @extends DrawableObject
 */
class EndbossStatusbar extends DrawableObject {

    IMAGES = [
        "img/7_statusbars/2_statusbar_endboss/blue/blue0.png",
        "img/7_statusbars/2_statusbar_endboss/blue/blue20.png",
        "img/7_statusbars/2_statusbar_endboss/blue/blue40.png",
        "img/7_statusbars/2_statusbar_endboss/blue/blue60.png",
        "img/7_statusbars/2_statusbar_endboss/blue/blue80.png",
        "img/7_statusbars/2_statusbar_endboss/blue/blue100.png"
    ];

    percentage = 100;
    endboss;


    /**
     * @param {Endboss} endboss Endboss instance tracked by this status bar.
     */
    constructor(endboss) {
        super();
        this.endboss = endboss;
        this.loadImages(this.IMAGES);
        this.width = 250;
        this.height = 60;
        this.setPercentage(100);
    }

    /**
     * Draws the bar at the current endboss position.
     * @param {CanvasRenderingContext2D} ctx Canvas rendering context.
     * @returns {void}
     */
    draw(ctx) {
        this.x = this.endboss.x + 25;
        this.y = this.endboss.y + 20;
        super.draw(ctx);
    }

    /**
     * Updates the bar fill percentage and displayed sprite.
     * @param {number} percentage Fill amount from 0 to 100.
     * @returns {void}
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }
    
    /**
     * Resolves the sprite index for the current percentage.
     * @returns {number}
     */
    resolveImageIndex() {
        const thresholds = [100, 80, 60, 40, 20];
        for (let i = 0; i < thresholds.length; i++) {
            if (this.isAtLeastThreshold(thresholds[i])) {
                return 5 - i;
            }
        }
        return 0;
    }

    /**
     * Checks whether percentage is at least a threshold.
     * @param {number} threshold Threshold value.
     * @returns {boolean}
     */
    isAtLeastThreshold(threshold) {
        return this.percentage >= threshold;
    }
}
