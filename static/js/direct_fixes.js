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
        newSidebar.style.cssText = 'display:block !important; visibility:visible !important; position:fixed; top:0; right:0; width:450px; height:100%; z-index:10000; background-color:#fff; box-shadow:-2px 0 10px rgba(0,0,0,0.2); overflow-y:auto;';
        
        // Create sidebar content with enhanced features
        newSidebar.innerHTML = `
            <div class="model-management-header" style="padding:1rem; border-bottom:1px solid #dee2e6; display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0;">Model Management</h3>
                <button id="close-emergency-sidebar" class="btn-close" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
            </div>
            
            <div class="model-management-content" style="padding:1rem;">
                <!-- Model Filters Section -->
                <div class="model-filters" style="margin-bottom:1.5rem;">
                    <div class="section-header" style="margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; font-size:1rem;">Filters & Controls</h4>
                        <button id="refresh-models-btn" class="btn btn-sm btn-outline-primary" style="font-size:0.875rem; padding:0.25rem 0.5rem;">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    
                    <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">
                        <input type="text" id="model-search" placeholder="Search models..." style="flex:1; padding:0.5rem; border:1px solid #ced4da; border-radius:0.25rem;" />
                        
                        <select id="model-sort" style="padding:0.5rem; border:1px solid #ced4da; border-radius:0.25rem; background-color:white;">
                            <option value="name">Sort by Name</option>
                            <option value="size">Sort by Size</option>
                            <option value="usage">Sort by Usage</option>
                            <option value="updated">Sort by Updated</option>
                        </select>
                    </div>
                    
                    <div class="model-filter-tags" style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
                        <button class="filter-tag active" data-filter="all" style="padding:0.25rem 0.5rem; border:1px solid #0d6efd; border-radius:1rem; background-color:#e7f1ff; font-size:0.75rem; cursor:pointer;">All</button>
                        <button class="filter-tag" data-filter="llama" style="padding:0.25rem 0.5rem; border:1px solid #ced4da; border-radius:1rem; background-color:#f8f9fa; font-size:0.75rem; cursor:pointer;">LLaMA</button>
                        <button class="filter-tag" data-filter="gemma" style="padding:0.25rem 0.5rem; border:1px solid #ced4da; border-radius:1rem; background-color:#f8f9fa; font-size:0.75rem; cursor:pointer;">Gemma</button>
                        <button class="filter-tag" data-filter="mistral" style="padding:0.25rem 0.5rem; border:1px solid #ced4da; border-radius:1rem; background-color:#f8f9fa; font-size:0.75rem; cursor:pointer;">Mistral</button>
                        <button class="filter-tag" data-filter="phi" style="padding:0.25rem 0.5rem; border:1px solid #ced4da; border-radius:1rem; background-color:#f8f9fa; font-size:0.75rem; cursor:pointer;">Phi</button>
                        <button class="filter-tag" data-filter="multimodal" style="padding:0.25rem 0.5rem; border:1px solid #ced4da; border-radius:1rem; background-color:#f8f9fa; font-size:0.75rem; cursor:pointer;">Multimodal</button>
                    </div>
                </div>
                
                <!-- Model Download Section -->
                <div class="model-download-section" style="margin-bottom:1.5rem; border:1px solid #ced4da; border-radius:0.375rem; padding:1rem; background-color:#f8f9fa;">
                    <div class="section-header" style="margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0; font-size:1rem;">Download New Models</h4>
                    </div>
                    
                    <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">
                        <input type="text" id="model-download-input" placeholder="Enter model name (e.g., llama3)" style="flex:1; padding:0.5rem; border:1px solid #ced4da; border-radius:0.25rem;" />
                        <button id="download-model-btn" class="btn btn-primary" style="padding:0.5rem 0.75rem; white-space:nowrap;">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                    
                    <div id="download-progress" style="display:none; width:100%; height:20px; background-color:#e9ecef; border-radius:0.25rem; overflow:hidden; margin-top:0.5rem;">
                        <div id="download-progress-bar" style="width:0%; height:100%; background-color:#0d6efd; transition:width 0.5s;"></div>
                    </div>
                    <div id="download-status" style="font-size:0.875rem; margin-top:0.5rem;"></div>
                </div>
                
                <!-- Model Settings Presets -->
                <div class="model-presets-section" style="margin-bottom:1.5rem; border:1px solid #ced4da; border-radius:0.375rem; padding:1rem; background-color:#f8f9fa;">
                    <div class="section-header" style="margin-bottom:0.75rem;">
                        <h4 style="margin:0; font-size:1rem;">Parameter Presets</h4>
                    </div>
                    
                    <div class="preset-buttons" style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                        <button class="preset-btn" data-preset="creative" style="flex:1; padding:0.5rem; border:1px solid #ced4da; border-radius:0.25rem; background-color:white; cursor:pointer;">
                            Creative
                        </button>
                        <button class="preset-btn" data-preset="balanced" style="flex:1; padding:0.5rem; border:1px solid #ced4da; border-radius:0.25rem; background-color:white; cursor:pointer;">
                            Balanced
                        </button>
                        <button class="preset-btn" data-preset="precise" style="flex:1; padding:0.5rem; border:1px solid #ced4da; border-radius:0.25rem; background-color:white; cursor:pointer;">
                            Precise
                        </button>
                    </div>
                    
                    <div class="speed-presets" style="display:flex; gap:0.5rem;">
                        <button class="speed-btn" data-speed="slow" style="flex:1; padding:0.4rem; border:1px solid #ced4da; border-radius:0.25rem; background-color:white; font-size:0.8rem; cursor:pointer;">
                            <i class="fas fa-tachometer-alt"></i> Slow
                        </button>
                        <button class="speed-btn" data-speed="medium" style="flex:1; padding:0.4rem; border:1px solid #ced4da; border-radius:0.25rem; background-color:white; font-size:0.8rem; cursor:pointer;">
                            <i class="fas fa-tachometer-alt"></i> Medium
                        </button>
                        <button class="speed-btn" data-speed="fast" style="flex:1; padding:0.4rem; border:1px solid #ced4da; border-radius:0.25rem; background-color:white; font-size:0.8rem; cursor:pointer;">
                            <i class="fas fa-tachometer-alt"></i> Fast
                        </button>
                    </div>
                </div>
                
                <!-- Available Models Section -->
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
                
                <!-- Model Stats Section -->
                <div class="models-stats-section" style="margin-top:1.5rem;">
                    <div class="section-header" style="margin-bottom:1rem; display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="margin:0;">Model Usage Statistics</h4>
                    </div>
                    
                    <div id="model-stats-container" style="border:1px solid #dee2e6; border-radius:0.25rem; padding:0.75rem; background-color:#f8f9fa; font-size:0.875rem;">
                        <div id="model-stats-loading" style="text-align:center; padding:1rem;">
                            Loading statistics...
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
        
        // Set up refresh button
        const refreshBtn = document.getElementById('refresh-models-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                loadEmergencyModels();
            });
        }
        
        // Set up search functionality
        const searchInput = document.getElementById('model-search');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterModels();
            });
        }
        
        // Set up sorting functionality
        const sortSelect = document.getElementById('model-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                sortModels(this.value);
            });
        }
        
        // Set up filter tags
        const filterTags = document.querySelectorAll('.filter-tag');
        filterTags.forEach(tag => {
            tag.addEventListener('click', function() {
                // Update active state
                filterTags.forEach(t => t.classList.remove('active'));
                filterTags.forEach(t => t.style.backgroundColor = '#f8f9fa');
                filterTags.forEach(t => t.style.borderColor = '#ced4da');
                
                this.classList.add('active');
                this.style.backgroundColor = '#e7f1ff';
                this.style.borderColor = '#0d6efd';
                
                // Apply filter
                filterModels();
            });
        });
        
        // Set up download button
        const downloadBtn = document.getElementById('download-model-btn');
        const downloadInput = document.getElementById('model-download-input');
        
        if (downloadBtn && downloadInput) {
            downloadBtn.addEventListener('click', function() {
                const modelName = downloadInput.value.trim();
                if (modelName) {
                    downloadModel(modelName);
                } else {
                    alert('Please enter a model name to download');
                }
            });
        }
        
        // Set up preset buttons
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const preset = this.getAttribute('data-preset');
                applyParameterPreset(preset);
                
                // Update visual feedback
                presetButtons.forEach(b => {
                    b.style.backgroundColor = 'white';
                    b.style.color = 'black';
                    b.style.fontWeight = 'normal';
                });
                
                this.style.backgroundColor = '#0d6efd';
                this.style.color = 'white';
                this.style.fontWeight = 'bold';
            });
        });
        
        // Set up speed buttons
        const speedButtons = document.querySelectorAll('.speed-btn');
        speedButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const speed = this.getAttribute('data-speed');
                applySpeedPreset(speed);
                
                // Update visual feedback
                speedButtons.forEach(b => {
                    b.style.backgroundColor = 'white';
                    b.style.color = 'black';
                    b.style.fontWeight = 'normal';
                });
                
                this.style.backgroundColor = '#0d6efd';
                this.style.color = 'white';
                this.style.fontWeight = 'bold';
            });
        });
        
        // Load models directly into our emergency container
        loadEmergencyModels();
        
        // Load model statistics
        loadModelStatistics();
    }
    
    // Global models array to store all model data
    let emergencyModels = [];
    let modelUsageStats = {};
    
    // Function to load models directly into our emergency container
    async function loadEmergencyModels() {
        try {
            const modelsListContainer = document.getElementById('emergency-models-list');
            const modelsCountDisplay = document.getElementById('emergency-models-count');
            
            if (!modelsListContainer) {
                console.error('Emergency models list container not found');
                return;
            }
            
            // Show loading state
            modelsListContainer.innerHTML = `
                <div class="loading" style="text-align:center; padding:2rem;">
                    <i class="fas fa-spinner fa-spin"></i> Loading models...
                </div>
            `;
            
            // Try to fetch models directly
            const response = await fetch('http://localhost:11434/api/tags');
            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status}`);
            }
            
            const data = await response.json();
            const models = data.models || [];
            
            // Store in global variable
            emergencyModels = models.map(model => {
                // Extract family info from model name
                let family = 'Unknown';
                let badge = '';
                let capabilities = 'Text';
                let size = 'Unknown';
                
                if (model.name.includes('llama')) {
                    family = 'LLaMA';
                    badge = 'Meta AI';
                } else if (model.name.includes('mistral')) {
                    family = 'Mistral';
                    badge = 'Mistral AI';
                } else if (model.name.includes('gemma')) {
                    family = 'Gemma';
                    badge = 'Google';
                } else if (model.name.includes('phi')) {
                    family = 'Phi';
                    badge = 'Microsoft';
                } else if (model.name.includes('llava')) {
                    family = 'LLaVA';
                    badge = 'Multimodal';
                    capabilities = 'Text + Image';
                }
                
                // Extract model size from name
                const sizeRegex = /(\d+[.,]?\d*)b/i;
                const sizeMatch = model.name.match(sizeRegex);
                if (sizeMatch) {
                    size = sizeMatch[1] + 'B';
                }
                
                // Setup default usage stats if none exist
                if (!modelUsageStats[model.name]) {
                    modelUsageStats[model.name] = {
                        usageCount: 0,
                        lastUsed: null,
                        firstUsed: null
                    };
                }
                
                return {
                    ...model,
                    family,
                    badge,
                    capabilities,
                    size,
                    usageCount: modelUsageStats[model.name].usageCount || 0,
                    lastUsed: modelUsageStats[model.name].lastUsed,
                    firstUsed: modelUsageStats[model.name].firstUsed
                };
            });
            
            if (modelsCountDisplay) {
                modelsCountDisplay.textContent = `${emergencyModels.length} models`;
            }
            
            // No models
            if (emergencyModels.length === 0) {
                modelsListContainer.innerHTML = '<div style="text-align:center; padding:2rem;">No models found</div>';
                return;
            }
            
            // Then load model details
            for (const model of emergencyModels) {
                try {
                    const detailsResponse = await fetch(`http://localhost:11434/api/show?name=${model.name}`);
                    if (detailsResponse.ok) {
                        const details = await detailsResponse.json();
                        
                        // Update model with details
                        const index = emergencyModels.findIndex(m => m.name === model.name);
                        if (index !== -1) {
                            emergencyModels[index] = {
                                ...emergencyModels[index],
                                parameters: details.parameters || {},
                                modelfile: details.modelfile || '',
                                template: details.template || '',
                                details: details
                            };
                            
                            // Extract size if available
                            if (details.size) {
                                const sizeInGB = (details.size / (1024 * 1024 * 1024)).toFixed(1);
                                emergencyModels[index].sizeGB = sizeInGB + 'GB';
                            }
                        }
                    }
                } catch (detailError) {
                    console.warn(`Couldn't fetch details for ${model.name}:`, detailError);
                }
            }
            
            // Render the models
            renderModelsList();
            
            // Try to identify the current model
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && modelSelect.value) {
                const currentModel = modelSelect.value;
                highlightCurrentModel(currentModel);
            }
            
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
    
    // Function to render the models list with current data
    function renderModelsList() {
        const modelsListContainer = document.getElementById('emergency-models-list');
        if (!modelsListContainer) return;
        
        if (!emergencyModels || emergencyModels.length === 0) {
            modelsListContainer.innerHTML = '<div style="text-align:center; padding:2rem;">No models found</div>';
            return;
        }
        
        // Create models list HTML with enhanced details
        let html = '';
        emergencyModels.forEach(model => {
            // Determine model family and size display
            const family = model.family || 'Unknown';
            const size = model.sizeGB || model.size || 'Unknown size';
            const capabilities = model.capabilities || 'Text';
            const badge = model.badge || '';
            
            html += `
                <div class="emergency-model-item" data-model="${model.name}" data-family="${family.toLowerCase()}" 
                     style="display:flex; flex-direction:column; padding:0.75rem; margin-bottom:0.75rem; border:1px solid #dee2e6; border-radius:0.375rem; background-color:white;">
                    <div class="model-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                        <div class="model-name-section">
                            <div class="model-name" style="font-weight:bold; font-size:1rem;">${model.name}</div>
                            <div class="model-family" style="font-size:0.75rem; color:#6c757d;">${family}</div>
                        </div>
                        <div class="model-actions">
                            <button class="select-model-btn btn btn-sm btn-primary" data-model="${model.name}" style="cursor:pointer;">
                                Use Model
                            </button>
                        </div>
                    </div>
                    
                    <div class="model-details" style="margin-bottom:0.5rem; display:flex; flex-wrap:wrap; gap:0.5rem;">
                        <span class="model-size badge" style="background-color:#6c757d; color:white; padding:0.2rem 0.5rem; border-radius:0.25rem; font-size:0.75rem;">
                            ${size}
                        </span>
                        <span class="model-capabilities badge" style="background-color:#28a745; color:white; padding:0.2rem 0.5rem; border-radius:0.25rem; font-size:0.75rem;">
                            ${capabilities}
                        </span>
                        ${badge ? `<span class="model-badge badge" style="background-color:#0d6efd; color:white; padding:0.2rem 0.5rem; border-radius:0.25rem; font-size:0.75rem;">
                            ${badge}
                        </span>` : ''}
                        ${model.usageCount > 0 ? `<span class="model-usage badge" style="background-color:#6610f2; color:white; padding:0.2rem 0.5rem; border-radius:0.25rem; font-size:0.75rem;">
                            Used ${model.usageCount} times
                        </span>` : ''}
                    </div>
                    
                    <div class="model-extra-actions" style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                        <button class="btn btn-sm btn-outline-secondary model-info-btn" data-model="${model.name}" title="View model details"
                            style="font-size:0.75rem; padding:0.2rem 0.4rem;">
                            <i class="fas fa-info-circle"></i> Info
                        </button>
                        <button class="btn btn-sm btn-outline-secondary model-parameters-btn" data-model="${model.name}" title="View recommended parameters"
                            style="font-size:0.75rem; padding:0.2rem 0.4rem;">
                            <i class="fas fa-sliders-h"></i> Parameters
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
        
        // Add click handlers for model info
        document.querySelectorAll('.model-info-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const modelName = this.getAttribute('data-model');
                showModelInfo(modelName);
            });
        });
        
        // Add click handlers for model parameters
        document.querySelectorAll('.model-parameters-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const modelName = this.getAttribute('data-model');
                showModelParameters(modelName);
            });
        });
    }
    
    // Function to filter models based on search and tag
    function filterModels() {
        const searchInput = document.getElementById('model-search');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        // Get active filter
        const activeFilter = document.querySelector('.filter-tag.active');
        const filterType = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
        
        // Get all model items
        const modelItems = document.querySelectorAll('.emergency-model-item');
        
        // Apply filters
        modelItems.forEach(item => {
            const modelName = item.getAttribute('data-model').toLowerCase();
            const modelFamily = item.getAttribute('data-family').toLowerCase();
            
            // Filter by search term
            const matchesSearch = searchTerm === '' || modelName.includes(searchTerm);
            
            // Filter by type
            let matchesType = true;
            if (filterType !== 'all') {
                matchesType = modelFamily.includes(filterType) || modelName.includes(filterType);
                
                // Special case for multimodal
                if (filterType === 'multimodal') {
                    matchesType = modelName.includes('llava') || modelName.includes('vision');
                }
            }
            
            // Show or hide
            if (matchesSearch && matchesType) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Function to sort models by different criteria
    function sortModels(sortType) {
        const modelsListContainer = document.getElementById('emergency-models-list');
        if (!modelsListContainer) return;
        
        // Get all model items
        const modelItems = Array.from(document.querySelectorAll('.emergency-model-item'));
        
        // Sort based on sortType
        switch (sortType) {
            case 'name':
                modelItems.sort((a, b) => {
                    const nameA = a.getAttribute('data-model').toLowerCase();
                    const nameB = b.getAttribute('data-model').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
                
            case 'size':
                modelItems.sort((a, b) => {
                    const modelA = emergencyModels.find(m => m.name === a.getAttribute('data-model'));
                    const modelB = emergencyModels.find(m => m.name === b.getAttribute('data-model'));
                    
                    // Extract numeric size
                    const sizeA = modelA && modelA.size ? parseFloat(modelA.size.replace(/[^\d.]/g, '')) : 0;
                    const sizeB = modelB && modelB.size ? parseFloat(modelB.size.replace(/[^\d.]/g, '')) : 0;
                    
                    return sizeB - sizeA; // Large to small
                });
                break;
                
            case 'usage':
                modelItems.sort((a, b) => {
                    const modelA = emergencyModels.find(m => m.name === a.getAttribute('data-model'));
                    const modelB = emergencyModels.find(m => m.name === b.getAttribute('data-model'));
                    
                    const usageA = modelA ? modelA.usageCount || 0 : 0;
                    const usageB = modelB ? modelB.usageCount || 0 : 0;
                    
                    return usageB - usageA; // Most used first
                });
                break;
                
            case 'updated':
                modelItems.sort((a, b) => {
                    const modelA = emergencyModels.find(m => m.name === a.getAttribute('data-model'));
                    const modelB = emergencyModels.find(m => m.name === b.getAttribute('data-model'));
                    
                    const lastUsedA = modelA && modelA.lastUsed ? new Date(modelA.lastUsed) : new Date(0);
                    const lastUsedB = modelB && modelB.lastUsed ? new Date(modelB.lastUsed) : new Date(0);
                    
                    return lastUsedB - lastUsedA; // Most recent first
                });
                break;
        }
        
        // Reorder elements
        modelItems.forEach(item => {
            modelsListContainer.appendChild(item);
        });
    }
    
    // Function to highlight the current model
    function highlightCurrentModel(modelName) {
        // Remove highlight from all
        document.querySelectorAll('.emergency-model-item').forEach(item => {
            item.style.border = '1px solid #dee2e6';
            item.style.boxShadow = 'none';
        });
        
        // Add highlight to current
        const currentItem = document.querySelector(`.emergency-model-item[data-model="${modelName}"]`);
        if (currentItem) {
            currentItem.style.border = '2px solid #0d6efd';
            currentItem.style.boxShadow = '0 0 0 0.25rem rgba(13, 110, 253, 0.25)';
            
            // Add active indicator
            const header = currentItem.querySelector('.model-header');
            if (header) {
                const activeIndicator = document.createElement('div');
                activeIndicator.className = 'active-model-indicator';
                activeIndicator.innerHTML = '<i class="fas fa-check-circle"></i> Active';
                activeIndicator.style.cssText = 'color:#0d6efd; font-size:0.75rem; display:flex; align-items:center; gap:0.25rem;';
                
                // Check if already added
                if (!header.querySelector('.active-model-indicator')) {
                    header.appendChild(activeIndicator);
                }
            }
        }
    }
    
    // Function to download a model
    async function downloadModel(modelName) {
        const downloadStatus = document.getElementById('download-status');
        const downloadProgress = document.getElementById('download-progress');
        const downloadProgressBar = document.getElementById('download-progress-bar');
        
        if (!downloadStatus || !downloadProgress || !downloadProgressBar) {
            alert('Download UI elements not found');
            return;
        }
        
        // Show progress UI
        downloadProgress.style.display = 'block';
        downloadProgressBar.style.width = '0%';
        downloadStatus.textContent = `Starting download of ${modelName}...`;
        
        try {
            // Start download
            const response = await fetch('http://localhost:11434/api/pull', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: modelName }),
            });
            
            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }
            
            // Process streaming response
            const reader = response.body.getReader();
            let receivedData = '';
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }
                
                // Convert the Uint8Array to a string
                const chunk = new TextDecoder().decode(value);
                receivedData += chunk;
                
                // Process progress updates
                const lines = receivedData.split('\n');
                receivedData = lines.pop() || ''; // Keep the incomplete line for the next chunk
                
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            
                            if (data.status) {
                                downloadStatus.textContent = data.status;
                            }
                            
                            if (data.completed !== undefined && data.total !== undefined) {
                                const percentage = Math.round((data.completed / data.total) * 100);
                                downloadProgressBar.style.width = `${percentage}%`;
                                
                                // Calculate download speed and ETA
                                if (data.total > 0) {
                                    const downloadedMB = (data.completed / (1024 * 1024)).toFixed(1);
                                    const totalMB = (data.total / (1024 * 1024)).toFixed(1);
                                    downloadStatus.textContent = `Downloading ${modelName}: ${downloadedMB}MB of ${totalMB}MB (${percentage}%)`;
                                }
                            }
                        } catch (jsonError) {
                            console.warn('Error parsing progress JSON:', jsonError);
                        }
                    }
                }
            }
            
            // Download complete
            downloadProgressBar.style.width = '100%';
            downloadStatus.textContent = `${modelName} downloaded successfully!`;
            
            // Reload the models list after a short delay
            setTimeout(() => {
                loadEmergencyModels();
            }, 1000);
            
        } catch (error) {
            console.error('Download error:', error);
            downloadStatus.textContent = `Error: ${error.message}`;
            downloadProgressBar.style.backgroundColor = '#dc3545';
        }
    }
    
    // Function to show model information
    function showModelInfo(modelName) {
        const model = emergencyModels.find(m => m.name === modelName);
        if (!model) {
            alert(`Model information for ${modelName} not found`);
            return;
        }
        
        // Create info modal
        const infoModal = document.createElement('div');
        infoModal.className = 'model-info-modal';
        infoModal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:10001;';
        
        // Modal content
        infoModal.innerHTML = `
            <div class="modal-content" style="width:600px; max-width:90%; background-color:white; border-radius:0.375rem; box-shadow:0 0.5rem 1rem rgba(0,0,0,0.15); padding:1.5rem; position:relative; max-height:90vh; overflow-y:auto;">
                <button class="close-modal-btn" style="position:absolute; top:1rem; right:1rem; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                
                <h3 style="margin-top:0;">${model.name}</h3>
                <div style="margin-bottom:1rem;">
                    <span class="badge" style="background-color:#6c757d; padding:0.2rem 0.5rem; border-radius:0.25rem; margin-right:0.5rem;">${model.family}</span>
                    <span class="badge" style="background-color:#28a745; padding:0.2rem 0.5rem; border-radius:0.25rem; margin-right:0.5rem;">${model.capabilities}</span>
                    ${model.badge ? `<span class="badge" style="background-color:#0d6efd; padding:0.2rem 0.5rem; border-radius:0.25rem;">${model.badge}</span>` : ''}
                </div>
                
                <div style="margin-bottom:1rem;">
                    <strong>Size:</strong> ${model.sizeGB || model.size || 'Unknown'}
                </div>
                
                <div style="margin-bottom:1rem;">
                    <strong>Usage:</strong> ${model.usageCount || 0} times
                    ${model.lastUsed ? `<br><strong>Last used:</strong> ${new Date(model.lastUsed).toLocaleString()}` : ''}
                    ${model.firstUsed ? `<br><strong>First used:</strong> ${new Date(model.firstUsed).toLocaleString()}` : ''}
                </div>
                
                <div style="margin-bottom:1rem;">
                    <strong>Best for:</strong> ${getBestUseCase(model.name, model.family)}
                </div>
                
                <div style="margin-bottom:1rem;">
                    <strong>Recommended Parameters:</strong>
                    <ul style="margin-top:0.5rem;">
                        <li>Temperature: ${getRecommendedParam(model.name, 'temperature')}</li>
                        <li>Top P: ${getRecommendedParam(model.name, 'top_p')}</li>
                        <li>Top K: ${getRecommendedParam(model.name, 'top_k')}</li>
                        <li>Max Tokens: ${getRecommendedParam(model.name, 'max_tokens')}</li>
                    </ul>
                </div>
                
                <div style="display:flex; justify-content:space-between; margin-top:1rem;">
                    <button class="btn btn-secondary close-info-btn" style="padding:0.375rem 0.75rem; border-radius:0.25rem; border:none; background-color:#6c757d; color:white; cursor:pointer;">Close</button>
                    <button class="btn btn-primary select-from-info-btn" data-model="${model.name}" style="padding:0.375rem 0.75rem; border-radius:0.25rem; border:none; background-color:#0d6efd; color:white; cursor:pointer;">Use This Model</button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(infoModal);
        
        // Set up close buttons
        const closeButtons = infoModal.querySelectorAll('.close-modal-btn, .close-info-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                document.body.removeChild(infoModal);
            });
        });
        
        // Set up select button
        const selectBtn = infoModal.querySelector('.select-from-info-btn');
        if (selectBtn) {
            selectBtn.addEventListener('click', function() {
                const modelName = this.getAttribute('data-model');
                selectEmergencyModel(modelName);
                document.body.removeChild(infoModal);
            });
        }
    }
    
    // Function to show model parameters
    function showModelParameters(modelName) {
        const model = emergencyModels.find(m => m.name === modelName);
        if (!model) {
            alert(`Model information for ${modelName} not found`);
            return;
        }
        
        // Create parameters modal
        const paramsModal = document.createElement('div');
        paramsModal.className = 'model-params-modal';
        paramsModal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:10001;';
        
        // Get parameter presets based on model family
        const creativeParams = getParamPreset(model.name, model.family, 'creative');
        const balancedParams = getParamPreset(model.name, model.family, 'balanced');
        const preciseParams = getParamPreset(model.name, model.family, 'precise');
        
        // Modal content with parameter table
        paramsModal.innerHTML = `
            <div class="modal-content" style="width:700px; max-width:90%; background-color:white; border-radius:0.375rem; box-shadow:0 0.5rem 1rem rgba(0,0,0,0.15); padding:1.5rem; position:relative; max-height:90vh; overflow-y:auto;">
                <button class="close-modal-btn" style="position:absolute; top:1rem; right:1rem; background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                
                <h3 style="margin-top:0;">Parameters for ${model.name}</h3>
                <p style="margin-bottom:1.5rem;">Use these recommended parameters for optimal results with ${model.name}.</p>
                
                <table style="width:100%; border-collapse:collapse; margin-bottom:1.5rem;">
                    <thead>
                        <tr style="background-color:#f8f9fa; border-bottom:2px solid #dee2e6;">
                            <th style="padding:0.75rem; text-align:left;">Parameter</th>
                            <th style="padding:0.75rem; text-align:center;">Creative</th>
                            <th style="padding:0.75rem; text-align:center;">Balanced</th>
                            <th style="padding:0.75rem; text-align:center;">Precise</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid #dee2e6;">
                            <td style="padding:0.75rem;">Temperature</td>
                            <td style="padding:0.75rem; text-align:center;">${creativeParams.temperature}</td>
                            <td style="padding:0.75rem; text-align:center;">${balancedParams.temperature}</td>
                            <td style="padding:0.75rem; text-align:center;">${preciseParams.temperature}</td>
                        </tr>
                        <tr style="border-bottom:1px solid #dee2e6;">
                            <td style="padding:0.75rem;">Top P</td>
                            <td style="padding:0.75rem; text-align:center;">${creativeParams.top_p}</td>
                            <td style="padding:0.75rem; text-align:center;">${balancedParams.top_p}</td>
                            <td style="padding:0.75rem; text-align:center;">${preciseParams.top_p}</td>
                        </tr>
                        <tr style="border-bottom:1px solid #dee2e6;">
                            <td style="padding:0.75rem;">Top K</td>
                            <td style="padding:0.75rem; text-align:center;">${creativeParams.top_k}</td>
                            <td style="padding:0.75rem; text-align:center;">${balancedParams.top_k}</td>
                            <td style="padding:0.75rem; text-align:center;">${preciseParams.top_k}</td>
                        </tr>
                        <tr style="border-bottom:1px solid #dee2e6;">
                            <td style="padding:0.75rem;">Max Tokens</td>
                            <td style="padding:0.75rem; text-align:center;">${creativeParams.max_tokens}</td>
                            <td style="padding:0.75rem; text-align:center;">${balancedParams.max_tokens}</td>
                            <td style="padding:0.75rem; text-align:center;">${preciseParams.max_tokens}</td>
                        </tr>
                        <tr>
                            <td style="padding:0.75rem;">Repetition Penalty</td>
                            <td style="padding:0.75rem; text-align:center;">${creativeParams.repetition_penalty}</td>
                            <td style="padding:0.75rem; text-align:center;">${balancedParams.repetition_penalty}</td>
                            <td style="padding:0.75rem; text-align:center;">${preciseParams.repetition_penalty}</td>
                        </tr>
                    </tbody>
                </table>
                
                <h4 style="margin-top:1.5rem; margin-bottom:1rem;">Speed Settings</h4>
                <div style="display:flex; gap:1rem; margin-bottom:1.5rem;">
                    <div style="flex:1; padding:0.75rem; border:1px solid #dee2e6; border-radius:0.25rem; background-color:#f8f9fa;">
                        <h5 style="margin-top:0; margin-bottom:0.5rem;">Fast</h5>
                        <ul style="margin:0; padding-left:1.25rem;">
                            <li>Temperature: 0.6</li>
                            <li>Max Tokens: 512</li>
                            <li>Optimized for speed</li>
                        </ul>
                    </div>
                    <div style="flex:1; padding:0.75rem; border:1px solid #dee2e6; border-radius:0.25rem; background-color:#f8f9fa;">
                        <h5 style="margin-top:0; margin-bottom:0.5rem;">Medium</h5>
                        <ul style="margin:0; padding-left:1.25rem;">
                            <li>Temperature: 0.7</li>
                            <li>Max Tokens: 1024</li>
                            <li>Balanced performance</li>
                        </ul>
                    </div>
                    <div style="flex:1; padding:0.75rem; border:1px solid #dee2e6; border-radius:0.25rem; background-color:#f8f9fa;">
                        <h5 style="margin-top:0; margin-bottom:0.5rem;">Slow</h5>
                        <ul style="margin:0; padding-left:1.25rem;">
                            <li>Temperature: 0.8</li>
                            <li>Max Tokens: 2048</li>
                            <li>Optimized for quality</li>
                        </ul>
                    </div>
                </div>
                
                <div style="display:flex; justify-content:space-between; margin-top:1rem;">
                    <button class="btn btn-secondary close-params-btn" style="padding:0.375rem 0.75rem; border-radius:0.25rem; border:none; background-color:#6c757d; color:white; cursor:pointer;">Close</button>
                    <button class="btn btn-primary apply-params-btn" data-model="${model.name}" style="padding:0.375rem 0.75rem; border-radius:0.25rem; border:none; background-color:#0d6efd; color:white; cursor:pointer;">Apply Balanced Settings</button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(paramsModal);
        
        // Set up close buttons
        const closeButtons = paramsModal.querySelectorAll('.close-modal-btn, .close-params-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                document.body.removeChild(paramsModal);
            });
        });
        
        // Set up apply button
        const applyBtn = paramsModal.querySelector('.apply-params-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                const modelName = this.getAttribute('data-model');
                applyParameterPreset('balanced', modelName);
                document.body.removeChild(paramsModal);
            });
        }
    }
    
    // Function to load model usage statistics
    function loadModelStatistics() {
        // Try to load statistics from localStorage
        try {
            const storedStats = localStorage.getItem('modelUsageStats');
            if (storedStats) {
                modelUsageStats = JSON.parse(storedStats);
            }
        } catch (error) {
            console.warn('Error loading model usage statistics:', error);
        }
        
        // Display statistics
        updateModelStatisticsDisplay();
    }
    
    // Function to update model statistics display
    function updateModelStatisticsDisplay() {
        const statsContainer = document.getElementById('model-stats-container');
        if (!statsContainer) return;
        
        // No stats available
        if (Object.keys(modelUsageStats).length === 0) {
            statsContainer.innerHTML = '<div style="text-align:center; padding:1rem;">No usage statistics available yet</div>';
            return;
        }
        
        // Sort models by usage count
        const sortedModels = Object.entries(modelUsageStats)
            .sort(([, statsA], [, statsB]) => (statsB.usageCount || 0) - (statsA.usageCount || 0))
            .slice(0, 5); // Top 5
        
        // Create stats HTML
        let html = '<div style="font-weight:bold; margin-bottom:0.5rem;">Most Used Models</div>';
        
        if (sortedModels.length === 0) {
            html += '<div style="text-align:center; padding:0.5rem;">No models have been used yet</div>';
        } else {
            html += '<div style="display:flex; flex-direction:column; gap:0.5rem;">';
            
            sortedModels.forEach(([modelName, stats]) => {
                if (stats.usageCount > 0) {
                    // Calculate width percentage (max 100%)
                    const maxUsage = sortedModels[0][1].usageCount;
                    const percentage = Math.min(100, Math.round((stats.usageCount / maxUsage) * 100));
                    
                    html += `
                        <div style="display:flex; flex-direction:column; gap:0.25rem;">
                            <div style="display:flex; justify-content:space-between;">
                                <span>${modelName}</span>
                                <span>${stats.usageCount} uses</span>
                            </div>
                            <div style="height:0.5rem; background-color:#e9ecef; border-radius:0.25rem; overflow:hidden;">
                                <div style="width:${percentage}%; height:100%; background-color:#0d6efd;"></div>
                            </div>
                        </div>
                    `;
                }
            });
            
            html += '</div>';
        }
        
        // Add last used model if available
        const lastUsedModel = Object.entries(modelUsageStats)
            .filter(([, stats]) => stats.lastUsed)
            .sort(([, statsA], [, statsB]) => new Date(statsB.lastUsed) - new Date(statsA.lastUsed))[0];
        
        if (lastUsedModel) {
            html += `
                <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid #dee2e6;">
                    <div style="font-weight:bold; margin-bottom:0.5rem;">Last Used Model</div>
                    <div>${lastUsedModel[0]}</div>
                    <div style="font-size:0.75rem; color:#6c757d;">
                        ${new Date(lastUsedModel[1].lastUsed).toLocaleString()}
                    </div>
                </div>
            `;
        }
        
        // Set HTML content
        statsContainer.innerHTML = html;
    }
    
    // Function to record model usage
    function recordModelUsage(modelName) {
        if (!modelName) return;
        
        // Initialize if needed
        if (!modelUsageStats[modelName]) {
            modelUsageStats[modelName] = {
                usageCount: 0,
                firstUsed: new Date().toISOString(),
                lastUsed: null
            };
        }
        
        // Update stats
        modelUsageStats[modelName].usageCount++;
        modelUsageStats[modelName].lastUsed = new Date().toISOString();
        
        // Save to localStorage
        try {
            localStorage.setItem('modelUsageStats', JSON.stringify(modelUsageStats));
        } catch (error) {
            console.warn('Error saving model usage statistics:', error);
        }
        
        // Update display
        updateModelStatisticsDisplay();
    }
    
    // Function to apply parameter preset
    function applyParameterPreset(preset, specificModel = null) {
        // Find current model if not specified
        const modelSelect = document.getElementById('model-select');
        const modelName = specificModel || (modelSelect ? modelSelect.value : null);
        
        if (!modelName) {
            alert('No model selected');
            return;
        }
        
        // Find model data
        const model = emergencyModels.find(m => m.name === modelName);
        const family = model ? model.family.toLowerCase() : 'unknown';
        
        // Get preset parameters
        const params = getParamPreset(modelName, family, preset);
        
        // Try to find parameter controls
        const temperatureInput = document.querySelector('#temperature-input, #temperature, [name="temperature"]');
        const topPInput = document.querySelector('#top-p-input, #top_p, [name="top_p"]');
        const topKInput = document.querySelector('#top-k-input, #top_k, [name="top_k"]');
        const maxTokensInput = document.querySelector('#max-tokens-input, #max_tokens, [name="max_tokens"]');
        const repetitionPenaltyInput = document.querySelector('#repetition-penalty-input, #repetition_penalty, [name="repetition_penalty"]');
        
        // Apply parameters if controls exist
        if (temperatureInput) temperatureInput.value = params.temperature;
        if (topPInput) topPInput.value = params.top_p;
        if (topKInput) topKInput.value = params.top_k;
        if (maxTokensInput) maxTokensInput.value = params.max_tokens;
        if (repetitionPenaltyInput) repetitionPenaltyInput.value = params.repetition_penalty;
        
        // Save preferences to localStorage
        saveParameterPreference(modelName, preset);
        
        // Show success message
        alert(`Applied ${preset} parameters for ${modelName}`);
    }
    
    // Function to apply speed preset
    function applySpeedPreset(speed) {
        // Find current model
        const modelSelect = document.getElementById('model-select');
        const modelName = modelSelect ? modelSelect.value : null;
        
        if (!modelName) {
            alert('No model selected');
            return;
        }
        
        // Find model data
        const model = emergencyModels.find(m => m.name === modelName);
        const family = model ? model.family.toLowerCase() : 'unknown';
        
        // Get speed parameters based on model and speed setting
        let params = {
            temperature: 0.7,
            max_tokens: 1024
        };
        
        switch (speed) {
            case 'fast':
                params = {
                    temperature: 0.6,
                    top_p: 0.9,
                    top_k: 30,
                    max_tokens: 512
                };
                break;
                
            case 'medium':
                params = {
                    temperature: 0.7,
                    top_p: 0.95,
                    top_k: 40,
                    max_tokens: 1024
                };
                break;
                
            case 'slow':
                params = {
                    temperature: 0.8,
                    top_p: 0.9,
                    top_k: 50,
                    max_tokens: 2048
                };
                break;
        }
        
        // Apply for multimodal models
        if (modelName.includes('llava') || modelName.includes('vision')) {
            if (speed === 'fast') {
                params.temperature = 0.5;
                params.top_p = 0.75;
                params.top_k = 10;
                params.max_tokens = 256;
            } else if (speed === 'medium') {
                params.temperature = 0.6;
                params.top_p = 0.85;
                params.top_k = 20;
                params.max_tokens = 512;
            } else {
                params.temperature = 0.7;
                params.top_p = 0.9;
                params.top_k = 30;
                params.max_tokens = 768;
            }
        }
        
        // Try to find parameter controls
        const temperatureInput = document.querySelector('#temperature-input, #temperature, [name="temperature"]');
        const topPInput = document.querySelector('#top-p-input, #top_p, [name="top_p"]');
        const topKInput = document.querySelector('#top-k-input, #top_k, [name="top_k"]');
        const maxTokensInput = document.querySelector('#max-tokens-input, #max_tokens, [name="max_tokens"]');
        
        // Apply parameters if controls exist
        if (temperatureInput) temperatureInput.value = params.temperature;
        if (topPInput) topPInput.value = params.top_p;
        if (topKInput) topKInput.value = params.top_k;
        if (maxTokensInput) maxTokensInput.value = params.max_tokens;
        
        // Save speed preference to localStorage
        saveSpeedPreference(modelName, speed);
        
        // Show success message
        alert(`Applied ${speed} speed settings for ${modelName}`);
    }
    
    // Function to save parameter preference
    function saveParameterPreference(modelName, preset) {
        try {
            // Load existing preferences
            let paramPreferences = {};
            const storedPrefs = localStorage.getItem('parameterPreferences');
            if (storedPrefs) {
                paramPreferences = JSON.parse(storedPrefs);
            }
            
            // Update preferences
            paramPreferences[modelName] = {
                preset,
                timestamp: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('parameterPreferences', JSON.stringify(paramPreferences));
        } catch (error) {
            console.warn('Error saving parameter preferences:', error);
        }
    }
    
    // Function to save speed preference
    function saveSpeedPreference(modelName, speed) {
        try {
            // Load existing preferences
            let speedPreferences = {};
            const storedPrefs = localStorage.getItem('speedPreferences');
            if (storedPrefs) {
                speedPreferences = JSON.parse(storedPrefs);
            }
            
            // Update preferences
            speedPreferences[modelName] = {
                speed,
                timestamp: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('speedPreferences', JSON.stringify(speedPreferences));
        } catch (error) {
            console.warn('Error saving speed preferences:', error);
        }
    }
    
    // Helper function to get parameter preset
    function getParamPreset(modelName, family, preset) {
        // Default values
        let params = {
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            max_tokens: 2048,
            repetition_penalty: 1.1
        };
        
        // Adjust based on model family
        if (family.includes('llama')) {
            params = {
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                max_tokens: 2048,
                repetition_penalty: 1.1
            };
        } else if (family.includes('mistral')) {
            params = {
                temperature: 0.7,
                top_p: 0.95,
                top_k: 40,
                max_tokens: 2048,
                repetition_penalty: 1.1
            };
        } else if (family.includes('gemma')) {
            params = {
                temperature: 0.7,
                top_p: 0.95,
                top_k: 30,
                max_tokens: 2048,
                repetition_penalty: 1.1
            };
        } else if (family.includes('phi')) {
            params = {
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                max_tokens: 2048,
                repetition_penalty: 1.1
            };
        }
        
        // Adjust for multimodal
        if (modelName.includes('llava') || modelName.includes('vision')) {
            params = {
                temperature: 0.65,
                top_p: 0.85,
                top_k: 30,
                max_tokens: 1024,
                repetition_penalty: 1.1
            };
        }
        
        // Apply preset modifications
        if (preset === 'creative') {
            params.temperature = 0.8;
            params.top_p = 0.9;
            params.top_k = 50;
            params.repetition_penalty = 1.1;
        } else if (preset === 'balanced') {
            // Already set to balanced defaults
        } else if (preset === 'precise') {
            params.temperature = 0.6;
            params.top_p = 0.8;
            params.top_k = 30;
            params.repetition_penalty = 1.2;
        }
        
        return params;
    }
    
    // Helper function to get recommended parameter value
    function getRecommendedParam(modelName, paramName) {
        // Get default parameters for the model
        const model = emergencyModels.find(m => m.name === modelName);
        const family = model ? model.family.toLowerCase() : 'unknown';
        
        // Get balanced preset which contains default values
        const params = getParamPreset(modelName, family, 'balanced');
        
        return params[paramName] || 'Unknown';
    }
    
    // Helper function to get best use case based on model
    function getBestUseCase(modelName, family) {
        if (modelName.includes('llava') || modelName.includes('vision')) {
            return 'Image analysis and description';
        }
        
        if (family.toLowerCase().includes('llama')) {
            return 'Complex reasoning, general-purpose tasks';
        }
        
        if (family.toLowerCase().includes('mistral')) {
            return 'Fast responses, general tasks, concise outputs';
        }
        
        if (family.toLowerCase().includes('gemma')) {
            return 'General conversation, text generation, creative writing';
        }
        
        if (family.toLowerCase().includes('phi')) {
            return 'Specialized tasks, efficient reasoning';
        }
        
        if (modelName.includes('uncensored')) {
            return 'Creative content without restrictions';
        }
        
        return 'General conversational AI and text generation';
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
        
        // Update all model items to remove active status
        document.querySelectorAll('.emergency-model-item').forEach(item => {
            item.style.borderColor = '#dee2e6';
            
            // Remove active indicator if it exists
            const activeIndicator = item.querySelector('.active-model-indicator');
            if (activeIndicator) {
                activeIndicator.remove();
            }
        });
        
        // Select the model
        modelSelect.value = modelName;
        
        // Trigger change event
        modelSelect.dispatchEvent(new Event('change'));
        
        // Record usage
        recordModelUsage(modelName);
        
        // Highlight the selected model
        highlightCurrentModel(modelName);
        
        // Try to apply saved parameter preferences
        try {
            const storedPrefs = localStorage.getItem('parameterPreferences');
            if (storedPrefs) {
                const paramPreferences = JSON.parse(storedPrefs);
                if (paramPreferences[modelName]) {
                    const preset = paramPreferences[modelName].preset;
                    
                    // Update UI to show the active preset
                    const presetButtons = document.querySelectorAll('.preset-btn');
                    presetButtons.forEach(btn => {
                        const btnPreset = btn.getAttribute('data-preset');
                        
                        if (btnPreset === preset) {
                            btn.style.backgroundColor = '#0d6efd';
                            btn.style.color = 'white';
                            btn.style.fontWeight = 'bold';
                        } else {
                            btn.style.backgroundColor = 'white';
                            btn.style.color = 'black';
                            btn.style.fontWeight = 'normal';
                        }
                    });
                    
                    // Apply the preset
                    applyParameterPreset(preset, modelName);
                }
            }
        } catch (error) {
            console.warn('Error applying saved parameter preferences:', error);
        }
        
        // Try to apply saved speed preferences
        try {
            const storedPrefs = localStorage.getItem('speedPreferences');
            if (storedPrefs) {
                const speedPreferences = JSON.parse(storedPrefs);
                if (speedPreferences[modelName]) {
                    const speed = speedPreferences[modelName].speed;
                    
                    // Update UI to show the active speed
                    const speedButtons = document.querySelectorAll('.speed-btn');
                    speedButtons.forEach(btn => {
                        const btnSpeed = btn.getAttribute('data-speed');
                        
                        if (btnSpeed === speed) {
                            btn.style.backgroundColor = '#0d6efd';
                            btn.style.color = 'white';
                            btn.style.fontWeight = 'bold';
                        } else {
                            btn.style.backgroundColor = 'white';
                            btn.style.color = 'black';
                            btn.style.fontWeight = 'normal';
                        }
                    });
                    
                    // Apply the speed preset
                    applySpeedPreset(speed);
                }
            }
        } catch (error) {
            console.warn('Error applying saved speed preferences:', error);
        }
        
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
