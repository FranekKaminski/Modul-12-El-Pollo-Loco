/**
 * Stops active horizontal input states.
 * @returns {void}
 */
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

/**
 * Shows the impressum shortcut button only on touch start screens.
 * @param {HTMLElement|null} [impressumButton=document.getElementById("impressumButton")] Impressum button element.
 * @returns {void}
 */
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

/**
 * Checks whether required mobile UI elements are available.
 * @param {MobileUIElements} mobileUI Mobile UI element bundle.
 * @returns {boolean}
 */
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

/**
 * Hides all mobile-only gameplay overlays.
 * @param {MobileUIElements} mobileUI Mobile UI element bundle.
 * @returns {void}
 */
function hideMobileUI(mobileUI) {
    mobileUI.rotateOverlay.style.display = "none";
    mobileUI.touchControls.style.display = "none";
}

/**
 * Applies portrait mode UI and pauses gameplay while device is rotated.
 * @param {MobileUIElements} mobileUI Mobile UI element bundle.
 * @returns {void}
 */
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

/**
 * Returns whether gameplay should be paused because of portrait orientation.
 * @returns {boolean}
 */
function shouldPauseForPortrait() {
    return world && world.gameStarted && !world.gameOver && !pausedByPortraitMode;
}

/**
 * Restores landscape mode UI and resumes game state when applicable.
 * @param {MobileUIElements} mobileUI Mobile UI element bundle.
 * @returns {void}
 */
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

/**
 * Binds a touch movement button to left/right keyboard state.
 * @param {HTMLElement|null} button Touch button element.
 * @param {"left"|"right"} side Direction mapped to the button.
 * @returns {void}
 */
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

/**
 * Binds a touch action button (jump/throw/buy) to a keyboard flag.
 * @param {HTMLElement|null} button Touch button element.
 * @param {keyof Keyboard} actionKey Keyboard state key to toggle.
 * @returns {void}
 */
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

/**
 * Creates a touch handler that toggles left/right movement.
 * @param {"left"|"right"} side Direction to control.
 * @param {boolean} isPressed Keyboard value to set.
 * @returns {(event: TouchEvent) => void}
 */
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

/**
 * Creates a touch handler that toggles one action key.
 * @param {keyof Keyboard} actionKey Keyboard state key.
 * @param {boolean} isPressed Keyboard value to set.
 * @returns {(event: TouchEvent) => void}
 */
function createTouchActionHandler(actionKey, isPressed) {
    return (event) => {
        event.preventDefault();
        keyboard[actionKey] = isPressed;
    };
}

/**
 * Wires all touch controls to keyboard emulation.
 * @param {HTMLElement|null} touchLeftButton Left movement button.
 * @param {HTMLElement|null} touchRightButton Right movement button.
 * @param {HTMLElement|null} touchJumpButton Jump action button.
 * @param {HTMLElement|null} touchThrowButton Throw action button.
 * @param {HTMLElement|null} touchBuyButton Buy action button.
 * @returns {void}
 */
function setupTouchControls(touchLeftButton, touchRightButton, touchJumpButton, touchThrowButton, touchBuyButton) {
    bindTouchMoveButton(touchLeftButton, "left");
    bindTouchMoveButton(touchRightButton, "right");
    bindTouchActionButton(touchJumpButton, "UP");
    bindTouchActionButton(touchThrowButton, "D");
    bindTouchActionButton(touchBuyButton, "B");
}

/**
 * Registers resize/orientation listeners for mobile UI handling.
 * @returns {void}
 */
function setupMobileListeners() {
    window.addEventListener("resize", updateMobileGameplayUI);
    window.addEventListener("orientationchange", updateMobileGameplayUI);
    updateMobileGameplayUI();
}
