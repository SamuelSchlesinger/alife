// Slime Mold (Physarum) simulation

class SlimeMold extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.agents = [];
        this.trailMap = [];
        this.width = 0;
        this.height = 0;
        
        // Parameters
        this.parameters = {
            agentCount: 10000,
            sensorAngle: 30,
            sensorDistance: 9,
            rotationAngle: 45,
            stepSize: 1,
            depositionAmount: 5,
            decayRate: 0.9,
            diffusionRate: 0.1,
            attractionMode: true
        };
        
        // Visualization
        this.trailCanvas = null;
        this.trailCtx = null;
        this.imageData = null;
    }

    init() {
        // Get canvas dimensions with fallbacks
        this.width = this.canvas.width || 800;
        this.height = this.canvas.height || 600;
        
        // Ensure minimum dimensions
        this.width = Math.max(100, this.width);
        this.height = Math.max(100, this.height);
        
        try {
            // Create off-screen canvas for trails
            this.trailCanvas = document.createElement('canvas');
            this.trailCanvas.width = this.width;
            this.trailCanvas.height = this.height;
            this.trailCtx = this.trailCanvas.getContext('2d');
            
            // Initialize trail map
            const size = this.width * this.height;
            this.trailMap = new Float32Array(size);
            
            // Create image data for fast rendering
            this.imageData = this.ctx.createImageData(this.width, this.height);
            
            // Initialize agents
            this.agents = [];
            this.initializeAgents(this.parameters.agentCount);
            
        } catch (error) {
            console.warn('SlimeMold initialization error:', error);
            // Fallback initialization
            this.agents = [];
            this.trailMap = new Float32Array(this.width * this.height);
            this.imageData = null;
        }
    }

    initializeAgents(count) {
        this.agents = [];
        
        // Create agents in a circle
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 4;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;
            
            this.agents.push({
                x: centerX + Math.cos(angle) * r,
                y: centerY + Math.sin(angle) * r,
                angle: angle + Math.PI + (Math.random() - 0.5) * 0.5
            });
        }
    }

    getTrailValue(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 0;
        }
        
        return this.trailMap[y * this.width + x];
    }

    setTrailValue(x, y, value) {
        x = Math.floor(x);
        y = Math.floor(y);
        
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.trailMap[y * this.width + x] = value;
        }
    }

    sense(agent, angleOffset) {
        const sensorAngle = agent.angle + angleOffset;
        const sensorX = agent.x + Math.cos(sensorAngle) * this.parameters.sensorDistance;
        const sensorY = agent.y + Math.sin(sensorAngle) * this.parameters.sensorDistance;
        
        return this.getTrailValue(sensorX, sensorY);
    }

    update(deltaTime) {
        // Check if properly initialized
        if (!this.agents || !this.trailMap) {
            return;
        }
        
        // Update agents
        const sensorAngleRad = this.parameters.sensorAngle * Math.PI / 180;
        const rotationAngleRad = this.parameters.rotationAngle * Math.PI / 180;
        
        for (const agent of this.agents) {
            // Sense in three directions
            const senseForward = this.sense(agent, 0);
            const senseLeft = this.sense(agent, -sensorAngleRad);
            const senseRight = this.sense(agent, sensorAngleRad);
            
            // Determine rotation based on sensing
            if (this.parameters.attractionMode) {
                // Attraction mode - turn towards trails
                if (senseForward > senseLeft && senseForward > senseRight) {
                    // Continue forward
                } else if (senseForward < senseLeft && senseForward < senseRight) {
                    // Turn randomly
                    agent.angle += (Math.random() - 0.5) * 2 * rotationAngleRad;
                } else if (senseLeft > senseRight) {
                    agent.angle -= rotationAngleRad;
                } else if (senseRight > senseLeft) {
                    agent.angle += rotationAngleRad;
                }
            } else {
                // Repulsion mode - turn away from trails
                if (senseForward > senseLeft && senseForward > senseRight) {
                    // Turn away
                    agent.angle += Math.PI;
                } else if (senseLeft < senseRight) {
                    agent.angle -= rotationAngleRad;
                } else if (senseRight < senseLeft) {
                    agent.angle += rotationAngleRad;
                }
            }
            
            // Move agent
            agent.x += Math.cos(agent.angle) * this.parameters.stepSize;
            agent.y += Math.sin(agent.angle) * this.parameters.stepSize;
            
            // Bounce off walls
            if (agent.x < 0 || agent.x >= this.width) {
                agent.x = MathUtils.constrain(agent.x, 0, this.width - 1);
                agent.angle = Math.PI - agent.angle;
            }
            if (agent.y < 0 || agent.y >= this.height) {
                agent.y = MathUtils.constrain(agent.y, 0, this.height - 1);
                agent.angle = -agent.angle;
            }
            
            // Deposit trail
            this.depositTrail(agent.x, agent.y, this.parameters.depositionAmount);
        }
        
        // Diffuse and decay trails
        this.processTrails();
        
        // Update stats
        this.stats.agents = this.agents.length;
        if (this.trailMap.length > 0) {
            // Find max value without spread operator to avoid stack overflow
            let maxTrail = 0;
            for (let i = 0; i < this.trailMap.length; i++) {
                if (this.trailMap[i] > maxTrail) {
                    maxTrail = this.trailMap[i];
                }
            }
            this.stats.maxTrail = maxTrail.toFixed(2);
        } else {
            this.stats.maxTrail = '0.00';
        }
    }

    depositTrail(x, y, amount) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        
        // Bilinear deposition
        const fx = x - ix;
        const fy = y - iy;
        
        this.addTrailValue(ix, iy, amount * (1 - fx) * (1 - fy));
        this.addTrailValue(ix + 1, iy, amount * fx * (1 - fy));
        this.addTrailValue(ix, iy + 1, amount * (1 - fx) * fy);
        this.addTrailValue(ix + 1, iy + 1, amount * fx * fy);
    }

    addTrailValue(x, y, amount) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const idx = y * this.width + x;
            this.trailMap[idx] = Math.min(this.trailMap[idx] + amount, 255);
        }
    }

    processTrails() {
        const newTrailMap = new Float32Array(this.trailMap.length);
        const diffusion = this.parameters.diffusionRate;
        const decay = this.parameters.decayRate;
        
        // Apply diffusion using a 3x3 kernel
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const idx = y * this.width + x;
                
                // Diffusion
                let sum = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = (y + dy) * this.width + (x + dx);
                        sum += this.trailMap[nIdx];
                    }
                }
                
                // Average and apply decay
                newTrailMap[idx] = (sum / 9) * diffusion + this.trailMap[idx] * (1 - diffusion);
                newTrailMap[idx] *= decay;
            }
        }
        
        this.trailMap = newTrailMap;
    }

    render() {
        // Clear canvas
        CanvasUtils.clear(this.ctx, '#000000');
        
        // Check if properly initialized
        if (!this.imageData || !this.trailMap) {
            return;
        }
        
        // Render trail map to image data
        const data = this.imageData.data;
        
        for (let i = 0; i < this.trailMap.length; i++) {
            const value = Math.floor(this.trailMap[i]);
            const idx = i * 4;
            
            // Create color based on trail intensity
            if (value > 0) {
                const intensity = Math.min(value / 50, 1);
                const r = Math.floor(intensity * 100);
                const g = Math.floor(intensity * 255);
                const b = Math.floor(intensity * 150);
                
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = 255;
            } else {
                data[idx] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = 255;
            }
        }
        
        // Draw image data
        this.ctx.putImageData(this.imageData, 0, 0);
        
        // Optionally draw agents
        if (this.agents.length < 1000) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (const agent of this.agents) {
                this.ctx.fillRect(agent.x - 0.5, agent.y - 0.5, 1, 1);
            }
        }
    }

    onMouseMove(event) {
        const pos = this.getMousePos(event);
        
        // Add trail at mouse position
        const radius = 20;
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                if (x * x + y * y <= radius * radius) {
                    this.depositTrail(pos.x + x, pos.y + y, 10);
                }
            }
        }
    }

    onResize() {
        const oldAgents = this.agents || [];
        this.init();
        
        // Restore agents at new positions
        for (const agent of oldAgents) {
            if (agent.x < this.width && agent.y < this.height) {
                this.agents.push(agent);
            }
        }
        
        // If no agents were restored, initialize new ones
        if (this.agents.length === 0) {
            this.initializeAgents(this.parameters.agentCount);
        }
    }

    clear() {
        this.trailMap.fill(0);
        this.initializeAgents(this.parameters.agentCount);
    }

    reset() {
        this.init();
    }

    onParameterChange(name, value) {
        if (name === 'agentCount') {
            this.initializeAgents(value);
        }
    }

    getInfo() {
        return {
            name: "Slime Mold Simulation",
            description: "Physarum polycephalum simulation. Agents deposit chemical trails and navigate based on sensing. Creates organic, network-like patterns similar to real slime molds.",
            instructions: "Move mouse to add trails. Agents sense ahead and turn towards (or away from) trails. Watch as they create efficient networks and beautiful patterns."
        };
    }

    getParameterDefs() {
        return [
            {
                name: 'agentCount',
                type: 'range',
                min: 1000,
                max: 50000,
                step: 1000,
                defaultValue: 10000,
                label: 'Agent Count'
            },
            {
                name: 'sensorAngle',
                type: 'range',
                min: 10,
                max: 90,
                step: 5,
                defaultValue: 30,
                label: 'Sensor Angle'
            },
            {
                name: 'sensorDistance',
                type: 'range',
                min: 1,
                max: 20,
                step: 1,
                defaultValue: 9,
                label: 'Sensor Distance'
            },
            {
                name: 'rotationAngle',
                type: 'range',
                min: 10,
                max: 90,
                step: 5,
                defaultValue: 45,
                label: 'Rotation Angle'
            },
            {
                name: 'stepSize',
                type: 'range',
                min: 0.5,
                max: 3,
                step: 0.1,
                defaultValue: 1,
                label: 'Step Size'
            },
            {
                name: 'depositionAmount',
                type: 'range',
                min: 1,
                max: 20,
                step: 1,
                defaultValue: 5,
                label: 'Trail Deposition'
            },
            {
                name: 'decayRate',
                type: 'range',
                min: 0.8,
                max: 0.99,
                step: 0.01,
                defaultValue: 0.9,
                label: 'Decay Rate'
            },
            {
                name: 'diffusionRate',
                type: 'range',
                min: 0,
                max: 0.5,
                step: 0.05,
                defaultValue: 0.1,
                label: 'Diffusion Rate'
            },
            {
                name: 'attractionMode',
                type: 'checkbox',
                defaultValue: true,
                label: 'Attraction Mode'
            }
        ];
    }
}

// Register simulation
window.SlimeMold = SlimeMold;