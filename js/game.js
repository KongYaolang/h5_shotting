/**
 * Main Game class
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Initialize managers
        this.particleSystem = new ParticleSystem();
        this.sidekickManager = new SidekickManager();
        this.itemDropManager = new ItemDropManager();
        this.uiManager = new UIManager(this);
        
        // Game state
        this.state = 'menu'; // menu, playing, gameover
        
        // Load saved data
        this.loadSavedData();
        
        // Initialize game
        this.resetGame();
        
        // Load high score from local storage
        this.loadHighScore();
    }

    // Save permanent upgrades to localStorage
    savePermanentUpgrades() {
        // Make sure we have valid data before saving
        if (!this.permanentUpgrades) {
            console.error('Attempting to save invalid permanent upgrades');
            return;
        }
        
        const saveData = {
            permanentUpgrades: {
                weaponFragments: this.permanentUpgrades.weaponFragments || 0,
                dragonSouls: this.permanentUpgrades.dragonSouls || 0,
                lifeCrystals: this.permanentUpgrades.lifeCrystals || 0
            },
            guardianDamage: this.guardian ? this.guardian.damage : 1,
            sidekickLevels: this.activeSidekicks.map(sidekick => ({
                type: sidekick.type,
                level: sidekick.level,
                experience: sidekick.experience
            }))
        };
        
        console.log('Saving game data:', saveData);
        localStorage.setItem('everwingPermanentUpgrades', JSON.stringify(saveData));
    }

    // Load saved data from localStorage
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('everwingPermanentUpgrades');
            if (savedData) {
                const data = JSON.parse(savedData);
                console.log('Loading saved data:', data);
                
                // Ensure we have valid permanent upgrades data
                this.savedPermanentUpgrades = {
                    weaponFragments: data.permanentUpgrades?.weaponFragments || 0,
                    dragonSouls: data.permanentUpgrades?.dragonSouls || 0,
                    lifeCrystals: data.permanentUpgrades?.lifeCrystals || 0
                };
                
                // Restore guardian damage
                this.savedGuardianDamage = data.guardianDamage || 1;
                
                // Restore sidekick data
                this.savedSidekickData = data.sidekickLevels || [];
                
                console.log('Loaded permanent upgrades:', this.savedPermanentUpgrades);
                console.log('Loaded guardian damage:', this.savedGuardianDamage);
                console.log('Loaded sidekick data:', this.savedSidekickData);
            } else {
                // Initialize with default values if no saved data exists
                this.savedPermanentUpgrades = {
                    weaponFragments: 0,
                    dragonSouls: 0,
                    lifeCrystals: 0
                };
                this.savedGuardianDamage = 1;
                this.savedSidekickData = [];
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
            // Initialize with default values if there's an error
            this.savedPermanentUpgrades = {
                weaponFragments: 0,
                dragonSouls: 0,
                lifeCrystals: 0
            };
            this.savedGuardianDamage = 1;
            this.savedSidekickData = [];
        }
    }

    // Reset game state
    resetGame() {
        // Load saved data first to ensure we have the latest values
        this.loadSavedData();
        
        // Guardian (player) - with saved damage
        this.guardian = new Guardian(this.width / 2 - 30, this.height - 100);
        this.guardian.damage = this.savedGuardianDamage;
        
        // Game objects
        this.bullets = [];
        this.monsters = [];
        this.bossBullets = [];
        this.items = [];
        this.activeSidekicks = [];
        
        // Restore sidekicks with their levels and experience
        if (this.savedSidekickData && this.savedSidekickData.length > 0) {
            for (const sidekickData of this.savedSidekickData) {
                const sidekick = this.sidekickManager.getSidekick(sidekickData.type);
                sidekick.level = sidekickData.level;
                sidekick.experience = sidekickData.experience;
                this.activeSidekicks.push(sidekick);
            }
        } else {
            // Add default sidekick (blue dragon)
            this.activeSidekicks.push(this.sidekickManager.getSidekick('blue'));
        }
        
        // Game state
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.wave = 0;
        this.waveTimer = 0;
        this.gameTime = 0;
        
        // Powerup effects
        this.powerupEffects = {
            shield: { active: false, duration: 0 },
            damage: { active: false, duration: 0, multiplier: 1 },
            dragonRage: { active: false, duration: 0, multiplier: 1 },
            coinMagnet: { active: false, duration: 0, radius: 0 }
        };
        
        // Load permanent upgrades from saved data
        this.permanentUpgrades = { ...this.savedPermanentUpgrades };
        
        // Wave tracking
        this.monstersInWave = 0;
        this.monstersDefeated = 0;
        
        console.log('Game reset with permanent upgrades:', this.permanentUpgrades);
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
        
        // Start first wave
        this.startNewWave();
        
        console.log('Game started!');
    }

    // Update game state
    update() {
        // Update game time
        this.gameTime++;
        
        if (this.state === 'playing') {
            // Save progress periodically (every 5 seconds)
            if (this.gameTime % 300 === 0) {
                this.savePermanentUpgrades();
            }
            
            // Debug logs for monster tracking
            if (this.gameTime % 60 === 0) { // Log every second
                console.log(`Current state - Wave: ${this.wave}, Monsters alive: ${this.monsters.length}, Defeated: ${this.monstersDefeated}/${this.monstersInWave}`);
            }
            
            // Check if we should start a new wave
            if (this.monsters.length === 0 && this.monstersDefeated >= this.monstersInWave) {
                console.log(`Wave ${this.wave} completed. Monsters defeated: ${this.monstersDefeated}/${this.monstersInWave}`);
                this.startNewWave();
            }
            
            // Update guardian
            this.guardian.update(this.width);
            
            // Check if guardian should shoot
            if (this.guardian.checkShoot()) {
                const newBullets = this.guardian.shoot();
                this.bullets.push(...newBullets);
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
                            
                            // Award experience to sidekicks based on monster type
                            this.awardSidekickExperience(monster);
                            
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
                // Pass guardian position to boss monsters
                if (monster.type === 'boss') {
                    monster.update(this.guardian.x + this.guardian.width / 2);
                } else {
                    monster.update();
                }
                
                // Check if monster is at bottom of screen
                if (monster.isAtBottom(this.height)) {
                    // Only remove non-boss monsters when they reach the bottom
                    if (monster.type !== 'boss') {
                        // Track monsters defeated
                        this.monstersDefeated++;
                        // Remove monster
                        this.monsters.splice(i, 1);
                    }
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
                        
                        // Track monsters defeated and generate drops
                        this.monstersDefeated++;
                        this.generateDrops(monster);
                        
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
                    // Pass guardian position for targeted attacks
                    const bossBullets = monster.createAttack(
                        this.guardian.x + this.guardian.width / 2,
                        this.guardian.y + this.guardian.height / 2
                    );
                    this.bossBullets.push(...bossBullets);
                }
            }
            
            // Update boss bullets
            for (let i = this.bossBullets.length - 1; i >= 0; i--) {
                const bullet = this.bossBullets[i];
                
                // Update position
                bullet.x += Math.sin(bullet.angle) * bullet.speed;
                bullet.y += Math.cos(bullet.angle) * bullet.speed;
                
                // Add trail effect to boss bullets based on pattern
                const trailChance = bullet.pattern === 'targeted' ? 0.6 : 0.3;
                const trailColor = bullet.pattern === 'targeted' ? 'rgba(231, 76, 60, 0.7)' : 'rgba(231, 76, 60, 0.5)';
                const particleCount = bullet.pattern === 'targeted' ? 3 : 2;
                
                if (Math.random() < trailChance) {
                    this.particleSystem.createTrail(
                        bullet.x + bullet.width / 2,
                        bullet.y + bullet.height / 2,
                        bullet.angle,
                        {
                            color: trailColor,
                            particleCount: particleCount,
                            minSize: 1,
                            maxSize: 3,
                            lifetime: bullet.pattern === 'targeted' ? 15 : 10
                        }
                    );
                }
                
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
                        // Create explosion effect before game over
                        this.particleSystem.createExplosion(
                            bullet.x + bullet.width / 2,
                            bullet.y + bullet.height / 2,
                            '#e74c3c', // Red explosion
                            25
                        );
                        
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
                            
                        case 'temp_powerup':
                            // Handle temporary powerups
                            switch(item.value) {
                                case 'shield':
                                    this.powerupEffects.shield.active = true;
                                    this.powerupEffects.shield.duration = 600; // 10 seconds at 60fps
                                    this.particleSystem.createText(
                                        item.x,
                                        item.y,
                                        '无敌护盾! 10秒',
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
                                        '子弹强化! 10秒',
                                        '#e74c3c'
                                    );
                                    break;
                                    
                                case 'dragon_rage':
                                    this.powerupEffects.dragonRage.active = true;
                                    this.powerupEffects.dragonRage.duration = 1200; // 5 seconds at 60fps
                                    this.powerupEffects.dragonRage.multiplier = 1.5; // 50% speed increase
                                    this.particleSystem.createText(
                                        item.x,
                                        item.y,
                                        '龙怒! 20秒',
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
                                        '金币磁铁! 15秒',
                                        '#f39c12'
                                    );
                                    break;
                            }
                            break;
                            
                        case 'perm_upgrade':
                            // Handle permanent upgrades
                            this.handlePermanentUpgrade(item);
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
                // Draw glow effect based on bullet pattern
                this.context.save();
                
                // Different visual effects based on bullet pattern
                if (bullet.pattern === 'targeted') {
                    // Targeted bullets have stronger glow and pulsing effect
                    const pulseSize = Math.sin(this.gameTime * 0.2) * 2;
                    this.context.shadowBlur = 15 + pulseSize;
                    this.context.shadowColor = '#ff3333';
                    this.context.fillStyle = '#ff3333';
                    
                    // Draw larger bullet with trail
                    this.context.beginPath();
                    this.context.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 
                                bullet.width / 2 + 2, 0, Math.PI * 2);
                    this.context.fill();
                } else if (bullet.pattern === 'circular') {
                    // Circular pattern bullets have blue-purple glow
                    this.context.shadowBlur = 12;
                    this.context.shadowColor = '#9b59b6';
                    this.context.fillStyle = '#9b59b6';
                    
                    // Draw bullet with slight rotation effect
                    this.context.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
                    this.context.rotate(this.gameTime * 0.01);
                    this.context.beginPath();
                    this.context.arc(0, 0, bullet.width / 2, 0, Math.PI * 2);
                    this.context.fill();
                } else {
                    // Standard bullets
                    this.context.shadowBlur = 10;
                    this.context.shadowColor = bullet.color;
                    this.context.fillStyle = bullet.color;
                    this.context.beginPath();
                    this.context.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 
                                bullet.width / 2, 0, Math.PI * 2);
                    this.context.fill();
                }
                
                this.context.restore();
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
        
        // 创建脉冲效果
        const pulseSize = Math.sin(this.gameTime * 0.1) * 5;
        const radius = Math.max(this.guardian.width, this.guardian.height) / 2 + 15 + pulseSize;
        
        // 绘制外圈防护罩
        this.context.strokeStyle = '#3498db';
        this.context.lineWidth = 3;
        this.context.globalAlpha = 0.7;
        
        // 旋转的防护罩效果
        const segments = 8;
        const rotationSpeed = this.gameTime * 0.02;
        
        for (let i = 0; i < segments; i++) {
            const startAngle = (i / segments) * Math.PI * 2 + rotationSpeed;
            const endAngle = ((i + 0.7) / segments) * Math.PI * 2 + rotationSpeed;
            
            this.context.beginPath();
            this.context.arc(
                this.guardian.x + this.guardian.width / 2,
                this.guardian.y + this.guardian.height / 2,
                radius,
                startAngle,
                endAngle
            );
            this.context.stroke();
        }
        
        // 添加内圈发光效果
        this.context.shadowColor = '#3498db';
        this.context.shadowBlur = 15;
        this.context.globalAlpha = 0.3;
        
        this.context.beginPath();
        this.context.arc(
            this.guardian.x + this.guardian.width / 2,
            this.guardian.y + this.guardian.height / 2,
            radius - 5,
            0,
            Math.PI * 2
        );
        this.context.stroke();
        
        this.context.restore();
    }

    // Start a new wave of monsters
    startNewWave() {
        this.wave++;
        this.waveTimer = 0;
        this.monstersDefeated = 0;
        
        console.log(`[Wave Start] Starting Wave ${this.wave}`);
        
        // Create new wave of monsters
        const newMonsters = MonsterFactory.createWave(this.width, this.wave);
        console.log(`[Wave Creation] Created ${newMonsters.length} monsters for wave ${this.wave}`);
        
        this.monsters.push(...newMonsters);
        this.monstersInWave = newMonsters.length;
        
        // Reset wave tracking
        this.itemDropManager.resetWaveTracking();
        
        // Display wave number
        this.particleSystem.createText(
            this.width / 2,
            this.height / 2,
            `Wave ${this.wave}`,
            '#ffffff',
            30,
            60
        );
        
        console.log(`[Wave Setup] Wave ${this.wave} initialized with ${this.monstersInWave} monsters`);
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
                        
                        // Award experience to sidekicks based on monster type
                        this.awardSidekickExperience(monster);
                        
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
            
            // 当防护罩激活时，只加速非Boss怪物
            for (const monster of this.monsters) {
                if (monster.type !== 'boss') {  // 使用更直接的方式检查是否为BOSS
                    monster.setSpeedMultiplier(1.0);  // 增加50%速度
                } else {
                    monster.setSpeedMultiplier(1.0);  // 确保BOSS保持正常速度
                }
            }
            
            if (this.powerupEffects.shield.duration <= 0) {
                this.powerupEffects.shield.active = false;
                // 防护罩结束时，恢复所有怪物速度
                for (const monster of this.monsters) {
                    monster.setSpeedMultiplier(1.0);
                }
            }
            
            // 每隔一段时间创建防护罩粒子效果
            if (this.gameTime % 5 === 0) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 40;
                const x = this.guardian.x + this.guardian.width / 2 + Math.cos(angle) * radius;
                const y = this.guardian.y + this.guardian.height / 2 + Math.sin(angle) * radius;
                
                this.particleSystem.createExplosion(
                    x,
                    y,
                    '#3498db',  // 蓝色
                    5  // 较少的粒子数量
                );
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
        
        // Update dragon rage effect
        if (this.powerupEffects.dragonRage.active) {
            this.powerupEffects.dragonRage.duration--;
            if (this.powerupEffects.dragonRage.duration <= 0) {
                this.powerupEffects.dragonRage.active = false;
                this.powerupEffects.dragonRage.multiplier = 1;
                
                // Reset sidekick shoot intervals
                for (const sidekick of this.activeSidekicks) {
                    sidekick.shootInterval = 30; // Reset to default
                }
            } else {
                // Apply dragon rage to sidekicks
                for (const sidekick of this.activeSidekicks) {
                    sidekick.shootInterval = 30 / this.powerupEffects.dragonRage.multiplier;
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

    // Handle permanent upgrade collection
    handlePermanentUpgrade(item) {
        switch(item.value) {
            case 'weapon_fragment':
                console.log('[武器碎片] 当前状态:', {
                    当前碎片数: this.permanentUpgrades.weaponFragments,
                    守护者伤害: this.guardian.damage
                });
                
                // 增加碎片数量
                this.permanentUpgrades.weaponFragments++;
                console.log('[武器碎片] 收集后:', {
                    碎片数: this.permanentUpgrades.weaponFragments,
                    是否达到升级条件: this.permanentUpgrades.weaponFragments >= 10
                });
                
                // 显示收集提示
                this.particleSystem.createText(
                    item.x,
                    item.y,
                    `武器碎片! ${this.permanentUpgrades.weaponFragments}/10`,
                    '#e67e22'
                );
                
                // 检查是否达到升级条件
                if (this.permanentUpgrades.weaponFragments >= 10) {
                    console.log('[武器碎片] 开始升级武器');
                    try {
                        // 重置碎片数量并升级武器
                        this.permanentUpgrades.weaponFragments = 0;
                        console.log('[武器碎片] 升级前守护者状态:', {
                            伤害: this.guardian.damage,
                            位置: { x: this.guardian.x, y: this.guardian.y }
                        });
                        
                        this.guardian.upgradeDamage(this.particleSystem);
                        
                        console.log('[武器碎片] 升级后状态:', {
                            碎片数: this.permanentUpgrades.weaponFragments,
                            新伤害: this.guardian.damage
                        });
                    } catch (error) {
                        console.error('[武器碎片] 升级过程出错:', error);
                    }
                }
                break;
                
            case 'dragon_soul':
                this.permanentUpgrades.dragonSouls++;
                this.particleSystem.createText(
                    item.x,
                    item.y,
                    `龙魂! ${this.permanentUpgrades.dragonSouls}/5`,
                    '#9b59b6'
                );
                
                // 检查是否有足够的龙魂升级
                if (this.permanentUpgrades.dragonSouls >= 5) {
                    this.permanentUpgrades.dragonSouls = 0;
                    
                    // 如果有空位，解锁新龙
                    if (this.activeSidekicks.length < 2) {
                        // 获取所有可用但未解锁的龙
                        const availableDragons = this.sidekickManager.getAvailableSidekicks()
                            .filter(type => !this.sidekickManager.isUnlocked(type));
                        
                        if (availableDragons.length > 0) {
                            // 随机选择一个新龙解锁
                            const newDragonType = availableDragons[Math.floor(Math.random() * availableDragons.length)];
                            if (this.unlockSidekick(newDragonType)) {
                                this.particleSystem.createText(
                                    this.guardian.x + this.guardian.width / 2,
                                    this.guardian.y - 20,
                                    `解锁新龙助手!`,
                                    '#9b59b6',
                                    20,
                                    90
                                );
                            }
                        }
                    } else {
                        // 如果没有空位，提升现有龙的攻击力
                        for (const sidekick of this.activeSidekicks) {
                            sidekick.damage *= 1.1; // 提升10%攻击力
                            this.particleSystem.createText(
                                sidekick.x + sidekick.width / 2,
                                sidekick.y - 20,
                                `龙之力提升10%!`,
                                sidekick.color,
                                16,
                                60
                            );
                        }
                    }
                }
                break;
                
            case 'life_crystal':
                this.permanentUpgrades.lifeCrystals++;
                this.particleSystem.createText(
                    item.x,
                    item.y,
                    `生命水晶! ${this.permanentUpgrades.lifeCrystals}/5`,
                    '#2ecc71'
                );
                
                // Check if we have enough crystals to upgrade
                if (this.permanentUpgrades.lifeCrystals >= 5) {
                    this.permanentUpgrades.lifeCrystals = 0;
                    
                    // Increase max lives (up to the maximum)
                    if (this.lives < 5) {
                        this.lives++;
                        this.particleSystem.createText(
                            this.guardian.x + this.guardian.width / 2,
                            this.guardian.y - 20,
                            '生命值增加!',
                            '#2ecc71'
                        );
                    }
                }
                break;
        }
        
        // 确保在状态改变后立即保存
        try {
            this.savePermanentUpgrades();
        } catch (error) {
            console.error('Error saving permanent upgrades:', error);
        }
    }

    // Game over
    gameOver() {
        console.log('Game over! Saving final state...');
        
        // Save permanent upgrades before changing state
        this.savePermanentUpgrades();
        
        // Change state after saving
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
       
        if (this.state === 'playing') {
            this.guardian.setTargetPosition(x);
        }
    }

    // Handle mouse click
    handleClick(x, y) {
        
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

    // Award experience to sidekicks based on monster type
    awardSidekickExperience(monster) {
        let expAmount = 0;
        switch(monster.type) {
            case 'boss':
                expAmount = 50;
                break;
            case 'elite':
                expAmount = 15;
                break;
            case 'minion':
                expAmount = 3;
                break;
            default: // normal
                expAmount = 5;
        }
        
        // Scale experience with wave number
        expAmount = Math.floor(expAmount * (1 + Math.floor(this.wave / 10) * 0.2));
        
        // Award experience to all active sidekicks
        for (const sidekick of this.activeSidekicks) {
            const leveledUp = sidekick.addExperience(expAmount);
            if (leveledUp) {
                // Display level up message
                this.particleSystem.createText(
                    sidekick.x + sidekick.width / 2,
                    sidekick.y - 20,
                    `龙升级! Lv${sidekick.level}`,
                    sidekick.color,
                    16,
                    60
                );
                // Save progress when dragon levels up
                this.savePermanentUpgrades();
            }
        }
    }

    // Clear all game data from localStorage
    clearAllGameData() {
        console.log('Clearing all game data...');
        try {
            // Clear permanent upgrades
            localStorage.removeItem('everwingPermanentUpgrades');
            // Clear high score
            localStorage.removeItem('everwingHighScore');
            console.log('All game data cleared successfully');
            
            // Reset game state
            this.loadSavedData();
            this.resetGame();
        } catch (error) {
            console.error('Error clearing game data:', error);
        }
    }
} 