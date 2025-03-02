// Particle System for visual effects
class Particle {
    constructor(x, y, vx, vy, color, size, lifetime, scaleFactor = 0.95, shape = 'circle', rotation = 0, rotationSpeed = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.initialColor = color;
        this.color = color;
        this.targetColor = null;
        this.colorTransitionSpeed = 0.05;
        this.initialSize = size;
        this.size = size;
        this.lifetime = lifetime;
        this.initialLifetime = lifetime;
        this.scaleFactor = scaleFactor;
        this.alpha = 1;
        this.shape = shape; // 'circle', 'square', 'star', 'triangle'
        this.rotation = rotation;
        this.rotationSpeed = rotationSpeed;
    }

    update() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply slight gravity if needed
        this.vy += 0.01;
        
        // Update size with scale factor
        this.size *= this.scaleFactor;
        
        // Update rotation if applicable
        if (this.rotationSpeed !== 0) {
            this.rotation += this.rotationSpeed;
        }
        
        // Update color if transition is active
        if (this.targetColor) {
            this.transitionToColor(this.targetColor, this.colorTransitionSpeed);
        }
        
        // Update alpha based on lifetime
        this.alpha = Math.min(1, this.lifetime / (this.initialLifetime * 0.3));
        
        // Decrease lifetime
        this.lifetime--;
        
        // Return true if particle is still alive
        return this.lifetime > 0 && this.size > 0.5;
    }
    
    // Transition color gradually
    transitionToColor(targetColor, speed) {
        // Parse the original and target colors
        const parseColor = (color) => {
            const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (m) {
                return {
                    r: parseInt(m[1]),
                    g: parseInt(m[2]),
                    b: parseInt(m[3]),
                    a: m[4] ? parseFloat(m[4]) : 1
                };
            }
            return { r: 255, g: 255, b: 255, a: 1 }; // Default white
        };
        
        const current = parseColor(this.color);
        const target = parseColor(targetColor);
        
        // Interpolate between the colors
        current.r += (target.r - current.r) * speed;
        current.g += (target.g - current.g) * speed;
        current.b += (target.b - current.b) * speed;
        current.a += (target.a - current.a) * speed;
        
        // Update the color
        this.color = `rgba(${Math.round(current.r)}, ${Math.round(current.g)}, ${Math.round(current.b)}, ${current.a})`;
        
        // Check if we've reached the target color (approximately)
        const isClose = (a, b) => Math.abs(a - b) < 3;
        if (isClose(current.r, target.r) && 
            isClose(current.g, target.g) && 
            isClose(current.b, target.b) && 
            isClose(current.a, target.a)) {
            this.targetColor = null; // Color transition complete
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        // Position at the particle center for rotation
        ctx.translate(this.x, this.y);
        if (this.rotation !== 0) {
            ctx.rotate(this.rotation);
        }
        
        // Draw different shapes based on the shape property
        switch(this.shape) {
            case 'square':
                ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
                break;
                
            case 'star':
                this.drawStar(ctx, 0, 0, 5, this.size/2, this.size/4);
                break;
                
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(0, -this.size/2);
                ctx.lineTo(this.size/2, this.size/2);
                ctx.lineTo(-this.size/2, this.size/2);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'diamond':
                ctx.beginPath();
                ctx.moveTo(0, -this.size/2);
                ctx.lineTo(this.size/2, 0);
                ctx.lineTo(0, this.size/2);
                ctx.lineTo(-this.size/2, 0);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'circle':
            default:
                ctx.beginPath();
                ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
    
    // Helper method to draw a star shape
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    // Add a particle to the system
    addParticle(x, y, vx, vy, color, size, lifetime, scaleFactor = 0.95, shape = 'circle', rotation = 0, rotationSpeed = 0) {
        this.particles.push(new Particle(x, y, vx, vy, color, size, lifetime, scaleFactor, shape, rotation, rotationSpeed));
    }
    
    // Add multiple particles at once with similar properties but some variation
    addParticleGroup(count, x, y, options = {}) {
        const {
            minVx = -1, maxVx = 1,
            minVy = -1, maxVy = 1,
            color = 'rgba(255,255,255,0.8)',
            minSize = 2, maxSize = 5,
            minLifetime = 20, maxLifetime = 40,
            scaleFactor = 0.95,
            shape = 'circle',
            minRotation = 0, maxRotation = 0,
            minRotationSpeed = 0, maxRotationSpeed = 0
        } = options;
        
        for (let i = 0; i < count; i++) {
            const vx = minVx + Math.random() * (maxVx - minVx);
            const vy = minVy + Math.random() * (maxVy - minVy);
            const size = minSize + Math.random() * (maxSize - minSize);
            const lifetime = minLifetime + Math.random() * (maxLifetime - minLifetime);
            const rotation = minRotation + Math.random() * (maxRotation - minRotation);
            const rotationSpeed = minRotationSpeed + Math.random() * (maxRotationSpeed - minRotationSpeed);
            
            this.addParticle(x, y, vx, vy, color, size, lifetime, scaleFactor, shape, rotation, rotationSpeed);
        }
    }
    
    // Create an explosion effect
    createExplosion(x, y, options = {}) {
        const {
            particleCount = 20,
            minSpeed = 1, maxSpeed = 3,
            color = 'rgba(255,200,50,0.8)',
            minSize = 2, maxSize = 6,
            lifetime = 40,
            shapes = ['circle']
        } = options;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
            const size = minSize + Math.random() * (maxSize - minSize);
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const rotationSpeed = (Math.random() - 0.5) * 0.2;
            
            this.addParticle(
                x, y,
                Math.cos(angle) * speed, 
                Math.sin(angle) * speed,
                color,
                size,
                lifetime + Math.random() * lifetime * 0.5,
                0.9,
                shape,
                Math.random() * Math.PI * 2,
                rotationSpeed
            );
        }
    }
    
    // Create a trail effect
    createTrail(x, y, direction, options = {}) {
        const {
            particleCount = 5,
            color = 'rgba(100,200,255,0.5)',
            minSize = 1, maxSize = 3,
            lifetime = 20,
            spread = 0.5
        } = options;
        
        const normalizedDir = {
            x: Math.cos(direction),
            y: Math.sin(direction)
        };
        
        for (let i = 0; i < particleCount; i++) {
            const spreadAngle = (Math.random() - 0.5) * spread;
            const rotatedDir = {
                x: normalizedDir.x * Math.cos(spreadAngle) - normalizedDir.y * Math.sin(spreadAngle),
                y: normalizedDir.x * Math.sin(spreadAngle) + normalizedDir.y * Math.cos(spreadAngle)
            };
            
            const speed = 0.5 + Math.random();
            const size = minSize + Math.random() * (maxSize - minSize);
            
            this.addParticle(
                x, y,
                -rotatedDir.x * speed, // Move opposite to direction
                -rotatedDir.y * speed,
                color,
                size,
                lifetime + Math.random() * 10,
                0.95,
                'circle'
            );
        }
    }

    // Update all particles
    update() {
        // Filter out dead particles
        this.particles = this.particles.filter(particle => particle.update());
    }

    // Draw all particles
    draw(ctx) {
        this.particles.forEach(particle => {
            particle.draw(ctx);
        });
    }
    
    // Get current particle count
    getParticleCount() {
        return this.particles.length;
    }
} 