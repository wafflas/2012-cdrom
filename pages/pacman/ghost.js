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
        this.imageHeight = imageHeight;
        this.imageWidth = imageWidth;
        this.range = range;
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.target = randomTargetsForGhosts[this.randomTargetIndex];
        this.eaten = false;
        this.respawnTimer = 0;
        this.respawnTime = 5000; // 5 seconds
        this.frightened = false;
        this.scatterMode = false;
        this.glitchEffect = 0;
        
        // Direction change timer
        setInterval(() => {
            this.changeRandomDirection();
            // Random glitch effect
            this.glitchEffect = Math.random() < 0.1 ? 5 : 0;
        }, 10000);
    }

    respawn() {
        this.eaten = true;
        this.respawnTimer = this.respawnTime;
        this.x = 9 * CYBERPACMAN.getOneBlockSize(); // Return to center
        this.y = 10 * CYBERPACMAN.getOneBlockSize();
    }

    isInRange() {
        if (this.eaten) return false;
        
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        if (
            Math.sqrt(xDistance * xDistance + yDistance * yDistance) <=
            this.range
        ) {
            return true;
        }
        return false;
    }

    changeRandomDirection() {
        if (this.eaten) return;
        
        let addition = 1;
        this.randomTargetIndex += addition;
        this.randomTargetIndex = this.randomTargetIndex % 4;
    }

    moveProcess() {
        if (this.eaten) {
            // Update respawn timer
            this.respawnTimer -= 100;
            if (this.respawnTimer <= 0) {
                this.eaten = false;
            }
            return;
        }
        
        // Check if Pacman is in power mode
        this.frightened = pacman.powerMode;
        
        // In frightened mode, run away from Pacman
        if (this.frightened) {
            // Find the furthest target from Pacman
            let maxDistance = 0;
            let furthestTarget = 0;
            
            for (let i = 0; i < randomTargetsForGhosts.length; i++) {
                const target = randomTargetsForGhosts[i];
                const distance = 
                    Math.abs(pacman.getMapX() * CYBERPACMAN.getOneBlockSize() - target.x) + 
                    Math.abs(pacman.getMapY() * CYBERPACMAN.getOneBlockSize() - target.y);
                
                if (distance > maxDistance) {
                    maxDistance = distance;
                    furthestTarget = i;
                }
            }
            
            this.target = randomTargetsForGhosts[furthestTarget];
        } else if (this.isInRange()) {
            this.target = pacman;
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }
        
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            return;
        }
    }

    moveBackwards() {
        switch (this.direction) {
            case 4: // Right
                this.x -= this.speed;
                break;
            case 3: // Up
                this.y += this.speed;
                break;
            case 2: // Left
                this.x += this.speed;
                break;
            case 1: // Bottom
                this.y -= this.speed;
                break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case 4: // Right
                this.x += this.speed;
                break;
            case 3: // Up
                this.y -= this.speed;
                break;
            case 2: // Left
                this.x -= this.speed;
                break;
            case 1: // Bottom
                this.y += this.speed;
                break;
        }
    }

    checkCollisions() {
        const map = CYBERPACMAN.getCurrentMap();
        const oneBlockSize = CYBERPACMAN.getOneBlockSize();
        
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize)
            ] === 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize)
            ] === 1 ||
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] === 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] === 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    changeDirectionIfPossible() {
        let tempDirection = this.direction;
        this.direction = this.calculateNewDirection(
            CYBERPACMAN.getCurrentMap(),
            parseInt(this.target.x / CYBERPACMAN.getOneBlockSize()),
            parseInt(this.target.y / CYBERPACMAN.getOneBlockSize())
        );
        if (typeof this.direction == "undefined") {
            this.direction = tempDirection;
            return;
        }
        if (
            this.getMapY() != this.getMapYRightSide() &&
            (this.direction == DIRECTION_LEFT ||
                this.direction == DIRECTION_RIGHT)
        ) {
            this.direction = DIRECTION_UP;
        }
        if (
            this.getMapX() != this.getMapXRightSide() &&
            this.direction == DIRECTION_UP
        ) {
            this.direction = DIRECTION_LEFT;
        }
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    calculateNewDirection(map, destX, destY) {
        let mp = [];
        for (let i = 0; i < map.length; i++) {
            mp[i] = map[i].slice();
        }

        let queue = [
            {
                x: this.getMapX(),
                y: this.getMapY(),
                rightX: this.getMapXRightSide(),
                rightY: this.getMapYRightSide(),
                moves: [],
            },
        ];
        while (queue.length > 0) {
            let poped = queue.shift();
            if (poped.x == destX && poped.y == destY) {
                return poped.moves[0];
            } else {
                mp[poped.y][poped.x] = 1;
                let neighborList = this.addNeighbors(poped, mp);
                for (let i = 0; i < neighborList.length; i++) {
                    queue.push(neighborList[i]);
                }
            }
        }

        return 1; // direction
    }

    addNeighbors(poped, mp) {
        let queue = [];
        let numOfRows = mp.length;
        let numOfColumns = mp[0].length;

        if (
            poped.x - 1 >= 0 &&
            poped.x - 1 < numOfRows &&
            mp[poped.y][poped.x - 1] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_LEFT);
            queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.x + 1 >= 0 &&
            poped.x + 1 < numOfRows &&
            mp[poped.y][poped.x + 1] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_RIGHT);
            queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.y - 1 >= 0 &&
            poped.y - 1 < numOfColumns &&
            mp[poped.y - 1][poped.x] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_UP);
            queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves });
        }
        if (
            poped.y + 1 >= 0 &&
            poped.y + 1 < numOfColumns &&
            mp[poped.y + 1][poped.x] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_BOTTOM);
            queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves });
        }
        return queue;
    }

    getMapX() {
        const oneBlockSize = CYBERPACMAN.getOneBlockSize();
        let mapX = parseInt(this.x / oneBlockSize);
        return mapX;
    }

    getMapY() {
        const oneBlockSize = CYBERPACMAN.getOneBlockSize();
        let mapY = parseInt(this.y / oneBlockSize);
        return mapY;
    }

    getMapXRightSide() {
        const oneBlockSize = CYBERPACMAN.getOneBlockSize();
        let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
        return mapX;
    }

    getMapYRightSide() {
        const oneBlockSize = CYBERPACMAN.getOneBlockSize();
        let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
        return mapY;
    }

    draw() {
        if (this.eaten) {
            return; // Don't draw when eaten
        }
        
        const canvasContext = document.getElementById("canvas").getContext("2d");
        const ghostFrames = document.getElementById("ghosts");
        
        canvasContext.save();
        
        // Apply cyberpunk effects
        if (this.frightened) {
            // Frightened mode - ghost turns blue with glitch effect
            canvasContext.globalAlpha = 0.7 + 0.3 * Math.sin(Date.now() / 200);
            canvasContext.shadowBlur = 10;
            canvasContext.shadowColor = "#ff00ff";
            
            // Glitchy rendering for frightened ghosts
            if (Math.random() < 0.1) {
                const glitchOffset = Math.random() * 4 - 2;
                canvasContext.drawImage(
                    ghostFrames,
                    this.imageX,
                    this.imageY,
                    this.imageWidth,
                    this.imageHeight,
                    this.x + glitchOffset,
                    this.y,
                    this.width,
                    this.height
                );
            }
            
            // Draw a blue overlay
            canvasContext.fillStyle = "#0000ff";
            canvasContext.globalAlpha = 0.5;
            canvasContext.fillRect(this.x, this.y, this.width, this.height);
            canvasContext.globalAlpha = 1;
        } else if (this.glitchEffect > 0) {
            // Random glitch effect
            this.glitchEffect--;
            const glitchX = this.x + (Math.random() * 4 - 2);
            const glitchY = this.y + (Math.random() * 4 - 2);
            
            // Create glitch effect by drawing multiple offset images
            canvasContext.globalAlpha = 0.3;
            canvasContext.drawImage(
                ghostFrames,
                this.imageX,
                this.imageY,
                this.imageWidth,
                this.imageHeight,
                glitchX + 2,
                glitchY,
                this.width,
                this.height
            );
            canvasContext.drawImage(
                ghostFrames,
                this.imageX,
                this.imageY,
                this.imageWidth,
                this.imageHeight,
                glitchX - 2,
                glitchY,
                this.width,
                this.height
            );
            canvasContext.globalAlpha = 1;
        }
        
        // Draw main ghost image
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
        
        // Add subtle glow effect instead of the outline
        if (!this.frightened) {
            canvasContext.shadowBlur = 8;
            canvasContext.shadowColor = "rgba(255, 0, 255, 0.5)";
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
            canvasContext.shadowBlur = 0;
        }
        
        // Reset context
        canvasContext.shadowBlur = 0;
        canvasContext.restore();
        
        // Debug: visualize detection range
        if (CYBERPACMAN.getGameSettings().debug) {
            canvasContext.beginPath();
            canvasContext.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.range * CYBERPACMAN.getOneBlockSize(),
                0,
                2 * Math.PI
            );
            canvasContext.strokeStyle = "rgba(255, 0, 255, 0.2)";
            canvasContext.stroke();
        }
    }
}

let updateGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].moveProcess();
    }
};

let drawGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].draw();
    }
};
