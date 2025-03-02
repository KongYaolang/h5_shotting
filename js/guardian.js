/**
 * Guardian class for the player character
 */
class Guardian {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;  // Guardian width
        this.height = 80; // Guardian height
        this.speed = 8;   // Movement speed
        this.damage = 1;  // Starting damage
        this.shootTimer = 0;
        this.shootInterval = 12; // Shoot interval (frames): 12 frames = 0.2 seconds at 60fps
        
        // Animation properties
        this.frameIndex = 0;
        this.frameCount = 4;
        this.animationSpeed = 0.1;
        this.animationCounter = 0;
        
        // Movement smoothing
        this.targetX = x;
        this.smoothingFactor = 0.3; // Movement smoothing factor (0-1, higher = faster)
        
        // Sidekicks
        this.leftSidekick = null;
        this.rightSidekick = null;
    }

    // Update guardian position and state
    update(canvasWidth) {
        // Smooth movement towards target position
        const dx = this.targetX - this.x;
        const movement = dx * this.smoothingFactor;
        
        console.log('Updating position:', {
            currentX: this.x,
            targetX: this.targetX,
            dx: dx,
            movement: movement,
            smoothingFactor: this.smoothingFactor
        });
        
        this.x += movement;
        
        // Keep the guardian within the canvas bounds
        if (this.x < 0) {
            console.log('Hit left boundary');
            this.x = 0;
        }
        if (this.x > canvasWidth - this.width) {
            console.log('Hit right boundary');
            this.x = canvasWidth - this.width;
        }
        
        // Update shoot timer
        this.shootTimer++;
        
        // Update animation
        this.animationCounter += this.animationSpeed;
        if (this.animationCounter >= 1) {
            this.frameIndex = (this.frameIndex + 1) % this.frameCount;
            this.animationCounter = 0;
        }
        
        // Update sidekicks if they exist
        if (this.leftSidekick) {
            this.leftSidekick.update(this, 'left');
        }
        
        if (this.rightSidekick) {
            this.rightSidekick.update(this, 'right');
        }
    }

    // Draw the guardian
    draw(context) {
        // Draw guardian body (fairy with wings)
        context.fillStyle = '#e74c3c'; // Red dress
        
        // Draw the fairy's dress (trapezoid shape)
        context.beginPath();
        context.moveTo(this.x + 20, this.y + 30);
        context.lineTo(this.x + this.width - 20, this.y + 30);
        context.lineTo(this.x + this.width - 5, this.y + this.height);
        context.lineTo(this.x + 5, this.y + this.height);
        context.closePath();
        context.fill();
        
        // Draw the fairy's head
        context.fillStyle = '#f5b041'; // Golden-yellow for hair
        context.beginPath();
        context.arc(this.x + this.width / 2, this.y + 15, 15, 0, Math.PI * 2);
        context.fill();
        
        // Draw face
        context.fillStyle = '#f0e68c'; // Face
        context.beginPath();
        context.arc(this.x + this.width / 2, this.y + 15, 12, 0, Math.PI * 2);
        context.fill();
        
        // Draw eyes
        context.fillStyle = '#2c3e50';
        context.beginPath();
        context.arc(this.x + this.width / 2 - 5, this.y + 12, 2, 0, Math.PI * 2);
        context.arc(this.x + this.width / 2 + 5, this.y + 12, 2, 0, Math.PI * 2);
        context.fill();
        
        // Draw mouth
        context.beginPath();
        context.arc(this.x + this.width / 2, this.y + 20, 3, 0, Math.PI, false);
        context.stroke();
        
        // Draw wings (with animation)
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Left wing
        context.save();
        context.translate(this.x + 10, this.y + 30);
        context.rotate(Math.sin(this.animationCounter * Math.PI * 2) * 0.3);
        context.beginPath();
        context.ellipse(0, 0, 20, 30, Math.PI / 3, 0, Math.PI * 2);
        context.fill();
        context.restore();
        
        // Right wing
        context.save();
        context.translate(this.x + this.width - 10, this.y + 30);
        context.rotate(-Math.sin(this.animationCounter * Math.PI * 2) * 0.3);
        context.beginPath();
        context.ellipse(0, 0, 20, 30, -Math.PI / 3, 0, Math.PI * 2);
        context.fill();
        context.restore();
        
        // Draw sword/wand
        context.fillStyle = '#f1c40f';
        context.fillRect(this.x + this.width / 2 - 2, this.y - 20, 4, 40);
        
        // Draw glow effect
        context.fillStyle = 'rgba(241, 196, 15, 0.5)';
        context.beginPath();
        context.arc(this.x + this.width / 2, this.y - 20, 8, 0, Math.PI * 2);
        context.fill();
        
        // Draw sidekicks
        if (this.leftSidekick) {
            this.leftSidekick.draw(context);
        }
        
        if (this.rightSidekick) {
            this.rightSidekick.draw(context);
        }
    }

    // Set target position for movement
    setTargetPosition(x) {
        console.log('Setting target position:', {
            input: x,
            current: this.x,
            target: this.targetX
        });
        this.targetX = x - this.width / 2;
    }

    // Check if guardian should shoot
    checkShoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            return true;
        }
        return false;
    }

    // Shoot a bullet
    shoot() {
        return BulletFactory.createNormalBullet(
            this.x + this.width / 2 - 4,
            this.y - 10,
            this.damage
        );
    }

    // Check if sidekicks should shoot
    checkSidekickShoot(monsters) {
        const bullets = [];
        
        if (this.leftSidekick && this.leftSidekick.checkShoot()) {
            bullets.push(...this.leftSidekick.shoot(monsters));
        }
        
        if (this.rightSidekick && this.rightSidekick.checkShoot()) {
            bullets.push(...this.rightSidekick.shoot(monsters));
        }
        
        return bullets;
    }

    // Set sidekicks
    setSidekicks(left, right) {
        this.leftSidekick = left;
        this.rightSidekick = right;
    }

    // Upgrade bullet damage
    upgradeDamage() {
        this.damage++;
    }

    // Get upgrade cost for weapon
    getWeaponUpgradeCost() {
        return this.damage * 100; // Base cost for weapon upgrade
    }
} 