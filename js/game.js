/**
 * @typedef {Object} MobileUIElements
 * @property {HTMLElement|null} rotateOverlay Overlay shown in portrait mode.
 * @property {HTMLElement|null} touchControls Touch control container.
 */

let canvas;
let world;
let keyboard = new Keyboard();
let gameVolume = 0.5;
let volumeBeforeMute = 0.5;
let isTouchDevice = false;
let pausedByPortraitMode = false;
let wasGameRunningBeforePortrait = false;
const AUDIO_SETTINGS_STORAGE_KEY = "el-pollo-loco-audio-settings";
const registeredGameAudio = new Set();
const backgroundMusic = new Audio("./audio/background_music/hitslab-game-gaming-music-295075.mp3");

/**
 * Detects whether the current device supports touch input.
 * @returns {boolean}
 */
function detectTouchDevice() {
    return ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
}

/**
 * Returns true when viewport is portrait-oriented.
 * @returns {boolean}
 */
function isPortraitMode() {
    return window.innerHeight > window.innerWidth;
}

function stopHorizontalInput() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
}

/**
 * Updates mobile-only gameplay controls and rotate hint.
 * @returns {void}
 */
function updateMobileGameplayUI() {
    const mobileUI = getMobileUIElements();
    const impressumButton = document.getElementById("impressumButton");
    if (!hasMobileUIElements(mobileUI)) {
        updateImpressumStartButtonVisibility(impressumButton);
        return;
    }
    if (!isTouchDevice) {
        hideMobileUI(mobileUI);
        updateImpressumStartButtonVisibility(impressumButton);
        return;
    }
    if (isPortraitMode()) {
        handlePortraitMode(mobileUI);
        updateImpressumStartButtonVisibility(impressumButton);
        return;
    }
    handleLandscapeMode(mobileUI);
    updateImpressumStartButtonVisibility(impressumButton);
}

function updateImpressumStartButtonVisibility(impressumButton = document.getElementById("impressumButton")) {
    if (!impressumButton) {
        return;
    }
    const shouldShow = isTouchDevice
        && !isPortraitMode()
        && world
        && !world.gameStarted
        && !world.gameOver;
    impressumButton.style.display = shouldShow ? "inline-block" : "none";
}

function hasMobileUIElements(mobileUI) {
    return !!mobileUI.rotateOverlay && !!mobileUI.touchControls;
}

/**
 * Reads all mobile gameplay UI elements.
 * @returns {MobileUIElements}
 */
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

/**
 * Sets and persists global game volume.
 * @param {number} volume New volume from 0 to 1.
 * @returns {void}
 */
function setGameVolume(volume) {
    gameVolume = Math.max(0, Math.min(1, volume));
    if (gameVolume > 0) {
        volumeBeforeMute = gameVolume;
    }
    registeredGameAudio.forEach((audio) => applyVolumeToAudio(audio));
    persistAudioSettings();
}

function persistAudioSettings() {
    try {
        localStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify({
            gameVolume,
            volumeBeforeMute
        }));
    } catch (_) {
        // Ignore storage errors (private mode/quota/full storage).
    }
}

function loadStoredAudioSettings() {
    try {
        const rawSettings = localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
        if (!rawSettings) {
            return;
        }

        const parsedSettings = JSON.parse(rawSettings);
        if (typeof parsedSettings.gameVolume === "number") {
            gameVolume = Math.max(0, Math.min(1, parsedSettings.gameVolume));
        }
        if (typeof parsedSettings.volumeBeforeMute === "number") {
            volumeBeforeMute = Math.max(0, Math.min(1, parsedSettings.volumeBeforeMute));
        }
    } catch (_) {
        // Ignore malformed settings and keep defaults.
    }
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

/**
 * Initializes game UI, world state and input listeners.
 * @returns {void}
 */
function init() {
    const ui = getInitUIElements();
    isTouchDevice = detectTouchDevice();
    loadStoredAudioSettings();
    setupBackgroundMusic();
    setupVolumeControls(ui.volumeSlider);
    setupWorld();
    setupCanvasContextMenu();
    hideGameOverOverlay();
    setupMainButtons(ui);
    setupInstructionModal();
    setupRestartButton();
    setupTouchControls(ui.touchLeftButton, ui.touchRightButton, ui.touchJumpButton, ui.touchThrowButton, ui.touchBuyButton);
    setupMobileListeners();
}

function setupCanvasContextMenu() {
    if (!isTouchDevice || !canvas) {
        return;
    }
    canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
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
        impressumButton: document.getElementById("impressumButton"),
        touchLeftButton: document.getElementById("touchLeft"),
        touchRightButton: document.getElementById("touchRight"),
        touchJumpButton: document.getElementById("touchJump"),
        touchThrowButton: document.getElementById("touchThrow"),
        touchBuyButton: document.getElementById("touchBuy")
    };
}

function setupVolumeControls(volumeSlider) {
    volumeSlider.value = Math.round(gameVolume * 100);
    setGameVolume(gameVolume);
    updateMuteButtonLabel();
    volumeSlider.addEventListener("input", () => {
        setGameVolume(Number(volumeSlider.value) / 100);
        updateMuteButtonLabel();
    });
}

/**
 * Creates a fresh world instance and canvas binding.
 * @returns {void}
 */
function setupWorld() {
    if (typeof resetLevel1 === "function") {
        resetLevel1();
    }
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);
}

function hideGameOverOverlay() {
    document.getElementById("gameOverOverlay").style.display = "none";
}

function setupMainButtons(ui) {
    setupStartButton(ui.muteButton);
    setupImpressumButton(ui.impressumButton);
    setupMuteButton(ui.muteButton, ui.volumeSlider);
    setupFullscreenButton();
}

function setupImpressumButton(impressumButton) {
    if (!impressumButton) {
        return;
    }
    impressumButton.addEventListener("click", () => {
        window.location.href = "./impressum.html";
    });
    updateImpressumStartButtonVisibility(impressumButton);
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
        restartGameWithoutReload();
    });
}

/**
 * Fully restarts the game session without reloading the page.
 * @returns {void}
 */
function restartGameWithoutReload() {
    stopBackgroundMusic();
    if (world && typeof world.destroy === "function") {
        world.destroy();
    }
    resetKeyboardState();
    closeInstructionsModal();
    document.getElementById("buttonContainer").style.display = "flex";
    document.getElementById("muteButton").style.display = "none";
    hideGameOverOverlay();
    pausedByPortraitMode = false;
    wasGameRunningBeforePortrait = false;
    setupWorld();
    updateMobileGameplayUI();
}

function resetKeyboardState() {
    keyboard.RIGHT = false;
    keyboard.LEFT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.D = false;
    keyboard.B = false;
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

/**
 * Applies keydown/keyup events to mapped game controls.
 * @param {KeyboardEvent} event Keyboard event.
 * @param {boolean} isPressed Current key state.
 * @returns {void}
 */
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