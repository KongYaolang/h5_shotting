/**
 * Bullet class for the game
 */
class Bullet {
    constructor(x, y, type, damage) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.damage = damage;
        this.active = true;
        this.hasCreatedExplosion = false;
        
        // Set properties based on bullet type
        switch(type) {
            case 'guardian':
                this.width = 8;
                this.height = 16;
                this.speed = 10;
                this.color = '#f1c40f';
                break;
                
            case 'dragon_straight':
                this.width = 6;
                this.height = 12;
                this.speed = 8;
                this.color = '#3498db';
                break;
                
            case 'dragon_spread':
                this.width = 6;
                this.height = 12;
                this.speed = 7;
                this.color = '#e74c3c';
                this.angle = 0; // Will be set by BulletFactory
                break;
                
            case 'dragon_homing':
                this.width = 8;
                this.height = 14;
                this.speed = 6;
                this.color = '#2ecc71';
                this.target = null; // Will be set by BulletFactory
                this.homingStrength = 0.5;
                this.velocityX = 0;
                this.velocityY = -this.speed;
                break;
                
            case 'dragon_piercing':
                this.width = 6;
                this.height = 14;
                this.speed = 9;
                this.color = '#9b59b6';
                this.pierced = 0;
                this.maxPierced = 3;
                break;
                
            case 'dragon_explosive':
                this.width = 10;
                this.height = 10;
                this.speed = 5;
                this.color = '#f39c12';
                this.explosionRadius = 60;
                break;
                
            default:
                this.width = 8;
                this.height = 16;
                this.speed = 10;
                this.color = '#f1c40f';
        }
    }

    // Update bullet position
    update() {
        if (!this.active) return;
        
        switch(this.type) {
            case 'guardian':
            case 'dragon_straight':
                // Move straight up
                this.y -= this.speed;
                break;
                
            case 'dragon_spread':
                // Move at an angle
                this.x += Math.sin(this.angle) * this.speed;
                this.y -= Math.cos(this.angle) * this.speed;
                break;
                
            case 'dragon_homing':
                // Home in on target if it exists
                if (this.target && this.target.active) {
                    const dx = (this.target.x + this.target.width / 2) - (this.x + this.width / 2);
                    const dy = (this.target.y + this.target.height / 2) - (this.y + this.height / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        // Adjust velocity towards target
                        this.velocityX += (dx / distance) * this.homingStrength;
                        this.velocityY += (dy / distance) * this.homingStrength;
                        
                        // Normalize velocity to maintain speed
                        const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
                        this.velocityX = (this.velocityX / speed) * this.speed;
                        this.velocityY = (this.velocityY / speed) * this.speed;
                    }
                } else {
                    // If no target, move straight up
                    this.velocityY = -this.speed;
                }
                
                // Apply velocity
                this.x += this.velocityX;
                this.y += this.velocityY;
                break;
                
            case 'dragon_piercing':
            case 'dragon_explosive':
                // Move straight up
                this.y -= this.speed;
                break;
        }
        
        // Check if bullet is off screen
        if (this.y < -this.height) {
            this.active = false;
        }
    }

    // Draw the bullet
    draw(context) {
        if (!this.active) return;
        
        context.fillStyle = this.color;
        
        switch(this.type) {
            case 'guardian':
                // Draw guardian bullet (teardrop shape)
                context.beginPath();
                context.moveTo(this.x + this.width / 2, this.y);
                context.lineTo(this.x + this.width, this.y + this.height / 2);
                context.lineTo(this.x + this.width / 2, this.y + this.height);
                context.lineTo(this.x, this.y + this.height / 2);
                context.closePath();
                context.fill();
                
                // Add glow effect
                context.shadowColor = this.color;
                context.shadowBlur = 5;
                context.fill();
                context.shadowBlur = 0;
                break;
                
            case 'dragon_straight':
                // Draw straight dragon bullet (oval)
                context.beginPath();
                context.ellipse(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.width / 2,
                    this.height / 2,
                    0,
                    0,
                    Math.PI * 2
                );
                context.fill();
                break;
                
            case 'dragon_spread':
                // Draw spread dragon bullet (diamond)
                context.beginPath();
                context.moveTo(this.x + this.width / 2, this.y);
                context.lineTo(this.x + this.width, this.y + this.height / 2);
                context.lineTo(this.x + this.width / 2, this.y + this.height);
                context.lineTo(this.x, this.y + this.height / 2);
                context.closePath();
                context.fill();
                break;
                
            case 'dragon_homing':
                // Draw homing dragon bullet (star)
                context.beginPath();
                const centerX = this.x + this.width / 2;
                const centerY = this.y + this.height / 2;
                const outerRadius = this.width / 2;
                const innerRadius = this.width / 4;
                
                for (let i = 0; i < 5; i++) {
                    const outerAngle = i * Math.PI * 2 / 5 - Math.PI / 2;
                    const innerAngle = outerAngle + Math.PI / 5;
                    
                    if (i === 0) {
                        context.moveTo(
                            centerX + Math.cos(outerAngle) * outerRadius,
                            centerY + Math.sin(outerAngle) * outerRadius
                        );
                    } else {
                        context.lineTo(
                            centerX + Math.cos(outerAngle) * outerRadius,
                            centerY + Math.sin(outerAngle) * outerRadius
                        );
                    }
                    
                    context.lineTo(
                        centerX + Math.cos(innerAngle) * innerRadius,
                        centerY + Math.sin(innerAngle) * innerRadius
                    );
                }
                
                context.closePath();
                context.fill();
                break;
                
            case 'dragon_piercing':
                // Draw piercing dragon bullet (arrow)
                context.beginPath();
                context.moveTo(this.x + this.width / 2, this.y);
                context.lineTo(this.x + this.width, this.y + this.height / 3);
                context.lineTo(this.x + this.width * 0.7, this.y + this.height / 3);
                context.lineTo(this.x + this.width * 0.7, this.y + this.height);
                context.lineTo(this.x + this.width * 0.3, this.y + this.height);
                context.lineTo(this.x + this.width * 0.3, this.y + this.height / 3);
                context.lineTo(this.x, this.y + this.height / 3);
                context.closePath();
                context.fill();
                break;
                
            case 'dragon_explosive':
                // Draw explosive dragon bullet (circle with inner circle)
                context.beginPath();
                context.arc(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.width / 2,
                    0,
                    Math.PI * 2
                );
                context.fill();
                
                // Inner circle
                context.fillStyle = '#ffffff';
                context.beginPath();
                context.arc(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.width / 4,
                    0,
                    Math.PI * 2
                );
                context.fill();
                break;
        }
    }
    
    // Check collision with a monster
    checkCollision(monster) {
        return (
            this.x < monster.x + monster.width &&
            this.x + this.width > monster.x &&
            this.y < monster.y + monster.height &&
            this.y + this.height > monster.y
        );
    }
    
    // Handle collision with a monster
    handleCollision(monster) {
        let explosionData = null;
        
        // Apply damage to monster
        monster.takeDamage(this.damage);
        
        // Handle special bullet types
        switch(this.type) {
            case 'guardian':
            case 'dragon_straight':
            case 'dragon_spread':
            case 'dragon_homing':
                // Deactivate bullet after hitting
                this.active = false;
                break;
                
            case 'dragon_piercing':
                // Increment pierce count
                this.pierced++;
                
                // Deactivate if max pierce count reached
                if (this.pierced >= this.maxPierced) {
                    this.active = false;
                }
                break;
                
            case 'dragon_explosive':
                // Create explosion effect
                if (!this.hasCreatedExplosion) {
                    explosionData = {
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        radius: this.explosionRadius,
                        damage: this.damage * 0.5 // Explosion does 50% of bullet damage
                    };
                    
                    this.hasCreatedExplosion = true;
                    this.active = false;
                }
                break;
        }
        
        return explosionData;
    }
}

// BulletFactory to create different types of bullets
class BulletFactory {
    // Create a normal guardian bullet
    static createNormalBullet(x, y, damage) {
        return new Bullet(x, y, 'guardian', damage);
    }
    
    // Create a dragon bullet based on type
    static createDragonBullet(x, y, attackType, damage, options = {}) {
        let bullet;
        
        switch(attackType) {
            case 'straight':
                bullet = new Bullet(x, y, 'dragon_straight', damage);
                break;
                
            case 'spread':
                bullet = new Bullet(x, y, 'dragon_spread', damage);
                bullet.angle = options.angle || 0;
                break;
                
            case 'homing':
                bullet = new Bullet(x, y, 'dragon_homing', damage);
                bullet.target = options.target || null;
                break;
                
            case 'piercing':
                bullet = new Bullet(x, y, 'dragon_piercing', damage);
                bullet.maxPierced = options.pierceCount || 3;
                break;
                
            case 'explosive':
                bullet = new Bullet(x, y, 'dragon_explosive', damage);
                bullet.explosionRadius = options.explosionRadius || 60;
                break;
                
            default:
                bullet = new Bullet(x, y, 'dragon_straight', damage);
        }
        
        return bullet;
    }
}