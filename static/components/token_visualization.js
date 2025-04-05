/**
 * Token Visualization Component
 * 
 * This script handles the token counting and visualization for LLM conversations.
 * It updates the token count in real-time as the user types, showing:
 * - Current token count
 * - Maximum token limit for the selected model
 * - Usage percentage with a visual progress bar
 */

// Initialize token visualization when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a short time to ensure all elements are loaded
    setTimeout(() => {
        initTokenVisualization();
    }, 500);
    
    // Get message input element
    const messageInput = document.getElementById('messageInput');
    
    // Add event listener for input changes
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            const text = this.value || '';
            const model = window.currentModel || 'mistral-7b';
            updateTokenVisualization(text, model);
        });
    }
    
    // Add event listener for model changes
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            const text = messageInput ? messageInput.value || '' : '';
            const model = this.value || 'mistral-7b';
            window.currentModel = model; // Update the current model
            updateTokenVisualization(text, model);
        });
    }
});

/**
 * Initialize token visualization with empty text
 */
function initTokenVisualization() {
    const currentModel = window.currentModel || 'mistral-7b';
    updateTokenVisualization('', currentModel);
}

/**
 * Update token visualization based on text and model
 * 
 * @param {string} text - The input text to count tokens for
 * @param {string} model - The model to use for token counting
 */
async function updateTokenVisualization(text, model) {
    try {
        // Ensure we have valid parameters
        if (!model) model = 'mistral-7b';
        if (!text) text = '';
        
        const response = await fetch('/api/token_count', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                text: text
            })
        });

        if (!response.ok) {
            console.error(`Token count API error: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            const tokenCount = data.token_count;
            const maxTokens = data.max_tokens;
            const percentage = data.percentage;

            // Update token count display
            const tokenCountElement = document.getElementById('tokenCount');
            const maxTokensElement = document.getElementById('maxTokens');
            const tokenPercentageElement = document.getElementById('tokenPercentage');
            const progressBar = document.getElementById('tokenProgressBar');
            
            if (tokenCountElement) tokenCountElement.textContent = tokenCount;
            if (maxTokensElement) maxTokensElement.textContent = maxTokens;
            if (tokenPercentageElement) tokenPercentageElement.textContent = percentage.toFixed(1) + '%';
            
            // Update progress bar
            if (progressBar) {
                progressBar.style.width = percentage + '%';
                
                // Update progress bar color based on usage
                if (percentage >= 80) {
                    progressBar.style.backgroundColor = 'var(--bs-danger)';
                } else if (percentage >= 60) {
                    progressBar.style.backgroundColor = 'var(--bs-warning)';
                } else {
                    progressBar.style.backgroundColor = 'var(--bs-primary)';
                }
            }
        } else {
            console.error('Token count API returned error:', data.error);
        }
    } catch (error) {
        console.error('Error updating token visualization:', error);
    }
}
