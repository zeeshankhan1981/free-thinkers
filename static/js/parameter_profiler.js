/**
 * Parameter Profiler for Free Thinkers
 * Manages parameter profiles and provides a visual interface for editing parameters
 */

class ParameterProfiler {
    constructor() {
        this.isInitialized = false;
        this.containerElement = null;
        this.profiles = {};
        this.currentProfile = null;
        this.currentModel = null;
        this.currentParameters = null;
    }
    
    /**
     * Initialize the Parameter Profiler
     */
    async init() {
        try {
            this.containerElement = document.getElementById('parametersContent');
            if (!this.containerElement) {
                console.error('Parameters content container not found');
                return false;
            }
            
            await this.loadProfiles();
            this.createParameterUI();
            this.initEventListeners();
            
            // Try to get the current model and parameters
            if (window.currentModel) {
                this.currentModel = window.currentModel;
            }
            
            if (window.currentParameters) {
                this.currentParameters = window.currentParameters;
                this.updateParameterEditor(this.currentParameters);
            }
            
            this.isInitialized = true;
            console.log('Parameter profiler initialized');
            return true;
        } catch (error) {
            console.error(`Error initializing parameter profiler: ${error}`);
            return false;
        }
    }
    
    /**
     * Load parameter profiles from API
     */
    async loadProfiles() {
        try {
            const response = await fetch('/api/profiles');
            if (response.ok) {
                this.profiles = await response.json();
                return this.profiles;
            } else {
                console.error(`Error loading profiles: ${response.statusText}`);
                return {};
            }
        } catch (error) {
            console.error(`Error loading profiles: ${error}`);
            return {};
        }
    }
    
    /**
     * Create the Parameter Profiler UI
     */
    createParameterUI() {
        if (!this.containerElement) return;
        
        // Clear the container
        this.containerElement.innerHTML = '';
        
        // Create the main layout
        const mainLayout = document.createElement('div');
        mainLayout.className = 'row';
        
        // Profile selector column
        const selectorColumn = document.createElement('div');
        selectorColumn.className = 'col-md-4';
        selectorColumn.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <i class="fas fa-sliders-h"></i> Parameter Profiles
                </div>
                <div class="card-body">
                    <div class="profile-selector-wrapper">
                        <div class="mb-3">
                            <label for="profileType" class="form-label">Profile Type</label>
                            <select id="profileType" class="form-select form-select-sm">
                                <option value="general">General Profiles</option>
                                <option value="task">Task-Specific Profiles</option>
                                <option value="model" selected>Model-Specific Profiles</option>
                                <option value="custom">Custom Profiles</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="profileSelector" class="form-label">Select Profile</label>
                            <select id="profileSelector" class="form-select">
                                <option value="">Loading profiles...</option>
                            </select>
                        </div>
                        <div id="profileDescription" class="profile-description text-muted mb-3 small"></div>
                        <div class="btn-group w-100" role="group">
                            <button id="applyProfileBtn" class="btn btn-primary">
                                <i class="fas fa-check"></i> Apply
                            </button>
                            <button id="saveProfileBtn" class="btn btn-outline-success">
                                <i class="fas fa-save"></i> Save Current
                            </button>
                            <button id="deleteProfileBtn" class="btn btn-outline-danger">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-header">
                    <i class="fas fa-info-circle"></i> Parameter Information
                </div>
                <div class="card-body small">
                    <div class="parameter-info">
                        <h6>Temperature</h6>
                        <p>Controls randomness. Higher values (e.g., 0.8) make output more random, while lower values (e.g., 0.2) make it more focused and deterministic.</p>
                        
                        <h6>Top P</h6>
                        <p>Controls diversity via nucleus sampling. 0.5 means half of all likelihood-weighted options are considered.</p>
                        
                        <h6>Top K</h6>
                        <p>Limits vocabulary to K most likely tokens. Lower values create more focused output, higher values allow more variety.</p>
                        
                        <h6>Repetition Penalty</h6>
                        <p>Discourages repetition. Higher values (e.g., 1.5) strongly prevent repetition, while 1.0 means no penalty.</p>
                    </div>
                </div>
            </div>
        `;
        
        // Parameter editor column
        const editorColumn = document.createElement('div');
        editorColumn.className = 'col-md-8';
        editorColumn.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-edit"></i> Parameter Editor</span>
                    <span id="currentModelBadge" class="badge bg-secondary">No Model Selected</span>
                </div>
                <div class="card-body">
                    <div id="parameterEditor" class="parameter-editor">
                        <div class="parameter-group">
                            <h6 class="parameter-group-title">Generation Parameters</h6>
                            
                            <div class="parameter-item">
                                <div class="parameter-header">
                                    <span class="parameter-name">Temperature</span>
                                    <span id="temperatureValue" class="parameter-value">0.7</span>
                                </div>
                                <div class="parameter-input">
                                    <input type="range" class="form-range" id="temperatureRange" min="0" max="2" step="0.05" value="0.7">
                                    <input type="number" class="form-control form-control-sm" id="temperatureInput" min="0" max="2" step="0.05" value="0.7">
                                </div>
                                <div class="parameter-description">Controls randomness in generation</div>
                            </div>
                            
                            <div class="parameter-item">
                                <div class="parameter-header">
                                    <span class="parameter-name">Top P</span>
                                    <span id="topPValue" class="parameter-value">0.95</span>
                                </div>
                                <div class="parameter-input">
                                    <input type="range" class="form-range" id="topPRange" min="0" max="1" step="0.01" value="0.95">
                                    <input type="number" class="form-control form-control-sm" id="topPInput" min="0" max="1" step="0.01" value="0.95">
                                </div>
                                <div class="parameter-description">Controls diversity via nucleus sampling</div>
                            </div>
                            
                            <div class="parameter-item">
                                <div class="parameter-header">
                                    <span class="parameter-name">Top K</span>
                                    <span id="topKValue" class="parameter-value">40</span>
                                </div>
                                <div class="parameter-input">
                                    <input type="range" class="form-range" id="topKRange" min="1" max="100" step="1" value="40">
                                    <input type="number" class="form-control form-control-sm" id="topKInput" min="1" max="100" step="1" value="40">
                                </div>
                                <div class="parameter-description">Limits vocabulary for generation</div>
                            </div>
                            
                            <div class="parameter-item">
                                <div class="parameter-header">
                                    <span class="parameter-name">Repetition Penalty</span>
                                    <span id="repPenaltyValue" class="parameter-value">1.1</span>
                                </div>
                                <div class="parameter-input">
                                    <input type="range" class="form-range" id="repPenaltyRange" min="1" max="2" step="0.05" value="1.1">
                                    <input type="number" class="form-control form-control-sm" id="repPenaltyInput" min="1" max="2" step="0.05" value="1.1">
                                </div>
                                <div class="parameter-description">Discourages repetition in output</div>
                            </div>
                        </div>
                        
                        <div class="parameter-group">
                            <h6 class="parameter-group-title">Advanced Parameters</h6>
                            
                            <div class="parameter-item">
                                <div class="parameter-header">
                                    <span class="parameter-name">Max New Tokens</span>
                                    <span id="maxTokensValue" class="parameter-value">2048</span>
                                </div>
                                <div class="parameter-input">
                                    <input type="range" class="form-range" id="maxTokensRange" min="256" max="8192" step="256" value="2048">
                                    <input type="number" class="form-control form-control-sm" id="maxTokensInput" min="256" max="8192" step="256" value="2048">
                                </div>
                                <div class="parameter-description">Maximum number of tokens to generate</div>
                            </div>
                            
                            <div class="parameter-item">
                                <div class="parameter-header">
                                    <span class="parameter-name">Number of GPU Layers</span>
                                    <span id="gpuLayersValue" class="parameter-value">32</span>
                                </div>
                                <div class="parameter-input">
                                    <input type="range" class="form-range" id="gpuLayersRange" min="0" max="64" step="4" value="32">
                                    <input type="number" class="form-control form-control-sm" id="gpuLayersInput" min="0" max="64" step="4" value="32">
                                </div>
                                <div class="parameter-description">Number of layers to run on GPU (0 for CPU only)</div>
                            </div>
                            
                            <div class="parameter-item">
                                <div class="parameter-header">
                                    <span class="parameter-name">Number of Threads</span>
                                    <span id="threadsValue" class="parameter-value">4</span>
                                </div>
                                <div class="parameter-input">
                                    <input type="range" class="form-range" id="threadsRange" min="1" max="16" step="1" value="4">
                                    <input type="number" class="form-control form-control-sm" id="threadsInput" min="1" max="16" step="1" value="4">
                                </div>
                                <div class="parameter-description">CPU threads to use during computation</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-header">
                    <i class="fas fa-chart-pie"></i> Parameter Comparison
                </div>
                <div class="card-body">
                    <div id="parameterComparison" class="parameter-comparison text-center">
                        <p class="text-muted">Select multiple profiles to compare parameters</p>
                        <button id="compareProfilesBtn" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-chart-bar"></i> Compare Profiles
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Append columns to main layout
        mainLayout.appendChild(selectorColumn);
        mainLayout.appendChild(editorColumn);
        
        // Append layout to container
        this.containerElement.appendChild(mainLayout);
        
        // Populate profile selector
        this.updateProfileSelector();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Profile type selector
        const profileType = document.getElementById('profileType');
        if (profileType) {
            profileType.addEventListener('change', () => {
                this.updateProfileSelector();
            });
        }
        
        // Profile selector
        const profileSelector = document.getElementById('profileSelector');
        if (profileSelector) {
            profileSelector.addEventListener('change', (event) => {
                this.selectProfile(event.target.value);
            });
        }
        
        // Apply profile button
        const applyBtn = document.getElementById('applyProfileBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyCurrentProfile();
            });
        }
        
        // Save profile button
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCurrentProfile();
            });
        }
        
        // Delete profile button
        const deleteBtn = document.getElementById('deleteProfileBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteCurrentProfile();
            });
        }
        
        // Compare profiles button
        const compareBtn = document.getElementById('compareProfilesBtn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.showProfileComparison();
            });
        }
        
        // Parameter inputs
        this.setupParameterInputs();
    }
    
    /**
     * Set up event listeners for parameter inputs
     */
    setupParameterInputs() {
        // Helper function to sync range and number inputs
        const syncInputs = (paramName, rangeId, inputId, valueId) => {
            const rangeEl = document.getElementById(rangeId);
            const inputEl = document.getElementById(inputId);
            const valueEl = document.getElementById(valueId);
            
            if (rangeEl && inputEl && valueEl) {
                // Range input changes number input
                rangeEl.addEventListener('input', (event) => {
                    inputEl.value = event.target.value;
                    valueEl.textContent = event.target.value;
                    this.updateParameterValue(paramName, parseFloat(event.target.value));
                });
                
                // Number input changes range input
                inputEl.addEventListener('change', (event) => {
                    rangeEl.value = event.target.value;
                    valueEl.textContent = event.target.value;
                    this.updateParameterValue(paramName, parseFloat(event.target.value));
                });
            }
        };
        
        // Set up sync for each parameter
        syncInputs('temperature', 'temperatureRange', 'temperatureInput', 'temperatureValue');
        syncInputs('top_p', 'topPRange', 'topPInput', 'topPValue');
        syncInputs('top_k', 'topKRange', 'topKInput', 'topKValue');
        syncInputs('repetition_penalty', 'repPenaltyRange', 'repPenaltyInput', 'repPenaltyValue');
        syncInputs('max_tokens', 'maxTokensRange', 'maxTokensInput', 'maxTokensValue');
        syncInputs('gpu_layers', 'gpuLayersRange', 'gpuLayersInput', 'gpuLayersValue');
        syncInputs('num_thread', 'threadsRange', 'threadsInput', 'threadsValue');
    }
    
    /**
     * Update parameter value in current parameters
     */
    updateParameterValue(paramName, value) {
        if (!this.currentParameters) {
            this.currentParameters = {};
        }
        
        this.currentParameters[paramName] = value;
        
        // Update global parameters if available
        if (window.currentParameters) {
            window.currentParameters[paramName] = value;
        }
    }
    
    /**
     * Update the profile selector dropdown based on the selected profile type
     */
    updateProfileSelector() {
        const profileType = document.getElementById('profileType');
        const profileSelector = document.getElementById('profileSelector');
        
        if (!profileType || !profileSelector || !this.profiles) return;
        
        const selectedType = profileType.value;
        
        // Clear existing options
        profileSelector.innerHTML = '<option value="">Select a profile...</option>';
        
        let profilesForType = [];
        
        switch (selectedType) {
            case 'general':
                profilesForType = this.profiles.general || [];
                break;
            case 'task':
                profilesForType = this.profiles.task_specific || [];
                break;
            case 'model':
                // For model-specific, check if we have profiles for the current model
                if (this.currentModel && this.profiles.model_specific && this.profiles.model_specific[this.currentModel]) {
                    const modelProfiles = this.profiles.model_specific[this.currentModel];
                    profilesForType = Object.keys(modelProfiles).map(name => ({
                        name: name,
                        description: `Model-specific profile for ${this.currentModel}`,
                        parameters: modelProfiles[name]
                    }));
                }
                break;
            case 'custom':
                profilesForType = this.profiles.custom || [];
                break;
        }
        
        // Add profile options
        profilesForType.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.name;
            option.textContent = profile.name;
            profileSelector.appendChild(option);
        });
        
        // Update the profile description
        this.updateProfileDescription();
    }
    
    /**
     * Update the profile description text
     */
    updateProfileDescription() {
        const profileType = document.getElementById('profileType');
        const profileSelector = document.getElementById('profileSelector');
        const profileDescription = document.getElementById('profileDescription');
        
        if (!profileType || !profileSelector || !profileDescription || !this.profiles) return;
        
        const selectedType = profileType.value;
        const selectedName = profileSelector.value;
        
        if (!selectedName) {
            profileDescription.textContent = '';
            return;
        }
        
        let selectedProfile = null;
        
        switch (selectedType) {
            case 'general':
                selectedProfile = (this.profiles.general || []).find(p => p.name === selectedName);
                break;
            case 'task':
                selectedProfile = (this.profiles.task_specific || []).find(p => p.name === selectedName);
                break;
            case 'model':
                if (this.currentModel && this.profiles.model_specific && this.profiles.model_specific[this.currentModel]) {
                    const parameters = this.profiles.model_specific[this.currentModel][selectedName];
                    if (parameters) {
                        selectedProfile = { 
                            name: selectedName, 
                            description: `Model-specific profile for ${this.currentModel}`,
                            parameters: parameters 
                        };
                    }
                }
                break;
            case 'custom':
                selectedProfile = (this.profiles.custom || []).find(p => p.name === selectedName);
                break;
        }
        
        if (selectedProfile && selectedProfile.description) {
            profileDescription.textContent = selectedProfile.description;
        } else {
            profileDescription.textContent = '';
        }
    }
    
    /**
     * Select a profile and update the parameter editor
     */
    selectProfile(profileName) {
        if (!profileName) {
            this.currentProfile = null;
            return;
        }
        
        const profileType = document.getElementById('profileType');
        if (!profileType || !this.profiles) return;
        
        const selectedType = profileType.value;
        
        let selectedProfile = null;
        
        switch (selectedType) {
            case 'general':
                selectedProfile = (this.profiles.general || []).find(p => p.name === profileName);
                break;
            case 'task':
                selectedProfile = (this.profiles.task_specific || []).find(p => p.name === profileName);
                break;
            case 'model':
                if (this.currentModel && this.profiles.model_specific && this.profiles.model_specific[this.currentModel]) {
                    const parameters = this.profiles.model_specific[this.currentModel][profileName];
                    if (parameters) {
                        selectedProfile = { 
                            name: profileName, 
                            description: `Model-specific profile for ${this.currentModel}`,
                            parameters: parameters 
                        };
                    }
                }
                break;
            case 'custom':
                selectedProfile = (this.profiles.custom || []).find(p => p.name === profileName);
                break;
        }
        
        if (selectedProfile && selectedProfile.parameters) {
            this.currentProfile = selectedProfile;
            this.updateParameterEditor(selectedProfile.parameters);
            this.updateProfileDescription();
        }
    }
    
    /**
     * Update the parameter editor with the given parameters
     */
    updateParameterEditor(parameters) {
        if (!parameters) return;
        
        // Update temperature
        this.updateParamInput('temperature', parameters.temperature, 0.7);
        
        // Update top_p
        this.updateParamInput('top_p', parameters.top_p, 0.95);
        
        // Update top_k
        this.updateParamInput('top_k', parameters.top_k, 40);
        
        // Update repetition_penalty
        this.updateParamInput('repetition_penalty', parameters.repetition_penalty, 1.1);
        
        // Update max_tokens
        this.updateParamInput('max_tokens', parameters.max_tokens, 2048);
        
        // Update gpu_layers
        this.updateParamInput('gpu_layers', parameters.gpu_layers, 32);
        
        // Update num_thread
        this.updateParamInput('num_thread', parameters.num_thread, 4);
        
        // Update current model badge
        const modelBadge = document.getElementById('currentModelBadge');
        if (modelBadge) {
            modelBadge.textContent = this.currentModel || 'No Model Selected';
            modelBadge.className = `badge ${this.currentModel ? 'bg-primary' : 'bg-secondary'}`;
        }
    }
    
    /**
     * Update a parameter input (range, number input, and value display)
     */
    updateParamInput(param, value, defaultValue) {
        const paramMap = {
            'temperature': {
                range: 'temperatureRange',
                input: 'temperatureInput',
                value: 'temperatureValue'
            },
            'top_p': {
                range: 'topPRange',
                input: 'topPInput',
                value: 'topPValue'
            },
            'top_k': {
                range: 'topKRange',
                input: 'topKInput',
                value: 'topKValue'
            },
            'repetition_penalty': {
                range: 'repPenaltyRange',
                input: 'repPenaltyInput',
                value: 'repPenaltyValue'
            },
            'max_tokens': {
                range: 'maxTokensRange',
                input: 'maxTokensInput',
                value: 'maxTokensValue'
            },
            'gpu_layers': {
                range: 'gpuLayersRange',
                input: 'gpuLayersInput',
                value: 'gpuLayersValue'
            },
            'num_thread': {
                range: 'threadsRange',
                input: 'threadsInput',
                value: 'threadsValue'
            }
        };
        
        const mapping = paramMap[param];
        if (!mapping) return;
        
        const rangeEl = document.getElementById(mapping.range);
        const inputEl = document.getElementById(mapping.input);
        const valueEl = document.getElementById(mapping.value);
        
        if (rangeEl && inputEl && valueEl) {
            const finalValue = value !== undefined ? value : defaultValue;
            rangeEl.value = finalValue;
            inputEl.value = finalValue;
            valueEl.textContent = finalValue;
            
            // Update the current parameters
            this.updateParameterValue(param, finalValue);
        }
    }
    
    /**
     * Apply the currently selected profile to the model
     */
    applyCurrentProfile() {
        if (!this.currentProfile) {
            alert('Please select a profile first');
            return;
        }
        
        // Apply to global parameters
        if (window.currentParameters && this.currentProfile.parameters) {
            Object.assign(window.currentParameters, this.currentProfile.parameters);
            
            // Update the parameter display if the function exists
            if (typeof updateParameterDisplay === 'function') {
                updateParameterDisplay(window.currentParameters);
            }
            
            console.log(`Applied profile: ${this.currentProfile.name}`);
        }
    }
    
    /**
     * Save the current parameters as a new profile
     */
    async saveCurrentProfile() {
        if (!this.currentParameters) {
            alert('No parameters to save');
            return;
        }
        
        const profileName = prompt('Enter a name for this profile:');
        if (!profileName) return;
        
        const profileDescription = prompt('Enter a description for this profile:');
        
        try {
            const response = await fetch('/api/profiles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: profileName,
                    description: profileDescription || `Custom profile created for ${this.currentModel || 'general use'}`,
                    parameters: this.currentParameters,
                    model: this.currentModel || null
                })
            });
            
            if (response.ok) {
                // Reload profiles
                await this.loadProfiles();
                
                // Switch to custom profiles and select the new one
                const profileType = document.getElementById('profileType');
                if (profileType) {
                    profileType.value = 'custom';
                    this.updateProfileSelector();
                    
                    // Select the new profile
                    const profileSelector = document.getElementById('profileSelector');
                    if (profileSelector) {
                        profileSelector.value = profileName;
                        this.selectProfile(profileName);
                    }
                }
                
                console.log(`Saved profile: ${profileName}`);
            } else {
                console.error(`Error saving profile: ${response.statusText}`);
                alert(`Error saving profile: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error saving profile: ${error}`);
            alert(`Error saving profile: ${error}`);
        }
    }
    
    /**
     * Delete the currently selected profile
     */
    async deleteCurrentProfile() {
        if (!this.currentProfile) {
            alert('Please select a profile first');
            return;
        }
        
        // Only allow deleting custom profiles
        const profileType = document.getElementById('profileType');
        if (!profileType || profileType.value !== 'custom') {
            alert('You can only delete custom profiles');
            return;
        }
        
        if (!confirm(`Are you sure you want to delete the profile "${this.currentProfile.name}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/profiles/${encodeURIComponent(this.currentProfile.name)}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Reload profiles
                await this.loadProfiles();
                
                // Update the selector
                this.updateProfileSelector();
                
                // Clear the current profile
                this.currentProfile = null;
                
                console.log(`Deleted profile: ${this.currentProfile.name}`);
            } else {
                console.error(`Error deleting profile: ${response.statusText}`);
                alert(`Error deleting profile: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error deleting profile: ${error}`);
            alert(`Error deleting profile: ${error}`);
        }
    }
    
    /**
     * Show a comparison of multiple profiles
     */
    showProfileComparison() {
        // For now, just a placeholder
        alert('Profile comparison functionality will be implemented in the next phase');
    }
    
    /**
     * Update the current model and refresh the interface
     */
    updateCurrentModel(model, parameters) {
        this.currentModel = model;
        this.currentParameters = parameters;
        
        // Update the model badge
        const modelBadge = document.getElementById('currentModelBadge');
        if (modelBadge) {
            modelBadge.textContent = this.currentModel || 'No Model Selected';
            modelBadge.className = `badge ${this.currentModel ? 'bg-primary' : 'bg-secondary'}`;
        }
        
        // Update the parameter editor
        if (parameters) {
            this.updateParameterEditor(parameters);
        }
        
        // Refresh the profile selector if set to model-specific
        const profileType = document.getElementById('profileType');
        if (profileType && profileType.value === 'model') {
            this.updateProfileSelector();
        }
    }
    
    /**
     * Refresh the Parameter Profiler
     */
    async refresh() {
        await this.loadProfiles();
        this.updateProfileSelector();
    }
}

// Export class for use by the unified dashboard
window.ParameterProfiler = ParameterProfiler;
