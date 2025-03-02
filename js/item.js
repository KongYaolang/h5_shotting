/**
 * Item class for dropped items in the game
 */
class Item {
    constructor(x, y, type, value = 1) {
        this.x = x;
        this.y = y;
        this.type = type; // 'coin', 'temp_powerup', or 'perm_upgrade'
        this.value = value; // Amount of coins or powerup type
        this.width = 20;
        this.height = 20;
        this.speed = 2;
        this.active = true;
        this.lifespan = 300; // 5 seconds at 60fps
        
        // Animation properties
        this.rotation = 0;
        this.rotationSpeed = 0.05;
        this.scale = 1;
        this.scaleDirection = 0.01;
    }

    // Update item position and animation
    update() {
        // Move downward
        this.y += this.speed;
        
        // Update animation
        this.rotation += this.rotationSpeed;
        this.scale += this.scaleDirection;
        
        // Oscillate scale for pulsing effect
        if (this.scale > 1.2) {
            this.scaleDirection = -0.01;
        } else if (this.scale < 0.8) {
            this.scaleDirection = 0.01;
        }
        
        // Decrease lifespan
        this.lifespan--;
        
        // Deactivate if lifespan ends or item goes off screen
        if (this.lifespan <= 0 || this.y > 600) {
            this.active = false;
        }
    }

    // Draw the item
    draw(context) {
        if (!this.active) return;
        
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.rotation);
        context.scale(this.scale, this.scale);
        
        if (this.type === 'coin') {
            // Draw coin
            context.fillStyle = '#FFD700'; // Gold
            context.beginPath();
            context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            context.fill();
            
            // Add shine effect
            context.fillStyle = '#FFF8DC'; // Cornsilk
            context.beginPath();
            context.arc(-3, -3, 3, 0, Math.PI * 2);
            context.fill();
            
            // Add glow effect for coins
            context.shadowBlur = 10;
            context.shadowColor = '#FFD700';
            context.beginPath();
            context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            context.shadowBlur = 0;
        } else if (this.type === 'temp_powerup') {
            // Draw temporary powerup based on value
            switch(this.value) {
                case 'shield':
                    // Energy Shield
                    context.fillStyle = '#3498db'; // Blue
                    context.beginPath();
                    context.moveTo(0, -this.height / 2);
                    context.lineTo(this.width / 2, 0);
                    context.lineTo(0, this.height / 2);
                    context.lineTo(-this.width / 2, 0);
                    context.closePath();
                    context.fill();
                    break;
                    
                case 'damage':
                    // Bullet Enhancement
                    context.fillStyle = '#f39c12'; // Orange
                    context.beginPath();
                    context.moveTo(-this.width / 2, -this.height / 2);
                    context.lineTo(this.width / 2, -this.height / 2);
                    context.lineTo(0, this.height / 2);
                    context.closePath();
                    context.fill();
                    break;
                    
                case 'dragon_rage':
                    // Dragon Rage
                    context.fillStyle = '#e74c3c'; // Red
                    context.beginPath();
                    context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                    context.fill();
                    
                    // Draw dragon symbol
                    context.fillStyle = 'white';
                    context.beginPath();
                    context.moveTo(-5, -5);
                    context.lineTo(5, -5);
                    context.lineTo(0, 5);
                    context.closePath();
                    context.fill();
                    break;
                    
                case 'magnet':
                    // Coin Magnet
                    context.fillStyle = '#9b59b6'; // Purple
                    context.beginPath();
                    context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                    context.fill();
                    
                    // Draw magnet symbol
                    context.strokeStyle = 'white';
                    context.lineWidth = 2;
                    context.beginPath();
                    context.moveTo(-5, -5);
                    context.lineTo(-5, 5);
                    context.moveTo(5, -5);
                    context.lineTo(5, 5);
                    context.stroke();
                    break;
            }
            
            // Add glow effect for temporary powerups
            context.shadowBlur = 15;
            context.shadowColor = context.fillStyle;
            context.beginPath();
            context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            context.shadowBlur = 0;
        } else if (this.type === 'perm_upgrade') {
            // Draw permanent upgrade based on value
            switch(this.value) {
                case 'weapon_fragment':
                    // Weapon Fragment
                    context.fillStyle = '#e67e22'; // Dark Orange
                    context.beginPath();
                    context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
                    context.fill();
                    
                    // Draw sword symbol
                    context.strokeStyle = 'white';
                    context.lineWidth = 2;
                    context.beginPath();
                    context.moveTo(0, -8);
                    context.lineTo(0, 8);
                    context.moveTo(-5, -3);
                    context.lineTo(5, -3);
                    context.stroke();
                    break;
                    
                case 'dragon_soul':
                    // Dragon Soul
                    context.fillStyle = '#27ae60'; // Green
                    context.beginPath();
                    context.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                    context.fill();
                    
                    // Draw dragon wing symbol
                    context.fillStyle = 'white';
                    context.beginPath();
                    context.moveTo(-5, 0);
                    context.lineTo(0, -5);
                    context.lineTo(5, 0);
                    context.lineTo(0, 5);
                    context.closePath();
                    context.fill();
                    break;
                    
                case 'life_crystal':
                    // Life Crystal
                    context.fillStyle = '#e74c3c'; // Red
                    context.beginPath();
                    context.moveTo(0, -this.height / 2);
                    context.lineTo(this.width / 2, 0);
                    context.lineTo(0, this.height / 2);
                    context.lineTo(-this.width / 2, 0);
                    context.closePath();
                    context.fill();
                    
                    // Draw heart symbol
                    context.fillStyle = 'white';
                    context.beginPath();
                    context.arc(-3, -3, 3, 0, Math.PI * 2);
                    context.arc(3, -3, 3, 0, Math.PI * 2);
                    context.moveTo(0, 0);
                    context.lineTo(-6, 0);
                    context.lineTo(0, 6);
                    context.lineTo(6, 0);
                    context.fill();
                    break;
            }
            
            // Add special glow effect for permanent upgrades
            context.shadowBlur = 20;
            context.shadowColor = 'gold';
            context.strokeStyle = 'gold';
            context.lineWidth = 2;
            context.beginPath();
            context.arc(0, 0, this.width / 2 + 2, 0, Math.PI * 2);
            context.stroke();
            context.shadowBlur = 0;
        }
        
        context.restore();
        
        // Draw fading effect when item is about to expire
        if (this.lifespan < 60) {
            const alpha = this.lifespan / 60;
            context.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, 
                        this.width / 2 + 5, 0, Math.PI * 2);
            context.fill();
        }
    }

    // Check if item collides with guardian
    checkCollision(guardian) {
        return this.x < guardian.x + guardian.width &&
               this.x + this.width > guardian.x &&
               this.y < guardian.y + guardian.height &&
               this.y + this.height > guardian.y;
    }
}

// Item drop manager
class ItemDropManager {
    constructor() {
        // Temporary powerup types with their drop rates
        this.tempPowerups = [
            { type: 'shield', rate: 0.10 },       // Energy Shield: 10% drop rate
            { type: 'damage', rate: 0.15 },       // Bullet Enhancement: 15% drop rate
            { type: 'dragon_rage', rate: 0.05 },  // Dragon Rage: 5% drop rate
            { type: 'magnet', rate: 0.20 }        // Coin Magnet: 20% drop rate
        ];
        
        // Permanent upgrade types with their drop rates (for bosses)
        this.permUpgrades = [
            { type: 'weapon_fragment', rate: 0.30 }, // Weapon Fragment: 30% drop rate
            { type: 'dragon_soul', rate: 0.20 },     // Dragon Soul: 20% drop rate
            { type: 'life_crystal', rate: 0.10 }     // Life Crystal: 10% drop rate
        ];
        
        // Track if a temporary powerup has already dropped in this wave
        this.tempPowerupDroppedThisWave = false;
    }
    
    // Reset wave tracking at the start of a new wave
    resetWaveTracking() {
        this.tempPowerupDroppedThisWave = false;
    }
    
    // Calculate drop chance based on monster type and wave number
    calculateDropChance(monsterType, waveNumber) {
        let coinChance, powerupChance, permUpgradeChance;
        const waveBonus = Math.floor(waveNumber / 10) * 0.05; // 5% increase every 10 waves
        
        switch(monsterType) {
            case 'boss':
                coinChance = 1.0; // 100%
                powerupChance = 0.5 + waveBonus; // 50% + wave bonus
                permUpgradeChance = 0.6 + waveBonus; // 60% + wave bonus
                break;
                
            case 'elite':
                coinChance = 0.8 + waveBonus; // 80% + wave bonus
                powerupChance = 0.3 + waveBonus; // 30% + wave bonus
                permUpgradeChance = 0.1 + waveBonus; // 10% + wave bonus
                break;
                
            default: // normal monster
                coinChance = 0.6 + waveBonus; // 60% + wave bonus, max 70%
                powerupChance = 0.1 + waveBonus; // 10% + wave bonus, max 15%
                permUpgradeChance = 0; // Normal monsters don't drop permanent upgrades
                if (coinChance > 0.7) coinChance = 0.7;
                if (powerupChance > 0.15) powerupChance = 0.15;
        }
        
        return { coinChance, powerupChance, permUpgradeChance };
    }
    
    // Select a random temporary powerup based on drop rates
    selectRandomTempPowerup() {
        const totalRate = this.tempPowerups.reduce((sum, item) => sum + item.rate, 0);
        let random = Math.random() * totalRate;
        
        for (const powerup of this.tempPowerups) {
            if (random < powerup.rate) {
                return powerup.type;
            }
            random -= powerup.rate;
        }
        
        // Default fallback
        return this.tempPowerups[0].type;
    }
    
    // Select a random permanent upgrade based on drop rates
    selectRandomPermUpgrade() {
        const totalRate = this.permUpgrades.reduce((sum, item) => sum + item.rate, 0);
        let random = Math.random() * totalRate;
        
        for (const upgrade of this.permUpgrades) {
            if (random < upgrade.rate) {
                return upgrade.type;
            }
            random -= upgrade.rate;
        }
        
        // Default fallback
        return this.permUpgrades[0].type;
    }
    
    // Generate drops based on monster type, position and wave number
    generateDrops(monster, waveNumber, isNewWave = false) {
        if (isNewWave) {
            this.resetWaveTracking();
        }
        
        const drops = [];
        const { x, y, width, height } = monster;
        let monsterType = 'normal';
        
        // Determine monster type
        if (monster instanceof Boss) {
            monsterType = 'boss';
        } else if (waveNumber % 5 === 0 && monster.health > 3) {
            monsterType = 'elite';
        }
        
        const { coinChance, powerupChance, permUpgradeChance } = this.calculateDropChance(monsterType, waveNumber);
        
        // Determine coin drops
        if (Math.random() < coinChance) {
            let coinCount;
            
            switch(monsterType) {
                case 'boss':
                    coinCount = randomBetween(10, 20);
                    break;
                case 'elite':
                    coinCount = randomBetween(3, 6);
                    break;
                default:
                    coinCount = randomBetween(1, 3);
            }
            
            // Create coin items
            for (let i = 0; i < coinCount; i++) {
                const offsetX = Math.random() * width;
                const offsetY = Math.random() * height;
                drops.push(new Item(x + offsetX, y + offsetY, 'coin'));
            }
        }
        
        // Determine temporary powerup drops (max 1 per wave)
        if (!this.tempPowerupDroppedThisWave && Math.random() < powerupChance) {
            const powerupType = this.selectRandomTempPowerup();
            const offsetX = Math.random() * width;
            const offsetY = Math.random() * height;
            
            drops.push(new Item(x + offsetX, y + offsetY, 'temp_powerup', powerupType));
            this.tempPowerupDroppedThisWave = true;
        }
        
        // Determine permanent upgrade drops (mainly from bosses)
        if (monsterType === 'boss' || (monsterType === 'elite' && Math.random() < 0.2)) {
            if (Math.random() < permUpgradeChance) {
                const upgradeType = this.selectRandomPermUpgrade();
                const offsetX = Math.random() * width;
                const offsetY = Math.random() * height;
                
                drops.push(new Item(x + offsetX, y + offsetY, 'perm_upgrade', upgradeType));
            }
        }
        
        return drops;
    }
} 