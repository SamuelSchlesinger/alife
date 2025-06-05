// Temporal Echo Networks simulation

class TemporalEcho {
    constructor(position, velocity, timestamp, confidence = 1.0) {
        this.position = position.copy();
        this.velocity = velocity.copy();
        this.timestamp = timestamp;
        this.confidence = confidence;
        this.decay = 0.99;
        this.influenceRadius = 40;
    }
    
    update() {
        this.confidence *= this.decay;
        return this.confidence > 0.1;
    }
    
    getInfluence(currentPos, currentTime) {
        const timeDiff = Math.abs(this.timestamp - currentTime);
        const distance = this.position.distance(currentPos);
        
        if (distance > this.influenceRadius || timeDiff > 100) return 0;
        
        const timeWeight = Math.exp(-timeDiff / 50);
        const spatialWeight = Math.exp(-distance / this.influenceRadius);
        
        return this.confidence * timeWeight * spatialWeight;
    }
    
    draw(ctx, currentTime) {
        const alpha = this.confidence * Math.exp(-Math.abs(this.timestamp - currentTime) / 100);
        if (alpha < 0.05) return;
        
        const isFuture = this.timestamp > currentTime;
        const color = isFuture ? 'rgba(100, 255, 100' : 'rgba(255, 100, 100';
        
        ctx.fillStyle = `${color}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw velocity vector
        if (alpha > 0.2) {
            ctx.strokeStyle = `${color}, ${alpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(
                this.position.x + this.velocity.x * 10,
                this.position.y + this.velocity.y * 10
            );
            ctx.stroke();
        }
    }
}

class TemporalAgent {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D();
        this.acceleration = new Vector2D();
        
        // Temporal properties
        this.echoHistory = []; // Past echoes
        this.echoFuture = [];  // Future echoes
        this.maxEchoes = 20;
        this.echoInterval = 15; // frames between echoes
        this.lastEchoTime = 0;
        this.timeStep = 0;
        
        // Prediction and feedback
        this.predictiveHorizon = 60; // frames to look ahead
        this.feedbackStrength = 0.3;
        this.temporalStress = 0; // Stress from temporal paradoxes
        
        // Physical properties
        this.radius = 5;
        this.maxSpeed = 2;
        this.maxForce = 0.15;
        
        // Behavioral traits
        this.explorationTendency = Math.random();
        this.socialTendency = Math.random();
        this.predictionAccuracy = 0.5;
        
        // Visual properties
        this.baseColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        this.age = 0;
        this.fitness = 0;
    }
    
    castEcho(futureTime) {
        // Predict future state
        const futurePos = this.predictPosition(futureTime - this.timeStep);
        const futureVel = this.predictVelocity(futureTime - this.timeStep);
        
        // Confidence decreases with distance into future
        const timeDist = futureTime - this.timeStep;
        const confidence = Math.exp(-timeDist / this.predictiveHorizon) * this.predictionAccuracy;
        
        return new TemporalEcho(futurePos, futureVel, futureTime, confidence);
    }
    
    predictPosition(deltaTime) {
        // Simple physics-based prediction
        let pos = this.position.copy();
        let vel = this.velocity.copy();
        
        for (let i = 0; i < deltaTime; i++) {
            // Add some random walk component for uncertainty
            const noise = new Vector2D(
                MathUtils.gaussian(0, 0.1),
                MathUtils.gaussian(0, 0.1)
            );
            vel = vel.add(noise).limit(this.maxSpeed);
            pos = pos.add(vel);
        }
        
        return pos;
    }
    
    predictVelocity(deltaTime) {
        // Velocity prediction with decay
        return this.velocity.multiply(Math.pow(0.99, deltaTime));
    }
    
    senseEchoes(allAgents) {
        let echoInfluence = new Vector2D();
        let temporalConflicts = 0;
        
        // Sense own future echoes
        for (const echo of this.echoFuture) {
            const influence = echo.getInfluence(this.position, this.timeStep);
            if (influence > 0.1) {
                // Future echo pulls agent toward predicted position
                const direction = echo.position.subtract(this.position).normalize();
                echoInfluence = echoInfluence.add(direction.multiply(influence * this.feedbackStrength));
                
                // Check for temporal conflicts
                const predictedDist = this.position.distance(echo.position);
                const actualDist = predictedDist; // Would need more complex prediction
                if (Math.abs(predictedDist - actualDist) > 20) {
                    temporalConflicts++;
                }
            }
        }
        
        // Sense echoes from other agents
        for (const other of allAgents) {
            if (other === this) continue;
            
            // Sense their future echoes
            for (const echo of other.echoFuture) {
                const influence = echo.getInfluence(this.position, this.timeStep);
                if (influence > 0.05) {
                    // Other agents' future positions create avoidance
                    const direction = this.position.subtract(echo.position).normalize();
                    echoInfluence = echoInfluence.add(direction.multiply(influence * 0.1));
                }
            }
            
            // Sense their past echoes for pattern learning
            for (const echo of other.echoHistory) {
                const influence = echo.getInfluence(this.position, this.timeStep);
                if (influence > 0.05) {
                    // Learn from successful past behaviors
                    const direction = echo.velocity.normalize();
                    echoInfluence = echoInfluence.add(direction.multiply(influence * 0.05));
                }
            }
        }
        
        this.temporalStress = temporalConflicts / Math.max(this.echoFuture.length, 1);
        return echoInfluence;
    }
    
    update(agents, deltaTime) {
        this.timeStep++;
        this.age++;
        
        // Cast new echo if it's time
        if (this.timeStep - this.lastEchoTime >= this.echoInterval) {
            // Cast future echo
            const futureTime = this.timeStep + this.predictiveHorizon;
            const futureEcho = this.castEcho(futureTime);
            this.echoFuture.push(futureEcho);
            
            // Store past echo
            const pastEcho = new TemporalEcho(this.position, this.velocity, this.timeStep);
            this.echoHistory.push(pastEcho);
            
            this.lastEchoTime = this.timeStep;
            
            // Limit echo arrays
            if (this.echoFuture.length > this.maxEchoes) {
                this.echoFuture.shift();
            }
            if (this.echoHistory.length > this.maxEchoes) {
                this.echoHistory.shift();
            }
        }
        
        // Update echoes
        this.echoFuture = this.echoFuture.filter(echo => echo.update());
        this.echoHistory = this.echoHistory.filter(echo => echo.update());
        
        // Get temporal influences
        const echoForce = this.senseEchoes(agents);
        
        // Basic behavioral forces
        let behaviorForce = new Vector2D();
        
        // Exploration
        if (Math.random() < 0.02) {
            behaviorForce = behaviorForce.add(Vector2D.random().multiply(this.explorationTendency * 0.3));
        }
        
        // Social behavior
        for (const other of agents) {
            if (other === this) continue;
            const distance = this.position.distance(other.position);
            
            if (distance < 30 && this.socialTendency > 0.5) {
                // Attraction
                const direction = other.position.subtract(this.position).normalize();
                behaviorForce = behaviorForce.add(direction.multiply(0.1));
            } else if (distance < 15) {
                // Avoidance
                const direction = this.position.subtract(other.position).normalize();
                behaviorForce = behaviorForce.add(direction.multiply(0.2));
            }
        }
        
        // Combine forces
        const totalForce = behaviorForce.add(echoForce);
        
        // Apply temporal stress penalty
        const stressPenalty = this.temporalStress * 0.1;
        const adjustedForce = totalForce.multiply(1 - stressPenalty);
        
        // Update physics
        this.acceleration = adjustedForce.limit(this.maxForce);
        this.velocity = this.velocity.add(this.acceleration).limit(this.maxSpeed);
        this.position = this.position.add(this.velocity);
        
        // Update prediction accuracy based on temporal conflicts
        if (this.temporalStress > 0.5) {
            this.predictionAccuracy *= 0.99; // Decrease accuracy
        } else {
            this.predictionAccuracy = Math.min(1.0, this.predictionAccuracy * 1.001); // Increase accuracy
        }
        
        // Calculate fitness based on prediction accuracy and low temporal stress
        this.fitness += (this.predictionAccuracy * (1 - this.temporalStress)) * 0.01;
    }
    
    edges(width, height) {
        let wrapped = false;
        
        if (this.position.x < this.radius) {
            this.position.x = width - this.radius;
            wrapped = true;
        }
        if (this.position.x > width - this.radius) {
            this.position.x = this.radius;
            wrapped = true;
        }
        if (this.position.y < this.radius) {
            this.position.y = height - this.radius;
            wrapped = true;
        }
        if (this.position.y > height - this.radius) {
            this.position.y = this.radius;
            wrapped = true;
        }
        
        // Wrapping disrupts temporal predictions, increase stress
        if (wrapped) {
            this.temporalStress = Math.min(1.0, this.temporalStress + 0.2);
        }
    }
    
    draw(ctx, showEchoes = true, currentTime = 0) {
        // Draw echoes
        if (showEchoes) {
            // Draw future echoes
            for (const echo of this.echoFuture) {
                echo.draw(ctx, currentTime || this.timeStep);
            }
            
            // Draw past echoes
            for (const echo of this.echoHistory) {
                echo.draw(ctx, currentTime || this.timeStep);
            }
            
            // Draw temporal stress field
            if (this.temporalStress > 0.3) {
                const alpha = this.temporalStress * 0.3;
                ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.radius * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw main agent
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.velocity.angle());
        
        // Body color influenced by prediction accuracy
        const accuracy = this.predictionAccuracy;
        const hue = parseInt(this.baseColor.match(/\d+/)[0]);
        const adjustedHue = (hue + (1 - accuracy) * 60) % 360; // Red shift for poor prediction
        
        ctx.fillStyle = `hsl(${adjustedHue}, 70%, ${50 + accuracy * 20}%)`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${accuracy})`;
        ctx.lineWidth = 1;
        
        // Main body
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius, this.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Direction indicator
        ctx.fillStyle = `rgba(255, 255, 255, ${accuracy})`;
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(this.radius * 0.6, -this.radius * 0.3);
        ctx.lineTo(this.radius * 0.6, this.radius * 0.3);
        ctx.closePath();
        ctx.fill();
        
        // Temporal resonance indicator
        if (this.echoFuture.length > 0) {
            const resonance = this.echoFuture.reduce((sum, echo) => sum + echo.confidence, 0) / this.echoFuture.length;
            ctx.fillStyle = `rgba(0, 255, 255, ${resonance})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class TemporalEchoNetworks extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.agents = [];
        this.timeStep = 0;
        this.temporalAnomalies = [];
        
        this.parameters = {
            agentCount: 25,
            showEchoes: true,
            showTemporalField: true,
            echoDecay: 0.99,
            feedbackStrength: 0.3,
            predictiveHorizon: 60
        };
        
        this.stats = {
            avgPredictionAccuracy: 0,
            temporalConflicts: 0,
            echoCount: 0,
            avgFitness: 0
        };
    }
    
    init() {
        this.agents = [];
        this.timeStep = 0;
        this.temporalAnomalies = [];
        
        const canvasWidth = this.canvas.width || 800;
        const canvasHeight = this.canvas.height || 600;
        
        // Create temporal agents
        for (let i = 0; i < this.parameters.agentCount; i++) {
            this.agents.push(new TemporalAgent(
                MathUtils.random(50, canvasWidth - 50),
                MathUtils.random(50, canvasHeight - 50)
            ));
        }
    }
    
    update(deltaTime) {
        this.timeStep++;
        
        // Update agents
        for (const agent of this.agents) {
            agent.update(this.agents, deltaTime);
            agent.edges(this.canvas.width, this.canvas.height);
        }
        
        // Detect temporal anomalies
        this.detectTemporalAnomalies();
        
        // Update stats
        this.updateStats();
    }
    
    detectTemporalAnomalies() {
        // Clear old anomalies
        this.temporalAnomalies = this.temporalAnomalies.filter(anomaly => 
            this.timeStep - anomaly.timestamp < 100
        );
        
        // Check for causal loops and paradoxes
        for (let i = 0; i < this.agents.length; i++) {
            for (let j = i + 1; j < this.agents.length; j++) {
                const agent1 = this.agents[i];
                const agent2 = this.agents[j];
                
                // Check if their echo networks are creating feedback loops
                const dist = agent1.position.distance(agent2.position);
                if (dist < 50) {
                    let echoOverlap = 0;
                    
                    for (const echo1 of agent1.echoFuture) {
                        for (const echo2 of agent2.echoFuture) {
                            if (echo1.position.distance(echo2.position) < 20) {
                                echoOverlap++;
                            }
                        }
                    }
                    
                    if (echoOverlap > 3) {
                        // Temporal anomaly detected
                        this.temporalAnomalies.push({
                            position: agent1.position.add(agent2.position).divide(2),
                            strength: echoOverlap / 10,
                            timestamp: this.timeStep,
                            type: 'causal_loop'
                        });
                    }
                }
            }
        }
    }
    
    updateStats() {
        let totalAccuracy = 0;
        let totalConflicts = 0;
        let totalEchoes = 0;
        let totalFitness = 0;
        
        for (const agent of this.agents) {
            totalAccuracy += agent.predictionAccuracy;
            totalConflicts += agent.temporalStress;
            totalEchoes += agent.echoFuture.length + agent.echoHistory.length;
            totalFitness += agent.fitness;
        }
        
        this.stats.avgPredictionAccuracy = (totalAccuracy / this.agents.length).toFixed(3);
        this.stats.temporalConflicts = Math.floor(totalConflicts);
        this.stats.echoCount = totalEchoes;
        this.stats.avgFitness = (totalFitness / this.agents.length).toFixed(2);
    }
    
    render() {
        CanvasUtils.clear(this.ctx, '#001122');
        
        // Draw temporal field
        if (this.parameters.showTemporalField) {
            this.drawTemporalField();
        }
        
        // Draw temporal anomalies
        for (const anomaly of this.temporalAnomalies) {
            const age = this.timeStep - anomaly.timestamp;
            const alpha = Math.exp(-age / 50) * anomaly.strength;
            
            this.ctx.fillStyle = `rgba(255, 100, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(anomaly.position.x, anomaly.position.y, 20 + age, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Ripple effect
            this.ctx.strokeStyle = `rgba(255, 100, 255, ${alpha * 0.5})`;
            this.ctx.lineWidth = 2;
            for (let r = 20; r < 60; r += 15) {
                this.ctx.beginPath();
                this.ctx.arc(anomaly.position.x, anomaly.position.y, r + age * 2, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        // Draw agents
        for (const agent of this.agents) {
            agent.draw(this.ctx, this.parameters.showEchoes, this.timeStep);
        }
        
        // Draw time indicator
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`Time: ${this.timeStep}`, 10, 20);
    }
    
    drawTemporalField() {
        const gridSize = 25;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                let futureInfluence = 0;
                let pastInfluence = 0;
                
                for (const agent of this.agents) {
                    // Sample future echoes
                    for (const echo of agent.echoFuture) {
                        const influence = echo.getInfluence(new Vector2D(x, y), this.timeStep);
                        futureInfluence += influence;
                    }
                    
                    // Sample past echoes
                    for (const echo of agent.echoHistory) {
                        const influence = echo.getInfluence(new Vector2D(x, y), this.timeStep);
                        pastInfluence += influence;
                    }
                }
                
                // Visualize temporal density
                if (futureInfluence > 0.1) {
                    const alpha = Math.min(futureInfluence * 0.3, 0.4);
                    this.ctx.fillStyle = `rgba(100, 255, 100, ${alpha})`;
                    this.ctx.fillRect(x, y, gridSize, gridSize);
                }
                
                if (pastInfluence > 0.1) {
                    const alpha = Math.min(pastInfluence * 0.3, 0.4);
                    this.ctx.fillStyle = `rgba(255, 100, 100, ${alpha})`;
                    this.ctx.fillRect(x, y, gridSize, gridSize);
                }
            }
        }
    }
    
    onMouseClick(event) {
        const pos = this.getMousePos(event);
        
        // Create temporal disturbance
        this.temporalAnomalies.push({
            position: pos,
            strength: 1.0,
            timestamp: this.timeStep,
            type: 'manual_disturbance'
        });
        
        // Disrupt nearby agents' predictions
        for (const agent of this.agents) {
            if (agent.position.distance(pos) < 80) {
                agent.temporalStress = Math.min(1.0, agent.temporalStress + 0.5);
                agent.predictionAccuracy *= 0.8;
                
                // Clear some future echoes
                agent.echoFuture = agent.echoFuture.slice(0, Math.floor(agent.echoFuture.length / 2));
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
        if (name === 'agentCount' && value !== this.parameters.agentCount) {
            this.parameters.agentCount = value;
            this.init();
        }
        
        // Update agent parameters
        if (name === 'feedbackStrength') {
            for (const agent of this.agents) {
                agent.feedbackStrength = value;
            }
        }
        
        if (name === 'predictiveHorizon') {
            for (const agent of this.agents) {
                agent.predictiveHorizon = value;
            }
        }
    }
    
    getInfo() {
        return {
            name: "Temporal Echo Networks",
            description: "Agents cast probabilistic echoes of their future states that influence present decision-making. Temporal paradoxes create stress and drive evolution of predictive abilities.",
            instructions: "Click to create temporal disturbances that disrupt prediction networks. Green trails show future echoes, red trails show past echoes. Watch for purple anomalies indicating causal loops."
        };
    }
    
    getParameterDefs() {
        return [
            {
                name: 'agentCount',
                type: 'range',
                min: 10,
                max: 50,
                step: 5,
                defaultValue: 25,
                label: 'Agent Count'
            },
            {
                name: 'showEchoes',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show Temporal Echoes'
            },
            {
                name: 'showTemporalField',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show Temporal Field'
            },
            {
                name: 'feedbackStrength',
                type: 'range',
                min: 0,
                max: 1,
                step: 0.1,
                defaultValue: 0.3,
                label: 'Echo Feedback Strength'
            },
            {
                name: 'predictiveHorizon',
                type: 'range',
                min: 20,
                max: 120,
                step: 10,
                defaultValue: 60,
                label: 'Predictive Horizon'
            }
        ];
    }
}

// Register simulation
window.TemporalEchoNetworks = TemporalEchoNetworks;