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
    const parameterControlsBtn = document.getElementById('parameterControlsBtn');
    const closeParameterControls = document.getElementById('closeParameterControls');
    const parameterControlsSidebar = document.getElementById('parameterControlsSidebar');
    const saveParameters = document.getElementById('saveParameters');
    const resetParameters = document.getElementById('resetParameters');
    
    // Parameter sliders
    const temperatureSlider = document.getElementById('temperatureSlider');
    const topPSlider = document.getElementById('topPSlider');
    const topKSlider = document.getElementById('topKSlider');
    const repetitionPenaltySlider = document.getElementById('repetitionPenaltySlider');
    const contextWindowSlider = document.getElementById('contextWindowSlider');
    
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
    
    // Add toggle button to the UI if it doesn't exist
    if (!parameterControlsBtn) {
        const btn = document.createElement('button');
        btn.id = 'parameterControlsBtn';
        btn.className = 'parameter-controls-btn';
        btn.innerHTML = '<i class="fas fa-sliders-h"></i>';
        btn.title = 'Parameter Controls';
        document.body.appendChild(btn);
        
        // Re-get the element
        parameterControlsBtn = document.getElementById('parameterControlsBtn');
    }
    
    // Event Listeners
    if (parameterControlsBtn) {
        parameterControlsBtn.addEventListener('click', function() {
            parameterControlsSidebar.classList.add('active');
            loadCurrentParameters();
        });
    }
    
    if (closeParameterControls) {
        closeParameterControls.addEventListener('click', function() {
            parameterControlsSidebar.classList.remove('active');
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
            const userInput = document.getElementById('userInput');
            const modelSelect = document.getElementById('modelSelect');
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
            localStorage.setItem('freethinkers_parameters', JSON.stringify(currentParameters));
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
            const savedParams = localStorage.getItem('freethinkers_parameters');
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
