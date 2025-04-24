/**
 * Model Integration System
 * 
 * This script provides integration between the model dropdown in the main UI
 * and the model management sidebar, ensuring they stay in sync.
 */

class ModelIntegrationSystem {
    constructor() {
        // Core elements
        this.modelSelect = document.getElementById('model-select');
        this.modelSidebar = document.getElementById('model-management-sidebar');
        this.modelMgmtBtn = document.getElementById('model-management-btn');
        
        // Current state
        this.availableModels = [];
        this.currentModel = '';
        
        // Initialize the system
        this.init();
    }
    
    /**
     * Initialize the integration system
     */
    async init() {
        // Wait for DOM to be fully loaded
        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Set up the integration system
     */
    async setup() {
        try {
            console.log("Setting up model integration system");
            
            // Add event listeners to model select dropdown
            if (this.modelSelect) {
                this.modelSelect.addEventListener('change', (e) => this.handleModelSelectChange(e));
                
                // Store initial selected model
                this.currentModel = this.modelSelect.value;
                console.log("Initial model:", this.currentModel);
            } else {
                console.warn("Model select element not found in the DOM");
            }
            
            // Add "Manage Models" button next to the dropdown if not already present
            this.addManageButton();
            
            // Load available models
            await this.loadAvailableModels();
            
            // Update model dropdown with all available models
            this.updateModelDropdown();
            
            // Set up observer for model management sidebar changes
            this.observeModelSelection();
            
            console.log("Model integration system initialized");
        } catch (error) {
            console.error("Error setting up model integration:", error);
        }
    }
    
    /**
     * Add a "Manage Models" button next to the dropdown
     */
    addManageButton() {
        if (!this.modelSelect) return;
        
        // Check if button already exists
        const existingButton = document.getElementById('model-manage-button');
        if (existingButton) return;
        
        // Create container for dropdown + button if it doesn't exist
        const selectContainer = this.modelSelect.parentElement;
        if (!selectContainer) return;
        
        // Force the container to use flex layout for proper alignment
        selectContainer.style.display = 'flex';
        selectContainer.style.gap = '0.5rem';
        selectContainer.style.alignItems = 'center';
        
        // Create the manage button
        const manageButton = document.createElement('button');
        manageButton.id = 'model-manage-button';
        manageButton.className = 'btn btn-sm btn-outline-secondary';
        manageButton.innerHTML = '<i class="fas fa-cog"></i>';
        manageButton.title = 'Manage Models';
        
        // Add event listener to open model management sidebar
        manageButton.addEventListener('click', () => {
            if (this.modelSidebar) {
                this.modelSidebar.classList.add('active');
                
                // Trigger model refresh if enhanced model manager is available
                if (window.enhancedModelManager && typeof window.enhancedModelManager.loadModels === 'function') {
                    window.enhancedModelManager.loadModels();
                }
            } else if (this.modelMgmtBtn) {
                // Fall back to clicking the original button
                this.modelMgmtBtn.click();
            }
        });
        
        // Add button to the container
        selectContainer.appendChild(manageButton);
    }
    
    /**
     * Handle model select dropdown change
     */
    handleModelSelectChange(event) {
        const newModel = event.target.value;
        console.log("Model changed to:", newModel);
        
        // Update current model
        this.currentModel = newModel;
        
        // Update global state
        if (typeof window.currentModel !== 'undefined') {
            window.currentModel = newModel;
        }
        
        // Update model settings in sidebar if enhanced model manager is available
        if (window.enhancedModelManager) {
            // Refresh model list to show the current selection
            window.enhancedModelManager.renderModels();
        }
        
        // Update model selection visual indication in model management sidebar
        this.updateModelSelectionInSidebar(newModel);
        
        // Show notification
        this.showNotification(`Model changed to ${newModel}`, 'success');
    }
    
    /**
     * Load available models from the server
     */
    async loadAvailableModels() {
        try {
            const response = await fetch('/api/models');
            if (!response.ok) {
                throw new Error(`Failed to load models: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process the models data based on format
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    // Determine if we have an array of strings or objects
                    if (typeof data[0] === 'string') {
                        this.availableModels = data;
                    } else if (typeof data[0] === 'object' && data[0].name) {
                        this.availableModels = data.map(model => model.name);
                    }
                }
            }
            
            console.log("Available models:", this.availableModels);
        } catch (error) {
            console.error("Error loading available models:", error);
            this.showNotification('Error loading available models', 'error');
        }
    }
    
    /**
     * Update the model dropdown with all available models
     */
    updateModelDropdown() {
        if (!this.modelSelect || this.availableModels.length === 0) return;
        
        // Save the current selection
        let currentValue = this.modelSelect.value;
        
        // If phi3:3.8b is in the available models, make it the default if nothing is selected
        if (this.availableModels.includes('phi3:3.8b')) {
            if (!currentValue || !this.availableModels.includes(currentValue)) {
                currentValue = 'phi3:3.8b';
            }
        }
        
        // Get existing options
        const existingOptions = Array.from(this.modelSelect.options).map(opt => opt.value);
        
        // Add any missing models to the dropdown
        this.availableModels.forEach(model => {
            if (!existingOptions.includes(model)) {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                this.modelSelect.appendChild(option);
            }
        });
        
        // Restore or set the selection
        this.modelSelect.value = currentValue;
    }
    
    /**
     * Update the visual indication of the selected model in the sidebar
     */
    updateModelSelectionInSidebar(selectedModel) {
        // Find all model items in the sidebar
        const modelItems = document.querySelectorAll('.model-item');
        
        modelItems.forEach(item => {
            const modelName = item.dataset.model;
            
            if (modelName === selectedModel) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    /**
     * Observe model selection in the management sidebar
     */
    observeModelSelection() {
        // Set up observer for sidebar active state
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isActive = this.modelSidebar.classList.contains('active');
                    
                    if (isActive) {
                        // Update the sidebar to show the current model as selected
                        this.updateModelSelectionInSidebar(this.currentModel);
                    }
                }
            }
        });
        
        if (this.modelSidebar) {
            observer.observe(this.modelSidebar, { attributes: true });
        }
        
        // Set up event listener for model selection in sidebar
        document.addEventListener('click', (e) => {
            const selectButton = e.target.closest('.model-item .select-model-btn') || 
                                 e.target.closest('.select-model') ||
                                 e.target.closest('.select-model-btn');
            
            if (selectButton) {
                const modelItem = selectButton.closest('.model-item');
                if (modelItem && modelItem.dataset.model) {
                    const modelName = modelItem.dataset.model;
                    
                    // Update dropdown
                    if (this.modelSelect && this.modelSelect.value !== modelName) {
                        this.modelSelect.value = modelName;
                        
                        // Trigger change event to update UI
                        const changeEvent = new Event('change', { bubbles: true });
                        this.modelSelect.dispatchEvent(changeEvent);
                    }
                }
            }
        });
    }
    
    /**
     * Show a notification message
     */
    showNotification(message, type = 'success') {
        // Use the global notification system if available
        if (window.showToast) {
            window.showToast(message, type, 3000);
            return;
        } else if (window.showNotification) {
            window.showNotification(message, type, 3000);
            return;
        }
        
        // Fallback to simple notification
        console.log(message);
    }
}

// Initialize the model integration system
document.addEventListener('DOMContentLoaded', function() {
    window.modelIntegration = new ModelIntegrationSystem();
});