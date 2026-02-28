class StartScreen extends DrawableObject {
    IMAGES = [
        "img/9_intro_outro_screens/start/startscreen_1.png",
        "img/9_intro_outro_screens/start/startscreen_2.png"
    ];

    constructor() {
        super();
        this.loadImages(this.IMAGES);
        this.x = 0;
        this.y = 0;
        this.width = 720;
        this.height = 480;
        this.loadImage(this.IMAGES[0]);
    }
}
