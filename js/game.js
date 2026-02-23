let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);

    console.log("My Character is", world.character);
}


window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
        keyboard.RIGHT = true;
    }

    if (event.key === "ArrowLeft") {
        keyboard.LEFT = true;
    }

    if (event.key === "ArrowDown") {
        keyboard.DOWN = true;
    }

    if (event.key === "ArrowUp") {
        keyboard.UP = true;
    }

    if (event.key === " ") {
        keyboard.SPACE = true;
    }
});

window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowRight") {
        keyboard.RIGHT = false;
    }

    if (event.key === "ArrowLeft") {
        keyboard.LEFT = false;
    }

    if (event.key === "ArrowDown") {
        keyboard.DOWN = false;
    }

    if (event.key === "ArrowUp") {
        keyboard.UP = false;
    }

    if (event.key === " ") {
        keyboard.SPACE = false;
    }
});