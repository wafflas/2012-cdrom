/**
 * Game initialization for the 2012 Pacman Game
 * This file handles the initial setup and UI interactions,
 * while delegating actual game logic to pacman/game.js
 */

// Add global key handler for Pacman
window.keyPressed = function(key) {
    // Map arrow keys to Pacman directions
    switch(key) {
        case "ArrowLeft": // Left arrow
            if (window.pacman) {
                window.pacman.nextDirection = 2; // DIRECTION_LEFT
            }
            break;
        case "ArrowUp": // Up arrow
            if (window.pacman) {
                window.pacman.nextDirection = 3; // DIRECTION_UP
            }
            break;
        case "ArrowRight": // Right arrow
            if (window.pacman) {
                window.pacman.nextDirection = 4; // DIRECTION_RIGHT
            }
            break;
        case "ArrowDown": // Down arrow
            if (window.pacman) {
                window.pacman.nextDirection = 1; // DIRECTION_BOTTOM
            }
            break;
    }
};

// Expose function to reset game
window.resetGame = function() {
    if (window.restartPacmanAndGhosts) {
        window.restartPacmanAndGhosts();
        window.score = 0;
        window.lives = 3;
    }
};

// Expose function to pause game
window.pauseGame = function() {
    // Nothing specific to do here, as the game is controlled by the visibility
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const startGameBtn = document.getElementById('start-game');
    const gameContainer = document.getElementById('pacman-container');
    const gameMenu = document.getElementById('game-menu');
    const backToMenuBtn = document.getElementById('back-to-menu');
    
    // Get game canvas elements
const canvas = document.getElementById("canvas");
const pacmanFrames = document.getElementById("animation");
const ghostFrames = document.getElementById("ghosts");

    if (canvas) {
        const canvasContext = canvas.getContext("2d");
        
        // Calculate map dimensions
        const oneBlockSize = 16;
        const wallSpaceWidth = oneBlockSize / 1.6;
        const wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
        const wallInnerColor = "#061a1f";
        const wallOuterColor = "#00e6ff";
        const foodColor = "#00ff77";
        const backgroundColor = "#030f12";
        
        // Set ghost targets
        const randomTargetsForGhosts = [
            { x: wallOffset + 1 * oneBlockSize, y: wallOffset + 1 * oneBlockSize },
            { x: wallOffset + 1 * oneBlockSize, y: (23 * oneBlockSize) - wallOffset },
            { x: (21 * oneBlockSize) - wallOffset, y: wallOffset + 1 * oneBlockSize },
            { x: (21 * oneBlockSize) - wallOffset, y: (23 * oneBlockSize) - wallOffset },
        ];
        
        // Add keyboard focus to the game canvas
        canvas.focus();
        canvas.addEventListener('click', () => {
            canvas.focus();
        });
    }
    
    // Add event listener for the START button
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            // Hide menu and show game
            if (gameMenu) gameMenu.style.display = 'none';
            if (gameContainer) gameContainer.style.display = 'block';
            if (backToMenuBtn) backToMenuBtn.style.display = 'block';
            
            // Initialize or reset game
            if (gameInterval) {
                clearInterval(gameInterval);
            }
            
            resetGame();
            
            // Start game loop
            gameInterval = setInterval(gameLoop, 1000 / fps);
        });
    }
    
    // Setup back to menu button if it exists
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            if (gameContainer) gameContainer.style.display = 'none';
            if (backToMenuBtn) backToMenuBtn.style.display = 'none';
            if (gameMenu) gameMenu.style.display = 'block';
            
            // Pause game
            pauseGame();
        });
    }
    
    // Add keyboard event listeners
    window.addEventListener("keydown", (event) => {
        let k = event.key;
        setTimeout(() => {
            if (k == "ArrowLeft" || k == "a" || k == "A") {
                // left arrow or a
                if (pacman) pacman.nextDirection = DIRECTION_LEFT;
            } else if (k == "ArrowUp" || k == "w" || k == "W") {
                // up arrow or w
                if (pacman) pacman.nextDirection = DIRECTION_UP;
            } else if (k == "ArrowRight" || k == "d" || k == "D") {
                // right arrow or d
                if (pacman) pacman.nextDirection = DIRECTION_RIGHT;
            } else if (k == "ArrowDown" || k == "s" || k == "S") {
                // bottom arrow or s
                if (pacman) pacman.nextDirection = DIRECTION_BOTTOM;
            }
        }, 1);
    });
});

/**
 * Loads Pacman game scripts dynamically
 * Ensures all required scripts are loaded before starting the game
 */
function loadPacmanScripts() {
    // Scripts needed for the game to run
    const scripts = [
        'pacman/ghost.js',
        'pacman/pacman.js',
        'pacman/game.js'
    ];
    
    // Load scripts in sequence
    let loadedCount = 0;
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loadedCount++;
            if (loadedCount === scripts.length) {
                console.log('All Pacman scripts loaded');
            }
        };
        document.body.appendChild(script);
    });
}

/**
 * Fixes keyboard control issues by ensuring the canvas has focus
 * Called after all game scripts are loaded
 */
function fixKeyboardControls() {
    const canvas = document.getElementById('canvas');
    if (canvas) {
        canvas.focus();
        // Add click handler to refocus canvas
        canvas.addEventListener('click', () => {
            canvas.focus();
        });
    }
}

/**
 * Game code for the 2012 Pacman-style game
 * Contains all game mechanics, rendering, and controls
 */

// Global variables and game state
let canvas;
let canvasContext;
let pacmanFrames;
let ghostFrames;
let fps = 30;
let gameInterval;

// Game objects and state
let pacman;
let ghosts = [];
let score = 0;
let lives = 3;
let ghostCount = 4;

// Game constants
const DIRECTION_RIGHT = 4;
const DIRECTION_UP = 3;
const DIRECTION_LEFT = 2;
const DIRECTION_BOTTOM = 1;

// Game dimensions and appearance
let oneBlockSize = 16;
let wallSpaceWidth = oneBlockSize / 1.6;
let wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
let wallInnerColor = "#061a1f";
let wallOuterColor = "#00e6ff";
let foodColor = "#00ff77";
let backgroundColor = "#030f12";

// Ghost sprite positions
let ghostImageLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];

// Map offsets for centering
let xOffset;
let yOffset;

// Game map (1 = wall, 2 = food, 0 = empty)
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

// Ghost random target positions
let randomTargetsForGhosts;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initial UI setup
    const startGameBtn = document.getElementById('start-game');
    const gameContainer = document.getElementById('pacman-container');
    const gameMenu = document.getElementById('game-menu');
    const backToMenuBtn = document.getElementById('back-to-menu');
    
    // Get game canvas elements
    canvas = document.getElementById("canvas");
    pacmanFrames = document.getElementById("animation");
    ghostFrames = document.getElementById("ghosts");
    
    if (canvas) {
        canvasContext = canvas.getContext("2d");
        
        // Calculate map dimensions
        let mapWidth = 21 * oneBlockSize;
        let mapHeight = 23 * oneBlockSize;
        xOffset = (canvas.width - mapWidth) / 2;
        yOffset = (canvas.height - mapHeight) / 2;
        
        // Set ghost targets
        randomTargetsForGhosts = [
    { x: xOffset + 1 * oneBlockSize, y: yOffset + 1 * oneBlockSize },
    { x: xOffset + 1 * oneBlockSize, y: yOffset + (map.length - 2) * oneBlockSize },
    { x: xOffset + (map[0].length - 2) * oneBlockSize, y: yOffset + oneBlockSize },
            { x: xOffset + (map[0].length - 2) * oneBlockSize, y: yOffset + (map.length - 2) * oneBlockSize },
        ];
        
        // Add keyboard focus to the game canvas
        canvas.focus();
        canvas.addEventListener('click', () => {
            canvas.focus();
        });
    }
    
    // Add event listener for the START button
    if (startGameBtn) {
        startGameBtn.addEventListener('click', () => {
            // Hide menu and show game
            if (gameMenu) gameMenu.style.display = 'none';
            if (gameContainer) gameContainer.style.display = 'block';
            if (backToMenuBtn) backToMenuBtn.style.display = 'block';
            
            // Initialize or reset game
            if (gameInterval) {
                clearInterval(gameInterval);
            }
            
            resetGame();
            
            // Start game loop
            gameInterval = setInterval(gameLoop, 1000 / fps);
        });
    }
    
    // Setup back to menu button if it exists
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            if (gameContainer) gameContainer.style.display = 'none';
            if (backToMenuBtn) backToMenuBtn.style.display = 'none';
            if (gameMenu) gameMenu.style.display = 'block';
            
            // Pause game
            pauseGame();
        });
    }
    
    // Add keyboard event listeners
    window.addEventListener("keydown", (event) => {
        let k = event.key;
        setTimeout(() => {
            if (k == "ArrowLeft" || k == "a" || k == "A") {
                // left arrow or a
                if (pacman) pacman.nextDirection = DIRECTION_LEFT;
            } else if (k == "ArrowUp" || k == "w" || k == "W") {
                // up arrow or w
                if (pacman) pacman.nextDirection = DIRECTION_UP;
            } else if (k == "ArrowRight" || k == "d" || k == "D") {
                // right arrow or d
                if (pacman) pacman.nextDirection = DIRECTION_RIGHT;
            } else if (k == "ArrowDown" || k == "s" || k == "S") {
                // bottom arrow or s
                if (pacman) pacman.nextDirection = DIRECTION_BOTTOM;
            }
        }, 1);
    });
});

// Utility function to create rectangles (with optional glow)
let createRect = (x, y, width, height, color, glowColor = null, glowSize = 0) => {
    if (!canvasContext) return;
    
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

// Game loop - calls update and draw functions
let gameLoop = () => {
    update();
    draw();
};

// Create new Pacman object
let createNewPacman = () => {
    pacman = new Pacman(
        xOffset + oneBlockSize,
        yOffset + oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize / 5
    );
};

// Create ghost objects
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

// Reset game function
let resetGame = () => {
    score = 0;
    lives = 3;
    createNewPacman();
    createGhosts();
};

// Pause game function
let pauseGame = () => {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
};

// Handle ghost collision
let onGhostCollision = () => {
    lives--;
    
    if (lives === 0) {
        // Game over - could add game over screen here
        pauseGame();
        setTimeout(() => {
            resetGame();
            gameInterval = setInterval(gameLoop, 1000 / fps);
        }, 2000);
    } else {
        createNewPacman();
        createGhosts();
    }
};

// Update game state
let update = () => {
    if (!pacman) return;
    
    pacman.moveProcess();
    pacman.eat();
    updateGhosts();
    if (pacman.checkGhostCollision(ghosts)) {
        onGhostCollision();
    }
};

// Update ghosts
let updateGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].moveProcess();
    }
};

// Draw game elements
let draw = () => {
    if (!canvasContext) return;
    
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    createRect(0, 0, canvas.width, canvas.height, backgroundColor);
    
    // Draw a tech HUD frame around the game area
    canvasContext.strokeStyle = "#00e6ff";
    canvasContext.lineWidth = 2;
    canvasContext.shadowColor = "#00e6ff";
    canvasContext.shadowBlur = 10;
    canvasContext.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    // Draw game title at top of screen
    canvasContext.font = "20px 'Orbitron', sans-serif";
    canvasContext.fillStyle = "#00e6ff";
    canvasContext.textAlign = "center";
    canvasContext.fillText("2012", canvas.width / 2, 25);
    
    // Add tech-style decorative elements
    canvasContext.beginPath();
    canvasContext.moveTo(10, 35);
    canvasContext.lineTo(canvas.width / 2 - 80, 35);
    canvasContext.strokeStyle = "#00e6ff";
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
    if (pacman) pacman.draw();
    drawScore();
    drawRemainingLives();
};

// Draw walls
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

// Draw food items
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

// Draw ghosts
let drawGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].draw();
    }
};

// Draw score
let drawScore = () => {
    // Calculate positions for the HUD border
    let scoreHudX = 10;
    let scoreHudY = canvas.height - 35;
    let scoreHudWidth = 120;
    let scoreHudHeight = 25;
    
    // Draw the score text
    canvasContext.font = "16px 'Orbitron', sans-serif";
    canvasContext.fillStyle = "#00e6ff";
    canvasContext.textAlign = "left";
    canvasContext.fillText(
        "SCORE: " + score,
        scoreHudX + 10,
        scoreHudY + 18
    );
    
    // Draw mini HUD frame for score
    canvasContext.strokeStyle = "#00e6ff";
    canvasContext.lineWidth = 1;
    canvasContext.beginPath();
    canvasContext.rect(scoreHudX, scoreHudY, scoreHudWidth, scoreHudHeight);
    canvasContext.stroke();
    
    // Reset text alignment
    canvasContext.textAlign = "left";
};

// Draw remaining lives
let drawRemainingLives = () => {
    // Calculate positions for the HUD border
    let livesLabelX = canvas.width - 20;
    let livesY = canvas.height - 15;
    let livesWidth = 60 + (lives * (oneBlockSize + 5));
    let livesHudX = canvas.width - livesWidth - 20;
    let livesHudY = canvas.height - 35;
    
    // Draw the lives label
    canvasContext.font = "16px 'Orbitron', sans-serif";
    canvasContext.fillStyle = "#00e6ff";
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
    canvasContext.strokeStyle = "#00e6ff";
    canvasContext.lineWidth = 1;
    canvasContext.beginPath();
    canvasContext.rect(livesHudX, livesHudY, livesWidth, 25);
    canvasContext.stroke();
};

// Pacman class definition
class Pacman {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 4; // Default to right
        this.nextDirection = 4;
        this.frameCount = 7;
        this.currentFrame = 1;
        setInterval(() => {
            this.changeAnimation();
        }, 100);
    }

    changeAnimation() {
        this.currentFrame = this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        if (!canvasContext) return;
        
        canvasContext.save();
        canvasContext.translate(
            this.x + oneBlockSize / 2,
            this.y + oneBlockSize / 2
        );
        canvasContext.rotate((this.direction * 90 * Math.PI) / 180);
        canvasContext.translate(
            -this.x - oneBlockSize / 2,
            -this.y - oneBlockSize / 2
        );
        canvasContext.drawImage(
            pacmanFrames,
            (this.currentFrame - 1) * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }

    moveProcess() {
        if (this.isInRangeOfBlock(this.x, this.y)) {
            this.changeDirectionIfPossible();
    }
        
        if (this.checkCollision(this.x, this.y, this.direction)) {
            return;
        }
        
        switch (this.direction) {
            case DIRECTION_RIGHT:
                this.x += this.speed;
                break;
            case DIRECTION_UP:
                this.y -= this.speed;
                break;
            case DIRECTION_LEFT:
                this.x -= this.speed;
                break;
            case DIRECTION_BOTTOM:
                this.y += this.speed;
                break;
        }
    }

    eat() {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (
                    map[i][j] == 2 &&
                    this.getBlockX() == j &&
                    this.getBlockY() == i
                ) {
                    map[i][j] = 0;
                    score++;
                }
            }
        }
    }

    checkGhostCollision(ghosts) {
        for (let i = 0; i < ghosts.length; i++) {
            let ghost = ghosts[i];
            if (
                ghost.getBlockX() == this.getBlockX() &&
                ghost.getBlockY() == this.getBlockY()
            ) {
                return true;
            }
        }
        return false;
    }

    changeDirectionIfPossible() {
        if (this.direction == this.nextDirection) return;
        
        let tempDirection = this.direction;
        this.direction = this.nextDirection;
        
        if (this.checkCollision(this.x, this.y, this.nextDirection)) {
            this.direction = tempDirection;
        }
    }

    getBlockX() {
        return parseInt((this.x - xOffset) / oneBlockSize);
    }

    getBlockY() {
        return parseInt((this.y - yOffset) / oneBlockSize);
    }

    getNextBlockX() {
        if (this.direction == DIRECTION_LEFT) {
            return this.getBlockX() - 1;
        } else if (this.direction == DIRECTION_RIGHT) {
            return this.getBlockX() + 1;
        }
        return this.getBlockX();
    }

    getNextBlockY() {
        if (this.direction == DIRECTION_UP) {
            return this.getBlockY() - 1;
        } else if (this.direction == DIRECTION_BOTTOM) {
            return this.getBlockY() + 1;
        }
        return this.getBlockY();
    }

    isInRangeOfBlock(x, y) {
        let blockX = parseInt((x - xOffset) / oneBlockSize);
        let blockY = parseInt((y - yOffset) / oneBlockSize);
        return (
            x - xOffset - blockX * oneBlockSize < oneBlockSize / 3 &&
            y - yOffset - blockY * oneBlockSize < oneBlockSize / 3
        );
    }

    checkCollision(x, y, direction) {
        let blockX = parseInt((x - xOffset) / oneBlockSize);
        let blockY = parseInt((y - yOffset) / oneBlockSize);
        
        if (direction == DIRECTION_RIGHT) {
            blockX += 1;
        } else if (direction == DIRECTION_BOTTOM) {
            blockY += 1;
        } else if (direction == DIRECTION_LEFT) {
            blockX -= 1;
        } else if (direction == DIRECTION_UP) {
            blockY -= 1;
        }
        
        return blockX < 0 || blockX >= map[0].length || blockY < 0 || blockY >= map.length || map[blockY][blockX] == 1;
    }
}

// Ghost class definition
class Ghost {
    constructor(
        x,
        y,
        width,
        height,
        speed,
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        range
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = DIRECTION_RIGHT;
        this.imageX = imageX;
        this.imageY = imageY;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
        this.range = range;
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.target = randomTargetsForGhosts[this.randomTargetIndex];
        setInterval(() => {
            this.changeRandomDirection();
        }, 10000);
    }

    changeRandomDirection() {
        this.randomTargetIndex += parseInt(Math.random() * 4);
        this.randomTargetIndex = this.randomTargetIndex % 4;
    }

    moveProcess() {
        if (this.isInRangeOfBlock(this.x, this.y)) {
            this.changeDirectionIfPossible();
        }
        
        if (this.checkCollision(this.x, this.y, this.direction)) {
            return;
        }
        
        switch (this.direction) {
            case DIRECTION_RIGHT:
                this.x += this.speed;
                break;
            case DIRECTION_UP:
                this.y -= this.speed;
                break;
            case DIRECTION_LEFT:
                this.x -= this.speed;
                break;
            case DIRECTION_BOTTOM:
                this.y += this.speed;
                break;
        }
    }

    draw() {
        if (!canvasContext) return;
        
        canvasContext.save();
        canvasContext.drawImage(
            ghostFrames,
            this.imageX,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }

    changeDirectionIfPossible() {
        let tempDirection = this.direction;
        
        // Target the player
        this.target = {
            x: pacman.x,
            y: pacman.y,
        };

        // Use random target if ghost is too close to pacman based on range
        if (
            Math.abs(pacman.x - this.x) < this.range &&
            Math.abs(pacman.y - this.y) < this.range
        ) {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }

        // Calculate direction based on target
        let leftDistance = calculateDistance(
            { x: this.x - this.speed, y: this.y },
            this.target
        );
        let rightDistance = calculateDistance(
            { x: this.x + this.speed, y: this.y },
            this.target
        );
        let upDistance = calculateDistance(
            { x: this.x, y: this.y - this.speed },
            this.target
        );
        let bottomDistance = calculateDistance(
            { x: this.x, y: this.y + this.speed },
            this.target
        );

        // Choose the direction with shortest distance
        let distances = [
            { direction: DIRECTION_LEFT, distance: leftDistance },
            { direction: DIRECTION_RIGHT, distance: rightDistance },
            { direction: DIRECTION_UP, distance: upDistance },
            { direction: DIRECTION_BOTTOM, distance: bottomDistance },
        ];
        
        // Sort by distance
        distances.sort((a, b) => a.distance - b.distance);

        // Test each direction starting with the closest
        for (let i = 0; i < distances.length; i++) {
            if (
                !this.checkCollision(this.x, this.y, distances[i].direction) &&
                distances[i].direction != getOppositeDirection(this.direction)
            ) {
                this.direction = distances[i].direction;
                break;
            }
        }
        
        // If we can't move in the chosen direction, continue in same direction if possible
        if (this.checkCollision(this.x, this.y, this.direction)) {
            this.direction = tempDirection;
            
            // If still blocked, try any valid direction
            if (this.checkCollision(this.x, this.y, this.direction)) {
                for (let i = 0; i < distances.length; i++) {
                    if (!this.checkCollision(this.x, this.y, distances[i].direction)) {
                        this.direction = distances[i].direction;
                        break;
                    }
                }
            }
        }
    }

    getBlockX() {
        return parseInt((this.x - xOffset) / oneBlockSize);
    }

    getBlockY() {
        return parseInt((this.y - yOffset) / oneBlockSize);
    }

    getNextBlockX() {
        if (this.direction == DIRECTION_LEFT) {
            return this.getBlockX() - 1;
        } else if (this.direction == DIRECTION_RIGHT) {
            return this.getBlockX() + 1;
        }
        return this.getBlockX();
    }

    getNextBlockY() {
        if (this.direction == DIRECTION_UP) {
            return this.getBlockY() - 1;
        } else if (this.direction == DIRECTION_BOTTOM) {
            return this.getBlockY() + 1;
        }
        return this.getBlockY();
    }

    isInRangeOfBlock(x, y) {
        let blockX = parseInt((x - xOffset) / oneBlockSize);
        let blockY = parseInt((y - yOffset) / oneBlockSize);
        return (
            x - xOffset - blockX * oneBlockSize < oneBlockSize / 3 &&
            y - yOffset - blockY * oneBlockSize < oneBlockSize / 3
        );
    }

    checkCollision(x, y, direction) {
        let blockX = parseInt((x - xOffset) / oneBlockSize);
        let blockY = parseInt((y - yOffset) / oneBlockSize);
        
        if (direction == DIRECTION_RIGHT) {
            blockX += 1;
        } else if (direction == DIRECTION_BOTTOM) {
            blockY += 1;
        } else if (direction == DIRECTION_LEFT) {
            blockX -= 1;
        } else if (direction == DIRECTION_UP) {
            blockY -= 1;
        }
        
        return blockX < 0 || blockX >= map[0].length || blockY < 0 || blockY >= map.length || map[blockY][blockX] == 1;
    }
}

// Helper functions
let calculateDistance = (point1, point2) => {
    return Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
};

let getOppositeDirection = (direction) => {
    if (direction == DIRECTION_LEFT) {
        return DIRECTION_RIGHT;
    } else if (direction == DIRECTION_RIGHT) {
        return DIRECTION_LEFT;
    } else if (direction == DIRECTION_UP) {
        return DIRECTION_BOTTOM;
    } else if (direction == DIRECTION_BOTTOM) {
        return DIRECTION_UP;
    }
    return -1; // Invalid direction
}; 