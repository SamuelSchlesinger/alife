// Memetic Evolution - Cultural transmission and behavioral evolution through social learning

class MemeticEvolution extends BaseSimulation {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        
        // Agents
        this.agents = [];
        
        // Behavioral memes (cultural units) with enhanced properties
        this.memeTypes = [
            { 
                id: 'forager', 
                color: 'rgba(100, 255, 100, 0.8)', 
                efficiency: 1.0,
                symbol: '🌾',
                traits: { caution: 0.5, cooperation: 0.7, curiosity: 0.6 }
            },
            { 
                id: 'hunter', 
                color: 'rgba(255, 100, 100, 0.8)', 
                efficiency: 1.5,
                symbol: '🏹',
                traits: { caution: 0.3, cooperation: 0.4, curiosity: 0.8 }
            },
            { 
                id: 'gatherer', 
                color: 'rgba(100, 100, 255, 0.8)', 
                efficiency: 0.8,
                symbol: '🧺',
                traits: { caution: 0.7, cooperation: 0.8, curiosity: 0.5 }
            },
            { 
                id: 'teacher', 
                color: 'rgba(255, 255, 100, 0.8)', 
                efficiency: 0.5,
                symbol: '📚',
                traits: { caution: 0.5, cooperation: 0.9, curiosity: 0.7 }
            },
            { 
                id: 'innovator', 
                color: 'rgba(255, 100, 255, 0.8)', 
                efficiency: 0.7,
                symbol: '💡',
                traits: { caution: 0.2, cooperation: 0.5, curiosity: 0.9 }
            }
        ];
        
        // Resources
        this.resources = [];
        
        // Cultural centers (high-density learning zones)
        this.culturalCenters = [];
        
        // Parameters
        this.agentCount = 100;
        this.resourceDensity = 0.002;
        this.learningRadius = 50;
        this.innovationRate = 0.001;
        this.conformityBias = 0.7;
        this.prestigeBias = 0.8;
        this.memorySize = 5;
        
        // Display options
        this.showLearning = true;
        this.showCulturalCenters = true;
        this.showMemeDistribution = true;
        
        // Meme statistics
        this.memeHistory = [];
        this.innovationCount = 0;
        
        // Visual effects
        this.learningEffects = [];
        this.culturalParticles = [];
        this.culturalTrails = [];
        
        // Environmental features
        this.landmarks = [];
        this.dangerZones = [];
        this.abundantZones = [];
        
        // Cultural knowledge
        this.culturalKnowledge = new Map(); // Shared discoveries
        this.culturalTaboos = new Map(); // Learned dangers
        this.culturalTraditions = new Map(); // Successful patterns
        
        // Name pool for meme variants
        this.memeNamePool = [
            // Behavioral descriptors
            'seeker', 'wanderer', 'explorer', 'pioneer', 'nomad', 'ranger', 'scout',
            'tracker', 'stalker', 'prowler', 'roamer', 'drifter', 'pilgrim', 'voyager',
            
            // Social roles
            'mentor', 'guide', 'sage', 'elder', 'oracle', 'shaman', 'mystic',
            'herald', 'envoy', 'emissary', 'diplomat', 'mediator', 'arbiter', 'consul',
            
            // Gathering behaviors
            'harvester', 'collector', 'hoarder', 'scavenger', 'gleaner', 'reaper', 'picker',
            'stockpiler', 'accumulator', 'amasser', 'compiler', 'aggregator', 'assembler',
            
            // Hunting behaviors
            'predator', 'pursuer', 'chaser', 'ambusher', 'trapper', 'snarer', 'netter',
            'striker', 'pouncer', 'swooper', 'dasher', 'sprinter', 'charger', 'rusher',
            
            // Innovation behaviors
            'inventor', 'creator', 'designer', 'architect', 'engineer', 'builder', 'maker',
            'tinkerer', 'experimenter', 'researcher', 'developer', 'pioneer', 'originator',
            
            // Movement patterns
            'circler', 'spiraler', 'zigzagger', 'weaver', 'dancer', 'spinner', 'twister',
            'glider', 'floater', 'darter', 'skipper', 'hopper', 'leaper', 'bounder',
            
            // Temporal behaviors
            'pacer', 'cycler', 'phaser', 'pulser', 'oscillator', 'alternator', 'shifter',
            'timer', 'scheduler', 'planner', 'forecaster', 'predictor', 'anticipator',
            
            // Social dynamics
            'follower', 'leader', 'coordinator', 'organizer', 'synchronizer', 'harmonizer',
            'mimic', 'imitator', 'copier', 'emulator', 'adapter', 'adopter', 'absorber',
            
            // Resource strategies
            'optimizer', 'maximizer', 'minimizer', 'balancer', 'moderator', 'regulator',
            'economist', 'strategist', 'tactician', 'planner', 'schemer', 'plotter',
            
            // Exploration styles
            'mapper', 'charter', 'surveyor', 'inspector', 'examiner', 'analyzer', 'assessor',
            'evaluator', 'appraiser', 'judge', 'critic', 'reviewer', 'observer', 'watcher',
            
            // Communication roles
            'broadcaster', 'transmitter', 'relayer', 'messenger', 'courier', 'dispatcher',
            'announcer', 'proclaimer', 'declarer', 'speaker', 'orator', 'preacher',
            
            // Learning behaviors
            'student', 'scholar', 'pupil', 'apprentice', 'disciple', 'devotee', 'adherent',
            'researcher', 'investigator', 'inquirer', 'questioner', 'seeker', 'prober',
            
            // Hybrid behaviors
            'guardian', 'sentinel', 'warden', 'keeper', 'custodian', 'steward', 'caretaker',
            'protector', 'defender', 'shield', 'barrier', 'buffer', 'filter', 'screen',
            
            // Abstract concepts
            'catalyst', 'trigger', 'spark', 'igniter', 'activator', 'enabler', 'facilitator',
            'amplifier', 'enhancer', 'booster', 'multiplier', 'accelerator', 'intensifier'
        ];
        
        this.usedNames = new Set();
    }
    
    init() {
        this.reset();
    }
    
    reset() {
        // Clear arrays
        this.agents = [];
        this.resources = [];
        this.culturalCenters = [];
        this.memeHistory = [];
        this.innovationCount = 0;
        this.culturalParticles = [];
        this.culturalTrails = [];
        this.landmarks = [];
        this.dangerZones = [];
        this.abundantZones = [];
        this.culturalKnowledge.clear();
        this.culturalTaboos.clear();
        this.culturalTraditions.clear();
        
        // Create agents with random initial memes
        for (let i = 0; i < this.agentCount; i++) {
            const initialMeme = this.memeTypes[Math.floor(Math.random() * this.memeTypes.length)];
            
            this.agents.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                meme: initialMeme,
                memeHistory: [initialMeme],
                energy: 50,
                maxEnergy: 100,
                prestige: 0,
                age: 0,
                learningEvents: 0,
                teachingEvents: 0,
                observationRadius: this.learningRadius,
                innovativeness: Math.random(),
                conformity: Math.random(),
                size: 8,
                experiences: [],
                knownDangers: new Set(),
                knownResources: new Set(),
                culturalBonds: [],
                trailIntensity: 1.0
            });
        }
        
        // Create initial cultural centers
        for (let i = 0; i < 3; i++) {
            this.culturalCenters.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 80 + Math.random() * 40,
                strength: 0.5,
                dominantMeme: null
            });
        }
        
        // Scatter resources
        this.scatterResources();
        
        // Create environmental features
        this.createEnvironmentalFeatures();
    }
    
    createEnvironmentalFeatures() {
        // Create landmarks (neutral features that can become culturally significant)
        for (let i = 0; i < 5; i++) {
            this.landmarks.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                type: ['stone', 'tree', 'water', 'hill', 'cave'][i],
                culturalSignificance: 0,
                stories: []
            });
        }
        
        // Create danger zones
        for (let i = 0; i < 3; i++) {
            this.dangerZones.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 40 + Math.random() * 30,
                severity: 0.5 + Math.random() * 0.5,
                discovered: false
            });
        }
        
        // Create abundant zones
        for (let i = 0; i < 4; i++) {
            this.abundantZones.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 50 + Math.random() * 40,
                richness: 0.5 + Math.random() * 0.5,
                discovered: false
            });
        }
    }
    
    scatterResources() {
        const count = Math.floor(this.canvas.width * this.canvas.height * this.resourceDensity);
        for (let i = 0; i < count; i++) {
            this.resources.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                value: 5 + Math.random() * 10,
                type: Math.random() < 0.5 ? 'plant' : 'prey'
            });
        }
    }
    
    update() {
        // Update agents
        this.updateAgents();
        
        // Process cultural learning
        this.processCulturalTransmission();
        
        // Process resource gathering
        this.processResourceGathering();
        
        // Process environmental interactions
        this.processEnvironmentalInteractions();
        
        // Update cultural centers
        this.updateCulturalCenters();
        
        // Process innovation
        this.processInnovation();
        
        // Update cultural knowledge
        this.updateCulturalKnowledge();
        
        // Life cycle
        this.processLifeCycle();
        
        // Update visual effects
        this.updateVisualEffects();
        
        // Record meme distribution
        this.recordMemeHistory();
    }
    
    updateAgents() {
        this.agents.forEach(agent => {
            // Movement based on meme type
            this.applyMemeBehavior(agent);
            
            // Update position
            agent.x += agent.vx;
            agent.y += agent.vy;
            
            // Wrap edges
            if (agent.x < 0) agent.x = this.canvas.width;
            if (agent.x > this.canvas.width) agent.x = 0;
            if (agent.y < 0) agent.y = this.canvas.height;
            if (agent.y > this.canvas.height) agent.y = 0;
            
            // Energy decay
            agent.energy -= 0.15;
            
            // Age
            agent.age++;
            
            // Update prestige decay
            agent.prestige *= 0.995;
            
            // Leave cultural trail
            if (Math.random() < 0.1 && agent.trailIntensity > 0.1) {
                this.culturalTrails.push({
                    x: agent.x,
                    y: agent.y,
                    meme: agent.meme,
                    intensity: agent.trailIntensity,
                    age: 0
                });
            }
            
            // Check environmental hazards
            this.dangerZones.forEach(danger => {
                const dx = agent.x - danger.x;
                const dy = agent.y - danger.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < danger.radius) {
                    agent.energy -= danger.severity;
                    
                    // Learn from danger
                    if (!danger.discovered) {
                        danger.discovered = true;
                        agent.experiences.push({
                            type: 'danger',
                            location: { x: danger.x, y: danger.y },
                            severity: danger.severity
                        });
                        agent.knownDangers.add(danger);
                    }
                }
            });
        });
    }
    
    applyMemeBehavior(agent) {
        switch (agent.meme.id) {
            case 'forager':
                // Random walk with slight bias toward resources
                agent.vx += (Math.random() - 0.5) * 0.3;
                agent.vy += (Math.random() - 0.5) * 0.3;
                
                // Weak attraction to nearest resource
                const nearestResource = this.findNearest(agent, this.resources);
                if (nearestResource) {
                    const dx = nearestResource.x - agent.x;
                    const dy = nearestResource.y - agent.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        agent.vx += dx / dist * 0.05;
                        agent.vy += dy / dist * 0.05;
                    }
                }
                break;
                
            case 'hunter':
                // Fast movement, aggressive resource seeking
                const prey = this.resources.filter(r => r.type === 'prey');
                const target = this.findNearest(agent, prey);
                if (target) {
                    const dx = target.x - agent.x;
                    const dy = target.y - agent.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    agent.vx += dx / dist * 0.2;
                    agent.vy += dy / dist * 0.2;
                } else {
                    agent.vx += (Math.random() - 0.5) * 0.5;
                    agent.vy += (Math.random() - 0.5) * 0.5;
                }
                break;
                
            case 'gatherer':
                // Slow movement, focus on plant resources
                const plants = this.resources.filter(r => r.type === 'plant');
                const plant = this.findNearest(agent, plants);
                if (plant) {
                    const dx = plant.x - agent.x;
                    const dy = plant.y - agent.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 80) {
                        agent.vx = dx / dist * 0.3;
                        agent.vy = dy / dist * 0.3;
                    }
                }
                break;
                
            case 'teacher':
                // Move toward other agents
                const students = this.findNearby(agent, this.agents, 100);
                if (students.length > 0) {
                    let centerX = 0, centerY = 0;
                    students.forEach(s => {
                        centerX += s.x;
                        centerY += s.y;
                    });
                    centerX /= students.length;
                    centerY /= students.length;
                    
                    const dx = centerX - agent.x;
                    const dy = centerY - agent.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 20) {
                        agent.vx = dx / dist * 0.5;
                        agent.vy = dy / dist * 0.5;
                    }
                }
                break;
                
            case 'innovator':
                // Erratic movement, exploration
                agent.vx = Math.cos(agent.age * 0.1) * 2;
                agent.vy = Math.sin(agent.age * 0.1) * 2;
                if (Math.random() < 0.05) {
                    agent.vx = (Math.random() - 0.5) * 4;
                    agent.vy = (Math.random() - 0.5) * 4;
                }
                break;
        }
        
        // Apply trait-based modifiers
        if (agent.meme.traits) {
            // Caution affects proximity to dangers
            if (agent.knownDangers && agent.knownDangers.forEach) {
                agent.knownDangers.forEach(danger => {
                const dx = agent.x - danger.x;
                const dy = agent.y - danger.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < danger.radius * 2) {
                    const avoidance = agent.meme.traits.caution;
                    agent.vx += (dx / dist) * avoidance * 0.5;
                    agent.vy += (dy / dist) * avoidance * 0.5;
                }
                });
            }
            
            // Curiosity affects exploration
            if (agent.meme.traits.curiosity > 0.7) {
                // Explore unknown areas
                agent.vx += (Math.random() - 0.5) * agent.meme.traits.curiosity * 0.2;
                agent.vy += (Math.random() - 0.5) * agent.meme.traits.curiosity * 0.2;
            }
            
            // Cooperation affects grouping
            if (agent.meme.traits.cooperation > 0.5) {
                const nearbyAllies = this.findNearby(agent, this.agents, 50)
                    .filter(other => other.meme.id === agent.meme.id);
                if (nearbyAllies.length > 0) {
                    let avgX = 0, avgY = 0;
                    nearbyAllies.forEach(ally => {
                        avgX += ally.x;
                        avgY += ally.y;
                    });
                    avgX /= nearbyAllies.length;
                    avgY /= nearbyAllies.length;
                    
                    const dx = avgX - agent.x;
                    const dy = avgY - agent.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 30) {
                        agent.vx += (dx / dist) * agent.meme.traits.cooperation * 0.1;
                        agent.vy += (dy / dist) * agent.meme.traits.cooperation * 0.1;
                    }
                }
            }
        }
        
        // Speed limit
        const speed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
        const maxSpeed = agent.meme.id === 'hunter' ? 3 : 2;
        if (speed > maxSpeed) {
            agent.vx = (agent.vx / speed) * maxSpeed;
            agent.vy = (agent.vy / speed) * maxSpeed;
        }
    }
    
    processCulturalTransmission() {
        this.agents.forEach(learner => {
            // Find nearby agents to learn from
            const teachers = this.findNearby(learner, this.agents, learner.observationRadius);
            
            if (teachers.length === 0) return;
            
            // Determine learning strategy
            let selectedTeacher = null;
            
            if (Math.random() < this.conformityBias && teachers.length >= 3) {
                // Conformity bias: adopt most common meme
                const memeCounts = {};
                teachers.forEach(t => {
                    memeCounts[t.meme.id] = (memeCounts[t.meme.id] || 0) + 1;
                });
                
                let mostCommon = null;
                let maxCount = 0;
                for (const [memeId, count] of Object.entries(memeCounts)) {
                    if (count > maxCount) {
                        maxCount = count;
                        mostCommon = memeId;
                    }
                }
                
                selectedTeacher = teachers.find(t => t.meme.id === mostCommon);
            } else if (Math.random() < this.prestigeBias) {
                // Prestige bias: learn from most successful
                selectedTeacher = teachers.reduce((best, current) => 
                    current.prestige > best.prestige ? current : best
                );
            } else {
                // Random learning
                selectedTeacher = teachers[Math.floor(Math.random() * teachers.length)];
            }
            
            // Learn new meme
            if (selectedTeacher && selectedTeacher.meme.id !== learner.meme.id) {
                // Visual learning event
                if (this.showLearning) {
                    this.learningEffects.push({
                        x1: learner.x,
                        y1: learner.y,
                        x2: selectedTeacher.x,
                        y2: selectedTeacher.y,
                        age: 0,
                        color: selectedTeacher.meme.color
                    });
                }
                
                // Adopt new meme
                learner.meme = selectedTeacher.meme;
                learner.memeHistory.push(selectedTeacher.meme);
                if (learner.memeHistory.length > this.memorySize) {
                    learner.memeHistory.shift();
                }
                
                // Update statistics
                learner.learningEvents++;
                selectedTeacher.teachingEvents++;
                selectedTeacher.prestige += 1;
                
                // Teacher bonus for teacher meme
                if (selectedTeacher.meme.id === 'teacher') {
                    selectedTeacher.energy += 5;
                    selectedTeacher.prestige += 2;
                }
                
                // Share experiences and knowledge
                if (selectedTeacher.experiences.length > 0) {
                    // Transfer some experiences
                    const sharedExp = selectedTeacher.experiences[
                        Math.floor(Math.random() * selectedTeacher.experiences.length)
                    ];
                    learner.experiences.push(sharedExp);
                    
                    // Share known dangers and resources
                    selectedTeacher.knownDangers.forEach(danger => {
                        learner.knownDangers.add(danger);
                    });
                    
                    // Create cultural bond
                    learner.culturalBonds.push({
                        partner: selectedTeacher,
                        strength: 0.5,
                        sharedExperiences: 1
                    });
                }
            }
        });
    }
    
    processResourceGathering() {
        this.agents.forEach(agent => {
            this.resources = this.resources.filter(resource => {
                const dx = agent.x - resource.x;
                const dy = agent.y - resource.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < agent.size + 5) {
                    // Gathering efficiency based on meme
                    let efficiency = agent.meme.efficiency;
                    
                    // Meme-specific bonuses
                    if (agent.meme.id === 'hunter' && resource.type === 'prey') {
                        efficiency *= 1.5;
                    } else if (agent.meme.id === 'gatherer' && resource.type === 'plant') {
                        efficiency *= 1.5;
                    } else if (agent.meme.id === 'forager') {
                        efficiency *= 1.2;
                    }
                    
                    agent.energy = Math.min(agent.energy + resource.value * efficiency, agent.maxEnergy);
                    agent.prestige += resource.value * 0.1;
                    
                    // Record successful resource location
                    agent.experiences.push({
                        type: 'resource',
                        location: { x: resource.x, y: resource.y },
                        value: resource.value
                    });
                    agent.knownResources.add({ x: resource.x, y: resource.y });
                    
                    // Create resource particle effect
                    this.culturalParticles.push({
                        x: resource.x,
                        y: resource.y,
                        vx: (Math.random() - 0.5) * 2,
                        vy: -Math.random() * 2,
                        color: resource.type === 'plant' ? 'rgba(100, 255, 100, 0.8)' : 'rgba(255, 150, 150, 0.8)',
                        size: 3,
                        life: 30
                    });
                    
                    return false;
                }
                return true;
            });
        });
        
        // Replenish resources
        if (Math.random() < 0.05) {
            this.resources.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                value: 5 + Math.random() * 10,
                type: Math.random() < 0.5 ? 'plant' : 'prey'
            });
        }
    }
    
    updateCulturalCenters() {
        this.culturalCenters.forEach(center => {
            // Find agents in center
            const agentsInCenter = this.agents.filter(agent => {
                const dx = agent.x - center.x;
                const dy = agent.y - center.y;
                return Math.sqrt(dx * dx + dy * dy) < center.radius;
            });
            
            // Determine dominant meme
            if (agentsInCenter.length > 0) {
                const memeCounts = {};
                agentsInCenter.forEach(agent => {
                    memeCounts[agent.meme.id] = (memeCounts[agent.meme.id] || 0) + 1;
                });
                
                let dominant = null;
                let maxCount = 0;
                for (const [memeId, count] of Object.entries(memeCounts)) {
                    if (count > maxCount) {
                        maxCount = count;
                        dominant = this.memeTypes.find(m => m.id === memeId);
                    }
                }
                
                center.dominantMeme = dominant;
                center.strength = maxCount / agentsInCenter.length;
                
                // Enhanced learning in cultural centers
                agentsInCenter.forEach(agent => {
                    agent.observationRadius = this.learningRadius * 1.5;
                });
            } else {
                center.dominantMeme = null;
                center.strength = 0;
            }
            
            // Slowly drift centers
            center.x += (Math.random() - 0.5) * 0.2;
            center.y += (Math.random() - 0.5) * 0.2;
            
            // Keep in bounds
            center.x = Math.max(center.radius, Math.min(this.canvas.width - center.radius, center.x));
            center.y = Math.max(center.radius, Math.min(this.canvas.height - center.radius, center.y));
        });
    }
    
    processInnovation() {
        this.agents.forEach(agent => {
            // Innovators have higher chance of creating new behaviors
            const innovationChance = agent.meme.id === 'innovator' ? 
                this.innovationRate * 10 : this.innovationRate;
            
            if (Math.random() < innovationChance * agent.innovativeness) {
                // Create a new meme variant
                const baseMeme = agent.meme;
                const variation = {
                    id: this.getUniqueMemeName(),
                    color: this.mutateColor(baseMeme.color),
                    efficiency: baseMeme.efficiency + (Math.random() - 0.5) * 0.3
                };
                
                // Add to meme types if successful
                if (variation.efficiency > 0.3) {
                    // Add traits and symbol to variation
                    variation.traits = baseMeme.traits ? {
                        caution: Math.max(0, Math.min(1, baseMeme.traits.caution + (Math.random() - 0.5) * 0.3)),
                        cooperation: Math.max(0, Math.min(1, baseMeme.traits.cooperation + (Math.random() - 0.5) * 0.3)),
                        curiosity: Math.max(0, Math.min(1, baseMeme.traits.curiosity + (Math.random() - 0.5) * 0.3))
                    } : {
                        caution: Math.random(),
                        cooperation: Math.random(),
                        curiosity: Math.random()
                    };
                    variation.symbol = ['🔮', '✨', '🎯', '🌟', '💫', '🔥', '❄️', '🌊'][Math.floor(Math.random() * 8)];
                    
                    this.memeTypes.push(variation);
                    agent.meme = variation;
                    agent.prestige += 10;
                    
                    // Limit meme types
                    if (this.memeTypes.length > 10) {
                        // Remove least popular meme
                        const memeCounts = {};
                        this.agents.forEach(a => {
                            memeCounts[a.meme.id] = (memeCounts[a.meme.id] || 0) + 1;
                        });
                        
                        let leastPopular = this.memeTypes[5];
                        let minCount = Infinity;
                        this.memeTypes.slice(5).forEach(meme => {
                            const count = memeCounts[meme.id] || 0;
                            if (count < minCount) {
                                minCount = count;
                                leastPopular = meme;
                            }
                        });
                        
                        this.memeTypes = this.memeTypes.filter(m => {
                            if (m === leastPopular) {
                                // Free up the name when removing a meme
                                this.usedNames.delete(m.id);
                                return false;
                            }
                            return true;
                        });
                    }
                }
            }
        });
    }
    
    processLifeCycle() {
        const toRemove = [];
        const toAdd = [];
        
        this.agents.forEach((agent, index) => {
            // Death
            if (agent.energy <= 0 || agent.age > 800) {
                toRemove.push(index);
            }
            
            // Reproduction
            if (agent.energy > agent.maxEnergy * 0.8 && this.agents.length < 200) {
                const offspring = {
                    x: agent.x + (Math.random() - 0.5) * 30,
                    y: agent.y + (Math.random() - 0.5) * 30,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    meme: agent.meme, // Cultural inheritance
                    memeHistory: [agent.meme],
                    energy: agent.maxEnergy * 0.4,
                    maxEnergy: agent.maxEnergy,
                    prestige: 0,
                    age: 0,
                    learningEvents: 0,
                    teachingEvents: 0,
                    observationRadius: this.learningRadius,
                    innovativeness: agent.innovativeness + (Math.random() - 0.5) * 0.1,
                    conformity: agent.conformity + (Math.random() - 0.5) * 0.1,
                    size: 8,
                    experiences: [],
                    knownDangers: new Set(),
                    knownResources: new Set(),
                    culturalBonds: [],
                    trailIntensity: 1.0
                };
                
                // Clamp traits
                offspring.innovativeness = Math.max(0, Math.min(1, offspring.innovativeness));
                offspring.conformity = Math.max(0, Math.min(1, offspring.conformity));
                
                agent.energy -= agent.maxEnergy * 0.5;
                toAdd.push(offspring);
            }
        });
        
        // Remove dead agents
        toRemove.sort((a, b) => b - a).forEach(index => {
            this.agents.splice(index, 1);
        });
        
        // Add offspring
        this.agents.push(...toAdd);
        
        // Respawn agents to maintain minimum population
        while (this.agents.length < this.agentCount) {
            // Create new agent with potentially innovative meme
            const isInnovator = Math.random() < 0.2;
            let meme;
            
            if (isInnovator && Math.random() < 0.5) {
                // Create entirely new meme variant
                const baseMeme = this.memeTypes[Math.floor(Math.random() * Math.min(5, this.memeTypes.length))];
                
                // Get a unique name from the pool
                let newName = this.getUniqueMemeName();
                
                meme = {
                    id: newName,
                    color: this.mutateColor(baseMeme.color),
                    efficiency: Math.max(0.3, Math.min(2.0, baseMeme.efficiency + (Math.random() - 0.5) * 0.5)),
                    traits: baseMeme.traits ? {
                        caution: Math.max(0, Math.min(1, baseMeme.traits.caution + (Math.random() - 0.5) * 0.3)),
                        cooperation: Math.max(0, Math.min(1, baseMeme.traits.cooperation + (Math.random() - 0.5) * 0.3)),
                        curiosity: Math.max(0, Math.min(1, baseMeme.traits.curiosity + (Math.random() - 0.5) * 0.3))
                    } : {
                        caution: Math.random(),
                        cooperation: Math.random(),
                        curiosity: Math.random()
                    },
                    symbol: ['🔮', '✨', '🎯', '🌟', '💫', '🔥', '❄️', '🌊', '🌀', '⚡', '🎨', '🎭'][Math.floor(Math.random() * 12)]
                };
                this.memeTypes.push(meme);
                
                // Clean up old memes if too many
                if (this.memeTypes.length > 15) {
                    const memeCounts = {};
                    this.agents.forEach(a => {
                        memeCounts[a.meme.id] = (memeCounts[a.meme.id] || 0) + 1;
                    });
                    
                    // Remove unpopular non-base memes
                    this.memeTypes = this.memeTypes.filter((m, idx) => {
                        if (idx < 5) return true; // Keep base memes
                        const keep = (memeCounts[m.id] || 0) > 0;
                        if (!keep) {
                            // Free up the name when removing a meme
                            this.usedNames.delete(m.id);
                        }
                        return keep;
                    });
                }
            } else {
                // Use existing meme
                meme = this.memeTypes[Math.floor(Math.random() * this.memeTypes.length)];
            }
            
            const newAgent = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                meme: meme,
                memeHistory: [meme],
                energy: 30 + Math.random() * 40,
                maxEnergy: 100,
                prestige: 0,
                age: 0,
                learningEvents: 0,
                teachingEvents: 0,
                observationRadius: this.learningRadius,
                innovativeness: Math.random(),
                conformity: Math.random(),
                size: 8,
                experiences: [],
                knownDangers: new Set(),
                knownResources: new Set(),
                culturalBonds: [],
                trailIntensity: 1.0
            };
            
            this.agents.push(newAgent);
        }
    }
    
    processEnvironmentalInteractions() {
        // Process interactions with abundant zones
        this.abundantZones.forEach(zone => {
            this.agents.forEach(agent => {
                const dx = agent.x - zone.x;
                const dy = agent.y - zone.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < zone.radius) {
                    // Bonus energy in abundant zones
                    agent.energy += zone.richness * 0.1;
                    
                    if (!zone.discovered) {
                        zone.discovered = true;
                        agent.experiences.push({
                            type: 'abundance',
                            location: { x: zone.x, y: zone.y },
                            richness: zone.richness
                        });
                    }
                }
            });
        });
        
        // Process landmark interactions
        this.landmarks.forEach(landmark => {
            this.agents.forEach(agent => {
                const dx = agent.x - landmark.x;
                const dy = agent.y - landmark.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 30 && Math.random() < 0.01) {
                    // Agents can create stories about landmarks
                    landmark.culturalSignificance += 0.1;
                    landmark.stories.push({
                        author: agent,
                        meme: agent.meme,
                        time: Date.now()
                    });
                }
            });
        });
    }
    
    updateCulturalKnowledge() {
        // Share discoveries among culturally bonded agents
        this.agents.forEach(agent => {
            agent.culturalBonds = agent.culturalBonds.filter(bond => {
                // Strengthen or weaken bonds
                const dx = agent.x - bond.partner.x;
                const dy = agent.y - bond.partner.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    bond.strength = Math.min(1, bond.strength + 0.01);
                    bond.sharedExperiences++;
                    return true;
                } else {
                    bond.strength -= 0.005;
                    return bond.strength > 0;
                }
            });
        });
        
        // Update cultural knowledge maps
        this.agents.forEach(agent => {
            if (agent.experiences.length > 5 && agent.prestige > 10) {
                // High-prestige agents contribute to cultural knowledge
                agent.experiences.forEach(exp => {
                    const key = `${exp.type}_${Math.floor(exp.location.x / 50)}_${Math.floor(exp.location.y / 50)}`;
                    if (!this.culturalKnowledge.has(key)) {
                        this.culturalKnowledge.set(key, {
                            type: exp.type,
                            location: exp.location,
                            discoverers: [agent],
                            strength: 1
                        });
                    } else {
                        const knowledge = this.culturalKnowledge.get(key);
                        knowledge.strength++;
                        knowledge.discoverers.push(agent);
                    }
                });
            }
        });
    }
    
    updateVisualEffects() {
        // Update cultural trails
        this.culturalTrails = this.culturalTrails.filter(trail => {
            trail.age++;
            trail.intensity *= 0.95;
            return trail.intensity > 0.01 && trail.age < 100;
        });
        
        // Update particles
        this.culturalParticles = this.culturalParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.life--;
            return particle.life > 0;
        });
        
        // Update learning effects
        this.learningEffects = this.learningEffects.filter(effect => {
            effect.age++;
            return effect.age < 30;
        });
    }
    
    recordMemeHistory() {
        const distribution = {};
        this.agents.forEach(agent => {
            distribution[agent.meme.id] = (distribution[agent.meme.id] || 0) + 1;
        });
        
        this.memeHistory.push({
            time: Date.now(),
            distribution: distribution,
            totalAgents: this.agents.length
        });
        
        // Keep only recent history
        if (this.memeHistory.length > 200) {
            this.memeHistory.shift();
        }
    }
    
    drawEnvironmentalFeatures() {
        // Draw danger zones
        this.dangerZones.forEach(danger => {
            const alpha = danger.discovered ? 0.3 : 0.1;
            const grd = this.ctx.createRadialGradient(
                danger.x, danger.y, 0,
                danger.x, danger.y, danger.radius
            );
            grd.addColorStop(0, `rgba(255, 50, 50, ${alpha * danger.severity})`);
            grd.addColorStop(0.7, `rgba(255, 100, 50, ${alpha * danger.severity * 0.5})`);
            grd.addColorStop(1, 'rgba(255, 50, 50, 0)');
            
            this.ctx.fillStyle = grd;
            this.ctx.beginPath();
            this.ctx.arc(danger.x, danger.y, danger.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (danger.discovered) {
                // Warning pattern
                this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([10, 5]);
                this.ctx.beginPath();
                this.ctx.arc(danger.x, danger.y, danger.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        });
        
        // Draw abundant zones
        this.abundantZones.forEach(zone => {
            const alpha = zone.discovered ? 0.3 : 0.15;
            const grd = this.ctx.createRadialGradient(
                zone.x, zone.y, 0,
                zone.x, zone.y, zone.radius
            );
            grd.addColorStop(0, `rgba(100, 255, 100, ${alpha * zone.richness})`);
            grd.addColorStop(0.7, `rgba(150, 255, 100, ${alpha * zone.richness * 0.5})`);
            grd.addColorStop(1, 'rgba(100, 255, 100, 0)');
            
            this.ctx.fillStyle = grd;
            this.ctx.beginPath();
            this.ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw landmarks
        this.landmarks.forEach(landmark => {
            const symbols = {
                'stone': '🗿',
                'tree': '🌳',
                'water': '💧',
                'hill': '⛰️',
                'cave': '🕳️'
            };
            
            // Cultural significance glow
            if (landmark.culturalSignificance > 0) {
                const glow = landmark.culturalSignificance / 10;
                this.ctx.fillStyle = `rgba(255, 215, 0, ${glow * 0.3})`;
                this.ctx.beginPath();
                this.ctx.arc(landmark.x, landmark.y, 20 + glow * 10, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Landmark symbol
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(symbols[landmark.type] || '📍', landmark.x, landmark.y);
            
            // Story count indicator
            if (landmark.stories.length > 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.font = '10px monospace';
                this.ctx.fillText(`${landmark.stories.length}`, landmark.x + 10, landmark.y - 10);
            }
        });
    }
    
    getUniqueMemeName() {
        // Try to get an unused name from the pool
        const availableNames = this.memeNamePool.filter(name => !this.usedNames.has(name));
        
        if (availableNames.length > 0) {
            // Pick a random available name
            const name = availableNames[Math.floor(Math.random() * availableNames.length)];
            this.usedNames.add(name);
            return name;
        } else {
            // If all names are used, create compound names
            const prefixes = ['neo', 'proto', 'meta', 'hyper', 'ultra', 'super', 'mega', 'giga'];
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const baseName = this.memeNamePool[Math.floor(Math.random() * this.memeNamePool.length)];
            const compoundName = `${prefix}-${baseName}`;
            
            // If even compound name exists, add a suffix
            if (this.usedNames.has(compoundName)) {
                const suffixes = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta'];
                const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
                const finalName = `${compoundName}-${suffix}`;
                this.usedNames.add(finalName);
                return finalName;
            }
            
            this.usedNames.add(compoundName);
            return compoundName;
        }
    }
    
    mutateColor(colorString) {
        // Parse rgba color
        const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (!match) return colorString;
        
        let [_, r, g, b, a] = match;
        r = parseInt(r) + Math.floor((Math.random() - 0.5) * 50);
        g = parseInt(g) + Math.floor((Math.random() - 0.5) * 50);
        b = parseInt(b) + Math.floor((Math.random() - 0.5) * 50);
        
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    
    findNearest(agent, list) {
        let nearest = null;
        let minDist = Infinity;
        
        list.forEach(item => {
            const dx = item.x - agent.x;
            const dy = item.y - agent.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = item;
            }
        });
        
        return nearest;
    }
    
    findNearby(agent, list, radius) {
        return list.filter(other => {
            if (other === agent) return false;
            const dx = other.x - agent.x;
            const dy = other.y - agent.y;
            return Math.sqrt(dx * dx + dy * dy) < radius;
        });
    }
    
    render() {
        // Clear with gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(25, 25, 30, 0.95)');
        gradient.addColorStop(1, 'rgba(10, 10, 15, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw environmental features first
        this.drawEnvironmentalFeatures();
        
        // Draw cultural trails
        this.culturalTrails.forEach(trail => {
            const alpha = trail.intensity * (1 - trail.age / 100);
            this.ctx.fillStyle = trail.meme.color.replace('0.8', alpha * 0.3);
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw cultural centers with enhanced visuals
        if (this.showCulturalCenters) {
            this.culturalCenters.forEach(center => {
                // Outer glow
                const grd = this.ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, center.radius);
                if (center.dominantMeme) {
                    const baseColor = center.dominantMeme.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                    if (baseColor) {
                        grd.addColorStop(0, `rgba(${baseColor[1]}, ${baseColor[2]}, ${baseColor[3]}, ${center.strength * 0.3})`);
                        grd.addColorStop(0.7, `rgba(${baseColor[1]}, ${baseColor[2]}, ${baseColor[3]}, ${center.strength * 0.1})`);
                        grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    }
                } else {
                    grd.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
                    grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
                }
                this.ctx.fillStyle = grd;
                this.ctx.beginPath();
                this.ctx.arc(center.x, center.y, center.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Border
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.arc(center.x, center.y, center.radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            });
        }
        
        // Draw resources with enhanced visuals
        this.resources.forEach(resource => {
            const size = resource.value / 2;
            
            // Glow effect
            const grd = this.ctx.createRadialGradient(resource.x, resource.y, 0, resource.x, resource.y, size * 2);
            if (resource.type === 'plant') {
                grd.addColorStop(0, 'rgba(100, 255, 100, 0.6)');
                grd.addColorStop(0.5, 'rgba(100, 255, 100, 0.3)');
                grd.addColorStop(1, 'rgba(100, 255, 100, 0)');
            } else {
                grd.addColorStop(0, 'rgba(255, 150, 150, 0.6)');
                grd.addColorStop(0.5, 'rgba(255, 150, 150, 0.3)');
                grd.addColorStop(1, 'rgba(255, 150, 150, 0)');
            }
            this.ctx.fillStyle = grd;
            this.ctx.beginPath();
            this.ctx.arc(resource.x, resource.y, size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Core
            this.ctx.fillStyle = resource.type === 'plant' ? 
                'rgba(150, 255, 150, 0.8)' : 'rgba(255, 200, 200, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(resource.x, resource.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw particles
        this.culturalParticles.forEach(particle => {
            const alpha = particle.life / 30;
            this.ctx.fillStyle = particle.color.replace('0.8', alpha);
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw learning effects with enhanced visuals
        if (this.showLearning) {
            this.learningEffects.forEach(effect => {
                const alpha = Math.max(0, 1 - effect.age / 30);
                
                // Create curved path for learning connection
                const midX = (effect.x1 + effect.x2) / 2;
                const midY = (effect.y1 + effect.y2) / 2;
                const curve = Math.sin(effect.age * 0.3) * 20;
                
                this.ctx.strokeStyle = effect.color.replace('0.8', alpha * 0.6);
                this.ctx.lineWidth = 3 * alpha;
                this.ctx.shadowBlur = 10 * alpha;
                this.ctx.shadowColor = effect.color;
                
                this.ctx.beginPath();
                this.ctx.moveTo(effect.x1, effect.y1);
                this.ctx.quadraticCurveTo(
                    midX + curve, midY - curve,
                    effect.x2, effect.y2
                );
                this.ctx.stroke();
                
                this.ctx.shadowBlur = 0;
            });
        }
        
        // Draw cultural bonds
        this.agents.forEach(agent => {
            if (agent.culturalBonds && agent.culturalBonds.forEach) {
                agent.culturalBonds.forEach(bond => {
                if (bond.strength > 0.3) {
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${bond.strength * 0.1})`;
                    this.ctx.lineWidth = bond.strength * 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(agent.x, agent.y);
                    this.ctx.lineTo(bond.partner.x, bond.partner.y);
                    this.ctx.stroke();
                }
                });
            }
        });
        
        // Draw agents with enhanced visuals
        this.agents.forEach(agent => {
            // Prestige aura
            if (agent.prestige > 5) {
                const glowSize = Math.min(agent.prestige / 2, 25);
                const grd = this.ctx.createRadialGradient(
                    agent.x, agent.y, agent.size,
                    agent.x, agent.y, agent.size + glowSize
                );
                grd.addColorStop(0, 'rgba(255, 255, 255, 0)');
                grd.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
                grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
                this.ctx.fillStyle = grd;
                this.ctx.beginPath();
                this.ctx.arc(agent.x, agent.y, agent.size + glowSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Knowledge indicator - agents with many experiences have outer ring
            if (agent.experiences.length > 10) {
                const knowledge = Math.min(agent.experiences.length / 20, 1);
                this.ctx.strokeStyle = `rgba(200, 200, 255, ${knowledge * 0.5})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(agent.x, agent.y, agent.size + 5, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            // Agent body with gradient
            const bodyGrd = this.ctx.createRadialGradient(
                agent.x - agent.size/3, agent.y - agent.size/3, 0,
                agent.x, agent.y, agent.size
            );
            const baseColor = agent.meme.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (baseColor) {
                bodyGrd.addColorStop(0, `rgba(${parseInt(baseColor[1])+50}, ${parseInt(baseColor[2])+50}, ${parseInt(baseColor[3])+50}, 0.9)`);
                bodyGrd.addColorStop(1, agent.meme.color);
            } else {
                bodyGrd.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                bodyGrd.addColorStop(1, agent.meme.color);
            }
            
            this.ctx.fillStyle = bodyGrd;
            this.ctx.beginPath();
            this.ctx.arc(agent.x, agent.y, agent.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Energy arc
            const energyRatio = agent.energy / agent.maxEnergy;
            if (energyRatio < 0.3) {
                // Low energy warning
                this.ctx.strokeStyle = `rgba(255, 100, 100, ${1 - energyRatio})`;
                this.ctx.lineWidth = 2;
            } else {
                this.ctx.strokeStyle = `rgba(100, 255, 100, ${energyRatio * 0.8})`;
                this.ctx.lineWidth = 1.5;
            }
            this.ctx.beginPath();
            this.ctx.arc(agent.x, agent.y, agent.size + 3, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * energyRatio));
            this.ctx.stroke();
            
            // Meme symbol (if defined)
            if (agent.meme.symbol) {
                this.ctx.font = `${agent.size}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.fillText(agent.meme.symbol, agent.x, agent.y);
            }
            
            // Innovation sparkle
            if (agent.innovativeness > 0.8) {
                const sparkle = Math.sin(Date.now() * 0.01 + agent.age) * 0.5 + 0.5;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkle})`;
                this.ctx.beginPath();
                this.ctx.arc(agent.x + agent.size/2, agent.y - agent.size/2, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Draw meme distribution
        if (this.showMemeDistribution) {
            this.drawMemeDistribution();
        }
        
        // Draw stats
        this.drawStats();
    }
    
    drawMemeDistribution() {
        const distribution = {};
        this.agents.forEach(agent => {
            distribution[agent.meme.id] = (distribution[agent.meme.id] || 0) + 1;
        });
        
        let y = 50;
        const x = this.canvas.width - 200;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x - 10, y - 20, 190, Object.keys(distribution).length * 25 + 30);
        
        this.ctx.font = '12px monospace';
        Object.entries(distribution).forEach(([memeId, count]) => {
            const meme = this.memeTypes.find(m => m.id === memeId);
            if (meme) {
                const percentage = ((count / this.agents.length) * 100).toFixed(1);
                
                // Bar
                this.ctx.fillStyle = meme.color;
                this.ctx.fillRect(x, y, percentage * 1.5, 15);
                
                // Text
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.fillText(`${memeId}: ${percentage}%`, x, y + 12);
                
                y += 20;
            }
        });
    }
    
    drawStats() {
        const avgPrestige = this.agents.reduce((sum, a) => sum + a.prestige, 0) / this.agents.length;
        const totalLearning = this.agents.reduce((sum, a) => sum + a.learningEvents, 0);
        
        const stats = {
            'Agents': this.agents.length,
            'Resources': this.resources.length,
            'Meme Types': this.memeTypes.length,
            'Avg Prestige': avgPrestige.toFixed(1),
            'Total Learning': totalLearning,
            'Innovations': this.innovationCount
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
        
        // Create a cultural center at click location
        this.culturalCenters.push({
            x: x,
            y: y,
            radius: 60 + Math.random() * 40,
            strength: 0.5,
            dominantMeme: null
        });
        
        // Limit cultural centers
        if (this.culturalCenters.length > 5) {
            this.culturalCenters.shift();
        }
    }
    
    getInfo() {
        return {
            name: 'Memetic Evolution',
            description: 'Cultural evolution through social learning, where behaviors spread through observation and imitation.',
            instructions: 'Click to create cultural centers. Watch as different behavioral memes spread through the population via social learning.'
        };
    }
    
    getParameterDefs() {
        return [
            {
                name: 'showLearning',
                label: 'Show Learning Events',
                type: 'checkbox',
                defaultValue: true
            },
            {
                name: 'showCulturalCenters',
                label: 'Show Cultural Centers',
                type: 'checkbox',
                defaultValue: true
            },
            {
                name: 'showMemeDistribution',
                label: 'Show Meme Distribution',
                type: 'checkbox',
                defaultValue: true
            },
            {
                name: 'conformityBias',
                label: 'Conformity Bias',
                type: 'range',
                min: 0,
                max: 1,
                step: 0.1,
                defaultValue: 0.7
            },
            {
                name: 'prestigeBias',
                label: 'Prestige Bias',
                type: 'range',
                min: 0,
                max: 1,
                step: 0.1,
                defaultValue: 0.8
            },
            {
                name: 'innovationRate',
                label: 'Innovation Rate',
                type: 'range',
                min: 0,
                max: 0.01,
                step: 0.001,
                defaultValue: 0.001
            }
        ];
    }
}