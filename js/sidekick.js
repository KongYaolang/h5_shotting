/**
 * Sidekick (Dragon) class for the game
 */
class Sidekick {
    constructor(type, level = 1) {
        this.type = type;
        this.level = level;
        this.width = 40;  // Sidekick width
        this.height = 40; // Sidekick height
        this.offsetX = 0;
        this.offsetY = 0;
        this.shootTimer = 0;
        this.shootInterval = 30; // Shoot interval (frames): 30 frames = 0.5 seconds at 60fps
        this.damage = level;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
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
                this.description = '发射爆炸子弹，对周围敌人造成伤害';
                break;
        }
    }

    // Update sidekick position and state
    update(guardian, position) {
        // Update position relative to guardian
        if (position === 'left') {
            this.x = guardian.x - this.width - 10;
            this.y = guardian.y + 20;
        } else {
            this.x = guardian.x + guardian.width + 10;
            this.y = guardian.y + 20;
        }
        
        // Update shoot timer
        this.shootTimer++;
        
        // Update animation
        this.animationTimer++;
        if (this.animationTimer >= 10) { // Animation speed
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
    }

    // Draw the sidekick
    draw(context) {
        // Draw dragon body
        context.fillStyle = this.color;
        
        // Draw body
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
        
        // Draw wings (animated)
        context.fillStyle = this.getWingColor();
        
        // Left wing
        context.save();
        context.translate(this.x, this.y + this.height / 2);
        context.rotate(Math.sin(this.animationFrame * 0.5) * 0.3);
        context.beginPath();
        context.ellipse(0, 0, 15, 20, Math.PI / 3, 0, Math.PI * 2);
        context.fill();
        context.restore();
        
        // Right wing
        context.save();
        context.translate(this.x + this.width, this.y + this.height / 2);
        context.rotate(-Math.sin(this.animationFrame * 0.5) * 0.3);
        context.beginPath();
        context.ellipse(0, 0, 15, 20, -Math.PI / 3, 0, Math.PI * 2);
        context.fill();
        context.restore();
        
        // Draw eyes
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(this.x + this.width / 2 - 5, this.y + this.height / 3, 3, 0, Math.PI * 2);
        context.arc(this.x + this.width / 2 + 5, this.y + this.height / 3, 3, 0, Math.PI * 2);
        context.fill();
        
        // Draw pupils
        context.fillStyle = '#000000';
        context.beginPath();
        context.arc(this.x + this.width / 2 - 5, this.y + this.height / 3, 1.5, 0, Math.PI * 2);
        context.arc(this.x + this.width / 2 + 5, this.y + this.height / 3, 1.5, 0, Math.PI * 2);
        context.fill();
        
        // Draw level indicator
        context.fillStyle = '#ffffff';
        context.font = '10px Arial';
        context.textAlign = 'center';
        context.fillText(
            `Lv${this.level}`,
            this.x + this.width / 2,
            this.y - 5
        );
    }

    // Get wing color (slightly lighter than body)
    getWingColor() {
        // Create a lighter version of the dragon's color
        const r = parseInt(this.color.slice(1, 3), 16);
        const g = parseInt(this.color.slice(3, 5), 16);
        const b = parseInt(this.color.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
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
        const bulletX = this.x + this.width / 2;
        const bulletY = this.y;
        
        switch (this.attackType) {
            case 'straight':
                // Blue dragon - straight bullets
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'straight',
                        this.damage
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
                        this.damage,
                        { angle: -spreadAngle }
                    )
                );
                
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'spread',
                        this.damage,
                        { angle: 0 }
                    )
                );
                
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'spread',
                        this.damage,
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
                    const dx = monster.x + monster.width / 2 - bulletX;
                    const dy = monster.y + monster.height / 2 - bulletY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestMonster = monster;
                    }
                }
                
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'homing',
                        this.damage,
                        { target: closestMonster }
                    )
                );
                break;
                
            case 'piercing':
                // Purple dragon - piercing bullets
                bullets.push(
                    BulletFactory.createDragonBullet(
                        bulletX,
                        bulletY,
                        'piercing',
                        this.damage,
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
                        this.damage,
                        { explosionRadius: 60 }
                    )
                );
                break;
        }
        
        return bullets;
    }

    // Level up the sidekick
    levelUp() {
        this.level++;
        this.damage = this.level;
        
        // Increase attack speed (decrease interval) with level, but not below minimum
        const minShootInterval = 15; // Minimum shoot interval
        this.shootInterval = Math.max(30 - (this.level - 1) * 2, minShootInterval);
    }

    // Get upgrade cost
    getUpgradeCost() {
        return this.level * 50;
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