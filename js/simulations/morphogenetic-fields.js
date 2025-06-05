// Morphogenetic Fields - Developmental biology through field-based pattern formation

class MorphogeneticFields extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Cells
        this.cells = [];
        
        // Morphogenetic fields
        this.fields = {
            growth: null,      // Determines cell division rate
            differentiation: null, // Determines cell type
            polarity: null,    // Determines orientation
            apoptosis: null    // Determines cell death
        };
        
        // Cell types
        this.cellTypes = [
            { name: 'stem', color: 'rgba(255, 255, 255, 0.8)', divisionRate: 0.05 },
            { name: 'neural', color: 'rgba(100, 150, 255, 0.8)', divisionRate: 0.02 },
            { name: 'muscle', color: 'rgba(255, 100, 100, 0.8)', divisionRate: 0.01 },
            { name: 'epithelial', color: 'rgba(100, 255, 100, 0.8)', divisionRate: 0.03 },
            { name: 'support', color: 'rgba(255, 200, 100, 0.8)', divisionRate: 0.005 }
        ];
        
        // Morphogen sources
        this.morphogens = [];
        
        // Parameters
        this.fieldResolution = 20; // Grid size for fields
        this.diffusionRate = 0.1;
        this.decayRate = 0.01;
        this.cellAdhesion = 0.5;
        this.differentiationThreshold = 0.3;
        this.growthThreshold = 0.4;
        
        // Display options
        this.showFields = true;
        this.showGradients = true;
        this.showCellConnections = false;
        this.selectedField = 'growth';
        
        // Development stage
        this.developmentStage = 0;
        this.organismStructures = [];
    }
    
    init() {
        this.initializeFields();
        this.reset();
    }
    
    initializeFields() {
        const width = Math.ceil(this.canvas.width / this.fieldResolution);
        const height = Math.ceil(this.canvas.height / this.fieldResolution);
        
        // Initialize all fields
        ['growth', 'differentiation', 'polarity', 'apoptosis'].forEach(fieldName => {
            this.fields[fieldName] = Array(height).fill().map(() => Array(width).fill(0));
        });
    }
    
    reset() {
        // Clear cells and morphogens
        this.cells = [];
        this.morphogens = [];
        this.organismStructures = [];
        this.developmentStage = 0;
        
        // Reset fields
        this.initializeFields();
        
        // Create initial embryo cluster
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const radius = 20;
            
            this.cells.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                type: this.cellTypes[0], // Start as stem cells
                age: 0,
                energy: 100,
                maxEnergy: 100,
                size: 8,
                neighbors: [],
                fieldExposure: {
                    growth: 0,
                    differentiation: 0,
                    polarity: 0,
                    apoptosis: 0
                },
                polarityAngle: angle,
                divisionCooldown: 0,
                adhesionStrength: 1,
                fate: null // Predetermined fate based on position
            });
        }
        
        // Create initial morphogen sources
        this.createMorphogenSources();
    }
    
    createMorphogenSources() {
        // Anterior-posterior axis
        this.morphogens.push({
            x: this.canvas.width * 0.3,
            y: this.canvas.height / 2,
            type: 'differentiation',
            strength: 1.0,
            radius: 100,
            gradient: 'radial'
        });
        
        // Dorsal-ventral axis
        this.morphogens.push({
            x: this.canvas.width / 2,
            y: this.canvas.height * 0.3,
            type: 'growth',
            strength: 0.8,
            radius: 80,
            gradient: 'linear'
        });
        
        // Organizer region
        this.morphogens.push({
            x: this.canvas.width * 0.7,
            y: this.canvas.height * 0.7,
            type: 'polarity',
            strength: 0.6,
            radius: 60,
            gradient: 'spiral'
        });
    }
    
    update() {
        // Update morphogenetic fields
        this.updateFields();
        
        // Update cell states
        this.updateCells();
        
        // Process cell division
        this.processCellDivision();
        
        // Process differentiation
        this.processDifferentiation();
        
        // Process apoptosis
        this.processApoptosis();
        
        // Update cell positions
        this.updateCellPositions();
        
        // Detect emerging structures
        this.detectStructures();
        
        // Progress development
        this.developmentStage++;
    }
    
    updateFields() {
        // Reset fields
        ['growth', 'differentiation', 'polarity', 'apoptosis'].forEach(fieldName => {
            const field = this.fields[fieldName];
            for (let y = 0; y < field.length; y++) {
                for (let x = 0; x < field[0].length; x++) {
                    field[y][x] *= (1 - this.decayRate);
                }
            }
        });
        
        // Apply morphogen sources
        this.morphogens.forEach(morphogen => {
            const field = this.fields[morphogen.type];
            if (!field) return;
            
            const gridX = Math.floor(morphogen.x / this.fieldResolution);
            const gridY = Math.floor(morphogen.y / this.fieldResolution);
            const gridRadius = morphogen.radius / this.fieldResolution;
            
            for (let y = 0; y < field.length; y++) {
                for (let x = 0; x < field[0].length; x++) {
                    const dx = x - gridX;
                    const dy = y - gridY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < gridRadius) {
                        let value = 0;
                        
                        switch (morphogen.gradient) {
                            case 'radial':
                                value = morphogen.strength * (1 - dist / gridRadius);
                                break;
                            case 'linear':
                                value = morphogen.strength * (1 - Math.abs(dy) / gridRadius);
                                break;
                            case 'spiral':
                                const angle = Math.atan2(dy, dx);
                                value = morphogen.strength * (1 - dist / gridRadius) * 
                                       (0.5 + 0.5 * Math.sin(angle * 3 + this.developmentStage * 0.05));
                                break;
                        }
                        
                        field[y][x] = Math.min(1, field[y][x] + value);
                    }
                }
            }
        });
        
        // Diffusion
        ['growth', 'differentiation', 'polarity', 'apoptosis'].forEach(fieldName => {
            const field = this.fields[fieldName];
            const newField = field.map(row => [...row]);
            
            for (let y = 1; y < field.length - 1; y++) {
                for (let x = 1; x < field[0].length - 1; x++) {
                    const laplacian = (
                        field[y-1][x] + field[y+1][x] + 
                        field[y][x-1] + field[y][x+1] - 
                        4 * field[y][x]
                    );
                    newField[y][x] += this.diffusionRate * laplacian;
                    newField[y][x] = Math.max(0, Math.min(1, newField[y][x]));
                }
            }
            
            this.fields[fieldName] = newField;
        });
        
        // Cell-generated fields
        this.cells.forEach(cell => {
            const gridX = Math.floor(cell.x / this.fieldResolution);
            const gridY = Math.floor(cell.y / this.fieldResolution);
            
            if (gridX >= 0 && gridX < this.fields.growth[0].length &&
                gridY >= 0 && gridY < this.fields.growth.length) {
                
                // Different cell types produce different morphogens
                switch (cell.type.name) {
                    case 'neural':
                        this.fields.polarity[gridY][gridX] += 0.05;
                        break;
                    case 'muscle':
                        this.fields.growth[gridY][gridX] += 0.03;
                        break;
                    case 'epithelial':
                        this.fields.differentiation[gridY][gridX] += 0.04;
                        break;
                }
            }
        });
    }
    
    updateCells() {
        // Update cell field exposure
        this.cells.forEach(cell => {
            const gridX = Math.floor(cell.x / this.fieldResolution);
            const gridY = Math.floor(cell.y / this.fieldResolution);
            
            if (gridX >= 0 && gridX < this.fields.growth[0].length &&
                gridY >= 0 && gridY < this.fields.growth.length) {
                
                cell.fieldExposure.growth = this.fields.growth[gridY][gridX];
                cell.fieldExposure.differentiation = this.fields.differentiation[gridY][gridX];
                cell.fieldExposure.polarity = this.fields.polarity[gridY][gridX];
                cell.fieldExposure.apoptosis = this.fields.apoptosis[gridY][gridX];
            }
            
            // Update polarity based on field
            if (cell.fieldExposure.polarity > 0.2) {
                cell.polarityAngle += (Math.random() - 0.5) * cell.fieldExposure.polarity * 0.1;
            }
            
            // Age and energy
            cell.age++;
            cell.energy -= 0.1;
            cell.divisionCooldown = Math.max(0, cell.divisionCooldown - 1);
            
            // Update neighbors
            cell.neighbors = this.cells.filter(other => {
                if (other === cell) return false;
                const dx = other.x - cell.x;
                const dy = other.y - cell.y;
                return Math.sqrt(dx * dx + dy * dy) < cell.size * 3;
            });
        });
    }
    
    processCellDivision() {
        const newCells = [];
        
        this.cells.forEach(cell => {
            // Check division conditions
            if (cell.fieldExposure.growth > this.growthThreshold &&
                cell.energy > cell.maxEnergy * 0.6 &&
                cell.divisionCooldown === 0 &&
                cell.neighbors.length < 6 &&
                Math.random() < cell.type.divisionRate) {
                
                // Create daughter cell
                const angle = cell.polarityAngle + (Math.random() - 0.5) * Math.PI / 2;
                const distance = cell.size * 2;
                
                const daughter = {
                    x: cell.x + Math.cos(angle) * distance,
                    y: cell.y + Math.sin(angle) * distance,
                    vx: Math.cos(angle) * 0.5,
                    vy: Math.sin(angle) * 0.5,
                    type: cell.type,
                    age: 0,
                    energy: cell.energy * 0.4,
                    maxEnergy: cell.maxEnergy,
                    size: cell.size * 0.9,
                    neighbors: [],
                    fieldExposure: { ...cell.fieldExposure },
                    polarityAngle: angle,
                    divisionCooldown: 50,
                    adhesionStrength: cell.adhesionStrength,
                    fate: null
                };
                
                // Energy cost
                cell.energy *= 0.5;
                cell.divisionCooldown = 50;
                
                // Asymmetric division for stem cells
                if (cell.type.name === 'stem' && Math.random() < 0.3) {
                    daughter.fate = this.cellTypes[1 + Math.floor(Math.random() * 4)];
                }
                
                newCells.push(daughter);
            }
        });
        
        this.cells.push(...newCells);
        
        // Limit total cells
        if (this.cells.length > 500) {
            // Remove oldest cells
            this.cells.sort((a, b) => b.age - a.age);
            this.cells = this.cells.slice(0, 500);
        }
    }
    
    processDifferentiation() {
        this.cells.forEach(cell => {
            // Skip if already differentiated
            if (cell.type.name !== 'stem') return;
            
            // Check differentiation conditions
            if (cell.fieldExposure.differentiation > this.differentiationThreshold) {
                let newType = null;
                
                // Position-based fate with field influence
                const relX = cell.x / this.canvas.width;
                const relY = cell.y / this.canvas.height;
                const fieldStrength = cell.fieldExposure.differentiation;
                
                if (cell.fate) {
                    // Predetermined fate
                    newType = cell.fate;
                } else if (fieldStrength > 0.7) {
                    // Strong field influence
                    if (cell.fieldExposure.polarity > 0.5) {
                        newType = this.cellTypes[1]; // neural
                    } else if (cell.fieldExposure.growth > 0.5) {
                        newType = this.cellTypes[2]; // muscle
                    } else {
                        newType = this.cellTypes[3]; // epithelial
                    }
                } else {
                    // Position-based default
                    if (relY < 0.3) {
                        newType = this.cellTypes[1]; // neural (dorsal)
                    } else if (relY > 0.7) {
                        newType = this.cellTypes[3]; // epithelial (ventral)
                    } else if (relX < 0.3 || relX > 0.7) {
                        newType = this.cellTypes[2]; // muscle (lateral)
                    } else {
                        newType = this.cellTypes[4]; // support (central)
                    }
                }
                
                if (newType) {
                    cell.type = newType;
                    cell.size *= 1.2; // Differentiated cells are larger
                }
            }
        });
    }
    
    processApoptosis() {
        this.cells = this.cells.filter(cell => {
            // Programmed cell death conditions
            const apoptosisChance = cell.fieldExposure.apoptosis * 0.1;
            
            // Age-related death
            if (cell.age > 500) {
                return Math.random() > 0.05;
            }
            
            // Field-induced death
            if (Math.random() < apoptosisChance) {
                return false;
            }
            
            // Energy depletion
            if (cell.energy <= 0) {
                return false;
            }
            
            // Overcrowding
            if (cell.neighbors.length > 8) {
                return Math.random() > 0.1;
            }
            
            return true;
        });
    }
    
    updateCellPositions() {
        // Apply forces
        this.cells.forEach(cell => {
            // Reset forces
            let fx = 0, fy = 0;
            
            // Cell-cell interactions
            cell.neighbors.forEach(neighbor => {
                const dx = neighbor.x - cell.x;
                const dy = neighbor.y - cell.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0) {
                    const targetDist = (cell.size + neighbor.size) * 1.2;
                    
                    // Adhesion/repulsion
                    let force = 0;
                    if (dist < targetDist) {
                        // Repulsion
                        force = -0.5 * (targetDist - dist) / targetDist;
                    } else if (dist < targetDist * 2) {
                        // Adhesion (stronger for same cell types)
                        const adhesion = cell.type === neighbor.type ? 
                            cell.adhesionStrength : cell.adhesionStrength * 0.5;
                        force = adhesion * (dist - targetDist) / targetDist;
                    }
                    
                    fx += force * dx / dist;
                    fy += force * dy / dist;
                }
            });
            
            // Polarity-based self-propulsion
            if (cell.type.name === 'neural' || cell.type.name === 'muscle') {
                fx += Math.cos(cell.polarityAngle) * 0.1;
                fy += Math.sin(cell.polarityAngle) * 0.1;
            }
            
            // Morphogen chemotaxis
            const gridX = Math.floor(cell.x / this.fieldResolution);
            const gridY = Math.floor(cell.y / this.fieldResolution);
            
            if (gridX > 0 && gridX < this.fields.growth[0].length - 1 &&
                gridY > 0 && gridY < this.fields.growth.length - 1) {
                
                // Gradient following
                if (cell.type.name === 'stem') {
                    const gradX = this.fields.growth[gridY][gridX + 1] - this.fields.growth[gridY][gridX - 1];
                    const gradY = this.fields.growth[gridY + 1][gridX] - this.fields.growth[gridY - 1][gridX];
                    fx += gradX * 2;
                    fy += gradY * 2;
                }
            }
            
            // Update velocity
            cell.vx = cell.vx * 0.9 + fx * 0.1;
            cell.vy = cell.vy * 0.9 + fy * 0.1;
            
            // Speed limit
            const speed = Math.sqrt(cell.vx * cell.vx + cell.vy * cell.vy);
            const maxSpeed = 1;
            if (speed > maxSpeed) {
                cell.vx = (cell.vx / speed) * maxSpeed;
                cell.vy = (cell.vy / speed) * maxSpeed;
            }
        });
        
        // Update positions
        this.cells.forEach(cell => {
            cell.x += cell.vx;
            cell.y += cell.vy;
            
            // Keep in bounds
            cell.x = Math.max(cell.size, Math.min(this.canvas.width - cell.size, cell.x));
            cell.y = Math.max(cell.size, Math.min(this.canvas.height - cell.size, cell.y));
        });
    }
    
    detectStructures() {
        // Simple structure detection based on cell clustering
        this.organismStructures = [];
        
        const visited = new Set();
        
        this.cells.forEach(cell => {
            if (visited.has(cell)) return;
            
            // Find connected component
            const structure = {
                cells: [],
                types: {},
                center: { x: 0, y: 0 },
                size: 0
            };
            
            const queue = [cell];
            while (queue.length > 0) {
                const current = queue.shift();
                if (visited.has(current)) continue;
                
                visited.add(current);
                structure.cells.push(current);
                structure.types[current.type.name] = (structure.types[current.type.name] || 0) + 1;
                structure.center.x += current.x;
                structure.center.y += current.y;
                
                // Add connected neighbors
                current.neighbors.forEach(neighbor => {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                });
            }
            
            if (structure.cells.length > 5) {
                structure.center.x /= structure.cells.length;
                structure.center.y /= structure.cells.length;
                structure.size = Math.sqrt(structure.cells.length);
                this.organismStructures.push(structure);
            }
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw morphogenetic fields
        if (this.showFields) {
            this.drawField(this.fields[this.selectedField], this.selectedField);
        }
        
        // Draw morphogen sources
        this.morphogens.forEach(morphogen => {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(morphogen.x, morphogen.y, morphogen.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Type indicator
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(morphogen.type, morphogen.x - 20, morphogen.y);
        });
        
        // Draw cell connections
        if (this.showCellConnections) {
            this.cells.forEach(cell => {
                cell.neighbors.forEach(neighbor => {
                    if (cell.type === neighbor.type) {
                        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                        this.ctx.lineWidth = 0.5;
                        this.ctx.beginPath();
                        this.ctx.moveTo(cell.x, cell.y);
                        this.ctx.lineTo(neighbor.x, neighbor.y);
                        this.ctx.stroke();
                    }
                });
            });
        }
        
        // Draw cells
        this.cells.forEach(cell => {
            // Cell body
            this.ctx.fillStyle = cell.type.color;
            this.ctx.beginPath();
            this.ctx.arc(cell.x, cell.y, cell.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Polarity indicator
            if (cell.type.name === 'neural' || cell.type.name === 'muscle') {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(cell.x, cell.y);
                this.ctx.lineTo(
                    cell.x + Math.cos(cell.polarityAngle) * cell.size * 1.5,
                    cell.y + Math.sin(cell.polarityAngle) * cell.size * 1.5
                );
                this.ctx.stroke();
            }
            
            // Energy indicator
            if (cell.energy < cell.maxEnergy * 0.3) {
                this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(cell.x, cell.y, cell.size + 2, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
        
        // Draw detected structures
        this.organismStructures.forEach(structure => {
            this.ctx.strokeStyle = 'rgba(100, 255, 100, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(structure.center.x, structure.center.y, structure.size * 10, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        // Draw stats
        this.drawStats();
    }
    
    drawField(field, fieldName) {
        const colors = {
            growth: [0, 255, 0],
            differentiation: [255, 100, 255],
            polarity: [100, 100, 255],
            apoptosis: [255, 0, 0]
        };
        
        const [r, g, b] = colors[fieldName] || [255, 255, 255];
        
        for (let y = 0; y < field.length; y++) {
            for (let x = 0; x < field[0].length; x++) {
                const value = field[y][x];
                if (value > 0.01) {
                    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${value * 0.3})`;
                    this.ctx.fillRect(
                        x * this.fieldResolution,
                        y * this.fieldResolution,
                        this.fieldResolution,
                        this.fieldResolution
                    );
                }
            }
        }
        
        // Draw gradients
        if (this.showGradients) {
            this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
            this.ctx.lineWidth = 0.5;
            
            for (let y = 0; y < field.length - 1; y += 5) {
                for (let x = 0; x < field[0].length - 1; x += 5) {
                    const gradX = field[y][x + 1] - field[y][x];
                    const gradY = field[y + 1][x] - field[y][x];
                    const mag = Math.sqrt(gradX * gradX + gradY * gradY) * 10;
                    
                    if (mag > 0.01) {
                        const px = (x + 0.5) * this.fieldResolution;
                        const py = (y + 0.5) * this.fieldResolution;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(px, py);
                        this.ctx.lineTo(
                            px + gradX * this.fieldResolution * 5,
                            py + gradY * this.fieldResolution * 5
                        );
                        this.ctx.stroke();
                    }
                }
            }
        }
    }
    
    drawStats() {
        const cellCounts = {};
        this.cells.forEach(cell => {
            cellCounts[cell.type.name] = (cellCounts[cell.type.name] || 0) + 1;
        });
        
        const stats = {
            'Stage': this.developmentStage,
            'Total Cells': this.cells.length,
            'Structures': this.organismStructures.length,
            ...cellCounts
        };
        
        let y = 20;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px monospace';
        
        Object.entries(stats).forEach(([key, value]) => {
            this.ctx.fillText(`${key}: ${value}`, 10, y);
            y += 15;
        });
        
        // Field selector
        this.ctx.fillText(`Field: ${this.selectedField}`, this.canvas.width - 150, 20);
    }
    
    onMouseClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Cycle through fields with left click
        if (e.button === 0) {
            const fields = ['growth', 'differentiation', 'polarity', 'apoptosis'];
            const currentIndex = fields.indexOf(this.selectedField);
            this.selectedField = fields[(currentIndex + 1) % fields.length];
        }
    }
    
    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Right click to add morphogen
        if (e.button === 2) {
            this.morphogens.push({
                x: x,
                y: y,
                type: this.selectedField,
                strength: 0.8,
                radius: 60 + Math.random() * 40,
                gradient: ['radial', 'linear', 'spiral'][Math.floor(Math.random() * 3)]
            });
            
            // Limit morphogens
            if (this.morphogens.length > 8) {
                this.morphogens.shift();
            }
        }
    }
    
    getInfo() {
        return {
            name: 'Morphogenetic Fields',
            description: 'Developmental biology simulation where cells differentiate and organize based on morphogenetic field gradients.',
            instructions: 'Left click to cycle through field views. Right click to add morphogen sources. Watch as cells develop into organized structures.'
        };
    }
    
    getParameterDefs() {
        return [
            {
                name: 'showFields',
                label: 'Show Fields',
                type: 'checkbox',
                defaultValue: true
            },
            {
                name: 'showGradients',
                label: 'Show Gradients',
                type: 'checkbox',
                defaultValue: true
            },
            {
                name: 'showCellConnections',
                label: 'Show Cell Connections',
                type: 'checkbox',
                defaultValue: false
            },
            {
                name: 'differentiationThreshold',
                label: 'Differentiation Threshold',
                type: 'range',
                min: 0.1,
                max: 0.8,
                step: 0.1,
                defaultValue: 0.3
            },
            {
                name: 'growthThreshold',
                label: 'Growth Threshold',
                type: 'range',
                min: 0.1,
                max: 0.8,
                step: 0.1,
                defaultValue: 0.4
            },
            {
                name: 'cellAdhesion',
                label: 'Cell Adhesion',
                type: 'range',
                min: 0,
                max: 1,
                step: 0.1,
                defaultValue: 0.5
            }
        ];
    }
}