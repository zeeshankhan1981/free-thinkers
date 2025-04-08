/**
 * Model Chain Manager
 * Handles model chains for specialized processing
 */

class ModelChain {
    constructor() {
        this.chains = {};
        this.currentChain = null;
    }

    /**
     * Initialize the model chain system
     */
    async init() {
        try {
            await this.loadChains();
            this.initChainUI();
            console.log('Model chain system initialized');
            return true;
        } catch (error) {
            console.error(`Error initializing model chains: ${error}`);
            return false;
        }
    }

    /**
     * Load available model chains from API
     */
    async loadChains() {
        try {
            const response = await fetch('/api/chains');
            if (response.ok) {
                this.chains = await response.json();
                return this.chains;
            } else {
                console.error(`Error loading chains: ${response.statusText}`);
                return {};
            }
        } catch (error) {
            console.error(`Error loading chains: ${error}`);
            return {};
        }
    }

    /**
     * Initialize chain UI components
     */
    initChainUI() {
        // Add chain selector to the UI if it doesn't exist
        let chainSelector = document.getElementById('chainSelector');
        
        if (!chainSelector) {
            // Find where to insert the chain selector
            const appContainer = document.querySelector('.app-container');
            if (!appContainer) return;
            
            // Create the chain selector UI
            const selectorDiv = document.createElement('div');
            selectorDiv.className = 'chain-selector mb-2';
            selectorDiv.innerHTML = `
                <div class="chain-selector-header d-flex justify-content-between align-items-center">
                    <div class="chain-title">
                        <i class="fas fa-link"></i> Model Chain
                        <span class="badge bg-primary chain-status">Inactive</span>
                    </div>
                    <div class="chain-controls">
                        <button id="enableChainBtn" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-toggle-off"></i> Enable
                        </button>
                    </div>
                </div>
                <div class="chain-selector-content" style="display: none;">
                    <select id="chainSelector" class="form-select form-select-sm mb-2">
                        <option value="">Select a model chain...</option>
                    </select>
                    <div id="chainDescription" class="chain-description small text-muted mb-2"></div>
                    <div id="chainSteps" class="chain-steps small"></div>
                </div>
            `;
            
            // Insert at the beginning of the app container, before the chat
            if (appContainer.firstElementChild) {
                appContainer.insertBefore(selectorDiv, appContainer.firstElementChild);
            } else {
                appContainer.appendChild(selectorDiv);
            }
            
            // Update the dropdown with available chains
            this.updateChainDropdown();
            
            // Add event listeners
            this.addChainEventListeners();
            
            // Add styles for chain UI
            this.addChainStyles();
        } else {
            // Just update the dropdown
            this.updateChainDropdown();
        }
    }
    
    /**
     * Add styles for chain UI
     */
    addChainStyles() {
        // Check if styles already exist
        if (document.getElementById('modelChainStyles')) {
            return;
        }
        
        // Create style element
        const styleEl = document.createElement('style');
        styleEl.id = 'modelChainStyles';
        styleEl.textContent = `
            .chain-selector {
                background-color: #f0f7ff;
                border-radius: 8px;
                border: 1px solid #007bff;
                padding: 8px 12px;
                margin-bottom: 12px;
            }
            
            .chain-selector-header {
                padding-bottom: 8px;
            }
            
            .chain-title {
                font-weight: 500;
                color: #0056b3;
            }
            
            .chain-status {
                margin-left: 8px;
                font-size: 0.75rem;
            }
            
            .chain-description {
                color: #6c757d;
                margin-bottom: 8px;
            }
            
            .chain-steps {
                border-left: 2px solid #dee2e6;
                padding-left: 12px;
            }
            
            .chain-step {
                padding-bottom: 6px;
                position: relative;
            }
            
            .chain-step::before {
                content: '';
                position: absolute;
                left: -14px;
                top: 6px;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background-color: #007bff;
            }
            
            .chain-step-model {
                font-weight: 500;
                color: #0056b3;
            }
            
            .dark-mode .chain-selector {
                background-color: #1a2537;
                border-color: #3b82f6;
            }
            
            .dark-mode .chain-title {
                color: #60a5fa;
            }
            
            .dark-mode .chain-description {
                color: #adb5bd;
            }
            
            .dark-mode .chain-steps {
                border-left-color: #4b5563;
            }
            
            .dark-mode .chain-step::before {
                background-color: #3b82f6;
            }
            
            .dark-mode .chain-step-model {
                color: #60a5fa;
            }
            
            .chain-result {
                margin-top: 16px;
                border-top: 1px solid #dee2e6;
                padding-top: 12px;
            }
            
            .chain-result-step {
                margin-bottom: 12px;
            }
            
            .chain-result-step-title {
                font-weight: 500;
                margin-bottom: 4px;
            }
            
            .chain-result-step-content {
                padding: 8px;
                background-color: #f8f9fa;
                border-radius: 4px;
                font-family: monospace;
                white-space: pre-wrap;
                font-size: 0.9rem;
            }
            
            .dark-mode .chain-result {
                border-top-color: #4b5563;
            }
            
            .dark-mode .chain-result-step-content {
                background-color: #2d3748;
                color: #e2e8f0;
            }
        `;
        
        // Add to document
        document.head.appendChild(styleEl);
    }
    
    /**
     * Update chain dropdown with available chains
     */
    updateChainDropdown() {
        const chainSelector = document.getElementById('chainSelector');
        if (!chainSelector) return;
        
        // Clear existing options
        chainSelector.innerHTML = '<option value="">Select a model chain...</option>';
        
        // Add chain options
        const chainIds = Object.keys(this.chains);
        
        // Skip "basic" chain as it's just a single model
        const filteredChains = chainIds.filter(id => id !== 'basic');
        
        // Sort chains alphabetically
        filteredChains.sort((a, b) => {
            const nameA = this.chains[a].name || a;
            const nameB = this.chains[b].name || b;
            return nameA.localeCompare(nameB);
        });
        
        // Add options to dropdown
        filteredChains.forEach(chainId => {
            const chain = this.chains[chainId];
            const option = document.createElement('option');
            option.value = chainId;
            option.textContent = chain.name || chainId;
            chainSelector.appendChild(option);
        });
        
        // Reset current model
        const enableBtn = document.getElementById('enableChainBtn');
        
        // Check if the chain toggle is currently on
        if (enableBtn && enableBtn.querySelector('i') && 
            enableBtn.querySelector('i').classList.contains('fa-toggle-on')) {
            // Select the first valid option
            if (chainSelector.options.length > 1) {
                chainSelector.selectedIndex = 1;
                this.selectChain(chainSelector.value);
            } else {
                this.currentChain = null;
            }
        } else {
            this.currentChain = null;
        }
    }
    
    /**
     * Add event listeners for chain UI
     */
    addChainEventListeners() {
        // Enable/disable chain button
        const enableBtn = document.getElementById('enableChainBtn');
        if (enableBtn) {
            enableBtn.addEventListener('click', () => {
                this.toggleChainEnabled();
            });
        }
        
        // Chain selection change
        const chainSelector = document.getElementById('chainSelector');
        if (chainSelector) {
            chainSelector.addEventListener('change', () => {
                this.selectChain(chainSelector.value);
            });
        }
    }
    
    /**
     * Toggle whether chain processing is enabled
     */
    toggleChainEnabled() {
        const enableBtn = document.getElementById('enableChainBtn');
        const chainContent = document.querySelector('.chain-selector-content');
        const chainStatus = document.querySelector('.chain-status');
        
        if (!enableBtn || !chainContent || !chainStatus) return;
        
        const isEnabled = enableBtn.querySelector('i').classList.contains('fa-toggle-on');
        
        if (isEnabled) {
            // Disable chain
            enableBtn.querySelector('i').classList.remove('fa-toggle-on');
            enableBtn.querySelector('i').classList.add('fa-toggle-off');
            enableBtn.textContent = ' Enable';
            enableBtn.prepend(document.createElement('i'));
            enableBtn.querySelector('i').classList.add('fas', 'fa-toggle-off');
            
            chainContent.style.display = 'none';
            chainStatus.textContent = 'Inactive';
            chainStatus.classList.remove('bg-success');
            chainStatus.classList.add('bg-primary');
            
            this.currentChain = null;
        } else {
            // Enable chain
            enableBtn.querySelector('i').classList.remove('fa-toggle-off');
            enableBtn.querySelector('i').classList.add('fa-toggle-on');
            enableBtn.textContent = ' Disable';
            enableBtn.prepend(document.createElement('i'));
            enableBtn.querySelector('i').classList.add('fas', 'fa-toggle-on');
            
            chainContent.style.display = 'block';
            chainStatus.textContent = 'Active';
            chainStatus.classList.remove('bg-primary');
            chainStatus.classList.add('bg-success');
            
            // Select the chain from dropdown
            const chainSelector = document.getElementById('chainSelector');
            if (chainSelector && chainSelector.value) {
                this.selectChain(chainSelector.value);
            } else if (chainSelector) {
                // Auto-select the first chain if none selected
                if (chainSelector.options.length > 1) {
                    chainSelector.selectedIndex = 1;
                    this.selectChain(chainSelector.value);
                }
            }
        }
    }
    
    /**
     * Select a specific chain
     * @param {string} chainId - Chain ID to select
     */
    selectChain(chainId) {
        if (!chainId || !this.chains[chainId]) {
            this.currentChain = null;
            return;
        }
        
        this.currentChain = chainId;
        
        // Update description and steps display
        const chainDescription = document.getElementById('chainDescription');
        const chainSteps = document.getElementById('chainSteps');
        
        if (!chainDescription || !chainSteps) return;
        
        const chain = this.chains[chainId];
        
        // Set description
        chainDescription.textContent = chain.description || 'No description available.';
        
        // Set steps
        chainSteps.innerHTML = '';
        
        if (chain.steps && chain.steps.length > 0) {
            chain.steps.forEach((step, index) => {
                const stepEl = document.createElement('div');
                stepEl.className = 'chain-step';
                
                let modelName = step.model;
                if (modelName === 'auto') {
                    modelName = `Auto (${step.capability || 'general'})`;
                }
                
                stepEl.innerHTML = `
                    <div class="chain-step-title">${index + 1}. ${step.name || `Step ${index + 1}`}</div>
                    <div class="chain-step-model">Model: ${modelName}</div>
                    <div class="chain-step-desc small">${step.description || ''}</div>
                `;
                
                chainSteps.appendChild(stepEl);
            });
        } else {
            chainSteps.innerHTML = '<div class="text-muted">No steps defined for this chain.</div>';
        }
    }
    
    /**
     * Check if a chain is currently enabled
     * @returns {boolean} - Whether a chain is enabled
     */
    isChainEnabled() {
        const enableBtn = document.getElementById('enableChainBtn');
        if (!enableBtn) return false;
        
        return enableBtn.querySelector('i').classList.contains('fa-toggle-on');
    }
    
    /**
     * Get input processing instructions for the chat script
     * @param {string} userInput - User input text
     * @returns {Object} - Processing instructions
     */
    getProcessingInstructions(userInput) {
        // If chain is not enabled or no chain selected, return null
        if (!this.isChainEnabled() || !this.currentChain) {
            return null;
        }
        
        return {
            type: 'chain',
            chain_id: this.currentChain,
            input: userInput
        };
    }
    
    /**
     * Process user input through a model chain
     * @param {string} userInput - User input to process
     * @returns {Promise<Object>} - Chain processed result with output and details
     */
    async processWithChain(userInput) {
        if (!this.currentChain) {
            throw new Error('No chain selected');
        }
        
        try {
            console.log(`Processing with chain: ${this.currentChain}`);
            
            // Validate that the chain exists
            if (!this.chains[this.currentChain]) {
                throw new Error(`Chain '${this.currentChain}' not found`);
            }
            
            const chain = this.chains[this.currentChain];
            const chainName = chain.name || this.currentChain;
            const stepCount = chain.steps ? chain.steps.length : 0;
            
            console.log(`Chain name: ${chainName}, Steps: ${stepCount}`);
            
            // Update progress UI before starting
            this.updateChainProgressUI('Starting chain processing...', 0, stepCount);
            
            const response = await fetch('/api/chains/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chain_id: this.currentChain,
                    input: userInput
                })
            });
            
            // As the request is processing, update the progress bar periodically
            const progressInterval = setInterval(() => {
                const progressBar = document.querySelector('.chain-progress-bar .progress-bar');
                if (progressBar) {
                    const currentWidth = parseFloat(progressBar.style.width) || 5;
                    // Gradually increase progress, but never reach 100% until completed
                    const newWidth = Math.min(currentWidth + 5, 90);
                    progressBar.style.width = `${newWidth}%`;
                }
            }, 2000);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Chain processing result:', result);
                
                // Clear progress interval
                clearInterval(progressInterval);
                
                // Show 100% completion
                this.updateChainProgressUI('Chain processing complete!', stepCount, stepCount, 100);
                
                // Check for errors
                if (result.status === 'error') {
                    throw new Error(result.message || 'Chain processing error');
                }
                
                // Format detailed result for display
                const detailedResult = this.formatChainResult(result);
                
                // Return final output and details
                return {
                    output: result.output || "No output was generated from the chain.",
                    details: detailedResult
                };
            } else {
                // Clear progress interval on error
                clearInterval(progressInterval);
                
                // Show error in UI
                this.updateChainProgressUI('Error processing chain!', 0, stepCount, 0);
                
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error processing with chain:', error);
            throw error;
        }
    }
    
    /**
     * Update the chain progress UI elements
     * @param {string} statusText - Current status text to display
     * @param {number} currentStep - Current step number
     * @param {number} totalSteps - Total number of steps
     * @param {number} progressPercent - Progress percentage (optional)
     */
    updateChainProgressUI(statusText, currentStep, totalSteps, progressPercent = null) {
        // Update step information
        const currentStepEl = document.querySelector('.loading-text .current-step');
        const stepsIndicatorEl = document.querySelector('.loading-text .steps-indicator');
        
        if (currentStepEl) {
            currentStepEl.textContent = statusText;
        }
        
        if (stepsIndicatorEl) {
            stepsIndicatorEl.textContent = `Step ${currentStep}/${totalSteps}`;
        }
        
        // Update progress bar if percentage provided
        if (progressPercent !== null) {
            const progressBar = document.querySelector('.chain-progress-bar .progress-bar');
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`;
            }
        }
    }
    
    /**
     * Format chain result for display
     * @param {Object} result - Chain processing result
     * @returns {string} - Formatted HTML result
     */
    formatChainResult(result) {
        if (!result || !result.steps || !Array.isArray(result.steps)) {
            return '<div class="text-danger">Invalid chain result</div>';
        }
        
        let html = `<div class="chain-result">
            <details class="chain-details">
                <summary class="chain-summary">
                    <span class="chain-icon"><i class="fas fa-info-circle"></i></span>
                    <span class="chain-summary-text">Details of the ${result.chain_id} processing pipeline</span>
                </summary>
                <div class="chain-steps-container">`;
        
        // Add each step
        result.steps.forEach((step, index) => {
            html += `<div class="chain-result-step">
                <div class="chain-result-step-title">
                    <span class="step-number">${index + 1}</span>
                    <span class="step-name">${step.name || 'Processing'}</span>
                    <span class="model-badge">${step.model}</span>
                </div>`;
            
            if (step.status === 'error') {
                html += `<div class="step-error">Error: ${step.error}</div>`;
            } else if (step.status === 'skipped') {
                html += `<div class="step-warning">Skipped: ${step.error || 'Step was skipped'}</div>`;
            } else {
                // Truncate very long outputs
                let outputContent = step.output;
                if (outputContent && outputContent.length > 300) {
                    outputContent = outputContent.substring(0, 300) + '... [truncated]';
                }
                
                // Format code blocks with syntax highlighting if present
                if (outputContent && outputContent.includes('```')) {
                    // Simple code block formatting
                    outputContent = outputContent.replace(/```(\w*)\n([\s\S]*?)```/g, 
                        '<pre class="code-block"><code>$2</code></pre>');
                }
                
                html += `<div class="step-output">${outputContent || 'No output'}</div>`;
            }
            
            html += `</div>`;
            
            // Add connector between steps except for the last one
            if (index < result.steps.length - 1) {
                html += `<div class="step-connector">
                    <div class="connector-line"></div>
                    <div class="connector-arrow">↓</div>
                </div>`;
            }
        });
        
        html += `</div></details></div>`;
        return html;
    }
    
    /**
     * Suggest a chain for a given input
     * @param {string} userInput - User input text
     * @returns {Promise<string>} - Suggested chain ID
     */
    async suggestChain(userInput) {
        try {
            const response = await fetch('/api/chains/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: userInput
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.suggested_chain;
            }
            
            return 'basic';
        } catch (error) {
            console.error('Error suggesting chain:', error);
            return 'basic';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global instance
    window.modelChain = new ModelChain();
    
    // Initialize
    window.modelChain.init();
});