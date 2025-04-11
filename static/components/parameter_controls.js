/**
 * Parameter Controls Component
 * 
 * This script handles the model parameter controls functionality, including:
 * - Adjusting model parameters (temperature, top_p, top_k, etc.)
 * - Presets for different types of responses
 * - Real-time updates to the chat parameters
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    let parameterControlsBtn = document.getElementById('parameter-controls-btn');
    const closeParameterControls = document.getElementById('close-parameter-controls');
    const parameterControlsSidebar = document.getElementById('parameter-controls-sidebar');
    const saveParameters = document.getElementById('save-parameters');
    const resetParameters = document.getElementById('reset-parameters');
    
    // Parameter sliders
    const temperatureSlider = document.getElementById('temperature-slider');
    const topPSlider = document.getElementById('top-p-slider');
    const topKSlider = document.getElementById('top-k-slider');
    const repetitionPenaltySlider = document.getElementById('repetition-penalty-slider');
    const contextWindowSlider = document.getElementById('context-window-slider');
    
    // Parameter values
    const sliders = [temperatureSlider, topPSlider, topKSlider, repetitionPenaltySlider, contextWindowSlider];
    
    // Preset buttons
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    // Parameter presets
    const presets = {
        balanced: {
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            repetition_penalty: 1.1,
            context_window: 2048
        },
        creative: {
            temperature: 0.9,
            top_p: 0.95,
            top_k: 50,
            repetition_penalty: 1.0,
            context_window: 2048
        },
        precise: {
            temperature: 0.3,
            top_p: 0.7,
            top_k: 20,
            repetition_penalty: 1.2,
            context_window: 2048
        }
    };
    
    // Current parameters
    let currentParameters = { ...presets.balanced };
    
    // Check if the button exists, if not, create it (for backwards compatibility)
    if (!parameterControlsBtn) {
        console.warn('Parameter controls button not found, creating a fallback');
        const btn = document.createElement('button');
        btn.id = 'parameter-controls-btn';
        btn.className = 'parameter-controls-btn';
        btn.title = 'Parameter Controls';
        btn.innerHTML = '<i class="fas fa-sliders-h"></i>';
        document.body.appendChild(btn);
        
        // Re-get the element
        parameterControlsBtn = document.getElementById('parameter-controls-btn');
    }
    
    // Event Listeners
    if (parameterControlsBtn) {
        parameterControlsBtn.addEventListener('click', function() {
            // Use the global toggleSidebar if available, otherwise fall back to original behavior
            if (window.toggleSidebar && typeof window.toggleSidebar === 'function') {
                window.toggleSidebar(parameterControlsSidebar, parameterControlsBtn);
            } else {
                parameterControlsSidebar.classList.add('active');
            }
            loadCurrentParameters();
        });
    }
    
    if (closeParameterControls) {
        closeParameterControls.addEventListener('click', function() {
            parameterControlsSidebar.classList.remove('active');
            
            // Also remove active class from the button if using the new UI
            if (parameterControlsBtn) {
                parameterControlsBtn.classList.remove('active');
            }
            
            // Update activeSidebar if it's a global variable
            if (window.activeSidebar !== undefined) {
                window.activeSidebar = null;
            }
        });
    }
    
    // Make sure the parameter controls button has event listeners
    if (parameterControlsBtn) {
        parameterControlsBtn.addEventListener('click', function() {
            // Use the global toggleSidebar if available, otherwise fall back to original behavior
            if (window.toggleSidebar && typeof window.toggleSidebar === 'function') {
                window.toggleSidebar(parameterControlsSidebar, parameterControlsBtn);
            } else {
                parameterControlsSidebar.classList.add('active');
            }
            loadCurrentParameters();
        });
    }
    
    if (closeParameterControls) {
        closeParameterControls.addEventListener('click', function() {
            parameterControlsSidebar.classList.remove('active');
            
            // Also remove active class from the button if using the new UI
            if (parameterControlsBtn) {
                parameterControlsBtn.classList.remove('active');
            }
            
            // Update activeSidebar if it's a global variable
            if (window.activeSidebar !== undefined) {
                window.activeSidebar = null;
            }
        });
    }
    
    // Add event listeners to sliders
    sliders.forEach(slider => {
        if (slider) {
            // Update value display
            slider.addEventListener('input', function() {
                updateSliderValue(this);
                updateCurrentParameters();
            });
        }
    });
    
    // Add event listeners to preset buttons
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const preset = this.dataset.preset;
            applyPreset(preset);
        });
    });
    
    // Save parameters
    if (saveParameters) {
        saveParameters.addEventListener('click', function() {
            saveCurrentParameters();
        });
    }
    
    // Reset parameters
    if (resetParameters) {
        resetParameters.addEventListener('click', function() {
            resetToDefault();
        });
    }
    
    /**
     * Update the displayed value for a slider
     */
    function updateSliderValue(slider) {
        const valueDisplay = slider.parentElement.querySelector('.slider-value');
        if (valueDisplay) {
            valueDisplay.textContent = slider.value;
        }
    }
    
    /**
     * Update current parameters from slider values
     */
    function updateCurrentParameters() {
        if (temperatureSlider) currentParameters.temperature = parseFloat(temperatureSlider.value);
        if (topPSlider) currentParameters.top_p = parseFloat(topPSlider.value);
        if (topKSlider) currentParameters.top_k = parseInt(topKSlider.value);
        if (repetitionPenaltySlider) currentParameters.repetition_penalty = parseFloat(repetitionPenaltySlider.value);
        if (contextWindowSlider) currentParameters.context_window = parseInt(contextWindowSlider.value);
        
        // Update parameter display in the chat interface
        if (typeof updateParameterDisplay === 'function') {
            updateParameterDisplay(currentParameters);
        }
        
        // Update token visualization if available
        if (typeof updateTokenVisualization === 'function') {
            const userInput = document.getElementById('user-input');
            const modelSelect = document.getElementById('model-select');
            if (userInput && modelSelect) {
                updateTokenVisualization(userInput.value, modelSelect.value);
            }
        }
    }
    
    /**
     * Apply a preset to the sliders
     */
    function applyPreset(presetName) {
        if (!presets[presetName]) return;
        
        const preset = presets[presetName];
        
        // Update sliders
        if (temperatureSlider) {
            temperatureSlider.value = preset.temperature;
            updateSliderValue(temperatureSlider);
        }
        
        if (topPSlider) {
            topPSlider.value = preset.top_p;
            updateSliderValue(topPSlider);
        }
        
        if (topKSlider) {
            topKSlider.value = preset.top_k;
            updateSliderValue(topKSlider);
        }
        
        if (repetitionPenaltySlider) {
            repetitionPenaltySlider.value = preset.repetition_penalty;
            updateSliderValue(repetitionPenaltySlider);
        }
        
        if (contextWindowSlider) {
            contextWindowSlider.value = preset.context_window;
            updateSliderValue(contextWindowSlider);
        }
        
        // Update current parameters
        currentParameters = { ...preset };
        
        // Show notification
        showNotification(`Applied ${presetName} preset`);
    }
    
    /**
     * Save current parameters to localStorage
     */
    function saveCurrentParameters() {
        try {
            localStorage.setItem('freethinkers-parameters', JSON.stringify(currentParameters));
            showNotification('Parameters saved');
        } catch (error) {
            console.error('Error saving parameters:', error);
            showNotification('Error saving parameters', 'error');
        }
    }
    
    /**
     * Load current parameters from localStorage
     */
    function loadCurrentParameters() {
        try {
            // Try to load model-specific parameters first
            let modelSpecificParams = null;
            
            // Get current model
            const modelSelect = document.getElementById('model-select');
            const currentModel = modelSelect ? modelSelect.value : '';
            
            if (currentModel) {
                const modelSettings = localStorage.getItem('freethinkers-model-settings');
                if (modelSettings) {
                    const settings = JSON.parse(modelSettings);
                    if (settings[currentModel]) {
                        modelSpecificParams = settings[currentModel];
                    }
                }
            }
            
            // If we have model-specific parameters, use those
            if (modelSpecificParams) {
                // Update sliders
                if (temperatureSlider && modelSpecificParams.temperature !== undefined) {
                    temperatureSlider.value = modelSpecificParams.temperature;
                    updateSliderValue(temperatureSlider);
                }
                
                if (topPSlider && modelSpecificParams.top_p !== undefined) {
                    topPSlider.value = modelSpecificParams.top_p;
                    updateSliderValue(topPSlider);
                }
                
                if (topKSlider && modelSpecificParams.top_k !== undefined) {
                    topKSlider.value = modelSpecificParams.top_k;
                    updateSliderValue(topKSlider);
                }
                
                if (repetitionPenaltySlider && modelSpecificParams.repetition_penalty !== undefined) {
                    repetitionPenaltySlider.value = modelSpecificParams.repetition_penalty;
                    updateSliderValue(repetitionPenaltySlider);
                }
                
                if (contextWindowSlider && modelSpecificParams.context_window !== undefined) {
                    contextWindowSlider.value = modelSpecificParams.context_window;
                    updateSliderValue(contextWindowSlider);
                }
                
                // Update current parameters
                currentParameters = { ...modelSpecificParams };
                return;
            }
            
            // Fall back to global parameters
            const savedParams = localStorage.getItem('freethinkers-parameters');
            if (savedParams) {
                const params = JSON.parse(savedParams);
                
                // Update sliders
                if (temperatureSlider && params.temperature !== undefined) {
                    temperatureSlider.value = params.temperature;
                    updateSliderValue(temperatureSlider);
                }
                
                if (topPSlider && params.top_p !== undefined) {
                    topPSlider.value = params.top_p;
                    updateSliderValue(topPSlider);
                }
                
                if (topKSlider && params.top_k !== undefined) {
                    topKSlider.value = params.top_k;
                    updateSliderValue(topKSlider);
                }
                
                if (repetitionPenaltySlider && params.repetition_penalty !== undefined) {
                    repetitionPenaltySlider.value = params.repetition_penalty;
                    updateSliderValue(repetitionPenaltySlider);
                }
                
                if (contextWindowSlider && params.context_window !== undefined) {
                    contextWindowSlider.value = params.context_window;
                    updateSliderValue(contextWindowSlider);
                }
                
                // Update current parameters
                currentParameters = { ...params };
            }
        } catch (error) {
            console.error('Error loading parameters:', error);
        }
    }
    
    /**
     * Reset parameters to default (balanced)
     */
    function resetToDefault() {
        applyPreset('balanced');
        saveCurrentParameters();
    }
    
    /**
     * Show a notification message
     */
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
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
     * Get current parameters for use in chat
     */
    window.getCurrentParameters = function() {
        return { ...currentParameters };
    };
    
    // Initialize parameters on load
    loadCurrentParameters();
});
