/**
 * Model Management Component
 * 
 * This script handles the model management functionality, including:
 * - Listing available models
 * - Downloading new models with progress indicators
 * - Tracking model versions and status
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const modelManagementBtn = document.getElementById('modelManagementBtn');
    const closeModelManagement = document.getElementById('closeModelManagement');
    const modelManagementSidebar = document.getElementById('modelManagementSidebar');
    const modelsList = document.getElementById('modelsList');
    const downloadModelBtn = document.getElementById('downloadModelBtn');
    const modelName = document.getElementById('modelName');
    const downloadProgress = document.getElementById('downloadProgress');
    const progressBar = document.querySelector('#downloadProgress .progress-bar');
    const progressText = document.getElementById('progressText');
    
    // Add toggle button to the UI if it doesn't exist
    if (!modelManagementBtn) {
        const btn = document.createElement('button');
        btn.id = 'modelManagementBtn';
        btn.className = 'model-management-btn';
        btn.innerHTML = '<i class="fas fa-server"></i>';
        btn.title = 'Model Management';
        document.body.appendChild(btn);
        
        // Re-get the element
        modelManagementBtn = document.getElementById('modelManagementBtn');
    }
    
    // Event Listeners
    if (modelManagementBtn) {
        modelManagementBtn.addEventListener('click', function() {
            modelManagementSidebar.classList.add('active');
            loadModels();
        });
    }
    
    if (closeModelManagement) {
        closeModelManagement.addEventListener('click', function() {
            modelManagementSidebar.classList.remove('active');
        });
    }
    
    if (downloadModelBtn) {
        downloadModelBtn.addEventListener('click', function() {
            downloadModel();
        });
    }
    
    /**
     * Load available models from the server
     */
    async function loadModels() {
        try {
            if (!modelsList) return;
            
            modelsList.innerHTML = '<div class="loading">Loading models...</div>';
            
            // Use the correct API endpoint
            const response = await fetch('/api/models');
            if (!response.ok) {
                throw new Error(`Failed to load models: ${response.status}`);
            }
            
            const models = await response.json();
            
            if (models.length === 0) {
                modelsList.innerHTML = '<div class="no-models">No models available</div>';
                return;
            }
            
            let html = '';
            for (const model of models) {
                html += createModelItem(model);
            }
            
            modelsList.innerHTML = html;
            
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
        } catch (error) {
            console.error('Error loading models:', error);
            modelsList.innerHTML = `<div class="error">Error loading models: ${error.message}</div>`;
        }
    }
    
    /**
     * Create HTML for a model item
     */
    function createModelItem(model) {
        return `
            <div class="model-item" data-model="${model}">
                <div class="model-info">
                    <div class="model-name">${model}</div>
                    <div class="model-meta">
                        <span class="model-size">Click for details</span>
                    </div>
                </div>
                <div class="model-actions">
                    <button class="btn btn-sm btn-primary select-model" title="Use this model">
                        <i class="fas fa-check"></i>
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
            // Use the correct API endpoint
            const response = await fetch(`/api/models/${encodeURIComponent(modelName)}`);
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
            console.error('Error showing model details:', error);
            alert(`Error: ${error.message}`);
        }
    }
    
    /**
     * Select a model for use in the chat
     */
    function selectModel(modelName) {
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            // Check if this model is already selected
            const isAlreadySelected = modelSelect.value === modelName;
            
            // Update dropdown value
            modelSelect.value = modelName;
            
            // Trigger change event
            modelSelect.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Update visual indication of selected model in sidebar
            document.querySelectorAll('.model-item').forEach(item => {
                const itemModelName = item.dataset.model;
                
                if (itemModelName === modelName) {
                    item.classList.add('active');
                    
                    // Update the select button text if it's already selected
                    const selectBtn = item.querySelector('.select-model') || 
                                       item.querySelector('.select-model-btn');
                                       
                    if (selectBtn) {
                        if (isAlreadySelected) {
                            selectBtn.innerHTML = '<i class="fas fa-check"></i> Current';
                            selectBtn.classList.add('btn-success');
                            selectBtn.classList.remove('btn-primary');
                        } else {
                            selectBtn.innerHTML = '<i class="fas fa-check"></i>';
                            selectBtn.classList.add('btn-primary');
                            selectBtn.classList.remove('btn-success');
                        }
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
                }
            });
            
            // Close sidebar
            modelManagementSidebar.classList.remove('active');
            
            // Show notification
            showNotification(`Model ${modelName} selected`);
        }
    }
    
    /**
     * Download a new model
     */
    async function downloadModel() {
        try {
            const name = modelName.value.trim();
            
            if (!name) {
                alert('Please enter a model name');
                return;
            }
            
            // Show progress
            downloadProgress.style.display = 'block';
            progressBar.style.width = '0%';
            progressText.textContent = 'Starting download...';
            downloadModelBtn.disabled = true;
            
            // Use the correct API endpoint
            const response = await fetch('/api/models/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to download model: ${response.status}`);
            }
            
            // Start polling for progress
            const progressInterval = setInterval(async () => {
                try {
                    const progressResponse = await fetch(`/api/models/${encodeURIComponent(name)}`);
                    if (progressResponse.ok) {
                        const data = await progressResponse.json();
                        
                        // Model exists, download complete
                        clearInterval(progressInterval);
                        progressBar.style.width = '100%';
                        progressText.textContent = 'Download complete!';
                        
                        setTimeout(() => {
                            downloadProgress.style.display = 'none';
                            downloadModelBtn.disabled = false;
                            modelName.value = '';
                            loadModels(); // Refresh models list
                            showNotification(`Model ${name} downloaded successfully`);
                        }, 2000);
                    } else {
                        // Still downloading, update progress (simulated)
                        const currentWidth = parseInt(progressBar.style.width) || 0;
                        if (currentWidth < 90) {
                            const newWidth = currentWidth + 5;
                            progressBar.style.width = `${newWidth}%`;
                            progressText.textContent = `${newWidth}%`;
                        }
                    }
                } catch (error) {
                    console.error('Error checking download progress:', error);
                }
            }, 1000);
            
        } catch (error) {
            console.error('Error downloading model:', error);
            alert(`Error: ${error.message}`);
            downloadProgress.style.display = 'none';
            downloadModelBtn.disabled = false;
        }
    }
    
    /**
     * Show a notification message
     */
    function showNotification(message) {
        // Use the global notification system if available
        if (window.showToast) {
            // Use toast for model changes (matches Free Thinkers UI)
            window.showToast(message, 'success', 3000);
            return;
        } else if (window.showNotification) {
            // Fallback to the standard notification
            window.showNotification(message, 'success', 3000);
            return;
        }
        
        // Legacy fallback if notification system is not available
        const notification = document.createElement('div');
        notification.className = 'notification notification-success';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
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
});
