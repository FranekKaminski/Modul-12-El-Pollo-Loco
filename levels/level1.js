const level1 = new Level(
    [
        new Chicken(400),
        new Chicken(800),
        new SmallChicken(600),
        new Chicken(1200),
        new SmallChicken(1400),
        new Chicken(1600),
        new Chicken(2000),
        new Endboss()
    ],
    [
        new Cloud(),
    ],
    [
        new BackgroundObject("./img/5_background/layers/air.png", -720),
        new BackgroundObject("./img/5_background/layers/3_third_layer/2.png", -720),
        new BackgroundObject("./img/5_background/layers/2_second_layer/2.png", -720),
        new BackgroundObject("./img/5_background/layers/1_first_layer/2.png", -720),
        new BackgroundObject("./img/5_background/layers/air.png", 0),
        new BackgroundObject("./img/5_background/layers/3_third_layer/1.png", 0),
        new BackgroundObject("./img/5_background/layers/2_second_layer/1.png", 0),
        new BackgroundObject("./img/5_background/layers/1_first_layer/1.png", 0),
        new BackgroundObject("./img/5_background/layers/air.png", 720),
        new BackgroundObject("./img/5_background/layers/3_third_layer/2.png", 720),
        new BackgroundObject("./img/5_background/layers/2_second_layer/2.png", 720),
        new BackgroundObject("./img/5_background/layers/1_first_layer/2.png", 720),
        new BackgroundObject("./img/5_background/layers/air.png", 720 * 2),
        new BackgroundObject("./img/5_background/layers/3_third_layer/1.png", 720 * 2),
        new BackgroundObject("./img/5_background/layers/2_second_layer/1.png", 720 * 2),
        new BackgroundObject("./img/5_background/layers/1_first_layer/1.png", 720 * 2),
        new BackgroundObject("./img/5_background/layers/air.png", 720 * 3),
        new BackgroundObject("./img/5_background/layers/3_third_layer/2.png", 720 * 3),
        new BackgroundObject("./img/5_background/layers/2_second_layer/2.png", 720 * 3),
        new BackgroundObject("./img/5_background/layers/1_first_layer/2.png", 720 * 3)
    ],
    [
        new Coin(),
        new Coin(),
        new Coin(),
        new Coin(),
        new Coin(),
    ],
    [
        new Bottle(),
        new Bottle(),
        new Bottle(),
        new Bottle(),
        new Bottle(),
        new Bottle(),
        new Bottle(),
        new Bottle(),
    ]
);