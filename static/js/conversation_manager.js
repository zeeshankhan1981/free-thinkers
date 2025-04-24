class ConversationManager {
    constructor() {
        this.conversations = [];
        this.currentConversation = null;
        this.pinnedConversations = [];
        this.categories = [];
        this.isUnsavedChanges = false;
        this.loadConversations();
        this.setupKeyboardShortcuts();
    }

    // Load conversations from localStorage and server if available
    async loadConversations() {
        // Show loading indicator
        const loading = window.createConversationLoadingIndicator ? 
            window.createConversationLoadingIndicator('Loading conversations...') : null;
        
        // First load from localStorage for immediate access
        const savedConversations = localStorage.getItem('conversations');
        const savedPinned = localStorage.getItem('pinned-conversations');
        
        if (savedConversations) {
            try {
                this.conversations = JSON.parse(savedConversations);
                
                // Load pinned conversations
                if (savedPinned) {
                    this.pinnedConversations = JSON.parse(savedPinned);
                }
                
                // Extract categories from conversations
                this.refreshCategories();
                
                if (this.conversations.length > 0) {
                    // Check if there was a previously active conversation
                    const lastActiveId = localStorage.getItem('last-active-conversation');
                    if (lastActiveId) {
                        const lastActive = this.getConversationById(lastActiveId);
                        if (lastActive) {
                            this.currentConversation = lastActive;
                        } else {
                            this.currentConversation = this.conversations[0];
                        }
                    } else {
                        this.currentConversation = this.conversations[0];
                    }
                }
                
                // Update loading status
                if (loading) {
                    loading.updateText('Loaded local conversations');
                }
            } catch (error) {
                console.error('Error parsing saved conversations:', error);
                this.conversations = [];
                this.pinnedConversations = [];
            }
        } else {
            // If no conversations exist, create an untitled one
            this.createConversation('Untitled Conversation', 'Uncategorized');
        }

        // Then try to fetch from server and merge
        try {
            // Update loading text if available, or show syncing notification
            let syncNotif = null;
            if (loading) {
                loading.updateText('Syncing with server...');
            } else if (window.showSyncingNotification) {
                // Fallback to old method if loading indicator not available
                syncNotif = window.showSyncingNotification();
            }
            
            const response = await fetch('/api/history');
            if (response.ok) {
                const serverConversations = await response.json();
                this.mergeServerConversations(serverConversations);
                
                // Complete loading with success
                if (loading) {
                    loading.complete('Conversations loaded', 'success');
                } else {
                    // Fallback to old completion methods
                    if (syncNotif) {
                        syncNotif.complete();
                    } else if (window.showNotification) {
                        window.showNotification('Conversations synced successfully', 'success');
                    }
                }
            } else {
                // Show error but don't fail completely
                if (loading) {
                    loading.updateText('Could not connect to server');
                    setTimeout(() => loading.complete('Using local conversations', 'error'), 1000);
                } else if (window.showNotification) {
                    window.showNotification('Could not sync with server, using local conversations', 'warning');
                }
            }
        } catch (error) {
            console.error('Error fetching conversations from server:', error);
            
            // Handle error with appropriate UI feedback
            if (loading) {
                loading.updateText('Could not connect to server');
                setTimeout(() => loading.complete('Using local conversations', 'error'), 1000);
            } else if (window.showNotification) {
                window.showNotification('Could not sync with server, using local conversations', 'warning');
            }
        }
    }

    // Refresh the list of categories from conversations
    refreshCategories() {
        const categorySet = new Set();
        this.conversations.forEach(conv => {
            if (conv.category && conv.category.trim() !== '') {
                categorySet.add(conv.category.trim());
            }
        });
        this.categories = Array.from(categorySet).sort();
        
        // Ensure 'Uncategorized' is always available
        if (!this.categories.includes('Uncategorized')) {
            this.categories.push('Uncategorized');
        }
    }

    // Merge server conversations with local ones
    mergeServerConversations(serverConversations) {
        if (!Array.isArray(serverConversations)) return;
        
        // Create a map of existing conversation IDs
        const existingIds = new Map(this.conversations.map(conv => [conv.id, conv]));
        let hasNewConversation = false;
        
        serverConversations.forEach(serverConv => {
            if (!serverConv.id) return;
            
            // If the conversation already exists locally, update it if server version is newer
            if (existingIds.has(serverConv.id)) {
                const localConv = existingIds.get(serverConv.id);
                const serverUpdated = new Date(serverConv.updatedAt || serverConv.created_at);
                const localUpdated = new Date(localConv.updatedAt);
                
                if (serverUpdated > localUpdated) {
                    // Update local conversation with server data
                    Object.assign(localConv, this.formatServerConversation(serverConv));
                }
            } else {
                // Add new conversation from server
                const newConv = this.formatServerConversation(serverConv);
                this.conversations.push(newConv);
                hasNewConversation = true;
                
                // Add "What's New" badge
                newConv.isNew = true;
            }
        });
        
        // Refresh categories
        this.refreshCategories();
        
        // Sort conversations - pinned first, then by updated date
        this.sortConversations();
        
        // Save merged conversations to localStorage
        this.saveConversations();
        
        // Show notification if new conversations were found
        if (hasNewConversation) {
            if (window.showNotification) {
                window.showNotification('New conversations added from server', 'info');
            }
        }
    }

    // Format server conversation to match local format
    formatServerConversation(serverConv) {
        return {
            id: serverConv.id,
            title: serverConv.title || this.getDefaultTitle(serverConv),
            category: serverConv.category || 'Uncategorized',
            messages: Array.isArray(serverConv.messages) ? serverConv.messages : [],
            createdAt: serverConv.created_at || new Date().toISOString(),
            updatedAt: serverConv.updated_at || new Date().toISOString(),
            isPinned: this.pinnedConversations.includes(serverConv.id)
        };
    }

    // Get a default title from the first user message
    getDefaultTitle(conversation) {
        if (Array.isArray(conversation.messages) && conversation.messages.length > 0) {
            const firstUserMsg = conversation.messages.find(msg => msg.role === 'user');
            if (firstUserMsg && firstUserMsg.content) {
                const content = firstUserMsg.content.trim();
                return content.length > 30 ? content.substring(0, 30) + '...' : content;
            }
        }
        return 'Untitled Conversation';
    }

    // Save conversations to localStorage
    saveConversations() {
        try {
            localStorage.setItem('conversations', JSON.stringify(this.conversations));
            localStorage.setItem('pinned-conversations', JSON.stringify(this.pinnedConversations));
            
            // Save last active conversation ID
            if (this.currentConversation) {
                localStorage.setItem('last-active-conversation', this.currentConversation.id);
            }
            
            this.isUnsavedChanges = false;
            
            // Trigger an event that conversations were saved
            document.dispatchEvent(new CustomEvent('conversationsSaved'));
        } catch (error) {
            console.error('Error saving conversations to localStorage:', error);
            // Show notification to user
            if (window.showNotification) {
                window.showNotification('Failed to save conversations locally. Storage may be full.', 'error');
            }
        }
    }

    // Save conversation to server
    async saveToServer(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) return false;

        try {
            // Show elegant loading indicator
            const loading = window.createConversationLoadingIndicator ?
                window.createConversationLoadingIndicator('Saving conversation...') :
                (window.showLoadingState ? window.showLoadingState('Saving conversation to server...') : null);
            
            const response = await fetch('/api/history/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: conversation.id,
                    title: conversation.title,
                    category: conversation.category,
                    messages: conversation.messages,
                    model: window.currentModel
                })
            });

            // Handle completion with pleasant UI feedback
            if (loading) {
                loading.complete('Conversation saved', 'success');
            } else if (window.hideLoadingState) {
                window.hideLoadingState();
                if (window.showNotification) {
                    window.showNotification('Conversation saved to server', 'success');
                }
            }
            
            if (response.ok) {
                return true;
            } else {
                const errorData = await response.json();
                console.error('Server error saving conversation:', errorData);
                if (window.showNotification) {
                    window.showNotification('Failed to save to server: ' + (errorData.message || 'Unknown error'), 'error');
                }
                return false;
            }
        } catch (error) {
            console.error('Error saving conversation to server:', error);
            if (window.hideLoadingState) {
                window.hideLoadingState();
            }
            if (window.showNotification) {
                window.showNotification('Failed to save to server: Network error', 'error');
            }
            return false;
        }
    }

    // Sort conversations - pinned first, then by updated date
    sortConversations() {
        this.conversations.sort((a, b) => {
            // First sort by pinned status
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            
            // Then sort by updated date
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    }

    // Create a new conversation
    createConversation(title = 'Untitled Conversation', category = 'Uncategorized') {
        const newConversation = {
            id: Date.now().toString(),
            title,
            category,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: false,
            isNew: true // Add 'What's New' badge
        };
        
        this.conversations.unshift(newConversation); // Add to beginning of array
        this.currentConversation = newConversation;
        this.isUnsavedChanges = true;
        this.saveConversations();
        
        // Update categories if needed
        if (!this.categories.includes(category)) {
            this.categories.push(category);
            this.categories.sort();
        }
        
        // Try to save to server
        this.saveToServer(newConversation.id).catch(error => {
            console.error('Failed to save new conversation to server:', error);
        });
        
        // Show notification
        if (window.showNotification) {
            window.showNotification('New conversation created', 'success');
        }
        
        return newConversation;
    }

    // Set current conversation with transition effect
    setCurrentConversation(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (conversation) {
            // Apply fade transition
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                chatContainer.classList.add('fade-out');
                
                setTimeout(() => {
                    this.currentConversation = conversation;
                    
                    // If conversation was marked as new, remove that flag
                    if (conversation.isNew) {
                        conversation.isNew = false;
                        this.saveConversations();
                    }
                    
                    // Dispatch event that current conversation changed
                    document.dispatchEvent(new CustomEvent('currentConversationChanged', { 
                        detail: conversation 
                    }));
                    
                    // Fade back in
                    chatContainer.classList.remove('fade-out');
                    chatContainer.classList.add('fade-in');
                    
                    setTimeout(() => {
                        chatContainer.classList.remove('fade-in');
                    }, 300);
                    
                }, 300);
            } else {
                this.currentConversation = conversation;
                
                // If conversation was marked as new, remove that flag
                if (conversation.isNew) {
                    conversation.isNew = false;
                    this.saveConversations();
                }
                
                // Dispatch event that current conversation changed
                document.dispatchEvent(new CustomEvent('currentConversationChanged', { 
                    detail: conversation 
                }));
            }
            
            return true;
        }
        return false;
    }

    // Get current conversation
    getCurrentConversation() {
        // If we don't have a current conversation but have conversations available,
        // set the first one as current
        if (!this.currentConversation && this.conversations.length > 0) {
            this.currentConversation = this.conversations[0];
        }
        
        // If we still don't have a current conversation, create a new one
        if (!this.currentConversation) {
            this.createConversation();
        }
        
        return this.currentConversation;
    }

    // Get conversations by category
    getConversationsByCategory(category) {
        if (!category || category === 'all') {
            // Return all conversations including both pinned and non-pinned
            return [...this.conversations];
        }
        
        // Return conversations that match the specified category
        return this.conversations.filter(conv => conv.category === category);
    }

    // Get conversation by ID
    getConversationById(id) {
        return this.conversations.find(conv => conv.id === id);
    }

    // Update conversation title with inline editing
    updateConversationTitle(conversationId, newTitle) {
        if (!newTitle || newTitle.trim() === '') {
            if (window.showNotification) {
                window.showNotification('Title cannot be empty', 'warning');
            }
            return false;
        }

        const conversation = this.getConversationById(conversationId);
        if (conversation) {
            conversation.title = newTitle.trim();
            conversation.updatedAt = new Date().toISOString();
            this.isUnsavedChanges = true;
            this.saveConversations();
            
            // Try to save to server
            this.saveToServer(conversationId).catch(error => {
                console.error('Failed to save updated title to server:', error);
            });
            
            return true;
        }
        return false;
    }

    // Update conversation category
    updateConversationCategory(conversationId, newCategory) {
        if (!newCategory || newCategory.trim() === '') {
            newCategory = 'Uncategorized';
        }

        const conversation = this.getConversationById(conversationId);
        if (conversation) {
            conversation.category = newCategory.trim();
            conversation.updatedAt = new Date().toISOString();
            this.isUnsavedChanges = true;
            this.saveConversations();
            
            // Update categories if needed
            this.refreshCategories();
            
            // Try to save to server
            this.saveToServer(conversationId).catch(error => {
                console.error('Failed to save updated category to server:', error);
            });
            
            return true;
        }
        return false;
    }

    // Toggle pinned status of a conversation
    togglePinned(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) return false;
        
        conversation.isPinned = !conversation.isPinned;
        
        // Update pinned conversations list
        if (conversation.isPinned) {
            if (!this.pinnedConversations.includes(conversationId)) {
                this.pinnedConversations.push(conversationId);
            }
        } else {
            this.pinnedConversations = this.pinnedConversations.filter(id => id !== conversationId);
        }
        
        // Re-sort conversations
        this.sortConversations();
        this.saveConversations();
        
        // Show notification
        if (window.showNotification) {
            window.showNotification(
                conversation.isPinned ? 'Conversation pinned' : 'Conversation unpinned', 
                'success'
            );
        }
        
        return true;
    }

    // Add message to current conversation
    addMessage(message) {
        if (!this.currentConversation) {
            this.createConversation();
        }
        
        this.currentConversation.messages.push(message);
        this.currentConversation.updatedAt = new Date().toISOString();
        
        // If this is the first user message and the title is still default, update the title
        if (message.role === 'user' && 
            this.currentConversation.messages.filter(m => m.role === 'user').length === 1 &&
            (this.currentConversation.title === 'Untitled Conversation' || this.currentConversation.title === '')) {
            
            const content = message.content.trim();
            this.currentConversation.title = content.length > 30 ? content.substring(0, 30) + '...' : content;
        }
        
        this.isUnsavedChanges = true;
        this.saveConversations();
        
        // Re-sort conversations since this one was just updated
        this.sortConversations();
        
        // Save to server periodically (not on every message to avoid rate limits)
        if (this.currentConversation.messages.length % 5 === 0) {
            this.saveToServer(this.currentConversation.id).catch(error => {
                console.error('Failed to save conversation to server:', error);
            });
        }
    }

    // Delete a conversation
    deleteConversation(conversationId) {
        const conversationIndex = this.conversations.findIndex(conv => conv.id === conversationId);
        if (conversationIndex === -1) return false;
        
        const conversation = this.conversations[conversationIndex];
        
        // Remove from conversations array
        this.conversations.splice(conversationIndex, 1);
        
        // Remove from pinned list if present
        this.pinnedConversations = this.pinnedConversations.filter(id => id !== conversationId);
        
        // If this was the current conversation, set a new current conversation
        if (this.currentConversation && this.currentConversation.id === conversationId) {
            if (this.conversations.length > 0) {
                this.currentConversation = this.conversations[0];
                
                // Dispatch event that current conversation changed
                document.dispatchEvent(new CustomEvent('currentConversationChanged', { 
                    detail: this.currentConversation 
                }));
            } else {
                this.currentConversation = null;
                this.createConversation();
            }
        }
        
        // Refresh categories
        this.refreshCategories();
        
        this.saveConversations();
        
        // Try to delete from server
        try {
            fetch(`/api/history/delete/${conversationId}`, {
                method: 'DELETE'
            }).catch(error => {
                console.error('Failed to delete conversation from server:', error);
            });
        } catch (error) {
            console.error('Error deleting conversation from server:', error);
        }
        
        // Show notification
        if (window.showNotification) {
            window.showNotification(`Deleted "${conversation.title}"`, 'success');
        }
        
        return true;
    }

    // Search conversations
    searchConversations(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        
        query = query.trim().toLowerCase();
        
        return this.conversations.filter(conv => {
            // Search in title
            if (conv.title.toLowerCase().includes(query)) {
                return true;
            }
            
            // Search in messages
            if (Array.isArray(conv.messages)) {
                return conv.messages.some(msg => 
                    msg.content && msg.content.toLowerCase().includes(query)
                );
            }
            
            return false;
        });
    }

    // Reorder conversation (used for drag and drop)
    reorderConversation(fromIndex, toIndex) {
        // Don't reorder if indices are invalid
        if (fromIndex < 0 || toIndex < 0 || 
            fromIndex >= this.conversations.length || 
            toIndex >= this.conversations.length) {
            return false;
        }
        
        // Get separate lists of pinned and unpinned conversations
        const pinned = this.conversations.filter(c => c.isPinned);
        const unpinned = this.conversations.filter(c => !c.isPinned);
        
        const fromItem = this.conversations[fromIndex];
        
        // If the item is pinned, only allow reordering within pinned items
        if (fromItem.isPinned) {
            const pinnedFromIndex = pinned.findIndex(c => c.id === fromItem.id);
            let pinnedToIndex = toIndex;
            
            // If trying to move to unpinned section, place at the end of pinned instead
            if (pinnedToIndex >= pinned.length) {
                pinnedToIndex = pinned.length - 1;
            }
            
            // Move the item within the pinned array
            const [removed] = pinned.splice(pinnedFromIndex, 1);
            pinned.splice(pinnedToIndex, 0, removed);
            
            // Reconstruct the main conversations array
            this.conversations = [...pinned, ...unpinned];
        } 
        // If unpinned, only allow reordering within unpinned items
        else {
            const unpinnedFromIndex = unpinned.findIndex(c => c.id === fromItem.id);
            let unpinnedToIndex = toIndex - pinned.length;
            
            // If trying to move to pinned section, place at the beginning of unpinned instead
            if (unpinnedToIndex < 0) {
                unpinnedToIndex = 0;
            }
            
            // Move the item within the unpinned array
            const [removed] = unpinned.splice(unpinnedFromIndex, 1);
            unpinned.splice(unpinnedToIndex, 0, removed);
            
            // Reconstruct the main conversations array
            this.conversations = [...pinned, ...unpinned];
        }
        
        this.isUnsavedChanges = true;
        this.saveConversations();
        
        return true;
    }

    // Sync with current thread (add messages from current thread to current conversation)
    syncWithCurrentThread() {
        if (typeof window.currentThread === 'undefined') {
            console.log('Initializing empty currentThread');
            window.currentThread = [];
            return;
        }
        
        if (!this.currentConversation) {
            this.createConversation();
        }
        
        // Create a very subtle loading indicator for thread syncing
        let syncNotif = null;
        if (window.createConversationLoadingIndicator) {
            syncNotif = window.createConversationLoadingIndicator('Syncing conversation...');
        }
        
        try {
            // Get current thread and add any new messages to the conversation
            const currentMessages = this.currentConversation.messages;
            const threadMessages = window.currentThread;
            
            if (!Array.isArray(threadMessages) || threadMessages.length === 0) {
                if (syncNotif) syncNotif.dismiss();
                return;
            }
            
            const currentMessageIds = new Set(currentMessages.map(msg => msg.id));
            let hasNewMessages = false;
            
            threadMessages.forEach(threadMsg => {
                // Skip if message already exists in conversation
                if (!threadMsg.id || currentMessageIds.has(threadMsg.id)) {
                    return;
                }
                
                currentMessages.push(threadMsg);
                hasNewMessages = true;
            });
            
            if (hasNewMessages) {
                this.currentConversation.updatedAt = new Date().toISOString();
                this.isUnsavedChanges = true;
                this.saveConversations();
                
                // Re-sort conversations
                this.sortConversations();
                
                // Complete sync notification with success
                if (syncNotif) syncNotif.complete('Conversation updated', 'success');
            } else {
                // Dismiss notification if no changes
                if (syncNotif) syncNotif.dismiss();
            }
        } catch (error) {
            console.error('Error syncing with current thread:', error);
            if (syncNotif) syncNotif.error('Error syncing conversation');
        }
    }

    getLastMessage() {
        if (!this.currentConversation || !this.currentConversation.messages || this.currentConversation.messages.length === 0) {
            return null;
        }
        return this.currentConversation.messages[this.currentConversation.messages.length - 1];
    }

    // Load conversation to the current thread
    loadConversationToThread(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) return false;
        
        // Create loading indicator with a friendly message
        let loadingIndicator = null;
        if (window.createConversationLoadingIndicator) {
            loadingIndicator = window.createConversationLoadingIndicator('Loading conversation...');
        }
        
        try {
            // Set as current conversation
            this.currentConversation = conversation;
            
            // Save this as the last active conversation
            localStorage.setItem('last-active-conversation', conversationId);
            
            // Clear the current thread
            if (window.currentThread) {
                window.currentThread = [];
            }
            
            // Load messages into the thread
            if (conversation.messages && conversation.messages.length > 0) {
                window.currentThread = [...conversation.messages];
                
                // Update loading message
                if (loadingIndicator) {
                    loadingIndicator.updateText(`Loading ${conversation.messages.length} messages...`);
                }
            }
            
            // Update the UI if a handler is available
            if (typeof window.handleConversationLoaded === 'function') {
                window.handleConversationLoaded(conversation);
            }
            
            // Complete the loading indicator
            if (loadingIndicator) {
                loadingIndicator.complete('Conversation loaded', 'success');
            }
            
            this.triggerEvent('conversationLoaded', conversation);
            return true;
        } catch (error) {
            console.error('Error loading conversation to thread:', error);
            
            // Show error in loading indicator
            if (loadingIndicator) {
                loadingIndicator.error('Error loading conversation');
            }
            
            return false;
        }
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        console.log('Setting up keyboard shortcuts for conversation manager');
        document.addEventListener('keydown', (event) => {
            // Only process if conversation manager is focused/active
            const sidebar = document.getElementById('conversation-manager-sidebar');
            if (!sidebar) {
                console.warn('Conversation manager sidebar not found in DOM, skipping keyboard shortcuts');
                return;
            }
            
            const isActive = sidebar.classList.contains('active');
            
            // Global shortcuts that work everywhere
            if (event.ctrlKey || event.metaKey) {
                if (event.key === 'n') {
                    // Ctrl/Cmd + N: New conversation
                    event.preventDefault();
                    this.createConversation();
                }
            }
            
            // Only process other shortcuts if sidebar is active
            if (!isActive) return;
            
            // Navigation shortcuts
            if (event.key === 'ArrowUp') {
                // Select previous conversation
                event.preventDefault();
                this.navigateConversations('prev');
            } else if (event.key === 'ArrowDown') {
                // Select next conversation
                event.preventDefault();
                this.navigateConversations('next');
            } else if (event.key === 'Enter') {
                // Open selected conversation
                event.preventDefault();
                const selected = document.querySelector('.conversation-item.selected');
                if (selected) {
                    const conversationId = selected.getAttribute('data-id');
                    this.setCurrentConversation(conversationId);
                }
            }
        });
    }
}

// Create a global instance of ConversationManager
window.conversationManager = new ConversationManager();
