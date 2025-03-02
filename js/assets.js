/**
 * Game assets manager
 */
class AssetsManager {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.onProgress = null;
        this.onComplete = null;
    }

    // Load an image
    loadImage(name, src) {
        this.totalAssets++;
        
        const img = new Image();
        img.src = src;
        
        img.onload = () => {
            this.images[name] = img;
            this.loadedAssets++;
            this._checkProgress();
        };
        
        img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            this.loadedAssets++;
            this._checkProgress();
        };
    }

    // Load a sound
    loadSound(name, src) {
        this.totalAssets++;
        
        const sound = new Audio();
        sound.src = src;
        
        sound.oncanplaythrough = () => {
            this.sounds[name] = sound;
            this.loadedAssets++;
            this._checkProgress();
            // Remove event listener to avoid potential memory leak
            sound.oncanplaythrough = null;
        };
        
        sound.onerror = () => {
            console.error(`Failed to load sound: ${src}`);
            this.loadedAssets++;
            this._checkProgress();
        };
    }

    // Play a sound
    playSound(name, loop = false) {
        if (this.sounds[name]) {
            const sound = this.sounds[name].cloneNode();
            sound.loop = loop;
            sound.play();
            return sound;
        }
        return null;
    }

    // Get an image
    getImage(name) {
        return this.images[name];
    }

    // Set progress callback
    setProgressCallback(callback) {
        this.onProgress = callback;
    }

    // Set completion callback
    setCompletionCallback(callback) {
        this.onComplete = callback;
    }

    // Check loading progress
    _checkProgress() {
        const progress = this.loadedAssets / this.totalAssets;
        
        if (this.onProgress) {
            this.onProgress(progress);
        }
        
        if (this.loadedAssets === this.totalAssets && this.onComplete) {
            this.onComplete();
        }
    }

    // Initialize default assets
    initDefaultAssets() {
        // Character
        this.loadImage('guardian', 'assets/guardian.png');
        
        // Sidekicks
        this.loadImage('dragon_blue', 'assets/dragon_blue.png');
        this.loadImage('dragon_red', 'assets/dragon_red.png');
        this.loadImage('dragon_green', 'assets/dragon_green.png');
        
        // Monsters
        this.loadImage('monster_blue', 'assets/monster_blue.png');
        this.loadImage('monster_green', 'assets/monster_green.png');
        this.loadImage('monster_red', 'assets/monster_red.png');
        this.loadImage('monster_purple', 'assets/monster_purple.png');
        
        // Boss
        this.loadImage('boss', 'assets/boss.png');
        
        // Projectiles
        this.loadImage('bullet', 'assets/bullet.png');
        this.loadImage('dragon_bullet', 'assets/dragon_bullet.png');
        
        // Items
        this.loadImage('coin', 'assets/coin.png');
        
        // Sounds
        this.loadSound('shoot', 'assets/shoot.mp3');
        this.loadSound('explosion', 'assets/explosion.mp3');
        this.loadSound('coin_pickup', 'assets/coin_pickup.mp3');
        this.loadSound('game_over', 'assets/game_over.mp3');
    }
}

// Create a global assets manager instance
const ASSETS = new AssetsManager(); 