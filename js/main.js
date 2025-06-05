// Main application controller

class ArtificialLifeApp {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentSimulation = null;
        this.isPlaying = true;
        
        // Available simulations
        this.simulations = {
            gameOfLife: GameOfLife,
            langtonsAnt: LangtonsAnt,
            boids: Boids,
            lSystem: LSystem,
            particleLife: ParticleLife,
            reactionDiffusion: ReactionDiffusion,
            evolution: Evolution,
            cellular1d: Cellular1D,
            slimeMold: SlimeMold,
            neuralCreatures: NeuralCreatures,
            quantumCoherence: QuantumCoherenceColonies,
            temporalEcho: TemporalEchoNetworks,
            symbioticNetworks: SymbioticNetworks,
            memeticEvolution: MemeticEvolution,
            morphogeneticFields: MorphogeneticFields
        };
        
        // Initialize
        this.init();
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Load default simulation
        this.loadSimulation('memeticEvolution');
        
        // Start animation loop
        this.animate();
    }

    setupEventListeners() {
        // Simulation selection buttons
        const simButtons = document.querySelectorAll('.sim-button');
        simButtons.forEach(button => {
            button.addEventListener('click', () => {
                const simName = button.getAttribute('data-sim');
                this.loadSimulation(simName);
                
                // Update active button
                simButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            });
        });
        
        // Control buttons
        document.getElementById('playPause').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            if (this.currentSimulation) {
                this.currentSimulation.reset();
            }
        });
        
        document.getElementById('clear').addEventListener('click', () => {
            if (this.currentSimulation) {
                this.currentSimulation.clear();
            }
        });
        
        // Speed control
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        speedSlider.addEventListener('input', (e) => {
            const fps = parseInt(e.target.value);
            speedValue.textContent = `${fps} FPS`;
            
            if (this.currentSimulation) {
                this.currentSimulation.setFrameRate(fps);
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            if (this.currentSimulation) {
                this.currentSimulation.resizeCanvas();
            }
        });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    loadSimulation(simName) {
        // Stop current simulation
        if (this.currentSimulation) {
            this.currentSimulation.stop();
            
            // Remove event listeners
            this.canvas.removeEventListener('mousedown', this.currentSimulation.boundMouseDown);
            this.canvas.removeEventListener('mousemove', this.currentSimulation.boundMouseMove);
            this.canvas.removeEventListener('mouseup', this.currentSimulation.boundMouseUp);
            this.canvas.removeEventListener('click', this.currentSimulation.boundMouseClick);
        }
        
        // Create new simulation
        const SimulationClass = this.simulations[simName];
        if (SimulationClass) {
            this.currentSimulation = new SimulationClass(this.canvas, this.ctx);
            
            // Bind event handlers
            this.currentSimulation.boundMouseDown = (e) => this.currentSimulation.onMouseDown(e);
            this.currentSimulation.boundMouseMove = (e) => this.currentSimulation.onMouseMove(e);
            this.currentSimulation.boundMouseUp = (e) => this.currentSimulation.onMouseUp(e);
            this.currentSimulation.boundMouseClick = (e) => this.currentSimulation.onMouseClick(e);
            
            // Add event listeners
            this.canvas.addEventListener('mousedown', this.currentSimulation.boundMouseDown);
            this.canvas.addEventListener('mousemove', this.currentSimulation.boundMouseMove);
            this.canvas.addEventListener('mouseup', this.currentSimulation.boundMouseUp);
            this.canvas.addEventListener('click', this.currentSimulation.boundMouseClick);
            
            // Initialize simulation after a small delay to ensure DOM is ready
            setTimeout(() => {
                this.currentSimulation.init();
                
                // Update UI
                this.updateSimulationInfo();
                this.createParameterControls();
                
                // Reset play state
                this.isPlaying = true;
                document.getElementById('playPause').textContent = 'Pause';
                
                // Set initial speed
                const speedSlider = document.getElementById('speedSlider');
                this.currentSimulation.setFrameRate(parseInt(speedSlider.value));
                
                // Start simulation
                this.currentSimulation.start();
            }, 100);
        }
    }

    updateSimulationInfo() {
        const infoPanel = document.getElementById('simulationInfo');
        const info = this.currentSimulation.getInfo();
        
        infoPanel.innerHTML = `
            <h4>${info.name}</h4>
            <p>${info.description}</p>
            <p><strong>Instructions:</strong> ${info.instructions}</p>
        `;
    }

    createParameterControls() {
        const container = document.getElementById('simulationParams');
        container.innerHTML = '';
        
        const paramDefs = this.currentSimulation.getParameterDefs();
        
        paramDefs.forEach(param => {
            const group = document.createElement('div');
            group.className = 'param-group';
            
            const label = document.createElement('label');
            label.textContent = param.label;
            label.setAttribute('for', `param-${param.name}`);
            group.appendChild(label);
            
            let input;
            
            switch (param.type) {
                case 'range':
                    input = document.createElement('input');
                    input.type = 'range';
                    input.min = param.min;
                    input.max = param.max;
                    input.step = param.step;
                    input.value = param.defaultValue;
                    
                    // Add value display
                    const valueDisplay = document.createElement('span');
                    valueDisplay.textContent = param.defaultValue;
                    valueDisplay.style.marginLeft = '10px';
                    valueDisplay.style.color = '#00ff88';
                    
                    input.addEventListener('input', (e) => {
                        valueDisplay.textContent = e.target.value;
                        this.currentSimulation.updateParameter(param.name, parseFloat(e.target.value));
                    });
                    
                    group.appendChild(input);
                    group.appendChild(valueDisplay);
                    break;
                    
                case 'checkbox':
                    input = document.createElement('input');
                    input.type = 'checkbox';
                    input.checked = param.defaultValue;
                    
                    input.addEventListener('change', (e) => {
                        this.currentSimulation.updateParameter(param.name, e.target.checked);
                    });
                    
                    // Wrap checkbox with label
                    const checkboxLabel = document.createElement('label');
                    checkboxLabel.style.display = 'flex';
                    checkboxLabel.style.alignItems = 'center';
                    checkboxLabel.appendChild(input);
                    checkboxLabel.appendChild(document.createTextNode(' ' + param.label));
                    
                    group.innerHTML = '';
                    group.appendChild(checkboxLabel);
                    break;
                    
                case 'select':
                    input = document.createElement('select');
                    
                    param.options.forEach((option, index) => {
                        const optionEl = document.createElement('option');
                        optionEl.value = option;
                        optionEl.textContent = param.labels ? param.labels[index] : option;
                        if (option === param.defaultValue) {
                            optionEl.selected = true;
                        }
                        input.appendChild(optionEl);
                    });
                    
                    input.addEventListener('change', (e) => {
                        this.currentSimulation.updateParameter(param.name, e.target.value);
                    });
                    
                    group.appendChild(input);
                    break;
                    
                case 'color':
                    input = document.createElement('input');
                    input.type = 'color';
                    input.value = param.defaultValue;
                    
                    input.addEventListener('change', (e) => {
                        this.currentSimulation.updateParameter(param.name, e.target.value);
                    });
                    
                    group.appendChild(input);
                    break;
            }
            
            if (input) {
                input.id = `param-${param.name}`;
            }
            
            container.appendChild(group);
        });
    }

    togglePlayPause() {
        const button = document.getElementById('playPause');
        
        if (this.isPlaying) {
            this.isPlaying = false;
            button.textContent = 'Play';
            if (this.currentSimulation) {
                this.currentSimulation.stop();
            }
        } else {
            this.isPlaying = true;
            button.textContent = 'Pause';
            if (this.currentSimulation) {
                this.currentSimulation.start();
            }
        }
    }

    animate() {
        // The individual simulations handle their own animation loops
        // This is just to ensure the app is responsive
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ArtificialLifeApp();
});