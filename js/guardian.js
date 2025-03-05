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
        const bullets = [];
        const centerX = this.x + this.width / 2 - 4;
        const baseY = this.y - 10;
        
        // 检查是否处于伤害加成状态
        if (window.game && window.game.powerupEffects.damage.active) {
            // 三排子弹模式
            bullets.push(
                // 中间子弹
                BulletFactory.createNormalBullet(
                    centerX,
                    baseY,
                    this.damage * window.game.powerupEffects.damage.multiplier
                ),
                // 左侧子弹
                BulletFactory.createNormalBullet(
                    centerX - 15,
                    baseY + 5,
                    this.damage * window.game.powerupEffects.damage.multiplier
                ),
                // 右侧子弹
                BulletFactory.createNormalBullet(
                    centerX + 15,
                    baseY + 5,
                    this.damage * window.game.powerupEffects.damage.multiplier
                )
            );
        } else {
            // 普通单排子弹
            bullets.push(
                BulletFactory.createNormalBullet(
                    centerX,
                    baseY,
                    this.damage
                )
            );
        }
        
        return bullets;
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
    upgradeDamage(particleSystem = null) {
        console.log('[守护者升级] 开始升级:', {
            当前伤害: this.damage,
            位置: { x: this.x, y: this.y },
            是否有特效系统: !!particleSystem
        });
        
        try {
            this.damage++;
            
            // 只在有 particleSystem 时创建特效
            if (particleSystem) {
                // 创建升级特效
                const centerX = this.x + this.width / 2;
                const centerY = this.y + this.height / 2;
                
                // 根据新的伤害等级设置特效颜色
                let effectColor;
                if (this.damage >= 5) {
                    effectColor = 'rgba(231, 76, 60, 0.8)'; // 红色，高伤害
                } else if (this.damage >= 3) {
                    effectColor = 'rgba(243, 156, 18, 0.8)'; // 橙色，中等伤害
                } else {
                    effectColor = 'rgba(241, 196, 15, 0.8)'; // 黄色，基础伤害
                }
                
                console.log('[守护者升级] 创建特效:', {
                    中心位置: { x: centerX, y: centerY },
                    特效颜色: effectColor
                });
                
                // 创建爆发特效
                particleSystem.createExplosion(
                    centerX,
                    centerY,
                    effectColor,
                    20  // 粒子数量
                );
                
                // 创建文字提示
                particleSystem.createText(
                    centerX,
                    centerY - 30,
                    `攻击力提升! Lv.${this.damage}`,
                    effectColor,
                    16,
                    60
                );
            }
            
            console.log('[守护者升级] 升级完成:', {
                新伤害: this.damage,
                特效是否创建: !!particleSystem
            });
            
            return this.damage;
        } catch (error) {
            console.error('[守护者升级] 升级过程出错:', error);
            throw error;
        }
    }

    // Get upgrade cost for weapon
    getWeaponUpgradeCost() {
        return this.damage * 100; // Base cost for weapon upgrade
    }
} 