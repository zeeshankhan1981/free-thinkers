/**
 * Model Management Component
 * 
 * This script handles the model management functionality, including:
 * - Listing available models
 * - Downloading new models with progress indicators
 * - Tracking model versions and status
 */

const debug = true; // Set to false in production

function logDebug(...args) {
    if (debug) {
        console.log('[ModelManagement]', ...args);
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    logDebug('Initializing model management');
    
    // Get DOM elements once
    const modelManagementBtn = document.getElementById('model-management-btn');
    const closeModelManagement = document.getElementById('close-model-management');
    const modelManagementSidebar = document.getElementById('model-management-sidebar');
    const modelsList = document.getElementById('modelsList');
    const downloadModelBtn = document.getElementById('download-model-btn');
    const modelNameInput = document.getElementById('model-name-input');
    const downloadProgress = document.getElementById('download-progress');
    const progressBar = document.querySelector('#download-progress .progress-bar');
    const progressText = document.getElementById('progress-text');
    const modelSearchInput = document.getElementById('model-search-input');
    const modelTypeFilter = document.getElementById('model-type-filter');
    const modelSizeFilter = document.getElementById('model-size-filter');
    const modelSortBy = document.getElementById('model-sort-by');
    const refreshModelList = document.getElementById('refresh-model-list');
    const browseOllamaModels = document.getElementById('browse-ollama-models');
    const registryModelsList = document.getElementById('registry-models-list');
    const registrySearchInput = document.getElementById('registry-search-input');
    
    // Models data
    let models = [];
    let filteredModels = [];
    let registryModels = [];
    let currentModel = '';
    
    // User preferences
    const userPreferences = loadUserPreferences();
    
    // Initialize click handlers
    if (modelManagementBtn) {
        modelManagementBtn.addEventListener('click', loadModels);
    }

    // Load models if sidebar is visible on page load
    if (modelManagementSidebar?.classList.contains('active')) {
        loadModels();
    }
    
    // Event Listeners
    if (modelManagementBtn) {
        modelManagementBtn.addEventListener('click', function() {
            // Use the global toggleSidebar if available, otherwise fall back to original behavior
            if (window.toggleSidebar && typeof window.toggleSidebar === 'function') {
                window.toggleSidebar(modelManagementSidebar, modelManagementBtn);
            } else {
                modelManagementSidebar.classList.add('active');
            }
            loadModels();
        });
    }
    
    if (closeModelManagement) {
        console.log('Setting up close model management button handler');
        closeModelManagement.addEventListener('click', function() {
            console.log('Close model management button clicked');
            if (modelManagementSidebar) {
                modelManagementSidebar.classList.remove('active');
                
                // Also remove active class from the button if using the new UI
                if (modelManagementBtn) {
                    modelManagementBtn.classList.remove('active');
                }
                
                // Update activeSidebar if it's a global variable
                if (window.activeSidebar !== undefined) {
                    window.activeSidebar = null;
                }
            } else {
                console.error('Model management sidebar not found when trying to close');
            }
        });
    } else {
        console.warn('Close model management button not found with ID #closeModelManagement');
        // Try to find with alternative selectors
        const altCloseBtn = document.querySelector('#model-management-sidebar .close-btn');
        if (altCloseBtn) {
            console.log('Found alternative close button with class .close-btn');
            altCloseBtn.addEventListener('click', function() {
                console.log('Alternative close button clicked');
                const sidebar = document.getElementById('model-management-sidebar');
                if (sidebar) {
                    sidebar.classList.remove('active');
                    if (modelManagementBtn) {
                        modelManagementBtn.classList.remove('active');
                    }
                }
            });
        }
    }
    
    if (downloadModelBtn) {
        downloadModelBtn.addEventListener('click', function() {
            downloadModel();
        });
    }
    
    // Add event listeners for filter and search
    if (modelSearchInput) {
        modelSearchInput.addEventListener('input', filterModels);
    }
    
    if (modelTypeFilter) {
        modelTypeFilter.addEventListener('change', filterModels);
    }
    
    if (modelSizeFilter) {
        modelSizeFilter.addEventListener('change', filterModels);
    }
    
    if (modelSortBy) {
        modelSortBy.addEventListener('change', filterModels);
    }
    
    if (refreshModelList) {
        refreshModelList.addEventListener('click', function() {
            loadModels(true); // Force refresh
        });
    }
    
    if (browseOllamaModels) {
        browseOllamaModels.addEventListener('click', function() {
            openRegistryModal();
        });
    }
    
    if (registrySearchInput) {
        registrySearchInput.addEventListener('input', filterRegistryModels);
    }
    
    // Initialize - set current model from localStorage if available
    if (window.modelSelect && userPreferences.lastSelectedModel) {
        try {
            currentModel = userPreferences.lastSelectedModel;
            window.modelSelect.value = currentModel;
            // Dispatch change event
            window.modelSelect.dispatchEvent(new Event('change'));
        } catch (e) {
            console.warn('Failed to set initial model:', e);
        }
    }
    
    /**
     * Load user preferences from localStorage
     */
    function loadUserPreferences() {
        try {
            const prefs = localStorage.getItem('freethinkers-model-preferences');
            if (prefs) {
                return JSON.parse(prefs);
            }
        } catch (e) {
            console.warn('Error loading preferences:', e);
        }
        
        // Default preferences
        return {
            lastSelectedModel: '',
            sortOrder: 'name',
            filterType: 'all',
            filterSize: 'all'
        };
    }
    
    /**
     * Save user preferences to localStorage
     */
    function saveUserPreferences() {
        try {
            // Get current preferences
            const modelSortValue = modelSortBy ? modelSortBy.value : 'name';
            const modelTypeValue = modelTypeFilter ? modelTypeFilter.value : 'all';
            const modelSizeValue = modelSizeFilter ? modelSizeFilter.value : 'all';
            
            const prefs = {
                lastSelectedModel: currentModel,
                sortOrder: modelSortValue,
                filterType: modelTypeValue,
                filterSize: modelSizeValue
            };
            
            localStorage.setItem('freethinkers-model-preferences', JSON.stringify(prefs));
        } catch (e) {
            console.warn('Error saving preferences:', e);
        }
    }
    
    /**
     * Helper function to find element with retries
     */
    async function waitForElement(selector, maxRetries = 10, interval = 100) {
        return new Promise((resolve, reject) => {
            let retries = 0;
            const check = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (retries++ < maxRetries) {
                    setTimeout(check, interval);
                } else {
                    reject(new Error(`Element ${selector} not found after ${maxRetries} retries`));
                }
            };
            check();
        });
    }
    
    /**
     * Load available models from the Ollama API
     * @param {boolean} forceRefresh - Whether to force a refresh of the model list
     * @returns {Promise<Array>} - Array of model objects
     */
    async function loadModels(forceRefresh = false) {
        logDebug('Loading models, forceRefresh:', forceRefresh);
        
        try {
            // Wait for modelsList element (note camelCase ID)
            const modelsList = await waitForElement('#modelsList');
            
            // Show loading state
            modelsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading models...</div>';
            
            logDebug('Attempting to fetch from Ollama API');
            const response = await fetch('http://localhost:11434/api/tags');
            logDebug('API response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Ollama API error ${response.status}`);
            }
            
            const data = await response.json();
            logDebug('Received models:', data.models.length);
            logDebug('First model details:', JSON.stringify(data.models[0]));
            
            // Verify container still exists
            const currentContainer = document.querySelector('#modelsList');
            if (!currentContainer) {
                throw new Error('Model list container disappeared during load');
            }
            
            models = data.models || [];
            
            // Try both rendering methods for maximum compatibility
            filterAndRenderModels();
            
            // If the first method didn't work well, this will be a backup
            setTimeout(() => {
                const currentModelsList = document.getElementById('modelsList');
                if (currentModelsList && currentModelsList.children.length <= 1 && models.length > 0) {
                    logDebug('Using direct DOM manipulation as fallback rendering method');
                    createModelList();
                }
            }, 200);
            
            updateModelUsageStats();
            
            logDebug(`Loaded ${models.length} models`);
            return models;
        } catch (e) {
            logDebug('Error loading models:', e);
            const container = document.querySelector('#modelsList');
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        ${e.message}
                        <button class="btn btn-sm btn-outline-primary mt-2" onclick="loadModels(true)">
                            Retry
                        </button>
                    </div>
                `;
            }
            return [];
        }
    }
    
    // Make loadModels available globally
    window.loadModels = loadModels;
    
    /**
     * Fetch detailed information for a model
     */
    async function fetchModelDetails(modelName) {
        try {
            // Try main API first
            let response = await fetch(`/api/models/${encodeURIComponent(modelName)}`);
            
            // If that fails, try model management API
            if (!response.ok) {
                response = await fetch(`/model-management/api/models/version?name=${encodeURIComponent(modelName)}`);
            }
            
            if (!response.ok) {
                throw new Error(`Failed to get model details: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extract relevant information
            let modelInfo = {
                size: data.size || 0,
                modified: data.modified || new Date().toISOString(),
                family: detectModelFamily(modelName),
                parameters: data.parameters || {}
            };
            
            // Add additional information if available
            if (data.info) {
                modelInfo = {
                    ...modelInfo,
                    ...data.info
                };
            }
            
            return modelInfo;
        } catch (e) {
            logDebug(`Error fetching details for ${modelName}:`, e);
            return {
                size: 0,
                modified: new Date().toISOString(),
                family: detectModelFamily(modelName),
                parameters: {}
            };
        }
    }
    
    /**
     * Detect model family based on name
     */
    function detectModelFamily(modelName) {
        const lowerName = modelName.toLowerCase();
        
        if (lowerName.includes('llama')) return 'llama';
        if (lowerName.includes('mistral')) return 'mistral';
        if (lowerName.includes('gemma')) return 'gemma';
        if (lowerName.includes('phi')) return 'phi';
        if (lowerName.includes('zephyr')) return 'zephyr';
        if (lowerName.includes('wizard')) return 'wizard';
        if (lowerName.includes('falcon')) return 'falcon';
        if (lowerName.includes('gpt')) return 'gpt';
        
        return 'other';
    }
    
    /**
     * Get size category for a model
     */
    function getModelSizeCategory(model) {
        // Extract parameter size from name if available (e.g., "model-7b" => 7B)
        const paramMatch = model.name.match(/[.-](\d+)b/i);
        let sizeInBillions = 0;
        
        if (paramMatch) {
            sizeInBillions = parseInt(paramMatch[1]);
        }
        
        // If size is in the model object, use that as a fallback
        if (!sizeInBillions && model.parameters && model.parameters.parameter_size) {
            const sizeStr = String(model.parameters.parameter_size);
            const sizeMatch = sizeStr.match(/(\d+)/);
            if (sizeMatch) {
                sizeInBillions = parseInt(sizeMatch[1]);
            }
        }
        
        // Categorize based on billions of parameters
        if (sizeInBillions < 7) return 'small';
        if (sizeInBillions >= 7 && sizeInBillions <= 13) return 'medium';
        return 'large';
    }
    
    /**
     * Debug function to print the DOM structure of the modelsList container
     */
    function debugModelsList() {
        const container = document.getElementById('modelsList');
        if (!container) {
            console.error('MODELS LIST CONTAINER NOT FOUND FOR DEBUGGING');
            // Log all available elements with ID starting with "models"
            const allElements = document.querySelectorAll('[id*="model"]');
            console.log('Available elements with "model" in ID:', Array.from(allElements).map(el => `${el.id} (${el.tagName})`));
            return;
        }
        
        console.log('MODELS LIST DEBUG:');
        console.log('- Container exists:', !!container);
        console.log('- Container ID:', container.id);
        console.log('- Container tag:', container.tagName);
        console.log('- Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
        console.log('- Container visibility:', getComputedStyle(container).display, getComputedStyle(container).visibility);
        console.log('- Container position:', container.getBoundingClientRect());
        console.log('- Container parent:', container.parentElement?.tagName, container.parentElement?.id);
        console.log('- Container parent visibility:', container.parentElement ? getComputedStyle(container.parentElement).display : 'N/A');
        console.log('- Container has children:', container.children.length);
        console.log('- Container HTML:', container.outerHTML);
        
        // Check for parent overflow issues
        let parent = container.parentElement;
        while (parent) {
            const style = getComputedStyle(parent);
            console.log('- Parent', parent.tagName, parent.id, '- overflow:', style.overflow, style.overflowY, style.overflowX);
            parent = parent.parentElement;
        }
        
        // Log all siblings in the same parent
        const siblings = container.parentElement ? Array.from(container.parentElement.children) : [];
        console.log('- Siblings count:', siblings.length);
        siblings.forEach((sib, i) => {
            console.log(`  Sibling ${i}:`, sib.tagName, sib.id, 'visibility:', getComputedStyle(sib).display);
        });
    }

    /**
     * Apply filters and render the model list
     */
    function filterAndRenderModels() {
        logDebug('Rendering models - filtered count:', filteredModels ? filteredModels.length : 0);
        
        const modelsList = document.getElementById('modelsList');
        if (!modelsList) {
            console.error('Models list container not found');
            debugModelsList(); // Run debug function to see what's wrong
            return;
        }
        
        logDebug('Container dimensions:', modelsList.offsetWidth, 'x', modelsList.offsetHeight);
        
        // Clear existing content with visibility fix
        modelsList.innerHTML = '';
        modelsList.style.display = 'block';
        modelsList.style.visibility = 'visible'; // Ensure visibility
        modelsList.style.opacity = '1'; // Ensure opacity
        
        // Get filter values - ensure we have references to these elements
        const modelSearchInput = document.getElementById('modelSearchInput');
        const modelTypeFilter = document.getElementById('modelTypeFilter');
        const modelSizeFilter = document.getElementById('modelSizeFilter');
        const modelSortBy = document.getElementById('modelSortBy');
        
        const searchTerm = modelSearchInput ? modelSearchInput.value.toLowerCase() : '';
        const typeFilter = modelTypeFilter ? modelTypeFilter.value : 'all';
        const sizeFilter = modelSizeFilter ? modelSizeFilter.value : 'all';
        const sortBy = modelSortBy ? modelSortBy.value : 'name';
        
        // Ensure models is initialized
        if (!models || !Array.isArray(models)) {
            models = [];
            logDebug('Models array was not initialized');
        }
        
        // Filter models
        filteredModels = models.filter(model => {
            // Apply search filter
            if (searchTerm && !model.name.toLowerCase().includes(searchTerm)) {
                return false;
            }
            
            // Apply type filter
            if (typeFilter !== 'all') {
                const family = model.family || detectModelFamily(model.name);
                if (family !== typeFilter) {
                    return false;
                }
            }
            
            // Apply size filter
            if (sizeFilter !== 'all') {
                const sizeCategory = getModelSizeCategory(model);
                if (sizeCategory !== sizeFilter) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Sort models
        if (sortBy === 'name') {
            filteredModels.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'size') {
            filteredModels.sort((a, b) => (b.size || 0) - (a.size || 0));
        } else if (sortBy === 'date') {
            filteredModels.sort((a, b) => {
                const dateA = new Date(a.modified || 0);
                const dateB = new Date(b.modified || 0);
                return dateB - dateA;
            });
        }
        
        // Update models count
        const modelsCount = document.getElementById('modelsCount');
        if (modelsCount) {
            modelsCount.textContent = `${filteredModels.length} models`;
        }
        
        // Render models
        if (filteredModels.length === 0) {
            modelsList.innerHTML = '<div class="empty-state">No models match your filters</div>';
            return;
        }
        
        // Get current model
        const modelSelect = document.getElementById('model-select');
        const selectedModel = modelSelect ? modelSelect.value : '';
        
        // Generate HTML
        let html = '';
        for (const model of filteredModels) {
            html += createModelItem(model, model.name === selectedModel);
        }
        
        // Add a debug marker
        html += '<div style="display:none;" id="models-rendered-marker">Models rendered at ' + new Date().toISOString() + '</div>';
        
        // Set the HTML content
        modelsList.innerHTML = html;
        
        // Log the rendered HTML for debugging
        logDebug('HTML content set:', modelsList.innerHTML.substring(0, 100) + '...');
        logDebug('Child elements count:', modelsList.children.length);
        
        // Double check visibility of model list after rendering
        setTimeout(() => {
            const currentModelsList = document.getElementById('modelsList');
            if (currentModelsList) {
                logDebug('AFTER RENDER - Container dimensions:', currentModelsList.offsetWidth, 'x', currentModelsList.offsetHeight);
                logDebug('AFTER RENDER - Child count:', currentModelsList.children.length);
                logDebug('AFTER RENDER - First child:', currentModelsList.firstChild?.nodeType, currentModelsList.firstChild?.nodeName);
                
                // If the debug marker isn't found, possibly the content isn't rendering properly
                const markerFound = !!document.getElementById('models-rendered-marker');
                logDebug('AFTER RENDER - Debug marker found:', markerFound);
                
                // Force display if the container is still empty
                if (currentModelsList.children.length <= 1 && filteredModels.length > 0) {
                    logDebug('WARNING: Container appears empty after rendering, forcing content');
                    currentModelsList.style.display = 'block';
                    currentModelsList.style.visibility = 'visible';
                    // Try rendering again
                    createModelList();
                }
            }
        }, 100);
        
        // Add event listeners to model actions
        document.querySelectorAll('.model-item .model-info').forEach(item => {
            item.addEventListener('click', function() {
                const modelName = this.parentElement.dataset.model;
                showModelDetails(modelName);
            });
        });
        
        document.querySelectorAll('.model-item .select-model').forEach(btn => {
            btn.addEventListener('click', function() {
                const modelName = this.parentElement.parentElement.dataset.model;
                selectModel(modelName);
            });
        });
        
        document.querySelectorAll('.model-item .configure-model').forEach(btn => {
            btn.addEventListener('click', function() {
                const modelName = this.parentElement.parentElement.dataset.model;
                showModelSettings(modelName);
            });
        });
    }
    
    /**
     * Alternative method to create and append model items
     * This uses DOM manipulation rather than innerHTML
     */
    function createModelList() {
        const modelsList = document.getElementById('modelsList');
        if (!modelsList || !filteredModels || !Array.isArray(filteredModels)) return;
        
        // Clear existing content
        while (modelsList.firstChild) {
            modelsList.removeChild(modelsList.firstChild);
        }
        
        // Get current model
        const modelSelect = document.getElementById('model-select');
        const selectedModel = modelSelect ? modelSelect.value : '';
        
        // Create each model item using DOM methods
        filteredModels.forEach(model => {
            const isSelected = model.name === selectedModel;
            
            // Create model item container
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${isSelected ? 'active' : ''}`;
            modelItem.dataset.model = model.name;
            
            // Format size in human-readable form
            const size = model.size ? formatBytes(model.size) : 'Unknown size';
            
            // Format date
            let formattedDate = 'Unknown date';
            if (model.modified) {
                try {
                    const date = new Date(model.modified);
                    formattedDate = date.toLocaleDateString();
                } catch (e) {
                    console.error('Error formatting date:', e);
                }
            }
            
            // Get model family
            const family = model.family || detectModelFamily(model.name);
            
            // Get model size category
            const sizeCategory = getModelSizeCategory(model);
            
            // Create model info section
            const modelInfo = document.createElement('div');
            modelInfo.className = 'model-info';
            
            // Add model name
            const modelName = document.createElement('div');
            modelName.className = 'model-name';
            modelName.textContent = model.name;
            if (isSelected) {
                const activeBadge = document.createElement('span');
                activeBadge.className = 'model-badge model-active';
                activeBadge.textContent = 'Active';
                modelName.appendChild(activeBadge);
            }
            modelInfo.appendChild(modelName);
            
            // Add model meta info
            const modelMeta = document.createElement('div');
            modelMeta.className = 'model-meta';
            
            // Size info
            const sizeItem = document.createElement('span');
            sizeItem.className = 'model-meta-item';
            sizeItem.innerHTML = `<i class="fas fa-hdd"></i> ${size}`;
            modelMeta.appendChild(sizeItem);
            
            // Date info
            const dateItem = document.createElement('span');
            dateItem.className = 'model-meta-item';
            dateItem.innerHTML = `<i class="fas fa-calendar-alt"></i> ${formattedDate}`;
            modelMeta.appendChild(dateItem);
            
            // Badges container
            const badgesDiv = document.createElement('div');
            badgesDiv.className = 'model-badges';
            
            // Family badge
            const familyBadge = document.createElement('span');
            familyBadge.className = 'badge';
            
            // Set badge color based on family
            switch (family) {
                case 'llama':
                    familyBadge.classList.add('bg-primary');
                    familyBadge.textContent = 'LLaMA';
                    break;
                case 'mistral':
                    familyBadge.classList.add('bg-info');
                    familyBadge.textContent = 'Mistral';
                    break;
                case 'gemma':
                    familyBadge.classList.add('bg-success');
                    familyBadge.textContent = 'Gemma';
                    break;
                case 'phi':
                    familyBadge.classList.add('bg-warning');
                    familyBadge.textContent = 'Phi';
                    break;
                case 'zephyr':
                    familyBadge.classList.add('bg-danger');
                    familyBadge.textContent = 'Zephyr';
                    break;
                default:
                    familyBadge.classList.add('bg-secondary');
                    familyBadge.textContent = family.charAt(0).toUpperCase() + family.slice(1);
            }
            badgesDiv.appendChild(familyBadge);
            
            // Size badge
            const sizeBadge = document.createElement('span');
            sizeBadge.className = 'badge';
            
            // Set badge color based on size
            if (sizeCategory === 'small') {
                sizeBadge.classList.add('bg-success');
                sizeBadge.textContent = 'Small';
            } else if (sizeCategory === 'medium') {
                sizeBadge.classList.add('bg-warning');
                sizeBadge.textContent = 'Medium';
            } else if (sizeCategory === 'large') {
                sizeBadge.classList.add('bg-danger');
                sizeBadge.textContent = 'Large';
            }
            badgesDiv.appendChild(sizeBadge);
            
            modelMeta.appendChild(badgesDiv);
            modelInfo.appendChild(modelMeta);
            modelItem.appendChild(modelInfo);
            
            // Create model actions
            const modelActions = document.createElement('div');
            modelActions.className = 'model-actions';
            
            // Configure button
            const configureBtn = document.createElement('button');
            configureBtn.className = 'btn btn-sm btn-outline-info configure-model';
            configureBtn.title = 'Configure model settings';
            configureBtn.innerHTML = '<i class="fas fa-cog"></i>';
            configureBtn.addEventListener('click', function() {
                showModelSettings(model.name);
            });
            modelActions.appendChild(configureBtn);
            
            // Select button
            const selectBtn = document.createElement('button');
            selectBtn.className = `btn btn-sm ${isSelected ? 'btn-success' : 'btn-primary'} select-model`;
            selectBtn.title = 'Use this model';
            selectBtn.innerHTML = isSelected ? '<i class="fas fa-check"></i> Current' : '<i class="fas fa-check"></i>';
            selectBtn.addEventListener('click', function() {
                selectModel(model.name);
            });
            modelActions.appendChild(selectBtn);
            
            modelItem.appendChild(modelActions);
            modelsList.appendChild(modelItem);
        });
        
        // Add visibility check
        const checkVisibility = document.createElement('div');
        checkVisibility.id = 'models-rendered-marker';
        checkVisibility.style.display = 'none';
        checkVisibility.textContent = 'DOM created at ' + new Date().toISOString();
        modelsList.appendChild(checkVisibility);
    }
    
    // Make filterAndRenderModels available globally
    window.filterAndRenderModels = filterAndRenderModels;
    
    /**
     * Create HTML for a model item
     * @param {Object} model - The model object
     * @param {boolean} isSelected - Whether this model is currently selected
     * @returns {string} HTML for the model item
     */
    function createModelItem(model, isSelected = false) {
        // Format size in human-readable form
        const size = model.size ? formatBytes(model.size) : 'Unknown size';
        
        // Format date
        let formattedDate = 'Unknown date';
        if (model.modified) {
            try {
                const date = new Date(model.modified);
                formattedDate = date.toLocaleDateString();
            } catch (e) {
                logDebug('Error formatting date:', e);
            }
        }
        
        // Get model family
        const family = model.family || detectModelFamily(model.name);
        
        // Get model size category
        const sizeCategory = getModelSizeCategory(model);
        
        // Create size badge
        let sizeBadge = '';
        if (sizeCategory === 'small') {
            sizeBadge = '<span class="badge bg-success model-size-badge">Small</span>';
        } else if (sizeCategory === 'medium') {
            sizeBadge = '<span class="badge bg-warning model-size-badge">Medium</span>';
        } else if (sizeCategory === 'large') {
            sizeBadge = '<span class="badge bg-danger model-size-badge">Large</span>';
        }
        
        // Create family badge
        let familyBadge = '';
        switch (family) {
            case 'llama':
                familyBadge = '<span class="badge bg-primary model-family-badge">LLaMA</span>';
                break;
            case 'mistral':
                familyBadge = '<span class="badge bg-info model-family-badge">Mistral</span>';
                break;
            case 'gemma':
                familyBadge = '<span class="badge bg-success model-family-badge">Gemma</span>';
                break;
            case 'phi':
                familyBadge = '<span class="badge bg-warning model-family-badge">Phi</span>';
                break;
            case 'zephyr':
                familyBadge = '<span class="badge bg-danger model-family-badge">Zephyr</span>';
                break;
            default:
                familyBadge = `<span class="badge bg-secondary model-family-badge">${family.charAt(0).toUpperCase() + family.slice(1)}</span>`;
        }
        
        // Create selected indicator
        const selectedClass = isSelected ? 'active' : '';
        const selectButtonClass = isSelected ? 'btn-success' : 'btn-primary';
        const selectButtonText = isSelected ? '<i class="fas fa-check"></i> Current' : '<i class="fas fa-check"></i>';
        
        return `
            <div class="model-item ${selectedClass}" data-model="${model.name}">
                <div class="model-info">
                    <div class="model-name">${model.name} ${isSelected ? '<span class="model-badge model-active">Active</span>' : ''}</div>
                    <div class="model-meta">
                        <span class="model-meta-item"><i class="fas fa-hdd"></i> ${size}</span>
                        <span class="model-meta-item"><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                        <div class="model-badges">
                            ${familyBadge}
                            ${sizeBadge}
                        </div>
                    </div>
                </div>
                <div class="model-actions">
                    <button class="btn btn-sm btn-outline-info configure-model" title="Configure model settings">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="btn btn-sm ${selectButtonClass} select-model" title="Use this model">
                        ${selectButtonText}
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Show detailed information about a model
     */
    async function showModelDetails(modelName) {
        try {
            // Fetch model details
            const response = await fetch(`/api/models/${encodeURIComponent(modelName)}`);
            // Fallback to API model endpoint if needed
            if (!response.ok) {
                const fallbackResponse = await fetch(`/model-management/api/models/version?name=${encodeURIComponent(modelName)}`);
                if (fallbackResponse.ok) {
                    return fallbackResponse.json();
                }
            }
            if (!response.ok) {
                throw new Error(`Failed to get model details: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Create a modal to display model details
            const modelSize = formatBytes(data.size || 0);
            const modelDate = new Date(data.modified || Date.now()).toLocaleString();
            
            const modal = document.createElement('div');
            modal.className = 'model-details-modal';
            modal.innerHTML = `
                <div class="model-details-content">
                    <div class="model-details-header">
                        <h3>${modelName}</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="model-details-body">
                        <div class="detail-item">
                            <span class="detail-label">Size:</span>
                            <span class="detail-value">${modelSize}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Modified:</span>
                            <span class="detail-value">${modelDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">Ready</span>
                        </div>
                    </div>
                    <div class="model-details-footer">
                        <button class="btn btn-primary select-model-btn">Use This Model</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('.close-modal').addEventListener('click', function() {
                modal.remove();
            });
            
            modal.querySelector('.select-model-btn').addEventListener('click', function() {
                selectModel(modelName);
                modal.remove();
            });
            
            // Close modal when clicking outside
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        } catch (error) {
            logDebug('Error showing model details:', error);
            alert(`Error: ${error.message}`);
        }
    }
    
    /**
     * Select a model for use in the chat
     * @param {string} modelName - The name of the model to select
     */
    function selectModel(modelName) {
        const modelSelect = document.getElementById('model-select');
        if (modelSelect) {
            // Check if this model is already selected
            const isAlreadySelected = modelSelect.value === modelName;
            
            if (!isAlreadySelected) {
                // Show transition loading indicator
                const loadingText = document.createElement('div');
                loadingText.className = 'model-transition-indicator';
                loadingText.innerHTML = `<i class="fas fa-sync fa-spin"></i> Switching to ${modelName}...`;
                document.body.appendChild(loadingText);
                
                // Update dropdown value
                modelSelect.value = modelName;
                
                // Trigger change event
                modelSelect.dispatchEvent(new Event('change'));
                
                // Remove loading indicator after a short delay
                setTimeout(() => {
                    loadingText.classList.add('fade-out');
                    setTimeout(() => loadingText.remove(), 500);
                }, 800);
                
                // Track model usage
                trackModelUsage(modelName);
            }
            
            // Update current model
            currentModel = modelName;
            
            // Save to user preferences
            saveUserPreferences();
            
            // Update visual indication of selected model in sidebar
            document.querySelectorAll('.model-item').forEach(item => {
                const itemModelName = item.dataset.model;
                
                if (itemModelName === modelName) {
                    item.classList.add('active');
                    
                    // Update the select button text if it's already selected
                    const selectBtn = item.querySelector('.select-model') || 
                                       item.querySelector('.select-model-btn');
                                       
                    if (selectBtn) {
                        selectBtn.innerHTML = '<i class="fas fa-check"></i> Current';
                        selectBtn.classList.add('btn-success');
                        selectBtn.classList.remove('btn-primary');
                    }
                    
                    // Add active badge if not present
                    const modelNameEl = item.querySelector('.model-name');
                    if (modelNameEl && !modelNameEl.querySelector('.model-badge')) {
                        modelNameEl.innerHTML += ' <span class="model-badge model-active">Active</span>';
                    }
                } else {
                    item.classList.remove('active');
                    
                    // Reset other select buttons
                    const selectBtn = item.querySelector('.select-model') || 
                                       item.querySelector('.select-model-btn');
                                       
                    if (selectBtn) {
                        selectBtn.innerHTML = '<i class="fas fa-check"></i>';
                        selectBtn.classList.add('btn-primary');
                        selectBtn.classList.remove('btn-success');
                    }
                    
                    // Remove active badge if present
                    const modelBadge = item.querySelector('.model-badge.model-active');
                    if (modelBadge) {
                        modelBadge.remove();
                    }
                }
            });
            
            // Close sidebar after a short delay to allow visual feedback
            setTimeout(() => {
                modelManagementSidebar.classList.remove('active');
            }, 500);
            
            // Generate user-friendly message based on model family/type
            let modelTypeMessage = '';
            const modelObj = models.find(m => m.name === modelName);
            if (modelObj) {
                const family = modelObj.family || detectModelFamily(modelName);
                const sizeCategory = getModelSizeCategory(modelObj);
                
                if (family === 'llama' && sizeCategory === 'large') {
                    modelTypeMessage = ' - Great for complex reasoning tasks';
                } else if (family === 'mistral') {
                    modelTypeMessage = ' - Balanced performance for most tasks';
                } else if (family === 'gemma' && sizeCategory === 'small') {
                    modelTypeMessage = ' - Fast and efficient';
                }
            }
            
            // Show notification
            showNotification(`Model ${modelName} selected${modelTypeMessage}`);
            
            // Add additional model-specific parameter adjustments if needed
            adjustParametersForModel(modelName);
        }
    }
    
    /**
     * Adjust parameters based on selected model
     */
    function adjustParametersForModel(modelName) {
        // Get model-specific optimal parameters if available
        const modelObj = models.find(m => m.name === modelName);
        if (!modelObj || !modelObj.parameters) return;
        
        // Check if parameter controls exist in the page
        const temperatureSlider = document.getElementById('temperature-slider');
        const topPSlider = document.getElementById('top-p-slider');
        const topKSlider = document.getElementById('top-k-slider');
        const repetitionPenaltySlider = document.getElementById('repetition-penalty-slider');
        
        if (!temperatureSlider && !topPSlider && !topKSlider && !repetitionPenaltySlider) {
            // Parameter controls not found
            return;
        }
        
        // Create a smooth transition for parameters
        const paramTransition = document.createElement('div');
        paramTransition.className = 'param-transition-indicator';
        paramTransition.innerHTML = '<i class="fas fa-sliders-h"></i> Optimizing parameters...';
        document.body.appendChild(paramTransition);
        
        setTimeout(() => {
            // Apply parameters from model if available
            const params = modelObj.parameters;
            
            // Only change parameters if they have recommended values for this model
            if (params.temperature && temperatureSlider) {
                temperatureSlider.value = params.temperature;
                temperatureSlider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            if (params.top_p && topPSlider) {
                topPSlider.value = params.top_p;
                topPSlider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            if (params.top_k && topKSlider) {
                topKSlider.value = params.top_k;
                topKSlider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            if (params.repetition_penalty && repetitionPenaltySlider) {
                repetitionPenaltySlider.value = params.repetition_penalty;
                repetitionPenaltySlider.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            // Remove transition indicator
            paramTransition.classList.add('fade-out');
            setTimeout(() => paramTransition.remove(), 500);
            
        }, 300);
    }
    
    /**
     * Download a new model with real-time progress updates
     */
    async function downloadModel() {
        try {
            const name = modelNameInput.value.trim();
            
            if (!name) {
                showNotification('Please enter a model name', 'error');
                return;
            }
            
            // Show progress
            downloadProgress.style.display = 'block';
            progressBar.style.width = '0%';
            const downloadStatusText = document.getElementById('download-status-text');
            const downloadEstimate = document.getElementById('download-estimate');
            const progressText = document.getElementById('progress-text');
            const downloadSpeed = document.getElementById('download-speed');
            
            downloadStatusText.textContent = 'Starting download...';
            progressText.textContent = '0%';
            downloadEstimate.textContent = '';
            downloadSpeed.textContent = '';
            downloadModelBtn.disabled = true;
            
            // Try both API endpoints
            let response;
            try {
                response = await fetch('/api/models/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name
                    })
                });
            } catch (e) {
                // Try fallback endpoint
                response = await fetch('/model-management/api/models/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name
                    })
                });
            }
            
            if (!response.ok) {
                throw new Error(`Failed to download model: ${response.status}`);
            }
            
            // Use EventSource for real-time progress updates if available
            if (typeof EventSource !== 'undefined' && window.location.protocol !== 'file:') {
                const downloadTime = Date.now();
                let lastProgress = 0;
                let startTime = Date.now();
                
                try {
                    const progressSource = new EventSource(`/model-management/api/models/download/progress?name=${encodeURIComponent(name)}`);
                    
                    progressSource.onmessage = function(event) {
                        try {
                            const data = JSON.parse(event.data);
                            
                            if (data.status === 'downloading') {
                                // Update progress
                                const percent = data.progress || 0;
                                progressBar.style.width = `${percent}%`;
                                progressText.textContent = `${Math.round(percent)}%`;
                                downloadStatusText.textContent = 'Downloading model...';
                                
                                // Calculate download speed
                                const currentTime = Date.now();
                                const timeDiff = (currentTime - startTime) / 1000; // in seconds
                                if (timeDiff > 0 && percent > lastProgress) {
                                    const progressDiff = percent - lastProgress;
                                    const downloadSize = data.total_size || 0;
                                    const downloadedBytes = (downloadSize * progressDiff / 100);
                                    const speed = downloadedBytes / timeDiff; // bytes per second
                                    downloadSpeed.textContent = `${formatSpeed(speed)}`;
                                    
                                    // Estimate remaining time
                                    const remaining = (100 - percent) / progressDiff * timeDiff;
                                    downloadEstimate.textContent = `${formatTime(remaining)} remaining`;
                                    
                                    // Reset for next calculation
                                    startTime = currentTime;
                                    lastProgress = percent;
                                }
                            } else if (data.status === 'completed') {
                                // Download complete
                                progressSource.close();
                                progressBar.style.width = '100%';
                                progressText.textContent = '100%';
                                downloadStatusText.textContent = 'Download complete!';
                                downloadSpeed.textContent = '';
                                downloadEstimate.textContent = '';
                                
                                setTimeout(() => {
                                    downloadProgress.style.display = 'none';
                                    downloadModelBtn.disabled = false;
                                    modelNameInput.value = '';
                                    loadModels(); // Refresh models list
                                    showNotification(`Model ${name} downloaded successfully`);
                                }, 2000);
                            } else if (data.status === 'error') {
                                throw new Error(data.message || 'Download failed');
                            }
                        } catch (parseError) {
                            logDebug('Error parsing progress data:', parseError);
                        }
                    };
                    
                    progressSource.onerror = function() {
                        progressSource.close();
                        
                        // Fall back to polling if SSE fails
                        startPollingProgress(name);
                    };
                } catch (sseError) {
                    logDebug('EventSource error:', sseError);
                    
                    // Fall back to polling if SSE fails
                    startPollingProgress(name);
                }
            } else {
                // Fall back to polling if EventSource is not supported
                startPollingProgress(name);
            }
        } catch (error) {
            logDebug('Error downloading model:', error);
            showNotification(`Error: ${error.message}`, 'error');
            downloadProgress.style.display = 'none';
            downloadModelBtn.disabled = false;
        }
    }
    
    /**
     * Fall back to polling for progress updates
     */
    function startPollingProgress(modelName) {
        let startTime = Date.now();
        let progressPercent = 0;
        const checkInterval = 1000; // Check every second
        const downloadStatusText = document.getElementById('download-status-text');
        const progressText = document.getElementById('progress-text');
        
        downloadStatusText.textContent = 'Downloading model... (polling mode)';
        
        // Start polling for progress
        const progressInterval = setInterval(async () => {
            try {
                // Try both endpoints
                let progressResponse = await fetch(`/api/models/${encodeURIComponent(modelName)}`);
                if (!progressResponse.ok) {
                    progressResponse = await fetch(`/model-management/api/models/version?name=${encodeURIComponent(modelName)}`);
                }
                
                if (progressResponse.ok) {
                    const data = await progressResponse.json();
                    
                    // Check if model exists and is ready
                    if (data.status === 'success' || (data.info && data.info.status !== 'downloading')) {
                        // Model exists, download complete
                        clearInterval(progressInterval);
                        progressBar.style.width = '100%';
                        progressText.textContent = '100%';
                        downloadStatusText.textContent = 'Download complete!';
                        
                        setTimeout(() => {
                            downloadProgress.style.display = 'none';
                            downloadModelBtn.disabled = false;
                            modelNameInput.value = '';
                            loadModels(); // Refresh models list
                            showNotification(`Model ${modelName} downloaded successfully`);
                        }, 2000);
                    } else {
                        // Still downloading, simulate progress
                        // Increase the progress at a decreasing rate to simulate slowing down
                        // but never quite reaching 100% until confirmed complete
                        if (progressPercent < 90) {
                            const elapsed = (Date.now() - startTime) / 1000; // seconds
                            progressPercent = Math.min(90, Math.round(100 * (1 - Math.exp(-elapsed/120))));
                            progressBar.style.width = `${progressPercent}%`;
                            progressText.textContent = `${progressPercent}%`;
                        }
                    }
                }
            } catch (error) {
                logDebug('Error checking download progress:', error);
            }
        }, checkInterval);
    }
    
    /**
     * Format download speed in human-readable form
     */
    function formatSpeed(bytesPerSecond) {
        if (bytesPerSecond < 1024) {
            return `${bytesPerSecond.toFixed(1)} B/s`;
        } else if (bytesPerSecond < 1024 * 1024) {
            return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
        } else if (bytesPerSecond < 1024 * 1024 * 1024) {
            return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
        } else {
            return `${(bytesPerSecond / (1024 * 1024 * 1024)).toFixed(1)} GB/s`;
        }
    }
    
    /**
     * Format time in human-readable form
     */
    function formatTime(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)} sec`;
        } else if (seconds < 3600) {
            return `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} sec`;
        } else {
            return `${Math.floor(seconds / 3600)} hr ${Math.floor((seconds % 3600) / 60)} min`;
        }
    }
    
    /**
     * Filter models based on search term and filters
     */
    function filterModels() {
        // Apply filters and render
        filterAndRenderModels();
        
        // Save preferences
        saveUserPreferences();
    }
    
    /**
     * Show model settings modal
     */
    function showModelSettings(modelName) {
        const modal = document.getElementById('model-settings-modal');
        if (!modal) return;
        
        // Find model data
        const modelObj = models.find(m => m.name === modelName);
        if (!modelObj) {
            showNotification('Model data not found', 'error');
            return;
        }
        
        // Set modal title
        const modalTitle = document.getElementById('model-settings-modal-label');
        if (modalTitle) {
            modalTitle.textContent = `${modelName} Settings`;
        }
        
        // Get parameter controls container
        const parameterControls = document.getElementById('parameter-controls');
        if (!parameterControls) return;
        
        // Clear existing controls
        parameterControls.innerHTML = '';
        
        // Get model parameters
        const params = modelObj.parameters || {};
        
        // Create parameter controls
        const parameterList = [
            {
                name: 'temperature',
                label: 'Temperature',
                min: 0.1,
                max: 1.0,
                step: 0.1,
                defaultValue: params.temperature || 0.7,
                description: 'Controls randomness: lower values are more deterministic, higher values are more creative'
            },
            {
                name: 'top_p',
                label: 'Top P',
                min: 0.1,
                max: 1.0,
                step: 0.05,
                defaultValue: params.top_p || 0.9,
                description: 'Controls diversity via nucleus sampling: 1.0 considers all tokens, lower values consider fewer tokens'
            },
            {
                name: 'top_k',
                label: 'Top K',
                min: 1,
                max: 100,
                step: 1,
                defaultValue: params.top_k || 40,
                description: 'Controls diversity by limiting to the top K tokens: higher values allow more diversity'
            },
            {
                name: 'repetition_penalty',
                label: 'Repetition Penalty',
                min: 1.0,
                max: 2.0,
                step: 0.1,
                defaultValue: params.repetition_penalty || 1.1,
                description: 'Penalizes repeated tokens: 1.0 means no penalty, higher values discourage repetition'
            }
        ];
        
        // Add controls
        for (const param of parameterList) {
            const paramHtml = createParameterControl(param);
            parameterControls.innerHTML += paramHtml;
        }
        
        // Setup recommended uses
        const recommendedUses = document.getElementById('recommended-uses');
        if (recommendedUses) {
            setupRecommendedUses(modelObj, recommendedUses);
        }
        
        // Add event listeners to preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const preset = this.getAttribute('data-preset');
                applyPreset(preset, parameterControls);
                
                // Update active state
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Add event listeners to parameter sliders
        document.querySelectorAll('#parameter-controls input[type="range"]').forEach(slider => {
            slider.addEventListener('input', function() {
                const valueDisplay = this.parentElement.querySelector('.parameter-value');
                if (valueDisplay) {
                    valueDisplay.textContent = this.value;
                }
                
                // Update parameter marker
                const marker = this.parentElement.parentElement.querySelector('.parameter-marker');
                if (marker) {
                    const percent = (this.value - this.min) / (this.max - this.min) * 100;
                    marker.style.left = `${percent}%`;
                }
            });
        });
        
        // Add event listener to save button
        const saveModelSettingsBtn = document.getElementById('save-model-settings');
        if (saveModelSettingsBtn) {
            saveModelSettingsBtn.addEventListener('click', function() {
                saveModelParameters(modelName, parameterControls);
            });
        }
        
        // Show modal using Bootstrap modal or jQuery if available
        if (window.bootstrap && window.bootstrap.Modal) {
            const modalInstance = new window.bootstrap.Modal(modal);
            modalInstance.show();
        } else if (window.$ && window.$.fn.modal) {
            window.$(modal).modal('show');
        } else {
            // Fallback
            modal.style.display = 'block';
            modal.classList.add('show');
        }
    }
    
    /**
     * Create parameter control HTML
     */
    function createParameterControl(param) {
        return `
            <div class="parameter-visual">
                <div class="parameter-header">
                    <span class="parameter-name">${param.label}</span>
                    <span class="parameter-value">${param.defaultValue}</span>
                </div>
                <div class="parameter-slider-container">
                    <span class="parameter-min">${param.min}</span>
                    <div class="parameter-slider">
                        <input type="range" 
                            min="${param.min}" 
                            max="${param.max}" 
                            step="${param.step}" 
                            value="${param.defaultValue}" 
                            data-param="${param.name}"
                            class="form-range">
                    </div>
                    <span class="parameter-max">${param.max}</span>
                </div>
                <div class="parameter-description">${param.description}</div>
                <div class="parameter-visual-guide">
                    <div class="parameter-marker" style="left: ${((param.defaultValue - param.min) / (param.max - param.min)) * 100}%"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup recommended uses based on model
     */
    function setupRecommendedUses(model, container) {
        // Clear container
        container.innerHTML = '';
        
        // Default recommended uses based on model family
        const family = model.family || detectModelFamily(model.name);
        const sizeCategory = getModelSizeCategory(model);
        
        const recommendations = [];
        
        // Add family-specific recommendations
        if (family === 'llama') {
            if (sizeCategory === 'large') {
                recommendations.push('Complex reasoning', 'Long-form content', 'Technical writing');
            } else {
                recommendations.push('General text generation', 'Creative writing');
            }
        } else if (family === 'mistral') {
            recommendations.push('Balanced performance', 'Instruction following');
            if (sizeCategory === 'medium' || sizeCategory === 'large') {
                recommendations.push('Complex tasks');
            }
        } else if (family === 'gemma') {
            if (sizeCategory === 'small') {
                recommendations.push('Quick responses', 'Simple tasks', 'Mobile devices');
            } else {
                recommendations.push('Balanced text generation', 'Efficient performance');
            }
        } else if (family === 'phi') {
            recommendations.push('Code generation', 'Logical reasoning');
        } else if (family === 'zephyr') {
            recommendations.push('Chat applications', 'Conversational responses');
        }
        
        // Add recommendations from model parameters if available
        if (model.parameters && model.parameters.prompt_guide && model.parameters.prompt_guide.use_case) {
            const useCase = model.parameters.prompt_guide.use_case;
            const useCases = useCase.split(',').map(uc => uc.trim());
            for (const uc of useCases) {
                if (!recommendations.includes(uc)) {
                    recommendations.push(uc);
                }
            }
        }
        
        // Render recommendations
        for (const rec of recommendations) {
            container.innerHTML += `<div class="recommended-item">${rec}</div>`;
        }
    }
    
    /**
     * Apply preset to parameters
     */
    function applyPreset(preset, container) {
        // Define presets
        const presets = {
            balanced: {
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                repetition_penalty: 1.1
            },
            creative: {
                temperature: 0.9,
                top_p: 0.95,
                top_k: 50,
                repetition_penalty: 1.0
            },
            precise: {
                temperature: 0.3,
                top_p: 0.7,
                top_k: 20,
                repetition_penalty: 1.2
            },
            fast: {
                temperature: 0.5,
                top_p: 0.8,
                top_k: 30,
                repetition_penalty: 1.1
            }
        };
        
        // Get preset values
        const values = presets[preset];
        if (!values) return;
        
        // Apply to sliders
        for (const [param, value] of Object.entries(values)) {
            const slider = container.querySelector(`input[data-param="${param}"]`);
            if (slider) {
                slider.value = value;
                
                // Update value display
                const valueDisplay = slider.parentElement.parentElement.parentElement.querySelector('.parameter-value');
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
                
                // Update parameter marker
                const marker = slider.parentElement.parentElement.parentElement.querySelector('.parameter-marker');
                if (marker) {
                    const percent = (value - slider.min) / (slider.max - slider.min) * 100;
                    marker.style.left = `${percent}%`;
                }
            }
        }
    }
    
    /**
     * Save model parameters
     */
    function saveModelParameters(modelName, container) {
        try {
            // Get model
            const modelObj = models.find(m => m.name === modelName);
            if (!modelObj) {
                showNotification('Model not found', 'error');
                return;
            }
            
            // Initialize parameters object if not exists
            if (!modelObj.parameters) {
                modelObj.parameters = {};
            }
            
            // Get parameters from sliders
            const sliders = container.querySelectorAll('input[type="range"]');
            for (const slider of sliders) {
                const param = slider.getAttribute('data-param');
                const value = parseFloat(slider.value);
                
                // Update model parameters
                modelObj.parameters[param] = value;
            }
            
            // Save to localStorage
            try {
                // Get stored model settings
                let modelSettings = {};
                const storedSettings = localStorage.getItem('freethinkers-model-settings');
                if (storedSettings) {
                    modelSettings = JSON.parse(storedSettings);
                }
                
                // Update settings for this model
                modelSettings[modelName] = modelObj.parameters;
                
                // Save back to localStorage
                localStorage.setItem('freethinkers-model-settings', JSON.stringify(modelSettings));
                
                // Show success notification
                showNotification(`Parameters for ${modelName} saved successfully`);
                
                // Close modal
                const modal = document.getElementById('model-settings-modal');
                if (modal) {
                    if (window.bootstrap && window.bootstrap.Modal) {
                        const modalInstance = window.bootstrap.Modal.getInstance(modal);
                        if (modalInstance) modalInstance.hide();
                    } else if (window.$ && window.$.fn.modal) {
                        window.$(modal).modal('hide');
                    } else {
                        // Fallback
                        modal.style.display = 'none';
                        modal.classList.remove('show');
                    }
                }
                
                // Update global parameters if this is the current model
                if (modelName === currentModel) {
                    adjustParametersForModel(modelName);
                }
                
            } catch (e) {
                logDebug('Error saving settings to localStorage:', e);
                showNotification('Error saving settings: ' + e.message, 'error');
            }
            
        } catch (error) {
            logDebug('Error saving model parameters:', error);
            showNotification('Error saving parameters: ' + error.message, 'error');
        }
    }
    
    /**
     * Open registry modal to browse available models
     */
    function openRegistryModal() {
        // Get modal
        const modal = document.getElementById('model-registry-modal');
        if (!modal) return;
        
        // Show loading
        if (registryModelsList) {
            registryModelsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading registry...</div>';
        }
        
        // Show modal
        if (window.bootstrap && window.bootstrap.Modal) {
            const modalInstance = new window.bootstrap.Modal(modal);
            modalInstance.show();
        } else if (window.$ && window.$.fn.modal) {
            window.$(modal).modal('show');
        } else {
            // Fallback
            modal.style.display = 'block';
            modal.classList.add('show');
        }
        
        // Load registry models
        loadRegistryModels();
    }
    
    /**
     * Load available models from Ollama registry
     */
    async function loadRegistryModels() {
        try {
            if (!registryModelsList) return;
            
            // Populate with some known models if we can't fetch from registry
            const knownModels = [
                { name: 'llama3:latest', description: 'Meta\'s LLaMA 3 8B model, latest version' },
                { name: 'llama3:8b', description: 'Meta\'s LLaMA 3 8B model' },
                { name: 'mistral:latest', description: 'Mistral 7B model, good all-around performer' },
                { name: 'mistral:7b', description: 'Mistral 7B model, specific version' },
                { name: 'gemma3:1b', description: 'Google\'s Gemma3 1B model, small and efficient' },
                { name: 'gemma:7b', description: 'Google\'s Gemma 7B model, more powerful' },
                { name: 'phi3:latest', description: 'Microsoft\'s Phi-3 model, impressive for its size' },
                { name: 'phi3:3.8b', description: 'Microsoft\'s Phi-3 3.8B model, specific version' }
            ];
            
            // Try to fetch from registry API if available
            try {
                const response = await fetch('https://ollama.ai/api/registry');
                if (response.ok) {
                    const data = await response.json();
                    registryModels = data.models || [];
                } else {
                    // Use known models as fallback
                    registryModels = knownModels;
                }
            } catch (e) {
                logDebug('Error fetching registry models:', e);
                // Use known models as fallback
                registryModels = knownModels;
            }
            
            // Filter models (if search is active)
            filterRegistryModels();
            
        } catch (error) {
            logDebug('Error loading registry models:', error);
            if (registryModelsList) {
                registryModelsList.innerHTML = `<div class="error">Error loading registry: ${error.message}</div>`;
            }
        }
    }
    
    /**
     * Filter registry models based on search term
     */
    function filterRegistryModels() {
        if (!registryModelsList) return;
        
        const searchTerm = registrySearchInput ? registrySearchInput.value.toLowerCase() : '';
        
        // Filter models
        const filteredRegistry = registryModels.filter(model => {
            if (!searchTerm) return true;
            
            // Search in name and description
            return model.name.toLowerCase().includes(searchTerm) || 
                   (model.description && model.description.toLowerCase().includes(searchTerm));
        });
        
        // Render models
        if (filteredRegistry.length === 0) {
            registryModelsList.innerHTML = '<div class="empty-state">No models match your search</div>';
            return;
        }
        
        // Generate HTML
        let html = '';
        for (const model of filteredRegistry) {
            html += createRegistryModelItem(model);
        }
        
        registryModelsList.innerHTML = html;
        
        // Add event listeners to download buttons
        document.querySelectorAll('.registry-model-item .download-model-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const modelName = this.getAttribute('data-model');
                if (modelName) {
                    // Update input field
                    if (modelNameInput) {
                        modelNameInput.value = modelName;
                    }
                    
                    // Close modal
                    const modal = document.getElementById('model-registry-modal');
                    if (modal) {
                        if (window.bootstrap && window.bootstrap.Modal) {
                            const modalInstance = window.bootstrap.Modal.getInstance(modal);
                            if (modalInstance) modalInstance.hide();
                        } else if (window.$ && window.$.fn.modal) {
                            window.$(modal).modal('hide');
                        } else {
                            // Fallback
                            modal.style.display = 'none';
                            modal.classList.remove('show');
                        }
                    }
                    
                    // Start download (with a slight delay to allow modal to close)
                    setTimeout(() => {
                        downloadModel();
                    }, 300);
                }
            });
        });
    }
    
    /**
     * Create registry model item HTML
     */
    function createRegistryModelItem(model) {
        return `
            <div class="registry-model-item">
                <div class="registry-model-info">
                    <div class="registry-model-name">${model.name}</div>
                    <div class="registry-model-description">${model.description || 'No description available'}</div>
                </div>
                <div class="registry-model-actions">
                    <button class="btn btn-sm btn-primary download-model-btn" data-model="${model.name}">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Show a notification message
     * @param {string} message - The message to show
     * @param {string} type - The notification type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds to show the notification
     */
    function showNotification(message, type = 'success', duration = 3000) {
        // Use the global notification system if available
        if (window.showToast) {
            // Use toast for model changes (matches Free Thinkers UI)
            window.showToast(message, type, duration);
            return;
        } else if (window.showNotification && window.showNotification !== showNotification) {
            // Fallback to the standard notification (avoid recursion)
            window.showNotification(message, type, duration);
            return;
        }
        
        // Legacy fallback if notification system is not available
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i> ';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i> ';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i> ';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle"></i> ';
                break;
        }
        
        notification.innerHTML = icon + message;
        
        // Make sure we have notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 1rem;
                color: white;
                border-radius: 0.375rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s, transform 0.3s;
                max-width: 300px;
                z-index: 2000;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .notification i {
                font-size: 1.2rem;
            }
            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            .notification-success { background-color: #198754; }
            .notification-error { background-color: #dc3545; }
            .notification-warning { background-color: #ffc107; color: #212529; }
            .notification-info { background-color: #0dcaf0; }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
    
    /**
     * Format bytes to human-readable format
     */
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    /**
     * Track model usage
     * @param {string} modelName - The name of the model to track
     */
    function trackModelUsage(modelName) {
        try {
            // Get current usage stats
            let usageStats = {};
            const storedStats = localStorage.getItem('freethinkers-model-usage');
            if (storedStats) {
                usageStats = JSON.parse(storedStats);
            }
            
            // Init or update model stats
            if (!usageStats[modelName]) {
                usageStats[modelName] = {
                    useCount: 1,
                    firstUsed: new Date().toISOString(),
                    lastUsed: new Date().toISOString(),
                    totalResponseTime: 0,
                    averageResponseTime: 0,
                    responseTimes: []
                };
            } else {
                usageStats[modelName].useCount++;
                usageStats[modelName].lastUsed = new Date().toISOString();
            }
            
            // Save usage stats
            localStorage.setItem('freethinkers-model-usage', JSON.stringify(usageStats));
            
            // Update the model usage stats display if it's visible
            updateModelUsageStats();
        } catch (error) {
            logDebug('Error tracking model usage:', error);
        }
    }

    /**
     * Update model usage statistics display
     */
    function updateModelUsageStats() {
        const statsContainer = document.getElementById('model-usage-stats');
        if (!statsContainer) return;
        
        try {
            // Get usage stats
            let usageStats = {};
            const storedStats = localStorage.getItem('freethinkers-model-usage');
            if (storedStats) {
                usageStats = JSON.parse(storedStats);
            }
            
            // Check if we have any stats
            if (Object.keys(usageStats).length === 0) {
                statsContainer.innerHTML = '<div class="stats-placeholder">No usage data available yet</div>';
                return;
            }
            
            // Sort models by use count (most used first)
            const sortedModels = Object.entries(usageStats)
                .sort(([, a], [, b]) => b.useCount - a.useCount);
            
            // Generate HTML
            let html = '';
            for (const [modelName, stats] of sortedModels) {
                // Format last used date
                let lastUsed = 'Never';
                try {
                    if (stats.lastUsed) {
                        const date = new Date(stats.lastUsed);
                        lastUsed = date.toLocaleString();
                    }
                } catch (e) {
                    logDebug('Error formatting date:', e);
                }
                
                html += `
                    <div class="usage-stat-item">
                        <div class="stat-model-info">
                            <span class="stat-model-name">${modelName}</span>
                            <span class="stat-model-count">${stats.useCount} uses</span>
                        </div>
                        <div class="stat-details">
                            Last used: ${lastUsed}
                        </div>
                    </div>
                `;
            }
            
            statsContainer.innerHTML = html;
            
        } catch (error) {
            logDebug('Error updating model usage stats:', error);
            statsContainer.innerHTML = '<div class="stats-placeholder">Error loading usage statistics</div>';
        }
    }

    /**
     * Reset model usage statistics
     */
    function resetModelStats() {
        try {
            // Clear stats
            localStorage.removeItem('freethinkers-model-usage');
            
            // Update display
            updateModelUsageStats();
            
            // Show notification
            showNotification('Model usage statistics have been reset');
        } catch (error) {
            logDebug('Error resetting model stats:', error);
            showNotification('Error resetting model statistics', 'error');
        }
    }
    
    // Add reset stats button functionality
    const resetModelStatsBtn = document.getElementById('reset-model-stats');
    if (resetModelStatsBtn) {
        resetModelStatsBtn.addEventListener('click', resetModelStats);
    }
    
    // Initialize stats display
    updateModelUsageStats();
});
