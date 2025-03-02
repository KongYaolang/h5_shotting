/**
 * Main Game class
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.resetGame();
        
        // Initialize particle system
        this.particleSystem = new ParticleSystem();
        
        // Initialize sidekick manager
        this.sidekickManager = new SidekickManager();
        
        // Initialize item drop manager
        this.itemDropManager = new ItemDropManager();
        
        // Initialize UI manager
        this.uiManager = new UIManager(this);
        
        // Game state
        this.state = 'menu'; // menu, playing, gameover
        
        // Load high score from local storage
        this.loadHighScore();
    }

    // Reset game state
    resetGame() {
        // Guardian (player)
        this.guardian = new Guardian(this.width / 2 - 30, this.height - 100);
        
        // Game objects
        this.bullets = [];
        this.monsters = [];
        this.bossBullets = [];
        this.items = [];
        this.activeSidekicks = [];
        
        // Game state
        this.score = 0;
        this.coins = 0;
        this.lives = 3; // Starting lives
        this.wave = 0;
        this.waveTimer = 0;
        this.gameTime = 0;
        
        // Powerup effects
        this.powerupEffects = {
            shield: { active: false, duration: 0 },
            damage: { active: false, duration: 0, multiplier: 1 },
            speed: { active: false, duration: 0, multiplier: 1 },
            coinMagnet: { active: false, duration: 0, radius: 0 }
        };
        
        // Permanent upgrades
        this.permanentUpgrades = {
            weaponFragments: 0,
            dragonSouls: 0,
            lifeCrystals: 0
        };
        
        // Wave tracking
        this.monstersInWave = 0;
        this.monstersDefeated = 0;
    }

    // Start a new game
    startGame() {
        console.log('Starting game...');
        this.resetGame();
        this.state = 'playing';
        
        // Update UI
        document.getElementById('startScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.remove('active');
        document.getElementById('gameUI').classList.add('active');
        
        // Add default sidekick (blue dragon)
        this.activeSidekicks.push(this.sidekickManager.getSidekick('blue'));
        
        // Start first wave
        this.startNewWave();
        
        console.log('Game started!');
    }

    // Update game state
    update() {
        // Update game time
        this.gameTime++;
        
        if (this.state === 'playing') {
            // Update guardian
            this.guardian.update(this.width);
            
            // Check if guardian should shoot
            if (this.guardian.checkShoot()) {
                const bullet = this.guardian.shoot();
                this.bullets.push(bullet);
            }
            
            // Update sidekicks
            for (let i = 0; i < this.activeSidekicks.length; i++) {
                const sidekick = this.activeSidekicks[i];
                const position = i % 2 === 0 ? 'left' : 'right';
                sidekick.update(this.guardian, position);
                
                // Check if sidekick should shoot
                if (sidekick.checkShoot()) {
                    const bullets = sidekick.shoot(this.monsters);
                    this.bullets.push(...bullets);
                }
            }
            
            // Update bullets
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                bullet.update();
                
                // Check for collisions with monsters
                for (let j = this.monsters.length - 1; j >= 0; j--) {
                    const monster = this.monsters[j];
                    
                    if (bullet.checkCollision(monster)) {
                        const explosionData = bullet.handleCollision(monster);
                        
                        // Handle explosion effect
                        if (explosionData) {
                            this.createExplosion(explosionData);
                        }
                        
                        // Check if monster was destroyed
                        if (!monster.active) {
                            // Generate drops
                            this.generateDrops(monster);
                            
                            // Add score
                            this.score += monster.health * 10;
                            
                            // Create particle effect
                            this.particleSystem.createExplosion(
                                monster.x + monster.width / 2,
                                monster.y + monster.height / 2,
                                monster.color,
                                20
                            );
                            
                            // Track monsters defeated
                            this.monstersDefeated++;
                            
                            // Remove monster
                            this.monsters.splice(j, 1);
                        }
                        
                        // Remove bullet if it's not active anymore
                        if (!bullet.active) {
                            this.bullets.splice(i, 1);
                            break;
                        }
                    }
                }
                
                // Remove inactive bullets
                if (!bullet.active) {
                    this.bullets.splice(i, 1);
                }
            }
            
            // Update monsters
            for (let i = this.monsters.length - 1; i >= 0; i--) {
                const monster = this.monsters[i];
                monster.update();
                
                // Check if monster is at bottom of screen
                if (monster.isAtBottom(this.height)) {
                    // Remove monster
                    this.monsters.splice(i, 1);
                    continue;
                }
                
                // Check for collision with guardian
                if (monster.checkCollision(this.guardian)) {
                    if (this.powerupEffects.shield.active) {
                        // Shield protects from collision
                        monster.active = false;
                        
                        // Create particle effect
                        this.particleSystem.createExplosion(
                            monster.x + monster.width / 2,
                            monster.y + monster.height / 2,
                            '#3498db', // Shield color
                            30
                        );
                        
                        // Remove monster
                        this.monsters.splice(i, 1);
                    } else {
                        // Game over on collision
                        this.gameOver();
                        return;
                    }
                }
                
                // Check if boss should attack
                if (monster.shouldAttack()) {
                    const bossBullets = monster.createAttack();
                    this.bossBullets.push(...bossBullets);
                }
            }
            
            // Update boss bullets
            for (let i = this.bossBullets.length - 1; i >= 0; i--) {
                const bullet = this.bossBullets[i];
                
                // Update position
                bullet.x += Math.sin(bullet.angle) * bullet.speed;
                bullet.y += Math.cos(bullet.angle) * bullet.speed;
                
                // Check if bullet is off screen
                if (bullet.y > this.height || bullet.y < 0 || bullet.x > this.width || bullet.x < 0) {
                    this.bossBullets.splice(i, 1);
                    continue;
                }
                
                // Check for collision with guardian
                if (
                    bullet.x < this.guardian.x + this.guardian.width &&
                    bullet.x + bullet.width > this.guardian.x &&
                    bullet.y < this.guardian.y + this.guardian.height &&
                    bullet.y + bullet.height > this.guardian.y
                ) {
                    if (this.powerupEffects.shield.active) {
                        // Shield protects from boss bullets
                        this.particleSystem.createExplosion(
                            bullet.x + bullet.width / 2,
                            bullet.y + bullet.height / 2,
                            '#3498db', // Shield color
                            15
                        );
                    } else {
                        // Game over on hit
                        this.gameOver();
                        return;
                    }
                    
                    // Remove bullet
                    this.bossBullets.splice(i, 1);
                }
            }
            
            // Update items
            for (let i = this.items.length - 1; i >= 0; i--) {
                const item = this.items[i];
                item.update();
                
                // Check if item is inactive
                if (!item.active) {
                    this.items.splice(i, 1);
                    continue;
                }
                
                // Check for coin magnet effect
                if (this.powerupEffects.coinMagnet.active && item.type === 'coin') {
                    const dx = this.guardian.x + this.guardian.width / 2 - item.x;
                    const dy = this.guardian.y + this.guardian.height / 2 - item.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.powerupEffects.coinMagnet.radius) {
                        // Move coin towards guardian
                        const speed = 5;
                        const dirX = dx / distance;
                        const dirY = dy / distance;
                        
                        item.x += dirX * speed;
                        item.y += dirY * speed;
                    }
                }
                
                // Check for collision with guardian
                if (item.checkCollision(this.guardian)) {
                    // Apply item effect
                    switch(item.type) {
                        case 'coin':
                            this.coins += item.value;
                            this.particleSystem.createText(
                                item.x,
                                item.y,
                                `+${item.value}`,
                                '#f1c40f'
                            );
                            break;
                            
                        case 'shield':
                            this.powerupEffects.shield.active = true;
                            this.powerupEffects.shield.duration = 300; // 5 seconds at 60fps
                            this.particleSystem.createText(
                                item.x,
                                item.y,
                                'Shield!',
                                '#3498db'
                            );
                            break;
                            
                        case 'damage':
                            this.powerupEffects.damage.active = true;
                            this.powerupEffects.damage.duration = 600; // 10 seconds at 60fps
                            this.powerupEffects.damage.multiplier = 2;
                            this.particleSystem.createText(
                                item.x,
                                item.y,
                                'Power Up!',
                                '#e74c3c'
                            );
                            break;
                            
                        case 'dragon_rage':
                            this.powerupEffects.speed.active = true;
                            this.powerupEffects.speed.duration = 300; // 5 seconds at 60fps
                            this.powerupEffects.speed.multiplier = 2;
                            this.particleSystem.createText(
                                item.x,
                                item.y,
                                'Dragon Rage!',
                                '#9b59b6'
                            );
                            break;
                            
                        case 'magnet':
                            this.powerupEffects.coinMagnet.active = true;
                            this.powerupEffects.coinMagnet.duration = 900; // 15 seconds at 60fps
                            this.powerupEffects.coinMagnet.radius = 150;
                            this.particleSystem.createText(
                                item.x,
                                item.y,
                                'Coin Magnet!',
                                '#f39c12'
                            );
                            break;
                            
                        case 'weapon_fragment':
                            this.permanentUpgrades.weaponFragments++;
                            this.particleSystem.createText(
                                item.x,
                                item.y,
                                'Weapon Fragment!',
                                '#e67e22'
                            );
                            
                            // Check if we have enough fragments to upgrade
                            if (this.permanentUpgrades.weaponFragments >= 10) { // 10 fragments required
                                this.permanentUpgrades.weaponFragments = 0;
                                this.guardian.damage += 1; // Damage increase
                                this.particleSystem.createText(
                                    this.guardian.x + this.guardian.width / 2,
                                    this.guardian.y - 20,
                                    'Weapon Upgraded!',
                                    '#e67e22'
                                );
                            }
                            break;
                            
                        case 'dragon_soul':
                            this.permanentUpgrades.dragonSouls++;
                            this.particleSystem.createText(
                                item.x,
                                item.y,
                                'Dragon Soul!',
                                '#9b59b6'
                            );
                            
                            // Check if we have enough souls to upgrade
                            if (this.permanentUpgrades.dragonSouls >= 5) { // 5 souls required
                                this.permanentUpgrades.dragonSouls = 0;
                                
                                // Upgrade existing dragons
                                for (const sidekick of this.activeSidekicks) {
                                    sidekick.levelUp();
                                }
                                
                                this.particleSystem.createText(
                                    this.guardian.x + this.guardian.width / 2,
                                    this.guardian.y - 20,
                                    'Dragons Upgraded!',
                                    '#9b59b6'
                                );
                            }
                            break;
                            
                        case 'life_crystal':
                            this.permanentUpgrades.lifeCrystals++;
                            this.particleSystem.createText(
                                item.x,
                                item.y,
                                'Life Crystal!',
                                '#2ecc71'
                            );
                            
                            // Check if we have enough crystals to upgrade
                            if (this.permanentUpgrades.lifeCrystals >= 3) { // 3 crystals required
                                this.permanentUpgrades.lifeCrystals = 0;
                                
                                // Increase max lives (up to the maximum)
                                if (this.lives < 5) { // Max 5 lives
                                    this.lives++;
                                    this.particleSystem.createText(
                                        this.guardian.x + this.guardian.width / 2,
                                        this.guardian.y - 20,
                                        'Life Increased!',
                                        '#2ecc71'
                                    );
                                }
                            }
                            break;
                    }
                    
                    // Remove item
                    this.items.splice(i, 1);
                }
            }
            
            // Update powerup effects
            this.updatePowerupEffects();
            
            // Update wave timer
            this.waveTimer++;
            
            // Check if it's time for a new wave
            if (this.monsters.length === 0 && this.monstersDefeated >= this.monstersInWave) {
                this.startNewWave();
            }
            
            // Update particle system
            this.particleSystem.update();
        }
    }

    // Draw game
    draw() {
        // Clear canvas
        this.context.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        if (this.state === 'menu') {
            // Draw menu
            this.uiManager.drawMenu(this.context);
        } else if (this.state === 'playing' || this.state === 'gameover') {
            // Draw game objects
            
            // Draw items
            for (const item of this.items) {
                item.draw(this.context);
            }
            
            // Draw bullets
            for (const bullet of this.bullets) {
                bullet.draw(this.context);
            }
            
            // Draw boss bullets
            for (const bullet of this.bossBullets) {
                this.context.fillStyle = bullet.color;
                this.context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
            
            // Draw monsters
            for (const monster of this.monsters) {
                monster.draw(this.context);
            }
            
            // Draw guardian
            this.guardian.draw(this.context);
            
            // Draw sidekicks
            for (let i = 0; i < this.activeSidekicks.length; i++) {
                const sidekick = this.activeSidekicks[i];
                const position = i % 2 === 0 ? 'left' : 'right';
                sidekick.draw(this.context);
            }
            
            // Draw shield effect if active
            if (this.powerupEffects.shield.active) {
                this.drawShieldEffect();
            }
            
            // Draw particles
            this.particleSystem.draw(this.context);
            
            // Draw UI
            this.uiManager.drawUI(this.context);
            
            // Draw game over screen
            if (this.state === 'gameover') {
                this.uiManager.drawGameOver(this.context);
            }
        }
    }

    // Draw background
    drawBackground() {
        // Create a dark gradient background
        const gradient = this.context.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, this.width, this.height);
        
        // Draw scrolling stars (3 layers for parallax effect)
        const starLayers = [
            { count: 30, speed: 1, size: 1, alpha: 0.3 },
            { count: 20, speed: 2, size: 2, alpha: 0.5 },
            { count: 10, speed: 3, size: 3, alpha: 0.7 }
        ];
        
        starLayers.forEach(layer => {
            this.context.fillStyle = `rgba(255, 255, 255, ${layer.alpha})`;
            for (let i = 0; i < layer.count; i++) {
                const x = Math.sin(i * 0.5 + this.gameTime * 0.001) * this.width / 2 + this.width / 2;
                const y = (i * 20 + this.gameTime * layer.speed * 0.2) % this.height;
                
                this.context.beginPath();
                this.context.arc(x, y, layer.size, 0, Math.PI * 2);
                this.context.fill();
            }
        });
        
        // Add some nebula-like effects
        const nebulaColors = ['#4a90e2', '#50c878', '#9b59b6'];
        nebulaColors.forEach((color, index) => {
            this.context.fillStyle = color;
            this.context.globalAlpha = 0.05;
            
            for (let i = 0; i < 3; i++) {
                const x = Math.sin(this.gameTime * 0.001 + index) * this.width / 2 + this.width / 2;
                const y = (this.gameTime * 0.1 + index * 200) % this.height;
                const size = 100 + Math.sin(this.gameTime * 0.01) * 20;
                
                this.context.beginPath();
                this.context.arc(x, y, size, 0, Math.PI * 2);
                this.context.fill();
            }
        });
        
        // Reset global alpha
        this.context.globalAlpha = 1;
    }

    // Draw shield effect around guardian
    drawShieldEffect() {
        this.context.save();
        
        // Create pulsing effect
        const pulseSize = Math.sin(this.gameTime * 0.1) * 5;
        const radius = Math.max(this.guardian.width, this.guardian.height) / 2 + 10 + pulseSize;
        
        // Draw shield
        this.context.strokeStyle = '#3498db';
        this.context.lineWidth = 3;
        this.context.globalAlpha = 0.7;
        
        this.context.beginPath();
        this.context.arc(
            this.guardian.x + this.guardian.width / 2,
            this.guardian.y + this.guardian.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        this.context.stroke();
        
        // Add glow effect
        this.context.shadowColor = '#3498db';
        this.context.shadowBlur = 15;
        this.context.globalAlpha = 0.3;
        this.context.stroke();
        
        this.context.restore();
    }

    // Start a new wave of monsters
    startNewWave() {
        this.wave++;
        this.waveTimer = 0;
        this.monstersDefeated = 0;
        
        // Create new wave of monsters
        const newMonsters = MonsterFactory.createWave(this.width, this.wave);
        this.monsters.push(...newMonsters);
        this.monstersInWave = newMonsters.length;
        
        // Display wave number
        this.particleSystem.createText(
            this.width / 2,
            this.height / 2,
            `Wave ${this.wave}`,
            '#ffffff',
            30,
            60
        );
    }

    // Generate drops from destroyed monsters
    generateDrops(monster) {
        const drops = this.itemDropManager.generateDrops(monster, this.wave);
        
        if (drops.length > 0) {
            this.items.push(...drops);
        }
    }

    // Create explosion effect
    createExplosion(explosionData) {
        // Create particle effect
        this.particleSystem.createExplosion(
            explosionData.x,
            explosionData.y,
            '#f39c12', // Explosion color
            30
        );
        
        // Check for monsters in explosion radius
        for (const monster of this.monsters) {
            if (monster.active) {
                const dx = monster.x + monster.width / 2 - explosionData.x;
                const dy = monster.y + monster.height / 2 - explosionData.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < explosionData.radius) {
                    monster.takeDamage(explosionData.damage);
                    
                    // Check if monster was destroyed
                    if (!monster.active) {
                        // Generate drops
                        this.generateDrops(monster);
                        
                        // Add score
                        this.score += monster.health * 10;
                        
                        // Create particle effect
                        this.particleSystem.createExplosion(
                            monster.x + monster.width / 2,
                            monster.y + monster.height / 2,
                            monster.color,
                            15
                        );
                        
                        // Track monsters defeated
                        this.monstersDefeated++;
                    }
                }
            }
        }
    }

    // Update powerup effects
    updatePowerupEffects() {
        // Update shield effect
        if (this.powerupEffects.shield.active) {
            this.powerupEffects.shield.duration--;
            if (this.powerupEffects.shield.duration <= 0) {
                this.powerupEffects.shield.active = false;
            }
        }
        
        // Update damage boost effect
        if (this.powerupEffects.damage.active) {
            this.powerupEffects.damage.duration--;
            if (this.powerupEffects.damage.duration <= 0) {
                this.powerupEffects.damage.active = false;
                this.powerupEffects.damage.multiplier = 1;
            }
        }
        
        // Update speed boost effect
        if (this.powerupEffects.speed.active) {
            this.powerupEffects.speed.duration--;
            if (this.powerupEffects.speed.duration <= 0) {
                this.powerupEffects.speed.active = false;
                this.powerupEffects.speed.multiplier = 1;
                
                // Reset sidekick shoot intervals
                for (const sidekick of this.activeSidekicks) {
                    sidekick.shootInterval = 30; // Reset to default shoot interval
                }
            } else {
                // Apply speed boost to sidekicks
                for (const sidekick of this.activeSidekicks) {
                    sidekick.shootInterval = 30 / this.powerupEffects.speed.multiplier;
                }
            }
        }
        
        // Update coin magnet effect
        if (this.powerupEffects.coinMagnet.active) {
            this.powerupEffects.coinMagnet.duration--;
            if (this.powerupEffects.coinMagnet.duration <= 0) {
                this.powerupEffects.coinMagnet.active = false;
                this.powerupEffects.coinMagnet.radius = 0;
            }
        }
    }

    // Game over
    gameOver() {
        console.log('Game over!');
        this.state = 'gameover';
        
        // Update UI
        document.getElementById('gameUI').classList.remove('active');
        document.getElementById('gameOverScreen').classList.add('active');
        
        // Update final score and coins
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalCoins').textContent = this.coins;
        
        // Check for high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    // Load high score from local storage
    loadHighScore() {
        const savedHighScore = localStorage.getItem('everwingHighScore');
        this.highScore = savedHighScore ? parseInt(savedHighScore) : 0;
    }

    // Save high score to local storage
    saveHighScore() {
        localStorage.setItem('everwingHighScore', this.highScore.toString());
    }

    // Handle mouse movement
    handleMouseMove(x, y) {
        console.log('Game handling mouse move:', {
            x,
            y,
            state: this.state,
            guardian: this.guardian ? {
                x: this.guardian.x,
                y: this.guardian.y,
                targetX: this.guardian.targetX
            } : null
        });
        
        if (this.state === 'playing') {
            this.guardian.setTargetPosition(x);
        }
    }

    // Handle mouse click
    handleClick(x, y) {
        console.log('Game handling click:', {
            x,
            y,
            state: this.state,
            uiManager: this.uiManager ? true : false
        });
        
        if (this.state === 'menu') {
            // Check if start button was clicked
            if (this.uiManager.checkStartButtonClick(x, y)) {
                console.log('Start button area clicked');
                this.startGame();
            }
        } else if (this.state === 'gameover') {
            // Check if restart button was clicked
            if (this.uiManager.checkRestartButtonClick(x, y)) {
                console.log('Restart button area clicked');
                this.startGame();
            }
        }
    }

    // Unlock a new sidekick
    unlockSidekick(type) {
        if (this.sidekickManager.unlockSidekick(type)) {
            // Add to active sidekicks if we have room
            if (this.activeSidekicks.length < 2) { // Max 2 active sidekicks
                this.activeSidekicks.push(this.sidekickManager.getSidekick(type));
            }
            return true;
        }
        return false;
    }

    // Upgrade a sidekick
    upgradeSidekick(type) {
        return this.sidekickManager.upgradeSidekick(type);
    }

    // Get all available sidekicks
    getAvailableSidekicks() {
        return this.sidekickManager.getAvailableSidekicks();
    }

    // Get unlocked sidekicks
    getUnlockedSidekicks() {
        return this.sidekickManager.getUnlockedSidekicks();
    }

    // Check if a sidekick is unlocked
    isSidekickUnlocked(type) {
        return this.sidekickManager.isUnlocked(type);
    }

    // Get price to unlock a sidekick
    getSidekickUnlockPrice(type) {
        return this.sidekickManager.getUnlockPrice(type);
    }
} 