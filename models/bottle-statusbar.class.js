/**
 * Bottle inventory status bar shown in the HUD.
 * @extends DrawableObject
 */
class BottleStatusbar extends DrawableObject {

    IMAGES = [
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png"
    ];

    percentage = 0;


    /**
     * Creates and positions the bottle status bar.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 460;
        this.y = 0;
        this.width = 200;
        this.height = 60;
        this.setPercentage(0);
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
        return Math.min(Math.ceil(this.percentage / 20), 5);
    }
}
