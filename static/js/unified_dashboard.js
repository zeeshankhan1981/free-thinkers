/**
 * Unified Dashboard for Free Thinkers
 * Manages the integration of model chains, parameter profiles, context visualization, and performance metrics
 */

class UnifiedDashboard {
    constructor() {
        this.isInitialized = false;
        this.isExpanded = true;
        this.activeTab = 'chains';
        this.dashboardElement = null;
        this.tabContentElement = null;
        
        // Component references
        this.chainVisualizer = null;
        this.parameterProfiler = null;
        this.contextVisualizer = null;
        this.performanceMonitor = null;
    }
    
    /**
     * Initialize the dashboard
     */
    async init() {
        try {
            await this.createDashboardUI();
            this.initEventListeners();
            
            // Initialize component modules
            this.chainVisualizer = new ChainVisualizer();
            await this.chainVisualizer.init();
            
            this.parameterProfiler = new ParameterProfiler();
            await this.parameterProfiler.init();
            
            this.contextVisualizer = new ContextVisualizer();
            await this.contextVisualizer.init();
            
            this.performanceMonitor = new PerformanceMonitor();
            await this.performanceMonitor.init();
            
            this.isInitialized = true;
            console.log('Unified dashboard initialized');
            return true;
        } catch (error) {
            console.error(`Error initializing unified dashboard: ${error}`);
            return false;
        }
    }
    
    /**
     * Create the dashboard UI structure
     */
    async createDashboardUI() {
        // Check if dashboard already exists
        if (document.querySelector('.unified-dashboard')) {
            this.dashboardElement = document.querySelector('.unified-dashboard');
            this.tabContentElement = document.getElementById('dashboardTabContent');
            return;
        }
        
        // Create the dashboard structure
        const dashboardHTML = `
            <div class="unified-dashboard mb-3">
                <div class="dashboard-header">
                    <ul class="nav nav-tabs" id="dashboardTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="chains-tab" data-bs-toggle="tab" data-bs-target="#chains-panel" type="button" role="tab" aria-controls="chains-panel" aria-selected="true">
                                <i class="fas fa-link"></i> Model Chains
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="parameters-tab" data-bs-toggle="tab" data-bs-target="#parameters-panel" type="button" role="tab" aria-controls="parameters-panel" aria-selected="false">
                                <i class="fas fa-sliders-h"></i> Parameter Profiles
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="context-tab" data-bs-toggle="tab" data-bs-target="#context-panel" type="button" role="tab" aria-controls="context-panel" aria-selected="false">
                                <i class="fas fa-compress-alt"></i> Context Window
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="metrics-tab" data-bs-toggle="tab" data-bs-target="#metrics-panel" type="button" role="tab" aria-controls="metrics-panel" aria-selected="false">
                                <i class="fas fa-chart-line"></i> Performance Metrics
                            </button>
                        </li>
                    </ul>
                    <div class="dashboard-toggle">
                        <button id="dashboardToggle" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-chevron-up"></i>
                        </button>
                    </div>
                </div>
                <div class="tab-content" id="dashboardTabContent">
                    <div class="tab-pane fade show active" id="chains-panel" role="tabpanel" aria-labelledby="chains-tab">
                        <div class="panel-content" id="chainsContent">
                            <!-- Will be populated by the ChainVisualizer -->
                        </div>
                    </div>
                    <div class="tab-pane fade" id="parameters-panel" role="tabpanel" aria-labelledby="parameters-tab">
                        <div class="panel-content" id="parametersContent">
                            <!-- Will be populated by the ParameterProfiler -->
                        </div>
                    </div>
                    <div class="tab-pane fade" id="context-panel" role="tabpanel" aria-labelledby="context-tab">
                        <div class="panel-content" id="contextContent">
                            <!-- Will be populated by the ContextVisualizer -->
                        </div>
                    </div>
                    <div class="tab-pane fade" id="metrics-panel" role="tabpanel" aria-labelledby="metrics-tab">
                        <div class="panel-content" id="metricsContent">
                            <!-- Will be populated by the PerformanceMonitor -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert the dashboard before the chat container
        const appContainer = document.querySelector('.app-container');
        const chatContainer = document.getElementById('chatContainer');
        
        if (appContainer && chatContainer) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = dashboardHTML;
            appContainer.insertBefore(tempDiv.firstElementChild, chatContainer);
            
            this.dashboardElement = document.querySelector('.unified-dashboard');
            this.tabContentElement = document.getElementById('dashboardTabContent');
        } else {
            throw new Error('Could not find app container or chat container');
        }
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        if (!this.dashboardElement) return;
        
        // Toggle dashboard expansion
        const toggleBtn = document.getElementById('dashboardToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleDashboard());
        }
        
        // Tab switching
        const tabs = this.dashboardElement.querySelectorAll('.nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                this.activeTab = event.target.id.split('-')[0];
                this.refreshActiveComponent();
            });
        });
    }
    
    /**
     * Toggle dashboard expansion
     */
    toggleDashboard() {
        this.isExpanded = !this.isExpanded;
        
        const toggleBtn = document.getElementById('dashboardToggle');
        const tabContent = this.tabContentElement;
        
        if (this.isExpanded) {
            tabContent.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        } else {
            tabContent.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        }
    }
    
    /**
     * Refresh the currently active component
     */
    refreshActiveComponent() {
        switch (this.activeTab) {
            case 'chains':
                if (this.chainVisualizer) this.chainVisualizer.refresh();
                break;
            case 'parameters':
                if (this.parameterProfiler) this.parameterProfiler.refresh();
                break;
            case 'context':
                if (this.contextVisualizer) this.contextVisualizer.refresh();
                break;
            case 'metrics':
                if (this.performanceMonitor) this.performanceMonitor.refresh();
                break;
        }
    }
    
    /**
     * Update the dashboard when model settings change
     */
    updateWithModelSettings(model, params) {
        if (this.parameterProfiler) {
            this.parameterProfiler.updateCurrentModel(model, params);
        }
        
        if (this.contextVisualizer) {
            this.contextVisualizer.updateContextWindow(model);
        }
    }
    
    /**
     * Update context usage metrics
     */
    updateContextUsage(usageData) {
        if (this.contextVisualizer) {
            this.contextVisualizer.updateUsage(usageData);
        }
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(metrics) {
        if (this.performanceMonitor) {
            this.performanceMonitor.updateMetrics(metrics);
        }
    }
}

// Load Dashboard only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Create a <link> element to include the CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '/static/css/unified_dashboard.css';
    document.head.appendChild(cssLink);
    
    // Initialize the dashboard
    window.unifiedDashboard = new UnifiedDashboard();
    await window.unifiedDashboard.init();
});
