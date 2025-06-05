// Symbiotic Networks - Mutualistic and parasitic relationships in artificial ecosystems

class SymbioticNetworks extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Organism types
        this.producers = [];      // Create energy from environment
        this.consumers = [];      // Must consume others or form symbiosis
        this.decomposers = [];    // Break down dead organisms
        
        // Symbiotic relationships
        this.symbioses = [];      // Active symbiotic pairs/groups
        
        // Environment
        this.nutrients = [];      // Environmental nutrients
        this.deadMatter = [];     // Dead organisms to decompose
        
        // Parameters
        this.producerCount = 30;
        this.consumerCount = 40;
        this.decomposerCount = 20;
        this.nutrientDensity = 0.001;
        this.symbiosisThreshold = 0.7;
        this.parasitismThreshold = 0.3;
        
        // Display options
        this.showConnections = true;
        this.showEnergy = true;
        this.showTypes = true;
    }
    
    init() {
        this.reset();
    }
    
    reset() {
        // Clear all arrays
        this.producers = [];
        this.consumers = [];
        this.decomposers = [];
        this.symbioses = [];
        this.nutrients = [];
        this.deadMatter = [];
        
        // Create producers
        for (let i = 0; i < this.producerCount; i++) {
            this.producers.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                energy: 50,
                maxEnergy: 100,
                size: 8,
                efficiency: 0.5 + Math.random() * 0.5,
                age: 0,
                symbioticPartners: [],
                type: 'producer'
            });
        }
        
        // Create consumers
        for (let i = 0; i < this.consumerCount; i++) {
            this.consumers.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                energy: 40,
                maxEnergy: 80,
                size: 10,
                speed: 1 + Math.random(),
                preference: Math.random(), // 0 = parasitic, 1 = mutualistic
                age: 0,
                symbioticPartners: [],
                type: 'consumer'
            });
        }
        
        // Create decomposers
        for (let i = 0; i < this.decomposerCount; i++) {
            this.decomposers.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                energy: 30,
                maxEnergy: 60,
                size: 6,
                decompositionRate: 0.1 + Math.random() * 0.2,
                age: 0,
                symbioticPartners: [],
                type: 'decomposer'
            });
        }
        
        // Scatter initial nutrients
        this.scatterNutrients();
    }
    
    scatterNutrients() {
        const nutrientCount = Math.floor(this.canvas.width * this.canvas.height * this.nutrientDensity);
        for (let i = 0; i < nutrientCount; i++) {
            this.nutrients.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                amount: 5 + Math.random() * 10
            });
        }
    }
    
    update() {
        // Update all organism types
        this.updateOrganisms(this.producers);
        this.updateOrganisms(this.consumers);
        this.updateOrganisms(this.decomposers);
        
        // Process interactions
        this.processProducerBehavior();
        this.processConsumerBehavior();
        this.processDecomposerBehavior();
        
        // Update symbiotic relationships
        this.updateSymbioses();
        
        // Environmental processes
        this.processEnvironment();
        
        // Reproduction and death
        this.processLifeCycle();
    }
    
    updateOrganisms(organisms) {
        organisms.forEach(org => {
            // Movement
            org.x += org.vx;
            org.y += org.vy;
            
            // Wrap around edges
            if (org.x < 0) org.x = this.canvas.width;
            if (org.x > this.canvas.width) org.x = 0;
            if (org.y < 0) org.y = this.canvas.height;
            if (org.y > this.canvas.height) org.y = 0;
            
            // Random walk
            org.vx += (Math.random() - 0.5) * 0.1;
            org.vy += (Math.random() - 0.5) * 0.1;
            
            // Speed limit
            const speed = Math.sqrt(org.vx * org.vx + org.vy * org.vy);
            const maxSpeed = org.type === 'consumer' ? org.speed : 1;
            if (speed > maxSpeed) {
                org.vx = (org.vx / speed) * maxSpeed;
                org.vy = (org.vy / speed) * maxSpeed;
            }
            
            // Energy decay
            org.energy -= 0.1;
            if (org.symbioticPartners.length > 0) {
                org.energy -= 0.05 * org.symbioticPartners.length; // Symbiosis cost
            }
            
            // Age
            org.age++;
        });
    }
    
    processProducerBehavior() {
        this.producers.forEach(producer => {
            // Photosynthesis - absorb nutrients
            this.nutrients = this.nutrients.filter(nutrient => {
                const dx = producer.x - nutrient.x;
                const dy = producer.y - nutrient.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < producer.size + 5) {
                    producer.energy = Math.min(producer.energy + nutrient.amount * producer.efficiency, producer.maxEnergy);
                    return false;
                }
                return true;
            });
            
            // Share energy with mutualistic partners
            producer.symbioticPartners.forEach(partner => {
                if (partner.preference > this.symbiosisThreshold) {
                    // Mutualistic relationship
                    const energyShare = producer.energy * 0.1;
                    producer.energy -= energyShare;
                    partner.energy += energyShare * 0.8; // Some loss in transfer
                }
            });
        });
    }
    
    processConsumerBehavior() {
        this.consumers.forEach(consumer => {
            // Find nearby organisms for interaction
            const nearbyProducers = this.findNearby(consumer, this.producers, 50);
            const nearbyConsumers = this.findNearby(consumer, this.consumers, 50);
            
            if (nearbyProducers.length > 0) {
                const target = nearbyProducers[0];
                
                // Decide interaction type based on preference
                if (consumer.preference > this.symbiosisThreshold) {
                    // Attempt mutualistic symbiosis
                    this.formSymbiosis(consumer, target, 'mutualistic');
                } else if (consumer.preference < this.parasitismThreshold) {
                    // Parasitic behavior
                    this.formSymbiosis(consumer, target, 'parasitic');
                } else {
                    // Predation
                    const dx = target.x - consumer.x;
                    const dy = target.y - consumer.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < consumer.size + target.size) {
                        consumer.energy += target.energy * 0.5;
                        target.energy = 0; // Kill the producer
                    } else {
                        // Chase
                        consumer.vx += dx / dist * 0.1;
                        consumer.vy += dy / dist * 0.1;
                    }
                }
            }
            
            // Consumer cooperation
            if (nearbyConsumers.length > 1 && consumer.preference > 0.5) {
                nearbyConsumers.forEach(other => {
                    if (Math.abs(consumer.preference - other.preference) < 0.2) {
                        // Similar preferences, share information
                        consumer.vx = (consumer.vx + other.vx) / 2;
                        consumer.vy = (consumer.vy + other.vy) / 2;
                    }
                });
            }
        });
    }
    
    processDecomposerBehavior() {
        this.decomposers.forEach(decomposer => {
            // Find dead matter
            this.deadMatter = this.deadMatter.filter(matter => {
                const dx = decomposer.x - matter.x;
                const dy = decomposer.y - matter.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < decomposer.size + 10) {
                    // Decompose
                    const extracted = matter.energy * decomposer.decompositionRate;
                    decomposer.energy += extracted;
                    matter.energy -= extracted;
                    
                    // Release nutrients
                    if (Math.random() < 0.1) {
                        this.nutrients.push({
                            x: matter.x + (Math.random() - 0.5) * 20,
                            y: matter.y + (Math.random() - 0.5) * 20,
                            amount: extracted * 0.5
                        });
                    }
                    
                    return matter.energy > 0;
                } else if (dist < 100) {
                    // Move toward dead matter
                    decomposer.vx += dx / dist * 0.05;
                    decomposer.vy += dy / dist * 0.05;
                }
                return true;
            });
        });
    }
    
    formSymbiosis(organism1, organism2, type) {
        // Check if already in symbiosis
        if (organism1.symbioticPartners.includes(organism2)) return;
        
        // Form symbiotic relationship
        organism1.symbioticPartners.push(organism2);
        organism2.symbioticPartners.push(organism1);
        
        this.symbioses.push({
            organisms: [organism1, organism2],
            type: type,
            strength: 0.5,
            age: 0
        });
    }
    
    updateSymbioses() {
        this.symbioses = this.symbioses.filter(symbiosis => {
            symbiosis.age++;
            
            // Check if organisms are still alive
            const allAlive = symbiosis.organisms.every(org => org.energy > 0);
            if (!allAlive) {
                // Break symbiosis
                symbiosis.organisms.forEach(org => {
                    org.symbioticPartners = org.symbioticPartners.filter(
                        partner => symbiosis.organisms.indexOf(partner) === -1
                    );
                });
                return false;
            }
            
            // Update symbiosis based on type
            if (symbiosis.type === 'mutualistic') {
                // Both benefit
                symbiosis.strength = Math.min(symbiosis.strength + 0.01, 1);
                
                // Keep organisms close
                const org1 = symbiosis.organisms[0];
                const org2 = symbiosis.organisms[1];
                const dx = org2.x - org1.x;
                const dy = org2.y - org1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 30) {
                    org1.vx += dx / dist * 0.05;
                    org1.vy += dy / dist * 0.05;
                    org2.vx -= dx / dist * 0.05;
                    org2.vy -= dy / dist * 0.05;
                }
            } else if (symbiosis.type === 'parasitic') {
                // Parasite benefits, host suffers
                const parasite = symbiosis.organisms[0];
                const host = symbiosis.organisms[1];
                
                const drain = 0.2 * symbiosis.strength;
                host.energy -= drain;
                parasite.energy += drain * 0.8;
                
                // Host tries to escape if energy low
                if (host.energy < host.maxEnergy * 0.3) {
                    const dx = parasite.x - host.x;
                    const dy = parasite.y - host.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    host.vx -= dx / dist * 0.1;
                    host.vy -= dy / dist * 0.1;
                }
            }
            
            return true;
        });
    }
    
    processEnvironment() {
        // Randomly add nutrients
        if (Math.random() < 0.01) {
            this.nutrients.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                amount: 5 + Math.random() * 15
            });
        }
        
        // Nutrient diffusion
        this.nutrients.forEach(nutrient => {
            nutrient.x += (Math.random() - 0.5) * 0.5;
            nutrient.y += (Math.random() - 0.5) * 0.5;
            nutrient.amount *= 0.995; // Slow decay
        });
        
        // Remove depleted nutrients
        this.nutrients = this.nutrients.filter(n => n.amount > 0.1);
    }
    
    processLifeCycle() {
        // Process each organism type
        [this.producers, this.consumers, this.decomposers].forEach(organisms => {
            const toRemove = [];
            const toAdd = [];
            
            organisms.forEach((org, index) => {
                // Death
                if (org.energy <= 0 || org.age > 1000) {
                    toRemove.push(index);
                    this.deadMatter.push({
                        x: org.x,
                        y: org.y,
                        energy: org.maxEnergy * 0.5,
                        type: org.type
                    });
                }
                
                // Reproduction
                if (org.energy > org.maxEnergy * 0.8 && Math.random() < 0.01) {
                    const offspring = Object.assign({}, org);
                    offspring.x += (Math.random() - 0.5) * 20;
                    offspring.y += (Math.random() - 0.5) * 20;
                    offspring.energy = org.maxEnergy * 0.3;
                    offspring.age = 0;
                    offspring.symbioticPartners = [];
                    
                    // Mutation
                    if (org.type === 'producer') {
                        offspring.efficiency += (Math.random() - 0.5) * 0.1;
                        offspring.efficiency = Math.max(0.1, Math.min(1, offspring.efficiency));
                    } else if (org.type === 'consumer') {
                        offspring.preference += (Math.random() - 0.5) * 0.1;
                        offspring.preference = Math.max(0, Math.min(1, offspring.preference));
                    }
                    
                    org.energy -= org.maxEnergy * 0.4;
                    toAdd.push(offspring);
                }
            });
            
            // Remove dead organisms
            toRemove.sort((a, b) => b - a).forEach(index => {
                organisms.splice(index, 1);
            });
            
            // Add offspring
            organisms.push(...toAdd);
        });
        
        // Limit populations
        if (this.producers.length > 100) this.producers.length = 100;
        if (this.consumers.length > 150) this.consumers.length = 150;
        if (this.decomposers.length > 80) this.decomposers.length = 80;
    }
    
    findNearby(organism, list, radius) {
        return list.filter(other => {
            if (other === organism) return false;
            const dx = other.x - organism.x;
            const dy = other.y - organism.y;
            return dx * dx + dy * dy < radius * radius;
        }).sort((a, b) => {
            const distA = Math.sqrt((a.x - organism.x) ** 2 + (a.y - organism.y) ** 2);
            const distB = Math.sqrt((b.x - organism.x) ** 2 + (b.y - organism.y) ** 2);
            return distA - distB;
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(15, 15, 15, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw nutrients
        this.ctx.fillStyle = 'rgba(100, 200, 100, 0.3)';
        this.nutrients.forEach(nutrient => {
            this.ctx.beginPath();
            this.ctx.arc(nutrient.x, nutrient.y, nutrient.amount / 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw dead matter
        this.ctx.fillStyle = 'rgba(100, 50, 50, 0.5)';
        this.deadMatter.forEach(matter => {
            this.ctx.beginPath();
            this.ctx.arc(matter.x, matter.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw symbiotic connections
        if (this.showConnections) {
            this.symbioses.forEach(symbiosis => {
                const org1 = symbiosis.organisms[0];
                const org2 = symbiosis.organisms[1];
                
                this.ctx.beginPath();
                this.ctx.moveTo(org1.x, org1.y);
                this.ctx.lineTo(org2.x, org2.y);
                
                if (symbiosis.type === 'mutualistic') {
                    this.ctx.strokeStyle = `rgba(100, 255, 100, ${symbiosis.strength * 0.5})`;
                    this.ctx.lineWidth = 2;
                } else {
                    this.ctx.strokeStyle = `rgba(255, 100, 100, ${symbiosis.strength * 0.5})`;
                    this.ctx.lineWidth = 1;
                }
                
                this.ctx.stroke();
            });
        }
        
        // Draw organisms
        this.drawOrganismType(this.producers, 'rgba(50, 255, 50, 0.8)');
        this.drawOrganismType(this.consumers, 'rgba(255, 150, 50, 0.8)');
        this.drawOrganismType(this.decomposers, 'rgba(150, 100, 255, 0.8)');
        
        // Draw stats
        this.drawStats();
    }
    
    drawOrganismType(organisms, baseColor) {
        organisms.forEach(org => {
            if (org.energy <= 0) return;
            
            // Energy indicator
            if (this.showEnergy) {
                const energyRatio = org.energy / org.maxEnergy;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${energyRatio * 0.2})`;
                this.ctx.beginPath();
                this.ctx.arc(org.x, org.y, org.size + 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Main organism
            this.ctx.fillStyle = baseColor;
            this.ctx.beginPath();
            this.ctx.arc(org.x, org.y, org.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Type indicator
            if (this.showTypes && org.type === 'consumer') {
                // Show preference as inner color
                const r = Math.floor(255 * (1 - org.preference));
                const g = Math.floor(255 * org.preference);
                this.ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
                this.ctx.beginPath();
                this.ctx.arc(org.x, org.y, org.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Symbiotic indicator
            if (org.symbioticPartners.length > 0) {
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(org.x, org.y, org.size + 3, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }
    
    drawStats() {
        const stats = {
            'Producers': this.producers.length,
            'Consumers': this.consumers.length,
            'Decomposers': this.decomposers.length,
            'Symbioses': this.symbioses.length,
            'Mutualistic': this.symbioses.filter(s => s.type === 'mutualistic').length,
            'Parasitic': this.symbioses.filter(s => s.type === 'parasitic').length,
            'Nutrients': this.nutrients.length,
            'Dead Matter': this.deadMatter.length
        };
        
        let statsText = Object.entries(stats).map(([key, value]) => `${key}: ${value}`).join(' | ');
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(statsText, 10, this.canvas.height - 10);
    }
    
    onMouseClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Add a cluster of nutrients at click location
        for (let i = 0; i < 10; i++) {
            this.nutrients.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                amount: 10 + Math.random() * 20
            });
        }
    }
    
    getInfo() {
        return {
            name: 'Symbiotic Networks',
            description: 'Complex ecosystem with mutualistic and parasitic relationships between different organism types.',
            instructions: 'Click to add nutrients. Watch as organisms form various symbiotic relationships and the ecosystem evolves.'
        };
    }
    
    getParameterDefs() {
        return [
            {
                name: 'showConnections',
                label: 'Show Connections',
                type: 'checkbox',
                defaultValue: true
            },
            {
                name: 'showEnergy',
                label: 'Show Energy',
                type: 'checkbox',
                defaultValue: true
            },
            {
                name: 'symbiosisThreshold',
                label: 'Symbiosis Threshold',
                type: 'range',
                min: 0,
                max: 1,
                step: 0.1,
                defaultValue: 0.7
            },
            {
                name: 'parasitismThreshold',
                label: 'Parasitism Threshold',
                type: 'range',
                min: 0,
                max: 1,
                step: 0.1,
                defaultValue: 0.3
            }
        ];
    }
}