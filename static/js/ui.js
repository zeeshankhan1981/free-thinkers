/**
 * Free Thinkers - UI Module
 * Handles UI-specific functionality such as modals, sidebars, and UI state
 */

class UIManager {
    constructor() {
        this.isDarkMode = false;
        
        // Initialize sidebar references with fallbacks to both naming conventions
        this.sidebars = {
            parameterControls: document.getElementById('parameter-controls-sidebar') || document.getElementById('parameterControlsSidebar'),
            conversationManager: document.getElementById('conversation-manager-sidebar') || document.getElementById('conversationManagerSidebar'),
            modelManagement: document.getElementById('model-management-sidebar') || document.getElementById('modelManagementSidebar'),
            history: document.getElementById('history-sidebar') || document.getElementById('historySidebar')
        };
        
        // Initialize button references with fallbacks to both naming conventions
        this.buttons = {
            parameterControls: document.getElementById('parameter-controls-btn') || document.getElementById('parameterControlsBtn'),
            conversationManager: document.getElementById('conversation-manager-btn') || document.getElementById('conversationManagerBtn'),
            modelManagement: document.getElementById('model-management-btn') || document.getElementById('modelManagementBtn'),
            darkModeToggle: document.getElementById('dark-mode-toggle') || document.getElementById('darkModeToggle'),
            historyBtn: document.getElementById('history-btn') || document.getElementById('historyBtn')
        };
        
        // Direct initialization of DOM elements
        this.historyBtn = document.getElementById('history-btn');
        this.historySidebar = document.getElementById('history-sidebar');
        this.parameterControlsBtn = document.getElementById('parameter-controls-btn');
        this.parameterControlsSidebar = document.getElementById('parameter-controls-sidebar');
        this.modelManagementBtn = document.getElementById('model-management-btn');
        this.modelManagementSidebar = document.getElementById('model-management-sidebar');
        
        // Make toggleSidebar available globally for other components
        window.toggleSidebar = this.toggleSidebar.bind(this);
        
        // Log sidebar and button references for debugging
        console.log('UI Manager initialized with sidebars:', this.sidebars);
        console.log('UI Manager initialized with buttons:', this.buttons);
        
        this.initDarkMode();
        this.initEventListeners();
    }
    
    initDarkMode() {
        // Check if dark mode preference is stored (support both naming conventions)
        const storedDarkMode = localStorage.getItem('dark-mode') || localStorage.getItem('darkMode');
        if (storedDarkMode === 'true') {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
            if (this.buttons.darkModeToggle) {
                this.buttons.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i><span class="nav-btn-text">Light Mode</span>';
            }
        }
    }
    
    initEventListeners() {
        // Set up sidebar toggle buttons
        for (const [key, button] of Object.entries(this.buttons)) {
            if (button && key !== 'darkModeToggle' && key !== 'historyBtn') {
                console.log(`Adding click handler to ${key} button`);
                button.addEventListener('click', () => {
                    // Map button keys to sidebar objects
                    const sidebar = this.sidebars[key];
                    
                    if (sidebar) {
                        this.toggleSidebar(sidebar, button);
                    } else {
                        console.error(`Sidebar for ${key} not found`);
                    }
                });
            }
        }
        
        // Direct event listeners for history button
        if (this.historyBtn) {
            console.log('Adding direct event listener to history button');
            this.historyBtn.addEventListener('click', () => {
                if (this.historySidebar) {
                    this.toggleSidebar('history');
                } else {
                    console.error('History sidebar not found');
                }
            });
        } else {
            console.error('History button not found');
        }
        
        // Dark mode toggle
        if (this.buttons.darkModeToggle) {
            this.buttons.darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            const activeSidebars = document.querySelectorAll('.sidebar.active');
            activeSidebars.forEach(sidebar => {
                // Check if click was outside the sidebar
                if (!sidebar.contains(e.target)) {
                    // Check if click was not on the button that toggles this sidebar
                    let isClickOnToggleButton = false;
                    for (const [key, button] of Object.entries(this.buttons)) {
                        if (button && button.contains(e.target)) {
                            isClickOnToggleButton = true;
                            break;
                        }
                    }
                    
                    if (!isClickOnToggleButton) {
                        sidebar.classList.remove('active');
                        // Also remove active class from all buttons
                        for (const button of Object.values(this.buttons)) {
                            if (button && button !== this.buttons.darkModeToggle) {
                                button.classList.remove('active');
                            }
                        }
                    }
                }
            });
        });
        
        // Parameter controls event listeners (support both naming conventions)
        const applyParametersBtn = document.getElementById('apply-parameters') || document.getElementById('applyParameters');
        if (applyParametersBtn) {
            applyParametersBtn.addEventListener('click', () => {
                this.applyParameters();
            });
        }
        
        // Initialize parameter sliders
        this.initParameterSliders();
    }
    
    toggleSidebar(sidebarName) {
        console.log(`Toggling sidebar: ${sidebarName}`);
        
        // Get the sidebar element
        const sidebar = this.sidebars[sidebarName];
        
        if (!sidebar) {
            console.error(`Sidebar ${sidebarName} not found`);
            return;
        }
        
        // Close all other sidebars
        for (const [key, sb] of Object.entries(this.sidebars)) {
            if (sb && key !== sidebarName) {
                sb.classList.remove('active');
            }
        }
        
        // Toggle current sidebar
        sidebar.classList.toggle('active');
        console.log(`Sidebar ${sidebarName} toggled, active: ${sidebar.classList.contains('active')}`);
        
        // Update the UI based on current parameters when opening parameter controls
        if ((sidebarName === 'parameterControls' || sidebarName === 'parameter-controls-sidebar') && 
            sidebar.classList.contains('active')) {
            this.updateParameterControlsUI();
        }
    }
    
    toggleSidebar(sidebar, button) {
        if (!sidebar) return;
        
        console.log('Toggling sidebar:', sidebar.id);
        
        // Close all other sidebars first
        document.querySelectorAll('.sidebar.active').forEach(activeSidebar => {
            if (activeSidebar !== sidebar) {
                activeSidebar.classList.remove('active');
            }
        });
        
        // Remove active class from all buttons except dark mode toggle
        for (const btn of Object.values(this.buttons)) {
            if (btn && btn !== this.buttons.darkModeToggle && btn !== button) {
                btn.classList.remove('active');
            }
        }
        
        // Toggle the target sidebar
        sidebar.classList.toggle('active');
        if (button) button.classList.toggle('active');
        
        // Update the UI based on current parameters when opening parameter controls
        if ((sidebar.id === 'parameter-controls-sidebar' || sidebar.id === 'parameterControlsSidebar') && 
            sidebar.classList.contains('active')) {
            this.updateParameterControlsUI();
        }
    }
    
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        
        // Update button icon and text
        if (this.buttons.darkModeToggle) {
            if (this.isDarkMode) {
                this.buttons.darkModeToggle.innerHTML = '<i class="fas fa-sun"></i><span class="nav-btn-text">Light Mode</span>';
            } else {
                this.buttons.darkModeToggle.innerHTML = '<i class="fas fa-moon"></i><span class="nav-btn-text">Dark Mode</span>';
            }
        }
        
        // Save preference
        localStorage.setItem('dark-mode', this.isDarkMode.toString());
    }
    
    initParameterSliders() {
        // Initialize all sliders with default values
        const sliders = document.querySelectorAll('.parameter-slider');
        sliders.forEach(slider => {
            const param = slider.getAttribute('data-parameter');
            const valueElement = document.getElementById(`${param}-value`);
            
            // Set initial value from global parameters if available
            if (window.currentParameters && window.currentParameters[param] !== undefined) {
                slider.value = window.currentParameters[param];
                if (valueElement) valueElement.textContent = slider.value;
            }
            
            // Add input event listener for live updates
            slider.addEventListener('input', () => {
                if (valueElement) valueElement.textContent = slider.value;
            });
        });
    }
    
    updateParameterControlsUI() {
        // Update parameter control sliders based on current parameters
        if (window.currentParameters) {
            for (const [param, value] of Object.entries(window.currentParameters)) {
                const slider = document.querySelector(`.parameter-slider[data-parameter="${param}"]`);
                const valueElement = document.getElementById(`${param}-value`);
                
                if (slider) slider.value = value;
                if (valueElement) valueElement.textContent = value;
            }
        }
    }
    
    applyParameters() {
        // Get values from all sliders
        const sliders = document.querySelectorAll('.parameter-slider');
        const parameters = {};
        
        sliders.forEach(slider => {
            const param = slider.getAttribute('data-parameter');
            const value = parseFloat(slider.value);
            parameters[param] = value;
        });
        
        // Update global parameters
        window.currentParameters = { ...window.currentParameters, ...parameters };
        
        // Update parameter display
        this.updateParameterDisplay(window.currentParameters);
        
        // Close sidebar
        const sidebar = document.getElementById('parameter-controls-sidebar') || document.getElementById('parameterControlsSidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
            if (this.buttons.parameterControls) {
                this.buttons.parameterControls.classList.remove('active');
            }
        }
        
        // Show notification if available
        if (typeof window.showNotification === 'function') {
            window.showNotification('Parameters updated', 'success');
        }
    }
    
    updateParameterDisplay(params) {
        const parameterDisplay = document.getElementById('current-parameters');
        if (!parameterDisplay) return;
        
        parameterDisplay.innerHTML = '';
        
        for (const [key, value] of Object.entries(params)) {
            const displayName = this.formatParameterName(key);
            
            const paramItem = document.createElement('div');
            paramItem.className = 'parameter-display-item';
            
            paramItem.innerHTML = `${displayName}: <span>${this.formatParameterValue(key, value)}</span>`;
            parameterDisplay.appendChild(paramItem);
        }
    }
    
    formatParameterName(key) {
        // Convert camelCase or snake_case to Title Case
        return key
            .replace(/([A-Z])/g, ' $1') // camelCase to spaces
            .replace(/_/g, ' ') // snake_case to spaces
            .replace(/^\w/, c => c.toUpperCase()) // capitalize first letter
            .trim();
    }
    
    formatParameterValue(key, value) {
        // Format values appropriately based on parameter type
        if (key.includes('temperature')) {
            return value.toFixed(1);
        } else if (key.includes('top-')) {
            return value.toFixed(2);
        } else if (key === 'max-tokens' || key === 'top-k') {
            return Math.round(value);
        } else if (key === 'context-window') {
            return `${(value * 100).toFixed(0)}%`;
        }
        return value;
    }
}

// Initialize UI Manager
const uiManager = new UIManager();

// Export functions to global scope
window.updateParameterDisplay = (params) => uiManager.updateParameterDisplay(params);
window.toggleSidebar = (sidebar, button) => uiManager.toggleSidebar(sidebar, button);
window.toggleDarkMode = () => uiManager.toggleDarkMode();
