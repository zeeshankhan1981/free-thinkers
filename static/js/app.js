// Core application functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application core...');
    
    // DOM elements with fallbacks for both naming conventions
    const chatContainer = document.getElementById('chat-container') || document.getElementById('chatContainer');
    const chatMessages = document.getElementById('chat-messages') || document.getElementById('chatMessages');
    const messageInput = document.getElementById('message-input') || document.getElementById('messageInput');
    const sendMessage = document.getElementById('send-message') || document.getElementById('sendMessage');
    const cancelResponse = document.getElementById('cancel-response') || document.getElementById('cancelResponse');
    const loadingIndicator = document.getElementById('loading-indicator') || document.getElementById('loadingIndicator');
    const clearMessages = document.getElementById('clear-messages') || document.getElementById('clearMessages');
    const modelSelect = document.getElementById('model-select') || document.getElementById('modelSelect');
    const parameterControlsBtn = document.getElementById('parameter-controls-btn') || document.getElementById('parameterControlsBtn');
    const conversationManagerBtn = document.getElementById('conversation-manager-btn') || document.getElementById('conversationManagerBtn');
    const modelManagementBtn = document.getElementById('model-management-btn') || document.getElementById('modelManagementBtn');
    const darkModeToggle = document.getElementById('dark-mode-toggle') || document.getElementById('darkModeToggle');
    const loginButton = document.getElementById('auth-button') || document.getElementById('authButton');
    
    // Template elements with fallbacks
    const templateSelector = document.getElementById('template-selector');
    const promptGuide = document.getElementById('prompt-guide') || document.getElementById('promptGuide');
    const promptGuideCollapse = document.getElementById('prompt-guide-collapse') || document.getElementById('promptGuideCollapse');
    const promptGuideTitle = document.getElementById('prompt-guide-title') || document.getElementById('promptGuideTitle');
    const promptGuideUseCase = document.getElementById('prompt-guide-use-case') || document.getElementById('promptGuideUseCase');
    const promptGuideExample = document.getElementById('prompt-guide-example') || document.getElementById('promptGuideExample');
    const promptGuideTip = document.getElementById('prompt-guide-tip') || document.getElementById('promptGuideTip');
    const togglePromptGuideBtn = document.getElementById('toggle-prompt-guide') || document.getElementById('togglePromptGuide');
    const useExamplePromptBtn = document.getElementById('use-example-prompt') || document.getElementById('useExamplePrompt');
    
    // Image upload elements with fallbacks
    const imageUploadContainer = document.getElementById('image-upload-container') || document.getElementById('imageUploadContainer');
    const imageUploadInput = document.getElementById('image-upload-input') || document.getElementById('imageUploadInput');
    const toggleImageUpload = document.getElementById('toggle-image-upload') || document.getElementById('toggleImageUpload');
    const selectImageBtn = document.getElementById('select-image-btn') || document.getElementById('selectImageBtn');
    const removeImageBtn = document.getElementById('remove-image-btn') || document.getElementById('removeImageBtn');
    const imagePreview = document.getElementById('image-preview') || document.getElementById('imagePreview');
    const previewImg = document.getElementById('preview-img') || document.getElementById('previewImg');
    const imageFileName = document.getElementById('image-file-name') || document.getElementById('imageFileName');
    const imageFileSize = document.getElementById('image-file-size') || document.getElementById('imageFileSize');
    const closeImageUpload = document.getElementById('close-image-upload') || document.getElementById('closeImageUpload');
    
    // Sidebars
    const parameterControlsSidebar = document.getElementById('parameter-controls-sidebar') || document.getElementById('parameterControlsSidebar');
    const conversationManagerSidebar = document.getElementById('conversation-manager-sidebar') || document.getElementById('conversationManagerSidebar');
    const modelManagementSidebar = document.getElementById('model-management-sidebar') || document.getElementById('modelManagementSidebar');
    
    // Direct event handlers for navigation buttons as a fallback
    if (parameterControlsBtn) {
        console.log("Setting up direct parameter controls button handler");
        parameterControlsBtn.addEventListener('click', function() {
            // Close all other sidebars first
            if (conversationManagerSidebar) conversationManagerSidebar.classList.remove('active');
            if (modelManagementSidebar) modelManagementSidebar.classList.remove('active');
            
            // Toggle this sidebar
            if (parameterControlsSidebar) {
                parameterControlsSidebar.classList.toggle('active');
                console.log("Toggled parameter controls sidebar");
            } else {
                console.error("Parameter controls sidebar not found");
            }
        });
    }
    
    if (modelManagementBtn) {
        console.log("Setting up direct model management button handler");
        modelManagementBtn.addEventListener('click', function() {
            // Close all other sidebars first
            if (parameterControlsSidebar) parameterControlsSidebar.classList.remove('active');
            if (conversationManagerSidebar) conversationManagerSidebar.classList.remove('active');
            
            // Toggle this sidebar
            if (modelManagementSidebar) {
                modelManagementSidebar.classList.toggle('active');
                console.log("Toggled model management sidebar");
            } else {
                console.error("Model management sidebar not found");
            }
        });
    }
    
    if (conversationManagerBtn) {
        console.log("Setting up direct conversation manager button handler");
        conversationManagerBtn.addEventListener('click', function() {
            // Close all other sidebars first
            if (parameterControlsSidebar) parameterControlsSidebar.classList.remove('active');
            if (modelManagementSidebar) modelManagementSidebar.classList.remove('active');
            
            // Toggle this sidebar
            if (conversationManagerSidebar) {
                conversationManagerSidebar.classList.toggle('active');
                console.log("Toggled conversation manager sidebar");
            } else {
                console.error("Conversation manager sidebar not found");
            }
        });
    }
    
    // Global variables
    let isDarkMode = false;
    let currentModel = modelSelect ? modelSelect.value : 'llama3.2';
    let promptGuides = {};
    let isImageMode = false;
    let currentImageFile = null;
    let isStreaming = false;
    let responseController = null;
    
    // Initialize default parameters if not already set
    if (typeof window.currentParameters === 'undefined') {
        window.currentParameters = {
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            context_window: 0.8,
            max_tokens: 1024
        };
    }
    
    // Initialize currentThread if not already set
    if (typeof window.currentThread === 'undefined') {
        window.currentThread = [];
    }
    
    // Log initialization
    console.log('App initialized with model:', currentModel);
    console.log('Current parameters:', window.currentParameters);
    
    // Handle login button click
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            window.location.href = '/login';
        });
    }
    
    // Prompt guide toggle
    if (togglePromptGuideBtn && promptGuideCollapse) {
        togglePromptGuideBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const isExpanded = promptGuideCollapse.classList.contains('show');
            
            if (isExpanded) {
                promptGuideCollapse.classList.remove('show');
                togglePromptGuideBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            } else {
                promptGuideCollapse.classList.add('show');
                togglePromptGuideBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            }
        });
    }
    
    // Fetch prompt guides for all models
    async function loadPromptGuides() {
        try {
            console.log('Loading prompt guides...');
            const response = await fetch('/api/prompt_guides');
            if (!response.ok) {
                throw new Error(`Failed to load prompt guides: ${response.status}`);
            }
            
            promptGuides = await response.json();
            console.log('Fetched prompt guides:', promptGuides);
            
            // Apply guide for current model
            const modelSelect = document.getElementById('model-select') || document.getElementById('modelSelect');
            if (modelSelect) {
                updatePromptGuide(modelSelect.value);
            } else {
                console.warn('Model select element not found when loading guides');
                updatePromptGuide('llama3.1'); // Fallback to a default model
            }
        } catch (error) {
            console.error('Error loading prompt guides:', error);
            // Set up a default guide as fallback
            promptGuides = {
                'default': {
                    title: 'General Queries',
                    useCases: 'Ask questions about virtually any topic.',
                    examples: 'What are the key principles of quantum mechanics?',
                    tips: 'Be specific and provide context for more accurate answers.'
                }
            };
            updatePromptGuide('default');
        }
    }
    
    // Update the prompt guide UI based on the selected model
    function updatePromptGuide(modelName) {
        console.log('Updating prompt guide for model:', modelName);
        
        // Get the guide elements
        const promptGuideElement = document.getElementById('prompt-guide');
        const promptGuideTitle = document.getElementById('prompt-guide-title');
        const promptGuideUseCase = document.getElementById('prompt-guide-use-case');
        const promptGuideExample = document.getElementById('prompt-guide-example');
        const promptGuideTip = document.getElementById('prompt-guide-tip');
        
        if (!promptGuideElement || !promptGuideTitle || !promptGuideUseCase || !promptGuideExample || !promptGuideTip) {
            console.error('Could not find prompt guide elements');
            return;
        }
        
        // Get the guide data for the model
        const guide = promptGuides[modelName] || promptGuides['default'] || {
            title: 'General Guide',
            useCases: 'Use this AI for information, assistance, and creative tasks.',
            examples: 'Can you explain how photosynthesis works?',
            tips: 'Be clear and specific for better results.'
        };
        
        // Update the guide content
        promptGuideTitle.textContent = guide.title || 'AI Assistant';
        promptGuideUseCase.innerHTML = guide.useCases || '';
        promptGuideExample.textContent = guide.examples || '';
        promptGuideTip.innerHTML = guide.tips ? `<i class="fas fa-info-circle"></i> ${guide.tips}` : '';
        
        // Show the prompt guide
        promptGuideElement.style.display = 'block';
        
        // Set up the example button
        const useExampleBtn = document.getElementById('use-example-prompt');
        if (useExampleBtn && guide.examples) {
            useExampleBtn.addEventListener('click', function() {
                const messageInput = document.getElementById('message-input') || document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.value = guide.examples;
                    messageInput.focus();
                }
            });
        }
    }
    
    // Enhanced character and token counting for message input
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            const maxLength = parseInt(this.getAttribute('maxlength')) || 2048;
            const currentLength = this.value.length;
            
            // Get the counter elements with fallbacks
            const charCounter = document.getElementById('char-counter') || document.getElementById('charCounter');
            const tokenCounter = document.getElementById('token-counter') || document.getElementById('tokenCounter');
            const tokenBar = document.getElementById('token-bar') || document.getElementById('tokenBar');
            
            // Support for char count display with fallbacks
            const charCountDisplay = document.getElementById('char-count-display') || document.getElementById('charCountDisplay');
            const tokenCountDisplay = document.getElementById('token-count-display') || document.getElementById('tokenCountDisplay');
            const tokenBarFill = document.getElementById('token-bar-fill') || document.getElementById('tokenBarFill');
            
            // Update character counter if it exists
            if (charCounter) {
                charCounter.textContent = `${currentLength}/${maxLength}`;
            }
            
            // Update combined stats if they exist
            if (charCountDisplay) {
                charCountDisplay.textContent = `${currentLength}/${maxLength} chars`;
            }
            
            // Check if token visualization function exists and update
            if (typeof updateTokenVisualization === 'function') {
                updateTokenVisualization(this.value, currentModel);
            } else {
                // Simple fallback token estimation if the function doesn't exist
                const estimatedTokens = Math.max(1, Math.ceil(currentLength / 4));
                const maxTokens = 4096;
                const percentage = Math.min(100, Math.round((estimatedTokens / maxTokens) * 100));
                
                if (tokenCountDisplay) {
                    tokenCountDisplay.textContent = `${estimatedTokens}/${maxTokens} tokens (${percentage}%)`;
                }
                
                if (tokenBarFill) {
                    tokenBarFill.style.width = `${Math.max(0.1, percentage)}%`;
                    
                    // Color coding based on percentage
                    if (percentage > 90) {
                        tokenBarFill.className = 'usage-bar-fill bg-danger';
                    } else if (percentage > 70) {
                        tokenBarFill.className = 'usage-bar-fill bg-warning';
                    } else {
                        tokenBarFill.className = 'usage-bar-fill bg-success';
                    }
                }
            }
            
            // Set warning classes based on length
            if (currentLength > maxLength * 0.9) {
                if (charCounter) charCounter.classList.add('text-danger');
            } else if (currentLength > maxLength * 0.7) {
                if (charCounter) {
                    charCounter.classList.remove('text-danger');
                    charCounter.classList.add('text-warning');
                }
            } else {
                if (charCounter) {
                    charCounter.classList.remove('text-danger', 'text-warning');
                }
            }
            
            // Enable/disable send button based on content
            if (sendMessage) {
                if (currentLength > 0 && !isStreaming) {
                    sendMessage.disabled = false;
                } else {
                    sendMessage.disabled = true;
                }
            }
        });
        
        // Also trigger once on load to set initial state
        messageInput.dispatchEvent(new Event('input'));
        
        // Allow Enter to send, Shift+Enter for new line
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey && !sendMessage.disabled) {
                e.preventDefault();
                sendMessageToAI();
            }
        });
    }
    
    // Use example prompt button
    if (useExamplePromptBtn) {
        useExamplePromptBtn.addEventListener('click', function() {
            if (promptGuides && promptGuides[currentModel]) {
                const guide = promptGuides[currentModel];
                messageInput.value = guide.examples;
                messageInput.focus();
                messageInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // Image upload functionality
    function initImageUpload() {
        if (!toggleImageUpload || !imageUploadContainer) return;
        
        // Toggle image upload mode
        toggleImageUpload.addEventListener('click', function() {
            isImageMode = !isImageMode;
            if (isImageMode) {
                imageUploadContainer.style.display = 'block';
                toggleImageUpload.classList.add('active');
            } else {
                imageUploadContainer.style.display = 'none';
                toggleImageUpload.classList.remove('active');
                resetImageUpload();
            }
        });
        
        // Open file picker when select button is clicked
        if (selectImageBtn && imageUploadInput) {
            selectImageBtn.addEventListener('click', function() {
                imageUploadInput.click();
            });
        }
        
        // Handle file selection
        if (imageUploadInput) {
            imageUploadInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                // Check file type
                if (!file.type.match('image.*')) {
                    alert('Please select an image file.');
                    return;
                }
                
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image file size must be less than 5MB.');
                    return;
                }
                
                currentImageFile = file;
                
                // Display file information
                if (imageFileName) imageFileName.textContent = file.name;
                if (imageFileSize) imageFileSize.textContent = formatFileSize(file.size);
                
                // Preview image
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (previewImg) {
                        previewImg.src = e.target.result;
                        imagePreview.style.display = 'block';
                        removeImageBtn.style.display = 'inline-block';
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Remove selected image
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', function() {
                resetImageUpload();
            });
        }
        
        // Close image upload panel
        if (closeImageUpload) {
            closeImageUpload.addEventListener('click', function() {
                isImageMode = false;
                imageUploadContainer.style.display = 'none';
                toggleImageUpload.classList.remove('active');
                resetImageUpload();
            });
        }
    }
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    // Reset image upload state
    function resetImageUpload() {
        if (imageUploadInput) imageUploadInput.value = '';
        currentImageFile = null;
        if (imagePreview) imagePreview.style.display = 'none';
        if (removeImageBtn) removeImageBtn.style.display = 'none';
        if (previewImg) previewImg.src = '';
    }
    
    // Make resetImageUpload available globally
    window.resetImageUpload = resetImageUpload;
    
    // Function to convert file to base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Simplified sendMessageToAI function with fixed API communication
    function sendMessageToAI() {
        console.log('sendMessageToAI called directly');
        
        // Get the message input element
        const messageInput = document.getElementById('message-input') || document.getElementById('messageInput');
        if (!messageInput) {
            console.error('Message input element not found');
            return;
        }
        
        // Get the message text
        const userInput = messageInput.value.trim();
        if (!userInput) {
            console.log('Empty message, ignoring');
            return;
        }
        
        // Initialize thread if it doesn't exist
        if (!window.currentThread) {
            window.currentThread = [];
        }
        
        // Add to conversation thread
        window.currentThread.push({
            role: 'user',
            content: userInput
        });
        
        console.log('Sending message:', userInput);
        
        // Add user message to chat
        addMessageToUI('user', userInput);
        
        // Clear input field
        messageInput.value = '';
        
        // Show loading state
        const loadingIndicator = document.getElementById('loading-indicator') || document.getElementById('loadingIndicator');
        if (loadingIndicator) loadingIndicator.style.display = 'flex';
        
        const sendButton = document.getElementById('send-message') || document.getElementById('sendMessage');
        if (sendButton) sendButton.style.display = 'none';
        
        const cancelButton = document.getElementById('cancel-response') || document.getElementById('cancelResponse');
        if (cancelButton) cancelButton.style.display = 'inline-block';
        
        // Get current model
        const modelSelect = document.getElementById('model-select') || document.getElementById('modelSelect');
        const currentModel = modelSelect ? modelSelect.value : 'llama3.1';
        
        // Get parameters (or use defaults)
        const parameters = window.currentParameters || {
            temperature: 0.7,
            top_p: 0.95,
            top_k: 40,
            max_tokens: 1024
        };
        
        // Prepare request data matching what the Flask backend expects
        const requestData = {
            model: currentModel,
            messages: window.currentThread,
            parameters: parameters
        };
        
        console.log('Request payload:', requestData);
        
        // Send to server
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            
            // Create assistant message placeholder
            const assistantMessageId = addMessageToUI('assistant', '', true);
            console.log('Created assistant message with ID:', assistantMessageId);
            
            // Set up event source for SSE
            const eventSource = new EventSource('/api/chat');
            let assistantResponse = '';
            
            eventSource.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    console.log('SSE received:', data);
                    
                    if (data.done) {
                        console.log('Stream complete');
                        eventSource.close();
                        
                        // Add to conversation thread
                        window.currentThread.push({
                            role: 'assistant',
                            content: assistantResponse
                        });
                        
                        // Complete response
                        completeAssistantResponse(assistantResponse, assistantMessageId);
                        return;
                    }
                    
                    if (data.error) {
                        console.error('Error from API:', data.error);
                        eventSource.close();
                        updateLastAssistantMessage(assistantMessageId, 'Error: ' + data.error);
                        resetUIAfterResponse();
                        return;
                    }
                    
                    // Append content
                    if (data.response) {
                        assistantResponse += data.response;
                    } else if (data.content) {
                        assistantResponse += data.content;
                    }
                    
                    // Update the assistant message with the current response
                    updateLastAssistantMessage(assistantResponse);
                    
                } catch (error) {
                    console.error('Error parsing SSE message:', error, event.data);
                    
                    // Try to handle non-JSON responses
                    if (typeof event.data === 'string') {
                        assistantResponse += event.data;
                        updateLastAssistantMessage(assistantResponse);
                    }
                }
            };
            
            eventSource.onerror = function(error) {
                console.error('SSE Error:', error);
                eventSource.close();
                
                if (assistantResponse) {
                    // We received some content before the error
                    updateLastAssistantMessage(assistantResponse);
                    
                    // Add to conversation thread
                    window.currentThread.push({
                        role: 'assistant',
                        content: assistantResponse
                    });
                } else {
                    updateLastAssistantMessage('Error: Connection lost. Please try again.');
                }
                
                resetUIAfterResponse();
            };
            
            window.cancelCurrentResponse = function() {
                console.log('Cancelling response');
                eventSource.close();
                
                if (assistantResponse) {
                    // Add to conversation thread with [cancelled] note
                    window.currentThread.push({
                        role: 'assistant',
                        content: assistantResponse + ' [cancelled]'
                    });
                }
                
                completeAssistantResponse(assistantResponse);
            };
        })
        .catch(error => {
            console.error('Error sending message:', error);
            addMessageToUI('assistant', `Error: ${error.message}`);
            resetUIAfterResponse();
        });
    }
    
    // Function to add a message to the UI
    function addMessageToUI(role, content, isStreaming = false) {
        console.log(`Adding ${role} message to UI, streaming: ${isStreaming}`);
        const chatMessages = document.getElementById('chat-messages') || document.getElementById('chatMessages');
        if (!chatMessages) {
            console.error('Chat messages container not found');
            return null;
        }
        
        // Create message element
        const message = document.createElement('div');
        message.className = `message ${role}-message`;
        
        // For assistant messages that are streaming, add a unique ID so we can update it later
        if (role === 'assistant') {
            if (isStreaming) {
                message.id = 'assistant-message-' + Date.now();
                window.lastAssistantMessageId = message.id;
                console.log('Created assistant message with ID:', message.id);
            }
        }
        
        // Add content
        let html = '';
        if (role === 'user') {
            html = `<div class="message-content user-content">${content}</div>`;
        } else if (role === 'assistant') {
            if (isStreaming) {
                html = `<div class="message-content assistant-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
            } else {
                html = `<div class="message-content assistant-content">${content}</div>`;
            }
        } else if (role === 'system') {
            html = `<div class="message-content system-content">${content}</div>`;
        }
        
        message.innerHTML = html;
        chatMessages.appendChild(message);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return message.id || null;
    }
    
    // Function to update the last assistant message as we receive streaming content
    function updateLastAssistantMessage(content) {
        // Get all assistant messages
        const assistantMessages = document.querySelectorAll('.assistant-message');
        if (assistantMessages.length === 0) {
            console.error('No assistant messages found');
            return;
        }
        
        // Get the last assistant message
        const lastMessage = assistantMessages[assistantMessages.length - 1];
        if (!lastMessage) {
            console.error('Last assistant message not found');
            return;
        }
        
        const contentElement = lastMessage.querySelector('.message-content');
        if (contentElement) {
            // Try to use marked for Markdown if available
            try {
                if (typeof marked !== 'undefined') {
                    contentElement.innerHTML = marked.parse(content);
                } else {
                    contentElement.innerHTML = content;
                }
            } catch (error) {
                console.error('Error rendering markdown:', error);
                contentElement.innerHTML = content;
            }
            
            // Scroll to bottom
            const chatMessages = document.getElementById('chat-messages') || document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } else {
            console.error('Message content element not found');
        }
    }
    
    // Function to complete the assistant response
    function completeAssistantResponse(finalContent, messageId) {
        console.log('Completing assistant response');
        
        // Update the message one last time
        if (finalContent) {
            updateLastAssistantMessage(finalContent);
        }
        
        // Reset UI
        resetUIAfterResponse();
    }
    
    // Reset UI after response
    function resetUIAfterResponse() {
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loading-indicator') || document.getElementById('loadingIndicator');
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        
        // Show send button
        const sendButton = document.getElementById('send-message') || document.getElementById('sendMessage');
        if (sendButton) sendButton.style.display = 'inline-block';
        
        // Hide cancel button
        const cancelButton = document.getElementById('cancel-response') || document.getElementById('cancelResponse');
        if (cancelButton) cancelButton.style.display = 'none';
        
        // Clear window.lastAssistantMessageId
        window.lastAssistantMessageId = null;
        
        // Re-enable input
        const messageInput = document.getElementById('message-input') || document.getElementById('messageInput');
        if (messageInput) {
            messageInput.disabled = false;
            messageInput.focus();
        }
    }
    
    // Handle send message
    if (sendMessage) {
        sendMessage.addEventListener('click', sendMessageToAI);
    }
    
    // Add cancel response functionality
    if (cancelResponse) {
        cancelResponse.addEventListener('click', function() {
            if (responseController) {
                console.log('Aborting response');
                responseController.abort();
                responseController = null;
            }
            
            cancelResponse.style.display = 'none';
            isStreaming = false;
            
            // Re-enable input
            messageInput.disabled = false;
            sendMessage.disabled = false;
        });
    }
    
    // Add clear messages functionality
    if (clearMessages) {
        clearMessages.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all messages?')) {
                chatMessages.innerHTML = '';
                window.currentThread = [];
            }
        });
    }
    
    // Update the model when dropdown changes
    if (modelSelect) {
        modelSelect.addEventListener('change', function() {
            currentModel = this.value;
            console.log('Model changed to:', currentModel);
            updatePromptGuide(currentModel);
            
            // Update image upload button visibility
            if (toggleImageUpload) {
                toggleImageUpload.style.display = currentModel.includes('llava') ? 'block' : 'none';
            }
        });
        
        // Initial setup based on selected model
        if (modelSelect.value) {
            currentModel = modelSelect.value;
            console.log('Initial model set to:', currentModel);
            
            // Update image upload button visibility
            if (toggleImageUpload) {
                toggleImageUpload.style.display = currentModel.includes('llava') ? 'block' : 'none';
            }
        }
    }
    
    // Initialize
    initImageUpload();
    loadPromptGuides();
    
    // Make functions available globally
    window.updatePromptGuide = updatePromptGuide;
    window.sendMessageToAI = sendMessageToAI;
    window.addMessageToUI = addMessageToUI;
    window.updateLastAssistantMessage = updateLastAssistantMessage;
    
    console.log('Application core initialized successfully');
});

// Send message button handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up message send handlers');

    // Get message elements with fallbacks
    const messageInput = document.getElementById('message-input') || document.getElementById('messageInput');
    const sendButton = document.getElementById('send-message') || document.getElementById('sendMessage');
    const cancelButton = document.getElementById('cancel-response') || document.getElementById('cancelResponse');

    // Add direct click handler for send button
    if (sendButton) {
        console.log('Adding direct click handler to send button');
        sendButton.addEventListener('click', function() {
            console.log('Send button clicked directly');
            sendMessageToAI();
        });
    } else {
        console.error('Send button not found');
    }

    // Add enter key handler for message input
    if (messageInput) {
        console.log('Adding keypress handler to message input');
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('Enter pressed in message input');
                sendMessageToAI();
            }
        });
    } else {
        console.error('Message input not found');
    }

    // Add cancel button handler
    if (cancelButton) {
        console.log('Adding click handler to cancel button');
        cancelButton.addEventListener('click', function() {
            console.log('Cancel button clicked');
            cancelCurrentResponse();
        });
    }
});

// Helper function to add a message to the chat
function addMessageToChat(role, content, isStreaming = false) {
    const chatMessages = document.getElementById('chat-messages') || document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return null;
    }
    
    // Create message element
    const messageId = 'msg-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.id = messageId;
    
    // Add content
    let html = '';
    if (role === 'user') {
        html = `<div class="message-content user-content">${content}</div>`;
    } else if (role === 'assistant') {
        html = `<div class="message-content assistant-content">${content || (isStreaming ? '<div class="typing-indicator"><span></span><span></span><span></span></div>' : '')}</div>`;
    } else {
        html = `<div class="message-content system-content">${content}</div>`;
    }
    
    messageDiv.innerHTML = html;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageId;
}

// Update a message by ID
function updateMessage(messageId, content) {
    if (!messageId) {
        console.error('Message ID is undefined');
        return;
    }
    
    const messageElement = document.getElementById(messageId);
    if (!messageElement) {
        console.error('Message element not found:', messageId);
        return;
    }
    
    const contentElement = messageElement.querySelector('.message-content');
    if (contentElement) {
        // Convert markdown to HTML if marked is available
        if (typeof marked !== 'undefined') {
            try {
                const markdown = marked.parse(content);
                contentElement.innerHTML = markdown;
            } catch (error) {
                console.error('Error parsing markdown:', error);
                contentElement.innerHTML = content;
            }
        } else {
            contentElement.innerHTML = content;
        }
        
        // Scroll to bottom
        const chatMessages = document.getElementById('chat-messages') || document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

// Complete the response
function completeResponse(finalContent, messageId) {
    // Update final message
    updateMessage(messageId, finalContent);
    
    // Reset UI
    resetUI();
}

// Reset UI after response
function resetUIAfterResponse() {
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loading-indicator') || document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    
    // Show send button
    const sendButton = document.getElementById('send-message') || document.getElementById('sendMessage');
    if (sendButton) sendButton.style.display = 'inline-block';
    
    // Hide cancel button
    const cancelButton = document.getElementById('cancel-response') || document.getElementById('cancelResponse');
    if (cancelButton) cancelButton.style.display = 'none';
    
    // Re-enable input
    const messageInput = document.getElementById('message-input') || document.getElementById('messageInput');
    if (messageInput) {
        messageInput.disabled = false;
        messageInput.focus();
    }
}

// Reset UI after response
function resetUI() {
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loading-indicator') || document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    
    // Show send button
    const sendButton = document.getElementById('send-message') || document.getElementById('sendMessage');
    if (sendButton) sendButton.style.display = 'inline-block';
    
    // Hide cancel button
    const cancelButton = document.getElementById('cancel-response') || document.getElementById('cancelResponse');
    if (cancelButton) cancelButton.style.display = 'none';
    
    // Re-enable input
    const messageInput = document.getElementById('message-input') || document.getElementById('messageInput');
    if (messageInput) {
        messageInput.disabled = false;
        messageInput.focus();
    }
}

// Function to update token visualization
window.updateTokenVisualization = function(text, model) {
    if (!text) text = '';
    if (!model) model = currentModel || 'llama3.2';
    
    // Get elements with fallbacks
    const charCountDisplay = document.getElementById('char-count-display') || document.getElementById('charCountDisplay');
    const tokenCountDisplay = document.getElementById('token-count-display') || document.getElementById('tokenCountDisplay');
    const tokenBarFill = document.getElementById('token-bar-fill') || document.getElementById('tokenBarFill');
    const contextStats = document.getElementById('context-stats') || document.getElementById('contextStats');
    const inputTokens = document.getElementById('input-tokens') || document.getElementById('inputTokens');
    const contextTokens = document.getElementById('context-tokens') || document.getElementById('contextTokens');
    const maxTokens = document.getElementById('max-tokens') || document.getElementById('maxTokens');
    const totalUsage = document.getElementById('total-usage') || document.getElementById('totalUsage');
    const detailedStats = document.getElementById('detailed-stats') || document.getElementById('detailedStats');
    
    // Estimate tokens based on character count
    const charCount = text.length;
    const maxLen = window.currentParameters?.max_tokens || 2048;
    
    // Send request to backend for token counting
    fetch('/api/token_count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Token count response:', data);
        const { token_count, max_tokens, percentage } = data;
        
        // Update char count display
        if (charCountDisplay) {
            charCountDisplay.textContent = `${charCount}/2048 chars`;
        }
        
        // Update token count display
        if (tokenCountDisplay) {
            tokenCountDisplay.textContent = `${token_count}/${max_tokens} tokens (${Math.round(percentage)}%)`;
        }
        
        // Update token bar
        if (tokenBarFill) {
            tokenBarFill.style.width = `${Math.max(0.1, percentage)}%`;
            
            // Color coding based on percentage
            if (percentage > 90) {
                tokenBarFill.className = 'usage-bar-fill bg-danger';
            } else if (percentage > 70) {
                tokenBarFill.className = 'usage-bar-fill bg-warning';
            } else {
                tokenBarFill.className = 'usage-bar-fill bg-success';
            }
        }
        
        // Update detailed stats
        if (contextStats) {
            // Estimate context tokens (this is a simplification)
            const contextTokenCount = window.currentThread ? 
                window.currentThread.reduce((sum, msg) => sum + (msg.content.length / 4), 0) : 0;
            contextStats.textContent = `Context: ${Math.round(contextTokenCount)}/${max_tokens} tokens (${Math.round((contextTokenCount/max_tokens)*100)}%)`;
        }
        
        // Update input tokens
        if (inputTokens) inputTokens.textContent = token_count;
        
        // Update context tokens
        if (contextTokens) {
            const ctx = window.currentThread ? 
                window.currentThread.reduce((sum, msg) => sum + (msg.content.length / 4), 0) : 0;
            contextTokens.textContent = Math.round(ctx);
        }
        
        // Update max tokens
        if (maxTokens) maxTokens.textContent = max_tokens;
        
        // Update total usage
        if (totalUsage) {
            const total = token_count + (window.currentThread ? 
                window.currentThread.reduce((sum, msg) => sum + (msg.content.length / 4), 0) : 0);
            totalUsage.textContent = `${Math.round((total/max_tokens)*100)}%`;
        }
    })
    .catch(error => {
        console.warn('Error getting token count:', error);
        // Fallback to estimating tokens
        const estimatedTokens = Math.max(1, Math.ceil(charCount / 4));
        const maxTokens = 4096;
        const percentage = Math.min(100, Math.round((estimatedTokens / maxTokens) * 100));
        
        if (tokenCountDisplay) {
            tokenCountDisplay.textContent = `~${estimatedTokens}/${maxTokens} tokens (${percentage}%)`;
        }
        
        if (tokenBarFill) {
            tokenBarFill.style.width = `${Math.max(0.1, percentage)}%`;
        }
    });
};
