/**
 * Free Thinkers - Conversation History Module
 * Handles saving, loading, and managing conversation history
 */

class HistoryManager {
    constructor() {
        // Use both naming conventions for backwards compatibility
        this.historySidebar = document.getElementById('history-sidebar') || document.getElementById('historySidebar');
        this.historyList = document.querySelector('.history-list') || document.getElementById('history-list') || document.getElementById('historyList');
        this.historyBtn = document.getElementById('history-btn') || document.getElementById('historyBtn');
        this.closeHistoryBtn = document.getElementById('close-history') || document.getElementById('closeHistory');
        this.clearHistoryBtn = document.getElementById('clear-history') || document.getElementById('clearHistoryBtn');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // History toggle button
        if (this.historyBtn) {
            console.log('Setting up history button click handler');
            this.historyBtn.addEventListener('click', () => {
                if (this.historySidebar) {
                    this.historySidebar.classList.toggle('active');
                } else {
                    console.error('History sidebar element not found');
                }
            });
        } else {
            console.error('History button not found');
        }
        
        // Close history button
        if (this.closeHistoryBtn) {
            this.closeHistoryBtn.addEventListener('click', () => {
                if (this.historySidebar) {
                    this.historySidebar.classList.remove('active');
                }
            });
        }
        
        // Clear history button
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all conversation history?')) {
                    localStorage.removeItem('chatHistory');
                    this.loadConversationHistory();
                }
            });
        }
    }
    
    saveToHistory(thread) {
        if (!thread || thread.length === 0) return;
        
        // Get existing history
        let history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        // Extract first user and assistant messages for preview
        const userMsg = thread.find(msg => msg.role === 'user');
        const assistantMsg = thread.find(msg => msg.role === 'assistant');
        
        // Create conversation entry
        const conversation = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            preview: {
                user: userMsg ? userMsg.content.substring(0, 60) + (userMsg.content.length > 60 ? '...' : '') : '',
                assistant: assistantMsg ? assistantMsg.content.substring(0, 60) + (assistantMsg.content.length > 60 ? '...' : '') : ''
            },
            thread: thread
        };
        
        // Add to history
        history.push(conversation);
        
        // Limit history size (keep last 50)
        if (history.length > 50) {
            history = history.slice(-50);
        }
        
        // Save to localStorage
        localStorage.setItem('chatHistory', JSON.stringify(history));
        
        // Update UI
        this.loadConversationHistory();
    }
    
    loadConversationHistory() {
        if (!this.historyList) return;
        
        // Clear existing items
        this.historyList.innerHTML = '';
        
        // Get history from localStorage
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        if (history.length === 0) {
            // Show empty state
            const emptyState = document.createElement('div');
            emptyState.className = 'history-empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-history"></i>
                <p>No conversation history yet</p>
                <p class="text-muted small">Your conversations will appear here</p>
            `;
            this.historyList.appendChild(emptyState);
            return;
        }
        
        // Sort by timestamp (newest first)
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Add history items
        history.forEach(conv => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.setAttribute('data-id', conv.id);
            
            // Format date
            const date = new Date(conv.timestamp);
            const dateStr = this.formatDate(date);
            
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span class="history-item-date">${dateStr}</span>
                    <button class="history-item-delete" title="Delete conversation">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="history-item-preview">${conv.preview.user || 'Empty conversation'}</div>
            `;
            
            // Add click handler to load conversation
            historyItem.addEventListener('click', (e) => {
                // Ignore if clicking delete button
                if (e.target.closest('.history-item-delete')) return;
                
                this.loadThread(conv.id);
            });
            
            // Add delete button handler
            const deleteBtn = historyItem.querySelector('.history-item-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteConversation(conv.id);
                });
            }
            
            this.historyList.appendChild(historyItem);
        });
    }
    
    loadThread(threadId) {
        // Get history from localStorage
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        // Find conversation by ID
        const conversation = history.find(conv => conv.id === threadId);
        if (!conversation) return;
        
        // Clear current thread and messages
        window.currentThread = [];
        document.getElementById('chatMessages').innerHTML = '';
        
        // Load thread
        window.currentThread = JSON.parse(JSON.stringify(conversation.thread));
        
        // Render messages
        if (typeof renderMessages === 'function') {
            renderMessages();
        }
        
        // Hide history sidebar
        if (this.historySidebar && this.historySidebar.classList.contains('active')) {
            if (typeof toggleSidebar === 'function') {
                toggleSidebar(this.historySidebar);
            } else {
                this.historySidebar.classList.remove('active');
            }
        }
    }
    
    deleteConversation(threadId) {
        if (!confirm('Delete this conversation?')) return;
        
        // Get history from localStorage
        let history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        
        // Remove conversation
        history = history.filter(conv => conv.id !== threadId);
        
        // Save updated history
        localStorage.setItem('chatHistory', JSON.stringify(history));
        
        // Update UI
        this.loadConversationHistory();
    }
    
    formatDate(date) {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if today
        if (date.toDateString() === now.toDateString()) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Check if yesterday
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Otherwise, show full date
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
               `, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
}

// Initialize history manager
const historyManager = new HistoryManager();

// Export to global scope
window.saveToHistory = (thread) => historyManager.saveToHistory(thread);
window.loadConversationHistory = () => historyManager.loadConversationHistory();
window.loadThread = (threadId) => historyManager.loadThread(threadId);
