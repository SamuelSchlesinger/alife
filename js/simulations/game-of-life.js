// Conway's Game of Life simulation

class GameOfLife extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        this.cellSize = 5;
        this.grid = null;
        this.nextGrid = null;
        this.gridWidth = 0;
        this.gridHeight = 0;
        this.generation = 0;
        this.population = 0;
        
        // Drawing mode
        this.isDrawing = false;
        this.drawMode = 1; // 1 for alive, 0 for dead
        
        // Colors
        this.aliveColor = '#00ff88';
        this.deadColor = '#000000';
        this.gridColor = 'rgba(255, 255, 255, 0.05)';
        
        // Parameters
        this.parameters = {
            cellSize: 5,
            surviveRules: [2, 3],
            birthRules: [3],
            randomDensity: 0.3,
            showGrid: true
        };
    }

    init() {
        this.gridWidth = Math.max(1, Math.floor(this.canvas.width / this.cellSize) || 50);
        this.gridHeight = Math.max(1, Math.floor(this.canvas.height / this.cellSize) || 50);
        
        this.grid = new Grid(this.gridWidth, this.gridHeight, 0);
        this.nextGrid = new Grid(this.gridWidth, this.gridHeight, 0);
        
        this.generation = 0;
        this.randomize();
        
        // Set up mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('click', (e) => this.onMouseClick(e));
    }

    randomize() {
        this.grid.forEach((x, y) => {
            const alive = Math.random() < this.parameters.randomDensity ? 1 : 0;
            this.grid.set(x, y, alive);
        });
    }

    update(deltaTime) {
        this.population = 0;
        
        // Calculate next generation
        this.grid.forEach((x, y, cell) => {
            const neighbors = this.countNeighbors(x, y);
            let nextState = 0;
            
            if (cell === 1) {
                // Cell is alive
                if (this.parameters.surviveRules.includes(neighbors)) {
                    nextState = 1;
                }
            } else {
                // Cell is dead
                if (this.parameters.birthRules.includes(neighbors)) {
                    nextState = 1;
                }
            }
            
            this.nextGrid.set(x, y, nextState);
            if (nextState === 1) this.population++;
        });
        
        // Swap grids
        const temp = this.grid;
        this.grid = this.nextGrid;
        this.nextGrid = temp;
        
        this.generation++;
        
        // Update stats
        this.stats.generation = this.generation;
        this.stats.population = this.population;
        this.stats.density = Math.round((this.population / (this.gridWidth * this.gridHeight)) * 100) + '%';
    }

    countNeighbors(x, y) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                let nx = x + dx;
                let ny = y + dy;
                
                // Wrap around edges (toroidal topology)
                if (nx < 0) nx = this.gridWidth - 1;
                if (nx >= this.gridWidth) nx = 0;
                if (ny < 0) ny = this.gridHeight - 1;
                if (ny >= this.gridHeight) ny = 0;
                
                count += this.grid.get(nx, ny);
            }
        }
        return count;
    }

    render() {
        // Clear canvas
        CanvasUtils.clear(this.ctx, this.deadColor);
        
        // Draw grid lines if enabled
        if (this.parameters.showGrid) {
            CanvasUtils.drawGrid(this.ctx, this.cellSize, this.gridColor);
        }
        
        // Draw cells
        this.ctx.fillStyle = this.aliveColor;
        this.grid.forEach((x, y, cell) => {
            if (cell === 1) {
                this.ctx.fillRect(
                    x * this.cellSize,
                    y * this.cellSize,
                    this.cellSize - (this.parameters.showGrid ? 1 : 0),
                    this.cellSize - (this.parameters.showGrid ? 1 : 0)
                );
            }
        });
    }

    onMouseDown(event) {
        this.isDrawing = true;
        const pos = this.getMousePos(event);
        const gridX = Math.floor(pos.x / this.cellSize);
        const gridY = Math.floor(pos.y / this.cellSize);
        
        // Toggle the cell and set draw mode
        const currentState = this.grid.get(gridX, gridY);
        this.drawMode = currentState === 0 ? 1 : 0;
        this.grid.set(gridX, gridY, this.drawMode);
    }

    onMouseMove(event) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(event);
        const gridX = Math.floor(pos.x / this.cellSize);
        const gridY = Math.floor(pos.y / this.cellSize);
        
        this.grid.set(gridX, gridY, this.drawMode);
    }

    onMouseUp(event) {
        this.isDrawing = false;
    }

    onMouseClick(event) {
        if (this.isDrawing) return;
        
        const pos = this.getMousePos(event);
        const gridX = Math.floor(pos.x / this.cellSize);
        const gridY = Math.floor(pos.y / this.cellSize);
        
        // Toggle single cell
        const currentState = this.grid.get(gridX, gridY);
        this.grid.set(gridX, gridY, currentState === 0 ? 1 : 0);
    }

    onResize() {
        this.init();
    }

    clear() {
        this.grid.clear(0);
        this.generation = 0;
        this.population = 0;
    }

    reset() {
        this.generation = 0;
        this.randomize();
    }

    onParameterChange(name, value) {
        switch (name) {
            case 'cellSize':
                this.cellSize = value;
                this.init();
                break;
            case 'randomDensity':
                this.randomize();
                break;
        }
    }

    getInfo() {
        return {
            name: "Conway's Game of Life",
            description: "A cellular automaton devised by mathematician John Conway. Cells live or die based on simple rules, creating complex emergent patterns.",
            instructions: "Click to toggle cells. Click and drag to draw. Rules: A live cell with 2-3 neighbors survives. A dead cell with exactly 3 neighbors becomes alive."
        };
    }

    getParameterDefs() {
        return [
            {
                name: 'cellSize',
                type: 'range',
                min: 2,
                max: 20,
                step: 1,
                defaultValue: 5,
                label: 'Cell Size'
            },
            {
                name: 'randomDensity',
                type: 'range',
                min: 0,
                max: 1,
                step: 0.05,
                defaultValue: 0.3,
                label: 'Initial Density'
            },
            {
                name: 'showGrid',
                type: 'checkbox',
                defaultValue: true,
                label: 'Show Grid'
            }
        ];
    }
}

// Register simulation
window.GameOfLife = GameOfLife;