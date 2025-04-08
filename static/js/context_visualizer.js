/**
 * Context Visualizer for Free Thinkers
 * Provides visualization of token usage in the context window
 */

class ContextVisualizer {
    constructor() {
        this.isInitialized = false;
        this.containerElement = null;
        this.maxContextLength = 2048;
        this.contextUsage = {
            total: 0,
            system: 0,
            history: 0,
            current: 0
        };
        this.enableSummarization = true;
        this.enablePruning = true;
    }
    
    /**
     * Initialize the Context Visualizer
     */
    async init() {
        try {
            this.containerElement = document.getElementById('contextContent');
            if (!this.containerElement) {
                console.error('Context content container not found');
                return false;
            }
            
            await this.loadContextSettings();
            this.createContextUI();
            this.initEventListeners();
            this.updateVisualizers();
            
            this.isInitialized = true;
            console.log('Context visualizer initialized');
            return true;
        } catch (error) {
            console.error(`Error initializing context visualizer: ${error}`);
            return false;
        }
    }
    
    /**
     * Load context settings from storage or API
     */
    async loadContextSettings() {
        try {
            // Try to load from localStorage first
            const storedSettings = localStorage.getItem('contextSettings');
            if (storedSettings) {
                const settings = JSON.parse(storedSettings);
                this.maxContextLength = settings.maxContextLength || 2048;
                this.enableSummarization = settings.enableSummarization !== undefined ? settings.enableSummarization : true;
                this.enablePruning = settings.enablePruning !== undefined ? settings.enablePruning : true;
            }
            
            // Try to get more accurate information from the server if available
            const response = await fetch('/api/context/settings');
            if (response.ok) {
                const serverSettings = await response.json();
                this.maxContextLength = serverSettings.maxContextLength || this.maxContextLength;
                this.enableSummarization = serverSettings.enableSummarization !== undefined 
                    ? serverSettings.enableSummarization 
                    : this.enableSummarization;
                this.enablePruning = serverSettings.enablePruning !== undefined 
                    ? serverSettings.enablePruning 
                    : this.enablePruning;
                
                // Save to localStorage for future use
                this.saveContextSettings();
            }
            
            return {
                maxContextLength: this.maxContextLength,
                enableSummarization: this.enableSummarization,
                enablePruning: this.enablePruning
            };
        } catch (error) {
            console.error(`Error loading context settings: ${error}`);
            return {
                maxContextLength: this.maxContextLength,
                enableSummarization: this.enableSummarization,
                enablePruning: this.enablePruning
            };
        }
    }
    
    /**
     * Save context settings to localStorage
     */
    saveContextSettings() {
        const settings = {
            maxContextLength: this.maxContextLength,
            enableSummarization: this.enableSummarization,
            enablePruning: this.enablePruning
        };
        
        localStorage.setItem('contextSettings', JSON.stringify(settings));
    }
    
    /**
     * Create the Context Visualizer UI
     */
    createContextUI() {
        if (!this.containerElement) return;
        
        // Clear the container
        this.containerElement.innerHTML = '';
        
        // Create the main layout
        const mainLayout = document.createElement('div');
        mainLayout.className = 'row';
        
        // Context settings column
        const settingsColumn = document.createElement('div');
        settingsColumn.className = 'col-md-4';
        settingsColumn.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-cog"></i> Context Settings
                </div>
                <div class="card-body">
                    <div class="form-group mb-3">
                        <label for="maxContextLength" class="form-label">Max Context Length</label>
                        <div class="input-group">
                            <input type="number" class="form-control" id="maxContextLength" value="${this.maxContextLength}" min="512" max="8192" step="512">
                            <span class="input-group-text">tokens</span>
                        </div>
                        <div class="form-text">Maximum tokens to include in the context window</div>
                    </div>
                    <div class="form-group mb-3">
                        <label class="form-label">Context Management</label>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="enableSummarization" ${this.enableSummarization ? 'checked' : ''}>
                            <label class="form-check-label" for="enableSummarization">Enable Summarization</label>
                            <div class="form-text">Automatically summarize older messages when context is full</div>
                        </div>
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="enablePruning" ${this.enablePruning ? 'checked' : ''}>
                            <label class="form-check-label" for="enablePruning">Enable Pruning</label>
                            <div class="form-text">Remove redundant or less relevant content when context is full</div>
                        </div>
                    </div>
                    <button id="optimizeContextBtn" class="btn btn-primary">
                        <i class="fas fa-compress-alt"></i> Optimize Now
                    </button>
                </div>
            </div>
        `;
        
        // Context visualization column
        const visualizerColumn = document.createElement('div');
        visualizerColumn.className = 'col-md-8';
        visualizerColumn.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-chart-bar"></i> Context Usage
                </div>
                <div class="card-body">
                    <div id="contextVisualization" class="context-visualization">
                        <div class="context-meter-container mb-3">
                            <div class="context-meter-label d-flex justify-content-between mb-1">
                                <span>Context Window Usage</span>
                                <span id="contextUsageText">0/${this.maxContextLength} tokens (0%)</span>
                            </div>
                            <div class="progress" style="height: 20px;">
                                <div id="contextUsageMeter" class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                            </div>
                        </div>
                        <div class="context-breakdown">
                            <h6>Token Allocation</h6>
                            <div class="context-breakdown-item d-flex justify-content-between mb-1">
                                <span>System Instructions</span>
                                <span id="systemTokenCount">0 tokens</span>
                            </div>
                            <div class="progress mb-2" style="height: 10px;">
                                <div id="systemTokenMeter" class="progress-bar bg-info" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            
                            <div class="context-breakdown-item d-flex justify-content-between mb-1">
                                <span>Conversation History</span>
                                <span id="historyTokenCount">0 tokens</span>
                            </div>
                            <div class="progress mb-2" style="height: 10px;">
                                <div id="historyTokenMeter" class="progress-bar bg-success" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            
                            <div class="context-breakdown-item d-flex justify-content-between mb-1">
                                <span>Current Message</span>
                                <span id="currentTokenCount">0 tokens</span>
                            </div>
                            <div class="progress mb-3" style="height: 10px;">
                                <div id="currentTokenMeter" class="progress-bar bg-warning" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-list"></i> Context Details</span>
                    <button id="toggleContextDetailsBtn" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="card-body">
                    <div id="contextDetails" class="context-details" style="display: none;">
                        <div class="context-section mb-3">
                            <h6 class="text-info">System Instructions</h6>
                            <div id="systemContext" class="context-content small">
                                <div class="text-muted fst-italic">No system instructions in current context</div>
                            </div>
                        </div>
                        <div class="context-section mb-3">
                            <h6 class="text-success">Conversation History</h6>
                            <div id="historyContext" class="context-content small">
                                <div class="text-muted fst-italic">No conversation history in current context</div>
                            </div>
                        </div>
                        <div class="context-section">
                            <h6 class="text-warning">Current Message</h6>
                            <div id="currentContext" class="context-content small">
                                <div class="text-muted fst-italic">No current message in context</div>
                            </div>
                        </div>
                    </div>
                    <div id="contextDetailsPlaceholder" class="text-center text-muted py-2">
                        <p>Click to view detailed context breakdown</p>
                    </div>
                </div>
            </div>
        `;
        
        // Append columns to main layout
        mainLayout.appendChild(settingsColumn);
        mainLayout.appendChild(visualizerColumn);
        
        // Append layout to container
        this.containerElement.appendChild(mainLayout);
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Max context length input
        const maxContextInput = document.getElementById('maxContextLength');
        if (maxContextInput) {
            maxContextInput.addEventListener('change', (event) => {
                this.maxContextLength = parseInt(event.target.value) || 2048;
                this.saveContextSettings();
                this.updateVisualizers();
            });
        }
        
        // Summarization toggle
        const summToggle = document.getElementById('enableSummarization');
        if (summToggle) {
            summToggle.addEventListener('change', (event) => {
                this.enableSummarization = event.target.checked;
                this.saveContextSettings();
                this.applyContextManagementSettings();
            });
        }
        
        // Pruning toggle
        const pruneToggle = document.getElementById('enablePruning');
        if (pruneToggle) {
            pruneToggle.addEventListener('change', (event) => {
                this.enablePruning = event.target.checked;
                this.saveContextSettings();
                this.applyContextManagementSettings();
            });
        }
        
        // Optimize button
        const optimizeBtn = document.getElementById('optimizeContextBtn');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.optimizeContext();
            });
        }
        
        // Toggle context details button
        const toggleDetailsBtn = document.getElementById('toggleContextDetailsBtn');
        const contextDetails = document.getElementById('contextDetails');
        const contextDetailsPlaceholder = document.getElementById('contextDetailsPlaceholder');
        
        if (toggleDetailsBtn && contextDetails && contextDetailsPlaceholder) {
            toggleDetailsBtn.addEventListener('click', () => {
                const isVisible = contextDetails.style.display !== 'none';
                
                if (isVisible) {
                    contextDetails.style.display = 'none';
                    contextDetailsPlaceholder.style.display = 'block';
                    toggleDetailsBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                } else {
                    contextDetails.style.display = 'block';
                    contextDetailsPlaceholder.style.display = 'none';
                    toggleDetailsBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                    this.updateContextDetails();
                }
            });
        }
    }
    
    /**
     * Apply context management settings to API
     */
    async applyContextManagementSettings() {
        try {
            const response = await fetch('/api/context/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    maxContextLength: this.maxContextLength,
                    enableSummarization: this.enableSummarization,
                    enablePruning: this.enablePruning
                })
            });
            
            if (response.ok) {
                console.log('Context management settings applied successfully');
                return true;
            } else {
                console.error(`Error applying context settings: ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.error(`Error applying context settings: ${error}`);
            return false;
        }
    }
    
    /**
     * Optimize context now by triggering summarization and pruning
     */
    async optimizeContext() {
        try {
            const response = await fetch('/api/context/optimize', {
                method: 'POST'
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Context optimized successfully');
                
                // Update visualizations with the new data
                this.updateUsage({
                    total: result.tokenCounts.total || 0,
                    system: result.tokenCounts.system || 0,
                    history: result.tokenCounts.history || 0,
                    current: result.tokenCounts.current || 0
                });
                
                return true;
            } else {
                console.error(`Error optimizing context: ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.error(`Error optimizing context: ${error}`);
            return false;
        }
    }
    
    /**
     * Update context window settings for the selected model
     */
    updateContextWindow(model) {
        // Set appropriate context length based on model
        // This could be fetched from the server or estimated based on model name
        if (model && typeof model === 'string') {
            let newContextLength = this.maxContextLength;
            
            if (model.includes('llama3')) {
                newContextLength = 4096;
            } else if (model.includes('gpt-4') || model.includes('claude')) {
                newContextLength = 8192;
            } else if (model.includes('gemma')) {
                newContextLength = 2048;
            } else if (model.includes('phi3')) {
                newContextLength = 1024;
            }
            
            if (newContextLength !== this.maxContextLength) {
                this.maxContextLength = newContextLength;
                
                // Update UI
                const maxContextInput = document.getElementById('maxContextLength');
                if (maxContextInput) {
                    maxContextInput.value = this.maxContextLength;
                }
                
                this.saveContextSettings();
                this.updateVisualizers();
            }
        }
    }
    
    /**
     * Update usage visualizations based on token counts
     */
    updateUsage(usageData) {
        if (!usageData) return;
        
        this.contextUsage = {
            total: usageData.total || 0,
            system: usageData.system || 0,
            history: usageData.history || 0,
            current: usageData.current || 0
        };
        
        this.updateVisualizers();
    }
    
    /**
     * Update all visualizers with current data
     */
    updateVisualizers() {
        // Calculate percentages
        const totalPercent = Math.min(100, (this.contextUsage.total / this.maxContextLength) * 100);
        const systemPercent = (this.contextUsage.system / this.maxContextLength) * 100;
        const historyPercent = (this.contextUsage.history / this.maxContextLength) * 100;
        const currentPercent = (this.contextUsage.current / this.maxContextLength) * 100;
        
        // Update total usage meter
        const usageMeter = document.getElementById('contextUsageMeter');
        const usageText = document.getElementById('contextUsageText');
        
        if (usageMeter) {
            usageMeter.style.width = `${totalPercent}%`;
            usageMeter.textContent = `${Math.round(totalPercent)}%`;
            usageMeter.setAttribute('aria-valuenow', Math.round(totalPercent));
            
            // Change color based on usage level
            if (totalPercent > 90) {
                usageMeter.classList.remove('bg-info', 'bg-warning');
                usageMeter.classList.add('bg-danger');
            } else if (totalPercent > 70) {
                usageMeter.classList.remove('bg-info', 'bg-danger');
                usageMeter.classList.add('bg-warning');
            } else {
                usageMeter.classList.remove('bg-warning', 'bg-danger');
                usageMeter.classList.add('bg-info');
            }
        }
        
        if (usageText) {
            usageText.textContent = `${this.contextUsage.total.toLocaleString()}/${this.maxContextLength.toLocaleString()} tokens (${Math.round(totalPercent)}%)`;
        }
        
        // Update breakdown meters
        const systemMeter = document.getElementById('systemTokenMeter');
        const historyMeter = document.getElementById('historyTokenMeter');
        const currentMeter = document.getElementById('currentTokenMeter');
        
        const systemText = document.getElementById('systemTokenCount');
        const historyText = document.getElementById('historyTokenCount');
        const currentText = document.getElementById('currentTokenCount');
        
        if (systemMeter && systemText) {
            systemMeter.style.width = `${systemPercent}%`;
            systemMeter.setAttribute('aria-valuenow', Math.round(systemPercent));
            systemText.textContent = `${this.contextUsage.system.toLocaleString()} tokens`;
        }
        
        if (historyMeter && historyText) {
            historyMeter.style.width = `${historyPercent}%`;
            historyMeter.setAttribute('aria-valuenow', Math.round(historyPercent));
            historyText.textContent = `${this.contextUsage.history.toLocaleString()} tokens`;
        }
        
        if (currentMeter && currentText) {
            currentMeter.style.width = `${currentPercent}%`;
            currentMeter.setAttribute('aria-valuenow', Math.round(currentPercent));
            currentText.textContent = `${this.contextUsage.current.toLocaleString()} tokens`;
        }
    }
    
    /**
     * Update context details breakdown
     */
    async updateContextDetails() {
        try {
            const systemContext = document.getElementById('systemContext');
            const historyContext = document.getElementById('historyContext');
            const currentContext = document.getElementById('currentContext');
            
            if (!systemContext || !historyContext || !currentContext) return;
            
            // Get context details from the API
            const response = await fetch('/api/context/details');
            if (response.ok) {
                const details = await response.json();
                
                // Update system context
                if (details.system && details.system.length > 0) {
                    systemContext.innerHTML = `<pre class="context-content-pre">${this.escapeHtml(details.system)}</pre>`;
                } else {
                    systemContext.innerHTML = `<div class="text-muted fst-italic">No system instructions in current context</div>`;
                }
                
                // Update history context
                if (details.history && details.history.length > 0) {
                    let historyHtml = '';
                    details.history.forEach((msg, index) => {
                        const role = msg.role || 'unknown';
                        const content = msg.content || '';
                        
                        historyHtml += `
                            <div class="context-message mb-2">
                                <div class="context-message-header">
                                    <span class="badge ${role === 'user' ? 'bg-primary' : 'bg-secondary'}">${role}</span>
                                    <span class="text-muted small ms-2">Message ${index + 1}</span>
                                </div>
                                <div class="context-message-content small">
                                    ${this.escapeHtml(content).substring(0, 200)}${content.length > 200 ? '...' : ''}
                                </div>
                            </div>
                        `;
                    });
                    historyContext.innerHTML = historyHtml;
                } else {
                    historyContext.innerHTML = `<div class="text-muted fst-italic">No conversation history in current context</div>`;
                }
                
                // Update current message context
                if (details.current) {
                    currentContext.innerHTML = `<pre class="context-content-pre">${this.escapeHtml(details.current)}</pre>`;
                } else {
                    currentContext.innerHTML = `<div class="text-muted fst-italic">No current message in context</div>`;
                }
            } else {
                console.error(`Error fetching context details: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error updating context details: ${error}`);
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    /**
     * Refresh the Context Visualizer
     */
    async refresh() {
        await this.loadContextSettings();
        this.updateVisualizers();
        
        // Check if details are visible, and if so, update them
        const contextDetails = document.getElementById('contextDetails');
        if (contextDetails && contextDetails.style.display !== 'none') {
            this.updateContextDetails();
        }
    }
}

// Export class for use by the unified dashboard
window.ContextVisualizer = ContextVisualizer;
