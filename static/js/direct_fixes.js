/**
 * Direct Fixes for Free Thinkers
 * This file contains direct fixes for UI elements that aren't working properly
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Applying direct fixes...');
    
    // Add emergency CSS overrides for model sidebar
    const style = document.createElement('style');
    style.innerHTML = `
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
        }
        
        /* Show model items */
        .model-item {
            display: flex !important;
            visibility: visible !important;
            padding: 10px !important;
            margin-bottom: 10px !important;
            border: 1px solid #dee2e6 !important;
            border-radius: 4px !important;
            background-color: white !important;
        }
        
        /* Dark mode overrides */
        body.dark-mode .model-item {
            background-color: #333 !important;
            border-color: #444 !important;
        }
        
        body.dark-mode #modelsList {
            background-color: #222 !important;
        }
    `;
    document.head.appendChild(style);
    console.log('Added emergency CSS overrides for model sidebar');
    
    // Run model management sidebar fix on page load to ensure it's fixed before user interaction
    setTimeout(function() {
        const modelSidebar = document.getElementById('model-management-sidebar');
        if (modelSidebar) {
            console.log('Running pre-emptive model sidebar fixes');
            
            // Make sure models list container exists
            const modelsList = document.getElementById('modelsList');
            if (!modelsList) {
                console.error('modelsList container not found, trying to add it');
                
                // Try to find the models-overview-section where it should be
                const modelsSection = modelSidebar.querySelector('.models-overview-section');
                if (modelsSection) {
                    // Create a fresh container
                    const newModelsList = document.createElement('div');
                    newModelsList.id = 'modelsList';
                    newModelsList.className = 'models-list';
                    newModelsList.style.display = 'block';
                    newModelsList.style.visibility = 'visible';
                    newModelsList.style.minHeight = '300px';
                    newModelsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading models...</div>';
                    
                    // Add it to the DOM
                    modelsSection.appendChild(newModelsList);
                    console.log('Created new modelsList container');
                }
            }
        }
    }, 500);
    
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
        const closeParamBtn = paramSidebar.querySelector('.btn-close');
        if (closeParamBtn) {
            closeParamBtn.addEventListener('click', function() {
                paramSidebar.classList.remove('active');
            });
        }
    }
    
    // Fix for models button
    const modelBtn = document.getElementById('model-management-btn');
    const modelSidebar = document.getElementById('model-management-sidebar');
    
    // Create a completely new sidebar
    function createNewModelSidebar() {
        console.log('Creating brand new model sidebar');
        
        // First, remove the old sidebar if it exists
        const oldSidebar = document.getElementById('model-management-sidebar');
        if (oldSidebar) {
            oldSidebar.remove();
        }
        
        // Create a new sidebar element
        const newSidebar = document.createElement('div');
        newSidebar.id = 'new-model-sidebar';
        newSidebar.className = 'new-model-sidebar';
        
        // Set up styling
        newSidebar.style.position = 'fixed';
        newSidebar.style.top = '0';
        newSidebar.style.right = '-400px'; // Start off-screen
        newSidebar.style.width = '400px';
        newSidebar.style.height = '100%';
        newSidebar.style.backgroundColor = 'white';
        newSidebar.style.boxShadow = '-2px 0 10px rgba(0,0,0,0.15)';
        newSidebar.style.zIndex = '10000';
        newSidebar.style.transition = 'right 0.3s ease';
        newSidebar.style.overflowY = 'auto';
        newSidebar.style.display = 'block';
        newSidebar.style.padding = '0';
        
        // Dark mode compatibility
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            newSidebar.style.backgroundColor = '#222';
            newSidebar.style.color = '#f8f9fa';
        }
        
        // Create the content
        newSidebar.innerHTML = `
            <div style="padding: 1rem; border-bottom: 1px solid ${isDarkMode ? '#444' : '#dee2e6'}; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 1.2rem; font-weight: 600;">Model Management</h3>
                <button id="close-new-model-sidebar" style="background: none; border: none; font-size: 1.25rem; cursor: pointer; padding: 0 0.5rem;">×</button>
            </div>
            <div style="padding: 1rem;">
                <div style="margin-bottom: 1rem;">
                    <h4 style="margin-top: 0; font-size: 1.1rem;">Available Models</h4>
                    <div id="new-models-list" style="margin-top: 1rem;">
                        <div style="text-align: center; padding: 2rem;">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <div>Loading models...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(newSidebar);
        
        // Set up close button handler
        const closeBtn = document.getElementById('close-new-model-sidebar');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                newSidebar.style.right = '-400px';
            });
        }
        
        // Load models
        fetch('http://localhost:11434/api/tags')
            .then(response => response.json())
            .then(data => {
                console.log('Loaded models for new sidebar:', data.models.length);
                
                const modelsList = document.getElementById('new-models-list');
                if (!modelsList) return;
                
                let html = '';
                if (data.models && data.models.length > 0) {
                    data.models.forEach(model => {
                        html += `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; margin-bottom: 0.75rem; border: 1px solid ${isDarkMode ? '#444' : '#dee2e6'}; border-radius: 4px; background-color: ${isDarkMode ? '#333' : 'white'};">
                                <div style="flex: 1;">
                                    <div style="font-weight: 500;">${model.name}</div>
                                    <div style="font-size: 0.85rem; color: ${isDarkMode ? '#adb5bd' : '#6c757d'};">
                                        ${formatFileSize(model.size || 0)}
                                    </div>
                                </div>
                                <button class="select-model-btn" data-model="${model.name}" style="padding: 0.25rem 0.5rem; background-color: #0d6efd; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
                                    Use
                                </button>
                            </div>
                        `;
                    });
                } else {
                    html = '<div style="text-align: center; padding: 2rem;">No models found</div>';
                }
                
                modelsList.innerHTML = html;
                
                // Set up model selection
                document.querySelectorAll('.select-model-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const modelName = this.getAttribute('data-model');
                        const modelSelect = document.getElementById('model-select');
                        if (modelSelect) {
                            modelSelect.value = modelName;
                            modelSelect.dispatchEvent(new Event('change'));
                            
                            // Show confirmation
                            alert(`Model changed to ${modelName}`);
                            
                            // Close sidebar
                            newSidebar.style.right = '-400px';
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching models for new sidebar:', error);
                const modelsList = document.getElementById('new-models-list');
                if (modelsList) {
                    modelsList.innerHTML = `
                        <div style="text-align: center; padding: 2rem; color: #dc3545;">
                            <div>Error loading models: ${error.message}</div>
                        </div>
                    `;
                }
            });
        
        return newSidebar;
    }
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Create the sidebar
    let newModelSidebar;
    
    // Set up button handler
    const modelManagementBtn = document.getElementById('model-management-btn');
    if (modelManagementBtn) {
        console.log('Setting up handler for completely new sidebar');
        
        modelManagementBtn.addEventListener('click', function() {
            console.log('Model button clicked - using new sidebar');
            
            // Close all other sidebars
            closeAllSidebars();
            
            // Create sidebar if it doesn't exist
            if (!newModelSidebar) {
                newModelSidebar = createNewModelSidebar();
            }
            
            // Toggle sidebar
            if (newModelSidebar.style.right === '0px') {
                newModelSidebar.style.right = '-400px';
            } else {
                newModelSidebar.style.right = '0px';
            }
        });
    }
    
    // Fix for conversations button
    const convBtn = document.getElementById('conversation-manager-btn');
    const convSidebar = document.getElementById('conversation-manager-sidebar');
    
    if (convBtn && convSidebar) {
        console.log('Setting up direct conversation button handler');
        convBtn.addEventListener('click', function() {
            console.log('Conversation button clicked');
            closeAllSidebars();
            convSidebar.classList.toggle('active');
        });
        
        // Also set up close button
        const closeConvBtn = convSidebar.querySelector('.btn-close');
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
