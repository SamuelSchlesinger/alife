// 1D Cellular Automata simulation

class Cellular1D extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.cellSize = 3;
        this.cells = [];
        this.history = [];
        this.generation = 0;
        this.rule = 146; // Default to Rule 146
        this.ruleBinary = [];
        
        // Parameters
        this.parameters = {
            rule: 146,
            cellSize: 3,
            initialPattern: 'alternating',
            wrapEdges: true,
            colorMode: 'binary',
            speed: 1
        };
        
        // Famous rules
        this.famousRules = {
            30: 'Chaos (Rule 30)',
            90: 'Sierpinski Triangle (Rule 90)',
            110: 'Turing Complete (Rule 110)',
            184: 'Traffic Flow (Rule 184)',
            45: 'Complex Patterns (Rule 45)',
            73: 'Complex Growth (Rule 73)',
            105: 'Symmetric Patterns (Rule 105)',
            150: 'Additive Rule (Rule 150)'
        };
    }

    init() {
        this.cellSize = this.parameters.cellSize;
        const numCells = Math.max(1, Math.floor((this.canvas.width || 800) / this.cellSize));
        this.cells = new Array(numCells).fill(0);
        this.history = [];
        this.generation = 0;
        
        // Set initial pattern
        this.setInitialPattern(this.parameters.initialPattern);
        
        // Convert rule number to binary array
        this.updateRule(this.parameters.rule);
    }

    setInitialPattern(pattern) {
        const numCells = this.cells.length;
        this.cells.fill(0);
        
        switch (pattern) {
            case 'single':
                // Single cell in center
                this.cells[Math.floor(numCells / 2)] = 1;
                break;
                
            case 'random':
                // Random pattern
                for (let i = 0; i < numCells; i++) {
                    this.cells[i] = Math.random() < 0.5 ? 1 : 0;
                }
                break;
                
            case 'alternating':
                // Alternating pattern
                for (let i = 0; i < numCells; i++) {
                    this.cells[i] = i % 2;
                }
                break;
                
            case 'density':
                // Random with specific density
                for (let i = 0; i < numCells; i++) {
                    this.cells[i] = Math.random() < 0.3 ? 1 : 0;
                }
                break;
                
            case 'blocks':
                // Block pattern
                for (let i = 0; i < numCells; i++) {
                    this.cells[i] = Math.floor(i / 5) % 2;
                }
                break;
        }
    }

    updateRule(ruleNumber) {
        this.rule = ruleNumber;
        this.ruleBinary = [];
        
        // Convert rule number to 8-bit binary
        for (let i = 0; i < 8; i++) {
            this.ruleBinary[i] = (ruleNumber >> i) & 1;
        }
    }

    getNeighborhood(index) {
        const numCells = this.cells.length;
        let left, center, right;
        
        if (this.parameters.wrapEdges) {
            left = this.cells[(index - 1 + numCells) % numCells];
            center = this.cells[index];
            right = this.cells[(index + 1) % numCells];
        } else {
            left = index > 0 ? this.cells[index - 1] : 0;
            center = this.cells[index];
            right = index < numCells - 1 ? this.cells[index + 1] : 0;
        }
        
        return (left << 2) | (center << 1) | right;
    }

    update(deltaTime) {
        // Update based on speed parameter
        for (let step = 0; step < this.parameters.speed; step++) {
            // Store current generation in history
            if (this.history.length * this.cellSize < this.canvas.height) {
                this.history.push([...this.cells]);
            } else {
                // Scroll history
                this.history.shift();
                this.history.push([...this.cells]);
            }
            
            // Calculate next generation
            const newCells = new Array(this.cells.length);
            
            for (let i = 0; i < this.cells.length; i++) {
                const neighborhood = this.getNeighborhood(i);
                newCells[i] = this.ruleBinary[neighborhood];
            }
            
            this.cells = newCells;
            this.generation++;
        }
        
        // Update stats
        this.stats.generation = this.generation;
        this.stats.rule = this.rule;
        
        // Calculate density
        const density = this.cells.reduce((sum, cell) => sum + cell, 0) / this.cells.length;
        this.stats.density = (density * 100).toFixed(1) + '%';
    }

    render() {
        // Clear canvas
        CanvasUtils.clear(this.ctx, '#000000');
        
        // Draw history
        for (let y = 0; y < this.history.length; y++) {
            const row = this.history[y];
            for (let x = 0; x < row.length; x++) {
                if (row[x] === 1) {
                    const color = this.getCellColor(x, y, row[x]);
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
        
        // Draw rule visualization
        this.drawRuleVisualization();
    }

    getCellColor(x, y, value) {
        if (value === 0) return '#000000';
        
        switch (this.parameters.colorMode) {
            case 'binary':
                return '#00ff88';
                
            case 'gradient':
                const intensity = y / this.history.length;
                return `hsl(140, 100%, ${50 + intensity * 50}%)`;
                
            case 'rainbow':
                const hue = (x / this.cells.length) * 360;
                return `hsl(${hue}, 100%, 50%)`;
                
            case 'heat':
                const neighbors = this.countNeighborsInHistory(x, y);
                const heat = neighbors / 8;
                return `hsl(${(1 - heat) * 60}, 100%, 50%)`;
                
            default:
                return '#00ff88';
        }
    }

    countNeighborsInHistory(x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const ny = y + dy;
                const nx = x + dx;
                
                if (ny >= 0 && ny < this.history.length && 
                    nx >= 0 && nx < this.cells.length) {
                    count += this.history[ny][nx];
                }
            }
        }
        return count;
    }

    drawRuleVisualization() {
        const ruleBoxSize = 20;
        const x = this.canvas.width - 200;
        const y = 10;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(x - 5, y - 5, 190, 110);
        
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';
        const ruleName = this.famousRules[this.rule] || `Rule ${this.rule}`;
        this.ctx.fillText(ruleName, x, y + 15);
        
        // Draw each rule case
        for (let i = 0; i < 8; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const baseX = x + col * 45;
            const baseY = y + 25 + row * 40;
            
            // Draw input pattern
            for (let j = 0; j < 3; j++) {
                const bit = (7 - i) >> (2 - j) & 1;
                this.ctx.fillStyle = bit ? '#00ff88' : '#333333';
                this.ctx.fillRect(baseX + j * 12, baseY, 10, 10);
            }
            
            // Arrow
            this.ctx.fillStyle = '#666666';
            this.ctx.fillText('↓', baseX + 13, baseY + 20);
            
            // Output
            this.ctx.fillStyle = this.ruleBinary[7 - i] ? '#00ff88' : '#333333';
            this.ctx.fillRect(baseX + 12, baseY + 25, 10, 10);
        }
    }

    onMouseClick(event) {
        const pos = this.getMousePos(event);
        const cellX = Math.floor(pos.x / this.cellSize);
        
        if (cellX >= 0 && cellX < this.cells.length) {
            // Toggle cell
            this.cells[cellX] = 1 - this.cells[cellX];
            
            // Clear history to show change immediately
            this.history = [];
            this.generation = 0;
        }
    }

    onResize() {
        this.init();
    }

    clear() {
        this.history = [];
        this.generation = 0;
        this.setInitialPattern(this.parameters.initialPattern);
    }

    reset() {
        this.init();
    }

    onParameterChange(name, value) {
        switch (name) {
            case 'rule':
                this.updateRule(value);
                break;
            case 'cellSize':
                this.init();
                break;
            case 'initialPattern':
                this.setInitialPattern(value);
                this.history = [];
                this.generation = 0;
                break;
        }
    }

    getInfo() {
        return {
            name: "1D Cellular Automata",
            description: "Elementary cellular automata with 256 possible rules. Each cell's next state depends on its current state and its two neighbors. Simple rules create complex patterns.",
            instructions: "Click cells to toggle them. Rule 30 shows chaos, Rule 90 creates Sierpinski triangles, Rule 110 is Turing complete. Try different initial patterns!"
        };
    }

    getParameterDefs() {
        return [
            {
                name: 'rule',
                type: 'range',
                min: 0,
                max: 255,
                step: 1,
                defaultValue: 146,
                label: 'Rule Number'
            },
            {
                name: 'cellSize',
                type: 'range',
                min: 1,
                max: 10,
                step: 1,
                defaultValue: 3,
                label: 'Cell Size'
            },
            {
                name: 'speed',
                type: 'range',
                min: 1,
                max: 10,
                step: 1,
                defaultValue: 1,
                label: 'Generations per Frame'
            },
            {
                name: 'initialPattern',
                type: 'select',
                options: ['single', 'random', 'alternating', 'density', 'blocks'],
                defaultValue: 'alternating',
                label: 'Initial Pattern'
            },
            {
                name: 'colorMode',
                type: 'select',
                options: ['binary', 'gradient', 'rainbow', 'heat'],
                defaultValue: 'binary',
                label: 'Color Mode'
            },
            {
                name: 'wrapEdges',
                type: 'checkbox',
                defaultValue: true,
                label: 'Wrap Edges'
            }
        ];
    }
}

// Register simulation
window.Cellular1D = Cellular1D;