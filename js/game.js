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

/**
 * Applies current volume and mute state to one audio object.
 * @param {HTMLAudioElement} audio Audio instance.
 * @returns {void}
 */
function applyVolumeToAudio(audio) {
    audio.volume = gameVolume;
    audio.muted = gameVolume === 0;
}

/**
 * Registers an audio instance for global game-volume updates.
 * @param {HTMLAudioElement|null|undefined} audio Audio instance.
 * @returns {void}
 */
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

/**
 * Persists current audio settings in local storage.
 * @returns {void}
 */
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

/**
 * Loads persisted audio settings from local storage.
 * @returns {void}
 */
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

/**
 * Updates mute button label based on current volume.
 * @returns {void}
 */
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

/**
 * Disables context menu on canvas for touch devices.
 * @returns {void}
 */
function setupCanvasContextMenu() {
    if (!isTouchDevice || !canvas) {
        return;
    }
    canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });
}

/**
 * Initializes looping background music and volume tracking.
 * @returns {void}
 */
function setupBackgroundMusic() {
    backgroundMusic.loop = true;
    registerGameAudio(backgroundMusic);
}

/**
 * Starts background music playback.
 * @returns {void}
 */
function startBackgroundMusic() {
    backgroundMusic.play().catch(() => {});
}

/**
 * Stops and rewinds background music playback.
 * @returns {void}
 */
function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

/**
 * Reads frequently used UI elements for initialization.
 * @returns {{
 *   volumeSlider: HTMLElement|null,
 *   muteButton: HTMLElement|null,
 *   impressumButton: HTMLElement|null,
 *   touchLeftButton: HTMLElement|null,
 *   touchRightButton: HTMLElement|null,
 *   touchJumpButton: HTMLElement|null,
 *   touchThrowButton: HTMLElement|null,
 *   touchBuyButton: HTMLElement|null
 * }}
 */
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

/**
 * Binds slider-based volume controls.
 * @param {HTMLInputElement} volumeSlider Volume range input.
 * @returns {void}
 */
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

/**
 * Hides the game-over overlay.
 * @returns {void}
 */
function hideGameOverOverlay() {
    document.getElementById("gameOverOverlay").style.display = "none";
}

/**
 * Sets up all primary menu/game control buttons.
 * @param {{muteButton: HTMLElement|null, impressumButton: HTMLElement|null, volumeSlider: HTMLInputElement|null}} ui UI bundle.
 * @returns {void}
 */
function setupMainButtons(ui) {
    setupStartButton(ui.muteButton);
    setupImpressumButton(ui.impressumButton);
    setupMuteButton(ui.muteButton, ui.volumeSlider);
    setupFullscreenButton();
}

/**
 * Binds the impressum navigation button.
 * @param {HTMLElement|null} impressumButton Impressum button element.
 * @returns {void}
 */
function setupImpressumButton(impressumButton) {
    if (!impressumButton) {
        return;
    }
    impressumButton.addEventListener("click", () => {
        window.location.href = "./impressum.html";
    });
    updateImpressumStartButtonVisibility(impressumButton);
}

/**
 * Binds the start button to begin gameplay.
 * @param {HTMLElement|null} muteButton Mute button element.
 * @returns {void}
 */
function setupStartButton(muteButton) {
    document.getElementById("startButton").addEventListener("click", () => {
        world.startGame();
        startBackgroundMusic();
        document.getElementById("buttonContainer").style.display = "none";
        muteButton.style.display = "block";
        updateMobileGameplayUI();
    });
}

/**
 * Binds mute button behavior and keeps slider in sync.
 * @param {HTMLElement} muteButton Mute button element.
 * @param {HTMLInputElement} volumeSlider Volume range input.
 * @returns {void}
 */
function setupMuteButton(muteButton, volumeSlider) {
    muteButton.addEventListener("click", () => {
        const newVolume = gameVolume === 0 ? (volumeBeforeMute > 0 ? volumeBeforeMute : 0.5) : 0;
        setGameVolume(newVolume);
        volumeSlider.value = Math.round(gameVolume * 100);
        updateMuteButtonLabel();
    });
}

/**
 * Binds fullscreen button behavior.
 * @returns {void}
 */
function setupFullscreenButton() {
    document.getElementById("fullscreenButton").addEventListener("click", () => {
        requestGameContainerFullscreen();
    });
}

/**
 * Requests fullscreen mode for the game container.
 * @returns {void}
 */
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

/**
 * Wires instruction modal open/close events.
 * @returns {void}
 */
function setupInstructionModal() {
    document.getElementById("instructionsButton").addEventListener("click", openInstructionsModal);
    document.getElementById("closeInstructionsButton").addEventListener("click", closeInstructionsModal);
    document.getElementById("instructionsModal").addEventListener("click", closeInstructionsOnBackdrop);
    const footerInstructionsLink = document.getElementById("footerInstructionsLink");
    if (footerInstructionsLink) {
        footerInstructionsLink.addEventListener("click", (event) => {
            event.preventDefault();
            openInstructionsModal();
        });
    }
}

/**
 * Opens the instruction modal overlay.
 * @returns {void}
 */
function openInstructionsModal() {
    document.getElementById("instructionsModal").style.display = "flex";
}

/**
 * Closes the instruction modal overlay.
 * @returns {void}
 */
function closeInstructionsModal() {
    document.getElementById("instructionsModal").style.display = "none";
}

/**
 * Closes instruction modal when clicking the backdrop.
 * @param {MouseEvent} event Click event.
 * @returns {void}
 */
function closeInstructionsOnBackdrop(event) {
    if (event.target.id === "instructionsModal") {
        closeInstructionsModal();
    }
}

/**
 * Binds restart button behavior.
 * @returns {void}
 */
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

/**
 * Resets all keyboard state flags.
 * @returns {void}
 */
function resetKeyboardState() {
    keyboard.RIGHT = false;
    keyboard.LEFT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.D = false;
    keyboard.B = false;
}
