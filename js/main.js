/**
 * Main entry point for the game
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Setup canvas
    const canvas = document.getElementById('gameCanvas');
    const container = document.querySelector('.game-container');
    
    // Set canvas size to match container
    function resizeCanvas() {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        
        // Get the computed style to account for any CSS scaling
        const computedStyle = window.getComputedStyle(container);
        const containerWidth = parseInt(computedStyle.width);
        const containerHeight = parseInt(computedStyle.height);
        
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        console.log('Canvas resized:', {
            container: {
                width: containerWidth,
                height: containerHeight,
                computedStyle: {
                    width: computedStyle.width,
                    height: computedStyle.height
                }
            },
            canvas: {
                oldWidth,
                oldHeight,
                newWidth: canvas.width,
                newHeight: canvas.height,
                style: {
                    width: canvas.style.width,
                    height: canvas.style.height
                }
            }
        });
    }
    
    // Initial resize
    resizeCanvas();
    
    // Resize canvas when window size changes
    window.addEventListener('resize', () => {
        console.log('Window resize event');
        resizeCanvas();
    });
    
    // Show the loading screen first
    document.getElementById('startScreen').classList.add('active');
    document.getElementById('gameUI').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('active');
    
    // Create placeholders for missing assets
    createPlaceholderAssets();
    
    // Create and start the game
    const game = new Game(canvas);
    
    // For debugging purposes - make game accessible globally
    window.game = game;
    
    // Add event listeners for game controls
    canvas.addEventListener('mousemove', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Raw mousemove event:', {
            clientX: e.clientX,
            clientY: e.clientY,
            target: e.target.id
        });
        
        const rect = canvas.getBoundingClientRect();
        console.log('Canvas rect:', rect);
        
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        
        console.log('Calculated position:', { x, y, state: game.state });
        game.handleMouseMove(x, y);
    }, { capture: true });
    
    canvas.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Raw click event:', {
            clientX: e.clientX,
            clientY: e.clientY,
            target: e.target.id
        });
        
        const rect = canvas.getBoundingClientRect();
        console.log('Canvas rect:', rect);
        
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        
        console.log('Calculated position:', { x, y, state: game.state });
        game.handleClick(x, y);
    }, { capture: true });
    
    // Add button click handlers with debugging
    document.getElementById('startButton').addEventListener('click', function(e) {
        console.log('Start button clicked');
        e.preventDefault();
        e.stopPropagation();
        game.startGame();
    }, { capture: true });
    
    document.getElementById('restartButton').addEventListener('click', function(e) {
        console.log('Restart button clicked');
        e.preventDefault();
        e.stopPropagation();
        game.startGame();
    }, { capture: true });
    
    // Game loop
    function gameLoop() {
        game.update();
        game.draw();
        requestAnimationFrame(gameLoop);
    }
    
    // Start the game loop
    gameLoop();
    
    // Add touch event logging for debugging
    document.addEventListener('touchstart', (e) => {
        // Prevent default only for canvas touches
        if (e.target === canvas) {
            e.preventDefault();
            
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
            const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
            
            console.log('Touch start:', { x, y, state: game.state });
            game.handleClick(x, y);
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        // Prevent default only for canvas touches
        if (e.target === canvas) {
            e.preventDefault();
            
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
            const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
            
            console.log('Touch move:', { x, y, state: game.state });
            game.handleMouseMove(x, y);
        }
    }, { passive: false });
});

// Create placeholder assets since we don't have real image assets
function createPlaceholderAssets() {
    // Create assets directory if it doesn't exist
    if (!window.ASSETS) {
        window.ASSETS = new AssetsManager();
    }
    
    // Instead of loading actual images, we'll just create stub objects
    // In a real game, you would replace this with actual asset loading
    const assetTypes = [
        'guardian', 'dragon_blue', 'dragon_red', 'dragon_green',
        'monster_blue', 'monster_green', 'monster_red', 'monster_purple',
        'boss', 'bullet', 'dragon_bullet', 'coin'
    ];
    
    // Create placeholder images
    for (const type of assetTypes) {
        ASSETS.images[type] = {
            width: 50,
            height: 50
        };
    }
    
    // Create placeholder sounds
    const soundTypes = ['shoot', 'explosion', 'coin_pickup', 'game_over'];
    
    for (const type of soundTypes) {
        ASSETS.sounds[type] = {
            play: function() { /* No sound in placeholder */ },
            cloneNode: function() { return this; }
        };
    }
    
    // Simulate asset loading completion
    setTimeout(() => {
        if (ASSETS.onComplete) {
            ASSETS.onComplete();
        }
    }, 100);
} 