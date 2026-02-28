let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);

    console.log("My Character is", world.character);

    document.getElementById("startButton").addEventListener("click", () => {
        world.startGame();
        document.getElementById("buttonContainer").style.display = "none";
    });

    document.getElementById("fullscreenButton").addEventListener("click", () => {
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
    });

    document.getElementById("instructionsButton").addEventListener("click", () => {
        document.getElementById("instructionsModal").style.display = "flex";
    });

    document.getElementById("closeInstructionsButton").addEventListener("click", () => {
        document.getElementById("instructionsModal").style.display = "none";
    });

    document.getElementById("instructionsModal").addEventListener("click", (event) => {
        if (event.target.id === "instructionsModal") {
            document.getElementById("instructionsModal").style.display = "none";
        }
    });
}


window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        keyboard.RIGHT = true;
    }

    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
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

    if (event.key === "Enter") {
        keyboard.D = true;
    }
});

window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        keyboard.RIGHT = false;
    }

    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
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

    if (event.key === "Enter") {
        keyboard.D = false;
    }
});