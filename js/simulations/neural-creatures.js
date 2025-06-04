// Neural Network Creatures simulation

class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        
        // Initialize weights with random values
        this.weightsIH = this.randomMatrix(hiddenSize, inputSize);
        this.weightsHO = this.randomMatrix(outputSize, hiddenSize);
        
        // Biases
        this.biasH = new Array(hiddenSize).fill(0);
        this.biasO = new Array(outputSize).fill(0);
    }

    randomMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = (Math.random() - 0.5) * 2;
            }
        }
        return matrix;
    }

    forward(inputs) {
        // Input to hidden
        const hidden = [];
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.biasH[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += inputs[j] * this.weightsIH[i][j];
            }
            hidden[i] = Math.tanh(sum);
        }
        
        // Hidden to output
        const outputs = [];
        for (let i = 0; i < this.outputSize; i++) {
            let sum = this.biasO[i];
            for (let j = 0; j < this.hiddenSize; j++) {
                sum += hidden[j] * this.weightsHO[i][j];
            }
            outputs[i] = Math.tanh(sum);
        }
        
        return outputs;
    }

    mutate(rate) {
        // Mutate weights
        for (let i = 0; i < this.weightsIH.length; i++) {
            for (let j = 0; j < this.weightsIH[i].length; j++) {
                if (Math.random() < rate) {
                    this.weightsIH[i][j] += MathUtils.gaussian(0, 0.5);
                }
            }
        }
        
        for (let i = 0; i < this.weightsHO.length; i++) {
            for (let j = 0; j < this.weightsHO[i].length; j++) {
                if (Math.random() < rate) {
                    this.weightsHO[i][j] += MathUtils.gaussian(0, 0.5);
                }
            }
        }
        
        // Mutate biases
        for (let i = 0; i < this.biasH.length; i++) {
            if (Math.random() < rate) {
                this.biasH[i] += MathUtils.gaussian(0, 0.5);
            }
        }
        
        for (let i = 0; i < this.biasO.length; i++) {
            if (Math.random() < rate) {
                this.biasO[i] += MathUtils.gaussian(0, 0.5);
            }
        }
    }

    copy() {
        const newNN = new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);
        
        // Deep copy weights
        for (let i = 0; i < this.weightsIH.length; i++) {
            for (let j = 0; j < this.weightsIH[i].length; j++) {
                newNN.weightsIH[i][j] = this.weightsIH[i][j];
            }
        }
        
        for (let i = 0; i < this.weightsHO.length; i++) {
            for (let j = 0; j < this.weightsHO[i].length; j++) {
                newNN.weightsHO[i][j] = this.weightsHO[i][j];
            }
        }
        
        // Copy biases
        newNN.biasH = [...this.biasH];
        newNN.biasO = [...this.biasO];
        
        return newNN;
    }
}

class NeuralCreature {
    constructor(x, y, brain) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D();
        this.acceleration = new Vector2D();
        this.angle = Math.random() * Math.PI * 2;
        
        this.radius = 6;
        this.maxSpeed = 2;
        this.maxForce = 0.1;
        
        this.brain = brain || new NeuralNetwork(8, 16, 4);
        this.fitness = 0;
        this.health = 100;
        this.age = 0;
        
        // Sensors
        this.sensorRange = 100;
        this.sensorAngles = [-45, -15, 0, 15, 45]; // degrees
        
        // Visual properties
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }

    sense(food, creatures) {
        const inputs = [];
        
        // Wall sensors (4 inputs: N, E, S, W distances)
        inputs.push(this.position.y / this.sensorRange); // North
        inputs.push((window.innerWidth - this.position.x) / this.sensorRange); // East
        inputs.push((window.innerHeight - this.position.y) / this.sensorRange); // South
        inputs.push(this.position.x / this.sensorRange); // West
        
        // Food sensor (2 inputs: angle and distance to nearest food)
        let nearestFood = null;
        let nearestDist = Infinity;
        
        for (const f of food) {
            const dist = this.position.distance(f);
            if (dist < nearestDist && dist < this.sensorRange) {
                nearestDist = dist;
                nearestFood = f;
            }
        }
        
        if (nearestFood) {
            const toFood = nearestFood.subtract(this.position);
            const angleToFood = Math.atan2(toFood.y, toFood.x) - this.angle;
            inputs.push(Math.cos(angleToFood)); // Food angle X
            inputs.push(Math.sin(angleToFood)); // Food angle Y
        } else {
            inputs.push(0);
            inputs.push(0);
        }
        
        // Other creatures sensor (2 inputs: average position)
        let avgX = 0, avgY = 0, count = 0;
        for (const other of creatures) {
            if (other === this) continue;
            const dist = this.position.distance(other.position);
            if (dist < this.sensorRange) {
                avgX += other.position.x;
                avgY += other.position.y;
                count++;
            }
        }
        
        if (count > 0) {
            avgX /= count;
            avgY /= count;
            const toCreatures = new Vector2D(avgX - this.position.x, avgY - this.position.y);
            const angleToCreatures = Math.atan2(toCreatures.y, toCreatures.x) - this.angle;
            inputs.push(Math.cos(angleToCreatures));
            inputs.push(Math.sin(angleToCreatures));
        } else {
            inputs.push(0);
            inputs.push(0);
        }
        
        return inputs;
    }

    think(inputs) {
        const outputs = this.brain.forward(inputs);
        
        // Output 0: Forward/backward movement
        const forward = outputs[0] * this.maxSpeed;
        
        // Output 1: Rotation
        const rotation = outputs[1] * 0.1;
        
        // Output 2: Speed modifier
        const speedMod = (outputs[2] + 1) / 2; // Map to 0-1
        
        // Output 3: Not used currently
        
        // Apply movement
        this.angle += rotation;
        const force = new Vector2D(
            Math.cos(this.angle) * forward * speedMod,
            Math.sin(this.angle) * forward * speedMod
        );
        
        this.applyForce(force);
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force);
    }

    update() {
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.velocity.limit(this.maxSpeed);
        this.position = this.position.add(this.velocity);
        this.acceleration = new Vector2D();
        
        // Age and health
        this.age++;
        this.health -= 0.2;
    }

    eat(food) {
        for (let i = food.length - 1; i >= 0; i--) {
            const dist = this.position.distance(food[i]);
            if (dist < this.radius + 3) {
                food.splice(i, 1);
                this.health = Math.min(this.health + 20, 100);
                this.fitness += 10;
                return true;
            }
        }
        return false;
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

    reproduce() {
        if (this.health > 80 && Math.random() < 0.005) {
            const childBrain = this.brain.copy();
            childBrain.mutate(0.1);
            
            const child = new NeuralCreature(
                this.position.x + MathUtils.random(-20, 20),
                this.position.y + MathUtils.random(-20, 20),
                childBrain
            );
            
            // Inherit some color characteristics
            const parentHue = parseInt(this.color.match(/\d+/)[0]);
            const childHue = (parentHue + MathUtils.random(-30, 30) + 360) % 360;
            child.color = `hsl(${childHue}, 70%, 50%)`;
            
            this.health -= 30;
            return child;
        }
        return null;
    }

    draw(ctx, showSensors) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);
        
        // Body
        const alpha = this.health / 100;
        ctx.fillStyle = this.color.replace('50%)', `50%, ${alpha})`);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Direction indicator
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(this.radius * 0.6, -this.radius * 0.4);
        ctx.lineTo(this.radius * 0.6, this.radius * 0.4);
        ctx.closePath();
        ctx.fill();
        
        // Neural activity indicator
        const activity = Math.abs(this.velocity.magnitude()) / this.maxSpeed;
        ctx.fillStyle = `rgba(255, 255, 255, ${activity * alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Draw sensors if enabled
        if (showSensors) {
            ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.sensorRange, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

class NeuralCreatures extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.creatures = [];
        this.food = [];
        this.generation = 0;
        this.bestFitness = 0;
        
        // Parameters
        this.parameters = {
            populationSize: 30,
            foodSpawnRate: 0.02,
            maxFood: 100,
            mutationRate: 0.1,
            showSensors: false,
            showNeuralNetwork: true,
            elitism: true
        };
    }

    init() {
        this.creatures = [];
        this.food = [];
        this.generation = 0;
        
        // Create initial population
        const canvasWidth = this.canvas.width || 800;
        const canvasHeight = this.canvas.height || 600;
        
        for (let i = 0; i < this.parameters.populationSize; i++) {
            const x = Math.random() * canvasWidth;
            const y = Math.random() * canvasHeight;
            this.creatures.push(new NeuralCreature(x, y));
        }
        
        // Create initial food
        for (let i = 0; i < 30; i++) {
            this.spawnFood();
        }
    }

    spawnFood() {
        if (this.food.length < this.parameters.maxFood) {
            const canvasWidth = this.canvas.width || 800;
            const canvasHeight = this.canvas.height || 600;
            
            this.food.push(new Vector2D(
                MathUtils.random(20, canvasWidth - 20),
                MathUtils.random(20, canvasHeight - 20)
            ));
        }
    }

    update(deltaTime) {
        // Spawn food
        if (Math.random() < this.parameters.foodSpawnRate) {
            this.spawnFood();
        }
        
        // Update creatures
        for (let i = this.creatures.length - 1; i >= 0; i--) {
            const creature = this.creatures[i];
            
            // Get sensory inputs
            const inputs = creature.sense(this.food, this.creatures);
            
            // Neural network decision
            creature.think(inputs);
            
            // Update physics
            creature.update();
            creature.edges(this.canvas.width, this.canvas.height);
            
            // Try to eat
            creature.eat(this.food);
            
            // Check reproduction
            const child = creature.reproduce();
            if (child) {
                this.creatures.push(child);
            }
            
            // Remove dead creatures
            if (creature.health <= 0 || creature.age > 2000) {
                // Food drops on death
                this.food.push(creature.position.copy());
                this.creatures.splice(i, 1);
            }
        }
        
        // New generation if population is too low
        if (this.creatures.length < 5) {
            this.newGeneration();
        }
        
        // Update stats
        this.updateStats();
    }

    newGeneration() {
        this.generation++;
        
        // Sort by fitness
        this.creatures.sort((a, b) => b.fitness - a.fitness);
        
        // Keep best performers if elitism is enabled
        const survivors = this.parameters.elitism && this.creatures.length > 0 ? 
            this.creatures.slice(0, Math.min(5, this.creatures.length)) : [];
        
        // Record best fitness
        if (this.creatures.length > 0) {
            this.bestFitness = Math.max(this.bestFitness, this.creatures[0].fitness);
        }
        
        // Create new population
        const newCreatures = [];
        
        // Clone survivors
        for (const survivor of survivors) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const newCreature = new NeuralCreature(x, y, survivor.brain.copy());
            newCreature.color = survivor.color;
            newCreatures.push(newCreature);
        }
        
        // Fill rest with mutated versions or random
        while (newCreatures.length < this.parameters.populationSize) {
            let brain;
            
            if (survivors.length > 0 && Math.random() < 0.8) {
                // Mutate from survivor
                const parent = survivors[Math.floor(Math.random() * survivors.length)];
                brain = parent.brain.copy();
                brain.mutate(this.parameters.mutationRate);
            } else {
                // Random new brain
                brain = new NeuralNetwork(8, 16, 4);
            }
            
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            newCreatures.push(new NeuralCreature(x, y, brain));
        }
        
        this.creatures = newCreatures;
    }

    updateStats() {
        if (this.creatures.length > 0) {
            const avgFitness = this.creatures.reduce((sum, c) => sum + c.fitness, 0) / this.creatures.length;
            const avgHealth = this.creatures.reduce((sum, c) => sum + c.health, 0) / this.creatures.length;
            
            this.stats.generation = this.generation;
            this.stats.population = this.creatures.length;
            this.stats.avgFitness = avgFitness.toFixed(1);
            this.stats.bestFitness = this.bestFitness.toFixed(1);
            this.stats.avgHealth = avgHealth.toFixed(1);
        }
    }

    render() {
        // Clear canvas
        CanvasUtils.clear(this.ctx, '#000011');
        
        // Draw food
        this.ctx.fillStyle = '#00ff00';
        for (const f of this.food) {
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw creatures
        for (const creature of this.creatures) {
            creature.draw(this.ctx, this.parameters.showSensors);
        }
        
        // Draw best creature's neural network
        if (this.parameters.showNeuralNetwork && this.creatures.length > 0) {
            const best = this.creatures.reduce((a, b) => a.fitness > b.fitness ? a : b);
            this.drawNeuralNetwork(best.brain);
        }
    }

    drawNeuralNetwork(brain) {
        const x = this.canvas.width - 200;
        const y = 10;
        const width = 180;
        const height = 150;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x - 5, y - 5, width + 10, height + 10);
        
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('Best Neural Network', x, y + 10);
        
        // Draw network visualization
        const layers = [brain.inputSize, brain.hiddenSize, brain.outputSize];
        const layerX = [x + 20, x + width/2, x + width - 20];
        
        // Draw connections
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        for (let l = 0; l < layers.length - 1; l++) {
            const y1Start = y + 30 + (height - 40) / 2 - (layers[l] * 10) / 2;
            const y2Start = y + 30 + (height - 40) / 2 - (layers[l + 1] * 10) / 2;
            
            for (let i = 0; i < layers[l]; i++) {
                for (let j = 0; j < layers[l + 1]; j++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(layerX[l], y1Start + i * 10);
                    this.ctx.lineTo(layerX[l + 1], y2Start + j * 10);
                    this.ctx.stroke();
                }
            }
        }
        
        // Draw neurons
        for (let l = 0; l < layers.length; l++) {
            const yStart = y + 30 + (height - 40) / 2 - (layers[l] * 10) / 2;
            
            for (let i = 0; i < layers[l]; i++) {
                this.ctx.fillStyle = l === 0 ? '#ff6666' : l === layers.length - 1 ? '#66ff66' : '#6666ff';
                this.ctx.beginPath();
                this.ctx.arc(layerX[l], yStart + i * 10, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    onMouseClick(event) {
        const pos = this.getMousePos(event);
        
        // Add food at click position
        this.food.push(new Vector2D(pos.x, pos.y));
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
            name: "Neural Network Creatures",
            description: "Creatures controlled by neural networks learn to find food through evolution. Each creature has sensors and a brain that evolves over generations.",
            instructions: "Click to add food. Creatures sense walls, nearest food, and other creatures. The neural network visualization shows the best performer's brain."
        };
    }

    getParameterDefs() {
        return [
            {
                name: 'populationSize',
                type: 'range',
                min: 10,
                max: 100,
                step: 5,
                defaultValue: 30,
                label: 'Population Size'
            },
            {
                name: 'foodSpawnRate',
                type: 'range',
                min: 0,
                max: 0.1,
                step: 0.01,
                defaultValue: 0.02,
                label: 'Food Spawn Rate'
            },
            {
                name: 'maxFood',
                type: 'range',
                min: 20,
                max: 200,
                step: 10,
                defaultValue: 100,
                label: 'Max Food'
            },
            {
                name: 'mutationRate',
                type: 'range',
                min: 0.01,
                max: 0.5,
                step: 0.01,
                defaultValue: 0.1,
                label: 'Mutation Rate'
            },
            {
                name: 'showSensors',
                type: 'checkbox',
                defaultValue: false,
                label: 'Show Sensors'
            },
            {
                name: 'showNeuralNetwork',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show Best Brain'
            },
            {
                name: 'elitism',
                type: 'checkbox',
                defaultValue: true,
                label: 'Keep Best Performers'
            }
        ];
    }
}

// Register simulation
window.NeuralCreatures = NeuralCreatures;