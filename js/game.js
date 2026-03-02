let canvas;
let world;
let keyboard = new Keyboard();
let gameVolume = 0.5;
const registeredGameAudio = new Set();

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
    registeredGameAudio.forEach((audio) => applyVolumeToAudio(audio));
}

window.registerGameAudio = registerGameAudio;
window.getGameVolume = () => gameVolume;
window.setGameVolume = setGameVolume;
window.showGameOverOverlay = () => {
    const overlay = document.getElementById("gameOverOverlay");
    if (overlay) {
        overlay.style.display = "flex";
    }
};

function init() {
    const volumeSlider = document.getElementById("volumeSlider");
    setGameVolume(Number(volumeSlider.value) / 100);
    volumeSlider.addEventListener("input", () => {
        setGameVolume(Number(volumeSlider.value) / 100);
    });

    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);

    const gameOverOverlay = document.getElementById("gameOverOverlay");
    gameOverOverlay.style.display = "none";

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

    document.getElementById("restartButton").addEventListener("click", () => {
        location.reload();
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