/**
 * Smart Context Manager
 * Handles conversation context optimization and visualization
 */

class ContextManager {
    constructor() {
        this.contextWindow = 4096;
        this.currentModel = null;
        this.currentUsage = {
            total_tokens: 0,
            context_window: 4096,
            usage_percentage: 0,
            is_optimized: false,
            optimization_level: "none"
        };
    }

    /**
     * Initialize the context manager
     * @param {string} modelName - Current model name
     */
    init(modelName) {
        console.log(`Initializing context manager for model: ${modelName}`);
        this.currentModel = modelName;
        
        // Set context window based on model
        this.contextWindow = this.getContextWindowForModel(modelName);
        
        // Initialize the context visualization UI
        this.initContextUI();
    }
    
    /**
     * Get context window size for a model
     * @param {string} modelName - Model name
     * @returns {number} - Context window size
     */
    getContextWindowForModel(modelName) {
        const TOKEN_COUNTS = window.TOKEN_COUNTS || {
            "mistral-7b": { max_tokens: 4096 },
            "llama3.2": { max_tokens: 4096 },
            "llava-phi3:latest": { max_tokens: 4096 }
        };
        
        if (modelName in TOKEN_COUNTS) {
            return TOKEN_COUNTS[modelName].max_tokens;
        }
        
        return 4096; // Default
    }
    
    /**
     * Initialize context visualization UI
     */
    initContextUI() {
        // Create context visualization UI if it doesn't exist
        let contextVisualization = document.getElementById('contextVisualization');
        if (!contextVisualization) {
            // Find where to insert the visualization (after token visualization)
            const tokenVisualization = document.querySelector('.token-visualization');
            if (tokenVisualization) {
                // Create new element
                contextVisualization = document.createElement('div');
                contextVisualization.id = 'contextVisualization';
                contextVisualization.className = 'context-visualization mb-3';
                contextVisualization.innerHTML = `
                    <div class="context-info d-flex justify-content-between">
                        <div class="context-stats">
                            <span id="contextStats">Context usage: 0/4096 tokens (0%)</span>
                        </div>
                        <div class="context-controls">
                            <span id="optimizationStatus" class="badge bg-success">Optimal</span>
                            <button id="optimizeContextBtn" class="btn btn-sm btn-outline-primary" style="display: none;">
                                <i class="fas fa-magic"></i> Optimize
                            </button>
                        </div>
                    </div>
                    <div class="context-bar">
                        <div class="context-bar-fill" id="contextBarFill" style="width: 0.1%"></div>
                    </div>
                `;
                
                // Insert after token visualization
                tokenVisualization.parentNode.insertBefore(contextVisualization, tokenVisualization.nextSibling);
                
                // Add event listener for optimize button
                const optimizeBtn = document.getElementById('optimizeContextBtn');
                if (optimizeBtn) {
                    optimizeBtn.addEventListener('click', () => {
                        this.optimizeContext();
                    });
                }
                
                // Add styles if not already present
                this.addContextStyles();
            }
        }
    }
    
    /**
     * Add CSS styles for context visualization
     */
    addContextStyles() {
        // Check if styles already exist
        if (document.getElementById('contextManagerStyles')) {
            return;
        }
        
        // Create style element
        const styleEl = document.createElement('style');
        styleEl.id = 'contextManagerStyles';
        styleEl.textContent = `
            .context-visualization {
                padding: 0.75rem;
                background-color: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            
            .context-bar {
                height: 4px;
                width: 100%;
                background-color: #e9ecef;
                border-radius: 2px;
                overflow: hidden;
                margin-top: 0.5rem;
            }
            
            .context-bar-fill {
                height: 100%;
                background-color: #0d6efd;
                border-radius: 2px;
                transition: width 0.3s ease;
            }
            
            .context-bar-fill.warning {
                background-color: #fd7e14;
            }
            
            .context-bar-fill.danger {
                background-color: #dc3545;
            }
            
            body.dark-mode .context-visualization {
                background-color: #2d2d2d;
                border-color: #444;
            }
            
            body.dark-mode .context-bar {
                background-color: #444;
            }
            
            body.dark-mode .context-stats {
                color: #adb5bd;
            }
            
            .optimization-info {
                font-size: 0.85rem;
                color: #6c757d;
                margin-top: 0.5rem;
            }
            
            body.dark-mode .optimization-info {
                color: #adb5bd;
            }
        `;
        
        // Add to document
        document.head.appendChild(styleEl);
    }
    
    /**
     * Update context usage visualization
     * @param {Array} messages - Current conversation messages
     */
    async updateContextVisualization(messages) {
        if (!messages || !Array.isArray(messages) || !messages.length) {
            return;
        }
        
        try {
            // Get current token usage from API
            const response = await fetch('/api/context/usage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    model: this.currentModel,
                    context_window: this.contextWindow
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    this.currentUsage = data.usage;
                    this.displayContextUsage();
                }
            }
        } catch (error) {
            console.error('Error updating context visualization:', error);
        }
    }
    
    /**
     * Display current context usage in the UI
     */
    displayContextUsage() {
        const contextStats = document.getElementById('contextStats');
        const contextBarFill = document.getElementById('contextBarFill');
        const optimizationStatus = document.getElementById('optimizationStatus');
        const optimizeBtn = document.getElementById('optimizeContextBtn');
        
        if (!contextStats || !contextBarFill || !optimizationStatus || !optimizeBtn) {
            return;
        }
        
        // Update stats text
        contextStats.textContent = `Context usage: ${this.currentUsage.total_tokens}/${this.currentUsage.context_window} tokens (${Math.round(this.currentUsage.usage_percentage)}%)`;
        
        // Update progress bar
        contextBarFill.style.width = `${Math.min(this.currentUsage.usage_percentage, 100)}%`;
        
        // Update classes based on usage percentage
        contextBarFill.classList.remove('warning', 'danger');
        if (this.currentUsage.usage_percentage > 70) {
            contextBarFill.classList.add('warning');
        }
        if (this.currentUsage.usage_percentage > 90) {
            contextBarFill.classList.add('danger');
        }
        
        // Update optimization status
        optimizationStatus.classList.remove('bg-success', 'bg-warning', 'bg-danger', 'bg-info');
        optimizeBtn.style.display = 'none';
        
        if (this.currentUsage.is_optimized) {
            switch (this.currentUsage.optimization_level) {
                case 'light':
                    optimizationStatus.classList.add('bg-info');
                    optimizationStatus.textContent = 'Lightly Optimized';
                    break;
                case 'medium':
                    optimizationStatus.classList.add('bg-warning');
                    optimizationStatus.textContent = 'Medium Optimization';
                    break;
                case 'heavy':
                    optimizationStatus.classList.add('bg-danger');
                    optimizationStatus.textContent = 'Heavy Optimization';
                    optimizeBtn.style.display = 'inline-block';
                    break;
            }
        } else {
            // Not optimized but may need optimization
            if (this.currentUsage.usage_percentage > 90) {
                optimizationStatus.classList.add('bg-warning');
                optimizationStatus.textContent = 'Near Limit';
                optimizeBtn.style.display = 'inline-block';
            } else if (this.currentUsage.usage_percentage > 70) {
                optimizationStatus.classList.add('bg-info');
                optimizationStatus.textContent = 'Good';
            } else {
                optimizationStatus.classList.add('bg-success');
                optimizationStatus.textContent = 'Optimal';
            }
        }
        
        // Add or update optimization info
        let optimizationInfo = document.querySelector('.optimization-info');
        if (!optimizationInfo) {
            optimizationInfo = document.createElement('div');
            optimizationInfo.className = 'optimization-info';
            const contextVisualization = document.getElementById('contextVisualization');
            if (contextVisualization) {
                contextVisualization.appendChild(optimizationInfo);
            }
        }
        
        if (this.currentUsage.is_optimized) {
            optimizationInfo.textContent = this.getOptimizationDescription(this.currentUsage.optimization_level);
            optimizationInfo.style.display = 'block';
        } else {
            optimizationInfo.style.display = 'none';
        }
    }
    
    /**
     * Get description text for optimization level
     * @param {string} level - Optimization level
     * @returns {string} - Description text
     */
    getOptimizationDescription(level) {
        switch (level) {
            case 'light':
                return 'Some early messages have been trimmed to keep the most recent context.';
            case 'medium':
                return 'Older messages have been summarized to maintain conversation coherence.';
            case 'heavy':
                return 'Conversation history has been heavily condensed to extract key information.';
            default:
                return '';
        }
    }
    
    /**
     * Optimize the conversation context
     * @param {Array} messages - Current conversation messages
     * @param {string} threadId - Optional thread ID
     * @returns {Array} - Optimized messages
     */
    async optimizeContext(messages, threadId) {
        if (!messages) {
            // Try to get current conversation from the window
            if (window.currentThread && Array.isArray(window.currentThread)) {
                messages = window.currentThread;
            } else {
                console.error('No messages to optimize');
                return null;
            }
        }
        
        try {
            // Get thread ID from active conversation if not provided
            if (!threadId && window.conversationManager) {
                const activeConversation = window.conversationManager.getCurrentConversation();
                if (activeConversation) {
                    threadId = activeConversation.id;
                }
            }
            
            // Call API to optimize context
            const response = await fetch('/api/context/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    model: this.currentModel,
                    context_window: this.contextWindow,
                    thread_id: threadId
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    // Update usage information
                    this.currentUsage = data.optimized_usage;
                    
                    // Update visualization
                    this.displayContextUsage();
                    
                    // Show notification
                    this.showOptimizationNotification(data);
                    
                    // Return optimized messages
                    return data.optimized_messages;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error optimizing context:', error);
            return null;
        }
    }
    
    /**
     * Show notification about context optimization
     * @param {Object} optimizationData - Data from optimization API
     */
    showOptimizationNotification(optimizationData) {
        if (window.showToast) {
            const originalCount = optimizationData.original_count;
            const optimizedCount = optimizationData.optimized_count;
            const reductionPercent = Math.round((1 - (optimizedCount / originalCount)) * 100);
            
            window.showToast(
                `Context optimized: ${optimizedCount} messages (reduced by ${reductionPercent}%)`, 
                'success', 
                5000
            );
        }
    }
    
    /**
     * Check if conversation needs optimization before sending
     * @param {Array} messages - Conversation messages to check
     * @returns {boolean} - True if optimization is needed
     */
    needsOptimization(messages) {
        if (!messages || !Array.isArray(messages)) {
            return false;
        }
        
        // Update usage information
        this.updateContextVisualization(messages);
        
        // Check if we're over the threshold
        return this.currentUsage.usage_percentage > 100;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create global instance
    window.contextManager = new ContextManager();
    
    // Initialize with current model
    const modelSelect = document.getElementById('modelSelect');
    const currentModel = modelSelect ? modelSelect.value : 'llama3.2';
    
    window.contextManager.init(currentModel);
    
    // Update when model changes
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            window.contextManager.init(this.value);
        });
    }
});