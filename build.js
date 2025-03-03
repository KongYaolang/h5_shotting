const fs = require('fs');
const path = require('path');
const terser = require('terser');
const CleanCSS = require('clean-css');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');

// JavaScript files to be combined and minified
const jsFiles = [
    'js/utils.js',
    'js/assets.js',
    'js/particles.js',
    'js/bullet.js',
    'js/item.js',
    'js/monster.js',
    'js/boss.js',
    'js/sidekick.js',
    'js/guardian.js',
    'js/ui.js',
    'js/game.js',
    'js/main.js'
];

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
    fs.mkdirSync('dist/js');
    fs.mkdirSync('dist/css');
    fs.mkdirSync('dist/assets');
}

// Minify JavaScript
async function minifyJS() {
    console.log('Minifying JavaScript...');
    const code = {};
    
    for (const file of jsFiles) {
        code[file] = fs.readFileSync(file, 'utf8');
    }
    
    const minified = await terser.minify(code, {
        compress: {
            dead_code: true,
            drop_console: true,
            drop_debugger: true
        },
        mangle: true
    });
    
    fs.writeFileSync('dist/js/game.min.js', minified.code);
    console.log('JavaScript minification complete');
}

// Minify CSS
function minifyCSS() {
    console.log('Minifying CSS...');
    const css = fs.readFileSync('styles.css', 'utf8');
    const minified = new CleanCSS().minify(css);
    fs.writeFileSync('dist/css/styles.min.css', minified.styles);
    console.log('CSS minification complete');
}

// Optimize images
async function optimizeImages() {
    console.log('Optimizing images...');
    
    // Optimize PNG images
    await imagemin(['assets/images/*.png'], {
        destination: 'dist/assets/images',
        plugins: [
            imageminPngquant({
                quality: [0.6, 0.8]
            })
        ]
    });
    
    // Convert to WebP
    await imagemin(['assets/images/*.png'], {
        destination: 'dist/assets/images',
        plugins: [
            imageminWebp({
                quality: 75
            })
        ]
    });
    
    console.log('Image optimization complete');
}

// Copy and update index.html
function updateHTML() {
    console.log('Updating HTML...');
    let html = fs.readFileSync('index.html', 'utf8');
    
    // Update CSS link
    html = html.replace(
        '<link rel="stylesheet" href="styles.css">',
        '<link rel="stylesheet" href="css/styles.min.css">'
    );
    
    // Update JS scripts
    const scriptRegex = /<script src="js\/.*?.js"><\/script>/g;
    html = html.replace(scriptRegex, '');
    
    // Add minified JS
    html = html.replace(
        '</body>',
        '    <script src="js/game.min.js"></script>\n</body>'
    );
    
    // Add meta tags for SEO
    html = html.replace(
        '<head>',
        `<head>
    <meta name="description" content="EverWing - An exciting shoot 'em up game">
    <meta name="keywords" content="game, shooting game, HTML5 game">
    <meta property="og:title" content="EverWing">
    <meta property="og:description" content="Play EverWing - An exciting shoot 'em up game">
    <meta property="og:type" content="website">`
    );
    
    fs.writeFileSync('dist/index.html', html);
    console.log('HTML update complete');
}

// Run build process
async function build() {
    try {
        await minifyJS();
        minifyCSS();
        await optimizeImages();
        updateHTML();
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
    }
}

build(); 