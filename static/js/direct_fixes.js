/**
 * Direct Fixes for Free Thinkers
 * This file contains direct fixes for UI elements that aren't working properly
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Applying direct fixes...');
    
    // Add emergency CSS overrides for all components
    const style = document.createElement('style');
    style.innerHTML = `
        /* Force sidebar visibility */
        .sidebar.active {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            right: 0 !important;
            height: 100% !important;
            overflow-y: auto !important;
            z-index: 10000 !important;
        }
        
        /* Force model sidebar visibility */
        .model-management-sidebar.active {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            right: 0 !important;
            height: 100% !important;
            overflow-y: auto !important;
            z-index: 10000 !important;
        }
        
        /* Force parameter sidebar visibility */
        .parameter-controls-sidebar.active {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            right: 0 !important;
            height: 100% !important;
            overflow-y: auto !important;
            z-index: 10000 !important;
        }
        
        /* Force conversation sidebar visibility */
        .conversation-manager-sidebar.active {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            right: 0 !important;
            height: 100% !important;
            overflow-y: auto !important;
            z-index: 10000 !important;
        }
        
        /* Force models section visibility */
        .models-overview-section {
            display: block !important;
            visibility: visible !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 1rem !important;
        }
        
        /* Make models list visible */
        #modelsList {
            display: block !important;
            visibility: visible !important;
            min-height: 400px !important;
            height: auto !important;
            overflow-y: auto !important;
            padding: 10px !important;
            background-color: #f8f9fa !important;
            border-radius: 4px !important;
            opacity: 1 !important;
        }
        
        /* Ensure model list content is visible with !important */
        #modelsList > div {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        /* Force model items to be visible */
        .model-item {
            display: flex !important;
            visibility: visible !important;
            padding: 10px !important;
            margin-bottom: 10px !important;
            border: 1px solid #dee2e6 !important;
            border-radius: 4px !important;
            background-color: white !important;
            opacity: 1 !important;
        }
        
        /* Force model components to be visible */
        .model-info, .model-actions, .model-name, .model-meta, .model-meta-item, .model-badges {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        /* Template selector visibility */
        #template-selector {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
        }
        
        /* Conversations list visibility */
        #conversations-list {
            display: block !important;
            visibility: visible !important;
            min-height: 200px !important;
            overflow-y: auto !important;
        }
        
        /* Categories list visibility */
        #categories-list {
            display: block !important;
            visibility: visible !important;
            margin-bottom: 1rem !important;
        }
        
        /* Dark mode overrides */
        body.dark-mode .model-item {
            background-color: #333 !important;
            border-color: #444 !important;
        }
        
        body.dark-mode #modelsList {
            background-color: #222 !important;
        }
        
        body.dark-mode .sidebar.active {
            background-color: #222 !important;
            color: #f8f9fa !important;
        }
    `;
    document.head.appendChild(style);
    console.log('Added emergency CSS overrides for all sidebars');
    
    // Fix models display whenever the API response comes back
    const originalLoadModels = window.loadModels;
    if (originalLoadModels) {
        window.loadModels = function() {
            // Call the original function
            const result = originalLoadModels.apply(this, arguments);
            
            // Add a delay to fix models display after they load
            setTimeout(fixModelDisplay, 100);
            setTimeout(fixModelDisplay, 500);
            setTimeout(fixModelDisplay, 1000);
            
            return result;
        };
        
        console.log('Wrapped loadModels function to apply display fixes');
    }
    
    // Function to fix model display issues
    function fixModelDisplay() {
        console.log('Fixing model display issues');
        
        const modelsList = document.getElementById('modelsList');
        if (!modelsList) {
            console.error('modelsList not found for display fix');
            return;
        }
        
        // Force container to be visible
        modelsList.style.display = 'block';
        modelsList.style.visibility = 'visible';
        modelsList.style.opacity = '1';
        
        // Get all model items
        const modelItems = document.querySelectorAll('.model-item');
        console.log(`Found ${modelItems.length} model items to fix`);
        
        // Fix each model item
        modelItems.forEach(item => {
            item.style.display = 'flex';
            item.style.visibility = 'visible';
            item.style.opacity = '1';
            
            // Fix info section
            const info = item.querySelector('.model-info');
            if (info) {
                info.style.display = 'block';
                info.style.visibility = 'visible';
                info.style.opacity = '1';
                info.style.flex = '1';
            }
            
            // Fix actions section
            const actions = item.querySelector('.model-actions');
            if (actions) {
                actions.style.display = 'flex';
                actions.style.visibility = 'visible';
                actions.style.opacity = '1';
            }
        });
    }
    
    // Fix all sidebars on page load
    initializeSidebars();
    
    // Fix for templates - initialize after delay
    setTimeout(function() {
        initializeTemplatesUI();
    }, 1000);
    
    // Fix model display issues after a short delay
    setTimeout(fixModelDisplay, 1000);
    setTimeout(fixModelDisplay, 2000);
    
    // Fix for conversation manager
    setTimeout(function() {
        initializeConversationManager();
    }, 1500);
    
    // Create direct overrides for model list rendering to ensure models display
    const setupModelRenderingOverrides = function() {
        // Override createModelList if it exists
        if (window.createModelList) {
            const originalCreateModelList = window.createModelList;
            window.createModelList = function() {
                console.log('Calling overridden createModelList');
                const result = originalCreateModelList.apply(this, arguments);
                setTimeout(fixModelDisplay, 10);
                setTimeout(fixModelDisplay, 100);
                return result;
            };
            console.log('Overrode createModelList function for better display');
        }
        
        // Override filterAndRenderModels which is the main rendering function
        if (window.filterAndRenderModels) {
            const originalFilterAndRender = window.filterAndRenderModels;
            window.filterAndRenderModels = function() {
                console.log('Calling overridden filterAndRenderModels');
                const result = originalFilterAndRender.apply(this, arguments);
                
                // Apply more aggressive fixes after rendering
                setTimeout(() => {
                    const modelsList = document.getElementById('modelsList');
                    if (!modelsList) return;
                    
                    // Force direct HTML if needed
                    const items = modelsList.querySelectorAll('.model-item');
                    if (items.length === 0 && window.models && window.models.length > 0) {
                        console.log('No model items found despite models being available. Forcing direct HTML rendering.');
                        
                        let html = '';
                        window.models.forEach(model => {
                            html += `
                                <div class="model-item" data-model="${model.name}" style="display:flex !important; visibility:visible !important;">
                                    <div class="model-info" style="display:block !important; visibility:visible !important; flex:1;">
                                        <div class="model-name" style="display:block !important; visibility:visible !important;">${model.name}</div>
                                    </div>
                                    <div class="model-actions" style="display:flex !important; visibility:visible !important;">
                                        <button class="btn btn-sm btn-primary select-model" title="Use this model">
                                            <i class="fas fa-check"></i>
                                        </button>
                                    </div>
                                </div>
                            `;
                        });
                        
                        modelsList.innerHTML = html;
                    }
                    
                    // Still apply the regular fix
                    fixModelDisplay();
                }, 100);
                
                return result;
            };
            console.log('Overrode filterAndRenderModels function for better display');
        }
    };
    
    // Apply overrides after a short delay
    setTimeout(setupModelRenderingOverrides, 500);
    
    // Fix for history button
    const historyBtn = document.getElementById('history-btn');
    const historySidebar = document.getElementById('history-sidebar');
    
    if (historyBtn && historySidebar) {
        console.log('Setting up direct history button handler');
        historyBtn.addEventListener('click', function() {
            console.log('History button clicked');
            closeAllSidebars();
            historySidebar.classList.toggle('active');
        });
        
        // Also set up close button
        const closeHistoryBtn = historySidebar.querySelector('.btn-close');
        if (closeHistoryBtn) {
            closeHistoryBtn.addEventListener('click', function() {
                historySidebar.classList.remove('active');
            });
        }
    }
    
    // Fix for parameters button
    const paramBtn = document.getElementById('parameter-controls-btn');
    const paramSidebar = document.getElementById('parameter-controls-sidebar');
    
    if (paramBtn && paramSidebar) {
        console.log('Setting up direct parameter button handler');
        paramBtn.addEventListener('click', function() {
            console.log('Parameter button clicked');
            closeAllSidebars();
            paramSidebar.classList.toggle('active');
        });
        
        // Also set up close button
        const closeParamBtn = paramSidebar.querySelector('.btn-close') || 
                              paramSidebar.querySelector('#close-parameter-controls');
        if (closeParamBtn) {
            closeParamBtn.addEventListener('click', function() {
                paramSidebar.classList.remove('active');
            });
        }
    }
    
    // Fix for models button
    const modelBtn = document.getElementById('model-management-btn');
    const modelSidebar = document.getElementById('model-management-sidebar');
    
    // Fix the original model sidebar
    function fixModelManagementSidebar() {
        console.log('Fixing original model management sidebar');
        
        // Don't create a new sidebar - apply fixes to the existing one
        const modelSidebar = document.getElementById('model-management-sidebar');
        
        if (!modelSidebar) {
            console.error('Cannot find model-management-sidebar to fix');
            return null;
        }
        
        // Save original HTML
        const originalHTML = modelSidebar.innerHTML;
        
        try {
            // 1. Apply CSS overrides directly to the sidebar element
            // Create an inline style to ensure visibility
            const style = document.createElement('style');
            style.textContent = `
                /* Force visibility of model sidebar */
                #model-management-sidebar.active {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    right: 0 !important;
                    z-index: 10000 !important;
                    background-color: var(--bg-color, white) !important;
                }
                
                /* Force visibility of model list */
                #modelsList {
                    display: block !important;
                    visibility: visible !important;
                    height: auto !important;
                    min-height: 400px !important;
                    overflow-y: auto !important;
                    background-color: var(--bg-light, #f8f9fa) !important;
                    border-radius: 4px !important;
                }
                
                /* Force visibility of model items */
                .model-item {
                    display: flex !important;
                    visibility: visible !important;
                    background-color: var(--card-bg, white) !important;
                    margin-bottom: 0.75rem !important;
                    border: 1px solid var(--border-color, #dee2e6) !important;
                    border-radius: var(--border-radius, 0.375rem) !important;
                    padding: 0.75rem !important;
                }
                
                /* Force model info visibility */
                .model-info {
                    display: block !important;
                    visibility: visible !important;
                    flex: 1 !important;
                }
                
                /* Force model actions visibility */
                .model-actions {
                    display: flex !important;
                    visibility: visible !important;
                }
                
                /* Make section headers visible */
                .section-header {
                    display: flex !important;
                    visibility: visible !important;
                    justify-content: space-between !important;
                    margin-bottom: 1rem !important;
                }
                
                /* Dark mode compatibility */
                body.dark-mode #model-management-sidebar.active {
                    background-color: var(--dark-bg, #212529) !important;
                    color: var(--dark-text, #f8f9fa) !important;
                }
                
                body.dark-mode .model-item {
                    background-color: var(--dark-bg-light, #343a40) !important;
                    border-color: var(--dark-border, #444) !important;
                }
                
                body.dark-mode #modelsList {
                    background-color: var(--dark-bg, #212529) !important;
                }
            `;
            
            document.head.appendChild(style);
            
            // 2. Apply important styling directly to the sidebar
            modelSidebar.style.display = 'block';
            modelSidebar.style.visibility = 'visible';
            modelSidebar.style.opacity = '1';
            
            // Find model list container
            const modelsList = document.getElementById('modelsList');
            
            if (!modelsList) {
                console.warn('Sidebar exists but modelsList not found, trying to create it');
                
                // Find the models section where it should be
                const modelsSection = modelSidebar.querySelector('.models-overview-section');
                if (modelsSection) {
                    const newModelsList = document.createElement('div');
                    newModelsList.id = 'modelsList';
                    newModelsList.className = 'models-list';
                    newModelsList.style.cssText = 'display: block !important; visibility: visible !important;';
                    modelsSection.appendChild(newModelsList);
                    
                    console.log('Created missing modelsList container');
                } else {
                    console.error('Could not find models-overview-section to add modelsList');
                }
            }
            
            // Log success
            console.log('Applied visibility fixes to original model sidebar');
            
            return modelSidebar;
        } catch (error) {
            console.error('Error fixing model sidebar:', error);
            
            // Try to restore original HTML
            if (originalHTML) {
                modelSidebar.innerHTML = originalHTML;
            }
            
            return null;
        }
    }
    
    // Fix all the sidebars with proper visibility and handlers
    function initializeSidebars() {
        const sidebarElements = {
            'model-management': {
                btnId: 'model-management-btn',
                sidebarId: 'model-management-sidebar',
                closeId: 'close-model-management' 
            },
            'parameter-controls': {
                btnId: 'parameter-controls-btn',
                sidebarId: 'parameter-controls-sidebar',
                closeId: 'close-parameter-controls'
            },
            'conversation-manager': {
                btnId: 'conversation-manager-btn',
                sidebarId: 'conversation-manager-sidebar',
                closeId: 'close-conversation-manager'
            }
        };
        
        for (const [name, ids] of Object.entries(sidebarElements)) {
            const btn = document.getElementById(ids.btnId);
            const sidebar = document.getElementById(ids.sidebarId);
            
            if (btn && sidebar) {
                console.log(`Setting up ${name} button handler`);
                
                // Set up basic styling
                sidebar.style.position = 'fixed';
                sidebar.style.top = '0';
                sidebar.style.height = '100%';
                sidebar.style.zIndex = '1000';
                sidebar.style.overflowY = 'auto';
                
                // Set up button click handler
                btn.addEventListener('click', function() {
                    console.log(`${name} button clicked`);
                    closeAllSidebars();
                    sidebar.classList.toggle('active');
                    
                    // Apply visibility directly
                    if (sidebar.classList.contains('active')) {
                        sidebar.style.display = 'block';
                        sidebar.style.visibility = 'visible';
                        sidebar.style.opacity = '1';
                        sidebar.style.right = '0';
                        
                        // Additional actions for specific sidebars
                        if (name === 'model-management' && window.loadModels) {
                            window.loadModels(true);
                        }
                        if (name === 'conversation-manager' && window.conversationManager) {
                            if (window.conversationManager.loadConversations) {
                                window.conversationManager.loadConversations();
                            }
                        }
                    }
                });
                
                // Set up close button
                const closeBtn = document.querySelector(`#${ids.closeId}, #${ids.sidebarId} .close-btn, #${ids.sidebarId} .btn-close`);
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        sidebar.classList.remove('active');
                    });
                }
            }
        }
    }
    
    // Fix the model button click handler
    function setupModelButtonHandler() {
        const modelBtn = document.getElementById('model-management-btn');
        if (!modelBtn) {
            console.error('Model management button not found');
            return;
        }
        
        // Remove all existing click handlers to prevent duplicate calls
        const newModelBtn = modelBtn.cloneNode(true);
        modelBtn.parentNode.replaceChild(newModelBtn, modelBtn);
        
        // Set up new click handler
        newModelBtn.addEventListener('click', function(event) {
            // Prevent other handlers from running
            event.stopPropagation();
            
            console.log('Model button click - creating EMERGENCY fallback model sidebar');
            
            // Close other sidebars
            closeAllSidebars();
            
            // Create brand new model sidebar to replace the broken one
            createEmergencyModelSidebar();
        });
        
        console.log('Set up fixed model button handler');
    }
    
    // Function to create an emergency fallback model sidebar
    function createEmergencyModelSidebar() {
        console.log("Creating emergency model sidebar replacement");
        
        // First, try to clean up the existing sidebar if it exists
        const existingSidebar = document.getElementById('model-management-sidebar');
        if (existingSidebar) {
            existingSidebar.parentNode.removeChild(existingSidebar);
        }
        
        // Create a brand new sidebar
        const newSidebar = document.createElement('div');
        newSidebar.id = 'model-management-sidebar';
        newSidebar.className = 'model-management-sidebar sidebar active';
        newSidebar.style.cssText = 'display:block !important; visibility:visible !important; position:fixed; top:0; right:0; width:400px; height:100%; z-index:10000; background-color:#fff; box-shadow:-2px 0 10px rgba(0,0,0,0.2); overflow-y:auto;';
        
        // Create sidebar content
        newSidebar.innerHTML = `
            <div class="model-management-header" style="padding:1rem; border-bottom:1px solid #dee2e6; display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0;">Model Management</h3>
                <button id="close-emergency-sidebar" class="btn-close" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>
            
            <div class="model-management-content" style="padding:1rem;">
                <div class="models-overview-section">
                    <div class="section-header" style="margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0;">Available Models</h4>
                        <span id="emergency-models-count">Loading models...</span>
                    </div>
                    
                    <div id="emergency-models-list" style="display:block; min-height:400px; border:1px solid #dee2e6; border-radius:0.25rem; padding:0.5rem; background-color:#f8f9fa;">
                        <div class="loading" style="text-align:center; padding:2rem;">
                            <i class="fas fa-spinner fa-spin"></i> Loading models...
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(newSidebar);
        
        // Set up close button
        const closeBtn = document.getElementById('close-emergency-sidebar');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                newSidebar.classList.remove('active');
                newSidebar.style.display = 'none';
            });
        }
        
        // Load models directly into our emergency container
        loadEmergencyModels();
    }
    
    // Function to load models directly into our emergency container
    async function loadEmergencyModels() {
        try {
            const modelsListContainer = document.getElementById('emergency-models-list');
            const modelsCountDisplay = document.getElementById('emergency-models-count');
            
            if (!modelsListContainer) {
                console.error('Emergency models list container not found');
                return;
            }
            
            // Try to fetch models directly
            const response = await fetch('http://localhost:11434/api/tags');
            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status}`);
            }
            
            const data = await response.json();
            const models = data.models || [];
            
            if (modelsCountDisplay) {
                modelsCountDisplay.textContent = `${models.length} models`;
            }
            
            // No models
            if (models.length === 0) {
                modelsListContainer.innerHTML = '<div style="text-align:center; padding:2rem;">No models found</div>';
                return;
            }
            
            // Create models list HTML
            let html = '';
            models.forEach(model => {
                html += `
                    <div class="emergency-model-item" data-model="${model.name}" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; margin-bottom:0.5rem; border:1px solid #dee2e6; border-radius:0.25rem; background-color:white;">
                        <div class="model-info" style="flex:1;">
                            <div class="model-name" style="font-weight:bold;">${model.name}</div>
                        </div>
                        <div class="model-actions">
                            <button class="select-model-btn btn btn-sm btn-primary" data-model="${model.name}" style="cursor:pointer;">
                                Use Model
                            </button>
                        </div>
                    </div>
                `;
            });
            
            // Set HTML content
            modelsListContainer.innerHTML = html;
            
            // Add click handlers for model selection
            document.querySelectorAll('.select-model-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const modelName = this.getAttribute('data-model');
                    selectEmergencyModel(modelName);
                });
            });
            
        } catch (error) {
            console.error('Error loading emergency models:', error);
            const modelsListContainer = document.getElementById('emergency-models-list');
            if (modelsListContainer) {
                modelsListContainer.innerHTML = `
                    <div style="text-align:center; padding:2rem; color:#dc3545;">
                        <i class="fas fa-exclamation-circle"></i> Error loading models: ${error.message}
                    </div>
                `;
            }
        }
    }
    
    // Function to select a model from our emergency sidebar
    function selectEmergencyModel(modelName) {
        console.log('Selecting model from emergency sidebar:', modelName);
        
        // Find model select
        const modelSelect = document.getElementById('model-select');
        if (!modelSelect) {
            console.error('Model select element not found');
            return;
        }
        
        // Check if model is in options
        let modelExists = false;
        for (let i = 0; i < modelSelect.options.length; i++) {
            if (modelSelect.options[i].value === modelName) {
                modelExists = true;
                break;
            }
        }
        
        // Add option if it doesn't exist
        if (!modelExists) {
            const option = document.createElement('option');
            option.value = modelName;
            option.textContent = modelName;
            modelSelect.appendChild(option);
        }
        
        // Select the model
        modelSelect.value = modelName;
        
        // Trigger change event
        modelSelect.dispatchEvent(new Event('change'));
        
        // Show notification
        alert(`Selected model: ${modelName}`);
        
        // Close sidebar
        const sidebar = document.getElementById('model-management-sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
            sidebar.style.display = 'none';
        }
    }
    
    // Fix templates UI initialization
    function initializeTemplatesUI() {
        console.log('Initializing templates UI');
        
        const templateSelector = document.getElementById('template-selector');
        if (!templateSelector) {
            console.error('Template selector not found');
            return;
        }
        
        // Apply forced visibility
        templateSelector.style.display = 'block';
        templateSelector.style.visibility = 'visible';
        
        // Check if TemplatesUI was initialized
        if (!window.templatesUI) {
            console.log('Creating new TemplatesUI instance');
            window.templatesUI = new TemplatesUI();
            
            // Initialize with current model
            const modelSelect = document.getElementById('model-select') || document.getElementById('modelSelect');
            if (modelSelect && modelSelect.value) {
                window.templatesUI.init(modelSelect.value);
            } else {
                window.templatesUI.init('llama3.2'); // Fallback model
            }
        } else {
            console.log('Reinitializing existing TemplatesUI instance');
            const modelSelect = document.getElementById('model-select') || document.getElementById('modelSelect');
            const modelName = modelSelect ? modelSelect.value : 'llama3.2';
            window.templatesUI.init(modelName);
        }
        
        // Set up model change listener
        const modelSelect = document.getElementById('model-select') || document.getElementById('modelSelect');
        if (modelSelect) {
            modelSelect.addEventListener('change', function() {
                console.log('Model changed to:', this.value);
                if (window.templatesUI) {
                    window.templatesUI.init(this.value);
                }
            });
        }
    }
    
    // Fix conversation manager initialization
    function initializeConversationManager() {
        console.log('Initializing conversation manager');
        
        // Check if conversation manager exists
        const conversationManagerSidebar = document.getElementById('conversation-manager-sidebar');
        if (!conversationManagerSidebar) {
            console.error('Conversation manager sidebar not found');
            return;
        }
        
        // Apply forced visibility
        conversationManagerSidebar.style.display = 'block';
        conversationManagerSidebar.style.visibility = 'visible';
        
        // Create new conversation manager if needed
        if (!window.conversationManager) {
            console.log('Creating new ConversationManager instance');
            window.conversationManager = new ConversationManager();
        } else {
            console.log('Existing ConversationManager found, refreshing it');
            if (typeof window.conversationManager.loadConversations === 'function') {
                try {
                    window.conversationManager.loadConversations();
                } catch (e) {
                    console.error('Error refreshing conversations:', e);
                }
            }
        }
        
        // Set up conversation UI elements
        const categoriesList = document.getElementById('categories-list');
        const conversationsList = document.getElementById('conversations-list');
        
        if (categoriesList && conversationsList) {
            setupConversationUI(categoriesList, conversationsList);
        }
    }
    
    // Set up conversation UI
    function setupConversationUI(categoriesList, conversationsList) {
        // Make sure elements are visible
        categoriesList.style.display = 'block';
        conversationsList.style.display = 'block';
        
        // Initial load of categories and conversations
        if (window.conversationManager) {
            if (window.conversationManager.refreshCategories) {
                window.conversationManager.refreshCategories();
            }
            
            // Render categories
            renderCategories();
            renderConversations();
            
            // Set up button handlers
            setupConversationButtons();
        }
    }
    
    // Render categories
    function renderCategories() {
        if (!window.conversationManager || !window.conversationManager.categories) {
            return;
        }
        
        const categoriesList = document.getElementById('categories-list');
        if (!categoriesList) return;
        
        // Clear the list
        categoriesList.innerHTML = '';
        
        // Add "All" category
        const allCategory = document.createElement('div');
        allCategory.className = 'category-item active';
        allCategory.textContent = 'All Conversations';
        allCategory.dataset.category = 'all';
        categoriesList.appendChild(allCategory);
        
        // Add each category
        window.conversationManager.categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.textContent = category;
            categoryItem.dataset.category = category;
            categoriesList.appendChild(categoryItem);
        });
        
        // Add click handlers
        categoriesList.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', function() {
                // Update active state
                categoriesList.querySelectorAll('.category-item').forEach(i => {
                    i.classList.remove('active');
                });
                this.classList.add('active');
                
                // Filter conversations
                if (window.conversationManager && window.conversationManager.getConversationsByCategory) {
                    const category = this.dataset.category;
                    const filteredConversations = category === 'all' 
                        ? window.conversationManager.conversations 
                        : window.conversationManager.getConversationsByCategory(category);
                    
                    renderConversationsList(filteredConversations);
                }
            });
        });
    }
    
    // Render conversations
    function renderConversations() {
        if (!window.conversationManager || !window.conversationManager.conversations) {
            return;
        }
        
        renderConversationsList(window.conversationManager.conversations);
    }
    
    // Render conversations list
    function renderConversationsList(conversations) {
        const conversationsList = document.getElementById('conversations-list');
        if (!conversationsList) return;
        
        // Clear the list
        conversationsList.innerHTML = '';
        
        if (!conversations || conversations.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No conversations found';
            conversationsList.appendChild(emptyMessage);
            return;
        }
        
        // Add each conversation
        conversations.forEach(conversation => {
            const conversationItem = document.createElement('div');
            conversationItem.className = 'conversation-item';
            conversationItem.dataset.id = conversation.id;
            
            // Check if active
            if (window.conversationManager.currentConversation && 
                window.conversationManager.currentConversation.id === conversation.id) {
                conversationItem.classList.add('active');
            }
            
            // Create title and actions
            const title = document.createElement('div');
            title.className = 'conversation-item-title';
            title.textContent = conversation.title || 'Untitled';
            
            const actions = document.createElement('div');
            actions.className = 'conversation-item-actions';
            
            // Pin button
            const pinBtn = document.createElement('button');
            pinBtn.className = `action-btn pin-btn ${conversation.isPinned ? 'pinned' : ''}`;
            pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i>';
            pinBtn.title = conversation.isPinned ? 'Unpin conversation' : 'Pin conversation';
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete conversation';
            
            // Add action buttons
            actions.appendChild(pinBtn);
            actions.appendChild(deleteBtn);
            
            // Add title and actions to item
            conversationItem.appendChild(title);
            conversationItem.appendChild(actions);
            
            // Add to list
            conversationsList.appendChild(conversationItem);
            
            // Add click handlers
            conversationItem.addEventListener('click', function(e) {
                // Don't handle if clicking on buttons
                if (e.target.closest('.action-btn')) return;
                
                // Set active state
                conversationsList.querySelectorAll('.conversation-item').forEach(i => {
                    i.classList.remove('active');
                });
                this.classList.add('active');
                
                // Load conversation
                if (window.conversationManager && window.conversationManager.loadConversationToThread) {
                    window.conversationManager.loadConversationToThread(conversation.id);
                }
            });
            
            // Pin button handler
            pinBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (window.conversationManager && window.conversationManager.togglePinned) {
                    window.conversationManager.togglePinned(conversation.id);
                    renderConversations(); // Refresh list
                }
            });
            
            // Delete button handler
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${conversation.title}"?`)) {
                    if (window.conversationManager && window.conversationManager.deleteConversation) {
                        window.conversationManager.deleteConversation(conversation.id);
                        renderConversations(); // Refresh list
                    }
                }
            });
        });
    }
    
    // Set up conversation button handlers
    function setupConversationButtons() {
        const newConversationBtn = document.getElementById('new-conversation-btn');
        const importConversationBtn = document.getElementById('import-conversation-btn');
        const exportConversationBtn = document.getElementById('export-conversation-btn');
        
        if (newConversationBtn) {
            newConversationBtn.addEventListener('click', function() {
                if (window.conversationManager && window.conversationManager.createConversation) {
                    const title = prompt('Enter conversation title:') || 'Untitled Conversation';
                    window.conversationManager.createConversation(title, 'Uncategorized');
                    renderConversations(); // Refresh list
                }
            });
        }
        
        if (importConversationBtn) {
            importConversationBtn.addEventListener('click', function() {
                // Show import modal if available, else alert
                const importModal = document.getElementById('import-modal');
                if (importModal) {
                    importModal.style.display = 'block';
                } else {
                    alert('Import functionality not available');
                }
            });
        }
        
        if (exportConversationBtn) {
            exportConversationBtn.addEventListener('click', function() {
                if (!window.conversationManager || !window.conversationManager.getCurrentConversation) {
                    alert('No active conversation to export');
                    return;
                }
                
                const conversation = window.conversationManager.getCurrentConversation();
                if (!conversation) {
                    alert('No active conversation to export');
                    return;
                }
                
                // Show export modal if available, else export as JSON
                const exportModal = document.getElementById('export-modal');
                if (exportModal) {
                    exportModal.style.display = 'block';
                } else {
                    // Basic JSON export
                    const json = JSON.stringify(conversation, null, 2);
                    const blob = new Blob([json], {type: 'application/json'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `conversation-${conversation.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            });
        }
        
        // Set up modal close buttons
        const closeButtons = [
            { btnId: 'close-import-modal', modalId: 'import-modal' },
            { btnId: 'close-export-modal', modalId: 'export-modal' },
            { btnId: 'close-conversation-details', modalId: 'conversation-details-modal' },
            { btnId: 'close-conversation-details-btn', modalId: 'conversation-details-modal' }
        ];
        
        closeButtons.forEach(({btnId, modalId}) => {
            const btn = document.getElementById(btnId);
            const modal = document.getElementById(modalId);
            if (btn && modal) {
                btn.addEventListener('click', function() {
                    modal.style.display = 'none';
                });
            }
        });
    }
    
    // Call the model specific fixes
    fixModelManagementSidebar();
    setupModelButtonHandler();
    
    // Fix for conversations button
    const convBtn = document.getElementById('conversation-manager-btn');
    const convSidebar = document.getElementById('conversation-manager-sidebar');
    
    if (convBtn && convSidebar) {
        console.log('Setting up direct conversation button handler');
        convBtn.addEventListener('click', function() {
            console.log('Conversation button clicked');
            closeAllSidebars();
            convSidebar.classList.toggle('active');
            
            // Reinitialize conversation manager to ensure it's working
            setTimeout(function() {
                if (window.conversationManager) {
                    renderCategories();
                    renderConversations();
                }
            }, 50);
        });
        
        // Also set up close button
        const closeConvBtn = convSidebar.querySelector('.btn-close') ||
                             convSidebar.querySelector('#close-conversation-manager');
        if (closeConvBtn) {
            closeConvBtn.addEventListener('click', function() {
                convSidebar.classList.remove('active');
            });
        }
    }
    
    // Helper function to close all sidebars
    function closeAllSidebars() {
        const sidebars = [
            historySidebar, 
            paramSidebar, 
            modelSidebar,
            convSidebar
        ];
        
        sidebars.forEach(function(sidebar) {
            if (sidebar) {
                sidebar.classList.remove('active');
            }
        });
    }
    
    // Add escape key handler to close all sidebars
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllSidebars();
        }
    });
    
    console.log('Direct fixes applied');
});
