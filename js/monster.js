/**
 * Monster class for the game
 */
class Monster {
    constructor(x, y, type = 'normal', wave = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.active = true;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.hitAnimationTimer = 0;
        this.wave = wave;
        
        // 所有非BOSS怪物使用相同的大小
        if (type === 'boss') {
            this.width = 120;
            this.height = 120;
            this.speed = 0.8;
            this.health = 80 + Math.floor(wave / 5) * 20; // Increased base health + increase per 5 waves
            this.color = '#9b59b6'; // Purple
            this.outlineColor = '#8e44ad'; // Dark purple
            this.attackTimer = 200;
            this.attackInterval = 800; // Attack every 2 seconds at 60fps (increased frequency)
        } else {
            // 所有普通怪物和精英怪物使用相同的大小
            this.width = 50;
            this.height = 50;
            
            // 根据类型设置不同的属性
            switch(type) {
                case 'elite':
                    this.speed = 1.5;
                    this.health = 10 + Math.floor(wave / 10) * 5; // Base health + increase per 10 waves
                    this.color = '#e74c3c'; // Red
                    this.outlineColor = '#c0392b'; // Dark red
                    break;
                    
                case 'minion':
                    this.speed = 2.5;
                    this.health = 3 + Math.floor(wave / 10); // Base health + increase per 10 waves
                    this.color = '#2ecc71'; // Green
                    this.outlineColor = '#27ae60'; // Dark green
                    break;
                    
                default: // normal monster
                    this.speed = 2;
                    this.health = 5 + Math.floor(wave / 10) * 2; // Base health + increase per 10 waves
                    this.color = '#3498db'; // Blue
                    this.outlineColor = '#2980b9'; // Dark blue
            }
        }
        
        // Store max health for health bar
        this.maxHealth = this.health;
    }

    // Update monster position and state
    update(guardianX) {
        if (!this.active) return;
        
        // Move monster down
        if (this.type === 'boss') {
            // Boss should stay at the top of the screen
            if (this.y < 50) {
                // Move down until reaching the desired position
                this.y += this.speed;
            } else {
                // Once in position, only move horizontally
                // Add slight vertical movement for visual effect
                this.y = 50 + Math.sin(this.animationTimer * 0.05) * 10;
                
                // More aggressive horizontal movement
                if (guardianX) {
                    // Target player with some randomness
                    const targetX = guardianX - this.width / 2;
                    const distanceToTarget = targetX - this.x;
                    
                    // Health-based movement speed
                    const healthPercentage = this.health / this.maxHealth;
                    let moveSpeed = this.speed * 0.8;
                    
                    // Faster movement when low health
                    if (healthPercentage < 0.3) {
                        moveSpeed = this.speed * 1.5;
                    } else if (healthPercentage < 0.6) {
                        moveSpeed = this.speed * 1.2;
                    }
                    
                    // Move toward player with some randomness
                    if (Math.abs(distanceToTarget) > 20) {
                        // Move toward player
                        this.x += Math.sign(distanceToTarget) * moveSpeed;
                    } else {
                        // Random movement when close to target
                        this.x += (Math.random() - 0.5) * moveSpeed * 2;
                    }
                    
                    // Every 2 seconds, make a sudden movement to surprise the player
                    if (this.animationTimer % 120 === 0) {
                        this.x += (Math.random() - 0.5) * 50;
                    }
                } else {
                    // Fallback to sine wave movement if no guardian position
                    this.x += Math.sin(this.animationTimer * 0.02) * 2;
                }
            }
            
            // Keep boss within screen bounds
            if (this.x < 0) this.x = 0;
            if (this.x > 400 - this.width) this.x = 400 - this.width;
        } else {
            // Normal monsters move down as usual
            this.y += this.speed;
        }
        
        // Update animation
        this.animationTimer++;
        if (this.animationTimer >= 10) { // Animation speed
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
        
        // Update hit animation
        if (this.hitAnimationTimer > 0) {
            this.hitAnimationTimer--;
        }
        
        // Update boss attack timer
        if (this.type === 'boss') {
            this.attackTimer++;
        }
    }

    // Draw the monster
    draw(context) {
        if (!this.active) return;
        
        // Save context state
        context.save();
        
        // Apply hit animation (flash white when hit)
        if (this.hitAnimationTimer > 0) {
            context.globalAlpha = 0.7;
            context.fillStyle = '#ffffff';
        } else {
            context.fillStyle = this.color;
        }
        
        // Apply slight movement based on animation frame
        const offsetX = Math.sin(this.animationFrame * Math.PI / 2) * 2;
        
        // Draw monster body with rounded corners
        this.drawRoundedRect(
            context, 
            this.x + offsetX, 
            this.y, 
            this.width, 
            this.height, 
            8
        );
        
        // Draw monster features
        if (this.hitAnimationTimer === 0) { // Only draw features if not in hit animation
            // Draw eyes
            context.fillStyle = '#2c3e50';
            context.beginPath();
            
            const eyeSpacing = this.width / 3;
            const eyeY = this.y + this.height * 0.3;
            const eyeSize = this.width / 10;
            
            context.arc(this.x + offsetX + eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
            context.arc(this.x + offsetX + this.width - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
            context.fill();
            
            // Draw mouth
            context.beginPath();
            context.strokeStyle = '#2c3e50';
            context.lineWidth = 2;
            
            const mouthY = this.y + this.height * 0.6;
            const mouthWidth = this.width * 0.6;
            
            context.moveTo(this.x + offsetX + (this.width - mouthWidth) / 2, mouthY);
            context.lineTo(this.x + offsetX + (this.width + mouthWidth) / 2, mouthY);
            context.stroke();
            
            // Draw special features based on monster type
            if (this.type === 'elite') {
                // Draw spikes on elite monsters
                context.fillStyle = '#e74c3c';
                
                for (let i = 0; i < 3; i++) {
                    const spikeX = this.x + offsetX + (i + 1) * (this.width / 4);
                    
                    context.beginPath();
                    context.moveTo(spikeX, this.y);
                    context.lineTo(spikeX - 5, this.y - 10);
                    context.lineTo(spikeX + 5, this.y - 10);
                    context.closePath();
                    context.fill();
                }
            } else if (this.type === 'boss') {
                // Draw crown on boss monsters
                context.fillStyle = '#f1c40f';
                
                context.beginPath();
                context.moveTo(this.x + offsetX + this.width / 4, this.y);
                context.lineTo(this.x + offsetX + this.width / 6, this.y - 15);
                context.lineTo(this.x + offsetX + this.width / 3, this.y - 25);
                context.lineTo(this.x + offsetX + this.width / 2, this.y - 15);
                context.lineTo(this.x + offsetX + this.width * 2/3, this.y - 25);
                context.lineTo(this.x + offsetX + this.width * 5/6, this.y - 15);
                context.lineTo(this.x + offsetX + this.width * 3/4, this.y);
                context.closePath();
                context.fill();
            }
        }
        
        // Draw health bar
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthPercentage = this.health / this.maxHealth;
        
        // Health bar background
        context.fillStyle = '#7f8c8d';
        context.fillRect(
            this.x + offsetX, 
            this.y - 10, 
            healthBarWidth, 
            healthBarHeight
        );
        
        // Health bar fill
        context.fillStyle = this.getHealthColor(healthPercentage);
        context.fillRect(
            this.x + offsetX, 
            this.y - 10, 
            healthBarWidth * healthPercentage, 
            healthBarHeight
        );
        
        // Restore context state
        context.restore();
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

    // Take damage from bullets
    takeDamage(damage) {
        this.health -= damage;
        this.hitAnimationTimer = 10; // Hit animation duration
        
        if (this.health <= 0) {
            this.active = false;
            return true; // Monster is destroyed
        }
        
        return false; // Monster is still active
    }

    // Check if monster is at the bottom of the screen
    isAtBottom(canvasHeight) {
        return this.y + this.height >= canvasHeight;
    }

    // Check if monster is a boss
    isBoss() {
        return this.type === 'boss';
    }

    // Check if monster collides with guardian
    checkCollision(guardian) {
        return (
            this.x < guardian.x + guardian.width &&
            this.x + this.width > guardian.x &&
            this.y < guardian.y + guardian.height &&
            this.y + this.height > guardian.y
        );
    }

    // Check if boss should attack
    shouldAttack() {
        if (this.type !== 'boss') return false;
        
        // Determine attack interval based on health percentage
        const healthPercentage = this.health / this.maxHealth;
        let attackInterval = this.attackInterval;
        
        // Increase attack frequency as health decreases
        if (healthPercentage < 0.3) {
            attackInterval = 100; // Attack every 0.75 seconds when low health (was 60)
        } else if (healthPercentage < 0.6) {
            attackInterval = 180; // Attack every 1.25 seconds at medium health (was 90)
        }
        
        // Random chance for immediate attack when damaged
        if (this.hitAnimationTimer > 0 && Math.random() < 0.001) {
            this.attackTimer = attackInterval;
        }
        
        if (this.attackTimer >= attackInterval) {
            this.attackTimer = 0;
            return true;
        }
        
        return false;
    }

    // Create boss attack (bullets)
    createAttack(guardianX, guardianY) {
        const bullets = [];
        
        // Determine attack pattern based on health percentage
        const healthPercentage = this.health / this.maxHealth;
        let bulletCount = 4; // Default number of bullets
        let bulletSpeed = 1;
        let bulletSpread = 0.3;
        
        // Calculate angle to guardian (player)
        const dx = guardianX - (this.x + this.width / 2);
        const dy = guardianY - (this.y + this.height / 2);
        const angleToGuardian = Math.atan2(dx, dy);
        
        // Increase difficulty as boss health decreases
        if (healthPercentage < 0.3) {
            bulletCount = 5; // More bullets when low health
            bulletSpeed = 2;
            bulletSpread = 0.3;
        } else if (healthPercentage < 0.6) {
            bulletCount = 4; // Medium difficulty
            bulletSpeed = 2;
            bulletSpread = 0.3;
        }
        
        // Select attack pattern based on health and random chance
        const attackPattern = Math.random();
        
        if (healthPercentage < 0.3 && attackPattern < 0.4) {
            // Circular attack pattern (low health special attack)
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                
                bullets.push({
                    x: this.x + this.width / 2 - 5,
                    y: this.y + this.height / 2,
                    width: 10,
                    height: 10,
                    speed: bulletSpeed * 0.8,
                    angle: angle,
                    color: '#e74c3c', // Red bullets
                    pattern: 'circular'
                });
            }
        } else if (healthPercentage < 0.6 && attackPattern < 0.3) {
            // Triple shot toward player
            for (let i = 0; i < 3; i++) {
                const offsetAngle = (i - 1) * 0.15;
                
                bullets.push({
                    x: this.x + this.width / 2 - 5,
                    y: this.y + this.height / 2,
                    width: 12,
                    height: 12,
                    speed: bulletSpeed * 1.2,
                    angle: angleToGuardian + offsetAngle,
                    color: '#e74c3c', // Red bullets
                    pattern: 'targeted'
                });
            }
        } else {
            // Standard spread attack toward player
            for (let i = 0; i < bulletCount; i++) {
                const angle = i * bulletSpread - (bulletCount - 1) * bulletSpread / 2; // Spread bullets
                
                bullets.push({
                    x: this.x + this.width / 2 - 5,
                    y: this.y + this.height,
                    width: 10,
                    height: 10,
                    speed: bulletSpeed,
                    angle: angleToGuardian + angle, // Toward player with spread
                    color: '#e74c3c', // Red bullets
                    pattern: 'spread'
                });
            }
        }
        
        return bullets;
    }

    // Get color based on health percentage
    getHealthColor(percentage) {
        if (percentage > 0.6) {
            return '#2ecc71'; // Green
        } else if (percentage > 0.3) {
            return '#f39c12'; // Orange
        } else {
            return '#e74c3c'; // Red
        }
    }
}

/**
 * MonsterFactory class to create monsters
 */
class MonsterFactory {
    // Create a single monster
    static createMonster(x, y, type, wave) {
        return new Monster(x, y, type, wave);
    }
    
    // Create a wave of monsters
    static createWave(canvasWidth, wave, count = 5) {
        const monsters = [];
        
        // 确定这一波是否是BOSS波
        if (wave % 10 === 0) {
            // BOSS波只有一个BOSS
            const x = canvasWidth / 2 - 60;
            const y = -120;
            monsters.push(new Monster(x, y, 'boss', wave));
            return monsters;
        }
        
        // 计算怪物之间的间距
        const spacing = canvasWidth / (count + 1);
        
        // 根据波次确定怪物类型的分布
        let eliteChance = Math.min(0.1 + (wave * 0.02), 0.4);
        let minionChance = Math.min(0.15 + (wave * 0.01), 0.3);
        
        // 创建一排怪物，随机分配类型
        for (let i = 0; i < count; i++) {
            const x = spacing * (i + 1) - 25;
            const y = -100 - (Math.random() * 50);
            
            let monsterType = 'normal';
            const typeRoll = Math.random();
            
            if (typeRoll < eliteChance) {
                monsterType = 'elite';
            } else if (typeRoll < eliteChance + minionChance) {
                monsterType = 'minion';
            }
            
            // 每5波增加一个精英怪的概率
            if (wave % 5 === 0 && i === Math.floor(count / 2)) {
                monsterType = 'elite';
            }
            
            monsters.push(new Monster(x, y, monsterType, wave));
        }
        
        return monsters;
    }
} 