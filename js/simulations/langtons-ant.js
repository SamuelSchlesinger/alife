// Langton's Ant simulation

class LangtonsAnt extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.cellSize = 3;
        this.grid = null;
        this.gridWidth = 0;
        this.gridHeight = 0;
        
        // Ant properties
        this.ants = [];
        this.antColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        // Statistics
        this.steps = 0;
        this.blackCells = 0;
        
        // Colors
        this.whiteColor = '#000000';
        this.blackColor = '#ffffff';
        this.gridColor = 'rgba(255, 255, 255, 0.05)';
        
        // Parameters
        this.parameters = {
            cellSize: 3,
            antCount: 1,
            showGrid: false,
            showAnts: true,
            wrapEdges: true,
            speed: 100
        };
    }

    init() {
        this.gridWidth = Math.max(1, Math.floor(this.canvas.width / this.cellSize) || 50);
        this.gridHeight = Math.max(1, Math.floor(this.canvas.height / this.cellSize) || 50);
        
        this.grid = new Grid(this.gridWidth, this.gridHeight, 0);
        this.steps = 0;
        this.blackCells = 0;
        
        // Initialize ants
        this.ants = [];
        for (let i = 0; i < this.parameters.antCount; i++) {
            this.ants.push({
                x: Math.floor(this.gridWidth / 2) + MathUtils.randomInt(-10, 10),
                y: Math.floor(this.gridHeight / 2) + MathUtils.randomInt(-10, 10),
                direction: MathUtils.randomInt(0, 3), // 0: up, 1: right, 2: down, 3: left
                color: this.antColors[i % this.antColors.length]
            });
        }
    }

    update(deltaTime) {
        const stepsPerFrame = Math.max(1, Math.floor(this.parameters.speed));
        
        for (let step = 0; step < stepsPerFrame; step++) {
            for (const ant of this.ants) {
                // Get current cell state
                const cellState = this.grid.get(ant.x, ant.y);
                
                // Apply rules
                if (cellState === 0) {
                    // On white cell: turn right, flip color, move forward
                    ant.direction = (ant.direction + 1) % 4;
                    this.grid.set(ant.x, ant.y, 1);
                    this.blackCells++;
                } else {
                    // On black cell: turn left, flip color, move forward
                    ant.direction = (ant.direction + 3) % 4;
                    this.grid.set(ant.x, ant.y, 0);
                    this.blackCells--;
                }
                
                // Move forward
                switch (ant.direction) {
                    case 0: ant.y--; break; // Up
                    case 1: ant.x++; break; // Right
                    case 2: ant.y++; break; // Down
                    case 3: ant.x--; break; // Left
                }
                
                // Handle edge wrapping or boundary
                if (this.parameters.wrapEdges) {
                    if (ant.x < 0) ant.x = this.gridWidth - 1;
                    if (ant.x >= this.gridWidth) ant.x = 0;
                    if (ant.y < 0) ant.y = this.gridHeight - 1;
                    if (ant.y >= this.gridHeight) ant.y = 0;
                } else {
                    ant.x = MathUtils.constrain(ant.x, 0, this.gridWidth - 1);
                    ant.y = MathUtils.constrain(ant.y, 0, this.gridHeight - 1);
                }
            }
            
            this.steps++;
        }
        
        // Update stats
        this.stats.steps = this.steps.toLocaleString();
        this.stats.blackCells = this.blackCells.toLocaleString();
        this.stats.coverage = Math.round((this.blackCells / (this.gridWidth * this.gridHeight)) * 100) + '%';
    }

    render() {
        // Clear canvas
        CanvasUtils.clear(this.ctx, this.whiteColor);
        
        // Draw grid if enabled
        if (this.parameters.showGrid) {
            CanvasUtils.drawGrid(this.ctx, this.cellSize, this.gridColor);
        }
        
        // Draw cells
        this.ctx.fillStyle = this.blackColor;
        this.grid.forEach((x, y, cell) => {
            if (cell === 1) {
                this.ctx.fillRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
            }
        });
        
        // Draw ants
        if (this.parameters.showAnts) {
            for (const ant of this.ants) {
                this.ctx.fillStyle = ant.color;
                this.ctx.fillRect(
                    ant.x * this.cellSize,
                    ant.y * this.cellSize,
                    this.cellSize,
                    this.cellSize
                );
                
                // Draw direction indicator
                this.ctx.strokeStyle = ant.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                
                const centerX = ant.x * this.cellSize + this.cellSize / 2;
                const centerY = ant.y * this.cellSize + this.cellSize / 2;
                const arrowSize = this.cellSize / 3;
                
                switch (ant.direction) {
                    case 0: // Up
                        this.ctx.moveTo(centerX, centerY);
                        this.ctx.lineTo(centerX, centerY - arrowSize);
                        break;
                    case 1: // Right
                        this.ctx.moveTo(centerX, centerY);
                        this.ctx.lineTo(centerX + arrowSize, centerY);
                        break;
                    case 2: // Down
                        this.ctx.moveTo(centerX, centerY);
                        this.ctx.lineTo(centerX, centerY + arrowSize);
                        break;
                    case 3: // Left
                        this.ctx.moveTo(centerX, centerY);
                        this.ctx.lineTo(centerX - arrowSize, centerY);
                        break;
                }
                this.ctx.stroke();
            }
        }
    }

    onResize() {
        this.init();
    }

    clear() {
        this.grid.clear(0);
        this.steps = 0;
        this.blackCells = 0;
        
        // Reset ants to center
        for (let i = 0; i < this.ants.length; i++) {
            this.ants[i].x = Math.floor(this.gridWidth / 2) + MathUtils.randomInt(-10, 10);
            this.ants[i].y = Math.floor(this.gridHeight / 2) + MathUtils.randomInt(-10, 10);
            this.ants[i].direction = MathUtils.randomInt(0, 3);
        }
    }

    reset() {
        this.init();
    }

    onParameterChange(name, value) {
        switch (name) {
            case 'cellSize':
                this.cellSize = value;
                this.init();
                break;
            case 'antCount':
                const oldCount = this.ants.length;
                if (value > oldCount) {
                    // Add new ants
                    for (let i = oldCount; i < value; i++) {
                        this.ants.push({
                            x: Math.floor(this.gridWidth / 2) + MathUtils.randomInt(-10, 10),
                            y: Math.floor(this.gridHeight / 2) + MathUtils.randomInt(-10, 10),
                            direction: MathUtils.randomInt(0, 3),
                            color: this.antColors[i % this.antColors.length]
                        });
                    }
                } else {
                    // Remove ants
                    this.ants = this.ants.slice(0, value);
                }
                break;
        }
    }

    getInfo() {
        return {
            name: "Langton's Ant",
            description: "A two-dimensional Turing machine with simple rules that produces complex emergent behavior. The ant moves on a grid, flipping colors and turning based on the current cell.",
            instructions: "Rules: On a white cell, turn right, flip to black, move forward. On a black cell, turn left, flip to white, move forward. Watch as chaotic behavior eventually gives way to a 'highway' pattern."
        };
    }

    getParameterDefs() {
        return [
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
                name: 'antCount',
                type: 'range',
                min: 1,
                max: 6,
                step: 1,
                defaultValue: 1,
                label: 'Number of Ants'
            },
            {
                name: 'speed',
                type: 'range',
                min: 1,
                max: 1000,
                step: 10,
                defaultValue: 100,
                label: 'Steps per Frame'
            },
            {
                name: 'showGrid',
                type: 'checkbox',
                defaultValue: false,
                label: 'Show Grid'
            },
            {
                name: 'showAnts',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show Ants'
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
window.LangtonsAnt = LangtonsAnt;