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


    constructor(endboss) {
        super();
        this.endboss = endboss;
        this.loadImages(this.IMAGES);
        this.width = 250;
        this.height = 60;
        this.setPercentage(100);
    }

    draw(ctx) {
        this.x = this.endboss.x + 25;
        this.y = this.endboss.y + 20;
        super.draw(ctx);
    }

    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }
    
    resolveImageIndex() {
        const thresholds = [100, 80, 60, 40, 20];
        for (let i = 0; i < thresholds.length; i++) {
            if (this.isAtLeastThreshold(thresholds[i])) {
                return 5 - i;
            }
        }
        return 0;
    }

    isAtLeastThreshold(threshold) {
        return this.percentage >= threshold;
    }
}
