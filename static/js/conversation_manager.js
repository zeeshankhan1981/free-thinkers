class ConversationManager {
    constructor() {
        this.conversations = [];
        this.currentConversation = null;
        this.loadConversations();
    }

    // Load conversations from localStorage and server if available
    async loadConversations() {
        // First load from localStorage for immediate access
        const savedConversations = localStorage.getItem('conversations');
        if (savedConversations) {
            try {
                this.conversations = JSON.parse(savedConversations);
                if (this.conversations.length > 0) {
                    this.currentConversation = this.conversations[0];
                }
            } catch (error) {
                console.error('Error parsing saved conversations:', error);
                this.conversations = [];
            }
        }

        // Then try to fetch from server and merge
        try {
            const response = await fetch('/api/history');
            if (response.ok) {
                const serverConversations = await response.json();
                this.mergeServerConversations(serverConversations);
            }
        } catch (error) {
            console.error('Error fetching conversations from server:', error);
            // Continue with local conversations
        }
    }

    // Merge server conversations with local ones
    mergeServerConversations(serverConversations) {
        if (!Array.isArray(serverConversations)) return;
        
        // Create a map of existing conversation IDs
        const existingIds = new Map(this.conversations.map(conv => [conv.id, conv]));
        
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
                this.conversations.push(this.formatServerConversation(serverConv));
            }
        });
        
        // Sort conversations by updated date
        this.conversations.sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        // Save merged conversations to localStorage
        this.saveConversations();
    }

    // Format server conversation to match local format
    formatServerConversation(serverConv) {
        return {
            id: serverConv.id,
            title: serverConv.title || this.getDefaultTitle(serverConv),
            category: serverConv.category || 'Uncategorized',
            messages: Array.isArray(serverConv.messages) ? serverConv.messages : [],
            createdAt: serverConv.created_at || new Date().toISOString(),
            updatedAt: serverConv.updated_at || new Date().toISOString()
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
        return 'Conversation ' + new Date().toLocaleString();
    }

    // Save conversations to localStorage
    saveConversations() {
        try {
            localStorage.setItem('conversations', JSON.stringify(this.conversations));
        } catch (error) {
            console.error('Error saving conversations to localStorage:', error);
            // Show notification to user
            if (typeof showNotification === 'function') {
                showNotification('Failed to save conversations locally. Storage may be full.', 'error');
            }
        }
    }

    // Save conversation to server
    async saveToServer(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) return false;

        try {
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
                    model: window.currentModel || 'mistral-7b'
                })
            });

            if (response.ok) {
                return true;
            } else {
                const errorData = await response.json();
                console.error('Server error saving conversation:', errorData);
                return false;
            }
        } catch (error) {
            console.error('Error saving conversation to server:', error);
            return false;
        }
    }

    // Create a new conversation
    createConversation(title = 'New Conversation', category = 'Uncategorized') {
        const newConversation = {
            id: Date.now().toString(),
            title,
            category,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.conversations.unshift(newConversation); // Add to beginning of array
        this.currentConversation = newConversation;
        this.saveConversations();
        
        // Try to save to server
        this.saveToServer(newConversation.id).catch(error => {
            console.error('Failed to save new conversation to server:', error);
        });
        
        return newConversation;
    }

    // Set current conversation
    setCurrentConversation(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (conversation) {
            this.currentConversation = conversation;
            return true;
        }
        return false;
    }

    // Get current conversation
    getCurrentConversation() {
        return this.currentConversation;
    }

    // Update conversation title
    updateConversationTitle(conversationId, newTitle) {
        if (!newTitle || newTitle.trim() === '') {
            console.error('Invalid title: Title cannot be empty');
            return false;
        }

        const conversation = this.getConversationById(conversationId);
        if (conversation) {
            conversation.title = newTitle.trim();
            conversation.updatedAt = new Date().toISOString();
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
            this.saveConversations();
            
            // Try to save to server
            this.saveToServer(conversationId).catch(error => {
                console.error('Failed to save updated category to server:', error);
            });
            
            return true;
        }
        return false;
    }

    // Add message to conversation
    addMessage(conversationId, role, content) {
        const conversation = this.getConversationById(conversationId);
        if (conversation) {
            const message = {
                id: Date.now().toString(),
                role,
                content,
                timestamp: new Date().toISOString()
            };
            conversation.messages.push(message);
            conversation.updatedAt = new Date().toISOString();
            this.saveConversations();
            
            // Try to save to server asynchronously
            this.saveToServer(conversationId).catch(error => {
                console.error('Failed to save new message to server:', error);
            });
            
            return message;
        }
        return null;
    }

    // Sync conversation with current chat thread
    syncWithCurrentThread(conversationId) {
        // Make sure currentThread exists and initialize it if needed
        if (typeof window.currentThread === 'undefined') {
            console.log('Initializing empty currentThread');
            window.currentThread = [];
        }
        
        if (!Array.isArray(window.currentThread)) {
            console.error('Invalid currentThread format - expected array');
            return false;
        }

        const conversation = this.getConversationById(conversationId);
        if (!conversation) {
            console.error(`Conversation with ID ${conversationId} not found`);
            return false;
        }

        // Update conversation messages with current thread
        conversation.messages = window.currentThread.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date().toISOString()
        }));
        conversation.updatedAt = new Date().toISOString();
        
        this.saveConversations();
        
        // Try to save to server
        this.saveToServer(conversationId).catch(error => {
            console.error('Failed to sync conversation with server:', error);
        });
        
        return true;
    }

    // Load conversation into current thread
    loadConversationToThread(conversationId) {
        try {
            // Find the conversation
            const conversation = this.getConversationById(conversationId);
            if (!conversation || !conversation.messages || !conversation.messages.length) {
                console.warn('No conversation found with ID:', conversationId, 'or the conversation has no messages');
                return false;
            }

            // Set it as the current conversation
            this.setCurrentConversation(conversationId);

            // Load the messages into the global thread
            if (window.currentThread !== undefined) {
                window.currentThread = [...conversation.messages];
                console.log('Loaded conversation messages into current thread:', conversation.messages.length);
                
                // Update the model if needed
                if (conversation.model && window.currentModel !== undefined) {
                    window.currentModel = conversation.model;
                    
                    // Update model select if it exists
                    const modelSelect = document.getElementById('modelSelect');
                    if (modelSelect) {
                        modelSelect.value = conversation.model;
                    }
                }
                
                return true;
            } else {
                console.error('window.currentThread is not defined, cannot load conversation');
                return false;
            }
        } catch (error) {
            console.error('Error loading conversation to thread:', error);
            return false;
        }
    }

    // Search conversations by title or content
    searchConversations(query) {
        if (!query || query.trim() === '') {
            return this.getAllConversations();
        }
        
        const queryLower = query.toLowerCase().trim();
        return this.conversations.filter(conversation => {
            // Search in title
            if (conversation.title.toLowerCase().includes(queryLower)) {
                return true;
            }
            
            // Search in messages
            if (Array.isArray(conversation.messages)) {
                return conversation.messages.some(msg => 
                    msg.content && msg.content.toLowerCase().includes(queryLower)
                );
            }
            
            return false;
        });
    }

    // Get conversation by ID
    getConversationById(id) {
        return this.conversations.find(c => c.id === id);
    }

    // Export conversation to JSON
    exportToJSON(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) {
            console.error('Conversation not found');
            return null;
        }
        
        try {
            return JSON.stringify({
                ...conversation,
                messages: conversation.messages.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp).toISOString()
                }))
            }, null, 2);
        } catch (error) {
            console.error('Error exporting conversation to JSON:', error);
            return null;
        }
    }

    // Export conversation to Markdown
    exportToMarkdown(conversationId) {
        const conversation = this.getConversationById(conversationId);
        if (!conversation) {
            console.error('Conversation not found');
            return null;
        }
        
        try {
            let markdown = `# ${conversation.title}\n\n`;
            markdown += `Category: ${conversation.category}\n\n`;
            markdown += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n\n`;
            
            if (Array.isArray(conversation.messages)) {
                conversation.messages.forEach(msg => {
                    const role = msg.role === 'user' ? 'User' : 'Assistant';
                    markdown += `\n**${role}:**\n\n${msg.content}\n\n`;
                });
            }
            
            return markdown;
        } catch (error) {
            console.error('Error exporting conversation to Markdown:', error);
            return null;
        }
    }

    // Import conversation from JSON
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate required fields
            if (!data.title) {
                console.error('Invalid conversation data: Missing title');
                return null;
            }
            
            const newConversation = {
                ...data,
                id: Date.now().toString(),
                category: data.category || 'Uncategorized',
                messages: Array.isArray(data.messages) ? data.messages : [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.conversations.unshift(newConversation);
            this.currentConversation = newConversation;
            this.saveConversations();
            
            // Try to save to server
            this.saveToServer(newConversation.id).catch(error => {
                console.error('Failed to save imported conversation to server:', error);
            });
            
            return newConversation;
        } catch (error) {
            console.error('Error importing conversation from JSON:', error);
            return null;
        }
    }

    // Import conversation from Markdown
    importFromMarkdown(markdownString) {
        try {
            const lines = markdownString.split('\n');
            if (lines.length < 1 || !lines[0].startsWith('#')) {
                console.error('Invalid Markdown format: Missing title');
                return null;
            }
            
            const title = lines[0].replace('#', '').trim();
            let category = 'Uncategorized';
            
            // Look for category line
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].startsWith('Category:')) {
                    category = lines[i].replace('Category:', '').trim();
                    break;
                }
            }
            
            const messages = [];
            let currentRole = '';
            let currentContent = '';
            
            // Parse messages
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('**') && (lines[i].includes('User:') || lines[i].includes('Assistant:'))) {
                    // Save previous message if exists
                    if (currentRole && currentContent.trim()) {
                        messages.push({
                            role: currentRole.toLowerCase(),
                            content: currentContent.trim(),
                            timestamp: new Date().toISOString()
                        });
                    }
                    
                    // Start new message
                    currentRole = lines[i].includes('User:') ? 'user' : 'assistant';
                    currentContent = '';
                } else if (currentRole) {
                    // Add line to current message
                    currentContent += lines[i] + '\n';
                }
            }
            
            // Add final message if exists
            if (currentRole && currentContent.trim()) {
                messages.push({
                    role: currentRole.toLowerCase(),
                    content: currentContent.trim(),
                    timestamp: new Date().toISOString()
                });
            }
            
            const newConversation = {
                id: Date.now().toString(),
                title,
                category,
                messages,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.conversations.unshift(newConversation);
            this.currentConversation = newConversation;
            this.saveConversations();
            
            // Try to save to server
            this.saveToServer(newConversation.id).catch(error => {
                console.error('Failed to save imported conversation to server:', error);
            });
            
            return newConversation;
        } catch (error) {
            console.error('Error importing conversation from Markdown:', error);
            return null;
        }
    }

    // Delete conversation
    deleteConversation(conversationId) {
        const index = this.conversations.findIndex(c => c.id === conversationId);
        if (index === -1) {
            console.error('Conversation not found');
            return false;
        }
        
        // Remove from array
        this.conversations.splice(index, 1);
        
        // Update current conversation if needed
        if (this.currentConversation && this.currentConversation.id === conversationId) {
            this.currentConversation = this.conversations.length > 0 ? this.conversations[0] : null;
        }
        
        this.saveConversations();
        
        // Try to delete from server
        this.deleteFromServer(conversationId).catch(error => {
            console.error('Failed to delete conversation from server:', error);
        });
        
        return true;
    }

    // Delete conversation from server
    async deleteFromServer(conversationId) {
        try {
            const response = await fetch(`/api/history/${conversationId}`, {
                method: 'DELETE'
            });
            
            return response.ok;
        } catch (error) {
            console.error('Error deleting conversation from server:', error);
            return false;
        }
    }

    // Get all conversations
    getAllConversations() {
        return [...this.conversations];
    }

    // Get conversations by category
    getConversationsByCategory(category) {
        if (!category || category === 'all') {
            return this.getAllConversations();
        }
        return this.conversations.filter(c => c.category === category);
    }

    // Get all categories
    getAllCategories() {
        const categories = new Set(this.conversations.map(c => c.category));
        return Array.from(categories);
    }

    // Create category if it doesn't exist
    createCategoryIfNotExists(category) {
        if (!category || category === 'Uncategorized') return;
        
        const categories = this.getAllCategories();
        if (!categories.includes(category)) {
            this.createConversation(`${category} Sample`, category);
        }
    }
}

// Create a global instance of ConversationManager
window.conversationManager = new ConversationManager();
