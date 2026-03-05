class Character extends MovableObject {

    height = 280;
    width = 130;
    y = 100;
    speed = 10;
    IMAGES_WALKING = [
        "./img/2_character_pepe/2_walk/W-21.png",
        "./img/2_character_pepe/2_walk/W-22.png",
        "./img/2_character_pepe/2_walk/W-23.png",
        "./img/2_character_pepe/2_walk/W-24.png",
        "./img/2_character_pepe/2_walk/W-25.png",
        "./img/2_character_pepe/2_walk/W-26.png"
    ];

    IMAGES_IDLE = [
        "./img/2_character_pepe/1_idle/idle/I-1.png",
        "./img/2_character_pepe/1_idle/idle/I-2.png",
        "./img/2_character_pepe/1_idle/idle/I-3.png",
        "./img/2_character_pepe/1_idle/idle/I-4.png",
        "./img/2_character_pepe/1_idle/idle/I-5.png",
        "./img/2_character_pepe/1_idle/idle/I-6.png",
        "./img/2_character_pepe/1_idle/idle/I-7.png",
        "./img/2_character_pepe/1_idle/idle/I-8.png",
        "./img/2_character_pepe/1_idle/idle/I-9.png",
        "./img/2_character_pepe/1_idle/idle/I-10.png"
    ];

    IMAGES_LONG_IDLE = [
        "./img/2_character_pepe/1_idle/long_idle/I-11.png",
        "./img/2_character_pepe/1_idle/long_idle/I-12.png",
        "./img/2_character_pepe/1_idle/long_idle/I-13.png",
        "./img/2_character_pepe/1_idle/long_idle/I-14.png",
        "./img/2_character_pepe/1_idle/long_idle/I-15.png",
        "./img/2_character_pepe/1_idle/long_idle/I-16.png",
        "./img/2_character_pepe/1_idle/long_idle/I-17.png",
        "./img/2_character_pepe/1_idle/long_idle/I-18.png",
        "./img/2_character_pepe/1_idle/long_idle/I-19.png",
        "./img/2_character_pepe/1_idle/long_idle/I-20.png"
    ];
    
    IMAGES_DEAD = [
        "img/2_character_pepe/5_dead/D-51.png",
        "img/2_character_pepe/5_dead/D-52.png",
        "img/2_character_pepe/5_dead/D-53.png",
        "img/2_character_pepe/5_dead/D-54.png",
        "img/2_character_pepe/5_dead/D-55.png",
        "img/2_character_pepe/5_dead/D-56.png",
        "img/2_character_pepe/5_dead/D-57.png",
    ];

    IMAGES_HURT = [
        "img/2_character_pepe/4_hurt/H-41.png",
        "img/2_character_pepe/4_hurt/H-42.png",
        "img/2_character_pepe/4_hurt/H-43.png"
    ]
    
    world;
    walking_sound = new Audio("./audio/character/characterRun.mp3");
    jump_sound = new Audio("./audio/character/characterJump.wav");
    hurt_sound = new Audio("./audio/character/characterDamage.mp3");
    dead_sound = new Audio("./audio/character/characterDead.wav");
    snoring_sound = new Audio("./audio/character/characterSnoring.mp3");
    idleSince = Date.now();
    LONG_IDLE_DELAY = 15000;
    deadSoundPlayed = false;
    lastHurtSoundTimestamp = 0;


    IMAGES_JUMPING = [
        "./img/2_character_pepe/3_jump/J-31.png",
        "./img/2_character_pepe/3_jump/J-32.png",
        "./img/2_character_pepe/3_jump/J-33.png",
        "./img/2_character_pepe/3_jump/J-34.png",
        "./img/2_character_pepe/3_jump/J-35.png",
        "./img/2_character_pepe/3_jump/J-36.png",
        "./img/2_character_pepe/3_jump/J-37.png",
        "./img/2_character_pepe/3_jump/J-38.png",
        "./img/2_character_pepe/3_jump/J-39.png",
    ];

    constructor() {
        super().loadImage("./img/2_character_pepe/2_walk/W-21.png");
        this.loadCharacterImages();
        this.initializeCharacterState();
    }

    loadCharacterImages() {
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
    }

    initializeCharacterState() {
        this.walking_sound.loop = true;
        this.snoring_sound.loop = true;
        this.registerAudioAssets();
        this.y = 150;
        this.applyGravity();
        this.animate();
    }

    registerAudioAssets() {
        if (window.registerGameAudio) {
            window.registerGameAudio(this.walking_sound);
            window.registerGameAudio(this.jump_sound);
            window.registerGameAudio(this.hurt_sound);
            window.registerGameAudio(this.dead_sound);
            window.registerGameAudio(this.snoring_sound);
        }
    }

    applyCurrentVolume(sound) {
        if (window.getGameVolume) {
            sound.volume = window.getGameVolume();
            sound.muted = sound.volume === 0;
        }
    }

    playSound(sound) {
        this.applyCurrentVolume(sound);
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    startLoop(sound) {
        this.applyCurrentVolume(sound);
        sound.play().catch(() => {});
    }

    stopSound(sound) {
        sound.pause();
        sound.currentTime = 0;
    }

    animate() {
        this.startMovementLoop();
        this.startAnimationLoop();
    }

    startMovementLoop() {
        setInterval(() => {
            if (!this.world.gameStarted) {
                return;
            }
            this.updateMovement();
            this.updateCameraPosition();
        }, 1000 / 60);
    }

    updateMovement() {
        this.handleMoveRight();
        this.handleMoveLeft();
        this.handleJumpInput();
    }

    handleMoveRight() {
        if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
            this.moveRight();
            this.otherDirection = false;
            this.idleSince = Date.now();
        }
    }

    handleMoveLeft() {
        if (this.world.keyboard.LEFT && this.x > 0) {
            this.moveLeft();
            this.otherDirection = true;
            this.idleSince = Date.now();
        }
    }

    handleJumpInput() {
        if (this.world.keyboard.SPACE && !this.IsAboveGround()) {
            this.jump();
        }
    }

    updateCameraPosition() {
        this.world.camera_x = -this.x + 100;
    }

    startAnimationLoop() {
        setInterval(() => {
            if (!this.world.gameStarted) {
                return;
            }
            this.updateAnimationState();
        }, 100);
    }

    updateAnimationState() {
        if (this.isDead()) {
            this.handleDeadAnimation();
            return;
        }
        if (this.isHurt()) {
            this.handleHurtAnimation();
            return;
        }
        this.handleGroundOrAirAnimation();
    }

    handleDeadAnimation() {
        if (!this.deadSoundPlayed) {
            this.stopSound(this.walking_sound);
            this.stopSound(this.snoring_sound);
            this.playSound(this.dead_sound);
            this.deadSoundPlayed = true;
        }
        this.playAnimation(this.IMAGES_DEAD);
    }

    handleHurtAnimation() {
        this.stopSound(this.walking_sound);
        this.stopSound(this.snoring_sound);
        this.playHurtSoundOncePerHit();
        this.idleSince = Date.now();
        this.playAnimation(this.IMAGES_HURT);
    }

    playHurtSoundOncePerHit() {
        if (this.lastHurtSoundTimestamp !== this.lastHit) {
            this.playSound(this.hurt_sound);
            this.lastHurtSoundTimestamp = this.lastHit;
        }
    }

    handleGroundOrAirAnimation() {
        if (this.IsAboveGround()) {
            this.handleJumpAnimation();
            return;
        }
        this.handleWalkingOrIdleAnimation();
    }

    handleJumpAnimation() {
        this.stopSound(this.walking_sound);
        this.stopSound(this.snoring_sound);
        this.idleSince = Date.now();
        this.playAnimation(this.IMAGES_JUMPING);
    }

    handleWalkingOrIdleAnimation() {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
            this.handleWalkingAnimation();
            return;
        }
        this.handleIdleAnimation();
    }

    handleWalkingAnimation() {
        this.stopSound(this.snoring_sound);
        this.startLoop(this.walking_sound);
        this.idleSince = Date.now();
        this.playAnimation(this.IMAGES_WALKING);
    }

    handleIdleAnimation() {
        this.stopSound(this.walking_sound);
        if (Date.now() - this.idleSince >= this.LONG_IDLE_DELAY) {
            this.startLoop(this.snoring_sound);
            this.playAnimation(this.IMAGES_LONG_IDLE);
            return;
        }
        this.stopSound(this.snoring_sound);
        this.playAnimation(this.IMAGES_IDLE);
    }

    jump() {
        this.speedY = 25;
        this.stopSound(this.snoring_sound);
        this.playSound(this.jump_sound);
        this.idleSince = Date.now();
    }
}