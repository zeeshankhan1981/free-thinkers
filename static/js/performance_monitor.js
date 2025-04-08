/**
 * Performance Monitor for Free Thinkers
 * Monitors resource usage and provides benchmarking tools
 */

class PerformanceMonitor {
    constructor() {
        this.isInitialized = false;
        this.containerElement = null;
        this.resourceUsage = {
            gpu: { used: 0, total: 0 },
            cpu: { percent: 0 },
            ram: { used: 0, total: 0 }
        };
        this.updateInterval = null;
        this.benchmarkResults = [];
    }
    
    /**
     * Initialize the Performance Monitor
     */
    async init() {
        try {
            this.containerElement = document.getElementById('metricsContent');
            if (!this.containerElement) {
                console.error('Metrics content container not found');
                return false;
            }
            
            this.createMonitorUI();
            this.initEventListeners();
            
            // Start resource monitoring
            this.startResourceMonitoring();
            
            this.isInitialized = true;
            console.log('Performance monitor initialized');
            return true;
        } catch (error) {
            console.error(`Error initializing performance monitor: ${error}`);
            return false;
        }
    }
    
    /**
     * Create the Performance Monitor UI
     */
    createMonitorUI() {
        if (!this.containerElement) return;
        
        // Clear the container
        this.containerElement.innerHTML = '';
        
        // Create the main layout
        const mainLayout = document.createElement('div');
        mainLayout.className = 'row';
        
        // Resource usage column
        const resourceColumn = document.createElement('div');
        resourceColumn.className = 'col-md-4';
        resourceColumn.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-microchip"></i> Resource Utilization
                </div>
                <div class="card-body">
                    <div class="resource-metric mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <span>GPU Memory</span>
                            <span id="gpuMemoryText">0/0 MB</span>
                        </div>
                        <div class="progress" style="height: 15px;">
                            <div id="gpuMemoryMeter" class="progress-bar bg-info" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                        </div>
                    </div>
                    <div class="resource-metric mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <span>CPU Usage</span>
                            <span id="cpuUsageText">0%</span>
                        </div>
                        <div class="progress" style="height: 15px;">
                            <div id="cpuUsageMeter" class="progress-bar bg-success" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                        </div>
                    </div>
                    <div class="resource-metric mb-3">
                        <div class="d-flex justify-content-between mb-1">
                            <span>RAM Usage</span>
                            <span id="ramUsageText">0/0 MB</span>
                        </div>
                        <div class="progress" style="height: 15px;">
                            <div id="ramUsageMeter" class="progress-bar bg-warning" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between mt-4">
                        <button id="refreshResourcesBtn" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="autoUpdateResources" checked>
                            <label class="form-check-label" for="autoUpdateResources">Auto Update</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Benchmark column
        const benchmarkColumn = document.createElement('div');
        benchmarkColumn.className = 'col-md-8';
        benchmarkColumn.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-chart-line"></i> Performance Benchmark
                </div>
                <div class="card-body">
                    <div class="benchmark-controls mb-3">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="benchmarkModel" class="form-label">Model</label>
                                    <select id="benchmarkModel" class="form-select">
                                        <!-- Will be populated with available models -->
                                    </select>
                                </div>
                                <div class="form-group mb-3">
                                    <label for="benchmarkProfile" class="form-label">Parameter Profile</label>
                                    <select id="benchmarkProfile" class="form-select">
                                        <!-- Will be populated with available profiles -->
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="benchmarkType" class="form-label">Benchmark Type</label>
                                    <select id="benchmarkType" class="form-select">
                                        <option value="token_generation">Token Generation Speed</option>
                                        <option value="memory_usage">Memory Usage</option>
                                        <option value="inference_time">Inference Time</option>
                                        <option value="comprehensive">Comprehensive</option>
                                    </select>
                                </div>
                                <div class="form-group mb-3">
                                    <label for="benchmarkIterations" class="form-label">Iterations</label>
                                    <input type="number" id="benchmarkIterations" class="form-control" value="3" min="1" max="10">
                                </div>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end mt-3">
                            <button id="runBenchmarkBtn" class="btn btn-primary">
                                <i class="fas fa-play"></i> Run Benchmark
                            </button>
                        </div>
                    </div>
                    <div id="benchmarkResults" class="benchmark-results">
                        <div class="benchmark-placeholder text-center text-muted py-4">
                            <i class="fas fa-chart-line fa-2x mb-2"></i>
                            <p>Run a benchmark to see performance results</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Append columns to main layout
        mainLayout.appendChild(resourceColumn);
        mainLayout.appendChild(benchmarkColumn);
        
        // Append layout to container
        this.containerElement.appendChild(mainLayout);
        
        // Populate models in benchmark selector
        this.populateBenchmarkSelectors();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Refresh resources button
        const refreshBtn = document.getElementById('refreshResourcesBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshResourceUsage();
            });
        }
        
        // Auto-update toggle
        const autoUpdateToggle = document.getElementById('autoUpdateResources');
        if (autoUpdateToggle) {
            autoUpdateToggle.addEventListener('change', (event) => {
                if (event.target.checked) {
                    this.startResourceMonitoring();
                } else {
                    this.stopResourceMonitoring();
                }
            });
        }
        
        // Run benchmark button
        const runBenchmarkBtn = document.getElementById('runBenchmarkBtn');
        if (runBenchmarkBtn) {
            runBenchmarkBtn.addEventListener('click', () => {
                this.runBenchmark();
            });
        }
    }
    
    /**
     * Populate benchmark selectors with available models and profiles
     */
    async populateBenchmarkSelectors() {
        const modelSelector = document.getElementById('benchmarkModel');
        const profileSelector = document.getElementById('benchmarkProfile');
        
        if (!modelSelector || !profileSelector) return;
        
        // Clear existing options
        modelSelector.innerHTML = '<option value="">Select a model...</option>';
        profileSelector.innerHTML = '<option value="">Default parameters</option>';
        
        try {
            // Fetch models
            const modelResponse = await fetch('/api/tags');
            if (modelResponse.ok) {
                const modelData = await modelResponse.json();
                const models = modelData.models || [];
                
                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.name;
                    option.textContent = model.name;
                    modelSelector.appendChild(option);
                });
            }
            
            // Fetch profiles
            const profileResponse = await fetch('/api/profiles');
            if (profileResponse.ok) {
                const profiles = await profileResponse.json();
                
                // Add general profiles
                if (profiles.general && profiles.general.length > 0) {
                    const generalGroup = document.createElement('optgroup');
                    generalGroup.label = 'General Profiles';
                    
                    profiles.general.forEach(profile => {
                        const option = document.createElement('option');
                        option.value = `general:${profile.name}`;
                        option.textContent = profile.name;
                        generalGroup.appendChild(option);
                    });
                    
                    profileSelector.appendChild(generalGroup);
                }
                
                // Add task-specific profiles
                if (profiles.task_specific && profiles.task_specific.length > 0) {
                    const taskGroup = document.createElement('optgroup');
                    taskGroup.label = 'Task-Specific Profiles';
                    
                    profiles.task_specific.forEach(profile => {
                        const option = document.createElement('option');
                        option.value = `task:${profile.name}`;
                        option.textContent = profile.name;
                        taskGroup.appendChild(option);
                    });
                    
                    profileSelector.appendChild(taskGroup);
                }
                
                // Add custom profiles
                if (profiles.custom && profiles.custom.length > 0) {
                    const customGroup = document.createElement('optgroup');
                    customGroup.label = 'Custom Profiles';
                    
                    profiles.custom.forEach(profile => {
                        const option = document.createElement('option');
                        option.value = `custom:${profile.name}`;
                        option.textContent = profile.name;
                        customGroup.appendChild(option);
                    });
                    
                    profileSelector.appendChild(customGroup);
                }
            }
        } catch (error) {
            console.error(`Error populating benchmark selectors: ${error}`);
        }
    }
    
    /**
     * Start resource monitoring with periodic updates
     */
    startResourceMonitoring() {
        // Stop any existing interval
        this.stopResourceMonitoring();
        
        // Start with an immediate refresh
        this.refreshResourceUsage();
        
        // Set up interval for periodic updates (every 5 seconds)
        this.updateInterval = setInterval(() => {
            this.refreshResourceUsage();
        }, 5000);
    }
    
    /**
     * Stop resource monitoring
     */
    stopResourceMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    /**
     * Refresh resource usage data
     */
    async refreshResourceUsage() {
        try {
            const response = await fetch('/api/system/resources');
            if (response.ok) {
                const data = await response.json();
                
                this.resourceUsage = {
                    gpu: {
                        used: data.gpu_memory_used || 0,
                        total: data.gpu_memory_total || 0
                    },
                    cpu: {
                        percent: data.cpu_percent || 0
                    },
                    ram: {
                        used: data.ram_used || 0,
                        total: data.ram_total || 0
                    }
                };
                
                this.updateResourceDisplay();
            } else {
                console.error(`Error fetching resource usage: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error refreshing resource usage: ${error}`);
        }
    }
    
    /**
     * Update resource display with current usage data
     */
    updateResourceDisplay() {
        // GPU Memory
        const gpuText = document.getElementById('gpuMemoryText');
        const gpuMeter = document.getElementById('gpuMemoryMeter');
        
        if (gpuText && gpuMeter) {
            const gpuUsed = Math.round(this.resourceUsage.gpu.used);
            const gpuTotal = Math.round(this.resourceUsage.gpu.total);
            const gpuPercent = gpuTotal > 0 ? Math.round((gpuUsed / gpuTotal) * 100) : 0;
            
            gpuText.textContent = `${gpuUsed}/${gpuTotal} MB`;
            gpuMeter.style.width = `${gpuPercent}%`;
            gpuMeter.textContent = `${gpuPercent}%`;
            gpuMeter.setAttribute('aria-valuenow', gpuPercent);
        }
        
        // CPU Usage
        const cpuText = document.getElementById('cpuUsageText');
        const cpuMeter = document.getElementById('cpuUsageMeter');
        
        if (cpuText && cpuMeter) {
            const cpuPercent = Math.round(this.resourceUsage.cpu.percent);
            
            cpuText.textContent = `${cpuPercent}%`;
            cpuMeter.style.width = `${cpuPercent}%`;
            cpuMeter.textContent = `${cpuPercent}%`;
            cpuMeter.setAttribute('aria-valuenow', cpuPercent);
        }
        
        // RAM Usage
        const ramText = document.getElementById('ramUsageText');
        const ramMeter = document.getElementById('ramUsageMeter');
        
        if (ramText && ramMeter) {
            const ramUsed = Math.round(this.resourceUsage.ram.used);
            const ramTotal = Math.round(this.resourceUsage.ram.total);
            const ramPercent = ramTotal > 0 ? Math.round((ramUsed / ramTotal) * 100) : 0;
            
            ramText.textContent = `${ramUsed}/${ramTotal} MB`;
            ramMeter.style.width = `${ramPercent}%`;
            ramMeter.textContent = `${ramPercent}%`;
            ramMeter.setAttribute('aria-valuenow', ramPercent);
        }
    }
    
    /**
     * Run a benchmark with the selected settings
     */
    async runBenchmark() {
        const modelSelector = document.getElementById('benchmarkModel');
        const profileSelector = document.getElementById('benchmarkProfile');
        const typeSelector = document.getElementById('benchmarkType');
        const iterationsInput = document.getElementById('benchmarkIterations');
        const resultsContainer = document.getElementById('benchmarkResults');
        
        if (!modelSelector || !profileSelector || !typeSelector || !iterationsInput || !resultsContainer) return;
        
        const model = modelSelector.value;
        const profile = profileSelector.value;
        const benchmarkType = typeSelector.value;
        const iterations = parseInt(iterationsInput.value) || 3;
        
        if (!model) {
            alert('Please select a model to benchmark');
            return;
        }
        
        // Show loading state
        resultsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Running benchmark, please wait...</p>
            </div>
        `;
        
        try {
            const response = await fetch('/api/benchmark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    profile: profile,
                    type: benchmarkType,
                    iterations: iterations
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.benchmarkResults.push(result);
                this.displayBenchmarkResults(result);
            } else {
                console.error(`Error running benchmark: ${response.statusText}`);
                resultsContainer.innerHTML = `
                    <div class="alert alert-danger">
                        Error running benchmark: ${response.statusText}
                    </div>
                `;
            }
        } catch (error) {
            console.error(`Error running benchmark: ${error}`);
            resultsContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error running benchmark: ${error}
                </div>
            `;
        }
    }
    
    /**
     * Display benchmark results
     */
    displayBenchmarkResults(result) {
        const resultsContainer = document.getElementById('benchmarkResults');
        if (!resultsContainer || !result) return;
        
        let resultsHtml = `
            <div class="benchmark-result">
                <h6 class="mb-3">
                    Benchmark Results: ${result.model} 
                    ${result.profile ? `with ${result.profile}` : ''}
                </h6>
                
                <div class="benchmark-metrics mb-4">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-body p-3">
                                    <h6 class="card-title">Token Generation</h6>
                                    <p class="display-6 text-primary mb-1">${result.tokens_per_second.toFixed(2)}</p>
                                    <p class="text-muted small">tokens/second</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-body p-3">
                                    <h6 class="card-title">Inference Time</h6>
                                    <p class="display-6 text-primary mb-1">${result.avg_inference_time.toFixed(2)}</p>
                                    <p class="text-muted small">seconds</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-body p-3">
                                    <h6 class="card-title">Memory Usage</h6>
                                    <p class="display-6 text-primary mb-1">${result.peak_memory_mb}</p>
                                    <p class="text-muted small">MB</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-body p-3">
                                    <h6 class="card-title">Overall Score</h6>
                                    <p class="display-6 text-primary mb-1">${result.score.toFixed(2)}</p>
                                    <p class="text-muted small">higher is better</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="benchmark-details small">
                    <p class="mb-1"><strong>Details:</strong></p>
                    <ul class="mb-3">
                        <li>Test prompt length: ${result.prompt_length} tokens</li>
                        <li>Response length: ${result.response_length} tokens</li>
                        <li>Total tokens: ${result.total_tokens} tokens</li>
                        <li>Number of iterations: ${result.iterations}</li>
                        <li>Test completed: ${new Date(result.timestamp).toLocaleString()}</li>
                    </ul>
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = resultsHtml;
    }
    
    /**
     * Update metrics with new data
     */
    updateMetrics(metrics) {
        if (!metrics) return;
        
        if (metrics.resources) {
            this.resourceUsage = {
                gpu: {
                    used: metrics.resources.gpu_memory_used || 0,
                    total: metrics.resources.gpu_memory_total || 0
                },
                cpu: {
                    percent: metrics.resources.cpu_percent || 0
                },
                ram: {
                    used: metrics.resources.ram_used || 0,
                    total: metrics.resources.ram_total || 0
                }
            };
            
            this.updateResourceDisplay();
        }
    }
    
    /**
     * Refresh the Performance Monitor
     */
    async refresh() {
        this.refreshResourceUsage();
        await this.populateBenchmarkSelectors();
    }
}

// Export class for use by the unified dashboard
window.PerformanceMonitor = PerformanceMonitor;
