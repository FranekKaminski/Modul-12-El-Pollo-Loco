let canvas;
let world;
let keyboard = new Keyboard();
let gameVolume = 0.5;
let volumeBeforeMute = 0.5;
let isTouchDevice = false;
let pausedByPortraitMode = false;
let wasGameRunningBeforePortrait = false;
const registeredGameAudio = new Set();
const backgroundMusic = new Audio("./audio/background_music/hitslab-game-gaming-music-295075.mp3");

function detectTouchDevice() {
    return ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
}

function isPortraitMode() {
    return window.innerHeight > window.innerWidth;
}

function stopHorizontalInput() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
}

function updateMobileGameplayUI() {
    const mobileUI = getMobileUIElements();
    if (!hasMobileUIElements(mobileUI)) {
        return;
    }
    if (!isTouchDevice) {
        return hideMobileUI(mobileUI);
    }
    if (isPortraitMode()) {
        return handlePortraitMode(mobileUI);
    }
    handleLandscapeMode(mobileUI);
}

function hasMobileUIElements(mobileUI) {
    return !!mobileUI.rotateOverlay && !!mobileUI.touchControls;
}

function getMobileUIElements() {
    return {
        rotateOverlay: document.getElementById("rotateOverlay"),
        touchControls: document.getElementById("touchControls")
    };
}

function hideMobileUI(mobileUI) {
    mobileUI.rotateOverlay.style.display = "none";
    mobileUI.touchControls.style.display = "none";
}

function handlePortraitMode(mobileUI) {
    mobileUI.rotateOverlay.style.display = "flex";
    mobileUI.touchControls.style.display = "none";
    stopHorizontalInput();
    if (shouldPauseForPortrait()) {
        wasGameRunningBeforePortrait = true;
        world.gameStarted = false;
        pausedByPortraitMode = true;
    }
}

function shouldPauseForPortrait() {
    return world && world.gameStarted && !world.gameOver && !pausedByPortraitMode;
}

function handleLandscapeMode(mobileUI) {
    mobileUI.rotateOverlay.style.display = "none";
    if (world && pausedByPortraitMode && !world.gameOver) {
        world.gameStarted = wasGameRunningBeforePortrait;
        pausedByPortraitMode = false;
        wasGameRunningBeforePortrait = false;
    }
    const shouldShowTouchControls = world && world.gameStarted && !world.gameOver;
    mobileUI.touchControls.style.display = shouldShowTouchControls ? "flex" : "none";
}

function bindTouchMoveButton(button, side) {
    if (!button) {
        return;
    }
    const activate = createTouchMoveHandler(side, true);
    const deactivate = createTouchMoveHandler(side, false);
    button.addEventListener("touchstart", activate, { passive: false });
    button.addEventListener("touchend", deactivate, { passive: false });
    button.addEventListener("touchcancel", deactivate, { passive: false });
}

function bindTouchActionButton(button, actionKey) {
    if (!button) {
        return;
    }
    const activate = createTouchActionHandler(actionKey, true);
    const deactivate = createTouchActionHandler(actionKey, false);
    button.addEventListener("touchstart", activate, { passive: false });
    button.addEventListener("touchend", deactivate, { passive: false });
    button.addEventListener("touchcancel", deactivate, { passive: false });
}

function createTouchMoveHandler(side, isPressed) {
    return (event) => {
        event.preventDefault();
        if (side === "left") {
            keyboard.LEFT = isPressed;
        }
        if (side === "right") {
            keyboard.RIGHT = isPressed;
        }
    };
}

function createTouchActionHandler(actionKey, isPressed) {
    return (event) => {
        event.preventDefault();
        keyboard[actionKey] = isPressed;
    };
}

function applyVolumeToAudio(audio) {
    audio.volume = gameVolume;
    audio.muted = gameVolume === 0;
}

function registerGameAudio(audio) {
    if (!audio) {
        return;
    }
    registeredGameAudio.add(audio);
    applyVolumeToAudio(audio);
}

function setGameVolume(volume) {
    gameVolume = Math.max(0, Math.min(1, volume));
    if (gameVolume > 0) {
        volumeBeforeMute = gameVolume;
    }
    registeredGameAudio.forEach((audio) => applyVolumeToAudio(audio));
}

function updateMuteButtonLabel() {
    const muteButton = document.getElementById("muteButton");
    if (!muteButton) {
        return;
    }
    muteButton.textContent = gameVolume === 0 ? "UNMUTE" : "MUTE";
}

window.registerGameAudio = registerGameAudio;
window.getGameVolume = () => gameVolume;
window.setGameVolume = setGameVolume;
window.showGameOverOverlay = () => {
    const image = document.getElementById("gameOverImage");
    const overlay = document.getElementById("gameOverOverlay");
    if (image) {
        image.src = "./img/9_intro_outro_screens/game_over/oh no you lost!.png";
        image.alt = "Game Over";
    }
    if (overlay) {
        overlay.style.display = "flex";
    }
    updateMobileGameplayUI();
};

window.showGameWonOverlay = () => {
    const image = document.getElementById("gameOverImage");
    const overlay = document.getElementById("gameOverOverlay");
    if (image) {
        image.src = "./img/You won, you lost/You won A.png";
        image.alt = "You Won";
    }
    if (overlay) {
        overlay.style.display = "flex";
    }
    updateMobileGameplayUI();
};

function init() {
    const ui = getInitUIElements();
    isTouchDevice = detectTouchDevice();
    setupBackgroundMusic();
    setupVolumeControls(ui.volumeSlider);
    setupWorld();
    hideGameOverOverlay();
    setupMainButtons(ui);
    setupInstructionModal();
    setupRestartButton();
    setupTouchControls(ui.touchLeftButton, ui.touchRightButton, ui.touchJumpButton, ui.touchThrowButton, ui.touchBuyButton);
    setupMobileListeners();
}

function setupBackgroundMusic() {
    backgroundMusic.loop = true;
    registerGameAudio(backgroundMusic);
}

function startBackgroundMusic() {
    backgroundMusic.play().catch(() => {});
}

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function getInitUIElements() {
    return {
        volumeSlider: document.getElementById("volumeSlider"),
        muteButton: document.getElementById("muteButton"),
        touchLeftButton: document.getElementById("touchLeft"),
        touchRightButton: document.getElementById("touchRight"),
        touchJumpButton: document.getElementById("touchJump"),
        touchThrowButton: document.getElementById("touchThrow"),
        touchBuyButton: document.getElementById("touchBuy")
    };
}

function setupVolumeControls(volumeSlider) {
    setGameVolume(Number(volumeSlider.value) / 100);
    updateMuteButtonLabel();
    volumeSlider.addEventListener("input", () => {
        setGameVolume(Number(volumeSlider.value) / 100);
        updateMuteButtonLabel();
    });
}

function setupWorld() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);
}

function hideGameOverOverlay() {
    document.getElementById("gameOverOverlay").style.display = "none";
}

function setupMainButtons(ui) {
    setupStartButton(ui.muteButton);
    setupMuteButton(ui.muteButton, ui.volumeSlider);
    setupFullscreenButton();
}

function setupStartButton(muteButton) {
    document.getElementById("startButton").addEventListener("click", () => {
        world.startGame();
        startBackgroundMusic();
        document.getElementById("buttonContainer").style.display = "none";
        muteButton.style.display = "block";
        updateMobileGameplayUI();
    });
}

function setupMuteButton(muteButton, volumeSlider) {
    muteButton.addEventListener("click", () => {
        const newVolume = gameVolume === 0 ? (volumeBeforeMute > 0 ? volumeBeforeMute : 0.5) : 0;
        setGameVolume(newVolume);
        volumeSlider.value = Math.round(gameVolume * 100);
        updateMuteButtonLabel();
    });
}

function setupFullscreenButton() {
    document.getElementById("fullscreenButton").addEventListener("click", () => {
        requestGameContainerFullscreen();
    });
}

function requestGameContainerFullscreen() {
    const gameContainer = document.getElementById("gameContainer");
    if (gameContainer.requestFullscreen) {
        gameContainer.requestFullscreen();
    } else if (gameContainer.webkitRequestFullscreen) {
        gameContainer.webkitRequestFullscreen();
    } else if (gameContainer.mozRequestFullScreen) {
        gameContainer.mozRequestFullScreen();
    } else if (gameContainer.msRequestFullscreen) {
        gameContainer.msRequestFullscreen();
    }
}

function setupInstructionModal() {
    document.getElementById("instructionsButton").addEventListener("click", openInstructionsModal);
    document.getElementById("closeInstructionsButton").addEventListener("click", closeInstructionsModal);
    document.getElementById("instructionsModal").addEventListener("click", closeInstructionsOnBackdrop);
}

function openInstructionsModal() {
    document.getElementById("instructionsModal").style.display = "flex";
}

function closeInstructionsModal() {
    document.getElementById("instructionsModal").style.display = "none";
}

function closeInstructionsOnBackdrop(event) {
    if (event.target.id === "instructionsModal") {
        closeInstructionsModal();
    }
}

function setupRestartButton() {
    document.getElementById("restartButton").addEventListener("click", () => {
        stopBackgroundMusic();
        location.reload();
    });
}

function setupTouchControls(touchLeftButton, touchRightButton, touchJumpButton, touchThrowButton, touchBuyButton) {
    bindTouchMoveButton(touchLeftButton, "left");
    bindTouchMoveButton(touchRightButton, "right");
    bindTouchActionButton(touchJumpButton, "SPACE");
    bindTouchActionButton(touchThrowButton, "D");
    bindTouchActionButton(touchBuyButton, "B");
}

function setupMobileListeners() {
    window.addEventListener("resize", updateMobileGameplayUI);
    window.addEventListener("orientationchange", updateMobileGameplayUI);
    updateMobileGameplayUI();
}


window.addEventListener("keydown", (event) => setKeyboardState(event, true));
window.addEventListener("keyup", (event) => setKeyboardState(event, false));

function setKeyboardState(event, isPressed) {
    applyHorizontalKeys(event.key, isPressed);
    applyVerticalKeys(event.key, isPressed);
    applyActionKeys(event.key, isPressed);
}

function applyHorizontalKeys(key, isPressed) {
    if (key === "ArrowRight" || key === "d" || key === "D") {
        keyboard.RIGHT = isPressed;
    }
    if (key === "ArrowLeft" || key === "a" || key === "A") {
        keyboard.LEFT = isPressed;
    }
}

function applyVerticalKeys(key, isPressed) {
    if (key === "ArrowDown") {
        keyboard.DOWN = isPressed;
    }
    if (key === "ArrowUp") {
        keyboard.UP = isPressed;
    }
}

function applyActionKeys(key, isPressed) {
    if (key === " ") {
        keyboard.SPACE = isPressed;
    }
    if (key === "Enter") {
        keyboard.D = isPressed;
    }
    if (key === "b" || key === "B") {
        keyboard.B = isPressed;
    }
}