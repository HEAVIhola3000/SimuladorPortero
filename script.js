
// Cargar imagen del balón
const ballImage = new Image();
let ballImageLoaded = false;

ballImage.onload = () => {
    ballImageLoaded = true;
    console.log("¡Balón cargado correctamente!");
};

ballImage.onerror = () => {
    console.error("Error: no se encontró balon.png");
};

ballImage.src = "balon.png.svg";

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');

const easyBtn = document.getElementById("easyBtn");
const mediumBtn = document.getElementById("mediumBtn");
const hardBtn = document.getElementById("hardBtn");
const MAX_SCORE = 30;

let difficulty = "medio";

easyBtn.addEventListener("click", () => {
    difficulty = "facil";
    updateDifficultyButtons();
});

mediumBtn.addEventListener("click", () => {
    difficulty = "medio";
    updateDifficultyButtons();
});

hardBtn.addEventListener("click", () => {
    difficulty = "dificil";
    updateDifficultyButtons();
});

function updateDifficultyButtons() {
    easyBtn.classList.toggle("selected", difficulty === "facil");
    mediumBtn.classList.toggle("selected", difficulty === "medio");
    hardBtn.classList.toggle("selected", difficulty === "dificil");
}

updateDifficultyButtons();

let score = 0;
let lives = 3;

let ball = {
    x: 160,
    y: 0,
    speed: 6.5,
    radius: 35,
    active: true
};

let handPositions = [];

let lastImage = null;
let lastDetectionTime = 0;
const DETECTION_INTERVAL = 33;

function resetBall() {
    ball.x = ball.radius +
        Math.random() * (canvasElement.width - 2 * ball.radius);

    ball.y = 10;

    if (difficulty === "facil") {
        ball.speed = Math.random() * 1 + 4;
    } else if (difficulty === "medio") {
        ball.speed = Math.random() * 1 + 7;
    } else if (difficulty === "dificil") {
        ball.speed = Math.random() * 2 + 9;
    }

    ball.active = true;
}

// Motor del juego
function gameLoop() {

    canvasCtx.save();

    canvasCtx.clearRect(
        0, 0,
        canvasElement.width,
        canvasElement.height
    );

    // Dibujar cámara en espejo
    if (lastImage) {
        canvasCtx.translate(canvasElement.width, 0);
        canvasCtx.scale(-1, 1);

        canvasCtx.drawImage(
            lastImage,
            0, 0,
            canvasElement.width,
            canvasElement.height
        );
    }

    canvasCtx.restore();

    // Dibujar guantes
    for (let hand of handPositions) {

        canvasCtx.beginPath();

        canvasCtx.arc(
            hand.x,
            hand.y,
            20,
            0,
            2 * Math.PI
        );

        canvasCtx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        canvasCtx.fill();

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#ffffff';
        canvasCtx.stroke();
    }

    // Actualizar y dibujar balón
    if (ball.active && lives > 0) {

        ball.y += ball.speed;

        // NUEVO BALÓN CON IMAGEN PNG
        if (ballImageLoaded) {

            canvasCtx.save();

            canvasCtx.drawImage(
                ballImage,
                ball.x - ball.radius,
                ball.y - ball.radius,
                ball.radius * 2,
                ball.radius * 2
            );

            canvasCtx.restore();

        }

        // Colisión con los guantes
        for (let hand of handPositions) {

            let dist = Math.hypot(
                hand.x - ball.x,
                hand.y - ball.y
            );

            if (dist < ball.radius + 20) {
    score++;

    if (score >= MAX_SCORE) {
        lives = 0;
    } else {
        resetBall();
    }

    break;
}
        }

        // Gol
        if (ball.y > canvasElement.height) {
            lives--;
            resetBall();
        }
    }

    // HUD
    canvasCtx.save();

    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    canvasCtx.beginPath();
    canvasCtx.roundRect(10, 10, 620, 65, 12);
    canvasCtx.fill();

    // Atajadas
    canvasCtx.font = 'bold 21px Arial';
    canvasCtx.fillStyle = '#00FF88';
    canvasCtx.shadowColor = '#00FF88';
    canvasCtx.shadowBlur = 10;

    canvasCtx.fillText(
        `ATAJADAS: ${score}`,
        25, 40
    );

    // Vidas
    canvasCtx.shadowColor = '#FF3333';
    canvasCtx.fillStyle = '#FF4444';

    canvasCtx.fillText(
        `VIDAS: ${'♥ '.repeat(lives)}`,
        250, 40
    );

    // Dificultad
    canvasCtx.shadowBlur = 0;
    canvasCtx.font = 'bold 16px Arial';
    canvasCtx.fillStyle = '#FFCC00';

    canvasCtx.fillText(
        `NIVEL: ${difficulty.toUpperCase()}`,
        450, 40
    );

    canvasCtx.restore();

    // GAME OVER
    if (lives <= 0) {

        canvasCtx.save();

        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        canvasCtx.beginPath();
        canvasCtx.roundRect(120, 150, 400, 170, 15);
        canvasCtx.fill();

        canvasCtx.strokeStyle = '#FF3333';
        canvasCtx.lineWidth = 3;
        canvasCtx.stroke();

        canvasCtx.textAlign = 'center';
        canvasCtx.font = 'bold 32px Arial';
        canvasCtx.fillStyle = score >= MAX_SCORE ? '#00FF00' : '#FF3333';
        canvasCtx.shadowColor = score >= MAX_SCORE ? '#00FF00' : '#FF0000';
        canvasCtx.shadowBlur = 15;

        canvasCtx.fillText(
    score >= MAX_SCORE ? '¡PORTERIA EN 0!' : 'GAME OVER',
    320,
    215
);

        canvasCtx.shadowBlur = 0;
        canvasCtx.font = '18px Arial';
        canvasCtx.fillStyle = '#FFFFFF';

        canvasCtx.fillText(
            score >= MAX_SCORE
    ? '¡FELICIDADES! PORTERIA EN 0'
    : '¡GOLEADO!',
            320, 265
        );

        //mensaje para reiniciar 
        canvasCtx.font = 'bold 18px Arial';
canvasCtx.fillStyle = '#FFFFFF';

canvasCtx.fillText(
    'PRESIONA SPACE PARA VOLVER A JUGAR',
    320, 295
);
        canvasCtx.restore();
    }

    requestAnimationFrame(gameLoop);
}

// MediaPipe
function onResults(results) {

    lastImage = results.image;
    handPositions = [];

    if (results.multiHandLandmarks) {

        for (const landmarks of results.multiHandLandmarks) {

            let cx = (1 - landmarks[9].x) * canvasElement.width;
            let cy = landmarks[9].y * canvasElement.height;

            handPositions.push({
                x: cx,
                y: cy
            });
        }
    }
}

const hands = new Hands({
    locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 0,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {

    onFrame: async () => {

        const currentTime = performance.now();

        if (currentTime - lastDetectionTime >= DETECTION_INTERVAL) {

            await hands.send({
                image: videoElement
            });

            lastDetectionTime = currentTime;

        } else {

            lastImage = videoElement;
        }
    },

    width: 1280,
    height: 720
});

// Iniciar juego
camera.start();
requestAnimationFrame(gameLoop);

// Reiniciar partida

function restartGame() {
    if (lives <= 0) {
        score = 0;
        lives = 3;
        resetBall();
    }
}

// Reiniciar con barra espaciadora
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && lives <= 0) {
        event.preventDefault();
        restartGame();
    }
});

// También permitir reiniciar con clic
canvasElement.addEventListener('click', () => {
    restartGame();
});

