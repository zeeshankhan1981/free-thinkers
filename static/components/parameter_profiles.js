/**
 * Parameter Profiles Management
 * Handles loading, saving, and applying parameter profiles
 */

class ParameterProfiles {
    constructor() {
        this.profiles = {};
        this.currentModel = null;
        this.currentProfile = "Balanced";
    }

    /**
     * Initialize the parameter profiles system
     * @param {string} modelName - The current model name
     */
    async init(modelName) {
        try {
            this.currentModel = modelName || "llama3.2";
            
            // Load profiles for current model
            await this.loadProfilesForModel(this.currentModel);
            
            // Initialize UI components
            this.initProfilesUI();
            
            console.log(`Parameter profiles initialized for model: ${this.currentModel}`);
            return true;
        } catch (error) {
            console.error(`Error initializing parameter profiles: ${error}`);
            return false;
        }
    }
    
    /**
     * Load parameter profiles for a specific model
     * @param {string} modelName - The model name
     */
    async loadProfilesForModel(modelName) {
        try {
            const response = await fetch(`/api/parameter_profiles/model/${modelName}`);
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
     * Initialize the profiles UI components
     */
    initProfilesUI() {
        // Create profiles dropdown in parameter controls sidebar
        const paramContent = document.querySelector('.parameter-controls-content');
        if (!paramContent) return;
        
        // Create profiles section if it doesn't exist
        let profilesSection = document.querySelector('.profiles-section');
        if (!profilesSection) {
            profilesSection = document.createElement('div');
            profilesSection.className = 'profiles-section mb-4';
            profilesSection.innerHTML = `
                <div class="section-header">
                    <h4 class="mb-2">Parameter Profiles</h4>
                    <p class="text-muted small mb-0">Save and apply different parameter configurations</p>
                </div>
                <div class="profile-selector mb-3">
                    <label for="profileSelect" class="form-label">Select Profile:</label>
                    <select id="profileSelect" class="form-select"></select>
                </div>
                <div class="profile-description mb-3" id="profileDescription">
                    <p class="text-muted">Select a profile to view its description</p>
                </div>
                <div class="profile-actions mb-3">
                    <button id="applyProfileBtn" class="btn btn-primary me-2">
                        <i class="fas fa-check"></i> Apply Profile
                    </button>
                    <button id="saveAsNewBtn" class="btn btn-outline-secondary">
                        <i class="fas fa-save"></i> Save Current as New
                    </button>
                </div>
                <div id="saveProfileModal" class="modal fade" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Save Parameter Profile</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label for="profileName" class="form-label">Profile Name</label>
                                    <input type="text" class="form-control" id="profileName" placeholder="My Custom Profile">
                                </div>
                                <div class="mb-3">
                                    <label for="profileDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="profileDescription" rows="3" placeholder="Describe what this profile is optimized for..."></textarea>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="modelSpecificCheck">
                                    <label class="form-check-label" for="modelSpecificCheck">
                                        Make this profile specific to current model
                                    </label>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-primary" id="saveProfileBtn">Save Profile</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert at the beginning of the parameter controls
            paramContent.insertBefore(profilesSection, paramContent.firstChild);
            
            // Initialize the dropdown with profiles
            this.updateProfilesDropdown();
            
            // Add event listeners
            this.addProfileEventListeners();
        } else {
            // Just update the dropdown
            this.updateProfilesDropdown();
        }
    }
    
    /**
     * Update the profiles dropdown with current profiles
     */
    updateProfilesDropdown() {
        const profileSelect = document.getElementById('profileSelect');
        if (!profileSelect) return;
        
        // Clear existing options
        profileSelect.innerHTML = '';
        
        // Add profile options
        const profileNames = Object.keys(this.profiles);
        profileNames.sort(); // Sort alphabetically
        
        // Group profiles
        const generalProfiles = ['Balanced', 'Creative', 'Precise'];
        const taskProfiles = ['Creative Writing', 'Factual Q&A', 'Code Generation', 'Brainstorming', 'Analytical'];
        const customProfiles = profileNames.filter(name => 
            !generalProfiles.includes(name) && !taskProfiles.includes(name));
        
        // Add general profiles
        const generalGroup = document.createElement('optgroup');
        generalGroup.label = 'General';
        generalProfiles.forEach(name => {
            if (this.profiles[name]) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (name === this.currentProfile) {
                    option.selected = true;
                }
                generalGroup.appendChild(option);
            }
        });
        profileSelect.appendChild(generalGroup);
        
        // Add task-specific profiles
        const taskGroup = document.createElement('optgroup');
        taskGroup.label = 'Task-Specific';
        taskProfiles.forEach(name => {
            if (this.profiles[name]) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (name === this.currentProfile) {
                    option.selected = true;
                }
                taskGroup.appendChild(option);
            }
        });
        if (taskGroup.children.length > 0) {
            profileSelect.appendChild(taskGroup);
        }
        
        // Add custom profiles
        if (customProfiles.length > 0) {
            const customGroup = document.createElement('optgroup');
            customGroup.label = 'Custom';
            customProfiles.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                if (name === this.currentProfile) {
                    option.selected = true;
                }
                customGroup.appendChild(option);
            });
            profileSelect.appendChild(customGroup);
        }
        
        // Update description for current profile
        this.updateProfileDescription();
        
        // Update parameters if a profile is selected
        if (profileSelect.value) {
            this.currentProfile = profileSelect.value;
        }
    }
    
    /**
     * Update the profile description panel
     */
    updateProfileDescription() {
        const profileSelect = document.getElementById('profileSelect');
        const descriptionElement = document.getElementById('profileDescription');
        if (!profileSelect || !descriptionElement) return;
        
        const selectedProfile = profileSelect.value;
        
        // Set description based on profile
        let description = '';
        
        switch (selectedProfile) {
            case 'Balanced':
                description = 'General-purpose settings with balanced creativity and reliability.';
                break;
            case 'Creative':
                description = 'Higher temperature and diversity for more creative outputs.';
                break;
            case 'Precise':
                description = 'Lower temperature for more deterministic, factual responses.';
                break;
            case 'Creative Writing':
                description = 'Optimized for storytelling, fiction, and creative content.';
                break;
            case 'Factual Q&A':
                description = 'Optimized for answering factual questions accurately.';
                break;
            case 'Code Generation':
                description = 'Settings tuned for generating reliable and correct code.';
                break;
            case 'Brainstorming':
                description = 'Maximizes diversity for idea generation and exploratory thinking.';
                break;
            case 'Analytical':
                description = 'Balanced settings for analytical reasoning and structured responses.';
                break;
            default:
                description = 'Custom parameter profile.';
        }
        
        descriptionElement.innerHTML = `<p class="text-muted">${description}</p>`;
        
        // Show profile parameters
        const parameters = this.profiles[selectedProfile];
        if (parameters) {
            const paramList = document.createElement('div');
            paramList.className = 'profile-parameters small';
            
            // Add each parameter
            for (const [key, value] of Object.entries(parameters)) {
                const paramItem = document.createElement('div');
                paramItem.className = 'd-flex justify-content-between';
                paramItem.innerHTML = `
                    <span class="param-name">${this.formatParameterName(key)}:</span>
                    <span class="param-value text-primary">${value}</span>
                `;
                paramList.appendChild(paramItem);
            }
            
            descriptionElement.appendChild(paramList);
        }
    }
    
    /**
     * Format parameter name for display
     * @param {string} name - The parameter name
     * @returns {string} - Formatted name
     */
    formatParameterName(name) {
        // Convert camelCase or snake_case to Title Case
        return name
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }
    
    /**
     * Add event listeners for profile actions
     */
    addProfileEventListeners() {
        // Profile selection change
        const profileSelect = document.getElementById('profileSelect');
        if (profileSelect) {
            profileSelect.addEventListener('change', () => {
                this.currentProfile = profileSelect.value;
                this.updateProfileDescription();
            });
        }
        
        // Apply profile button
        const applyProfileBtn = document.getElementById('applyProfileBtn');
        if (applyProfileBtn) {
            applyProfileBtn.addEventListener('click', () => {
                this.applySelectedProfile();
            });
        }
        
        // Save as new button
        const saveAsNewBtn = document.getElementById('saveAsNewBtn');
        if (saveAsNewBtn) {
            saveAsNewBtn.addEventListener('click', () => {
                this.showSaveProfileModal();
            });
        }
        
        // Save profile button in modal
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                this.saveCustomProfile();
            });
        }
    }
    
    /**
     * Apply the currently selected profile
     */
    applySelectedProfile() {
        const profileSelect = document.getElementById('profileSelect');
        if (!profileSelect) return;
        
        const selectedProfile = profileSelect.value;
        const parameters = this.profiles[selectedProfile];
        
        if (parameters) {
            // Update sliders
            this.updateSliders(parameters);
            
            // Show notification
            this.showNotification(`Applied profile: ${selectedProfile}`);
            
            console.log(`Applied parameter profile: ${selectedProfile}`, parameters);
        }
    }
    
    /**
     * Update all parameter sliders with profile values
     * @param {Object} parameters - The parameters object
     */
    updateSliders(parameters) {
        // Update temperature slider
        const tempSlider = document.getElementById('temperatureSlider');
        if (tempSlider && parameters.temperature !== undefined) {
            tempSlider.value = parameters.temperature;
            // Trigger the input event to update display
            tempSlider.dispatchEvent(new Event('input'));
        }
        
        // Update top_p slider
        const topPSlider = document.getElementById('topPSlider');
        if (topPSlider && parameters.top_p !== undefined) {
            topPSlider.value = parameters.top_p;
            topPSlider.dispatchEvent(new Event('input'));
        }
        
        // Update top_k slider
        const topKSlider = document.getElementById('topKSlider');
        if (topKSlider && parameters.top_k !== undefined) {
            topKSlider.value = parameters.top_k;
            topKSlider.dispatchEvent(new Event('input'));
        }
        
        // Update repetition penalty slider
        const repPenSlider = document.getElementById('repetitionPenaltySlider');
        if (repPenSlider && parameters.repetition_penalty !== undefined) {
            repPenSlider.value = parameters.repetition_penalty;
            repPenSlider.dispatchEvent(new Event('input'));
        }
        
        // Update context window slider
        const contextSlider = document.getElementById('contextWindowSlider');
        if (contextSlider && parameters.context_window !== undefined) {
            contextSlider.value = parameters.context_window;
            contextSlider.dispatchEvent(new Event('input'));
        }
    }
    
    /**
     * Show the save profile modal
     */
    showSaveProfileModal() {
        const modal = document.getElementById('saveProfileModal');
        if (!modal) return;
        
        // Clear the form
        const nameInput = document.getElementById('profileName');
        const descInput = document.getElementById('profileDescription');
        if (nameInput) nameInput.value = '';
        if (descInput) descInput.value = '';
        
        // Set model-specific checkbox to model name
        const modelCheck = document.getElementById('modelSpecificCheck');
        if (modelCheck) {
            modelCheck.checked = false;
            const label = modelCheck.nextElementSibling;
            if (label) {
                label.textContent = `Make this profile specific to ${this.currentModel}`;
            }
        }
        
        // Show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
    
    /**
     * Save the current parameters as a new custom profile
     */
    async saveCustomProfile() {
        const nameInput = document.getElementById('profileName');
        const descInput = document.getElementById('profileDescription');
        const modelCheck = document.getElementById('modelSpecificCheck');
        
        if (!nameInput || !nameInput.value.trim()) {
            this.showNotification('Please enter a profile name', 'error');
            return;
        }
        
        // Get current parameters
        const parameters = this.getCurrentParameters();
        
        // Create profile data
        const profileData = {
            name: nameInput.value.trim(),
            description: descInput ? descInput.value.trim() : '',
            parameters: parameters
        };
        
        // Add model specificity if checked
        if (modelCheck && modelCheck.checked) {
            profileData.model = this.currentModel;
        }
        
        try {
            // Save to API
            const response = await fetch('/api/parameter_profiles/custom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Hide modal
                const modal = document.getElementById('saveProfileModal');
                if (modal) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) modalInstance.hide();
                }
                
                // Reload profiles
                await this.loadProfilesForModel(this.currentModel);
                
                // Update dropdown
                this.updateProfilesDropdown();
                
                // Show notification
                this.showNotification(result.message || 'Profile saved successfully');
                
                console.log('Saved custom profile:', profileData);
            } else {
                const result = await response.json();
                this.showNotification(result.message || 'Error saving profile', 'error');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Error saving profile', 'error');
        }
    }
    
    /**
     * Get current parameter values from sliders
     * @returns {Object} - The current parameters
     */
    getCurrentParameters() {
        const parameters = {};
        
        // Get temperature
        const tempSlider = document.getElementById('temperatureSlider');
        if (tempSlider) {
            parameters.temperature = parseFloat(tempSlider.value);
        }
        
        // Get top_p
        const topPSlider = document.getElementById('topPSlider');
        if (topPSlider) {
            parameters.top_p = parseFloat(topPSlider.value);
        }
        
        // Get top_k
        const topKSlider = document.getElementById('topKSlider');
        if (topKSlider) {
            parameters.top_k = parseInt(topKSlider.value);
        }
        
        // Get repetition penalty
        const repPenSlider = document.getElementById('repetitionPenaltySlider');
        if (repPenSlider) {
            parameters.repetition_penalty = parseFloat(repPenSlider.value);
        }
        
        // Get context window
        const contextSlider = document.getElementById('contextWindowSlider');
        if (contextSlider) {
            parameters.context_window = parseInt(contextSlider.value);
        }
        
        return parameters;
    }
    
    /**
     * Show a notification to the user
     * @param {string} message - The message to show
     * @param {string} type - The type of notification (success/error)
     */
    showNotification(message, type = 'success') {
        // Use the global notification system if available
        if (window.showToast) {
            window.showToast(message, type, 3000);
            return;
        }
        
        // Fallback to alert
        alert(message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global instance
    window.parameterProfiles = new ParameterProfiles();
    
    // Initialize with current model
    const modelSelect = document.getElementById('modelSelect');
    const currentModel = modelSelect ? modelSelect.value : 'llama3.2';
    
    window.parameterProfiles.init(currentModel);
    
    // Update profile when model changes
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            window.parameterProfiles.init(this.value);
        });
    }
});