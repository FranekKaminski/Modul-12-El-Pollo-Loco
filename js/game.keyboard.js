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

/**
 * Applies horizontal movement keys.
 * @param {string} key Pressed/released key.
 * @param {boolean} isPressed Current key state.
 * @returns {void}
 */
function applyHorizontalKeys(key, isPressed) {
    if (key === "ArrowRight" || key === "d" || key === "D") {
        keyboard.RIGHT = isPressed;
    }
    if (key === "ArrowLeft" || key === "a" || key === "A") {
        keyboard.LEFT = isPressed;
    }
}

/**
 * Applies vertical movement keys.
 * @param {string} key Pressed/released key.
 * @param {boolean} isPressed Current key state.
 * @returns {void}
 */
function applyVerticalKeys(key, isPressed) {
    if (key === "ArrowDown") {
        keyboard.DOWN = isPressed;
    }
    if (key === "ArrowUp") {
        keyboard.UP = isPressed;
    }
}

/**
 * Applies gameplay action keys.
 * @param {string} key Pressed/released key.
 * @param {boolean} isPressed Current key state.
 * @returns {void}
 */
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
