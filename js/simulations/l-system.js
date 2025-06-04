// L-System (Lindenmayer System) plant growth simulation

class LSystem extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // L-System properties
        this.axiom = 'F';
        this.rules = {};
        this.generations = 0;
        this.currentString = '';
        this.angle = 25;
        this.length = 5;
        this.lengthFactor = 0.9;
        
        // Rendering properties
        this.startX = 0;
        this.startY = 0;
        this.startAngle = -90;
        this.lineWidth = 1;
        this.leafSize = 4;
        
        // Growth animation
        this.drawProgress = 0;
        this.animationSpeed = 0.02;
        this.isAnimating = true;
        
        // Presets
        this.presets = {
            tree1: {
                name: 'Fractal Tree',
                axiom: 'F',
                rules: { 'F': 'FF+[+F-F-F]-[-F+F+F]' },
                angle: 25,
                generations: 4
            },
            tree2: {
                name: 'Binary Tree',
                axiom: 'X',
                rules: { 'X': 'F[+X][-X]FX', 'F': 'FF' },
                angle: 30,
                generations: 6
            },
            plant1: {
                name: 'Seaweed',
                axiom: 'F',
                rules: { 'F': 'F[+F]F[-F]F' },
                angle: 25.7,
                generations: 4
            },
            plant2: {
                name: 'Fern',
                axiom: 'X',
                rules: { 'X': 'F+[[X]-X]-F[-FX]+X', 'F': 'FF' },
                angle: 22.5,
                generations: 5
            },
            koch: {
                name: 'Koch Curve',
                axiom: 'F',
                rules: { 'F': 'F+F-F-F+F' },
                angle: 90,
                generations: 4
            },
            sierpinski: {
                name: 'Sierpinski Triangle',
                axiom: 'F-G-G',
                rules: { 'F': 'F-G+F+G-F', 'G': 'GG' },
                angle: 120,
                generations: 6
            }
        };
        
        // Parameters
        this.parameters = {
            preset: 'tree1',
            generations: 4,
            angle: 25,
            length: 5,
            lengthFactor: 0.9,
            animate: true,
            showLeaves: true,
            windEffect: false,
            windStrength: 0.5
        };
        
        // Wind effect
        this.windTime = 0;
        
        // Colors
        this.branchColor = '#8B4513';
        this.leafColor = '#228B22';
        this.bgColor = '#001122';
    }

    init() {
        this.startX = (this.canvas.width || 800) / 2;
        this.startY = (this.canvas.height || 600) - 50;
        
        // Load preset
        this.loadPreset(this.parameters.preset);
        
        // Generate L-System string
        this.generate();
    }

    loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            this.axiom = preset.axiom;
            this.rules = preset.rules;
            this.parameters.angle = preset.angle;
            this.parameters.generations = preset.generations;
            this.angle = preset.angle;
        }
    }

    generate() {
        this.currentString = this.axiom;
        this.generations = 0;
        
        for (let i = 0; i < this.parameters.generations; i++) {
            this.currentString = this.applyRules(this.currentString);
            this.generations++;
        }
        
        // Reset animation
        this.drawProgress = 0;
        
        // Calculate appropriate length based on generations
        this.length = Math.max(2, 100 / Math.pow(2, this.generations));
        
        // Update stats
        this.stats.symbols = this.currentString.length;
        this.stats.branches = (this.currentString.match(/F/g) || []).length;
    }

    applyRules(str) {
        let newStr = '';
        for (const char of str) {
            newStr += this.rules[char] || char;
        }
        return newStr;
    }

    update(deltaTime) {
        if (this.parameters.animate && this.drawProgress < 1) {
            this.drawProgress = Math.min(1, this.drawProgress + this.animationSpeed);
        }
        
        if (this.parameters.windEffect) {
            this.windTime += deltaTime * 0.001;
        }
        
        // Update stats
        this.stats.progress = Math.round(this.drawProgress * 100) + '%';
    }

    render() {
        // Clear canvas
        CanvasUtils.clear(this.ctx, this.bgColor);
        
        // Draw ground
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        
        // Draw L-System
        this.ctx.save();
        this.drawLSystem();
        this.ctx.restore();
    }

    drawLSystem() {
        const stack = [];
        let x = this.startX;
        let y = this.startY;
        let angle = this.startAngle;
        let currentLength = this.length;
        let drawIndex = 0;
        const maxDraw = Math.floor(this.currentString.length * this.drawProgress);
        
        for (const char of this.currentString) {
            if (drawIndex >= maxDraw && this.parameters.animate) break;
            
            // Apply wind effect
            let windAngle = 0;
            if (this.parameters.windEffect) {
                windAngle = Math.sin(this.windTime + y * 0.01) * this.parameters.windStrength * stack.length;
            }
            
            switch (char) {
                case 'F':
                case 'G':
                    // Draw forward
                    const rad = (angle + windAngle) * Math.PI / 180;
                    const newX = x + currentLength * Math.cos(rad);
                    const newY = y + currentLength * Math.sin(rad);
                    
                    // Draw branch
                    const depth = stack.length;
                    this.ctx.strokeStyle = this.interpolateColor(this.branchColor, this.leafColor, depth / 8);
                    this.ctx.lineWidth = Math.max(1, 5 - depth * 0.5);
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(newX, newY);
                    this.ctx.stroke();
                    
                    x = newX;
                    y = newY;
                    break;
                    
                case '+':
                    // Turn right
                    angle += this.angle;
                    break;
                    
                case '-':
                    // Turn left
                    angle -= this.angle;
                    break;
                    
                case '[':
                    // Push state
                    stack.push({ x, y, angle, length: currentLength });
                    currentLength *= this.parameters.lengthFactor;
                    break;
                    
                case ']':
                    // Pop state
                    if (stack.length > 0) {
                        // Draw leaf at branch end if enabled
                        if (this.parameters.showLeaves && stack.length > 2) {
                            this.drawLeaf(x, y, angle);
                        }
                        
                        const state = stack.pop();
                        x = state.x;
                        y = state.y;
                        angle = state.angle;
                        currentLength = state.length;
                    }
                    break;
            }
            
            drawIndex++;
        }
    }

    drawLeaf(x, y, angle) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle * Math.PI / 180);
        
        // Draw simple leaf shape
        this.ctx.fillStyle = this.leafColor;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.leafSize, this.leafSize * 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    interpolateColor(color1, color2, factor) {
        // Simple color interpolation (works with hex colors)
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);
        
        const r1 = (c1 >> 16) & 255;
        const g1 = (c1 >> 8) & 255;
        const b1 = c1 & 255;
        
        const r2 = (c2 >> 16) & 255;
        const g2 = (c2 >> 8) & 255;
        const b2 = c2 & 255;
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    onResize() {
        this.startX = (this.canvas.width || 800) / 2;
        this.startY = (this.canvas.height || 600) - 50;
    }

    clear() {
        this.currentString = this.axiom;
        this.generations = 0;
        this.drawProgress = 0;
    }

    reset() {
        this.generate();
    }

    onParameterChange(name, value) {
        switch (name) {
            case 'preset':
                this.loadPreset(value);
                this.generate();
                break;
            case 'generations':
                this.parameters.generations = value;
                this.generate();
                break;
            case 'angle':
                this.angle = value;
                break;
            case 'animate':
                if (!value) this.drawProgress = 1;
                break;
        }
    }

    getInfo() {
        return {
            name: "L-System Plant Growth",
            description: "Lindenmayer Systems (L-Systems) are parallel rewriting systems used to model plant growth and fractal patterns. They use simple rules to generate complex organic structures.",
            instructions: "Select different presets to see various plant types and fractals. Adjust generations to control complexity. F = draw forward, + = turn right, - = turn left, [ ] = branch."
        };
    }

    getParameterDefs() {
        return [
            {
                name: 'preset',
                type: 'select',
                options: Object.keys(this.presets),
                labels: Object.values(this.presets).map(p => p.name),
                defaultValue: 'tree1',
                label: 'Plant Type'
            },
            {
                name: 'generations',
                type: 'range',
                min: 1,
                max: 8,
                step: 1,
                defaultValue: 4,
                label: 'Generations'
            },
            {
                name: 'angle',
                type: 'range',
                min: 5,
                max: 90,
                step: 0.5,
                defaultValue: 25,
                label: 'Branch Angle'
            },
            {
                name: 'lengthFactor',
                type: 'range',
                min: 0.5,
                max: 0.95,
                step: 0.05,
                defaultValue: 0.9,
                label: 'Length Factor'
            },
            {
                name: 'animate',
                type: 'checkbox',
                defaultValue: true,
                label: 'Animate Growth'
            },
            {
                name: 'showLeaves',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show Leaves'
            },
            {
                name: 'windEffect',
                type: 'checkbox',
                defaultValue: false,
                label: 'Wind Effect'
            },
            {
                name: 'windStrength',
                type: 'range',
                min: 0,
                max: 2,
                step: 0.1,
                defaultValue: 0.5,
                label: 'Wind Strength'
            }
        ];
    }
}

// Register simulation
window.LSystem = LSystem;