/**
 * Conversation UI Handler
 * 
 * Handles all UI interactions for the conversation management system.
 */

class ConversationUI {
    constructor() {
        this.manager = window.conversationManager;
        this.setupEventListeners();
        this.dragState = {
            isDragging: false,
            draggedElement: null,
            originalIndex: -1,
            dropIndicator: null
        };
        this.tooltips = [];
        this.init();
    }
    
    init() {
        // Initialize UI components
        this.renderConversations();
        this.setupDragAndDrop();
        this.setupTooltips();
        this.setupEmptyStates();
        
        // Show keyboard shortcuts panel on first visit
        if (!localStorage.getItem('hasSeenKeyboardShortcuts')) {
            setTimeout(() => {
                this.toggleKeyboardShortcutsPanel(true);
                localStorage.setItem('hasSeenKeyboardShortcuts', 'true');
            }, 1000);
        }
    }
    
    setupEventListeners() {
        // Sidebar toggle
        const toggleBtn = document.getElementById('conversationManagerBtn');
        const closeBtn = document.getElementById('closeConversationManager');
        const sidebar = document.getElementById('conversationManagerSidebar');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (sidebar) {
                    sidebar.classList.toggle('active');
                    this.renderConversations();
                }
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (sidebar) {
                    sidebar.classList.remove('active');
                }
            });
        }
        
        // Search functionality
        const searchInput = document.getElementById('conversationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    this.handleSearch({ target: searchInput });
                    searchInput.blur();
                }
            });
        }
        
        // Category toggles
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-toggle')) {
                const toggle = e.target.closest('.category-toggle');
                const categoryId = toggle.getAttribute('data-category');
                const list = document.querySelector(`.category-${categoryId}-list`);
                
                toggle.classList.toggle('collapsed');
                list?.classList.toggle('collapsed');
            }
        });
        
        // New conversation button
        const newConvBtn = document.getElementById('newConversationBtn');
        if (newConvBtn) {
            newConvBtn.addEventListener('click', () => {
                const newConversation = this.manager.createConversation();
                this.renderConversations();
                
                // Scroll to the new conversation
                setTimeout(() => {
                    const newItem = document.querySelector(`.conversation-item[data-id="${newConversation.id}"]`);
                    if (newItem) {
                        newItem.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            });
        }
        
        // Listen for conversation clicked
        document.addEventListener('click', (e) => {
            const conversationItem = e.target.closest('.conversation-item');
            if (conversationItem && !e.target.closest('.conversation-item-actions') && 
                !e.target.closest('.title-edit-input')) {
                const id = conversationItem.getAttribute('data-id');
                this.manager.setCurrentConversation(id);
                this.renderConversations();
            }
        });
        
        // Handle conversation action buttons
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.action-btn');
            if (!actionBtn) return;
            
            const conversationItem = actionBtn.closest('.conversation-item');
            const id = conversationItem?.getAttribute('data-id');
            if (!id) return;
            
            // Pin/Unpin
            if (actionBtn.classList.contains('pin-btn')) {
                this.manager.togglePinned(id);
                this.renderConversations();
            }
            
            // Delete
            if (actionBtn.classList.contains('delete-btn')) {
                if (confirm('Are you sure you want to delete this conversation?')) {
                    this.manager.deleteConversation(id);
                    this.renderConversations();
                }
            }
        });
        
        // Handle inline title editing
        document.addEventListener('click', (e) => {
            const titleEl = e.target.closest('.conversation-item-title');
            if (titleEl && !titleEl.classList.contains('editing')) {
                const conversationItem = titleEl.closest('.conversation-item');
                const id = conversationItem?.getAttribute('data-id');
                if (!id) return;
                
                // Create edit input
                titleEl.classList.add('editing');
                const currentTitle = titleEl.textContent.trim();
                titleEl.innerHTML = `<input type="text" class="title-edit-input" value="${currentTitle.replace(/"/g, '&quot;')}">`;
                
                const inputEl = titleEl.querySelector('input');
                inputEl.focus();
                inputEl.select();
                
                const handleTitleSave = () => {
                    const newTitle = inputEl.value.trim();
                    if (newTitle && newTitle !== currentTitle) {
                        this.manager.updateConversationTitle(id, newTitle);
                    }
                    
                    titleEl.classList.remove('editing');
                    this.renderConversations();
                };
                
                // Handle saving on blur and enter key
                inputEl.addEventListener('blur', handleTitleSave);
                inputEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        handleTitleSave();
                    } else if (e.key === 'Escape') {
                        titleEl.classList.remove('editing');
                        this.renderConversations();
                    }
                });
            }
        });
        
        // Listen for current conversation changed
        document.addEventListener('currentConversationChanged', (e) => {
            // Update UI to reflect new current conversation
            this.renderConversations();
            
            // Load conversation messages into the chat UI
            if (window.loadConversationMessages && e.detail) {
                window.loadConversationMessages(e.detail.messages);
            }
        });
        
        // Keyboard shortcuts panel
        document.addEventListener('click', (e) => {
            if (e.target.closest('#keyboardShortcutsBtn')) {
                this.toggleKeyboardShortcutsPanel(true);
            }
            
            if (e.target.closest('#closeKeyboardShortcuts') || 
                e.target.id === 'keyboardShortcutsPanel' && e.target.classList.contains('active')) {
                this.toggleKeyboardShortcutsPanel(false);
            }
        });
        
        // Sync with current thread when messages are sent
        document.addEventListener('messageSent', () => {
            this.manager.syncWithCurrentThread();
            this.renderConversations();
        });
        
        // Add unsaved changes indicator to window close event
        window.addEventListener('beforeunload', (e) => {
            if (this.manager.isUnsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }
    
    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        const categoriesList = document.getElementById('categoriesList');
        if (!conversationsList || !categoriesList) return;
        
        // Clear existing lists
        conversationsList.innerHTML = '';
        categoriesList.innerHTML = '';
        
        // Add categories
        const categories = this.manager.categories;
        if (categories.length === 0) {
            categoriesList.innerHTML = '<div class="empty-message"><i class="fas fa-folder"></i><p>No categories found</p></div>';
        } else {
            categories.forEach((category, index) => {
                const safeId = this.getSafeCategoryId(category);
                const categoryEl = document.createElement('div');
                categoryEl.className = 'category-item';
                categoryEl.setAttribute('data-category', category);
                categoryEl.innerHTML = `
                    <span>${category}</span>
                    <button class="category-toggle" data-category="${safeId}">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                `;
                categoriesList.appendChild(categoryEl);
            });
        }
        
        // Get current conversation for highlighting
        const currentId = this.manager.currentConversation?.id;
        
        // Add conversations
        const conversations = this.manager.conversations;
        if (conversations.length === 0) {
            this.showEmptyState(conversationsList);
        } else {
            conversations.forEach((conversation, index) => {
                const conversationEl = document.createElement('div');
                conversationEl.className = 'conversation-item';
                conversationEl.setAttribute('data-id', conversation.id);
                conversationEl.setAttribute('data-category', conversation.category);
                conversationEl.setAttribute('draggable', 'true');
                
                if (conversation.id === currentId) {
                    conversationEl.classList.add('active');
                }
                
                // Add "What's New" badge for new conversations
                const newBadge = conversation.isNew ? 
                    '<span class="whats-new-badge">NEW</span>' : '';
                
                // Add unsaved indicator if needed
                const unsavedIndicator = this.manager.isUnsavedChanges && conversation.id === currentId ?
                    '<span class="unsaved-indicator" title="Unsaved changes"></span>' : '';
                
                conversationEl.innerHTML = `
                    <span class="drag-handle">
                        <i class="fas fa-grip-vertical"></i>
                    </span>
                    <div class="conversation-item-title">
                        ${conversation.title}${newBadge}${unsavedIndicator}
                    </div>
                    <div class="conversation-item-actions">
                        <button class="action-btn pin-btn ${conversation.isPinned ? 'pinned' : ''}" title="${conversation.isPinned ? 'Unpin' : 'Pin'}">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                conversationsList.appendChild(conversationEl);
            });
        }
        
        // Re-setup tooltips after DOM changes
        this.setupTooltips();
    }
    
    showEmptyState(container) {
        container.innerHTML = `
            <div class="empty-message">
                <i class="fas fa-comments"></i>
                <p>No conversations yet</p>
                <p class="empty-message-help">Click the "New Conversation" button to get started</p>
            </div>
        `;
    }
    
    setupEmptyStates() {
        // Add What's New button to header
        const header = document.querySelector('.conversation-manager-header');
        if (header) {
            // Add keyboard shortcuts button
            const shortcutsBtn = document.createElement('button');
            shortcutsBtn.id = 'keyboardShortcutsBtn';
            shortcutsBtn.className = 'btn btn-sm btn-outline-secondary';
            shortcutsBtn.title = 'Keyboard Shortcuts';
            shortcutsBtn.innerHTML = '<i class="fas fa-keyboard"></i>';
            
            // Insert before close button
            const closeBtn = header.querySelector('.close-btn');
            if (closeBtn) {
                header.insertBefore(shortcutsBtn, closeBtn);
            } else {
                header.appendChild(shortcutsBtn);
            }
        }
        
        // Create keyboard shortcuts panel
        this.createKeyboardShortcutsPanel();
    }
    
    setupDragAndDrop() {
        // Handle drag start
        document.addEventListener('dragstart', (e) => {
            const conversationItem = e.target.closest('.conversation-item');
            if (!conversationItem) return;
            
            this.dragState.isDragging = true;
            this.dragState.draggedElement = conversationItem;
            
            // Get original index
            const items = Array.from(document.querySelectorAll('.conversation-item'));
            this.dragState.originalIndex = items.indexOf(conversationItem);
            
            // Add dragging class
            conversationItem.classList.add('dragging');
            
            // Set transparent drag image for smoother ux
            const dragImage = document.createElement('div');
            dragImage.style.opacity = '0';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            setTimeout(() => document.body.removeChild(dragImage), 0);
            
            // Set data
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', conversationItem.getAttribute('data-id'));
        });
        
        // Handle drag over
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            if (!this.dragState.isDragging) return;
            
            const conversationsList = document.getElementById('conversationsList');
            if (!conversationsList) return;
            
            // Find the item we're dragging over
            const targetItem = this.getClosestDragTarget(e.clientY);
            if (!targetItem) return;
            
            // Get the target index
            const items = Array.from(conversationsList.querySelectorAll('.conversation-item:not(.dragging)'));
            const targetIndex = items.indexOf(targetItem);
            
            // Create or move drop indicator
            this.updateDropIndicator(targetIndex, targetItem);
        });
        
        // Handle drag end
        document.addEventListener('dragend', (e) => {
            if (!this.dragState.isDragging) return;
            
            const draggedItem = this.dragState.draggedElement;
            draggedItem.classList.remove('dragging');
            
            // Remove drop indicator
            if (this.dragState.dropIndicator && this.dragState.dropIndicator.parentNode) {
                this.dragState.dropIndicator.parentNode.removeChild(this.dragState.dropIndicator);
            }
            
            this.dragState.isDragging = false;
            this.dragState.draggedElement = null;
            this.dragState.dropIndicator = null;
        });
        
        // Handle drop
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (!this.dragState.isDragging) return;
            
            const conversationsList = document.getElementById('conversationsList');
            if (!conversationsList) return;
            
            // Find the target item
            const targetItem = this.getClosestDragTarget(e.clientY);
            if (!targetItem) return;
            
            // Get the indices
            const items = Array.from(conversationsList.querySelectorAll('.conversation-item:not(.dragging)'));
            const targetIndex = items.indexOf(targetItem);
            const fromIndex = this.dragState.originalIndex;
            let toIndex = targetIndex;
            
            // Adjust index if dragging downward
            if (fromIndex < toIndex) {
                toIndex += 1;
            }
            
            // Reorder in the manager
            this.manager.reorderConversation(fromIndex, toIndex);
            
            // Refresh the UI
            this.renderConversations();
        });
    }
    
    getClosestDragTarget(clientY) {
        const conversationItems = document.querySelectorAll('.conversation-item:not(.dragging)');
        let closestItem = null;
        let closestDistance = Number.POSITIVE_INFINITY;
        
        conversationItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const distance = Math.abs(clientY - center);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        });
        
        return closestItem;
    }
    
    updateDropIndicator(targetIndex, targetItem) {
        if (!this.dragState.dropIndicator) {
            this.dragState.dropIndicator = document.createElement('div');
            this.dragState.dropIndicator.className = 'drop-indicator';
        }
        
        // Remove drop indicator from current parent
        if (this.dragState.dropIndicator.parentNode) {
            this.dragState.dropIndicator.parentNode.removeChild(this.dragState.dropIndicator);
        }
        
        // Add drop indicator to appropriate position
        const conversationsList = document.getElementById('conversationsList');
        if (targetItem && conversationsList) {
            conversationsList.insertBefore(this.dragState.dropIndicator, targetItem);
        }
    }
    
    handleSearch(e) {
        const query = e.target.value.trim().toLowerCase();
        const conversationItems = document.querySelectorAll('.conversation-item');
        
        if (query === '') {
            // Show all conversations
            conversationItems.forEach(item => {
                item.classList.remove('filtered');
                item.style.display = '';
            });
            return;
        }
        
        // Search results
        const results = this.manager.searchConversations(query);
        const resultIds = new Set(results.map(r => r.id));
        
        // Filter the list
        conversationItems.forEach(item => {
            const id = item.getAttribute('data-id');
            if (resultIds.has(id)) {
                item.classList.remove('filtered');
                item.style.display = '';
                
                // Highlight matching text
                const titleEl = item.querySelector('.conversation-item-title');
                if (titleEl) {
                    const title = titleEl.textContent;
                    const lowerTitle = title.toLowerCase();
                    const index = lowerTitle.indexOf(query);
                    
                    if (index >= 0) {
                        const before = title.substring(0, index);
                        const match = title.substring(index, index + query.length);
                        const after = title.substring(index + query.length);
                        
                        titleEl.innerHTML = `${before}<span class="search-result-highlight">${match}</span>${after}`;
                    }
                }
            } else {
                item.classList.add('filtered');
                item.style.display = 'none';
            }
        });
    }
    
    setupTooltips() {
        // Clear existing tooltips
        this.tooltips.forEach(tooltip => {
            if (tooltip.element) {
                tooltip.element.removeEventListener('mouseenter', tooltip.mouseEnterHandler);
                tooltip.element.removeEventListener('mouseleave', tooltip.mouseLeaveHandler);
            }
        });
        this.tooltips = [];
        
        // Action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            this.addTooltip(btn, btn.getAttribute('title') || '', 'top');
        });
        
        // Keyboard shortcut button
        const shortcutsBtn = document.getElementById('keyboardShortcutsBtn');
        if (shortcutsBtn) {
            this.addTooltip(shortcutsBtn, 'Keyboard Shortcuts <span class="shortcut-key">Ctrl</span>+<span class="shortcut-key">?</span>', 'left');
        }
        
        // New conversation button
        const newBtn = document.getElementById('newConversationBtn');
        if (newBtn) {
            this.addTooltip(newBtn, 'New Conversation <span class="shortcut-key">Ctrl</span>+<span class="shortcut-key">N</span>', 'top');
        }
        
        // Conversation manager button
        const managerBtn = document.getElementById('conversationManagerBtn');
        if (managerBtn) {
            this.addTooltip(managerBtn, 'Manage Conversations <span class="shortcut-key">Ctrl</span>+<span class="shortcut-key">,</span>', 'left');
        }
        
        // Search input
        const searchInput = document.getElementById('conversationSearch');
        if (searchInput) {
            this.addTooltip(searchInput.parentElement, 'Search Conversations <span class="shortcut-key">Ctrl</span>+<span class="shortcut-key">/</span>', 'bottom');
        }
    }
    
    addTooltip(element, content, position = 'top') {
        if (!element) return;
        
        // Remove existing title to avoid browser tooltip
        const title = element.getAttribute('title');
        if (title) {
            element.setAttribute('data-original-title', title);
            element.removeAttribute('title');
        }
        
        // Create tooltip element if needed
        if (!element.querySelector('.tooltip')) {
            const tooltip = document.createElement('div');
            tooltip.className = `tooltip ${position}`;
            tooltip.innerHTML = content;
            element.classList.add('tooltip-container');
            element.appendChild(tooltip);
        }
        
        // Store handlers for cleanup
        const mouseEnterHandler = () => {
            const tooltip = element.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '1';
                
                // Position adjustments
                if (position === 'top' || position === 'bottom') {
                    tooltip.style.transform = 'translateX(-50%) translateY(0)';
                } else {
                    tooltip.style.transform = 'translateY(-50%) translateX(0)';
                }
            }
        };
        
        const mouseLeaveHandler = () => {
            const tooltip = element.querySelector('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
            }
        };
        
        // Add event listeners
        element.addEventListener('mouseenter', mouseEnterHandler);
        element.addEventListener('mouseleave', mouseLeaveHandler);
        
        // Store for cleanup
        this.tooltips.push({ 
            element, 
            mouseEnterHandler, 
            mouseLeaveHandler 
        });
    }
    
    createKeyboardShortcutsPanel() {
        // Check if panel already exists
        if (document.getElementById('keyboardShortcutsPanel')) return;
        
        // Create panel
        const panel = document.createElement('div');
        panel.id = 'keyboardShortcutsPanel';
        panel.className = 'keyboard-shortcuts-panel';
        
        panel.innerHTML = `
            <div class="keyboard-shortcuts-header">
                <h3>Keyboard Shortcuts</h3>
                <button id="closeKeyboardShortcuts" class="close-modal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="shortcut-section">
                <h4>General Shortcuts</h4>
                <div class="shortcut-item">
                    <div class="shortcut-description">Create new conversation</div>
                    <div class="shortcut-combo">
                        <span class="key">Ctrl</span>
                        <span class="key-combo-separator">+</span>
                        <span class="key">N</span>
                    </div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-description">Toggle conversation manager</div>
                    <div class="shortcut-combo">
                        <span class="key">Ctrl</span>
                        <span class="key-combo-separator">+</span>
                        <span class="key">,</span>
                    </div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-description">Focus search</div>
                    <div class="shortcut-combo">
                        <span class="key">Ctrl</span>
                        <span class="key-combo-separator">+</span>
                        <span class="key">/</span>
                    </div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-description">Show keyboard shortcuts</div>
                    <div class="shortcut-combo">
                        <span class="key">Ctrl</span>
                        <span class="key-combo-separator">+</span>
                        <span class="key">?</span>
                    </div>
                </div>
            </div>
            
            <div class="shortcut-section">
                <h4>Conversation Navigation</h4>
                <div class="shortcut-item">
                    <div class="shortcut-description">Navigate to previous conversation</div>
                    <div class="shortcut-combo">
                        <span class="key">↑</span>
                    </div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-description">Navigate to next conversation</div>
                    <div class="shortcut-combo">
                        <span class="key">↓</span>
                    </div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-description">Delete current conversation</div>
                    <div class="shortcut-combo">
                        <span class="key">Delete</span>
                    </div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-description">Edit conversation title</div>
                    <div class="shortcut-combo">
                        <span class="key">Enter</span>
                    </div>
                </div>
                <div class="shortcut-item">
                    <div class="shortcut-description">Close sidebar</div>
                    <div class="shortcut-combo">
                        <span class="key">Esc</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
    }
    
    toggleKeyboardShortcutsPanel(show) {
        const panel = document.getElementById('keyboardShortcutsPanel');
        if (!panel) return;
        
        if (show) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    }
    
    getSafeCategoryId(category) {
        return category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
}

// Initialize the conversation UI when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.conversationManager) {
        window.conversationUI = new ConversationUI();
    } else {
        console.error('Conversation manager not initialized');
    }
});

// Make functions globally available
window.toggleKeyboardShortcutsPanel = function(show) {
    if (window.conversationUI) {
        window.conversationUI.toggleKeyboardShortcutsPanel(show);
    }
};
