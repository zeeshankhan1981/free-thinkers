/**
 * Conversation UI Manager
 * 
 * Manages all UI interactions for the conversation management system.
 * This class connects the conversation store with the UI components.
 */

class ConversationUI {
    constructor() {
        // Get the store
        this.store = window.conversationStore;
        if (!this.store) {
            console.error('Conversation store not found');
            return;
        }
        
        // UI state
        this.currentCategory = 'All';
        this.searchQuery = '';
        this.isSearching = false;
        
        // Initialize UI and event listeners
        this.initializeUI();
        this.setupEventListeners();
        
        // Drag and drop state
        this.dragState = {
            isDragging: false,
            draggedElement: null,
            originalIndex: -1,
            dropIndicator: null
        };
    }
    
    /**
     * Initialize UI components
     */
    initializeUI() {
        // Create loading state for initial load
        const loader = this.createLoadingIndicator('Loading conversations...');
        
        // Initialize empty states and placeholders
        const sidebar = document.getElementById('conversationManagerSidebar');
        if (sidebar) {
            this.populateEmptyUI(sidebar);
        }
        
        // Subscribe to store events
        this.store.on('stateChanged', () => this.renderUI());
        this.store.on('error', (error) => this.handleError(error));
        
        // When store finishes loading, render UI and remove loader
        this.store.on('conversationsLoaded', () => {
            this.renderUI();
            loader.complete('Conversations loaded');
        });
        
        // Initial render
        this.renderUI();
    }
    
    /**
     * Create empty placeholder UI
     * @param {HTMLElement} sidebar - The sidebar element
     */
    populateEmptyUI(sidebar) {
        // Find the lists sections
        const categoriesList = sidebar.querySelector('#categoriesList');
        const conversationsList = sidebar.querySelector('#conversationsList');
        
        if (categoriesList) {
            categoriesList.innerHTML = `
                <div class="skeleton-loading">
                    <div class="skeleton skeleton-item"></div>
                    <div class="skeleton skeleton-item"></div>
                </div>
            `;
        }
        
        if (conversationsList) {
            conversationsList.innerHTML = `
                <div class="skeleton-loading">
                    <div class="skeleton skeleton-item"></div>
                    <div class="skeleton skeleton-item"></div>
                    <div class="skeleton skeleton-item"></div>
                </div>
            `;
        }
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Sidebar toggle
        const toggleBtn = document.getElementById('conversationManagerBtn');
        const closeBtn = document.getElementById('closeConversationManager');
        const sidebar = document.getElementById('conversationManagerSidebar');
        
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                // Use the global toggleSidebar if available
                if (window.toggleSidebar && typeof window.toggleSidebar === 'function') {
                    window.toggleSidebar(sidebar, toggleBtn);
                    
                    // If opening, ensure UI is rendered with latest data
                    if (sidebar.classList.contains('active')) {
                        this.refreshConversations();
                    }
                } else {
                    // Legacy behavior
                    // Close any other sidebars that might be open
                    const otherSidebars = document.querySelectorAll('.parameter-controls-sidebar.active, .model-management-sidebar.active');
                    otherSidebars.forEach(s => s.classList.remove('active'));
                    
                    // Toggle this sidebar
                    sidebar.classList.toggle('active');
                    toggleBtn.setAttribute('aria-expanded', sidebar.classList.contains('active'));
                    
                    // If opening, ensure UI is rendered with latest data
                    if (sidebar.classList.contains('active')) {
                        this.refreshConversations();
                    }
                }
            });
            
            // Add a method to refresh conversations with loading indicator
            this.refreshConversations = () => {
                this.renderUI();
                
                // Show subtle loading indicator when sidebar is opened
                const loader = this.createLoadingIndicator('Refreshing conversations...');
                
                // Check for server updates
                if (this.store && typeof this.store.syncWithServer === 'function') {
                    this.store.syncWithServer()
                        .then(() => loader.complete('Conversations updated'))
                        .catch(() => loader.dismiss());
                } else {
                    // Hide loader if no sync method
                    setTimeout(() => loader.dismiss(), 500);
                }
            };
        }
        
        if (closeBtn && sidebar) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('active');
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.classList.remove('active');
                }
                
                // Update activeSidebar if it's a global variable
                if (window.activeSidebar !== undefined) {
                    window.activeSidebar = null;
                }
            });
        }
        
        // New conversation button
        const newConvBtn = document.getElementById('newConversationBtn');
        if (newConvBtn) {
            newConvBtn.addEventListener('click', () => this.createNewConversation());
        }
        
        // Search input
        const searchInput = document.getElementById('conversationSearch');
        if (searchInput) {
            // Debounced search handler
            let searchTimeout = null;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value.trim();
                    this.isSearching = this.searchQuery !== '';
                    this.renderUI();
                }, 300);
            });
            
            // Handle Escape key to clear search
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    this.searchQuery = '';
                    this.isSearching = false;
                    this.renderUI();
                    searchInput.blur();
                }
            });
        }
        
        // Category selection
        document.addEventListener('click', (e) => {
            // Categories can be clicked from the list
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                const category = categoryItem.getAttribute('data-category');
                if (category) {
                    this.currentCategory = category;
                    this.renderUI();
                }
            }
            
            // Or from category toggles in the UI
            const categoryToggle = e.target.closest('.category-header');
            if (categoryToggle) {
                const category = categoryToggle.getAttribute('data-category');
                if (category) {
                    categoryToggle.classList.toggle('collapsed');
                    const categoryContent = document.querySelector(`.category-content[data-category="${category}"]`);
                    if (categoryContent) {
                        categoryContent.classList.toggle('collapsed');
                    }
                }
            }
        });
        
        // Conversation click handler
        document.addEventListener('click', (e) => {
            const conversationItem = e.target.closest('.conversation-item');
            if (!conversationItem) return;
            
            // Ignore if clicked on title during editing or on action buttons
            if (e.target.closest('.conversation-item-title.editing') || 
                e.target.closest('.conversation-item-actions')) {
                return;
            }
            
            const id = conversationItem.getAttribute('data-id');
            if (id) {
                this.selectConversation(id);
            }
        });
        
        // Action buttons
        document.addEventListener('click', (e) => {
            // Handle pin/unpin
            const pinBtn = e.target.closest('.pin-btn');
            if (pinBtn) {
                const conversationItem = pinBtn.closest('.conversation-item');
                if (conversationItem) {
                    const id = conversationItem.getAttribute('data-id');
                    if (id) {
                        this.togglePin(id);
                        e.stopPropagation();
                    }
                }
            }
            
            // Handle delete
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const conversationItem = deleteBtn.closest('.conversation-item');
                if (conversationItem) {
                    const id = conversationItem.getAttribute('data-id');
                    if (id) {
                        this.deleteConversation(id);
                        e.stopPropagation();
                    }
                }
            }
        });
        
        // Title editing
        document.addEventListener('click', (e) => {
            const titleEl = e.target.closest('.conversation-item-title');
            if (!titleEl || titleEl.classList.contains('editing')) return;
            
            const conversationItem = titleEl.closest('.conversation-item');
            if (!conversationItem) return;
            
            const id = conversationItem.getAttribute('data-id');
            if (!id) return;
            
            // Enable editing mode
            this.enableTitleEditing(titleEl, id);
            e.stopPropagation();
        });
        
        // Import/Export buttons
        const importBtn = document.getElementById('importConversationBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.showImportModal());
        }
        
        const exportBtn = document.getElementById('exportConversationBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.showExportModal());
        }
        
        // Handle modal close buttons
        document.addEventListener('click', (e) => {
            const closeModalBtn = e.target.closest('.close-modal, [data-dismiss="modal"]');
            if (closeModalBtn) {
                const modal = closeModalBtn.closest('.modal-container');
                if (modal) {
                    this.hideModal(modal.id);
                }
            }
        });
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard shortcuts if sidebar is visible
            const sidebar = document.getElementById('conversationManagerSidebar');
            if (!sidebar || !sidebar.classList.contains('active')) return;
            
            // Skip if focus is in editable area
            if (e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' || 
                e.target.isContentEditable) {
                return;
            }
            
            // Create new conversation: Ctrl+N or Cmd+N
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.createNewConversation();
            }
            
            // Toggle sidebar: Escape
            if (e.key === 'Escape') {
                sidebar.classList.remove('active');
                if (document.getElementById('toggleConversationManager')) {
                    document.getElementById('toggleConversationManager').setAttribute('aria-expanded', 'false');
                }
            }
        });
        
        // Set up drag and drop for conversations
        this.setupDragAndDrop();
        
        // Export event handlers
        document.addEventListener('click', (e) => {
            // Export as JSON
            if (e.target.closest('#exportAsJSON')) {
                const currentConversation = this.store.getCurrentConversation();
                if (currentConversation) {
                    this.exportAsJSON(currentConversation.id);
                }
            }
            
            // Export as Markdown
            if (e.target.closest('#exportAsMarkdown')) {
                const currentConversation = this.store.getCurrentConversation();
                if (currentConversation) {
                    this.exportAsMarkdown(currentConversation.id);
                }
            }
        });
        
        // Import event handlers
        document.addEventListener('click', (e) => {
            if (e.target.closest('#importConversation')) {
                this.handleImport();
            }
        });
    }
    
    /**
     * Render the UI with current state
     */
    renderUI() {
        // Render categories list
        this.renderCategories();
        
        // Render conversations list
        this.renderConversations();
    }
    
    /**
     * Render categories list
     */
    renderCategories() {
        const categoriesList = document.getElementById('categoriesList');
        if (!categoriesList) return;
        
        const categories = this.store.categories;
        
        // Always have these base categories
        if (!categories.includes('All')) {
            categories.unshift('All');
        }
        
        if (!categories.includes('Uncategorized')) {
            categories.push('Uncategorized');
        }
        
        if (categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-folder"></i>
                    <p>No categories found</p>
                </div>
            `;
            return;
        }
        
        // Build categories HTML
        const categoryElements = categories.map(category => {
            const isActive = this.currentCategory === category;
            const count = category === 'All' ? 
                this.store.conversations.length : 
                this.store.conversations.filter(c => c.category === category).length;
            
            return `
                <div class="category-item ${isActive ? 'active' : ''}" 
                     data-category="${category}" role="button" tabindex="0">
                    <span class="category-name">${category}</span>
                    <span class="category-count">${count}</span>
                </div>
            `;
        }).join('');
        
        categoriesList.innerHTML = categoryElements;
    }
    
    /**
     * Render conversations list
     */
    renderConversations() {
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) return;
        
        // Get filtered conversations
        let conversations;
        if (this.isSearching) {
            // If searching, filter by query (across all categories)
            conversations = this.store.searchConversations(this.searchQuery);
        } else if (this.currentCategory !== 'All') {
            // Filter by selected category
            conversations = this.store.conversations.filter(c => c.category === this.currentCategory);
        } else {
            // Show all conversations
            conversations = this.store.conversations;
        }
        
        // Empty state
        if (conversations.length === 0) {
            let message;
            if (this.isSearching) {
                message = `No conversations found matching "${this.searchQuery}"`;
            } else if (this.currentCategory !== 'All') {
                message = `No conversations in "${this.currentCategory}"`;
            } else {
                message = 'No conversations yet';
            }
            
            conversationsList.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-comments"></i>
                    <p>${message}</p>
                    <p class="empty-message-help">Click "New Conversation" to get started</p>
                </div>
            `;
            return;
        }
        
        // Get current conversation ID
        const currentId = this.store.currentConversationId;
        
        // Build conversations HTML
        const conversationElements = conversations.map(conversation => {
            const isActive = conversation.id === currentId;
            
            // "What's New" badge for newly added conversations
            const newBadge = conversation.isNew ? 
                '<span class="whats-new-badge">NEW</span>' : '';
            
            // Unsaved indicator
            const unsavedIndicator = (currentId === conversation.id && this.store.pendingChanges.has(conversation.id)) ?
                '<span class="unsaved-indicator" title="Unsaved changes"></span>' : '';
                
            // Pin button state
            const isPinned = conversation.isPinned;
                
            return `
                <div class="conversation-item ${isActive ? 'active' : ''}" 
                     data-id="${conversation.id}" data-category="${conversation.category}"
                     draggable="true" role="button" tabindex="0">
                    <span class="drag-handle" aria-hidden="true">
                        <i class="fas fa-grip-vertical"></i>
                    </span>
                    <div class="conversation-item-title">
                        ${conversation.title}${newBadge}${unsavedIndicator}
                    </div>
                    <div class="conversation-item-actions">
                        <button class="action-btn pin-btn ${isPinned ? 'pinned' : ''}" 
                                title="${isPinned ? 'Unpin' : 'Pin'}" aria-label="${isPinned ? 'Unpin' : 'Pin'}">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button class="action-btn delete-btn" title="Delete" aria-label="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        conversationsList.innerHTML = conversationElements;
    }
    
    /**
     * Set up drag and drop for conversations
     */
    setupDragAndDrop() {
        // Handle drag start
        document.addEventListener('dragstart', (e) => {
            const conversationItem = e.target.closest('.conversation-item');
            if (!conversationItem) return;
            
            this.dragState.isDragging = true;
            this.dragState.draggedElement = conversationItem;
            
            // Get original index
            const conversations = Array.from(document.querySelectorAll('.conversation-item'));
            this.dragState.originalIndex = conversations.indexOf(conversationItem);
            
            // Add dragging class
            conversationItem.classList.add('dragging');
            
            // Set custom drag image (invisible element)
            const dragImage = document.createElement('div');
            dragImage.style.opacity = '0';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            setTimeout(() => document.body.removeChild(dragImage), 0);
            
            // Set data (item ID)
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', conversationItem.getAttribute('data-id'));
        });
        
        // Handle drag over
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            if (!this.dragState.isDragging) return;
            
            const conversationsList = document.getElementById('conversationsList');
            if (!conversationsList) return;
            
            // Find closest item to drop position
            const targetItem = this.getClosestDragTarget(e.clientY);
            if (!targetItem) return;
            
            // Update drop indicator
            this.updateDropIndicator(targetItem);
        });
        
        // Handle drag end
        document.addEventListener('dragend', () => {
            if (!this.dragState.isDragging) return;
            
            // Clean up dragging state
            if (this.dragState.draggedElement) {
                this.dragState.draggedElement.classList.remove('dragging');
            }
            
            // Remove drop indicator
            if (this.dragState.dropIndicator && this.dragState.dropIndicator.parentNode) {
                this.dragState.dropIndicator.parentNode.removeChild(this.dragState.dropIndicator);
            }
            
            // Reset drag state
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
            
            // Find target position
            const targetItem = this.getClosestDragTarget(e.clientY);
            if (!targetItem) return;
            
            // Calculate indices
            const conversations = Array.from(conversationsList.querySelectorAll('.conversation-item:not(.dragging)'));
            const targetIndex = conversations.indexOf(targetItem);
            const fromIndex = this.dragState.originalIndex;
            
            // Execute reorder
            this.reorderConversation(fromIndex, targetIndex);
        });
    }
    
    /**
     * Find the closest drag target based on Y position
     * @param {number} clientY - Mouse Y position
     * @returns {Element|null} - Target element
     */
    getClosestDragTarget(clientY) {
        const items = document.querySelectorAll('.conversation-item:not(.dragging)');
        
        let closestItem = null;
        let closestDistance = Number.POSITIVE_INFINITY;
        
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const distance = Math.abs(clientY - centerY);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = item;
            }
        });
        
        return closestItem;
    }
    
    /**
     * Update drop indicator position
     * @param {Element} targetItem - Target element to position indicator
     */
    updateDropIndicator(targetItem) {
        // Create indicator if it doesn't exist
        if (!this.dragState.dropIndicator) {
            this.dragState.dropIndicator = document.createElement('div');
            this.dragState.dropIndicator.className = 'drop-indicator';
        }
        
        // Remove from current parent
        if (this.dragState.dropIndicator.parentNode) {
            this.dragState.dropIndicator.parentNode.removeChild(this.dragState.dropIndicator);
        }
        
        // Insert before target
        const conversationsList = document.getElementById('conversationsList');
        if (conversationsList && targetItem) {
            conversationsList.insertBefore(this.dragState.dropIndicator, targetItem);
        }
    }
    
    /**
     * Reorder a conversation in the list
     * @param {number} fromIndex - Original index
     * @param {number} toIndex - Target index
     */
    reorderConversation(fromIndex, toIndex) {
        // Different reordering for actual store vs UI
        const actualFromIndex = this.isSearching || this.currentCategory !== 'All' ? 
            null : fromIndex;
            
        const actualToIndex = this.isSearching || this.currentCategory !== 'All' ? 
            null : toIndex;
        
        // If we're in filtered view, we need to get the actual indices
        if (actualFromIndex !== null && actualToIndex !== null) {
            this.store.reorderConversation(actualFromIndex, actualToIndex);
        } else {
            // Get the IDs of the conversations to reorder
            const conversations = Array.from(document.querySelectorAll('.conversation-item'));
            const fromId = conversations[fromIndex].getAttribute('data-id');
            const toId = conversations[toIndex].getAttribute('data-id');
            
            // Get the indices in the full list
            const fromIdxInFull = this.store.conversations.findIndex(c => c.id === fromId);
            const toIdxInFull = this.store.conversations.findIndex(c => c.id === toId);
            
            if (fromIdxInFull !== -1 && toIdxInFull !== -1) {
                this.store.reorderConversation(fromIdxInFull, toIdxInFull);
            }
        }
        
        // Re-render UI
        this.renderUI();
    }
    
    /**
     * Create a new conversation
     */
    createNewConversation() {
        // Create a new untitled conversation
        const newConversation = this.store.createConversation('New Conversation');
        
        // Update UI
        this.renderUI();
        
        // Get the conversation element and scroll to it
        const conversationItem = document.querySelector(`.conversation-item[data-id="${newConversation.id}"]`);
        if (conversationItem) {
            // Since we added at the top, we can just scroll to top
            const conversationsList = document.getElementById('conversationsList');
            if (conversationsList) {
                conversationsList.scrollTop = 0;
            }
            
            // Focus on the title and make it editable immediately
            setTimeout(() => {
                const titleEl = conversationItem.querySelector('.conversation-item-title');
                if (titleEl) {
                    this.enableTitleEditing(titleEl, newConversation.id);
                }
            }, 100);
        }
        
        // Create a notification
        this.createNotification('New conversation created', 'success');
    }
    
    /**
     * Select a conversation
     * @param {string} conversationId - ID of conversation to select
     */
    selectConversation(conversationId) {
        // Load conversation into the thread
        const success = this.store.loadConversationToThread(conversationId);
        
        if (success) {
            // Update UI
            this.renderUI();
            
            // Re-render messages in the chat UI
            this.renderMessages();
            
            // Close sidebar on mobile
            const sidebar = document.getElementById('conversationManagerSidebar');
            if (sidebar && window.innerWidth < 768) {
                sidebar.classList.remove('active');
            }
            
            // Create a subtle notification
            this.createNotification('Conversation loaded', 'info');
        }
    }
    
    /**
     * Enable title editing for a conversation
     * @param {Element} titleEl - Title element
     * @param {string} conversationId - Conversation ID
     */
    enableTitleEditing(titleEl, conversationId) {
        // Get current title
        const conversation = this.store.getConversationById(conversationId);
        if (!conversation) return;
        
        const currentTitle = conversation.title;
        
        // Add editing class
        titleEl.classList.add('editing');
        
        // Create input field
        titleEl.innerHTML = `
            <input type="text" class="title-edit-input" 
                   value="${currentTitle.replace(/"/g, '&quot;')}" 
                   aria-label="Edit conversation title">
        `;
        
        // Focus input
        const inputEl = titleEl.querySelector('input');
        inputEl.focus();
        inputEl.select();
        
        // Define save function
        const saveTitleEdit = () => {
            const newTitle = inputEl.value.trim();
            if (newTitle && newTitle !== currentTitle) {
                this.store.updateConversation(conversationId, { title: newTitle });
            }
            
            // Remove editing class
            titleEl.classList.remove('editing');
            this.renderUI();
        };
        
        // Save on blur
        inputEl.addEventListener('blur', saveTitleEdit);
        
        // Save on Enter, cancel on Escape
        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveTitleEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                titleEl.classList.remove('editing');
                this.renderUI();
            }
        });
    }
    
    /**
     * Toggle pinned status for a conversation
     * @param {string} conversationId - Conversation ID
     */
    togglePin(conversationId) {
        const isPinned = this.store.togglePinned(conversationId);
        
        // Create notification
        this.createNotification(
            isPinned ? 'Conversation pinned' : 'Conversation unpinned', 
            'success'
        );
    }
    
    /**
     * Delete a conversation
     * @param {string} conversationId - Conversation ID
     */
    deleteConversation(conversationId) {
        // Get conversation title for confirmation
        const conversation = this.store.getConversationById(conversationId);
        if (!conversation) return;
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${conversation.title}"? This cannot be undone.`)) {
            return;
        }
        
        // Delete conversation
        this.store.deleteConversation(conversationId).then(() => {
            // Create notification
            this.createNotification('Conversation deleted', 'success');
        }).catch(error => {
            console.error('Error deleting conversation:', error);
            this.createNotification('Error deleting conversation', 'error');
        });
    }
    
    /**
     * Show import modal
     */
    showImportModal() {
        const importModal = document.getElementById('importModal');
        if (!importModal) return;
        
        // Clear any previous input
        const jsonInput = document.getElementById('jsonFileInput');
        const markdownInput = document.getElementById('markdownFileInput');
        
        if (jsonInput) jsonInput.value = '';
        if (markdownInput) markdownInput.value = '';
        
        // Show modal
        importModal.style.display = 'flex';
        
        // Add outside click handler for dismissal
        const outsideClickHandler = (e) => {
            if (e.target === importModal) {
                this.hideModal('importModal');
                document.removeEventListener('click', outsideClickHandler);
            }
        };
        
        document.addEventListener('click', outsideClickHandler);
    }
    
    /**
     * Show export modal
     */
    showExportModal() {
        const exportModal = document.getElementById('exportModal');
        if (!exportModal) return;
        
        // Only allow export if there's a current conversation
        const currentConversation = this.store.getCurrentConversation();
        if (!currentConversation) {
            this.createNotification('No conversation selected to export', 'error');
            return;
        }
        
        // Show modal
        exportModal.style.display = 'flex';
        
        // Add outside click handler for dismissal
        const outsideClickHandler = (e) => {
            if (e.target === exportModal) {
                this.hideModal('exportModal');
                document.removeEventListener('click', outsideClickHandler);
            }
        };
        
        document.addEventListener('click', outsideClickHandler);
    }
    
    /**
     * Hide a modal
     * @param {string} modalId - ID of modal to hide
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Handle import operation
     */
    handleImport() {
        // Get file inputs
        const jsonInput = document.getElementById('jsonFileInput');
        const markdownInput = document.getElementById('markdownFileInput');
        
        // Check if we have a file
        if ((jsonInput && jsonInput.files.length === 0) && 
            (markdownInput && markdownInput.files.length === 0)) {
            this.createNotification('Please select a file to import', 'error');
            return;
        }
        
        // Create loading indicator
        const loader = this.createLoadingIndicator('Importing conversation...');
        
        // Handle JSON import
        if (jsonInput && jsonInput.files.length > 0) {
            const file = jsonInput.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const jsonContent = e.target.result;
                    const imported = this.store.importFromJSON(jsonContent);
                    
                    if (imported) {
                        this.hideModal('importModal');
                        loader.complete('Conversation imported successfully');
                        
                        // Select the imported conversation
                        this.selectConversation(imported.id);
                    } else {
                        loader.error('Failed to import conversation');
                    }
                } catch (error) {
                    console.error('Error reading JSON file:', error);
                    loader.error('Error reading JSON file');
                }
            };
            
            reader.onerror = () => {
                console.error('Error reading file');
                loader.error('Error reading file');
            };
            
            reader.readAsText(file);
            return;
        }
        
        // Handle Markdown import
        if (markdownInput && markdownInput.files.length > 0) {
            const file = markdownInput.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const markdownContent = e.target.result;
                    const imported = this.store.importFromMarkdown(markdownContent);
                    
                    if (imported) {
                        this.hideModal('importModal');
                        loader.complete('Conversation imported successfully');
                        
                        // Select the imported conversation
                        this.selectConversation(imported.id);
                    } else {
                        loader.error('Failed to import conversation');
                    }
                } catch (error) {
                    console.error('Error reading Markdown file:', error);
                    loader.error('Error reading Markdown file');
                }
            };
            
            reader.onerror = () => {
                console.error('Error reading file');
                loader.error('Error reading file');
            };
            
            reader.readAsText(file);
        }
    }
    
    /**
     * Export conversation as JSON
     * @param {string} conversationId - Conversation ID
     */
    exportAsJSON(conversationId) {
        // Get JSON content
        const jsonContent = this.store.exportToJSON(conversationId);
        if (!jsonContent) {
            this.createNotification('Error exporting conversation', 'error');
            return;
        }
        
        // Get conversation title for filename
        const conversation = this.store.getConversationById(conversationId);
        if (!conversation) return;
        
        // Create safe filename
        const safeTitle = conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeTitle}_${new Date().toISOString().split('T')[0]}.json`;
        
        // Create download
        this.downloadFile(jsonContent, filename, 'application/json');
        
        // Hide modal
        this.hideModal('exportModal');
        
        // Show notification
        this.createNotification('Conversation exported as JSON', 'success');
    }
    
    /**
     * Export conversation as Markdown
     * @param {string} conversationId - Conversation ID
     */
    exportAsMarkdown(conversationId) {
        // Get Markdown content
        const markdownContent = this.store.exportToMarkdown(conversationId);
        if (!markdownContent) {
            this.createNotification('Error exporting conversation', 'error');
            return;
        }
        
        // Get conversation title for filename
        const conversation = this.store.getConversationById(conversationId);
        if (!conversation) return;
        
        // Create safe filename
        const safeTitle = conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeTitle}_${new Date().toISOString().split('T')[0]}.md`;
        
        // Create download
        this.downloadFile(markdownContent, filename, 'text/markdown');
        
        // Hide modal
        this.hideModal('exportModal');
        
        // Show notification
        this.createNotification('Conversation exported as Markdown', 'success');
    }
    
    /**
     * Download file helper
     * @param {string} content - File content
     * @param {string} filename - Filename
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType) {
        // Create blob
        const blob = new Blob([content], { type: mimeType });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
        }, 100);
    }
    
    /**
     * Create a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('success', 'error', 'info')
     * @param {number} duration - Duration in ms
     * @returns {Object} - The notification controller
     */
    createNotification(message, type = 'success', duration = 3000) {
        // Use the unified notification system if available
        if (window.showNotification) {
            return window.showNotification(message, type, duration);
        }
        
        // Fallback to simple notification if system is not available
        console.warn('Using fallback notification - notification system not loaded');
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove after duration
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300); // Same as transition duration
            }, duration);
        }
        
        // Return controller for consistency with the unified system
        return {
            element: notification,
            update: (newMessage) => {
                notification.textContent = newMessage;
            },
            setType: (newType) => {
                notification.className = `notification notification-${newType}`;
                notification.classList.add('show');
            },
            hide: () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        };
    }
    
    /**
     * Create a loading indicator
     * @param {string} message - Initial message
     * @returns {Object} - Loading indicator controller
     */
    createLoadingIndicator(message) {
        // Use the standardized notification system
        if (window.createConversationLoadingIndicator) {
            return window.createConversationLoadingIndicator(message);
        }
        
        // If notification system is not available, use a fallback
        return this.createFallbackLoadingIndicator(message);
    }
    
    /**
     * Create a fallback loading indicator (only used if notification_system.js is not loaded)
     * @param {string} message - Initial message
     * @returns {Object} - Loading indicator controller
     */
    createFallbackLoadingIndicator(message) {
        console.warn('Using fallback loading indicator - notification system not loaded');
        
        // Create a simple corner notification
        const notification = document.createElement('div');
        notification.className = 'conversation-loading-indicator';
        notification.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-message">${message}</div>
        `;
        
        // Add simple styles if not present
        if (!document.getElementById('fallback-indicator-styles')) {
            const style = document.createElement('style');
            style.id = 'fallback-indicator-styles';
            style.textContent = `
                .conversation-loading-indicator {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.9);
                    color: #333;
                    padding: 12px 16px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 2000;
                    transition: opacity 0.3s, transform 0.3s;
                    opacity: 0;
                    transform: translateY(20px);
                }
                .conversation-loading-indicator.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                .loading-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(0, 0, 0, 0.1);
                    border-top-color: #007bff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                body.dark-mode .conversation-loading-indicator {
                    background: rgba(33, 37, 41, 0.9);
                    color: #f8f9fa;
                }
                body.dark-mode .loading-spinner {
                    border-color: rgba(255, 255, 255, 0.1);
                    border-top-color: #007bff;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Return controller object
        return {
            updateText: (newMessage) => {
                const messageEl = notification.querySelector('.loading-message');
                if (messageEl) {
                    messageEl.textContent = newMessage;
                }
            },
            complete: (successMessage) => {
                const spinnerEl = notification.querySelector('.loading-spinner');
                if (spinnerEl) {
                    spinnerEl.style.borderTopColor = '#28a745';
                    spinnerEl.style.animationPlayState = 'paused';
                }
                
                const messageEl = notification.querySelector('.loading-message');
                if (messageEl) {
                    messageEl.textContent = successMessage;
                    messageEl.style.color = '#28a745';
                }
                
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 2000);
            },
            error: (errorMessage) => {
                const spinnerEl = notification.querySelector('.loading-spinner');
                if (spinnerEl) {
                    spinnerEl.style.borderTopColor = '#dc3545';
                    spinnerEl.style.animationPlayState = 'paused';
                }
                
                const messageEl = notification.querySelector('.loading-message');
                if (messageEl) {
                    messageEl.textContent = errorMessage;
                    messageEl.style.color = '#dc3545';
                }
                
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 3000);
            },
            dismiss: () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        };
    }
    
    /**
     * Render messages in the chat UI
     */
    renderMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // Check if we have a current thread
        if (!window.currentThread || !Array.isArray(window.currentThread)) {
            console.warn('No current thread available to render');
            return;
        }
        
        // Render messages
        chatMessages.innerHTML = window.currentThread.map(msg => `
            <div class="message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}">
                ${msg.content}
            </div>
        `).join('');
        
        // Scroll to bottom
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
    
    /**
     * Handle errors from the store
     * @param {Object} error - Error object
     */
    handleError(error) {
        console.error('Conversation store error:', error);
        
        // Create notification with error message
        let message;
        if (error.source && error.message) {
            switch (error.source) {
                case 'localStorage':
                    message = 'Error saving conversations locally';
                    break;
                case 'server':
                    message = 'Error synchronizing with server';
                    break;
                case 'import':
                    message = 'Error importing conversation';
                    break;
                case 'export':
                    message = 'Error exporting conversation';
                    break;
                default:
                    message = error.message;
            }
        } else {
            message = 'An error occurred in the conversation manager';
        }
        
        this.createNotification(message, 'error');
    }
}

// Initialize UI when DOM is loaded and store is available
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the store to be available
    const checkStore = setInterval(() => {
        if (window.conversationStore) {
            clearInterval(checkStore);
            window.conversationUI = new ConversationUI();
        }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(checkStore);
        if (!window.conversationStore) {
            console.error('Conversation store not available after timeout');
        }
    }, 5000);
});