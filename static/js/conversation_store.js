/**
 * Conversation Store
 * 
 * A centralized store for managing conversation state with proper
 * event dispatching and server synchronization.
 */

class ConversationStore {
    constructor() {
        // Core state
        this.conversations = [];
        this.categories = [];
        this.pinnedConversationIds = [];
        this.currentConversationId = null;
        this.isLoading = false;
        this.lastError = null;
        this.isInitialized = false;
        
        // Sync state
        this.syncInProgress = false;
        this.pendingChanges = new Set();
        this.lastSyncTime = null;
        
        // Event bus for subscribers
        this.eventListeners = {
            'conversationAdded': [],
            'conversationUpdated': [],
            'conversationDeleted': [],
            'conversationsLoaded': [],
            'currentConversationChanged': [],
            'syncComplete': [],
            'error': [],
            'categoryAdded': [],
            'categoryUpdated': [],
            'categoryDeleted': []
        };
        
        // Initialize the store
        this.init();
    }
    
    /**
     * Initialize the store by loading data from localStorage and server
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            this.isLoading = true;
            this.dispatchEvent('stateChanged', { isLoading: true });
            
            // First load from localStorage for immediate data
            await this.loadFromLocalStorage();
            
            // Then sync with server
            await this.syncWithServer();
            
            this.isInitialized = true;
            this.isLoading = false;
            this.dispatchEvent('stateChanged', { isLoading: false });
            this.dispatchEvent('conversationsLoaded', this.conversations);
        } catch (error) {
            console.error('Failed to initialize conversation store:', error);
            this.lastError = error;
            this.isLoading = false;
            this.dispatchEvent('stateChanged', { isLoading: false });
            this.dispatchEvent('error', error);
        }
    }
    
    /**
     * Load conversations from localStorage
     */
    async loadFromLocalStorage() {
        try {
            // Load conversations
            const savedConversations = localStorage.getItem('conversations');
            if (savedConversations) {
                this.conversations = JSON.parse(savedConversations);
                
                // Validate and sanitize loaded data
                this.conversations = this.conversations.filter(conv => {
                    return conv && conv.id && Array.isArray(conv.messages);
                });
            }
            
            // Load pinned conversations
            const savedPinned = localStorage.getItem('pinnedConversationIds');
            if (savedPinned) {
                this.pinnedConversationIds = JSON.parse(savedPinned);
            }
            
            // Load last active conversation
            const lastActiveId = localStorage.getItem('lastActiveConversationId');
            if (lastActiveId) {
                const exists = this.conversations.some(conv => conv.id === lastActiveId);
                if (exists) {
                    this.currentConversationId = lastActiveId;
                } else if (this.conversations.length > 0) {
                    this.currentConversationId = this.conversations[0].id;
                }
            } else if (this.conversations.length > 0) {
                this.currentConversationId = this.conversations[0].id;
            }
            
            // Extract categories from conversations
            this.refreshCategories();
            
            // Dispatch events
            this.dispatchEvent('stateChanged');
            
            return this.conversations;
        } catch (error) {
            console.error('Error loading conversations from localStorage:', error);
            this.lastError = error;
            this.dispatchEvent('error', {
                source: 'localStorage',
                message: 'Failed to load conversations from local storage',
                error
            });
            return [];
        }
    }
    
    /**
     * Save current state to localStorage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('conversations', JSON.stringify(this.conversations));
            localStorage.setItem('pinnedConversationIds', JSON.stringify(this.pinnedConversationIds));
            
            if (this.currentConversationId) {
                localStorage.setItem('lastActiveConversationId', this.currentConversationId);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.lastError = error;
            this.dispatchEvent('error', {
                source: 'localStorage',
                message: 'Failed to save conversations to local storage. Storage may be full.',
                error
            });
            return false;
        }
    }
    
    /**
     * Sync with server to fetch latest conversations
     */
    async syncWithServer() {
        if (this.syncInProgress) return false;
        
        this.syncInProgress = true;
        this.dispatchEvent('stateChanged', { syncInProgress: true });
        
        try {
            const response = await fetch('/api/history', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const serverConversations = await response.json();
            
            // Merge server conversations with local ones
            this.mergeServerConversations(serverConversations);
            
            // Update last sync time
            this.lastSyncTime = new Date();
            this.syncInProgress = false;
            
            // Save merged result to localStorage
            this.saveToLocalStorage();
            
            this.dispatchEvent('stateChanged', { syncInProgress: false });
            this.dispatchEvent('syncComplete', { 
                timestamp: this.lastSyncTime,
                conversationCount: this.conversations.length
            });
            
            return true;
        } catch (error) {
            console.error('Error syncing with server:', error);
            this.lastError = error;
            this.syncInProgress = false;
            
            this.dispatchEvent('stateChanged', { syncInProgress: false });
            this.dispatchEvent('error', {
                source: 'server',
                message: 'Failed to sync conversations with server',
                error
            });
            
            return false;
        }
    }
    
    /**
     * Merge server conversations with local ones
     * @param {Array} serverConversations - Conversations from server
     */
    mergeServerConversations(serverConversations) {
        if (!Array.isArray(serverConversations)) return;
        
        let hasChanges = false;
        const localIds = new Map(this.conversations.map(conv => [conv.id, conv]));
        
        // Process server conversations
        serverConversations.forEach(serverConv => {
            if (!serverConv || !serverConv.id) return;
            
            const formattedServerConv = this.formatServerConversation(serverConv);
            
            // Check if we already have this conversation locally
            if (localIds.has(serverConv.id)) {
                const localConv = localIds.get(serverConv.id);
                const serverUpdated = new Date(serverConv.updated_at || serverConv.created_at);
                const localUpdated = new Date(localConv.updatedAt);
                
                // If server version is newer, update local
                if (serverUpdated > localUpdated) {
                    Object.assign(localConv, formattedServerConv);
                    hasChanges = true;
                }
            } else {
                // Add new conversation from server
                this.conversations.push(formattedServerConv);
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            // Sort conversations - pinned first, then by updated date
            this.sortConversations();
            
            // Refresh categories
            this.refreshCategories();
            
            // Dispatch events
            this.dispatchEvent('stateChanged');
            this.dispatchEvent('conversationsLoaded', this.conversations);
        }
    }
    
    /**
     * Format a server conversation to match our local format
     * @param {Object} serverConv - Conversation data from server
     * @returns {Object} - Formatted conversation
     */
    formatServerConversation(serverConv) {
        return {
            id: serverConv.id,
            title: serverConv.title || this.getDefaultTitle(serverConv),
            category: serverConv.category || 'Uncategorized',
            messages: Array.isArray(serverConv.messages) ? serverConv.messages : [],
            model: serverConv.model || 'default',
            createdAt: serverConv.created_at || new Date().toISOString(),
            updatedAt: serverConv.updated_at || new Date().toISOString(),
            isPinned: this.pinnedConversationIds.includes(serverConv.id)
        };
    }
    
    /**
     * Get a default title from the first user message
     * @param {Object} conversation - The conversation to get a title for
     * @returns {string} - Generated title
     */
    getDefaultTitle(conversation) {
        if (!conversation || !Array.isArray(conversation.messages) || conversation.messages.length === 0) {
            return 'New Conversation';
        }
        
        const firstUserMsg = conversation.messages.find(msg => msg.role === 'user');
        if (firstUserMsg && firstUserMsg.content) {
            const content = firstUserMsg.content.trim();
            return content.length > 30 ? content.substring(0, 30) + '...' : content;
        }
        
        return `Conversation (${new Date().toLocaleString()})`;
    }
    
    /**
     * Refresh the list of categories from conversations
     */
    refreshCategories() {
        const categorySet = new Set();
        categorySet.add('All');
        categorySet.add('Uncategorized');
        
        // Extract unique categories
        this.conversations.forEach(conv => {
            if (conv.category && typeof conv.category === 'string') {
                categorySet.add(conv.category);
            }
        });
        
        this.categories = Array.from(categorySet);
        this.dispatchEvent('stateChanged', { categories: this.categories });
    }
    
    /**
     * Sort conversations by pinned status and date
     */
    sortConversations() {
        this.conversations.sort((a, b) => {
            // Pinned conversations come first
            if (this.pinnedConversationIds.includes(a.id) && !this.pinnedConversationIds.includes(b.id)) {
                return -1;
            }
            if (!this.pinnedConversationIds.includes(a.id) && this.pinnedConversationIds.includes(b.id)) {
                return 1;
            }
            
            // Then sort by updated date (newest first)
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    }
    
    /**
     * Create a new conversation
     * @param {string} title - Optional title
     * @param {string} category - Optional category
     * @param {string} model - Optional model name
     * @returns {Object} - The new conversation
     */
    createConversation(title = '', category = 'Uncategorized', model = null) {
        // Generate UUID for consistent IDs
        const id = this.generateUUID();
        
        const newConversation = {
            id,
            title: title || 'New Conversation',
            category: category || 'Uncategorized',
            messages: [],
            model: model || (window.currentModel || 'default'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: false,
            isNew: true
        };
        
        // Add to beginning of array
        this.conversations.unshift(newConversation);
        this.currentConversationId = id;
        
        // Update localStorage and trigger events
        this.saveToLocalStorage();
        this.dispatchEvent('stateChanged');
        this.dispatchEvent('conversationAdded', newConversation);
        this.dispatchEvent('currentConversationChanged', newConversation);
        
        // Save to server asynchronously
        this.saveConversationToServer(id).catch(error => {
            console.error('Failed to save new conversation to server:', error);
        });
        
        return newConversation;
    }
    
    /**
     * Get the current conversation
     * @returns {Object|null} - Current conversation or null
     */
    getCurrentConversation() {
        if (!this.currentConversationId) {
            return null;
        }
        
        return this.conversations.find(conv => conv.id === this.currentConversationId) || null;
    }
    
    /**
     * Set the current conversation
     * @param {string} conversationId - ID of conversation to set as current
     * @returns {boolean} - Success
     */
    setCurrentConversation(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) return false;
        
        this.currentConversationId = conversationId;
        
        // If marked as new, remove that flag
        if (conversation.isNew) {
            conversation.isNew = false;
            this.updateConversation(conversationId, { isNew: false });
        }
        
        // Save to localStorage and trigger events
        this.saveToLocalStorage();
        this.dispatchEvent('stateChanged');
        this.dispatchEvent('currentConversationChanged', conversation);
        
        return true;
    }
    
    /**
     * Get conversation by ID
     * @param {string} id - Conversation ID
     * @returns {Object|null} - Conversation or null if not found
     */
    getConversationById(id) {
        return this.conversations.find(conv => conv.id === id) || null;
    }
    
    /**
     * Update a conversation
     * @param {string} conversationId - ID of conversation to update
     * @param {Object} updates - Properties to update
     * @returns {boolean} - Success
     */
    updateConversation(conversationId, updates) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) return false;
        
        // Apply updates
        Object.assign(conversation, updates);
        
        // Always update timestamp
        conversation.updatedAt = new Date().toISOString();
        
        // If title is updated and empty, generate a default title
        if (updates.hasOwnProperty('title') && (!updates.title || updates.title.trim() === '')) {
            conversation.title = this.getDefaultTitle(conversation);
        }
        
        // If category changed, refresh categories
        if (updates.hasOwnProperty('category') && updates.category !== conversation.category) {
            this.refreshCategories();
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Queue for server sync
        this.queueServerSync(conversationId);
        
        // Dispatch events
        this.dispatchEvent('stateChanged');
        this.dispatchEvent('conversationUpdated', conversation);
        
        return true;
    }
    
    /**
     * Toggle pinned status for a conversation
     * @param {string} conversationId - ID of conversation
     * @returns {boolean} - New pinned state
     */
    togglePinned(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) return false;
        
        const isPinned = this.pinnedConversationIds.includes(conversationId);
        
        if (isPinned) {
            // Remove from pinned list
            this.pinnedConversationIds = this.pinnedConversationIds.filter(id => id !== conversationId);
        } else {
            // Add to pinned list
            this.pinnedConversationIds.push(conversationId);
        }
        
        conversation.isPinned = !isPinned;
        
        // Resort conversations
        this.sortConversations();
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Dispatch events
        this.dispatchEvent('stateChanged');
        this.dispatchEvent('conversationUpdated', conversation);
        
        return !isPinned;
    }
    
    /**
     * Add message to a conversation
     * @param {string} conversationId - Conversation ID
     * @param {string} role - Message role ('user' or 'assistant')
     * @param {string} content - Message content
     * @returns {Object|null} - The new message or null on failure
     */
    addMessage(conversationId, role, content) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) return null;
        
        const message = {
            id: this.generateUUID(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        
        // Add message to conversation
        conversation.messages.push(message);
        
        // Update conversation
        conversation.updatedAt = new Date().toISOString();
        
        // If this is the first message and title is default, update title
        if (conversation.messages.length === 1 && (conversation.title === 'New Conversation' || !conversation.title)) {
            conversation.title = content.length > 30 ? content.substring(0, 30) + '...' : content;
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Queue for server sync
        this.queueServerSync(conversationId);
        
        // Dispatch events
        this.dispatchEvent('stateChanged');
        this.dispatchEvent('conversationUpdated', conversation);
        
        return message;
    }
    
    /**
     * Delete a conversation
     * @param {string} conversationId - ID of conversation to delete
     * @returns {boolean} - Success
     */
    async deleteConversation(conversationId) {
        const index = this.conversations.findIndex(conv => conv.id === conversationId);
        if (index === -1) return false;
        
        // Store for event
        const deletedConversation = this.conversations[index];
        
        // Remove from conversations array
        this.conversations.splice(index, 1);
        
        // Remove from pinned list if needed
        if (this.pinnedConversationIds.includes(conversationId)) {
            this.pinnedConversationIds = this.pinnedConversationIds.filter(id => id !== conversationId);
        }
        
        // If this was the current conversation, select a new one
        if (this.currentConversationId === conversationId) {
            this.currentConversationId = this.conversations.length > 0 ? this.conversations[0].id : null;
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Refresh categories in case this was the last conversation in a category
        this.refreshCategories();
        
        // Try to delete from server
        try {
            await this.deleteConversationFromServer(conversationId);
        } catch (error) {
            console.error('Failed to delete conversation from server:', error);
        }
        
        // Dispatch events
        this.dispatchEvent('stateChanged');
        this.dispatchEvent('conversationDeleted', deletedConversation);
        
        // If current conversation changed, notify
        if (deletedConversation.id === conversationId) {
            const newCurrent = this.getCurrentConversation();
            this.dispatchEvent('currentConversationChanged', newCurrent);
        }
        
        return true;
    }
    
    /**
     * Add a new category
     * @param {string} categoryName - Name of new category
     * @returns {boolean} - Success
     */
    addCategory(categoryName) {
        if (!categoryName || typeof categoryName !== 'string' || categoryName.trim() === '') {
            return false;
        }
        
        const normalizedName = categoryName.trim();
        
        // Check if category already exists
        if (this.categories.includes(normalizedName)) {
            return false;
        }
        
        // Add category
        this.categories.push(normalizedName);
        
        // Dispatch events
        this.dispatchEvent('stateChanged', { categories: this.categories });
        this.dispatchEvent('categoryAdded', normalizedName);
        
        return true;
    }
    
    /**
     * Sync conversation with current thread in chat UI
     * @param {string} conversationId - ID of conversation
     * @param {Array} currentThread - Current thread array
     * @returns {boolean} - Success
     */
    syncWithCurrentThread(conversationId, currentThread) {
        // If currentThread not provided, try to get from window
        if (!currentThread && window.currentThread && Array.isArray(window.currentThread)) {
            currentThread = window.currentThread;
        }
        
        if (!Array.isArray(currentThread)) {
            console.error('Invalid currentThread provided for sync');
            return false;
        }
        
        const conversation = this.getConversationById(conversationId);
        if (!conversation) return false;
        
        // Update conversation messages with current thread
        conversation.messages = currentThread.map(msg => ({
            id: msg.id || this.generateUUID(),
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString()
        }));
        
        // Update timestamp
        conversation.updatedAt = new Date().toISOString();
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Queue for server sync
        this.queueServerSync(conversationId);
        
        // Dispatch events
        this.dispatchEvent('stateChanged');
        this.dispatchEvent('conversationUpdated', conversation);
        
        return true;
    }
    
    /**
     * Load conversation into current thread in chat UI
     * @param {string} conversationId - ID of conversation to load
     * @returns {boolean} - Success
     */
    loadConversationToThread(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation || !Array.isArray(conversation.messages)) return false;
        
        // Set current conversation
        this.setCurrentConversation(conversationId);
        
        // Prepare thread format
        const thread = conversation.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        
        // Update global thread if it exists
        if (typeof window.currentThread !== 'undefined') {
            window.currentThread = thread;
        }
        
        // Set model if needed
        if (conversation.model && typeof window.currentModel !== 'undefined') {
            window.currentModel = conversation.model;
            
            // Update UI select if it exists
            const modelSelect = document.getElementById('modelSelect');
            if (modelSelect) {
                modelSelect.value = conversation.model;
            }
        }
        
        return true;
    }
    
    /**
     * Import conversation from JSON
     * @param {string} jsonString - JSON string to import
     * @returns {Object|null} - Imported conversation or null on failure
     */
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate required fields
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid JSON format: not an object');
            }
            
            // Create a new conversation with imported data
            const id = this.generateUUID();
            const newConversation = {
                id,
                title: data.title || 'Imported Conversation',
                category: data.category || 'Imported',
                messages: Array.isArray(data.messages) ? data.messages.map(msg => ({
                    id: this.generateUUID(),
                    role: msg.role || 'user',
                    content: msg.content || '',
                    timestamp: msg.timestamp || new Date().toISOString()
                })) : [],
                model: data.model || (window.currentModel || 'default'),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isPinned: false,
                isNew: true
            };
            
            // Add to conversations
            this.conversations.unshift(newConversation);
            this.currentConversationId = id;
            
            // Refresh categories
            this.refreshCategories();
            
            // Save to localStorage
            this.saveToLocalStorage();
            
            // Save to server
            this.saveConversationToServer(id).catch(error => {
                console.error('Failed to save imported conversation to server:', error);
            });
            
            // Dispatch events
            this.dispatchEvent('stateChanged');
            this.dispatchEvent('conversationAdded', newConversation);
            this.dispatchEvent('currentConversationChanged', newConversation);
            
            return newConversation;
        } catch (error) {
            console.error('Error importing conversation from JSON:', error);
            this.lastError = error;
            this.dispatchEvent('error', {
                source: 'import',
                message: 'Failed to import conversation from JSON',
                error
            });
            return null;
        }
    }
    
    /**
     * Import conversation from Markdown
     * @param {string} markdownString - Markdown string to import
     * @returns {Object|null} - Imported conversation or null on failure
     */
    importFromMarkdown(markdownString) {
        try {
            if (typeof markdownString !== 'string' || !markdownString.trim()) {
                throw new Error('Invalid Markdown: empty or not a string');
            }
            
            const lines = markdownString.trim().split('\n');
            let title = 'Imported Conversation';
            let category = 'Imported';
            const messages = [];
            
            // Try to extract title from first line (# Title)
            if (lines[0] && lines[0].startsWith('#')) {
                title = lines[0].substring(1).trim();
                lines.shift();
            }
            
            // Try to find category
            const categoryLine = lines.findIndex(line => 
                line.toLowerCase().startsWith('category:') ||
                line.toLowerCase().startsWith('categories:')
            );
            
            if (categoryLine !== -1) {
                const catLine = lines[categoryLine];
                category = catLine.split(':')[1].trim();
                lines.splice(categoryLine, 1);
            }
            
            // Parse messages
            let currentRole = null;
            let currentContent = '';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Check for role headers (e.g., **User:** or **Assistant:**)
                if (line.match(/^\*\*\s*(User|Assistant):\s*\*\*/i)) {
                    // If we have a previous message, save it
                    if (currentRole && currentContent.trim()) {
                        messages.push({
                            id: this.generateUUID(),
                            role: currentRole.toLowerCase(),
                            content: currentContent.trim(),
                            timestamp: new Date().toISOString()
                        });
                    }
                    
                    // Start new message
                    currentRole = line.match(/^\*\*\s*(User|Assistant):/i)[1].toLowerCase();
                    currentContent = line.replace(/^\*\*\s*(User|Assistant):\s*\*\*/i, '').trim();
                } else if (currentRole) {
                    // Add to current message
                    currentContent += '\n' + line;
                }
            }
            
            // Add final message if exists
            if (currentRole && currentContent.trim()) {
                messages.push({
                    id: this.generateUUID(),
                    role: currentRole.toLowerCase(),
                    content: currentContent.trim(),
                    timestamp: new Date().toISOString()
                });
            }
            
            // Create new conversation
            const id = this.generateUUID();
            const newConversation = {
                id,
                title,
                category,
                messages,
                model: window.currentModel || 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isPinned: false,
                isNew: true
            };
            
            // Add to conversations
            this.conversations.unshift(newConversation);
            this.currentConversationId = id;
            
            // Refresh categories
            this.refreshCategories();
            
            // Save to localStorage
            this.saveToLocalStorage();
            
            // Save to server
            this.saveConversationToServer(id).catch(error => {
                console.error('Failed to save imported conversation to server:', error);
            });
            
            // Dispatch events
            this.dispatchEvent('stateChanged');
            this.dispatchEvent('conversationAdded', newConversation);
            this.dispatchEvent('currentConversationChanged', newConversation);
            
            return newConversation;
        } catch (error) {
            console.error('Error importing conversation from Markdown:', error);
            this.lastError = error;
            this.dispatchEvent('error', {
                source: 'import',
                message: 'Failed to import conversation from Markdown',
                error
            });
            return null;
        }
    }
    
    /**
     * Export conversation to JSON
     * @param {string} conversationId - ID of conversation to export
     * @returns {string|null} - JSON string or null on failure
     */
    exportToJSON(conversationId) {
        try {
            const conversation = this.getConversationById(conversationId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            
            // Create a clean copy for export
            const exportData = {
                title: conversation.title,
                category: conversation.category,
                model: conversation.model,
                messages: conversation.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp
                })),
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting conversation to JSON:', error);
            this.lastError = error;
            this.dispatchEvent('error', {
                source: 'export',
                message: 'Failed to export conversation to JSON',
                error
            });
            return null;
        }
    }
    
    /**
     * Export conversation to Markdown
     * @param {string} conversationId - ID of conversation to export
     * @returns {string|null} - Markdown string or null on failure
     */
    exportToMarkdown(conversationId) {
        try {
            const conversation = this.getConversationById(conversationId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            
            let markdown = `# ${conversation.title}\n\n`;
            markdown += `Category: ${conversation.category}\n`;
            markdown += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`;
            markdown += `Model: ${conversation.model}\n\n`;
            
            // Add messages
            if (Array.isArray(conversation.messages)) {
                conversation.messages.forEach(msg => {
                    const role = msg.role === 'user' ? 'User' : 'Assistant';
                    markdown += `\n**${role}:** ${msg.content}\n\n`;
                });
            }
            
            return markdown;
        } catch (error) {
            console.error('Error exporting conversation to Markdown:', error);
            this.lastError = error;
            this.dispatchEvent('error', {
                source: 'export',
                message: 'Failed to export conversation to Markdown',
                error
            });
            return null;
        }
    }
    
    /**
     * Reorder conversation in the list
     * @param {number} fromIndex - Current index
     * @param {number} toIndex - Target index
     * @returns {boolean} - Success
     */
    reorderConversation(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.conversations.length || 
            toIndex < 0 || toIndex >= this.conversations.length) {
            return false;
        }
        
        // Get conversation being moved
        const conversation = this.conversations[fromIndex];
        
        // Remove from current position
        this.conversations.splice(fromIndex, 1);
        
        // Insert at new position
        this.conversations.splice(toIndex, 0, conversation);
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Dispatch events
        this.dispatchEvent('stateChanged');
        
        return true;
    }
    
    /**
     * Search conversations by title or content
     * @param {string} query - Search query
     * @param {string} category - Optional category filter
     * @returns {Array} - Matching conversations
     */
    searchConversations(query, category = null) {
        if (!query || query.trim() === '') {
            return category ? 
                this.conversations.filter(conv => conv.category === category) : 
                this.conversations;
        }
        
        const queryLower = query.toLowerCase().trim();
        
        return this.conversations.filter(conv => {
            // Apply category filter if specified
            if (category && category !== 'All' && conv.category !== category) {
                return false;
            }
            
            // Search in title
            if (conv.title && conv.title.toLowerCase().includes(queryLower)) {
                return true;
            }
            
            // Search in messages
            if (Array.isArray(conv.messages)) {
                return conv.messages.some(msg => 
                    msg.content && msg.content.toLowerCase().includes(queryLower)
                );
            }
            
            return false;
        });
    }
    
    /**
     * Queue conversation for server sync
     * @param {string} conversationId - ID of conversation to sync
     */
    queueServerSync(conversationId) {
        this.pendingChanges.add(conversationId);
        this.scheduleSyncWithServer();
    }
    
    /**
     * Schedule a server sync after a delay
     */
    scheduleSyncWithServer() {
        // If already scheduled, don't schedule again
        if (this._syncScheduled) return;
        
        this._syncScheduled = true;
        
        // Schedule sync with debounce
        setTimeout(() => {
            this._syncScheduled = false;
            this.syncPendingChanges();
        }, 2000);  // 2 second debounce
    }
    
    /**
     * Sync all pending changes to server
     */
    async syncPendingChanges() {
        if (this.pendingChanges.size === 0) return;
        
        // Get IDs to sync
        const idsToSync = Array.from(this.pendingChanges);
        this.pendingChanges.clear();
        
        // Try to sync each conversation
        const promises = idsToSync.map(id => this.saveConversationToServer(id));
        
        try {
            await Promise.all(promises);
            this.dispatchEvent('syncComplete', { 
                timestamp: new Date(),
                syncedCount: idsToSync.length
            });
        } catch (error) {
            console.error('Error syncing pending changes:', error);
            this.lastError = error;
            this.dispatchEvent('error', {
                source: 'server',
                message: 'Failed to sync pending changes',
                error
            });
        }
    }
    
    /**
     * Save conversation to server
     * @param {string} conversationId - ID of conversation to save
     * @returns {Promise} - Promise that resolves when save is complete
     */
    async saveConversationToServer(conversationId) {
        try {
            const conversation = this.getConversationById(conversationId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            
            // Prepare data for API
            const data = {
                id: conversation.id,
                title: conversation.title,
                category: conversation.category,
                messages: conversation.messages,
                model: conversation.model
            };
            
            // Make API request
            const response = await fetch('/api/history/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server error: ${errorData.error || response.statusText}`);
            }
            
            // Update last sync time
            this.lastSyncTime = new Date();
            
            return true;
        } catch (error) {
            console.error('Error saving conversation to server:', error);
            
            // Add back to pending changes to retry later
            this.pendingChanges.add(conversationId);
            
            // Rethrow for caller to handle
            throw error;
        }
    }
    
    /**
     * Delete conversation from server
     * @param {string} conversationId - ID of conversation to delete
     * @returns {Promise} - Promise that resolves when delete is complete
     */
    async deleteConversationFromServer(conversationId) {
        try {
            // Make API request
            const response = await fetch(`/api/history/${conversationId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error deleting conversation from server:', error);
            throw error;
        }
    }
    
    /**
     * Generate a UUID for IDs
     * @returns {string} - UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} - Unsubscribe function
     */
    on(event, callback) {
        if (typeof event !== 'string' || typeof callback !== 'function') {
            console.error('Invalid event listener parameters');
            return () => {};
        }
        
        // Register general-purpose stateChanged handler
        if (event === 'stateChanged' && !this.eventListeners.hasOwnProperty('stateChanged')) {
            this.eventListeners.stateChanged = [];
        }
        
        // If event doesn't exist yet, create it
        if (!this.eventListeners.hasOwnProperty(event)) {
            this.eventListeners[event] = [];
        }
        
        this.eventListeners[event].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        };
    }
    
    /**
     * Dispatch an event to listeners
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    dispatchEvent(event, data = null) {
        if (!event || typeof event !== 'string') return;
        
        // If we have subscribers for this specific event, notify them
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} event handler:`, error);
                }
            });
        }
        
        // For specific events, also create DOM events for broader system integration
        const systemEvents = [
            'conversationAdded', 
            'conversationDeleted', 
            'currentConversationChanged'
        ];
        
        if (systemEvents.includes(event)) {
            const domEvent = new CustomEvent(event, { 
                detail: data,
                bubbles: true 
            });
            document.dispatchEvent(domEvent);
        }
    }
}

// Create the global store instance
window.conversationStore = new ConversationStore();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConversationStore;
}