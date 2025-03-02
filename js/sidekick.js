/**
 * Sidekick (Dragon) class for the game
 */
class Sidekick {
    constructor(type, level = 1) {
        this.type = type;
        this.level = level;
        this.experience = 0;
        this.experienceToNextLevel = 100; // Base XP needed for level 2
        this.width = 40;  // Sidekick width
        this.height = 40; // Sidekick height
        this.offsetX = 0;
        this.offsetY = 0;
        this.shootTimer = 0;
        this.shootInterval = 30; // Shoot interval (frames): 30 frames = 0.5 seconds at 60fps
        this.damage = level;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.levelUpAnimationTimer = 0;
        
        // Set dragon properties based on type
        switch(type) {
            case 'blue':
                this.attackType = 'straight';
                this.color = '#3498db';
                this.price = 100;
                this.description = '发射直线子弹，伤害适中';
                break;
                
            case 'red':
                this.attackType = 'spread';
                this.color = '#e74c3c';
                this.price = 200;
                this.description = '发射扩散子弹，覆盖范围更广';
                break;
                
            case 'green':
                this.attackType = 'homing';
                this.color = '#2ecc71';
                this.price = 300;
                this.description = '发射追踪子弹，能够跟踪敌人';
                break;
                
            case 'purple':
                this.attackType = 'piercing';
                this.color = '#9b59b6';
                this.price = 400;
                this.description = '发射穿透子弹，可以穿透多个敌人';
                break;
                
            case 'gold':
                this.attackType = 'explosive';
                this.color = '#f1c40f';
                this.price = 500;
                this.description = '发射爆炸子弹，造成范围伤害';
                break;
        }
    }

    // Update sidekick position and state
    update(guardian, position) {
        // Update animation
        this.animationTimer++;
        if (this.animationTimer >= 10) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
        
        // Update level up animation
        if (this.levelUpAnimationTimer > 0) {
            this.levelUpAnimationTimer--;
        }
        
        // Update shoot timer
        this.shootTimer++;
        
        // Update position relative to guardian
        if (position === 'left') {
            this.offsetX = -30;
            this.offsetY = 10;
        } else {
            this.offsetX = guardian.width + 10;
            this.offsetY = 10;
        }
        
        // Set position
        this.x = guardian.x + this.offsetX;
        this.y = guardian.y + this.offsetY;
    }

    // Draw the sidekick
    draw(context) {
        // Save context state
        context.save();
        
        // Apply level up animation effect
        if (this.levelUpAnimationTimer > 0) {
            const glowIntensity = Math.sin(this.levelUpAnimationTimer * 0.2) * 10;
            context.shadowColor = this.color;
            context.shadowBlur = 10 + glowIntensity;
            
            // Pulsing size effect
            const scale = 1 + Math.sin(this.levelUpAnimationTimer * 0.2) * 0.1;
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            context.scale(scale, scale);
            context.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
        }
        
        // Apply slight movement based on animation frame
        const offsetX = Math.sin(this.animationFrame * Math.PI / 2) * 2;
        
        // Draw dragon body
        context.fillStyle = this.color;
        this.drawRoundedRect(
            context, 
            this.x + offsetX, 
            this.y, 
            this.width, 
            this.height, 
            8
        );
        
        // Draw dragon features
        context.fillStyle = '#2c3e50';
        
        // Draw eyes
        context.beginPath();
        const eyeSpacing = this.width / 3;
        const eyeY = this.y + this.height * 0.3;
        const eyeSize = this.width / 10;
        
        context.arc(this.x + offsetX + eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
        context.arc(this.x + offsetX + this.width - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
        context.fill();
        
        // Draw wings
        context.fillStyle = this.getLighterColor(this.color);
        
        // Left wing
        context.beginPath();
        context.moveTo(this.x + offsetX, this.y + this.height * 0.3);
        context.lineTo(this.x + offsetX - 15, this.y + this.height * 0.1);
        context.lineTo(this.x + offsetX - 5, this.y + this.height * 0.5);
        context.closePath();
        context.fill();
        
        // Right wing
        context.beginPath();
        context.moveTo(this.x + offsetX + this.width, this.y + this.height * 0.3);
        context.lineTo(this.x + offsetX + this.width + 15, this.y + this.height * 0.1);
        context.lineTo(this.x + offsetX + this.width + 5, this.y + this.height * 0.5);
        context.closePath();
        context.fill();
        
        // Draw level indicator
        this.drawLevelIndicator(context, this.x + offsetX, this.y);
        
        // Restore context state
        context.restore();
    }

    // Draw level indicator
    drawLevelIndicator(context, x, y) {
        // Draw level text
        context.fillStyle = '#ffffff';
        context.font = 'bold 12px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
            `Lv${this.level}`, 
            x + this.width / 2, 
            y - 10
        );
        
        // Draw experience bar if not max level
        if (this.level < 10) {
            const barWidth = this.width;
            const barHeight = 3;
            const expPercentage = this.experience / this.experienceToNextLevel;
            
            // Background
            context.fillStyle = 'rgba(0, 0, 0, 0.5)';
            context.fillRect(x, y - 5, barWidth, barHeight);
            
            // Fill
            context.fillStyle = this.color;
            context.fillRect(x, y - 5, barWidth * expPercentage, barHeight);
        } else {
            // Max level indicator
            context.fillStyle = '#f1c40f'; // Gold color
            context.font = 'bold 10px Arial';
            context.fillText('MAX', x + this.width / 2, y - 5);
        }
    }

    // Helper method to draw rounded rectangles
    drawRoundedRect(context, x, y, width, height, radius) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + radius);
        context.lineTo(x + width, y + height - radius);
        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        context.lineTo(x + radius, y + height);
        context.quadraticCurveTo(x, y + height, x, y + height - radius);
        context.lineTo(x, y + radius);
        context.quadraticCurveTo(x, y, x + radius, y);
        context.closePath();
        context.fill();
    }

    // Get a lighter version of a color for wings
    getLighterColor(hexColor) {
        // Convert hex to RGB
        let r = parseInt(hexColor.substr(1, 2), 16);
        let g = parseInt(hexColor.substr(3, 2), 16);
        let b = parseInt(hexColor.substr(5, 2), 16);
        
        // Lighten
        r = Math.min(255, r + 40);
        g = Math.min(255, g + 40);
        b = Math.min(255, b + 40);
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Check if sidekick should shoot
    checkShoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            return true;
        }
        return false;
    }

    // Shoot bullets based on dragon type
    shoot(monsters) {
        const bullets = [];
        const bulletX = this.x + this.width / 2 - 5;
        const bulletY = this.y + this.height / 2;
        
        // Apply damage boost based on level
        const baseDamage = this.damage;
        
        switch (this.attackType) {
            case 'straight':
                // Blue dragon - straight bullets
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'straight',
                        baseDamage
                    )
                );
                break;
                
            case 'spread':
                // Red dragon - spread bullets
                const spreadAngle = 0.3; // Spread angle in radians
                
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'spread',
                        baseDamage,
                        { angle: -spreadAngle }
                    )
                );
                
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'spread',
                        baseDamage,
                        { angle: 0 }
                    )
                );
                
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'spread',
                        baseDamage,
                        { angle: spreadAngle }
                    )
                );
                break;
                
            case 'homing':
                // Green dragon - homing bullets
                // Find closest monster
                let closestMonster = null;
                let closestDistance = Infinity;
                
                for (const monster of monsters) {
                    if (monster.active) {
                        const dx = monster.x + monster.width / 2 - bulletX;
                        const dy = monster.y + monster.height / 2 - bulletY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestMonster = monster;
                        }
                    }
                }
                
                if (closestMonster) {
                    // Calculate angle to monster
                    const dx = closestMonster.x + closestMonster.width / 2 - bulletX;
                    const dy = closestMonster.y + closestMonster.height / 2 - bulletY;
                    const angle = Math.atan2(dx, dy);
                    
                    bullets.push(
                        BulletFactory.createDragonBullet(
                            bulletX,
                            bulletY,
                            'homing',
                            baseDamage,
                            { target: closestMonster }
                        )
                    );
                } else {
                    // No monsters to target, shoot straight
                    bullets.push(
                        BulletFactory.createDragonBullet(
                            bulletX,
                            bulletY,
                            'straight',
                            baseDamage
                        )
                    );
                }
                break;
                
            case 'piercing':
                // Purple dragon - piercing bullets
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'piercing',
                        baseDamage,
                        { pierceCount: 3 }
                    )
                );
                break;
                
            case 'explosive':
                // Gold dragon - explosive bullets
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'explosive',
                        baseDamage,
                        { explosionRadius: 60 }
                    )
                );
                break;
        }
        
        return bullets;
    }

    // Add experience points
    addExperience(amount) {
        // Max level check
        if (this.level >= 10) return false;
        
        this.experience += amount;
        
        // Check for level up
        if (this.experience >= this.experienceToNextLevel) {
            this.levelUp();
            return true;
        }
        
        return false;
    }

    // Level up the sidekick
    levelUp() {
        // Max level check
        if (this.level >= 10) return;
        
        this.level++;
        this.experience = 0;
        
        // Calculate new experience requirement (increases with each level)
        this.experienceToNextLevel = 100 * Math.pow(1.5, this.level - 1);
        
        // Increase damage with level
        this.damage = this.level;
        
        // Increase attack speed (decrease interval) with level, but not below minimum
        const minShootInterval = 15; // Minimum shoot interval
        this.shootInterval = Math.max(30 - (this.level - 1) * 2, minShootInterval);
        
        // Set level up animation timer
        this.levelUpAnimationTimer = 60; // 1 second at 60fps
    }

    // Get upgrade cost
    getUpgradeCost() {
        return this.price * (this.level + 1);
    }
}

/**
 * SidekickManager class to manage all sidekicks
 */
class SidekickManager {
    constructor() {
        // Available sidekick types
        this.availableSidekicks = [
            'blue',
            'red',
            'green',
            'purple',
            'gold'
        ];
        
        // Unlocked sidekicks (blue is unlocked by default)
        this.unlockedSidekicks = ['blue'];
        
        // Sidekick levels
        this.sidekickLevels = {
            blue: 1,
            red: 1,
            green: 1,
            purple: 1,
            gold: 1
        };
    }

    // Get a sidekick instance
    getSidekick(type) {
        if (this.isUnlocked(type)) {
            return new Sidekick(type, this.sidekickLevels[type]);
        }
        return null;
    }

    // Check if a sidekick is unlocked
    isUnlocked(type) {
        return this.unlockedSidekicks.includes(type);
    }

    // Unlock a new sidekick
    unlockSidekick(type) {
        if (!this.isUnlocked(type) && this.availableSidekicks.includes(type)) {
            this.unlockedSidekicks.push(type);
            return true;
        }
        return false;
    }

    // Upgrade a sidekick
    upgradeSidekick(type) {
        if (this.isUnlocked(type)) {
            this.sidekickLevels[type]++;
            return true;
        }
        return false;
    }

    // Get all available sidekicks
    getAvailableSidekicks() {
        return this.availableSidekicks.map(type => {
            const sidekick = new Sidekick(type);
            return {
                type: type,
                unlocked: this.isUnlocked(type),
                level: this.sidekickLevels[type],
                price: sidekick.price,
                description: sidekick.description
            };
        });
    }

    // Get unlocked sidekicks
    getUnlockedSidekicks() {
        return this.unlockedSidekicks.map(type => {
            return {
                type: type,
                level: this.sidekickLevels[type]
            };
        });
    }

    // Get price to unlock a sidekick
    getUnlockPrice(type) {
        const sidekick = new Sidekick(type);
        return sidekick.price;
    }
} 