// Evolutionary Steering Behaviors simulation

class Creature {
    constructor(x, y, dna) {
        this.position = new Vector2D(x, y);
        this.velocity = Vector2D.random();
        this.acceleration = new Vector2D();
        this.radius = 4;
        this.maxSpeed = 2;
        this.maxForce = 0.1;
        
        // DNA defines behavior
        this.dna = dna || {
            foodAttraction: MathUtils.random(-2, 2),
            poisonAttraction: MathUtils.random(-2, 2),
            foodPerception: MathUtils.random(20, 100),
            poisonPerception: MathUtils.random(20, 100),
            maxSpeed: MathUtils.random(1, 4),
            size: MathUtils.random(3, 8)
        };
        
        this.health = 100;
        this.age = 0;
        this.maxAge = 500;
        this.radius = this.dna.size;
        this.maxSpeed = this.dna.maxSpeed;
    }

    update() {
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.limit(this.maxSpeed);
        this.position = this.position.add(this.velocity);
        this.acceleration = new Vector2D();
        
        // Lose health over time
        this.health -= 0.5;
        this.age++;
        
        // Die of old age
        if (this.age > this.maxAge) {
            this.health = 0;
        }
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force);
    }

    seek(target, weight = 1) {
        const desired = target.subtract(this.position);
        const distance = desired.magnitude();
        
        if (distance > 0) {
            desired.normalize();
            desired.multiply(this.maxSpeed);
            const steer = desired.subtract(this.velocity);
            return steer.limit(this.maxForce).multiply(weight);
        }
        return new Vector2D();
    }

    behaviors(food, poison) {
        // Seek food
        const foodForce = this.eat(food, 5, this.dna.foodPerception);
        foodForce.multiply(this.dna.foodAttraction);
        
        // Avoid poison
        const poisonForce = this.eat(poison, -10, this.dna.poisonPerception);
        poisonForce.multiply(this.dna.poisonAttraction);
        
        this.applyForce(foodForce);
        this.applyForce(poisonForce);
    }

    eat(list, nutrition, perception) {
        let record = Infinity;
        let closest = null;
        let closestIndex = -1;
        
        for (let i = list.length - 1; i >= 0; i--) {
            const distance = this.position.distance(list[i]);
            
            // Eat if close enough
            if (distance < this.radius + 2) {
                this.health += nutrition;
                list.splice(i, 1);
            } else if (distance < record && distance < perception) {
                record = distance;
                closest = list[i];
                closestIndex = i;
            }
        }
        
        if (closest) {
            return this.seek(closest);
        }
        
        return new Vector2D();
    }

    reproduce() {
        if (Math.random() < 0.001 && this.health > 50) {
            // Mutate DNA
            const childDNA = {
                foodAttraction: this.dna.foodAttraction + MathUtils.gaussian(0, 0.1),
                poisonAttraction: this.dna.poisonAttraction + MathUtils.gaussian(0, 0.1),
                foodPerception: MathUtils.constrain(
                    this.dna.foodPerception + MathUtils.gaussian(0, 5),
                    0, 200
                ),
                poisonPerception: MathUtils.constrain(
                    this.dna.poisonPerception + MathUtils.gaussian(0, 5),
                    0, 200
                ),
                maxSpeed: MathUtils.constrain(
                    this.dna.maxSpeed + MathUtils.gaussian(0, 0.1),
                    0.5, 5
                ),
                size: MathUtils.constrain(
                    this.dna.size + MathUtils.gaussian(0, 0.5),
                    2, 10
                )
            };
            
            this.health -= 25; // Cost of reproduction
            return new Creature(this.position.x, this.position.y, childDNA);
        }
        return null;
    }

    edges(width, height) {
        const margin = 10;
        if (this.position.x < -margin) this.position.x = width + margin;
        if (this.position.y < -margin) this.position.y = height + margin;
        if (this.position.x > width + margin) this.position.x = -margin;
        if (this.position.y > height + margin) this.position.y = -margin;
    }

    draw(ctx, showPerception) {
        // Health indicator through transparency
        const alpha = MathUtils.map(this.health, 0, 100, 0.2, 1);
        
        // Body color based on food vs poison preference
        const foodPref = MathUtils.map(this.dna.foodAttraction, -2, 2, 0, 255);
        const poisonPref = MathUtils.map(this.dna.poisonAttraction, -2, 2, 0, 255);
        
        ctx.fillStyle = `rgba(${Math.floor(poisonPref)}, ${Math.floor(foodPref)}, 100, ${alpha})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        
        // Draw creature
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.velocity.angle());
        
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Direction indicator
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(this.radius * 0.7, -this.radius * 0.3);
        ctx.lineTo(this.radius * 0.7, this.radius * 0.3);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        
        // Perception ranges
        if (showPerception) {
            // Food perception (green)
            ctx.strokeStyle = `rgba(0, 255, 0, 0.2)`;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.dna.foodPerception, 0, Math.PI * 2);
            ctx.stroke();
            
            // Poison perception (red)
            ctx.strokeStyle = `rgba(255, 0, 0, 0.2)`;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.dna.poisonPerception, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

class Evolution extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.creatures = [];
        this.food = [];
        this.poison = [];
        this.generation = 0;
        
        // Parameters
        this.parameters = {
            populationSize: 50,
            foodRate: 0.1,
            poisonRate: 0.05,
            maxFood: 150,
            maxPoison: 50,
            showPerception: false,
            showStats: true,
            mutationRate: 0.1
        };
        
        // Statistics
        this.avgStats = {
            foodAttraction: 0,
            poisonAttraction: 0,
            lifespan: 0
        };
    }

    init() {
        // Create initial population
        this.creatures = [];
        for (let i = 0; i < this.parameters.populationSize; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.creatures.push(new Creature(x, y));
        }
        
        // Create initial food and poison
        this.food = [];
        this.poison = [];
        
        for (let i = 0; i < 50; i++) {
            this.addFood();
        }
        
        for (let i = 0; i < 20; i++) {
            this.addPoison();
        }
        
        this.generation = 0;
    }

    addFood() {
        if (this.food.length < this.parameters.maxFood) {
            this.food.push(new Vector2D(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
    }

    addPoison() {
        if (this.poison.length < this.parameters.maxPoison) {
            this.poison.push(new Vector2D(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
    }

    update(deltaTime) {
        // Add food and poison
        if (Math.random() < this.parameters.foodRate) this.addFood();
        if (Math.random() < this.parameters.poisonRate) this.addPoison();
        
        // Update creatures
        for (let i = this.creatures.length - 1; i >= 0; i--) {
            const creature = this.creatures[i];
            
            creature.behaviors(this.food, this.poison);
            creature.update();
            creature.edges(this.canvas.width, this.canvas.height);
            
            // Check for reproduction
            const child = creature.reproduce();
            if (child) {
                this.creatures.push(child);
            }
            
            // Remove dead creatures
            if (creature.health <= 0) {
                // Leave food where creature died
                this.food.push(new Vector2D(creature.position.x, creature.position.y));
                this.creatures.splice(i, 1);
            }
        }
        
        // Maintain minimum population
        if (this.creatures.length < 5) {
            for (let i = 0; i < 10; i++) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                this.creatures.push(new Creature(x, y));
            }
            this.generation++;
        }
        
        // Calculate statistics
        this.calculateStats();
        
        // Update displayed stats
        this.stats.population = this.creatures.length;
        this.stats.food = this.food.length;
        this.stats.poison = this.poison.length;
        this.stats.generation = this.generation;
    }

    calculateStats() {
        if (this.creatures.length === 0) return;
        
        let totalFood = 0;
        let totalPoison = 0;
        let totalAge = 0;
        
        for (const creature of this.creatures) {
            totalFood += creature.dna.foodAttraction;
            totalPoison += creature.dna.poisonAttraction;
            totalAge += creature.age;
        }
        
        this.avgStats.foodAttraction = totalFood / this.creatures.length;
        this.avgStats.poisonAttraction = totalPoison / this.creatures.length;
        this.avgStats.lifespan = totalAge / this.creatures.length;
    }

    render() {
        // Clear canvas
        CanvasUtils.clear(this.ctx, '#001122');
        
        // Draw food (green circles)
        this.ctx.fillStyle = '#00ff00';
        for (const f of this.food) {
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw poison (red circles)
        this.ctx.fillStyle = '#ff0000';
        for (const p of this.poison) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw creatures
        for (const creature of this.creatures) {
            creature.draw(this.ctx, this.parameters.showPerception);
        }
        
        // Draw evolution stats
        if (this.parameters.showStats) {
            this.drawStats();
        }
    }

    drawStats() {
        const x = 10;
        const y = this.canvas.height - 100;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 5, y - 5, 250, 90);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Generation: ${this.generation}`, x, y + 15);
        this.ctx.fillText(`Avg Food Attraction: ${this.avgStats.foodAttraction.toFixed(2)}`, x, y + 30);
        this.ctx.fillText(`Avg Poison Attraction: ${this.avgStats.poisonAttraction.toFixed(2)}`, x, y + 45);
        this.ctx.fillText(`Avg Lifespan: ${Math.floor(this.avgStats.lifespan)}`, x, y + 60);
        
        // Draw color legend
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(x, y + 70, 10, 10);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Food', x + 15, y + 78);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x + 60, y + 70, 10, 10);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('Poison', x + 75, y + 78);
    }

    onMouseClick(event) {
        const pos = this.getMousePos(event);
        
        // Add food on left click, poison on right click
        if (event.button === 0) {
            this.food.push(new Vector2D(pos.x, pos.y));
        } else if (event.button === 2) {
            this.poison.push(new Vector2D(pos.x, pos.y));
        }
    }

    onResize() {
        // Keep entities within bounds
        if (this.creatures) {
            for (const creature of this.creatures) {
                creature.position.x = MathUtils.constrain(creature.position.x, 0, this.canvas.width);
                creature.position.y = MathUtils.constrain(creature.position.y, 0, this.canvas.height);
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
        // Parameters update automatically
    }

    getInfo() {
        return {
            name: "Evolutionary Steering Behaviors",
            description: "Creatures evolve to seek food (green) and avoid poison (red). Natural selection favors creatures with better survival strategies. Watch as the population evolves over generations.",
            instructions: "Left click to add food, right click to add poison. Creature color indicates preferences: green = seeks food, red = seeks poison. Transparency shows health."
        };
    }

    getParameterDefs() {
        return [
            {
                name: 'populationSize',
                type: 'range',
                min: 10,
                max: 200,
                step: 10,
                defaultValue: 50,
                label: 'Target Population'
            },
            {
                name: 'foodRate',
                type: 'range',
                min: 0,
                max: 0.5,
                step: 0.01,
                defaultValue: 0.1,
                label: 'Food Spawn Rate'
            },
            {
                name: 'poisonRate',
                type: 'range',
                min: 0,
                max: 0.2,
                step: 0.01,
                defaultValue: 0.05,
                label: 'Poison Spawn Rate'
            },
            {
                name: 'maxFood',
                type: 'range',
                min: 50,
                max: 300,
                step: 10,
                defaultValue: 150,
                label: 'Max Food'
            },
            {
                name: 'maxPoison',
                type: 'range',
                min: 10,
                max: 100,
                step: 5,
                defaultValue: 50,
                label: 'Max Poison'
            },
            {
                name: 'showPerception',
                type: 'checkbox',
                defaultValue: false,
                label: 'Show Perception'
            },
            {
                name: 'showStats',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show Statistics'
            }
        ];
    }
}

// Register simulation
window.Evolution = Evolution;