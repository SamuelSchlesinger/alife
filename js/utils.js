// Utility functions for artificial life simulations

class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2D(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector2D(this.x - vector.x, this.y - vector.y);
    }

    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        if (scalar === 0) return new Vector2D(0, 0);
        return new Vector2D(this.x / scalar, this.y / scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D(0, 0);
        return this.divide(mag);
    }

    limit(max) {
        if (this.magnitude() > max) {
            return this.normalize().multiply(max);
        }
        return new Vector2D(this.x, this.y);
    }

    distance(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    angle() {
        return Math.atan2(this.y, this.x);
    }

    copy() {
        return new Vector2D(this.x, this.y);
    }

    static random() {
        const angle = Math.random() * Math.PI * 2;
        return new Vector2D(Math.cos(angle), Math.sin(angle));
    }
}

// Color utilities
const Color = {
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    interpolate(color1, color2, factor) {
        const r = Math.round(color1.r + (color2.r - color1.r) * factor);
        const g = Math.round(color1.g + (color2.g - color1.g) * factor);
        const b = Math.round(color1.b + (color2.b - color1.b) * factor);
        return { r, g, b };
    }
};

// Math utilities
const MathUtils = {
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    constrain(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    map(value, start1, stop1, start2, stop2) {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    },

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    gaussian(mean = 0, stdev = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return mean + stdev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
};

// Grid utilities for cellular automata
class Grid {
    constructor(width, height, defaultValue = 0) {
        this.width = Math.max(1, width || 1);
        this.height = Math.max(1, height || 1);
        this.cells = new Array(this.width * this.height).fill(defaultValue);
    }

    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 0;
        }
        return this.cells[y * this.width + x];
    }

    set(x, y, value) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.cells[y * this.width + x] = value;
        }
    }

    clear(value = 0) {
        this.cells.fill(value);
    }

    forEach(callback) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                callback(x, y, this.get(x, y));
            }
        }
    }

    getNeighbors(x, y, includeDiagonals = true) {
        const neighbors = [];
        const directions = includeDiagonals ? 
            [[-1,-1], [0,-1], [1,-1], [-1,0], [1,0], [-1,1], [0,1], [1,1]] :
            [[0,-1], [-1,0], [1,0], [0,1]];

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                neighbors.push(this.get(nx, ny));
            }
        }
        return neighbors;
    }

    copy() {
        const newGrid = new Grid(this.width, this.height);
        newGrid.cells = [...this.cells];
        return newGrid;
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.updateInterval = 500; // Update every 500ms
    }

    update() {
        this.frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;

        if (elapsed >= this.updateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        return this.fps;
    }
}

// Canvas utilities
const CanvasUtils = {
    clear(ctx, color = '#000000') {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },

    drawGrid(ctx, cellSize, color = 'rgba(255, 255, 255, 0.1)') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        for (let x = 0; x <= ctx.canvas.width; x += cellSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= ctx.canvas.height; y += cellSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();
        }
    },

    drawCircle(ctx, x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    },

    drawLine(ctx, x1, y1, x2, y2, color, width = 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
};

// Export utilities
window.Vector2D = Vector2D;
window.Color = Color;
window.MathUtils = MathUtils;
window.Grid = Grid;
window.PerformanceMonitor = PerformanceMonitor;
window.CanvasUtils = CanvasUtils;