// Reaction-Diffusion simulation (Gray-Scott model)

class ReactionDiffusion extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.gridSize = 200;
        this.grid = { a: [], b: [] };
        this.next = { a: [], b: [] };
        
        // Model parameters
        this.dA = 1.0;
        this.dB = 0.5;
        this.feed = 0.055;
        this.kill = 0.062;
        
        // Visualization
        this.colorMode = 'gradient';
        this.imageData = null;
        
        // Parameters
        this.parameters = {
            preset: 'default',
            feed: 0.055,
            kill: 0.062,
            dA: 1.0,
            dB: 0.5,
            colorMode: 'gradient',
            brushSize: 10,
            speed: 10
        };
        
        // Presets for different patterns
        this.presets = {
            default: { name: 'Mitosis', feed: 0.0367, kill: 0.0649 },
            coral: { name: 'Coral Growth', feed: 0.0545, kill: 0.062 },
            spirals: { name: 'Spirals', feed: 0.014, kill: 0.054 },
            waves: { name: 'Wave Patterns', feed: 0.025, kill: 0.06 },
            solitons: { name: 'Solitons', feed: 0.03, kill: 0.062 },
            pulsing: { name: 'Pulsing', feed: 0.025, kill: 0.055 },
            maze: { name: 'Maze', feed: 0.029, kill: 0.057 },
            holes: { name: 'Holes', feed: 0.039, kill: 0.058 },
            chaos: { name: 'Chaos', feed: 0.026, kill: 0.051 },
            spots: { name: 'Moving Spots', feed: 0.014, kill: 0.054 }
        };
        
        // Drawing state
        this.isDrawing = false;
    }

    init() {
        this.gridSize = Math.min(200, Math.floor(Math.min(this.canvas.width, this.canvas.height) / 2));
        
        // Initialize grids
        const size = this.gridSize * this.gridSize;
        this.grid.a = new Float32Array(size);
        this.grid.b = new Float32Array(size);
        this.next.a = new Float32Array(size);
        this.next.b = new Float32Array(size);
        
        // Fill with chemical A
        this.grid.a.fill(1);
        this.grid.b.fill(0);
        
        // Add some initial B seeds
        this.addSeeds();
        
        // Create image data for fast rendering
        this.imageData = this.ctx.createImageData(this.gridSize, this.gridSize);
        
        // Load preset
        this.loadPreset(this.parameters.preset);
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }

    loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            this.parameters.feed = preset.feed;
            this.parameters.kill = preset.kill;
            this.feed = preset.feed;
            this.kill = preset.kill;
        }
    }

    addSeeds() {
        // Add random circular seeds
        const numSeeds = 3;
        for (let i = 0; i < numSeeds; i++) {
            const cx = Math.floor(Math.random() * this.gridSize);
            const cy = Math.floor(Math.random() * this.gridSize);
            const radius = MathUtils.randomInt(5, 15);
            
            for (let y = -radius; y <= radius; y++) {
                for (let x = -radius; x <= radius; x++) {
                    if (x * x + y * y <= radius * radius) {
                        const idx = this.getIndex(cx + x, cy + y);
                        if (idx >= 0) {
                            this.grid.b[idx] = 1;
                        }
                    }
                }
            }
        }
    }

    getIndex(x, y) {
        if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
            return -1;
        }
        return y * this.gridSize + x;
    }

    laplacian(grid, x, y) {
        let sum = 0;
        sum += grid[this.getIndex(x - 1, y)] * 0.2;
        sum += grid[this.getIndex(x + 1, y)] * 0.2;
        sum += grid[this.getIndex(x, y - 1)] * 0.2;
        sum += grid[this.getIndex(x, y + 1)] * 0.2;
        sum += grid[this.getIndex(x - 1, y - 1)] * 0.05;
        sum += grid[this.getIndex(x + 1, y - 1)] * 0.05;
        sum += grid[this.getIndex(x - 1, y + 1)] * 0.05;
        sum += grid[this.getIndex(x + 1, y + 1)] * 0.05;
        sum -= grid[this.getIndex(x, y)];
        return sum;
    }

    update(deltaTime) {
        const steps = this.parameters.speed;
        
        for (let step = 0; step < steps; step++) {
            // Update each cell
            for (let y = 1; y < this.gridSize - 1; y++) {
                for (let x = 1; x < this.gridSize - 1; x++) {
                    const idx = this.getIndex(x, y);
                    const a = this.grid.a[idx];
                    const b = this.grid.b[idx];
                    
                    // Reaction-diffusion equations
                    const reaction = a * b * b;
                    
                    this.next.a[idx] = a + (
                        this.dA * this.laplacian(this.grid.a, x, y) -
                        reaction +
                        this.feed * (1 - a)
                    ) * 0.1;
                    
                    this.next.b[idx] = b + (
                        this.dB * this.laplacian(this.grid.b, x, y) +
                        reaction -
                        (this.kill + this.feed) * b
                    ) * 0.1;
                    
                    // Clamp values
                    this.next.a[idx] = MathUtils.constrain(this.next.a[idx], 0, 1);
                    this.next.b[idx] = MathUtils.constrain(this.next.b[idx], 0, 1);
                }
            }
            
            // Swap grids
            [this.grid.a, this.next.a] = [this.next.a, this.grid.a];
            [this.grid.b, this.next.b] = [this.next.b, this.grid.b];
        }
        
        // Update stats
        let totalB = 0;
        for (let i = 0; i < this.grid.b.length; i++) {
            totalB += this.grid.b[i];
        }
        this.stats.chemicalB = Math.round(totalB);
        this.stats.feed = this.feed.toFixed(4);
        this.stats.kill = this.kill.toFixed(4);
    }

    render() {
        // Render to image data
        const data = this.imageData.data;
        
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const a = this.grid.a[i];
            const b = this.grid.b[i];
            const idx = i * 4;
            
            switch (this.parameters.colorMode) {
                case 'gradient':
                    // Blue to white gradient based on chemical B
                    const intensity = b * 255;
                    data[idx] = 255 - intensity;
                    data[idx + 1] = 255 - intensity;
                    data[idx + 2] = 255;
                    break;
                    
                case 'heatmap':
                    // Heatmap coloring
                    const heat = b;
                    if (heat < 0.25) {
                        data[idx] = 0;
                        data[idx + 1] = heat * 4 * 255;
                        data[idx + 2] = 255;
                    } else if (heat < 0.5) {
                        data[idx] = 0;
                        data[idx + 1] = 255;
                        data[idx + 2] = (1 - (heat - 0.25) * 4) * 255;
                    } else if (heat < 0.75) {
                        data[idx] = (heat - 0.5) * 4 * 255;
                        data[idx + 1] = 255;
                        data[idx + 2] = 0;
                    } else {
                        data[idx] = 255;
                        data[idx + 1] = (1 - (heat - 0.75) * 4) * 255;
                        data[idx + 2] = 0;
                    }
                    break;
                    
                case 'binary':
                    // Binary black/white
                    const val = b > 0.5 ? 255 : 0;
                    data[idx] = val;
                    data[idx + 1] = val;
                    data[idx + 2] = val;
                    break;
            }
            
            data[idx + 3] = 255; // Alpha
        }
        
        // Draw scaled up
        const scale = Math.min(this.canvas.width, this.canvas.height) / this.gridSize;
        
        // Create temporary canvas for scaling
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.gridSize;
        tempCanvas.height = this.gridSize;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(this.imageData, 0, 0);
        
        // Clear and draw scaled
        CanvasUtils.clear(this.ctx, '#000000');
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(
            tempCanvas,
            (this.canvas.width - this.gridSize * scale) / 2,
            (this.canvas.height - this.gridSize * scale) / 2,
            this.gridSize * scale,
            this.gridSize * scale
        );
    }

    addChemical(screenX, screenY) {
        const scale = Math.min(this.canvas.width, this.canvas.height) / this.gridSize;
        const offsetX = (this.canvas.width - this.gridSize * scale) / 2;
        const offsetY = (this.canvas.height - this.gridSize * scale) / 2;
        
        const gridX = Math.floor((screenX - offsetX) / scale);
        const gridY = Math.floor((screenY - offsetY) / scale);
        
        const radius = this.parameters.brushSize;
        
        for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
                if (x * x + y * y <= radius * radius) {
                    const idx = this.getIndex(gridX + x, gridY + y);
                    if (idx >= 0) {
                        this.grid.b[idx] = 1;
                    }
                }
            }
        }
    }

    onMouseDown(event) {
        this.isDrawing = true;
        const pos = this.getMousePos(event);
        this.addChemical(pos.x, pos.y);
    }

    onMouseMove(event) {
        if (!this.isDrawing) return;
        const pos = this.getMousePos(event);
        this.addChemical(pos.x, pos.y);
    }

    onMouseUp(event) {
        this.isDrawing = false;
    }

    onResize() {
        this.init();
    }

    clear() {
        this.grid.a.fill(1);
        this.grid.b.fill(0);
        this.addSeeds();
    }

    reset() {
        this.init();
    }

    onParameterChange(name, value) {
        switch (name) {
            case 'preset':
                this.loadPreset(value);
                break;
            case 'feed':
                this.feed = value;
                break;
            case 'kill':
                this.kill = value;
                break;
            case 'dA':
                this.dA = value;
                break;
            case 'dB':
                this.dB = value;
                break;
        }
    }

    getInfo() {
        return {
            name: "Reaction-Diffusion System",
            description: "Gray-Scott model simulating the interaction of two chemicals that react and diffuse. Creates organic patterns like spots, stripes, and waves found in nature.",
            instructions: "Click and drag to add chemical B. Different feed/kill rates produce different patterns. Based on Alan Turing's morphogenesis theory."
        };
    }

    getParameterDefs() {
        return [
            {
                name: 'preset',
                type: 'select',
                options: Object.keys(this.presets),
                labels: Object.values(this.presets).map(p => p.name),
                defaultValue: 'default',
                label: 'Pattern Preset'
            },
            {
                name: 'feed',
                type: 'range',
                min: 0.01,
                max: 0.1,
                step: 0.001,
                defaultValue: 0.055,
                label: 'Feed Rate'
            },
            {
                name: 'kill',
                type: 'range',
                min: 0.04,
                max: 0.08,
                step: 0.001,
                defaultValue: 0.062,
                label: 'Kill Rate'
            },
            {
                name: 'brushSize',
                type: 'range',
                min: 1,
                max: 20,
                step: 1,
                defaultValue: 10,
                label: 'Brush Size'
            },
            {
                name: 'speed',
                type: 'range',
                min: 1,
                max: 20,
                step: 1,
                defaultValue: 10,
                label: 'Simulation Speed'
            },
            {
                name: 'colorMode',
                type: 'select',
                options: ['gradient', 'heatmap', 'binary'],
                defaultValue: 'gradient',
                label: 'Color Mode'
            }
        ];
    }
}

// Register simulation
window.ReactionDiffusion = ReactionDiffusion;