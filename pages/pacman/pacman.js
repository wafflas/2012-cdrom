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
        this.powerMode = false;
        this.powerModeTime = 0;
        this.powerModeDuration = 8000; // 8 seconds
        this.baseColor = "#FFFF00";
        this.powerColor = "#00FFFF";
        this.trailParticles = [];
        
        // Animation timer
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
        
        // Create trail particle effect during power mode
        if (this.powerMode && Math.random() < 0.3) {
            this.createTrailParticle();
        }
        
        // Update power mode timer
        if (this.powerMode) {
            this.powerModeTime -= 100;
            if (this.powerModeTime <= 0) {
                this.powerMode = false;
            }
        }
    }

    createTrailParticle() {
        const particle = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            size: Math.random() * 4 + 2,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            color: this.powerColor,
            life: 20
        };
        this.trailParticles.push(particle);
        
        // Limit number of particles
        if (this.trailParticles.length > 20) {
            this.trailParticles.shift();
        }
    }
    
    updateTrailParticles() {
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const p = this.trailParticles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.life--;
            p.size *= 0.9;
            
            if (p.life <= 0 || p.size < 0.5) {
                this.trailParticles.splice(i, 1);
            }
        }
    }

    eat() {
        const map = CYBERPACMAN.getCurrentMap();
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (
                    map[i][j] === 2 &&
                    this.getMapX() === j &&
                    this.getMapY() === i
                ) {
                    map[i][j] = 0;
                    CYBERPACMAN.registerEat("dot");
                }
                else if (
                    map[i][j] === 4 &&
                    this.getMapX() === j &&
                    this.getMapY() === i
                ) {
                    map[i][j] = 0;
                    this.powerMode = true;
                    this.powerModeTime = this.powerModeDuration;
                    CYBERPACMAN.registerEat("powerup");
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

    checkGhostCollision(ghosts) {
        for (let i = 0; i < ghosts.length; i++) {
            let ghost = ghosts[i];
            if (
                ghost.getMapX() === this.getMapX() &&
                ghost.getMapY() === this.getMapY()
            ) {
                if (this.powerMode) {
                    // Ghost is eaten
                    ghost.respawn();
                    return false;
                }
                return true;
            }
        }
        return false;
    }

    changeDirectionIfPossible() {
        if (this.direction === this.nextDirection) return;
        
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

    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        const canvasContext = document.getElementById("canvas").getContext("2d");
        const oneBlockSize = CYBERPACMAN.getOneBlockSize();
        const pacmanFrames = document.getElementById("animation");
        
        // Draw particle trail effects
        this.updateTrailParticles();
        for (const particle of this.trailParticles) {
            canvasContext.beginPath();
            canvasContext.arc(
                particle.x,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );
            canvasContext.fillStyle = `rgba(0, 255, 255, ${particle.life / 20})`;
            canvasContext.fill();
        }
        
        canvasContext.save();
        
        // Position and rotate
        canvasContext.translate(
            this.x + oneBlockSize / 2,
            this.y + oneBlockSize / 2
        );
        canvasContext.rotate((this.direction * 90 * Math.PI) / 180);
        canvasContext.translate(
            -this.x - oneBlockSize / 2,
            -this.y - oneBlockSize / 2
        );
        
        // Add glow effect during power mode
        if (this.powerMode) {
            canvasContext.shadowBlur = 15;
            canvasContext.shadowColor = this.powerColor;
        }
        
        // Draw pacman with frame animation
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
        
        // Reset shadow effect
        canvasContext.shadowBlur = 0;
        canvasContext.restore();
        
        // Flashing effect when power mode is ending
        if (this.powerMode && this.powerModeTime < 2000 && Math.floor(Date.now() / 200) % 2 === 0) {
            canvasContext.fillStyle = "rgba(0, 255, 255, 0.3)";
            canvasContext.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
