/**
 * Notification System
 * 
 * A lightweight notification system for displaying system messages.
 */

// Create notification container if it doesn't exist
function ensureNotificationContainer() {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Show a notification
 * @param {string} message - The message to show
 * @param {string} type - The type of notification (success, error, warning, info)
 * @param {number} duration - How long to show the notification in ms
 */
function showNotification(message, type = 'info', duration = 3000) {
    const container = ensureNotificationContainer();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Create notification icon
    const iconClass = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    // Create notification content
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="notification-content">
            <p class="notification-message">${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Add close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    });
    
    // Auto-close after duration (if not 0)
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode === container) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode === container) {
                        container.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }
    
    return notification;
}

// Loading state tracker
let activeLoadingState = null;

/**
 * Show a loading state notification that can be updated
 * @param {string} message - The loading message
 * @returns {Object} - Methods to update or hide the loading notification
 */
function showLoadingState(message = 'Loading...') {
    // Hide any existing loading state
    hideLoadingState();
    
    // Create a modal loading dialog instead of a notification
    const loadingModal = document.createElement('div');
    loadingModal.className = 'loading-modal';
    loadingModal.innerHTML = `
        <div class="loading-dialog">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <div class="loading-message">${message}</div>
        </div>
    `;
    
    // Add styling inline to ensure it's applied
    const style = document.createElement('style');
    style.textContent = `
        .loading-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .loading-modal.show {
            opacity: 1;
        }
        .loading-dialog {
            background-color: var(--bg-color, white);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            text-align: center;
            max-width: 300px;
            width: 100%;
        }
        .loading-spinner {
            font-size: 2rem;
            color: var(--primary-color, #007bff);
            margin-bottom: 10px;
        }
        .loading-message {
            font-size: 0.9rem;
            color: var(--text-color, #333);
        }
        body.dark-mode .loading-dialog {
            background-color: var(--dark-bg-color, #2a2a2a);
        }
        body.dark-mode .loading-message {
            color: var(--dark-text-color, #e0e0e0);
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(loadingModal);
    
    // Track active loading state
    activeLoadingState = loadingModal;
    
    // Animate in
    setTimeout(() => {
        loadingModal.classList.add('show');
    }, 10);
    
    return {
        updateMessage(newMessage) {
            const messageEl = loadingModal.querySelector('.loading-message');
            if (messageEl) {
                messageEl.textContent = newMessage;
            }
        },
        
        complete(completionMessage = 'Completed', type = 'success', duration = 3000) {
            // Hide loading modal
            hideLoadingState();
            
            // Show completion notification
            showNotification(completionMessage, type, duration);
        }
    };
}

/**
 * Hide any current loading state notifications
 */
function hideLoadingState() {
    if (activeLoadingState) {
        activeLoadingState.classList.remove('show');
        setTimeout(() => {
            if (activeLoadingState && activeLoadingState.parentNode) {
                activeLoadingState.parentNode.removeChild(activeLoadingState);
            }
            activeLoadingState = null;
        }, 300);
    }
}

// Handle syncing notification specially
function showSyncingNotification() {
    // Create a non-blocking syncing indicator in the corner
    const syncIndicator = document.createElement('div');
    syncIndicator.className = 'sync-indicator';
    syncIndicator.innerHTML = `
        <i class="fas fa-sync-alt fa-spin"></i>
        <span>Syncing...</span>
    `;
    
    // Add styling
    const style = document.createElement('style');
    style.textContent = `
        .sync-indicator {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background-color: var(--bg-color, white);
            color: var(--text-color, #333);
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 1000;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s, transform 0.3s;
            border: 1px solid var(--border-color, #dee2e6);
        }
        .sync-indicator.show {
            opacity: 1;
            transform: translateY(0);
        }
        body.dark-mode .sync-indicator {
            background-color: var(--dark-bg-color, #2a2a2a);
            color: var(--dark-text-color, #e0e0e0);
            border-color: var(--dark-border-color, #444);
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(syncIndicator);
    
    // Animate in
    setTimeout(() => {
        syncIndicator.classList.add('show');
    }, 10);
    
    return {
        complete() {
            syncIndicator.classList.remove('show');
            setTimeout(() => {
                if (syncIndicator.parentNode) {
                    syncIndicator.parentNode.removeChild(syncIndicator);
                }
            }, 300);
        }
    };
}

// Make functions globally available
window.showNotification = showNotification;
window.showLoadingState = showLoadingState;
window.hideLoadingState = hideLoadingState;
window.showSyncingNotification = showSyncingNotification;
