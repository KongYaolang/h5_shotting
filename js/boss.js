/**
 * Boss class for the game
 */
class Boss {
    constructor(x, y, level = 1) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.width = 150;
        this.height = 150;
        this.health = 20 + (level * 10);
        this.maxHealth = this.health;
        this.speed = 0.5;
        this.active = true;
        this.value = 500 + (level * 100); // Boss coin value
        
        // Boss movement pattern
        this.movementPattern = 'sine';
        this.movementTimer = 0;
        this.movementAmplitude = 100;
        this.movementSpeed = 0.02;
        this.originX = x;
        
        // Attack pattern
        this.attackTimer = 0;
        this.attackInterval = 150;  // Attack every 2.5 seconds (at 60fps)
    }

    // Update boss position and behavior
    update(canvasWidth) {
        // Movement based on pattern
        this.movementTimer++;
        
        switch(this.movementPattern) {
            case 'sine':
                this.x = this.originX + Math.sin(this.movementTimer * this.movementSpeed) * this.movementAmplitude;
                break;
                
            case 'zigzag':
                if (this.movementTimer % 120 < 60) {
                    this.x += this.speed * 2;
                } else {
                    this.x -= this.speed * 2;
                }
                break;
                
            case 'circle':
                this.x = this.originX + Math.cos(this.movementTimer * this.movementSpeed) * this.movementAmplitude;
                this.y += Math.sin(this.movementTimer * this.movementSpeed) * 0.5;
                break;
        }
        
        // Keep boss within screen bounds
        if (this.x < 0) this.x = 0;
        if (this.x > canvasWidth - this.width) this.x = canvasWidth - this.width;
        
        // Move downward slowly
        this.y += this.speed * 0.5;
        
        // Deactivate if boss goes off screen
        if (this.y > 600) {
            this.active = false;
        }
        
        // Attack logic
        this.attackTimer++;
        return this.checkAttack();
    }

    // Check if boss should attack
    checkAttack() {
        if (this.attackTimer >= this.attackInterval) {
            this.attackTimer = 0;
            return true; // Boss is attacking
        }
        return false;
    }

    // Generate boss attack
    attack() {
        // Boss attacks by spawning mini-monsters
        const miniMonsters = [];
        
        // Spawn 3 mini monsters
        for (let i = 0; i < 3; i++) {
            const x = this.x + 50 + (i * 25);
            const y = this.y + this.height;
            
            const types = ['blue', 'green', 'red', 'purple'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            const miniMonster = new Monster(x, y, type, 1);
            miniMonster.width = 30;
            miniMonster.height = 30;
            miniMonster.speed = 2;
            
            miniMonsters.push(miniMonster);
        }
        
        return miniMonsters;
    }

    // Draw the boss
    draw(context) {
        if (!this.active) return;
        
        // Draw boss body
        context.fillStyle = '#8e44ad'; // Purple color for boss
        context.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw boss crown
        context.fillStyle = '#f1c40f'; // Gold color
        context.beginPath();
        context.moveTo(this.x + 50, this.y);
        context.lineTo(this.x + 30, this.y - 20);
        context.lineTo(this.x + 70, this.y - 20);
        context.lineTo(this.x + 90, this.y);
        context.fill();
        
        // Draw boss eyes
        context.fillStyle = '#ecf0f1';
        context.fillRect(this.x + 30, this.y + 40, 25, 25);
        context.fillRect(this.x + 95, this.y + 40, 25, 25);
        
        context.fillStyle = '#c0392b';
        context.fillRect(this.x + 40, this.y + 50, 10, 10);
        context.fillRect(this.x + 105, this.y + 50, 10, 10);
        
        // Draw boss mouth
        context.fillStyle = '#e74c3c';
        context.beginPath();
        context.arc(this.x + 75, this.y + 100, 40, 0, Math.PI, false);
        context.fill();
        
        // Draw boss teeth
        context.fillStyle = '#ecf0f1';
        for (let i = 0; i < 5; i++) {
            context.fillRect(this.x + 45 + (i * 15), this.y + 100, 10, 15);
        }
        
        // Draw health bar
        const healthPercentage = this.health / this.maxHealth;
        context.fillStyle = '#c0392b'; // Red background
        context.fillRect(this.x, this.y - 20, this.width, 10);
        context.fillStyle = '#27ae60'; // Green health
        context.fillRect(this.x, this.y - 20, this.width * healthPercentage, 10);
    }

    // Take damage
    takeDamage(amount) {
        this.health -= amount;
        
        // Change movement pattern based on health percentage
        const healthPercentage = this.health / this.maxHealth;
        
        if (healthPercentage < 0.3) {
            this.movementPattern = 'zigzag';
            this.speed = 1.5;
            this.attackInterval = 90; // Attack more frequently
        } else if (healthPercentage < 0.6) {
            this.movementPattern = 'circle';
            this.speed = 1;
            this.attackInterval = 120;
        }
        
        if (this.health <= 0) {
            this.active = false;
            return true; // Boss died
        }
        return false; // Boss still alive
    }
} 