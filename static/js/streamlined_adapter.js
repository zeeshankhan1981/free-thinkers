/**
 * Streamlined UI Adapter
 * Connects the new streamlined UI with existing application functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait for the original JS to initialize first
    setTimeout(initStreamlinedAdapter, 500);
});

function initStreamlinedAdapter() {
    // DOM Elements
    const chatDisplay = document.getElementById('chatDisplay');
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const tokenProgressBar = document.getElementById('tokenProgressBar');
    const tokenUsageText = document.getElementById('tokenUsageText');
    const contextFill = document.getElementById('contextFill');
    const contextUsageText = document.getElementById('contextUsageText');
    const contextStatus = document.getElementById('contextStatus');
    
    // Connect to the original functions and events
    
    // Intercept the original send message function
    const originalSendMessage = window.sendMessage;
    if (originalSendMessage) {
        window.sendMessage = function(message) {
            // Add the message to our UI
            addMessageToUI('user', message);
            
            // Scroll to bottom
            scrollToBottom();
            
            // Clear input
            messageInput.value = '';
            messageInput.style.height = 'auto';
            
            // Call the original function
            return originalSendMessage(message);
        };
    }
    
    // Intercept message display
    const originalDisplayMessage = window.displayMessage;
    if (originalDisplayMessage) {
        window.displayMessage = function(message, isUser = false) {
            // Add to our UI
            addMessageToUI(isUser ? 'user' : 'assistant', message);
            
            // Scroll to bottom
            scrollToBottom();
            
            // Call the original function for compatibility
            return originalDisplayMessage(message, isUser);
        };
    }
    
    // Add hook for token update
    const originalUpdateTokenCount = window.updateTokenCount;
    if (originalUpdateTokenCount) {
        window.updateTokenCount = function(count, max) {
            // Update our UI
            updateTokenUI(count, max);
            
            // Call the original function
            return originalUpdateTokenCount(count, max);
        };
    }
    
    // Check for context manager
    if (window.contextManager) {
        // Backup original displayContextUsage
        const originalDisplayContextUsage = window.contextManager.displayContextUsage;
        if (originalDisplayContextUsage) {
            window.contextManager.displayContextUsage = function() {
                // Update our UI
                updateContextUI(this.currentUsage);
                
                // Call the original function
                return originalDisplayContextUsage.call(window.contextManager);
            };
        }
    }
    
    // Observe the original chat container for changes
    observeChatMessages();
    
    // Helper Functions
    
    // Add a message to the UI
    function addMessageToUI(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.textContent = content;
        
        chatDisplay.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Scroll chat to bottom
    function scrollToBottom() {
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
    
    // Update token UI
    function updateTokenUI(count, max) {
        if (!tokenProgressBar || !tokenUsageText) return;
        
        const percentage = max > 0 ? (count / max) * 100 : 0;
        tokenProgressBar.style.width = `${Math.min(percentage, 100)}%`;
        tokenUsageText.textContent = `${count}/${max}`;
        
        // Update color based on usage
        tokenProgressBar.className = 'progress-bar';
        if (percentage > 80) {
            tokenProgressBar.classList.add('bg-warning');
        }
        if (percentage > 95) {
            tokenProgressBar.classList.add('bg-danger');
        }
    }
    
    // Update context UI
    function updateContextUI(usage) {
        if (!contextFill || !contextUsageText || !contextStatus || !usage) return;
        
        const percentage = usage.usage_percentage || 0;
        contextFill.style.width = `${Math.min(percentage, 100)}%`;
        contextUsageText.textContent = `${Math.round(percentage)}%`;
        
        // Update status indicator
        contextStatus.className = 'badge';
        if (usage.is_optimized) {
            switch (usage.optimization_level) {
                case 'light':
                    contextStatus.classList.add('bg-info');
                    contextStatus.textContent = 'Optimized';
                    break;
                case 'medium':
                    contextStatus.classList.add('bg-warning');
                    contextStatus.textContent = 'Medium Opt';
                    break;
                case 'heavy':
                    contextStatus.classList.add('bg-danger');
                    contextStatus.textContent = 'Heavy Opt';
                    break;
            }
        } else {
            if (percentage > 90) {
                contextStatus.classList.add('bg-warning');
                contextStatus.textContent = 'Near Limit';
            } else if (percentage > 70) {
                contextStatus.classList.add('bg-info');
                contextStatus.textContent = 'Good';
            } else {
                contextStatus.classList.add('bg-success');
                contextStatus.textContent = 'Optimal';
            }
        }
    }
    
    // Observe the original chat messages to sync with our UI
    function observeChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // Create a new observer
        const observer = new MutationObserver(function(mutations) {
            // Only process if our UI is empty but the original has content
            if (chatDisplay.children.length === 0 && chatMessages.children.length > 0) {
                // Copy all messages to our UI
                Array.from(chatMessages.children).forEach(child => {
                    const isUser = child.classList.contains('user-message');
                    const content = child.textContent.trim();
                    if (content) {
                        addMessageToUI(isUser ? 'user' : 'assistant', content);
                    }
                });
                
                // Scroll to bottom
                scrollToBottom();
            }
        });
        
        // Start observing
        observer.observe(chatMessages, {
            childList: true,
            subtree: true
        });
    }
}