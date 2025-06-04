// Boids flocking simulation

class Boid {
    constructor(x, y, maxSpeed, maxForce) {
        this.position = new Vector2D(x, y);
        this.velocity = Vector2D.random().multiply(maxSpeed);
        this.acceleration = new Vector2D();
        this.maxSpeed = maxSpeed;
        this.maxForce = maxForce;
        this.size = 3;
        this.perceptionRadius = 50;
    }

    update() {
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.limit(this.maxSpeed);
        this.position = this.position.add(this.velocity);
        this.acceleration = new Vector2D();
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force);
    }

    seek(target) {
        const desired = target.subtract(this.position);
        const distance = desired.magnitude();
        
        if (distance > 0) {
            desired.normalize();
            desired.multiply(this.maxSpeed);
            const steer = desired.subtract(this.velocity);
            return steer.limit(this.maxForce);
        }
        return new Vector2D();
    }

    flee(target) {
        return this.seek(target).multiply(-1);
    }

    separation(boids, desiredSeparation) {
        let steer = new Vector2D();
        let count = 0;

        for (const other of boids) {
            const distance = this.position.distance(other.position);
            if (distance > 0 && distance < desiredSeparation) {
                let diff = this.position.subtract(other.position);
                diff = diff.normalize();
                diff = diff.divide(distance); // Weight by distance
                steer = steer.add(diff);
                count++;
            }
        }

        if (count > 0) {
            steer = steer.divide(count);
            steer = steer.normalize();
            steer = steer.multiply(this.maxSpeed);
            steer = steer.subtract(this.velocity);
            return steer.limit(this.maxForce);
        }
        return steer;
    }

    alignment(boids) {
        let sum = new Vector2D();
        let count = 0;

        for (const other of boids) {
            const distance = this.position.distance(other.position);
            if (distance > 0 && distance < this.perceptionRadius) {
                sum = sum.add(other.velocity);
                count++;
            }
        }

        if (count > 0) {
            sum = sum.divide(count);
            sum = sum.normalize();
            sum = sum.multiply(this.maxSpeed);
            const steer = sum.subtract(this.velocity);
            return steer.limit(this.maxForce);
        }
        return sum;
    }

    cohesion(boids) {
        let sum = new Vector2D();
        let count = 0;

        for (const other of boids) {
            const distance = this.position.distance(other.position);
            if (distance > 0 && distance < this.perceptionRadius) {
                sum = sum.add(other.position);
                count++;
            }
        }

        if (count > 0) {
            sum = sum.divide(count);
            return this.seek(sum);
        }
        return sum;
    }

    flock(boids, weights) {
        const sep = this.separation(boids, 25);
        const ali = this.alignment(boids);
        const coh = this.cohesion(boids);

        // Apply weights
        const sepWeighted = sep.multiply(weights.separation);
        const aliWeighted = ali.multiply(weights.alignment);
        const cohWeighted = coh.multiply(weights.cohesion);

        // Apply forces
        this.applyForce(sepWeighted);
        this.applyForce(aliWeighted);
        this.applyForce(cohWeighted);
    }

    edges(width, height) {
        if (this.position.x < -this.size) this.position.x = width + this.size;
        if (this.position.y < -this.size) this.position.y = height + this.size;
        if (this.position.x > width + this.size) this.position.x = -this.size;
        if (this.position.y > height + this.size) this.position.y = -this.size;
    }

    draw(ctx, color) {
        const angle = this.velocity.angle();
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        
        // Draw triangle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(this.size * 2, 0);
        ctx.lineTo(-this.size, -this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

class Boids extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.boids = [];
        this.obstacles = [];
        this.target = null;
        
        // Parameters
        this.parameters = {
            boidCount: 100,
            maxSpeed: 2,
            maxForce: 0.05,
            separationWeight: 1.5,
            alignmentWeight: 1.0,
            cohesionWeight: 1.0,
            perceptionRadius: 50,
            showPerception: false,
            colorMode: 'velocity', // 'velocity', 'solid', 'rainbow'
            trailLength: 0
        };
        
        // Trail system
        this.trails = [];
        this.maxTrailLength = 50;
        
        // Colors
        this.bgColor = '#000011';
        this.boidColor = '#00ff88';
    }

    init() {
        this.boids = [];
        this.trails = [];
        
        // Create boids
        const canvasWidth = this.canvas.width || 800;
        const canvasHeight = this.canvas.height || 600;
        
        for (let i = 0; i < this.parameters.boidCount; i++) {
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight;
            this.boids.push(new Boid(x, y, this.parameters.maxSpeed, this.parameters.maxForce));
        }
    }

    update(deltaTime) {
        // Update perception radius for all boids
        for (const boid of this.boids) {
            boid.perceptionRadius = this.parameters.perceptionRadius;
            boid.maxSpeed = this.parameters.maxSpeed;
            boid.maxForce = this.parameters.maxForce;
        }
        
        // Apply flocking behavior
        for (const boid of this.boids) {
            boid.flock(this.boids, {
                separation: this.parameters.separationWeight,
                alignment: this.parameters.alignmentWeight,
                cohesion: this.parameters.cohesionWeight
            });
            
            // Apply mouse attraction/repulsion if exists
            if (this.target) {
                const mouseForce = boid.seek(this.target);
                mouseForce.multiply(0.5);
                boid.applyForce(mouseForce);
            }
            
            boid.update();
            boid.edges(this.canvas.width, this.canvas.height);
        }
        
        // Update trails
        if (this.parameters.trailLength > 0) {
            this.updateTrails();
        }
        
        // Update stats
        this.stats.boids = this.boids.length;
        this.stats.avgSpeed = (this.boids.reduce((sum, b) => sum + b.velocity.magnitude(), 0) / this.boids.length).toFixed(2);
    }

    updateTrails() {
        // Add current positions to trails
        for (let i = 0; i < this.boids.length; i++) {
            if (!this.trails[i]) this.trails[i] = [];
            
            this.trails[i].push({
                x: this.boids[i].position.x,
                y: this.boids[i].position.y
            });
            
            // Limit trail length
            const maxLength = Math.floor(this.parameters.trailLength * this.maxTrailLength);
            if (this.trails[i].length > maxLength) {
                this.trails[i].shift();
            }
        }
    }

    render() {
        // Clear with slight fade for trail effect
        if (this.parameters.trailLength > 0) {
            this.ctx.fillStyle = 'rgba(0, 0, 17, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            CanvasUtils.clear(this.ctx, this.bgColor);
        }
        
        // Draw trails
        if (this.parameters.trailLength > 0) {
            this.drawTrails();
        }
        
        // Draw perception radius if enabled
        if (this.parameters.showPerception && this.boids.length < 50) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            for (const boid of this.boids) {
                this.ctx.beginPath();
                this.ctx.arc(boid.position.x, boid.position.y, boid.perceptionRadius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        // Draw boids
        for (let i = 0; i < this.boids.length; i++) {
            const boid = this.boids[i];
            let color = this.boidColor;
            
            // Color based on mode
            switch (this.parameters.colorMode) {
                case 'velocity':
                    const speed = boid.velocity.magnitude() / this.parameters.maxSpeed;
                    const hue = speed * 120; // 0 (red) to 120 (green)
                    color = `hsl(${hue}, 100%, 50%)`;
                    break;
                case 'rainbow':
                    const rainbowHue = (i / this.boids.length) * 360;
                    color = `hsl(${rainbowHue}, 100%, 50%)`;
                    break;
            }
            
            boid.draw(this.ctx, color);
        }
        
        // Draw target if exists
        if (this.target) {
            this.ctx.fillStyle = '#ff0066';
            this.ctx.beginPath();
            this.ctx.arc(this.target.x, this.target.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawTrails() {
        for (let i = 0; i < this.trails.length; i++) {
            const trail = this.trails[i];
            if (trail.length < 2) continue;
            
            for (let j = 1; j < trail.length; j++) {
                const alpha = j / trail.length * 0.5;
                
                let color;
                switch (this.parameters.colorMode) {
                    case 'velocity':
                        const boid = this.boids[i];
                        const speed = boid.velocity.magnitude() / this.parameters.maxSpeed;
                        const hue = speed * 120;
                        color = `hsla(${hue}, 100%, 50%, ${alpha})`;
                        break;
                    case 'rainbow':
                        const rainbowHue = (i / this.boids.length) * 360;
                        color = `hsla(${rainbowHue}, 100%, 50%, ${alpha})`;
                        break;
                    default:
                        color = `rgba(0, 255, 136, ${alpha})`;
                }
                
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(trail[j - 1].x, trail[j - 1].y);
                this.ctx.lineTo(trail[j].x, trail[j].y);
                this.ctx.stroke();
            }
        }
    }

    onMouseMove(event) {
        const pos = this.getMousePos(event);
        this.target = new Vector2D(pos.x, pos.y);
    }

    onMouseUp(event) {
        this.target = null;
    }

    onResize() {
        // Keep boids within new bounds
        if (this.boids) {
            for (const boid of this.boids) {
                boid.position.x = MathUtils.constrain(boid.position.x, 0, this.canvas.width);
                boid.position.y = MathUtils.constrain(boid.position.y, 0, this.canvas.height);
            }
        }
    }

    clear() {
        this.init();
    }

    reset() {
        this.init();
    }

    onParameterChange(name, value) {
        if (name === 'boidCount') {
            const currentCount = this.boids.length;
            if (value > currentCount) {
                // Add boids
                for (let i = currentCount; i < value; i++) {
                    const x = Math.random() * this.canvas.width;
                    const y = Math.random() * this.canvas.height;
                    this.boids.push(new Boid(x, y, this.parameters.maxSpeed, this.parameters.maxForce));
                }
            } else {
                // Remove boids
                this.boids = this.boids.slice(0, value);
                this.trails = this.trails.slice(0, value);
            }
        }
    }

    getInfo() {
        return {
            name: "Boids Flocking Simulation",
            description: "A simulation of flocking behavior based on three simple rules: separation (avoid crowding), alignment (steer towards average heading), and cohesion (steer towards average position).",
            instructions: "Move mouse to attract boids. Adjust weights to see different flocking patterns. Created by Craig Reynolds in 1986."
        };
    }

    getParameterDefs() {
        return [
            {
                name: 'boidCount',
                type: 'range',
                min: 10,
                max: 500,
                step: 10,
                defaultValue: 100,
                label: 'Number of Boids'
            },
            {
                name: 'maxSpeed',
                type: 'range',
                min: 0.5,
                max: 5,
                step: 0.1,
                defaultValue: 2,
                label: 'Max Speed'
            },
            {
                name: 'maxForce',
                type: 'range',
                min: 0.01,
                max: 0.2,
                step: 0.01,
                defaultValue: 0.05,
                label: 'Max Force'
            },
            {
                name: 'separationWeight',
                type: 'range',
                min: 0,
                max: 3,
                step: 0.1,
                defaultValue: 1.5,
                label: 'Separation Weight'
            },
            {
                name: 'alignmentWeight',
                type: 'range',
                min: 0,
                max: 3,
                step: 0.1,
                defaultValue: 1.0,
                label: 'Alignment Weight'
            },
            {
                name: 'cohesionWeight',
                type: 'range',
                min: 0,
                max: 3,
                step: 0.1,
                defaultValue: 1.0,
                label: 'Cohesion Weight'
            },
            {
                name: 'perceptionRadius',
                type: 'range',
                min: 20,
                max: 100,
                step: 5,
                defaultValue: 50,
                label: 'Perception Radius'
            },
            {
                name: 'trailLength',
                type: 'range',
                min: 0,
                max: 1,
                step: 0.1,
                defaultValue: 0,
                label: 'Trail Length'
            },
            {
                name: 'colorMode',
                type: 'select',
                options: ['solid', 'velocity', 'rainbow'],
                defaultValue: 'velocity',
                label: 'Color Mode'
            },
            {
                name: 'showPerception',
                type: 'checkbox',
                defaultValue: false,
                label: 'Show Perception'
            }
        ];
    }
}

// Register simulation
window.Boids = Boids;