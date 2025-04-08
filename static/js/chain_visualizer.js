/**
 * Chain Visualizer for Free Thinkers
 * Provides visualization and drag-and-drop building capabilities for model chains
 */

class ChainVisualizer {
    constructor() {
        this.isInitialized = false;
        this.availableChains = {};
        this.availableModels = {};
        this.currentChain = null;
        this.isDragging = false;
        this.containerElement = null;
    }
    
    /**
     * Initialize the Chain Visualizer
     */
    async init() {
        try {
            this.containerElement = document.getElementById('chainsContent');
            if (!this.containerElement) {
                console.error('Chain content container not found');
                return false;
            }
            
            await this.loadModels();
            await this.loadChains();
            this.createChainUI();
            this.initEventListeners();
            
            this.isInitialized = true;
            console.log('Chain visualizer initialized');
            return true;
        } catch (error) {
            console.error(`Error initializing chain visualizer: ${error}`);
            return false;
        }
    }
    
    /**
     * Load available models from API
     */
    async loadModels() {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                const data = await response.json();
                this.availableModels = data.models || [];
                return this.availableModels;
            } else {
                console.error(`Error loading models: ${response.statusText}`);
                return [];
            }
        } catch (error) {
            console.error(`Error loading models: ${error}`);
            return [];
        }
    }
    
    /**
     * Load available model chains from API
     */
    async loadChains() {
        try {
            const response = await fetch('/api/chains');
            if (response.ok) {
                this.availableChains = await response.json();
                return this.availableChains;
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
     * Create the Chain Visualizer UI
     */
    createChainUI() {
        if (!this.containerElement) return;
        
        // Clear the container
        this.containerElement.innerHTML = '';
        
        // Create the main layout
        const mainLayout = document.createElement('div');
        mainLayout.className = 'row';
        
        // Chain selector and controls column
        const selectorColumn = document.createElement('div');
        selectorColumn.className = 'col-md-4';
        selectorColumn.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-link"></i> Available Chains
                </div>
                <div class="card-body">
                    <div class="chain-selector-wrapper">
                        <select id="chainSelector" class="form-select mb-2">
                            <option value="">Select a model chain...</option>
                        </select>
                        <div id="chainDescription" class="chain-description small text-muted mb-2"></div>
                        <div class="form-check form-switch mb-3">
                            <input class="form-check-input" type="checkbox" id="enableChainSwitch">
                            <label class="form-check-label" for="enableChainSwitch">Enable Chain Processing</label>
                        </div>
                        <div class="d-flex gap-2">
                            <button id="customizeChainBtn" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-edit"></i> Customize
                            </button>
                            <button id="createNewChainBtn" class="btn btn-sm btn-outline-success">
                                <i class="fas fa-plus"></i> New Chain
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Chain visualization column
        const visualizerColumn = document.createElement('div');
        visualizerColumn.className = 'col-md-8';
        visualizerColumn.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-project-diagram"></i> Chain Visualization
                </div>
                <div class="card-body">
                    <div id="chainVisualizer" class="chain-visualizer">
                        <div class="chain-placeholder text-center text-muted">
                            <i class="fas fa-link fa-2x mb-2"></i>
                            <p>Select a chain to visualize its processing steps</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-header">
                    <i class="fas fa-chart-line"></i> Chain Execution Progress
                </div>
                <div class="card-body">
                    <div id="chainProgress" class="chain-progress d-none">
                        <div class="d-flex justify-content-between mb-1">
                            <span id="chainProgressLabel">Processing...</span>
                            <span id="chainProgressTime">0.0s</span>
                        </div>
                        <div class="progress mb-3" style="height: 20px;">
                            <div id="chainProgressBar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                        </div>
                        <div id="chainStepProgress" class="chain-step-progress small">
                            <!-- Step progress will be displayed here -->
                        </div>
                    </div>
                    <div id="chainProgressPlaceholder" class="text-center text-muted py-4">
                        <p>Chain execution progress will appear here when processing</p>
                    </div>
                </div>
            </div>
        `;
        
        // Append columns to main layout
        mainLayout.appendChild(selectorColumn);
        mainLayout.appendChild(visualizerColumn);
        
        // Append layout to container
        this.containerElement.appendChild(mainLayout);
        
        // Populate the chain selector dropdown
        this.populateChainSelector();
    }
    
    /**
     * Populate the chain selector dropdown
     */
    populateChainSelector() {
        const selector = document.getElementById('chainSelector');
        if (!selector) return;
        
        // Clear existing options except the first one
        while (selector.options.length > 1) {
            selector.remove(1);
        }
        
        // Add chain options
        Object.keys(this.availableChains).forEach(chainId => {
            const chain = this.availableChains[chainId];
            const option = document.createElement('option');
            option.value = chainId;
            option.textContent = chain.name;
            selector.appendChild(option);
        });
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Chain selector change
        const selector = document.getElementById('chainSelector');
        if (selector) {
            selector.addEventListener('change', (event) => {
                const chainId = event.target.value;
                this.selectChain(chainId);
            });
        }
        
        // Enable chain switch
        const enableSwitch = document.getElementById('enableChainSwitch');
        if (enableSwitch) {
            enableSwitch.addEventListener('change', (event) => {
                this.toggleChainEnabled(event.target.checked);
            });
        }
        
        // Customize chain button
        const customizeBtn = document.getElementById('customizeChainBtn');
        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => {
                this.openChainEditor();
            });
        }
        
        // Create new chain button
        const createNewBtn = document.getElementById('createNewChainBtn');
        if (createNewBtn) {
            createNewBtn.addEventListener('click', () => {
                this.createNewChain();
            });
        }
    }
    
    /**
     * Select a chain and visualize it
     */
    selectChain(chainId) {
        if (!chainId) {
            this.currentChain = null;
            this.showChainPlaceholder();
            return;
        }
        
        this.currentChain = this.availableChains[chainId];
        
        // Update description
        const descriptionEl = document.getElementById('chainDescription');
        if (descriptionEl && this.currentChain) {
            descriptionEl.textContent = this.currentChain.description || '';
        }
        
        // Visualize the chain
        this.visualizeChain(this.currentChain);
    }
    
    /**
     * Visualize a chain in the visualizer area
     */
    visualizeChain(chain) {
        const visualizerEl = document.getElementById('chainVisualizer');
        if (!visualizerEl || !chain) return;
        
        // Clear visualizer
        visualizerEl.innerHTML = '';
        
        // Create the chain steps visualization
        const stepsFlow = document.createElement('div');
        stepsFlow.className = 'chain-step-flow';
        
        // Add each step to the flow
        chain.steps.forEach((step, index) => {
            const stepItem = document.createElement('div');
            stepItem.className = 'chain-step-item';
            stepItem.dataset.stepIndex = index;
            
            // Find model details if available
            const modelDetails = step.model !== 'auto' 
                ? this.availableModels.find(m => m.name === step.model) 
                : null;
            
            stepItem.innerHTML = `
                <div class="chain-step-header">
                    <div class="chain-step-number">${index + 1}</div>
                    <div class="chain-step-title">${step.name}</div>
                </div>
                <div class="chain-step-model">${step.model || 'Auto'}</div>
                <div class="chain-step-description">${step.description || ''}</div>
                <div class="chain-step-capability small text-muted">
                    ${step.capability ? `<span class="badge bg-secondary">${step.capability}</span>` : ''}
                </div>
            `;
            
            // Set up drag-and-drop functionality
            this.setupDragAndDrop(stepItem);
            
            stepsFlow.appendChild(stepItem);
        });
        
        visualizerEl.appendChild(stepsFlow);
    }
    
    /**
     * Set up drag-and-drop functionality for chain step items
     */
    setupDragAndDrop(stepElement) {
        stepElement.draggable = true;
        
        stepElement.addEventListener('dragstart', (event) => {
            this.isDragging = true;
            event.dataTransfer.setData('text/plain', event.target.dataset.stepIndex);
            event.target.classList.add('dragging');
        });
        
        stepElement.addEventListener('dragend', (event) => {
            this.isDragging = false;
            event.target.classList.remove('dragging');
        });
        
        stepElement.addEventListener('dragover', (event) => {
            event.preventDefault();
            if (this.isDragging) {
                event.target.classList.add('drag-over');
            }
        });
        
        stepElement.addEventListener('dragleave', (event) => {
            event.target.classList.remove('drag-over');
        });
        
        stepElement.addEventListener('drop', (event) => {
            event.preventDefault();
            event.target.classList.remove('drag-over');
            
            const fromIndex = parseInt(event.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(event.target.dataset.stepIndex);
            
            if (fromIndex !== toIndex && this.currentChain) {
                // Reorder steps in the chain
                const steps = [...this.currentChain.steps];
                const movedStep = steps[fromIndex];
                
                // Remove from original position and insert at new position
                steps.splice(fromIndex, 1);
                steps.splice(toIndex, 0, movedStep);
                
                // Update chain and re-visualize
                this.currentChain.steps = steps;
                this.visualizeChain(this.currentChain);
                
                // Save the updated chain
                this.saveChain(this.currentChain);
            }
        });
    }
    
    /**
     * Show the chain placeholder when no chain is selected
     */
    showChainPlaceholder() {
        const visualizerEl = document.getElementById('chainVisualizer');
        if (!visualizerEl) return;
        
        visualizerEl.innerHTML = `
            <div class="chain-placeholder text-center text-muted">
                <i class="fas fa-link fa-2x mb-2"></i>
                <p>Select a chain to visualize its processing steps</p>
            </div>
        `;
    }
    
    /**
     * Toggle chain enabled state
     */
    toggleChainEnabled(enabled) {
        // Update global state
        if (window.modelChain) {
            window.modelChain.setEnabled(enabled);
        }
        
        // Update UI
        const enableSwitch = document.getElementById('enableChainSwitch');
        if (enableSwitch) {
            enableSwitch.checked = enabled;
        }
    }
    
    /**
     * Open the chain editor for customization
     */
    openChainEditor() {
        if (!this.currentChain) {
            alert('Please select a chain first');
            return;
        }
        
        // Here you would implement the chain editor UI
        // For now, just a placeholder
        alert('Chain editor functionality will be implemented in the next phase');
    }
    
    /**
     * Create a new model chain
     */
    createNewChain() {
        // Here you would implement the new chain creation UI
        // For now, just a placeholder
        alert('New chain creation functionality will be implemented in the next phase');
    }
    
    /**
     * Save the current chain to the server
     */
    async saveChain(chain) {
        try {
            const response = await fetch('/api/chains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(chain)
            });
            
            if (response.ok) {
                console.log('Chain saved successfully');
                return true;
            } else {
                console.error(`Error saving chain: ${response.statusText}`);
                return false;
            }
        } catch (error) {
            console.error(`Error saving chain: ${error}`);
            return false;
        }
    }
    
    /**
     * Update chain execution progress during processing
     */
    updateChainProgress(progress) {
        const progressEl = document.getElementById('chainProgress');
        const placeholderEl = document.getElementById('chainProgressPlaceholder');
        const progressBarEl = document.getElementById('chainProgressBar');
        const progressLabelEl = document.getElementById('chainProgressLabel');
        const progressTimeEl = document.getElementById('chainProgressTime');
        const stepProgressEl = document.getElementById('chainStepProgress');
        
        if (!progressEl || !placeholderEl || !progressBarEl || !progressLabelEl || !progressTimeEl || !stepProgressEl) return;
        
        if (progress) {
            // Show progress and hide placeholder
            progressEl.classList.remove('d-none');
            placeholderEl.classList.add('d-none');
            
            // Update progress bar
            const percent = Math.min(100, Math.max(0, progress.percent || 0));
            progressBarEl.style.width = `${percent}%`;
            progressBarEl.textContent = `${percent.toFixed(0)}%`;
            progressBarEl.setAttribute('aria-valuenow', percent.toFixed(0));
            
            // Update label and time
            progressLabelEl.textContent = progress.status || 'Processing...';
            progressTimeEl.textContent = progress.elapsedSeconds ? `${progress.elapsedSeconds.toFixed(1)}s` : '0.0s';
            
            // Update step progress
            if (progress.currentStep) {
                stepProgressEl.innerHTML = `
                    <div class="mb-1">
                        <span class="badge bg-primary">Step ${progress.currentStep.index + 1}</span>
                        <span class="ms-1">${progress.currentStep.name}</span>
                        <span class="text-muted ms-2">(${progress.currentStep.model})</span>
                    </div>
                    <div class="small text-muted">${progress.currentStep.status || ''}</div>
                `;
            } else {
                stepProgressEl.innerHTML = '';
            }
        } else {
            // Hide progress and show placeholder
            progressEl.classList.add('d-none');
            placeholderEl.classList.remove('d-none');
        }
    }
    
    /**
     * Refresh the Chain Visualizer
     */
    async refresh() {
        await this.loadModels();
        await this.loadChains();
        this.populateChainSelector();
        
        if (this.currentChain) {
            this.visualizeChain(this.currentChain);
        }
    }
}

// Export class for use by the unified dashboard
window.ChainVisualizer = ChainVisualizer;
