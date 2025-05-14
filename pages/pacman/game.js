// Main game module for Cyberpunk Pac-Man
const CYBERPACMAN = (function() {
    console.log("Initializing CYBERPACMAN module");
    
    // Canvas setup
const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const pacmanFrames = document.getElementById("animation");
const ghostFrames = document.getElementById("ghosts");

    // Game settings
    const GAME_SETTINGS = {
        fps: 30,
        oneBlockSize: 20,
        wallSpaceWidth: 12,
        lives: 3,
        maxLevel: 5,
        currentLevel: 1,
        speedMultiplier: [1, 1.15, 1.3, 1.45, 1.6],
        flashColors: ['#00e5ff', '#ff00e5', '#e5ff00', '#e500ff'],
        debug: false
    };

    // Game state variables
    let score = 0;
    let level = 1;
    let ghosts = [];
    let pacman;
    let gameInterval;
    let wallOffset;
    let wallInnerColor = "#001119";
    let dotColor = "#00e5ff";
    let wallColor = "#342DCA";
    let levelTransition = false;
    let totalDotsCount = 0;
    let dotsEaten = 0;
    let gameState = "menu"; // menu, playing, transition, gameover
    let transitionTimer = 0;
    let ghostCount = 4;
    let paused = false;
    let sound = true;

    // Global reference to pacman for ghost targeting
    window.pacman = null;

    // Directional constants
const DIRECTION_RIGHT = 4;
const DIRECTION_UP = 3;
const DIRECTION_LEFT = 2;
const DIRECTION_BOTTOM = 1;

    // Ghost image locations in spritesheet
let ghostImageLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];

    // Random targets for ghosts to use when not chasing pacman
    let randomTargetsForGhosts = [];

    // Sound effects
    let sfx = {
        eat: new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="),
        death: new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="),
        ghost: new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="),
        powerup: new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="),
        levelup: new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=")
    };

    // Initialize all audio to low volume
    for (let sound in sfx) {
        sfx[sound].volume = 0.3;
    }

    // Resize game elements to fit canvas
    function resizeGame() {
        console.log("Resizing game to fit canvas dimensions:", canvas.width, canvas.height);
        
        // Make sure MAP_CONFIG is available
        if (!MAP_CONFIG || !MAP_CONFIG.map) {
            console.error("MAP_CONFIG is not available yet");
            return;
        }
        
        GAME_SETTINGS.oneBlockSize = Math.floor(canvas.width / MAP_CONFIG.map[0].length);
        wallOffset = (GAME_SETTINGS.oneBlockSize - GAME_SETTINGS.wallSpaceWidth) / 2;
        
        console.log("Block size set to:", GAME_SETTINGS.oneBlockSize);
        
        // Update random targets
        randomTargetsForGhosts = [
            { x: 1 * GAME_SETTINGS.oneBlockSize, y: 1 * GAME_SETTINGS.oneBlockSize },
            { x: 1 * GAME_SETTINGS.oneBlockSize, y: (MAP_CONFIG.map.length - 2) * GAME_SETTINGS.oneBlockSize },
            { x: (MAP_CONFIG.map[0].length - 2) * GAME_SETTINGS.oneBlockSize, y: GAME_SETTINGS.oneBlockSize },
            { x: (MAP_CONFIG.map[0].length - 2) * GAME_SETTINGS.oneBlockSize, y: (MAP_CONFIG.map.length - 2) * GAME_SETTINGS.oneBlockSize },
        ];
        
        // Make targets available globally for ghosts
        window.randomTargetsForGhosts = randomTargetsForGhosts;
    }

    // Create Rectangle helper
    function createRect(x, y, width, height, color) {
        canvasContext.fillStyle = color;
        canvasContext.fillRect(x, y, width, height);
    }

    // Create neon glow effect
    function createNeonRect(x, y, width, height, color, glowColor, glowSize = 5) {
        canvasContext.shadowBlur = glowSize;
        canvasContext.shadowColor = glowColor;
        canvasContext.fillStyle = color;
        canvasContext.fillRect(x, y, width, height);
        canvasContext.shadowBlur = 0;
    }

    // Count total dots on map
    function countTotalDots() {
        let count = 0;
        for (let i = 0; i < MAP_CONFIG.map.length; i++) {
            for (let j = 0; j < MAP_CONFIG.map[0].length; j++) {
                if (MAP_CONFIG.map[i][j] === 2) {
                    count++;
                }
            }
        }
        console.log("Total dots in map:", count);
        return count;
    }

    // Play sound effect
    function playSound(sound) {
        if (window.sound && sfx[sound]) {
            sfx[sound].currentTime = 0;
            sfx[sound].play().catch(e => console.log("Audio play error:", e));
        }
    }

    // Create new Pacman instance
    function createNewPacman() {
        console.log("Creating new Pacman instance");
        
        // Ensure level is valid
        level = Math.max(1, Math.min(level, GAME_SETTINGS.maxLevel));
        
    pacman = new Pacman(
            GAME_SETTINGS.oneBlockSize,
            GAME_SETTINGS.oneBlockSize,
            GAME_SETTINGS.oneBlockSize,
            GAME_SETTINGS.oneBlockSize,
            GAME_SETTINGS.oneBlockSize / 5 * GAME_SETTINGS.speedMultiplier[level-1]
        );
        
        // Make pacman globally available for ghost targeting
        window.pacman = pacman;
    }

    // Create Ghosts
    function createGhosts() {
        console.log("Creating ghosts");
        ghosts = [];
        
        // Ensure we have a valid pacman instance with speed
        if (!pacman || !pacman.speed) {
            console.error("Cannot create ghosts: pacman instance is not properly initialized");
            return;
        }
        
        for (let i = 0; i < ghostCount; i++) {
            let newGhost = new Ghost(
                9 * GAME_SETTINGS.oneBlockSize + (i % 2 == 0 ? 0 : 1) * GAME_SETTINGS.oneBlockSize,
                10 * GAME_SETTINGS.oneBlockSize + (i % 2 == 0 ? 0 : 1) * GAME_SETTINGS.oneBlockSize,
                GAME_SETTINGS.oneBlockSize,
                GAME_SETTINGS.oneBlockSize,
                pacman.speed / 2,
                ghostImageLocations[i % 4].x,
                ghostImageLocations[i % 4].y,
                124,
                116,
                6 + i
            );
            ghosts.push(newGhost);
        }
        
        // Make ghosts available globally
        window.ghosts = ghosts;
    }

    // Draw foods/dots
    function drawFoods() {
        for (let i = 0; i < MAP_CONFIG.map.length; i++) {
            for (let j = 0; j < MAP_CONFIG.map[0].length; j++) {
                if (MAP_CONFIG.map[i][j] === 2) {
                    // Standard dot as dollar sign with neon glow
                    const dotSize = GAME_SETTINGS.oneBlockSize / 1.5;
                    const dotX = j * GAME_SETTINGS.oneBlockSize + GAME_SETTINGS.oneBlockSize / 2;
                    const dotY = i * GAME_SETTINGS.oneBlockSize + GAME_SETTINGS.oneBlockSize / 2;
                    
                    // Draw dollar sign
                    canvasContext.font = `${dotSize}px Emulogic`;
                    canvasContext.textAlign = "center";
                    canvasContext.textBaseline = "middle";
                    canvasContext.shadowBlur = 8;
                    canvasContext.shadowColor = dotColor;
                    canvasContext.fillStyle = dotColor;
                    canvasContext.fillText("$", dotX, dotY);
                    canvasContext.shadowBlur = 0;
                    canvasContext.textAlign = "left";
                    canvasContext.textBaseline = "alphabetic";
                }
                else if (MAP_CONFIG.map[i][j] === 4) {
                    // Power pellet as larger dollar sign with stronger glow
                    const pelletSize = GAME_SETTINGS.oneBlockSize / 1.1;
                    const pelletX = j * GAME_SETTINGS.oneBlockSize + GAME_SETTINGS.oneBlockSize / 2;
                    const pelletY = i * GAME_SETTINGS.oneBlockSize + GAME_SETTINGS.oneBlockSize / 2;
                    
                    // Create pulsing effect
                    const pulseSize = 0.8 + 0.2 * Math.sin(Date.now() / 200);
                    const fontSize = pelletSize * pulseSize;
                    
                    // Draw large dollar sign with pulsing effect
                    canvasContext.font = `bold ${fontSize}px Emulogic`;
                    canvasContext.textAlign = "center";
                    canvasContext.textBaseline = "middle";
                    canvasContext.shadowBlur = 15;
                    canvasContext.shadowColor = "#ff00e5";
                    canvasContext.fillStyle = "#ff00e5";
                    canvasContext.fillText("$", pelletX, pelletY);
                    canvasContext.shadowBlur = 0;
                    canvasContext.textAlign = "left";
                    canvasContext.textBaseline = "alphabetic";
                }
            }
        }
    }

    // Draw remaining lives
    function drawRemainingLives() {
        canvasContext.font = "16px Emulogic";
        canvasContext.fillStyle = "#00e5ff";
        canvasContext.shadowBlur = 5;
        canvasContext.shadowColor = "#00e5ff";
        canvasContext.fillText("LIVES:", 10, canvas.height - 20);
        canvasContext.shadowBlur = 0;

        for (let i = 0; i < GAME_SETTINGS.lives; i++) {
        canvasContext.drawImage(
            pacmanFrames,
                2 * GAME_SETTINGS.oneBlockSize,
                0,
                GAME_SETTINGS.oneBlockSize,
                GAME_SETTINGS.oneBlockSize,
                65 + i * (GAME_SETTINGS.oneBlockSize + 5),
                canvas.height - 36,
                GAME_SETTINGS.oneBlockSize,
                GAME_SETTINGS.oneBlockSize
            );
        }
    }

    // Draw score
    function drawScore() {
        canvasContext.font = "16px Emulogic";
        canvasContext.fillStyle = "#00e5ff";
        canvasContext.shadowBlur = 5;
        canvasContext.shadowColor = "#00e5ff";
        canvasContext.fillText("SCORE: " + score, 190, canvas.height - 20);
        
        // Draw level right next to score
        canvasContext.fillStyle = "#ff00e5";
        canvasContext.shadowColor = "#ff00e5";
        canvasContext.fillText("LEVEL: " + level, 350, canvas.height - 20);
        canvasContext.shadowBlur = 0;
    }


    // Draw walls with cyber aesthetic
    function drawWalls() {
        for (let i = 0; i < MAP_CONFIG.map.length; i++) {
            for (let j = 0; j < MAP_CONFIG.map[0].length; j++) {
                if (MAP_CONFIG.map[i][j] === 1) {
                    // Wall color varies by level
                    const levelColor = level <= 5 ? 
                        `hsl(${240 + (level-1) * 30}, 70%, 50%)` : 
                        wallColor;
                    
                    // Outer wall with glow
                    createNeonRect(
                        j * GAME_SETTINGS.oneBlockSize,
                        i * GAME_SETTINGS.oneBlockSize,
                        GAME_SETTINGS.oneBlockSize,
                        GAME_SETTINGS.oneBlockSize,
                        levelColor,
                        levelColor
                    );

                    // Inner wall parts (cyberpunk circuit pattern)
                    if (j > 0 && MAP_CONFIG.map[i][j - 1] === 1) {
                    createRect(
                            j * GAME_SETTINGS.oneBlockSize,
                            i * GAME_SETTINGS.oneBlockSize + wallOffset,
                            GAME_SETTINGS.wallSpaceWidth + wallOffset,
                            GAME_SETTINGS.wallSpaceWidth,
                        wallInnerColor
                    );
                }

                    if (j < MAP_CONFIG.map[0].length - 1 && MAP_CONFIG.map[i][j + 1] === 1) {
                    createRect(
                            j * GAME_SETTINGS.oneBlockSize + wallOffset,
                            i * GAME_SETTINGS.oneBlockSize + wallOffset,
                            GAME_SETTINGS.wallSpaceWidth + wallOffset,
                            GAME_SETTINGS.wallSpaceWidth,
                        wallInnerColor
                    );
                }

                    if (i < MAP_CONFIG.map.length - 1 && MAP_CONFIG.map[i + 1][j] === 1) {
                    createRect(
                            j * GAME_SETTINGS.oneBlockSize + wallOffset,
                            i * GAME_SETTINGS.oneBlockSize + wallOffset,
                            GAME_SETTINGS.wallSpaceWidth,
                            GAME_SETTINGS.wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }

                    if (i > 0 && MAP_CONFIG.map[i - 1][j] === 1) {
                    createRect(
                            j * GAME_SETTINGS.oneBlockSize + wallOffset,
                            i * GAME_SETTINGS.oneBlockSize,
                            GAME_SETTINGS.wallSpaceWidth,
                            GAME_SETTINGS.wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                    }
                }
            }
        }
    }

    // Update ghosts
    function updateGhosts() {
        for (let i = 0; i < ghosts.length; i++) {
            ghosts[i].moveProcess();
        }
    }

    // Draw ghosts
    function drawGhosts() {
        for (let i = 0; i < ghosts.length; i++) {
            ghosts[i].draw();
        }
    }

    // Handle ghost collision
    function onGhostCollision() {
        GAME_SETTINGS.lives--;
        playSound("death");
        
        if (GAME_SETTINGS.lives === 0) {
            gameState = "gameover";
        } else {
            restartPacmanAndGhosts();
        }
    }

    // Restart Pacman and Ghosts
    function restartPacmanAndGhosts() {
        createNewPacman();
        createGhosts();
    }

    // Level transition effect
    function showLevelTransition() {
        levelTransition = true;
        transitionTimer = 0;
        playSound("levelup");
        
        console.log("Showing level transition to level:", level);
        
        // Need to clear current interval before setting a new one
        clearInterval(gameInterval);
        
        // Set a new interval for the transition effect
        gameInterval = setInterval(() => {
            transitionTimer++;
            
            // Clear canvas for transition effect
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            
            // Flash background with random neon colors
            const flashColor = GAME_SETTINGS.flashColors[Math.floor(transitionTimer/3) % GAME_SETTINGS.flashColors.length];
            createRect(0, 0, canvas.width, canvas.height, "#000");
            
            if (transitionTimer % 6 < 3) {
                canvasContext.shadowBlur = 20;
                canvasContext.shadowColor = flashColor;
                canvasContext.fillStyle = flashColor;
                canvasContext.font = "30px Emulogic";
                canvasContext.textAlign = "center";
                canvasContext.fillText("LEVEL " + level, canvas.width / 2, canvas.height / 2);
                canvasContext.shadowBlur = 0;
                canvasContext.textAlign = "left";
            }
            
            // Transition complete
            if (transitionTimer >= 30) {
                levelTransition = false;
                clearInterval(gameInterval);
                startGame();
            }
        }, 1000 / 15);
    }

    // Draw game over screen
    function drawGameOver() {
        createRect(0, 0, canvas.width, canvas.height, "rgba(0, 0, 0, 0.8)");
        
        canvasContext.shadowBlur = 15;
        canvasContext.shadowColor = "#ff0055";
        canvasContext.fillStyle = "#ff0055";
        canvasContext.font = "30px Emulogic";
        canvasContext.textAlign = "center";
        canvasContext.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 50);
        
        canvasContext.shadowColor = "#00e5ff";
        canvasContext.fillStyle = "#00e5ff";
        canvasContext.font = "20px Emulogic";
        canvasContext.fillText("FINAL SCORE: " + score, canvas.width / 2, canvas.height / 2);
        
        canvasContext.font = "16px Emulogic";
        canvasContext.fillText("PRESS SPACE TO RETRY", canvas.width / 2, canvas.height / 2 + 50);
        canvasContext.shadowBlur = 0;
        canvasContext.textAlign = "left";
    }

    // Update game state
    function update() {
        if (paused || levelTransition) return;
        
        // Ensure we have valid game objects
        if (!pacman || !ghosts || ghosts.length === 0) {
            console.error("Game objects not properly initialized!");
            return;
        }
        
        pacman.moveProcess();
        pacman.eat();
        updateGhosts();
        
        // Check if pacman ate all dots
        if (dotsEaten >= totalDotsCount) {
            level = Math.min(level + 1, GAME_SETTINGS.maxLevel);
            GAME_SETTINGS.currentLevel = level;
            showLevelTransition();
            // Reset the map for next level
            MAP_CONFIG.resetMap();
            dotsEaten = 0;
            totalDotsCount = countTotalDots();
            return;
        }
        
        // Check for ghost collision
        if (pacman.checkGhostCollision(ghosts)) {
            onGhostCollision();
        }
    }

    // Draw game state
    function draw() {
        // Clear canvas
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw cyberpunk background - completely black with no border
        createRect(0, 0, canvas.width, canvas.height, "#000");
        
        // Add subtle grid effect to background
        canvasContext.strokeStyle = "rgba(0, 229, 255, 0.1)";
        canvasContext.lineWidth = 0.5;
        
        for (let i = 0; i < canvas.width; i += 20) {
            canvasContext.beginPath();
            canvasContext.moveTo(i, 0);
            canvasContext.lineTo(i, canvas.height);
            canvasContext.stroke();
        }
        
        for (let i = 0; i < canvas.height; i += 20) {
            canvasContext.beginPath();
            canvasContext.moveTo(0, i);
            canvasContext.lineTo(canvas.width, i);
            canvasContext.stroke();
        }
        
        // Draw game elements
        if (gameState === "playing") {
            drawWalls();
            drawFoods();
            drawGhosts();
            pacman.draw();
        } else if (gameState === "gameover") {
            drawGameOver();
        }
        
        // Always draw UI elements
        drawScore();
        drawRemainingLives();
        // drawLevel() is removed since we now draw level next to score
        
        // Scanline effect
        drawScanlines();
    }

    // Draw scanlines effect
    function drawScanlines() {
        canvasContext.fillStyle = "rgba(0, 0, 0, 0.15)";
        for (let i = 0; i < canvas.height; i += 4) {
            canvasContext.fillRect(0, i, canvas.width, 2);
        }
        
        // Add random glitch effect occasionally
        if (Math.random() < 0.01) {
            const glitchHeight = Math.floor(Math.random() * 10) + 5;
            const glitchY = Math.floor(Math.random() * canvas.height);
            canvasContext.fillStyle = "rgba(0, 255, 255, 0.1)";
            canvasContext.fillRect(0, glitchY, canvas.width, glitchHeight);
        }
    }

    // Main game loop
    function gameLoop() {
        update();
        draw();
    }

    // Initialize and start the game
    function init() {
        console.log("Initializing CyberPacman game");
        
        try {
            // Check that critical elements are available
            if (!canvas || !canvasContext) {
                console.error("Canvas or context not available!");
                throw new Error("Canvas elements not found");
            }
            
            if (!pacmanFrames || !ghostFrames) {
                console.error("Game sprites not loaded!");
                throw new Error("Game sprites not found");
            }
            
            if (typeof MAP_CONFIG === 'undefined' || !MAP_CONFIG.resetMap) {
                console.error("MAP_CONFIG not available!");
                throw new Error("MAP_CONFIG not available - game cannot start");
            }
            
            // Reset game state
            score = 0;
            level = 1;
            GAME_SETTINGS.currentLevel = 1;
            GAME_SETTINGS.lives = 3;
            gameState = "playing";
            paused = false;
            
            // Setup map and count dots
            MAP_CONFIG.resetMap();
            resizeGame();
            
            // Double-check map was properly loaded
            if (!MAP_CONFIG.map || MAP_CONFIG.map.length === 0 || MAP_CONFIG.map[0].length === 0) {
                console.error("Map failed to load correctly");
                throw new Error("Game map failed to load");
            }
            
            totalDotsCount = countTotalDots();
            dotsEaten = 0;
            
            // Create game objects
            try {
                createNewPacman();
                
                if (!pacman) {
                    throw new Error("Failed to create Pacman");
                }
                
                createGhosts();
                
                if (!ghosts || ghosts.length === 0) {
                    throw new Error("Failed to create Ghosts");
                }
            } catch (objError) {
                console.error("Error creating game objects:", objError);
                throw new Error("Failed to create game objects: " + objError.message);
            }
            
            // Add keyboard controls
            setupKeyboardControls();
            
            // Clean up any existing interval
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
            
            // Start the game!
            startGame();
            
            return true;
        } catch (err) {
            console.error("Game initialization error:", err);
            return false;
        }
    }
    
    // Start the game loop
    function startGame() {
        console.log("Starting game loop");
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        gameInterval = setInterval(gameLoop, 1000 / GAME_SETTINGS.fps);
    }

    // Setup keyboard controls
    function setupKeyboardControls() {
        window.removeEventListener("keydown", keyboardHandler);
        window.addEventListener("keydown", keyboardHandler);
        console.log("Keyboard controls setup");
    }

    // Keyboard event handler
    function keyboardHandler(event) {
    let k = event.keyCode;
        
        // If game over, space restarts the game
        if (gameState === "gameover" && (k === 32 || k === 13)) {
            init();
            return;
        }
        
        // P key to toggle pause
        if (k === 80) {
            paused = !paused;
            console.log("Game " + (paused ? "paused" : "resumed"));
            return;
        }
        
        // M key to toggle sound
        if (k === 77) {
            sound = !sound;
            console.log("Sound " + (sound ? "enabled" : "muted"));
            return;
        }
        
        if (paused || gameState !== "playing") return;
        
        // Movement controls
    setTimeout(() => {
            if (k === 37 || k === 65) { // left arrow or a
            pacman.nextDirection = DIRECTION_LEFT;
            } else if (k === 38 || k === 87) { // up arrow or w
            pacman.nextDirection = DIRECTION_UP;
            } else if (k === 39 || k === 68) { // right arrow or d
            pacman.nextDirection = DIRECTION_RIGHT;
            } else if (k === 40 || k === 83) { // bottom arrow or s
            pacman.nextDirection = DIRECTION_BOTTOM;
        }
    }, 1);
    }

    // Public methods
    return {
        init: init,
        togglePause: function() {
            paused = !paused;
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
        },
        toggleSound: function() {
            sound = !sound;
        },
        // Expose eat method to be called from Pacman class
        registerEat: function(type) {
            if (type === "dot") {
                dotsEaten++;
                score += 10;
                playSound("eat");
            } else if (type === "powerup") {
                score += 50;
                playSound("powerup");
            }
        },
        getSound: function() {
            return sound;
        },
        getCurrentMap: function() {
            return MAP_CONFIG.map;
        },
        getGameSettings: function() {
            return GAME_SETTINGS;
        },
        getOneBlockSize: function() {
            return GAME_SETTINGS.oneBlockSize;
        }
    };
})();

// Initialize the game when requested externally
function startCyberPacman() {
    console.log("startCyberPacman function called");
    return CYBERPACMAN.init();
}





























 