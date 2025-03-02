/**
 * UI Manager for the game
 */
class UIManager {
    constructor(game) {
        this.game = game;
        
        // Button dimensions
        this.buttonWidth = 200;
        this.buttonHeight = 60;
        
        // Start button position
        this.startButtonX = game.width / 2 - this.buttonWidth / 2;
        this.startButtonY = game.height / 2 + 50;
        
        // Restart button position
        this.restartButtonX = game.width / 2 - this.buttonWidth / 2;
        this.restartButtonY = game.height / 2 + 100;
    }

    // Draw the menu screen
    drawMenu(context) {
        // Draw title
        context.fillStyle = '#ffffff';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.fillText('EVERWING', this.game.width / 2, this.game.height / 3);
        
        // Draw subtitle
        context.font = '24px Arial';
        context.fillText('A Dragon Shooter Game', this.game.width / 2, this.game.height / 3 + 40);
        
        // Draw high score
        context.font = '18px Arial';
        context.fillText(`High Score: ${this.game.highScore}`, this.game.width / 2, this.game.height / 3 + 80);
        
        // Draw start button
        this.drawButton(
            context,
            this.startButtonX,
            this.startButtonY,
            this.buttonWidth,
            this.buttonHeight,
            'Start Game',
            '#27ae60'
        );
        
        // Draw instructions
        context.font = '14px Arial';
        context.fillText('Use mouse or touch to move', this.game.width / 2, this.game.height - 60);
        context.fillText('Collect coins and power-ups', this.game.width / 2, this.game.height - 40);
        context.fillText('Avoid monsters and boss attacks', this.game.width / 2, this.game.height - 20);
    }

    // Draw the in-game UI
    drawUI(context) {
        // Draw score
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.textAlign = 'left';
        context.fillText(`Score: ${this.game.score}`, 20, 30);
        
        // Draw coins
        context.fillStyle = '#f1c40f';
        context.beginPath();
        context.arc(20, 60, 10, 0, Math.PI * 2);
        context.fill();
        
        context.fillStyle = '#ffffff';
        context.textAlign = 'left';
        context.fillText(`${this.game.coins}`, 40, 68);
        
        // Draw lives
        for (let i = 0; i < this.game.lives; i++) {
            context.fillStyle = '#e74c3c';
            context.beginPath();
            context.arc(20 + i * 25, 90, 10, 0, Math.PI * 2);
            context.fill();
        }
        
        // Draw wave number
        context.fillStyle = '#ffffff';
        context.textAlign = 'right';
        context.fillText(`Wave: ${this.game.wave}`, this.game.width - 20, 30);
        
        // Draw active powerups
        let powerupY = 60;
        
        if (this.game.powerupEffects.shield.active) {
            this.drawPowerupIndicator(
                context,
                this.game.width - 30,
                powerupY,
                'Shield',
                this.game.powerupEffects.shield.duration,
                '#3498db'
            );
            powerupY += 30;
        }
        
        if (this.game.powerupEffects.damage.active) {
            this.drawPowerupIndicator(
                context,
                this.game.width - 30,
                powerupY,
                'Damage',
                this.game.powerupEffects.damage.duration,
                '#e74c3c'
            );
            powerupY += 30;
        }
        
        if (this.game.powerupEffects.speed.active) {
            this.drawPowerupIndicator(
                context,
                this.game.width - 30,
                powerupY,
                'Speed',
                this.game.powerupEffects.speed.duration,
                '#9b59b6'
            );
            powerupY += 30;
        }
        
        if (this.game.powerupEffects.coinMagnet.active) {
            this.drawPowerupIndicator(
                context,
                this.game.width - 30,
                powerupY,
                'Magnet',
                this.game.powerupEffects.coinMagnet.duration,
                '#f39c12'
            );
        }
        
        // Draw permanent upgrade progress
        this.drawUpgradeProgress(
            context,
            20,
            this.game.height - 80,
            'Weapon',
            this.game.permanentUpgrades.weaponFragments,
            100,
            '#e67e22'
        );
        
        this.drawUpgradeProgress(
            context,
            20,
            this.game.height - 50,
            'Dragon',
            this.game.permanentUpgrades.dragonSouls,
            100,
            '#9b59b6'
        );
        
        this.drawUpgradeProgress(
            context,
            20,
            this.game.height - 20,
            'Life',
            this.game.permanentUpgrades.lifeCrystals,
            100,
            '#2ecc71'
        );
    }

    // Draw the game over screen
    drawGameOver(context) {
        // Darken the screen
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, this.game.width, this.game.height);
        
        // Draw game over text
        context.fillStyle = '#ffffff';
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.fillText('GAME OVER', this.game.width / 2, this.game.height / 3);
        
        // Draw score
        context.font = '24px Arial';
        context.fillText(`Score: ${this.game.score}`, this.game.width / 2, this.game.height / 3 + 50);
        
        // Draw coins collected
        context.fillText(`Coins: ${this.game.coins}`, this.game.width / 2, this.game.height / 3 + 90);
        
        // Draw high score
        context.fillText(`High Score: ${this.game.highScore}`, this.game.width / 2, this.game.height / 3 + 130);
        
        // Draw restart button
        this.drawButton(
            context,
            this.restartButtonX,
            this.restartButtonY,
            this.buttonWidth,
            this.buttonHeight,
            'Play Again',
            '#e74c3c'
        );
    }

    // Draw a button
    drawButton(context, x, y, width, height, text, color) {
        // Draw button background
        context.fillStyle = color;
        this.drawRoundedRect(context, x, y, width, height, 10);
        
        // Draw button text
        context.fillStyle = '#ffffff';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, x + width / 2, y + height / 2);
        
        // Reset text baseline
        context.textBaseline = 'alphabetic';
    }

    // Draw a powerup indicator
    drawPowerupIndicator(context, x, y, name, duration, color) {
        // Draw icon
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, 10, 0, Math.PI * 2);
        context.fill();
        
        // Draw name
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'right';
        context.fillText(name, x - 15, y + 5);
        
        // Draw duration bar
        const maxWidth = 60;
        let maxDuration;
        
        // Set max duration based on powerup type
        switch(name.toUpperCase()) {
            case 'SHIELD':
                maxDuration = 300; // 5 seconds at 60fps
                break;
            case 'DAMAGE':
                maxDuration = 600; // 10 seconds at 60fps
                break;
            case 'DRAGON_RAGE':
                maxDuration = 300; // 5 seconds at 60fps
                break;
            case 'MAGNET':
                maxDuration = 900; // 15 seconds at 60fps
                break;
            default:
                maxDuration = 300;
        }
        
        const durationPercentage = duration / maxDuration;
        
        context.fillStyle = '#7f8c8d';
        context.fillRect(x - 80, y + 10, maxWidth, 3);
        
        context.fillStyle = color;
        context.fillRect(x - 80, y + 10, maxWidth * durationPercentage, 3);
    }

    // Draw upgrade progress
    drawUpgradeProgress(context, x, y, name, current, required, color) {
        // Draw name
        context.fillStyle = '#ffffff';
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.fillText(`${name}: ${current}/${required}`, x, y);
        
        // Draw progress bar
        const maxWidth = 100;
        const progressPercentage = current / required;
        
        context.fillStyle = '#7f8c8d';
        context.fillRect(x + 100, y - 10, maxWidth, 5);
        
        context.fillStyle = color;
        context.fillRect(x + 100, y - 10, maxWidth * progressPercentage, 5);
    }

    // Draw a rounded rectangle
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

    // Check if start button was clicked
    checkStartButtonClick(x, y) {
        console.log('Checking start button click:', {
            x, y,
            buttonBounds: {
                x: this.startButtonX,
                y: this.startButtonY,
                width: this.buttonWidth,
                height: this.buttonHeight
            }
        });
        
        return (
            x >= this.startButtonX &&
            x <= this.startButtonX + this.buttonWidth &&
            y >= this.startButtonY &&
            y <= this.startButtonY + this.buttonHeight
        );
    }

    // Check if restart button was clicked
    checkRestartButtonClick(x, y) {
        console.log('Checking restart button click:', {
            x, y,
            buttonBounds: {
                x: this.restartButtonX,
                y: this.restartButtonY,
                width: this.buttonWidth,
                height: this.buttonHeight
            }
        });
        
        return (
            x >= this.restartButtonX &&
            x <= this.restartButtonX + this.buttonWidth &&
            y >= this.restartButtonY &&
            y <= this.restartButtonY + this.buttonHeight
        );
    }
} 