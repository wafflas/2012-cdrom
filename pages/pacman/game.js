const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const pacmanFrames = document.getElementById("animation");
const ghostFrames = document.getElementById("ghosts");

let createRect = (x, y, width, height, color, glowColor = null, glowSize = 0) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
    
    if (glowColor) {
        canvasContext.shadowColor = glowColor;
        canvasContext.shadowBlur = glowSize;
        canvasContext.strokeStyle = glowColor;
        canvasContext.lineWidth = 1;
        canvasContext.strokeRect(x, y, width, height);
        canvasContext.shadowBlur = 0;
    }
};

const DIRECTION_RIGHT = 4;
const DIRECTION_UP = 3;
const DIRECTION_LEFT = 2;
const DIRECTION_BOTTOM = 1;
let lives = 3;
let ghostCount = 4;
let ghostImageLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];

// Game variables
let fps = 30;
let pacman;
let oneBlockSize = 16;
let score = 0;
let ghosts = [];
let wallSpaceWidth = oneBlockSize / 1.6;
let wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
let wallInnerColor = "#061a1f";
let wallOuterColor = "#00e5ff";
let foodColor = "#00ff77";
let backgroundColor = "#030f12";

// Calculate canvas center offsets to center the map
let mapWidth = 21 * oneBlockSize; // 21 columns
let mapHeight = 23 * oneBlockSize; // 23 rows
let xOffset = (canvas.width - mapWidth) / 2;
let yOffset = (canvas.height - mapHeight) / 2;

// if 1 wall, if 0 not wall
// 21 columns // 23 rows
let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
    [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let randomTargetsForGhosts = [
    { x: xOffset + 1 * oneBlockSize, y: yOffset + 1 * oneBlockSize },
    { x: xOffset + 1 * oneBlockSize, y: yOffset + (map.length - 2) * oneBlockSize },
    { x: xOffset + (map[0].length - 2) * oneBlockSize, y: yOffset + oneBlockSize },
    {
        x: xOffset + (map[0].length - 2) * oneBlockSize,
        y: yOffset + (map.length - 2) * oneBlockSize,
    },
];


let createNewPacman = () => {
    pacman = new Pacman(
        xOffset + oneBlockSize,
        yOffset + oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize / 5
    );
};

let gameLoop = () => {
    update();
    draw();
};

let gameInterval = setInterval(gameLoop, 1000 / fps);

let restartPacmanAndGhosts = () => {
    createNewPacman();
    createGhosts();
};

let onGhostCollision = () => {
    lives--;
    restartPacmanAndGhosts();
    if (lives == 0) {
    }
};

let update = () => {
    pacman.moveProcess();
    pacman.eat();
    updateGhosts();
    if (pacman.checkGhostCollision(ghosts)) {
        onGhostCollision();
    }
};

let drawFoods = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 2) {
                // Draw dollar signs instead of dots
                canvasContext.font = "10px 'Orbitron', sans-serif";
                canvasContext.fillStyle = foodColor;
                canvasContext.textAlign = "center";
                canvasContext.textBaseline = "middle";
                
                // Add glow effect
                canvasContext.shadowColor = foodColor;
                canvasContext.shadowBlur = 5;
                
                // Draw the dollar sign
                canvasContext.fillText(
                    "$", 
                    xOffset + j * oneBlockSize + oneBlockSize / 2,
                    yOffset + i * oneBlockSize + oneBlockSize / 2
                );
                
                // Reset shadow
                canvasContext.shadowBlur = 0;
            }
        }
    }
};

let drawRemainingLives = () => {
    // Calculate positions for the HUD border
    let livesLabelX = canvas.width - 20;
    let livesY = canvas.height - 15;
    let livesWidth = 60 + (lives * (oneBlockSize + 5));
    let livesHudX = canvas.width - livesWidth - 20;
    let livesHudY = canvas.height - 35;
    
    // Draw the lives label
    canvasContext.font = "16px 'Orbitron', sans-serif";
    canvasContext.fillStyle = "#00e5ff";
    canvasContext.textAlign = "right";
    canvasContext.fillText("LIVES:", livesHudX + 60, livesY);
    canvasContext.textAlign = "left";

    // Draw Pacman lives icons in a row
    for (let i = 0; i < lives; i++) {
        canvasContext.drawImage(
            pacmanFrames,
            2 * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            livesHudX + 65 + i * (oneBlockSize + 5),
            livesHudY + 5,
            oneBlockSize,
            oneBlockSize
        );
    }
    
    // Draw mini HUD frame for lives
    canvasContext.strokeStyle = "#00e5ff";
    canvasContext.lineWidth = 1;
    canvasContext.beginPath();
    canvasContext.rect(livesHudX, livesHudY, livesWidth, 25);
    canvasContext.stroke();
};

let drawScore = () => {
    // Calculate positions for the HUD border
    let scoreHudX = 10;
    let scoreHudY = canvas.height - 35;
    let scoreHudWidth = 120;
    let scoreHudHeight = 25;
    
    // Draw the score text
    canvasContext.font = "16px 'Orbitron', sans-serif";
    canvasContext.fillStyle = "#00e5ff";
    canvasContext.textAlign = "left";
    canvasContext.fillText(
        "SCORE: " + score,
        scoreHudX + 10,
        scoreHudY + 18
    );
    
    // Draw mini HUD frame for score
    canvasContext.strokeStyle = "#00e5ff";
    canvasContext.lineWidth = 1;
    canvasContext.beginPath();
    canvasContext.rect(scoreHudX, scoreHudY, scoreHudWidth, scoreHudHeight);
    canvasContext.stroke();
    
    // Reset text alignment
    canvasContext.textAlign = "left";
};

let draw = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    createRect(0, 0, canvas.width, canvas.height, backgroundColor);
    
    // Draw a tech HUD frame around the game area
    canvasContext.strokeStyle = "#00e5ff";
    canvasContext.lineWidth = 2;
    canvasContext.shadowColor = "#00e5ff";
    canvasContext.shadowBlur = 10;
    canvasContext.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    // Draw game title at top of screen
    canvasContext.font = "20px 'Orbitron', sans-serif";
    canvasContext.fillStyle = "#00e5ff";
    canvasContext.textAlign = "center";
    canvasContext.fillText("2012", canvas.width / 2, 25);
    
    // Add tech-style decorative elements
    canvasContext.beginPath();
    canvasContext.moveTo(10, 35);
    canvasContext.lineTo(canvas.width / 2 - 80, 35);
    canvasContext.strokeStyle = "#00e5ff";
    canvasContext.lineWidth = 1;
    canvasContext.stroke();
    
    canvasContext.beginPath();
    canvasContext.moveTo(canvas.width / 2 + 80, 35);
    canvasContext.lineTo(canvas.width - 10, 35);
    canvasContext.stroke();
    
    // Reset shadow for rest of drawing
    canvasContext.shadowBlur = 0;
    canvasContext.textAlign = "left";
    
    drawWalls();
    drawFoods();
    drawGhosts();
    pacman.draw();
    drawScore();
    drawRemainingLives();
};

let drawWalls = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 1) {
                // Draw walls with glowing effect
                createRect(
                    xOffset + j * oneBlockSize,
                    yOffset + i * oneBlockSize,
                    oneBlockSize,
                    oneBlockSize,
                    wallInnerColor,
                    wallOuterColor,
                    3
                );
                
                if (j > 0 && map[i][j - 1] == 1) {
                    createRect(
                        xOffset + j * oneBlockSize,
                        yOffset + i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (j < map[0].length - 1 && map[i][j + 1] == 1) {
                    createRect(
                        xOffset + j * oneBlockSize + wallOffset,
                        yOffset + i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (i < map.length - 1 && map[i + 1][j] == 1) {
                    createRect(
                        xOffset + j * oneBlockSize + wallOffset,
                        yOffset + i * oneBlockSize + wallOffset,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }

                if (i > 0 && map[i - 1][j] == 1) {
                    createRect(
                        xOffset + j * oneBlockSize + wallOffset,
                        yOffset + i * oneBlockSize,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }
            }
        }
    }
};

let createGhosts = () => {
    ghosts = [];
    for (let i = 0; i < ghostCount * 2; i++) {
        let newGhost = new Ghost(
            xOffset + 9 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
            yOffset + 10 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
            oneBlockSize,
            oneBlockSize,
            pacman.speed / 2,
            ghostImageLocations[i % 4].x,
            ghostImageLocations[i % 4].y,
            124,
            116,
            6 + i
        );
        ghosts.push(newGhost);
    }
};

createNewPacman();
createGhosts();
gameLoop();

window.addEventListener("keydown", (event) => {
    let k = event.keyCode;
    setTimeout(() => {
        if (k == 37 || k == 65) {
            // left arrow or a
            pacman.nextDirection = DIRECTION_LEFT;
        } else if (k == 38 || k == 87) {
            // up arrow or w
            pacman.nextDirection = DIRECTION_UP;
        } else if (k == 39 || k == 68) {
            // right arrow or d
            pacman.nextDirection = DIRECTION_RIGHT;
        } else if (k == 40 || k == 83) {
            // bottom arrow or s
            pacman.nextDirection = DIRECTION_BOTTOM;
        }
    }, 1);
});
