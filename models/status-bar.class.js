/**
 * Health status bar shown in the HUD.
 * @extends DrawableObject
 */
class Statusbar extends DrawableObject {

    IMAGES = [
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png"
    ];

    percentage = 100;


    /**
     * Creates and positions the health status bar.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 40;
        this.y = 0;
        this.width = 200;
        this.height = 60;
        this.setPercentage(100);
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
            if (this.isAboveThreshold(thresholds[i])) {
                return 5 - i;
            }
        }
        return 0;
    }

    /**
     * Checks whether percentage is above a threshold.
     * @param {number} threshold Threshold value.
     * @returns {boolean}
     */
    isAboveThreshold(threshold) {
        if (threshold === 100) {
            return this.percentage === 100;
        }
        return this.percentage > threshold;
    }
}