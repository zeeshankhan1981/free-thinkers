// Main application script
document.addEventListener('DOMContentLoaded', () => {
    // Ensure global thread variable is initialized
    if (typeof window.currentThread === 'undefined') {
        window.currentThread = [];
        console.log('Global thread initialized');
    }
    
    // Initialize global variables
    window.currentModel = 'mistral-7b';
    window.currentParameters = {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        max_tokens: 2048
    };

    // DOM Elements
    const chatContainer = document.querySelector('.chat-container');
    const messagesList = document.querySelector('.messages-list');
    const messageInput = document.getElementById('messageInput');
    const sendMessage = document.getElementById('sendMessage');
    const modelSelect = document.getElementById('modelSelect');
    const conversationManagerBtn = document.getElementById('conversationManagerBtn');

    // Add fade transition class to chat container for smooth transitions
    if (chatContainer) {
        chatContainer.classList.add('fade-transition');
    }

    // Initialize message input focus
    if (messageInput) {
        setTimeout(() => messageInput.focus(), 100);
    }
    
    // Add chat container class for styling
    if (chatContainer) {
        chatContainer.classList.add('chat-container-ready');
    }

    // Listen for conversation changes and load messages
    document.addEventListener('currentConversationChanged', (e) => {
        if (e.detail && Array.isArray(e.detail.messages)) {
            loadConversationMessages(e.detail.messages);
        }
    });
    
    // Listen for message sending to update conversation
    if (sendMessage) {
        const originalClickHandler = sendMessage.onclick;
        sendMessage.onclick = function(e) {
            // Call the original handler
            if (typeof originalClickHandler === 'function') {
                originalClickHandler.call(this, e);
            }
            
            // Dispatch event that message was sent
            document.dispatchEvent(new CustomEvent('messageSent'));
        };
    }
    
    // Sync with current thread when model changes
    if (modelSelect) {
        modelSelect.addEventListener('change', () => {
            if (window.conversationManager) {
                window.conversationManager.syncWithCurrentThread();
            }
        });
    }

    // Initialize conversation manager
    initConversationManager();
    
    // Configure conversation manager integration with main chat
    setupChatIntegration();
});

// Conversation Management Functions
function initConversationManager() {
    const toggleBtn = document.getElementById('toggleConversationManager');
    const sidebar = document.getElementById('conversationManagerSidebar');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    loadCategories();
    loadConversations();
    setupConversationEventListeners();
}

// Connect the conversation manager with the main chat interface
function setupChatIntegration() {
    console.log('Setting up chat integration...');
    
    // Get necessary references to UI elements
    const sendMessage = document.getElementById('sendMessage');
    const messageInput = document.getElementById('messageInput');
    const clearMessages = document.getElementById('clearMessages');
    const modelSelect = document.getElementById('modelSelect');
    
    // We need to wait until sendMessageToAI is defined in index.html
    // Set up a handler for the send button which will work regardless
    if (sendMessage) {
        console.log('Setting up send button handler');
        sendMessage.addEventListener('click', function(event) {
            // If user input is empty, don't proceed
            if (!messageInput || !messageInput.value.trim()) {
                return;
            }
            
            const userInput = messageInput.value.trim();
            
            // Get or create active conversation first
            try {
                if (window.conversationManager) {
                    let activeConversation = window.conversationManager.getCurrentConversation();
                    if (!activeConversation) {
                        // Create a new conversation with first message as title
                        const title = userInput.length > 30 ? userInput.substring(0, 30) + '...' : userInput;
                        activeConversation = window.conversationManager.createConversation(title, 'Uncategorized');
                        console.log('Created new conversation:', activeConversation.id);
                    }
                }
            } catch (error) {
                console.error('Error handling conversation creation:', error);
            }
            
            // Let the original sendMessageToAI handle sending (defined in index.html)
            // This won't block execution if the function doesn't exist yet
            if (typeof window.sendMessageToAI === 'function') {
                window.sendMessageToAI();
                
                // After a short delay to let the message get added to the thread, sync with the conversation
                setTimeout(() => {
                    try {
                        if (window.conversationManager && window.currentThread) {
                            const activeConversation = window.conversationManager.getCurrentConversation();
                            if (activeConversation) {
                                window.conversationManager.syncWithCurrentThread(activeConversation.id);
                                console.log('Synced conversation after sending message');
                            }
                        }
                    } catch (error) {
                        console.error('Error syncing conversation after sending message:', error);
                    }
                }, 100);
            }
        });
    }
    
    // Update clear messages functionality
    if (clearMessages) {
        console.log('Setting up clear button handler');
        clearMessages.addEventListener('click', function(event) {
            // Clear the current thread
            if (window.currentThread) {
                window.currentThread = [];
                if (typeof window.renderMessages === 'function') {
                    window.renderMessages();
                }
                
                // Create a new conversation if the conversation manager is available
                try {
                    if (window.conversationManager) {
                        const newConversation = window.conversationManager.createConversation('New Conversation', 'Uncategorized');
                        console.log('Created new conversation after clearing messages:', newConversation.id);
                        // Refresh the conversations list
                        loadConversations();
                    }
                } catch (error) {
                    console.error('Error creating conversation after clearing messages:', error);
                }
            }
        });
    }
    
    // Add model change handler
    if (modelSelect) {
        console.log('Setting up model select handler');
        modelSelect.addEventListener('change', function(event) {
            // Get the selected model
            const selectedModel = this.value;
            
            // Update global model if it exists
            if (typeof window.currentModel !== 'undefined') {
                window.currentModel = selectedModel;
            }
            
            // Update the model in the active conversation
            try {
                if (window.conversationManager) {
                    const activeConversation = window.conversationManager.getCurrentConversation();
                    if (activeConversation) {
                        // Add model property if it doesn't exist
                        activeConversation.model = selectedModel;
                        window.conversationManager.saveConversations();
                        console.log('Updated model in conversation:', selectedModel);
                    }
                }
            } catch (error) {
                console.error('Error updating model in conversation:', error);
            }
        });
    }
    
    // Set up a MutationObserver to watch for message updates in the chat
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        console.log('Setting up chat messages observer');
        const observer = new MutationObserver(function(mutations) {
            // If we have new children (messages), sync with the conversation
            if (mutations.some(m => m.type === 'childList' && m.addedNodes.length > 0)) {
                try {
                    if (window.conversationManager && window.currentThread) {
                        const activeConversation = window.conversationManager.getCurrentConversation();
                        if (activeConversation) {
                            window.conversationManager.syncWithCurrentThread(activeConversation.id);
                            console.log('Synced conversation after message update');
                            
                            // Refresh the conversations list
                            setTimeout(() => loadConversations(), 500);
                        }
                    }
                } catch (error) {
                    console.error('Error syncing conversation after message update:', error);
                }
            }
        });
        
        observer.observe(chatMessages, { childList: true, subtree: true });
    }
    
    console.log('Chat integration set up successfully');
}

// Load categories
function loadCategories() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList || !window.conversationManager) return;

    // Clear existing categories
    categoriesList.innerHTML = '';
    
    // Add "All Conversations" option at the top
    const allCategoryItem = document.createElement('div');
    allCategoryItem.className = 'category-item';
    allCategoryItem.textContent = 'All Conversations';
    allCategoryItem.addEventListener('click', () => showConversationsByCategory('all'));
    categoriesList.appendChild(allCategoryItem);

    // Get unique categories from the conversation manager
    const categories = window.conversationManager.categories || [];
    
    // Add each category to the list
    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.textContent = category;
        categoryItem.addEventListener('click', () => showConversationsByCategory(category));
        categoriesList.appendChild(categoryItem);
    });
    
    // Set the first category as active
    const firstCategory = categoriesList.querySelector('.category-item');
    if (firstCategory) {
        firstCategory.classList.add('active');
    }
}

// Load conversations
function loadConversations() {
    const conversationsList = document.getElementById('conversationsList');
    if (!conversationsList || !window.conversationManager) return;
    
    // Clear existing conversations
    conversationsList.innerHTML = '';

    // Get all conversations - direct access instead of using a non-existent method
    const conversations = window.conversationManager.conversations || [];
    
    if (conversations.length === 0) {
        // Show empty state
        conversationsList.innerHTML = '<div class="empty-state">No conversations yet</div>';
        return;
    }
    
    // Sort conversations by last modified (newest first)
    conversations.sort((a, b) => {
        return new Date(b.lastModified || 0) - new Date(a.lastModified || 0);
    });
    
    // Get current conversation ID
    const currentConversationId = window.conversationManager.getCurrentConversation()?.id;
    
    // Add conversations to the list
    conversations.forEach(conversation => {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        if (conversation.id === currentConversationId) {
            conversationItem.classList.add('active');
        }
        
        // Format the date
        const date = conversation.lastModified 
            ? new Date(conversation.lastModified).toLocaleDateString() 
            : 'Unknown date';
        
        // Get preview text from the first message
        let previewText = '';
        if (conversation.messages && conversation.messages.length > 0) {
            const firstUserMsg = conversation.messages.find(msg => msg.role === 'user');
            if (firstUserMsg) {
                previewText = firstUserMsg.content.substring(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '');
            }
        }
        
        conversationItem.innerHTML = `
            <div class="conversation-title">${conversation.title || 'Untitled'}</div>
            <div class="conversation-preview">${previewText}</div>
            <div class="conversation-date">${date}</div>
        `;
        
        // Add click handler to load conversation
        conversationItem.addEventListener('click', () => {
            selectConversation(conversation.id);
        });
        
        conversationsList.appendChild(conversationItem);
    });
}

// Function to handle conversation selection from the sidebar
function selectConversation(conversationId) {
    // Check if the conversation manager is available
    if (!window.conversationManager) {
        console.error('Conversation manager not available');
        return;
    }
    
    // Load conversation into current thread
    if (window.conversationManager.loadConversationToThread(conversationId)) {
        // Re-render messages
        if (typeof window.renderMessages === 'function') {
            window.renderMessages();
        }
        
        // Close the sidebar
        const sidebar = document.getElementById('conversationManagerSidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
        
        // Show notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('Conversation loaded successfully', 'success');
        }
    } else {
        // Show error notification
        if (typeof window.showNotification === 'function') {
            window.showNotification('Failed to load conversation', 'error');
        }
    }
}

// Show conversations by category
function showConversationsByCategory(category) {
    const conversationsList = document.getElementById('conversationsList');
    if (!conversationsList) return;
    
    // Update active category in UI
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.classList.remove('active');
        if (item.textContent === category || 
            (category === 'all' && item.textContent === 'All Conversations')) {
            item.classList.add('active');
        }
    });

    // Clear existing conversations
    conversationsList.innerHTML = '';

    // Get current conversation for highlighting
    const currentConversation = window.conversationManager.getCurrentConversation();
    
    // Get filtered conversations and sort by updated date
    const conversations = window.conversationManager.getConversationsByCategory(category)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Add conversations to the list
    conversations.forEach(conversation => {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        
        // If this is the current conversation, highlight it
        if (currentConversation && conversation.id === currentConversation.id) {
            conversationItem.classList.add('active');
        }
        
        conversationItem.textContent = conversation.title || 'Untitled Conversation';
        conversationItem.dataset.id = conversation.id;
        
        // Add click event to load conversation and show details
        conversationItem.addEventListener('click', () => {
            // First update the display
            const items = document.querySelectorAll('.conversation-item');
            items.forEach(item => item.classList.remove('active'));
            conversationItem.classList.add('active');
            
            // Load conversation
            if (window.conversationManager.loadConversationToThread(conversation.id)) {
                showConversationDetails(conversation);
                
                // Render the conversation in the chat interface if possible
                if (typeof window.renderMessages === 'function') {
                    window.renderMessages();
                }
            }
        });
        
        conversationsList.appendChild(conversationItem);
    });
    
    // Show a message if there are no conversations in this category
    if (conversations.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = `No conversations found in "${category}". Create a new one to get started.`;
        conversationsList.appendChild(emptyMessage);
    }
}

// Show conversation details
function showConversationDetails(conversation) {
    const modal = document.getElementById('conversationDetailsModal');
    if (!modal) return;

    modal.style.display = 'block';

    const title = document.getElementById('conversationDetailsTitle');
    const body = document.getElementById('conversationDetailsBody');

    if (!title || !body) {
        console.error('Conversation details elements not found');
        return;
    }

    title.textContent = conversation.title || 'Conversation Details';
    
    // Create form for editing conversation details
    body.innerHTML = `
        <form id="conversationDetailsForm" class="mb-3">
            <div class="form-group mb-3">
                <label for="conversationTitle">Title</label>
                <input type="text" class="form-control" id="conversationTitle" value="${conversation.title || ''}">
            </div>
            <div class="form-group mb-3">
                <label for="conversationCategory">Category</label>
                <input type="text" class="form-control" id="conversationCategory" value="${conversation.category || 'Uncategorized'}" list="categoryList">
                <datalist id="categoryList">
                    ${getCategoryOptions()}
                </datalist>
            </div>
            <div class="form-group mb-3">
                <p><strong>Created:</strong> ${formatDate(conversation.createdAt)}</p>
                <p><strong>Last Updated:</strong> ${formatDate(conversation.updatedAt)}</p>
                <p><strong>Messages:</strong> ${Array.isArray(conversation.messages) ? conversation.messages.length : 0}</p>
            </div>
            <div class="form-group d-flex justify-content-between">
                <button type="button" class="btn btn-danger" id="deleteConversationBtn">Delete</button>
                <button type="button" class="btn btn-primary" id="exportConversationBtn">Export</button>
            </div>
        </form>
    `;

    // Setup event listeners on new form elements
    setupDetailFormListeners(conversation);
}

// Setup event listeners for the conversation details form
function setupDetailFormListeners(conversation) {
    // Delete button
    const deleteBtn = document.getElementById('deleteConversationBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${conversation.title}"? This cannot be undone.`)) {
                if (window.conversationManager.deleteConversation(conversation.id)) {
                    showNotification('Conversation deleted successfully');
                    document.getElementById('conversationDetailsModal').style.display = 'none';
                    
                    // Refresh the conversations list
                    loadConversations();
                    loadCategories();
                    
                    // Clear the chat if this was the current conversation
                    if (typeof window.clearMessages === 'function') {
                        window.clearMessages();
                    } else if (window.currentThread) {
                        window.currentThread = [];
                        if (typeof window.renderMessages === 'function') {
                            window.renderMessages();
                        }
                    }
                } else {
                    showNotification('Failed to delete conversation', 'error');
                }
            }
        });
    }

    // Export button
    const exportBtn = document.getElementById('exportConversationBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showExportModal(conversation.id);
        });
    }

    // Save changes button
    const saveBtn = document.getElementById('saveConversationChanges');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const titleInput = document.getElementById('conversationTitle');
            const categoryInput = document.getElementById('conversationCategory');
            
            if (!titleInput || !categoryInput) {
                console.error('Form inputs not found');
                return;
            }
            
            const newTitle = titleInput.value.trim();
            const newCategory = categoryInput.value.trim();
            
            // Validate title
            if (!newTitle) {
                showNotification('Title cannot be empty', 'error');
                return;
            }
            
            // Update conversation details
            let updated = false;
            
            if (newTitle !== conversation.title) {
                updated = window.conversationManager.updateConversationTitle(conversation.id, newTitle);
            }
            
            if (newCategory !== conversation.category) {
                updated = window.conversationManager.updateConversationCategory(conversation.id, newCategory) || updated;
            }
            
            if (updated) {
                showNotification('Conversation updated successfully');
                document.getElementById('conversationDetailsModal').style.display = 'none';
                
                // Refresh the UI
                loadConversations();
                loadCategories();
            } else {
                showNotification('No changes were made');
            }
        });
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleString();
    } catch (e) {
        console.error('Error formatting date:', e);
        return dateString;
    }
}

// Show export modal
function showExportModal(conversationId) {
    const modal = document.getElementById('exportModal');
    if (!modal) return;

    modal.style.display = 'block';
    
    // Clear previous event listeners
    const jsonBtn = document.getElementById('exportAsJSON');
    const mdBtn = document.getElementById('exportAsMarkdown');
    
    if (jsonBtn) {
        const newJsonBtn = jsonBtn.cloneNode(true);
        jsonBtn.parentNode.replaceChild(newJsonBtn, jsonBtn);
        
        newJsonBtn.addEventListener('click', () => {
            try {
                const jsonData = window.conversationManager.exportToJSON(conversationId);
                if (jsonData) {
                    downloadFile(jsonData, 'conversation.json', 'application/json');
                    modal.style.display = 'none';
                    showNotification('Conversation exported as JSON');
                } else {
                    throw new Error('Failed to export as JSON');
                }
            } catch (error) {
                console.error('JSON export error:', error);
                showNotification('Invalid JSON file format', 'error');
            }
        });
    }

    if (mdBtn) {
        const newMdBtn = mdBtn.cloneNode(true);
        mdBtn.parentNode.replaceChild(newMdBtn, mdBtn);
        
        newMdBtn.addEventListener('click', () => {
            try {
                const markdownData = window.conversationManager.exportToMarkdown(conversationId);
                if (markdownData) {
                    downloadFile(markdownData, 'conversation.md', 'text/markdown');
                    modal.style.display = 'none';
                    showNotification('Conversation exported as Markdown');
                } else {
                    throw new Error('Failed to export as Markdown');
                }
            } catch (error) {
                console.error('Markdown export error:', error);
                showNotification('Invalid Markdown file format', 'error');
            }
        });
    }
}

// Download file
function downloadFile(content, fileName, contentType) {
    try {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        
        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(a.href);
        }, 100);
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Failed to download file', 'error');
    }
}

// Get category options for datalist
function getCategoryOptions() {
    try {
        const categories = window.conversationManager.getAllCategories();
        return categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');
    } catch (error) {
        console.error('Error getting categories:', error);
        return '';
    }
}

// Handle search
function handleSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    const conversationsList = document.getElementById('conversationsList');
    if (!conversationsList) return;
    
    // Reset category selection
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.classList.remove('active');
        if (item.textContent === 'All Conversations') {
            item.classList.add('active');
        }
    });

    // Clear existing conversations
    conversationsList.innerHTML = '';

    // Get current conversation for highlighting
    const currentConversation = window.conversationManager.getCurrentConversation();
    
    // Search conversations
    const results = window.conversationManager.searchConversations(query);
    
    // Add results to the list
    results.forEach(conversation => {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        
        // If this is the current conversation, highlight it
        if (currentConversation && conversation.id === currentConversation.id) {
            conversationItem.classList.add('active');
        }
        
        conversationItem.textContent = conversation.title || 'Untitled Conversation';
        conversationItem.dataset.id = conversation.id;
        
        // Add click handler
        conversationItem.addEventListener('click', () => {
            // First update the display
            const items = document.querySelectorAll('.conversation-item');
            items.forEach(item => item.classList.remove('active'));
            conversationItem.classList.add('active');
            
            // Then load the conversation into the current thread
            if (window.conversationManager.loadConversationToThread(conversation.id)) {
                showConversationDetails(conversation);
                
                // Render the conversation in the chat interface if possible
                if (typeof window.renderMessages === 'function') {
                    window.renderMessages();
                }
            }
        });
        
        conversationsList.appendChild(conversationItem);
    });
    
    // Show a message if no results
    if (results.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = `No conversations found matching "${query}"`;
        conversationsList.appendChild(emptyMessage);
    }
}

// Handle new conversation
function handleNewConversation() {
    try {
        // Prompt for title with validation
        let title = prompt('Enter conversation title:');
        if (title === null) return; // User cancelled
        
        title = title.trim();
        if (!title) {
            title = 'New Conversation ' + new Date().toLocaleTimeString();
        }
        
        // Prompt for category
        const category = prompt('Enter category (optional):') || 'Uncategorized';
        
        // Create the conversation
        const newConv = window.conversationManager.createConversation(title, category);
        
        // Show notification
        showNotification('New conversation created');
        
        // Refresh UI
        loadConversations();
        loadCategories();
        
        // Set as current conversation and clear chat
        window.conversationManager.setCurrentConversation(newConv.id);
        
        // Clear the chat interface
        if (window.currentThread) {
            window.currentThread = [];
            if (typeof window.renderMessages === 'function') {
                window.renderMessages();
            }
        }
    } catch (error) {
        console.error('Error creating conversation:', error);
        showNotification('Failed to create conversation', 'error');
    }
}

// Handle import
function handleImport() {
    const modal = document.getElementById('importModal');
    if (!modal) return;

    // Reset file inputs
    const jsonInput = document.getElementById('jsonFileInput');
    const mdInput = document.getElementById('markdownFileInput');
    
    if (jsonInput) jsonInput.value = '';
    if (mdInput) mdInput.value = '';

    // Show modal
    modal.style.display = 'block';
}

// Process import from file
function processImportFile() {
    const jsonFile = document.getElementById('jsonFileInput')?.files[0];
    const markdownFile = document.getElementById('markdownFileInput')?.files[0];
    const modal = document.getElementById('importModal');

    if (!jsonFile && !markdownFile) {
        showNotification('Please select a file to import', 'error');
        return;
    }

    try {
        if (jsonFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = window.conversationManager.importFromJSON(e.target.result);
                    if (result) {
                        showNotification('Conversation imported successfully');
                        if (modal) modal.style.display = 'none';
                        
                        // Refresh UI
                        loadConversations();
                        loadCategories();
                        
                        // Set as current conversation
                        window.conversationManager.setCurrentConversation(result.id);
                        
                        // Load into chat interface
                        if (window.conversationManager.loadConversationToThread(result.id)) {
                            if (typeof window.renderMessages === 'function') {
                                window.renderMessages();
                            }
                        }
                    } else {
                        throw new Error('Failed to import JSON');
                    }
                } catch (error) {
                    console.error('JSON import error:', error);
                    showNotification('Invalid JSON file format', 'error');
                }
            };
            reader.onerror = () => {
                showNotification('Error reading file', 'error');
            };
            reader.readAsText(jsonFile);
        } else if (markdownFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = window.conversationManager.importFromMarkdown(e.target.result);
                    if (result) {
                        showNotification('Conversation imported successfully');
                        if (modal) modal.style.display = 'none';
                        
                        // Refresh UI
                        loadConversations();
                        loadCategories();
                        
                        // Set as current conversation
                        window.conversationManager.setCurrentConversation(result.id);
                        
                        // Load into chat interface
                        if (window.conversationManager.loadConversationToThread(result.id)) {
                            if (typeof window.renderMessages === 'function') {
                                window.renderMessages();
                            }
                        }
                    } else {
                        throw new Error('Failed to import Markdown');
                    }
                } catch (error) {
                    console.error('Markdown import error:', error);
                    showNotification('Invalid Markdown file format', 'error');
                }
            };
            reader.onerror = () => {
                showNotification('Error reading file', 'error');
            };
            reader.readAsText(markdownFile);
        }
    } catch (error) {
        console.error('Import error:', error);
        showNotification('Error importing file', 'error');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('conversationNotification');
    if (!notification) return;

    // Set message and type
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'error') {
        notification.classList.add('error');
    } else if (type === 'success') {
        notification.classList.add('success');
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Setup conversation event listeners
function setupConversationEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('conversationSearch');
    if (searchInput) {
        // Remove existing listeners
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        
        // Add event listener for input
        newSearchInput.addEventListener('input', handleSearch);
    }

    // New conversation button
    const newConversationBtn = document.getElementById('newConversationBtn');
    if (newConversationBtn) {
        // Remove existing listeners
        const newBtn = newConversationBtn.cloneNode(true);
        newConversationBtn.parentNode.replaceChild(newBtn, newConversationBtn);
        
        // Add event listener
        newBtn.addEventListener('click', handleNewConversation);
    }

    // Import conversation button
    const importConversationBtn = document.getElementById('importConversationBtn');
    if (importConversationBtn) {
        // Remove existing listeners
        const newBtn = importConversationBtn.cloneNode(true);
        importConversationBtn.parentNode.replaceChild(newBtn, importConversationBtn);
        
        // Add event listener
        newBtn.addEventListener('click', handleImport);
    }

    // Export conversation button
    const exportConversationBtn = document.getElementById('exportConversationBtn');
    if (exportConversationBtn) {
        // Remove existing listeners
        const newBtn = exportConversationBtn.cloneNode(true);
        exportConversationBtn.parentNode.replaceChild(newBtn, exportConversationBtn);
        
        // Add event listener
        newBtn.addEventListener('click', () => {
            const currentConv = window.conversationManager.getCurrentConversation();
            if (currentConv) {
                showExportModal(currentConv.id);
            } else {
                showNotification('No active conversation to export', 'error');
            }
        });
    }

    // Process import button
    const importBtn = document.getElementById('importConversation');
    if (importBtn) {
        // Remove existing listeners
        const newBtn = importBtn.cloneNode(true);
        importBtn.parentNode.replaceChild(newBtn, importBtn);
        
        // Add event listener
        newBtn.addEventListener('click', processImportFile);
    }

    // Close modal buttons
    setupModalCloseButtons();
}

// Setup modal close buttons
function setupModalCloseButtons() {
    // Conversation details modal
    const closeConversationDetails = document.getElementById('closeConversationDetails');
    if (closeConversationDetails) {
        closeConversationDetails.addEventListener('click', () => {
            document.getElementById('conversationDetailsModal').style.display = 'none';
        });
    }

    const closeConversationDetailsBtn = document.getElementById('closeConversationDetailsBtn');
    if (closeConversationDetailsBtn) {
        closeConversationDetailsBtn.addEventListener('click', () => {
            document.getElementById('conversationDetailsModal').style.display = 'none';
        });
    }

    // Import modal
    const closeImportModal = document.getElementById('closeImportModal');
    if (closeImportModal) {
        closeImportModal.addEventListener('click', () => {
            document.getElementById('importModal').style.display = 'none';
        });
    }

    // Export modal
    const closeExportModal = document.getElementById('closeExportModal');
    if (closeExportModal) {
        closeExportModal.addEventListener('click', () => {
            document.getElementById('exportModal').style.display = 'none';
        });
    }

    // Close sidebar
    const closeConversationManager = document.getElementById('closeConversationManager');
    if (closeConversationManager) {
        closeConversationManager.addEventListener('click', () => {
            document.getElementById('conversationManagerSidebar').classList.remove('active');
        });
    }

    // Add click outside to close modals
    document.addEventListener('click', (event) => {
        // Conversation details modal
        const conversationModal = document.getElementById('conversationDetailsModal');
        if (conversationModal && conversationModal.style.display === 'block') {
            if (event.target === conversationModal) {
                conversationModal.style.display = 'none';
            }
        }
        
        // Import modal
        const importModal = document.getElementById('importModal');
        if (importModal && importModal.style.display === 'block') {
            if (event.target === importModal) {
                importModal.style.display = 'none';
            }
        }
        
        // Export modal
        const exportModal = document.getElementById('exportModal');
        if (exportModal && exportModal.style.display === 'block') {
            if (event.target === exportModal) {
                exportModal.style.display = 'none';
            }
        }
    });
}

// Load conversation messages into the chat UI
function loadConversationMessages(messages) {
    if (!Array.isArray(messages)) {
        console.error('Invalid messages format:', messages);
        return;
    }
    
    // Update global thread
    window.currentThread = [...messages];
    
    // Render messages in the UI - use our own function if the global one isn't available
    if (typeof window.renderMessages === 'function') {
        window.renderMessages();
    } else {
        // Fallback to our own rendering logic
        renderMessagesInternal();
    }
}

// Internal function to render messages in the chat UI
function renderMessagesInternal() {
    console.log('Rendering messages internally');
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) {
        console.error('Messages container not found');
        return;
    }
    
    // Clear existing messages
    messagesContainer.innerHTML = '';
    
    // Render each message
    window.currentThread.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.role}-message`;
        
        // Format message content
        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        contentEl.innerHTML = message.content.replace(/\n/g, '<br>');
        
        // Add role label
        const roleEl = document.createElement('div');
        roleEl.className = 'message-role';
        roleEl.textContent = message.role === 'user' ? 'You' : 'AI';
        
        // Assemble message
        messageEl.appendChild(roleEl);
        messageEl.appendChild(contentEl);
        messagesContainer.appendChild(messageEl);
    });
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Make renderMessages available globally
window.renderMessages = function() {
    // Check if the original function exists in window scope
    if (typeof renderMessages === 'function' && renderMessages !== window.renderMessages) {
        renderMessages();
    } else {
        // Use our internal function
        renderMessagesInternal();
    }
};

// Handle when a new message is added to the chat
function handleNewMessage(message) {
    // If conversationManager is available, add message to current conversation
    if (window.conversationManager) {
        window.conversationManager.addMessage(message);
    }
}
