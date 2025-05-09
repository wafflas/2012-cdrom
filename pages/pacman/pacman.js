class Pacman {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 4;
        this.nextDirection = 4;
        this.frameCount = 7;
        this.currentFrame = 1;
        setInterval(() => {
            this.changeAnimation();
        }, 100);
    }

    moveProcess() {
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            return;
        }
    }

    eat() {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (
                    map[i][j] == 2 &&
                    this.getMapX() == j &&
                    this.getMapY() == i
                ) {
                    map[i][j] = 3;
                    score++;
                }
            }
        }
    }

    moveBackwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: // Right
                this.x -= this.speed;
                break;
            case DIRECTION_UP: // Up
                this.y += this.speed;
                break;
            case DIRECTION_LEFT: // Left
                this.x += this.speed;
                break;
            case DIRECTION_BOTTOM: // Bottom
                this.y -= this.speed;
                break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT: // Right
                this.x += this.speed;
                break;
            case DIRECTION_UP: // Up
                this.y -= this.speed;
                break;
            case DIRECTION_LEFT: // Left
                this.x -= this.speed;
                break;
            case DIRECTION_BOTTOM: // Bottom
                this.y += this.speed;
                break;
        }
    }

    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt((this.y - yOffset) / oneBlockSize)][
                parseInt((this.x - xOffset) / oneBlockSize)
            ] == 1 ||
            map[parseInt((this.y - yOffset) / oneBlockSize + 0.9999)][
                parseInt((this.x - xOffset) / oneBlockSize)
            ] == 1 ||
            map[parseInt((this.y - yOffset) / oneBlockSize)][
                parseInt((this.x - xOffset) / oneBlockSize + 0.9999)
            ] == 1 ||
            map[parseInt((this.y - yOffset) / oneBlockSize + 0.9999)][
                parseInt((this.x - xOffset) / oneBlockSize + 0.9999)
            ] == 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    checkGhostCollision(ghosts) {
        for (let i = 0; i < ghosts.length; i++) {
            let ghost = ghosts[i];
            if (
                ghost.getMapX() == this.getMapX() &&
                ghost.getMapY() == this.getMapY()
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
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    getMapX() {
        let mapX = parseInt((this.x - xOffset) / oneBlockSize);
        return mapX;
    }

    getMapY() {
        let mapY = parseInt((this.y - yOffset) / oneBlockSize);
        return mapY;
    }

    getMapXRightSide() {
        let mapX = parseInt(((this.x - xOffset) * 0.99 + oneBlockSize) / oneBlockSize);
        return mapX;
    }

    getMapYRightSide() {
        let mapY = parseInt(((this.y - yOffset) * 0.99 + oneBlockSize) / oneBlockSize);
        return mapY;
    }

    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        canvasContext.save();
        
        // Translate to center of pacman
        canvasContext.translate(
            this.x + oneBlockSize / 2,
            this.y + oneBlockSize / 2
        );
        
        // Keep pacman's body static (don't rotate) regardless of direction
        // The following code removes the rotation
        
        // Translate back
        canvasContext.translate(
            -this.x - oneBlockSize / 2,
            -this.y - oneBlockSize / 2
        );
        
        // Add glow effect
        canvasContext.shadowColor = "#ffff00";
        canvasContext.shadowBlur = 10;
        
        // Draw pacman with animated mouth only
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
        
        // Reset shadow
        canvasContext.shadowBlur = 0;
        canvasContext.restore();
    }
}
