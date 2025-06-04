// Particle Life simulation - emergent behaviors from simple attraction/repulsion rules

class Particle {
    constructor(x, y, type, color) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D();
        this.type = type;
        this.color = color;
        this.radius = 2;
        this.maxSpeed = 2;
    }

    update(dt) {
        this.velocity = this.velocity.limit(this.maxSpeed);
        this.position = this.position.add(this.velocity.multiply(dt));
        
        // Apply friction
        this.velocity = this.velocity.multiply(0.99);
    }

    applyForce(force) {
        this.velocity = this.velocity.add(force);
    }

    edges(width, height) {
        if (this.position.x < this.radius) {
            this.position.x = this.radius;
            this.velocity.x *= -0.5;
        }
        if (this.position.x > width - this.radius) {
            this.position.x = width - this.radius;
            this.velocity.x *= -0.5;
        }
        if (this.position.y < this.radius) {
            this.position.y = this.radius;
            this.velocity.y *= -0.5;
        }
        if (this.position.y > height - this.radius) {
            this.position.y = height - this.radius;
            this.velocity.y *= -0.5;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleLife extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.particles = [];
        this.types = [];
        this.rules = [];
        this.maxTypes = 6;
        
        // Visual settings
        this.bgColor = '#000000';
        this.trailAlpha = 0.05;
        
        // Parameters
        this.parameters = {
            particleCount: 300,
            typeCount: 4,
            interactionRadius: 80,
            forceScale: 0.1,
            randomizeRules: true,
            showConnections: false,
            trails: true,
            symmetricRules: false
        };
        
        // Presets
        this.presets = {
            random: { name: 'Random Rules' },
            life: { 
                name: 'Life-like',
                rules: [
                    [0.0, -0.1, 0.3, -0.2],
                    [0.2, 0.0, -0.1, 0.1],
                    [-0.1, 0.3, 0.0, -0.2],
                    [0.1, -0.2, 0.2, 0.0]
                ]
            },
            orbits: {
                name: 'Orbital Patterns',
                rules: [
                    [0.0, 0.3, -0.2, 0.1],
                    [-0.3, 0.0, 0.3, -0.2],
                    [0.2, -0.3, 0.0, 0.3],
                    [-0.1, 0.2, -0.3, 0.0]
                ]
            },
            crystals: {
                name: 'Crystal Formation',
                rules: [
                    [-0.1, 0.4, 0.0, -0.3],
                    [0.4, -0.1, 0.2, 0.0],
                    [0.0, 0.2, -0.1, 0.4],
                    [-0.3, 0.0, 0.4, -0.1]
                ]
            }
        };
    }

    init() {
        // Initialize particle types with colors
        this.types = [
            '#ff4444', '#44ff44', '#4444ff', 
            '#ffff44', '#ff44ff', '#44ffff'
        ].slice(0, this.parameters.typeCount);
        
        // Initialize rules matrix
        this.initializeRules();
        
        // Create particles
        this.particles = [];
        const particlesPerType = Math.floor(this.parameters.particleCount / this.parameters.typeCount);
        
        for (let type = 0; type < this.parameters.typeCount; type++) {
            for (let i = 0; i < particlesPerType; i++) {
                const angle = Math.random() * Math.PI * 2;
                const canvasWidth = this.canvas.width || 800;
                const canvasHeight = this.canvas.height || 600;
                const radius = Math.random() * Math.min(canvasWidth, canvasHeight) * 0.4;
                const x = canvasWidth / 2 + Math.cos(angle) * radius;
                const y = canvasHeight / 2 + Math.sin(angle) * radius;
                
                this.particles.push(new Particle(x, y, type, this.types[type]));
            }
        }
    }

    initializeRules() {
        this.rules = [];
        
        if (this.parameters.randomizeRules) {
            // Generate random attraction/repulsion rules
            for (let i = 0; i < this.parameters.typeCount; i++) {
                this.rules[i] = [];
                for (let j = 0; j < this.parameters.typeCount; j++) {
                    if (this.parameters.symmetricRules && j < i) {
                        this.rules[i][j] = this.rules[j][i];
                    } else {
                        this.rules[i][j] = (Math.random() - 0.5) * 0.8;
                    }
                }
            }
        }
    }

    loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset && preset.rules) {
            this.rules = preset.rules;
            this.parameters.typeCount = preset.rules.length;
            this.parameters.randomizeRules = false;
            this.init();
        }
    }

    update(deltaTime) {
        const dt = Math.min(deltaTime / 16.67, 2); // Normalize to 60fps
        
        // Apply particle interactions
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const force = new Vector2D();
            
            for (let j = 0; j < this.particles.length; j++) {
                if (i === j) continue;
                
                const other = this.particles[j];
                const distance = particle.position.distance(other.position);
                
                if (distance < this.parameters.interactionRadius && distance > 0) {
                    // Get attraction/repulsion strength from rules
                    const attraction = this.rules[particle.type][other.type];
                    
                    // Calculate force
                    const direction = other.position.subtract(particle.position).normalize();
                    const strength = attraction * (1 - distance / this.parameters.interactionRadius);
                    
                    force.x += direction.x * strength;
                    force.y += direction.y * strength;
                }
            }
            
            particle.applyForce(force.multiply(this.parameters.forceScale));
        }
        
        // Update particles
        for (const particle of this.particles) {
            particle.update(dt);
            particle.edges(this.canvas.width, this.canvas.height);
        }
        
        // Update stats
        this.updateStats();
    }

    updateStats() {
        // Calculate average speed
        let totalSpeed = 0;
        for (const particle of this.particles) {
            totalSpeed += particle.velocity.magnitude();
        }
        
        this.stats.particles = this.particles.length;
        this.stats.types = this.parameters.typeCount;
        this.stats.avgSpeed = (totalSpeed / this.particles.length).toFixed(2);
    }

    render() {
        // Clear or fade for trails
        if (this.parameters.trails) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.trailAlpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            CanvasUtils.clear(this.ctx, this.bgColor);
        }
        
        // Draw connections if enabled
        if (this.parameters.showConnections) {
            this.drawConnections();
        }
        
        // Draw particles
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }
        
        // Draw rules matrix
        this.drawRulesMatrix();
    }

    drawConnections() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const distance = particle.position.distance(other.position);
                
                if (distance < this.parameters.interactionRadius) {
                    const alpha = 1 - distance / this.parameters.interactionRadius;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.1})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.position.x, particle.position.y);
                    this.ctx.lineTo(other.position.x, other.position.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    drawRulesMatrix() {
        const matrixSize = 80;
        const cellSize = matrixSize / this.parameters.typeCount;
        const x = 10;
        const y = 10;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 5, y - 5, matrixSize + 10, matrixSize + 10);
        
        // Draw matrix cells
        for (let i = 0; i < this.parameters.typeCount; i++) {
            for (let j = 0; j < this.parameters.typeCount; j++) {
                const value = this.rules[i][j];
                const intensity = Math.abs(value);
                
                if (value > 0) {
                    this.ctx.fillStyle = `rgba(0, 255, 0, ${intensity})`;
                } else {
                    this.ctx.fillStyle = `rgba(255, 0, 0, ${intensity})`;
                }
                
                this.ctx.fillRect(
                    x + j * cellSize,
                    y + i * cellSize,
                    cellSize - 1,
                    cellSize - 1
                );
            }
        }
        
        // Draw type colors on edges
        for (let i = 0; i < this.parameters.typeCount; i++) {
            // Left edge
            this.ctx.fillStyle = this.types[i];
            this.ctx.fillRect(x - 5, y + i * cellSize, 3, cellSize - 1);
            
            // Top edge
            this.ctx.fillRect(x + i * cellSize, y - 5, cellSize - 1, 3);
        }
    }

    onMouseClick(event) {
        const pos = this.getMousePos(event);
        
        // Add new particle at mouse position
        const type = Math.floor(Math.random() * this.parameters.typeCount);
        this.particles.push(new Particle(pos.x, pos.y, type, this.types[type]));
    }

    onResize() {
        // Keep particles within bounds
        if (this.particles) {
            for (const particle of this.particles) {
                particle.position.x = MathUtils.constrain(particle.position.x, 0, this.canvas.width);
                particle.position.y = MathUtils.constrain(particle.position.y, 0, this.canvas.height);
            }
        }
    }

    clear() {
        this.particles = [];
    }

    reset() {
        this.init();
    }

    onParameterChange(name, value) {
        switch (name) {
            case 'typeCount':
            case 'particleCount':
                this.init();
                break;
            case 'randomizeRules':
                if (value) {
                    this.initializeRules();
                }
                break;
        }
    }

    getInfo() {
        return {
            name: "Particle Life",
            description: "A simulation where particles of different types attract or repel each other based on a rules matrix. Simple rules lead to complex emergent behaviors like clustering, orbiting, and pattern formation.",
            instructions: "Click to add particles. The colored matrix shows attraction (green) and repulsion (red) between types. Watch as particles self-organize into complex patterns."
        };
    }

    getParameterDefs() {
        return [
            {
                name: 'particleCount',
                type: 'range',
                min: 50,
                max: 1000,
                step: 50,
                defaultValue: 300,
                label: 'Particle Count'
            },
            {
                name: 'typeCount',
                type: 'range',
                min: 2,
                max: 6,
                step: 1,
                defaultValue: 4,
                label: 'Type Count'
            },
            {
                name: 'interactionRadius',
                type: 'range',
                min: 20,
                max: 200,
                step: 10,
                defaultValue: 80,
                label: 'Interaction Radius'
            },
            {
                name: 'forceScale',
                type: 'range',
                min: 0.01,
                max: 0.5,
                step: 0.01,
                defaultValue: 0.1,
                label: 'Force Scale'
            },
            {
                name: 'trails',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show Trails'
            },
            {
                name: 'showConnections',
                type: 'checkbox',
                defaultValue: false,
                label: 'Show Connections'
            },
            {
                name: 'symmetricRules',
                type: 'checkbox',
                defaultValue: false,
                label: 'Symmetric Rules'
            },
            {
                name: 'randomizeRules',
                type: 'checkbox',
                defaultValue: true,
                label: 'Randomize Rules'
            }
        ];
    }
}

// Register simulation
window.ParticleLife = ParticleLife;