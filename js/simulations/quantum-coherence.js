// Quantum Coherence Colonies simulation

class QuantumAgent {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D();
        
        // Quantum properties
        this.waveFunction = {
            amplitude: MathUtils.random(0.5, 1.0),
            phase: Math.random() * Math.PI * 2,
            coherenceRadius: MathUtils.random(30, 60),
            uncertainty: MathUtils.random(5, 15)
        };
        
        // Entanglement network
        this.entanglements = new Set();
        this.maxEntanglements = 3;
        
        // Behavioral states (superposition)
        this.behaviorStates = [
            { type: 'explore', probability: 0.4, direction: Vector2D.random() },
            { type: 'cluster', probability: 0.3, target: null },
            { type: 'avoid', probability: 0.2, direction: Vector2D.random() },
            { type: 'phase', probability: 0.1, phaseShift: Math.random() * Math.PI }
        ];
        
        // Visual properties
        this.baseColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        this.radius = 4;
        this.maxSpeed = 1.5;
        
        // Measurement history
        this.lastMeasurement = 0;
        this.measurementDecay = 100;
        this.collapsedState = null;
    }
    
    updateQuantumState(agents, deltaTime) {
        // Evolve phase
        this.waveFunction.phase += 0.02 * deltaTime;
        
        // Decoherence over time
        this.waveFunction.amplitude *= 0.999;
        if (this.waveFunction.amplitude < 0.1) {
            this.waveFunction.amplitude = MathUtils.random(0.5, 1.0);
            this.waveFunction.phase = Math.random() * Math.PI * 2;
        }
        
        // Update entanglements
        this.updateEntanglements(agents);
        
        // Collapse measurement effects
        if (this.collapsedState && Date.now() - this.lastMeasurement > this.measurementDecay) {
            this.collapsedState = null;
        }
    }
    
    updateEntanglements(agents) {
        // Remove distant entanglements
        for (const entangled of this.entanglements) {
            if (this.position.distance(entangled.position) > this.waveFunction.coherenceRadius * 2) {
                this.entanglements.delete(entangled);
                entangled.entanglements.delete(this);
            }
        }
        
        // Form new entanglements
        if (this.entanglements.size < this.maxEntanglements) {
            for (const other of agents) {
                if (other === this || this.entanglements.has(other)) continue;
                
                const distance = this.position.distance(other.position);
                if (distance < this.waveFunction.coherenceRadius && 
                    other.entanglements.size < other.maxEntanglements) {
                    
                    // Probability of entanglement based on phase alignment
                    const phaseDiff = Math.abs(this.waveFunction.phase - other.waveFunction.phase);
                    const alignmentFactor = Math.cos(phaseDiff);
                    
                    if (Math.random() < alignmentFactor * 0.02) {
                        this.entanglements.add(other);
                        other.entanglements.add(this);
                    }
                }
            }
        }
    }
    
    measureAndCollapse(force = false) {
        if (this.collapsedState && !force) return this.collapsedState;
        
        // Measurement causes wave function collapse
        const totalProb = this.behaviorStates.reduce((sum, state) => sum + state.probability, 0);
        let random = Math.random() * totalProb;
        
        for (const state of this.behaviorStates) {
            random -= state.probability;
            if (random <= 0) {
                this.collapsedState = state;
                this.lastMeasurement = Date.now();
                
                // Entangled particles collapse together
                for (const entangled of this.entanglements) {
                    if (!entangled.collapsedState || force) {
                        entangled.collapsedState = { ...state };
                        entangled.lastMeasurement = this.lastMeasurement;
                    }
                }
                
                return state;
            }
        }
        
        return this.behaviorStates[0];
    }
    
    quantumTunnel(obstacles) {
        // Probability of tunneling through obstacles
        const tunnelProbability = this.waveFunction.amplitude * 0.01;
        
        for (const obstacle of obstacles) {
            if (this.position.distance(obstacle) < this.radius + 5) {
                if (Math.random() < tunnelProbability) {
                    // Tunnel through
                    const direction = this.position.subtract(obstacle).normalize();
                    this.position = this.position.add(direction.multiply(20));
                    return true;
                }
            }
        }
        return false;
    }
    
    update(agents, deltaTime) {
        this.updateQuantumState(agents, deltaTime);
        
        // Get current behavior through measurement
        const behavior = this.measureAndCollapse();
        
        let force = new Vector2D();
        
        switch (behavior.type) {
            case 'explore':
                force = behavior.direction.multiply(0.5);
                // Occasionally change direction
                if (Math.random() < 0.02) {
                    behavior.direction = Vector2D.random();
                }
                break;
                
            case 'cluster':
                // Move toward center of nearby agents
                let centerX = 0, centerY = 0, count = 0;
                for (const other of agents) {
                    if (other === this) continue;
                    const dist = this.position.distance(other.position);
                    if (dist < 50) {
                        centerX += other.position.x;
                        centerY += other.position.y;
                        count++;
                    }
                }
                if (count > 0) {
                    const center = new Vector2D(centerX / count, centerY / count);
                    force = center.subtract(this.position).normalize().multiply(0.3);
                }
                break;
                
            case 'avoid':
                // Avoid other agents
                for (const other of agents) {
                    if (other === this) continue;
                    const dist = this.position.distance(other.position);
                    if (dist < 30) {
                        const away = this.position.subtract(other.position).normalize();
                        force = force.add(away.multiply(0.5 / dist));
                    }
                }
                break;
                
            case 'phase':
                // Phase-coherent circular motion
                const angle = this.waveFunction.phase + behavior.phaseShift;
                force = new Vector2D(Math.cos(angle), Math.sin(angle)).multiply(0.4);
                break;
        }
        
        // Apply quantum uncertainty to movement
        const uncertainty = new Vector2D(
            MathUtils.gaussian(0, this.waveFunction.uncertainty * 0.01),
            MathUtils.gaussian(0, this.waveFunction.uncertainty * 0.01)
        );
        force = force.add(uncertainty);
        
        // Update position
        this.velocity = this.velocity.add(force).limit(this.maxSpeed);
        this.position = this.position.add(this.velocity);
        
        // Apply drag
        this.velocity = this.velocity.multiply(0.98);
    }
    
    edges(width, height) {
        // Reflective boundaries with quantum tunneling chance
        if (this.position.x < this.radius) {
            if (Math.random() > this.waveFunction.amplitude * 0.1) {
                this.position.x = this.radius;
                this.velocity.x *= -1;
            } else {
                this.position.x = width - this.radius; // Tunnel to other side
            }
        }
        if (this.position.x > width - this.radius) {
            if (Math.random() > this.waveFunction.amplitude * 0.1) {
                this.position.x = width - this.radius;
                this.velocity.x *= -1;
            } else {
                this.position.x = this.radius;
            }
        }
        if (this.position.y < this.radius) {
            if (Math.random() > this.waveFunction.amplitude * 0.1) {
                this.position.y = this.radius;
                this.velocity.y *= -1;
            } else {
                this.position.y = height - this.radius;
            }
        }
        if (this.position.y > height - this.radius) {
            if (Math.random() > this.waveFunction.amplitude * 0.1) {
                this.position.y = height - this.radius;
                this.velocity.y *= -1;
            } else {
                this.position.y = this.radius;
            }
        }
    }
    
    draw(ctx, showQuantumState = false) {
        // Draw coherence field
        if (showQuantumState) {
            const alpha = this.waveFunction.amplitude * 0.2;
            ctx.fillStyle = `rgba(100, 150, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.waveFunction.coherenceRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw uncertainty cloud
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.waveFunction.uncertainty, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw entanglement lines
        ctx.strokeStyle = 'rgba(255, 100, 255, 0.3)';
        ctx.lineWidth = 1;
        for (const entangled of this.entanglements) {
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(entangled.position.x, entangled.position.y);
            ctx.stroke();
        }
        
        // Draw agent
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        
        // Phase-dependent rotation
        ctx.rotate(this.waveFunction.phase);
        
        // Main body - intensity based on wave function amplitude
        const alpha = this.waveFunction.amplitude;
        ctx.fillStyle = this.baseColor.replace('50%)', `50%, ${alpha})`);
        
        if (this.collapsedState) {
            // Solid appearance when measured
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // State indicator
            ctx.fillStyle = this.getStateColor();
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Fuzzy superposition appearance
            const gradients = 5;
            for (let i = 0; i < gradients; i++) {
                const r = this.radius * (1 - i / gradients);
                const a = alpha * (1 - i / gradients) * 0.3;
                ctx.fillStyle = this.baseColor.replace('50%)', `50%, ${a})`);
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    getStateColor() {
        if (!this.collapsedState) return '#ffffff';
        
        switch (this.collapsedState.type) {
            case 'explore': return '#00ff00';
            case 'cluster': return '#0088ff';
            case 'avoid': return '#ff0044';
            case 'phase': return '#ff8800';
            default: return '#ffffff';
        }
    }
}

class QuantumCoherenceColonies extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.agents = [];
        this.measurementZones = [];
        
        this.parameters = {
            agentCount: 40,
            showQuantumState: true,
            showEntanglements: true,
            measurementFrequency: 0.01,
            coherenceDecay: 0.999,
            maxEntanglements: 3
        };
        
        this.stats = {
            totalEntanglements: 0,
            avgCoherence: 0,
            collapsedAgents: 0
        };
    }
    
    init() {
        this.agents = [];
        this.measurementZones = [];
        
        const canvasWidth = this.canvas.width || 800;
        const canvasHeight = this.canvas.height || 600;
        
        // Create quantum agents
        for (let i = 0; i < this.parameters.agentCount; i++) {
            this.agents.push(new QuantumAgent(
                MathUtils.random(50, canvasWidth - 50),
                MathUtils.random(50, canvasHeight - 50)
            ));
        }
        
        // Create measurement zones
        for (let i = 0; i < 3; i++) {
            this.measurementZones.push({
                position: new Vector2D(
                    MathUtils.random(100, canvasWidth - 100),
                    MathUtils.random(100, canvasHeight - 100)
                ),
                radius: MathUtils.random(30, 60),
                active: false
            });
        }
    }
    
    update(deltaTime) {
        // Update measurement zones
        for (const zone of this.measurementZones) {
            zone.active = Math.random() < this.parameters.measurementFrequency;
        }
        
        // Update agents
        for (const agent of this.agents) {
            agent.update(this.agents, deltaTime);
            agent.edges(this.canvas.width, this.canvas.height);
            
            // Check measurement zones
            for (const zone of this.measurementZones) {
                if (zone.active && agent.position.distance(zone.position) < zone.radius) {
                    agent.measureAndCollapse(true);
                }
            }
        }
        
        this.updateStats();
    }
    
    updateStats() {
        let totalEntanglements = 0;
        let totalCoherence = 0;
        let collapsedCount = 0;
        
        for (const agent of this.agents) {
            totalEntanglements += agent.entanglements.size;
            totalCoherence += agent.waveFunction.amplitude;
            if (agent.collapsedState) collapsedCount++;
        }
        
        this.stats.totalEntanglements = Math.floor(totalEntanglements / 2); // Each entanglement counted twice
        this.stats.avgCoherence = (totalCoherence / this.agents.length).toFixed(2);
        this.stats.collapsedAgents = collapsedCount;
    }
    
    render() {
        CanvasUtils.clear(this.ctx, '#000022');
        
        // Draw measurement zones
        for (const zone of this.measurementZones) {
            const alpha = zone.active ? 0.3 : 0.1;
            this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(zone.position.x, zone.position.y, zone.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (zone.active) {
                this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
        
        // Draw agents
        for (const agent of this.agents) {
            agent.draw(this.ctx, this.parameters.showQuantumState);
        }
        
        // Draw quantum field visualization
        if (this.parameters.showQuantumState) {
            this.drawQuantumField();
        }
    }
    
    drawQuantumField() {
        const gridSize = 20;
        const ctx = this.ctx;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            for (let y = 0; y < this.canvas.height; y += gridSize) {
                let fieldStrength = 0;
                let phaseAccumulation = 0;
                
                for (const agent of this.agents) {
                    const distance = MathUtils.distance(x, y, agent.position.x, agent.position.y);
                    if (distance < agent.waveFunction.coherenceRadius) {
                        const influence = agent.waveFunction.amplitude * Math.exp(-distance / 30);
                        fieldStrength += influence;
                        phaseAccumulation += agent.waveFunction.phase * influence;
                    }
                }
                
                if (fieldStrength > 0.1) {
                    const avgPhase = phaseAccumulation / fieldStrength;
                    const hue = (avgPhase * 180 / Math.PI + 180) % 360;
                    const alpha = Math.min(fieldStrength * 0.3, 0.5);
                    
                    ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
                    ctx.fillRect(x, y, gridSize, gridSize);
                }
            }
        }
    }
    
    onMouseClick(event) {
        const pos = this.getMousePos(event);
        
        // Force measurement at click position
        for (const agent of this.agents) {
            if (agent.position.distance(pos) < 50) {
                agent.measureAndCollapse(true);
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
    }
    
    getInfo() {
        return {
            name: "Quantum Coherence Colonies",
            description: "Agents exist in quantum superposition states with entangled behaviors. Measurement zones cause wave function collapse, creating synchronized collective behaviors through quantum entanglement.",
            instructions: "Click to force measurement and collapse nearby agent wave functions. Watch how entangled agents collapse together and exhibit correlated behaviors."
        };
    }
    
    getParameterDefs() {
        return [
            {
                name: 'agentCount',
                type: 'range',
                min: 10,
                max: 80,
                step: 5,
                defaultValue: 40,
                label: 'Agent Count'
            },
            {
                name: 'showQuantumState',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show Quantum Fields'
            },
            {
                name: 'measurementFrequency',
                type: 'range',
                min: 0,
                max: 0.05,
                step: 0.005,
                defaultValue: 0.01,
                label: 'Measurement Rate'
            }
        ];
    }
}

// Register simulation
window.QuantumCoherenceColonies = QuantumCoherenceColonies;