/**
 * Notification System
 * 
 * A unified system for displaying notifications, loading indicators,
 * and status messages to the user.
 */

/**
 * Show a notification popup in the corner
 * @param {string} message - The message to display
 * @param {string} type - Notification type: 'success', 'error', 'info', 'warning'
 * @param {number} duration - How long to show the notification in ms
 * @returns {Object} - The notification element and methods to control it
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-hide after duration unless duration is 0
    let hideTimeout;
    if (duration > 0) {
        hideTimeout = setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300); // Transition duration
        }, duration);
    }
    
    // Return controller object
    return {
        element: notification,
        
        // Update the notification message
        update: (newMessage) => {
            notification.textContent = newMessage;
        },
        
        // Change the notification type
        setType: (newType) => {
            notification.className = `notification notification-${newType}`;
            notification.classList.add('show');
        },
        
        // Hide the notification manually
        hide: () => {
            if (hideTimeout) clearTimeout(hideTimeout);
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    };
}

/**
 * Create a loading indicator
 * @param {string} message - The loading message to display
 * @param {string} position - Position: 'corner' (default) or 'center'
 * @returns {Object} - Controller for the loading indicator
 */
function createLoadingIndicator(message, position = 'corner') {
    // Create container
    const container = document.createElement('div');
    container.className = `loading-indicator loading-indicator-${position}`;
    
    // Add spinner and message
    container.innerHTML = `
        <div class="loading-indicator-content">
            <div class="loading-spinner"></div>
            <div class="loading-message">${message}</div>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(container);
    
    // Show with animation
    setTimeout(() => {
        container.classList.add('show');
    }, 10);
    
    // Return controller
    return {
        element: container,
        
        // Update the loading message
        updateText: (newMessage) => {
            const messageEl = container.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = newMessage;
            }
        },
        
        // Complete loading with success message
        complete: (successMessage = 'Complete', type = 'success') => {
            const spinner = container.querySelector('.loading-spinner');
            if (spinner) {
                spinner.classList.add('completed');
                spinner.innerHTML = '<i class="fas fa-check"></i>';
            }
            
            container.classList.add(`loading-indicator-${type}`);
            
            const messageEl = container.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = successMessage;
            }
            
            // Hide after a delay
            setTimeout(() => {
                container.classList.remove('show');
                setTimeout(() => {
                    container.remove();
                }, 300);
            }, 1500);
        },
        
        // Show error message
        error: (errorMessage = 'Error') => {
            const spinner = container.querySelector('.loading-spinner');
            if (spinner) {
                spinner.classList.add('error');
                spinner.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            }
            
            container.classList.add('loading-indicator-error');
            
            const messageEl = container.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = errorMessage;
            }
            
            // Hide after a delay
            setTimeout(() => {
                container.classList.remove('show');
                setTimeout(() => {
                    container.remove();
                }, 300);
            }, 3000);
        },
        
        // Manually dismiss
        dismiss: () => {
            container.classList.remove('show');
            setTimeout(() => {
                container.remove();
            }, 300);
        }
    };
}

/**
 * Create a loading indicator specifically for conversation operations
 * @param {string} message - The loading message to display
 * @returns {Object} - Controller for the loading indicator
 */
function createConversationLoadingIndicator(message) {
    return createLoadingIndicator(message, 'corner');
}

/**
 * Show a syncing indicator for conversation syncing
 * @returns {Object} - Controller for the syncing indicator
 */
function showSyncingNotification() {
    const indicator = createLoadingIndicator('Syncing conversations...', 'corner');
    return {
        complete: () => {
            indicator.complete('Sync complete');
        },
        error: (message = 'Sync failed') => {
            indicator.error(message);
        },
        dismiss: () => {
            indicator.dismiss();
        },
        updateText: (message) => {
            indicator.updateText(message);
        }
    };
}

/**
 * Create a toast notification that appears briefly and disappears
 * @param {string} message - Message to display
 * @param {string} type - Type of notification: success, error, info, warning
 * @param {number} duration - How long to show in ms
 */
function showToast(message, type = 'info', duration = 2000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// Export the functions
window.showNotification = showNotification;
window.createLoadingIndicator = createLoadingIndicator;
window.createConversationLoadingIndicator = createConversationLoadingIndicator;
window.showSyncingNotification = showSyncingNotification;
window.showToast = showToast;

// Add required CSS if not already in document
function addNotificationStyles() {
    // Check if styles are already added
    if (document.getElementById('notification-system-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'notification-system-styles';
    styleSheet.textContent = `
        /* Notification styles */
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 16px;
            background-color: #007bff;
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
            max-width: 300px;
            font-size: 0.9rem;
            z-index: 2000;
            pointer-events: auto;
        }
        
        .notification.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification-success {
            background-color: #28a745;
        }
        
        .notification-error {
            background-color: #dc3545;
        }
        
        .notification-warning {
            background-color: #ffc107;
            color: #212529;
        }
        
        .notification-info {
            background-color: #17a2b8;
        }
        
        /* Loading indicator styles */
        .loading-indicator {
            position: fixed;
            z-index: 2000;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            pointer-events: auto;
        }
        
        .loading-indicator.show {
            opacity: 1;
        }
        
        /* Corner position (default) */
        .loading-indicator-corner {
            bottom: 20px;
            right: 20px;
            padding: 12px 16px;
            transform: translateY(20px);
            max-width: 300px;
        }
        
        .loading-indicator-corner.show {
            transform: translateY(0);
        }
        
        /* Center position */
        .loading-indicator-center {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            padding: 24px;
            text-align: center;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            min-width: 200px;
        }
        
        .loading-indicator-center.show {
            transform: translate(-50%, -50%) scale(1);
        }
        
        .loading-indicator-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #007bff;
            animation: spin 1s linear infinite;
            flex-shrink: 0;
        }
        
        .loading-indicator-center .loading-spinner {
            width: 32px;
            height: 32px;
            border-top-color: white;
            margin: 0 auto 16px;
        }
        
        .loading-message {
            font-size: 0.9rem;
            color: #333;
            max-width: 240px;
        }
        
        .loading-indicator-center .loading-message {
            font-size: 1rem;
            color: white;
        }
        
        /* Completed state */
        .loading-spinner.completed {
            animation: none;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #28a745;
            font-size: 1.2rem;
        }
        
        .loading-spinner.error {
            animation: none;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #dc3545;
            font-size: 1.2rem;
        }
        
        .loading-indicator-success .loading-message {
            color: #28a745;
        }
        
        .loading-indicator-error .loading-message {
            color: #dc3545;
        }
        
        /* Toast notification */
        .toast {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            padding: 10px 20px;
            background-color: #333;
            color: white;
            border-radius: 4px;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            z-index: 2000;
            font-size: 0.9rem;
        }
        
        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        
        .toast-success {
            background-color: #28a745;
        }
        
        .toast-error {
            background-color: #dc3545;
        }
        
        .toast-warning {
            background-color: #ffc107;
            color: #212529;
        }
        
        .toast-info {
            background-color: #17a2b8;
        }
        
        /* Dark mode compatibility */
        body.dark-mode .loading-indicator {
            background-color: rgba(33, 37, 41, 0.9);
        }
        
        body.dark-mode .loading-message {
            color: #f8f9fa;
        }
        
        body.dark-mode .loading-spinner {
            border-color: rgba(255, 255, 255, 0.1);
        }
        
        body.dark-mode .loading-indicator-success .loading-message {
            color: #28a745;
        }
        
        body.dark-mode .loading-indicator-error .loading-message {
            color: #dc3545;
        }
        
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    `;
    
    document.head.appendChild(styleSheet);
}

// Add the styles when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', addNotificationStyles);

// Add immediately if document is already interactive or complete
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    addNotificationStyles();
}