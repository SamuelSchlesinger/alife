// Base class for all simulations

class BaseSimulation {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isRunning = true;
        this.frameRate = 30;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / this.frameRate;
        this.performanceMonitor = new PerformanceMonitor();
        this.stats = {};
        
        // Default parameters that can be overridden
        this.parameters = {};
        
        // Resize canvas to fit container
        // Delay resize to ensure DOM is ready
        setTimeout(() => {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }, 0);
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;
        this.onResize();
    }

    // Override in subclasses
    onResize() {}

    // Initialize the simulation
    init() {
        throw new Error('init() must be implemented in subclass');
    }

    // Update simulation state
    update(deltaTime) {
        throw new Error('update() must be implemented in subclass');
    }

    // Render the simulation
    render() {
        throw new Error('render() must be implemented in subclass');
    }

    // Reset the simulation
    reset() {
        this.init();
    }

    // Clear the simulation
    clear() {
        CanvasUtils.clear(this.ctx);
    }

    // Main animation loop
    animate(currentTime) {
        if (!this.isRunning) return;

        requestAnimationFrame((time) => this.animate(time));

        const deltaTime = currentTime - this.lastFrameTime;

        if (deltaTime >= this.frameInterval) {
            this.update(deltaTime);
            this.render();
            
            // Update FPS
            this.stats.fps = this.performanceMonitor.update();
            this.updateStats();
            
            this.lastFrameTime = currentTime - (deltaTime % this.frameInterval);
        }
    }

    // Start the simulation
    start() {
        this.isRunning = true;
        requestAnimationFrame((time) => this.animate(time));
    }

    // Stop the simulation
    stop() {
        this.isRunning = false;
    }

    // Set frame rate
    setFrameRate(fps) {
        this.frameRate = fps;
        this.frameInterval = 1000 / fps;
    }

    // Update statistics display
    updateStats() {
        const statsEl = document.getElementById('stats');
        if (statsEl) {
            const statsText = Object.entries(this.stats)
                .map(([key, value]) => `${key}: ${value}`)
                .join(' | ');
            statsEl.textContent = statsText;
        }
    }

    // Handle mouse events
    onMouseDown(event) {}
    onMouseMove(event) {}
    onMouseUp(event) {}
    onMouseClick(event) {}

    // Handle keyboard events
    onKeyDown(event) {}
    onKeyUp(event) {}

    // Get mouse position relative to canvas
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    // Update parameters
    updateParameter(name, value) {
        if (this.parameters.hasOwnProperty(name)) {
            this.parameters[name] = value;
            this.onParameterChange(name, value);
        }
    }

    // Override to handle parameter changes
    onParameterChange(name, value) {}

    // Get simulation info
    getInfo() {
        return {
            name: 'Base Simulation',
            description: 'Override this method to provide simulation information',
            instructions: 'Override this method to provide usage instructions'
        };
    }

    // Get parameter definitions for UI
    getParameterDefs() {
        return [];
    }
}

// Export base simulation
window.BaseSimulation = BaseSimulation;