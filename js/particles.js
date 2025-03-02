/**
 * Particle System for the game
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.textParticles = [];
    }

    // Update all particles
    update() {
        // Update regular particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity
            particle.vy += particle.gravity;
            
            // Update lifespan
            particle.life--;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Update text particles
        for (let i = this.textParticles.length - 1; i >= 0; i--) {
            const textParticle = this.textParticles[i];
            
            // Update position
            textParticle.y += textParticle.vy;
            
            // Update lifespan
            textParticle.life--;
            
            // Remove dead text particles
            if (textParticle.life <= 0) {
                this.textParticles.splice(i, 1);
            }
        }
    }

    // Draw all particles
    draw(context) {
        // Draw regular particles
        for (const particle of this.particles) {
            context.globalAlpha = particle.life / particle.maxLife;
            context.fillStyle = particle.color;
            
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        }
        
        // Reset global alpha
        context.globalAlpha = 1.0;
        
        // Draw text particles
        for (const textParticle of this.textParticles) {
            context.globalAlpha = textParticle.life / textParticle.maxLife;
            context.fillStyle = textParticle.color;
            context.font = `${textParticle.size}px Arial`;
            context.textAlign = 'center';
            context.fillText(textParticle.text, textParticle.x, textParticle.y);
        }
        
        // Reset global alpha
        context.globalAlpha = 1.0;
    }

    // Create an explosion of particles
    createExplosion(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                color: color,
                gravity: 0.05,
                life: Math.random() * 30 + 10,
                maxLife: 40
            });
        }
    }

    // Create a coin collection effect
    createCoinEffect(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2, // Initial upward velocity
                size: Math.random() * 2 + 1,
                color: '#f1c40f', // Gold color
                gravity: 0.1,
                life: Math.random() * 20 + 10,
                maxLife: 30
            });
        }
    }

    // Create a powerup collection effect
    createPowerupEffect(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: color,
                gravity: 0.03,
                life: Math.random() * 40 + 20,
                maxLife: 60
            });
        }
    }

    // Create a text particle
    createText(x, y, text, color, size = 16, life = 40) {
        this.textParticles.push({
            x: x,
            y: y,
            vy: -1, // Move upward
            text: text,
            color: color,
            size: size,
            life: life,
            maxLife: life
        });
    }

    // Create a trail effect
    createTrail(x, y, color, count = 5) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() * 6 - 3),
                y: y + (Math.random() * 6 - 3),
                vx: 0,
                vy: 0.5, // Slight downward movement
                size: Math.random() * 2 + 1,
                color: color,
                gravity: 0,
                life: Math.random() * 10 + 5,
                maxLife: 15
            });
        }
    }

    // Create a shield hit effect
    createShieldHit(x, y, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 2,
                color: '#3498db', // Shield blue color
                gravity: 0.02,
                life: Math.random() * 20 + 10,
                maxLife: 30
            });
        }
    }
} 