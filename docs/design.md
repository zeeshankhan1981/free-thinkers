# UI Design Guidelines

## Streamlined Layout

The UI has been streamlined with a modern, clean design that focuses on usability and efficiency:

1. **Header**
   - Fixed height of 65px
   - Clean, minimal design with essential controls
   - Smooth transitions for dark mode toggle

2. **Input Section**
   - Redesigned model selection and controls
   - Integrated response speed control
   - Enhanced prompt guide with toggle functionality
   - Improved image upload interface

3. **Message Display**
   - Enhanced message bubbles with better spacing and transitions
   - Improved context summary display
   - Better visual hierarchy for user and assistant messages

4. **Token Statistics**
   - Consolidated usage statistics panel
   - Detailed token usage breakdown
   - Context token tracking
   - Visual warnings for high usage

5. **Color Scheme**
   - Consistent use of CSS variables
   - Improved dark mode support
   - Better contrast for readability

6. **Interactive Elements**
   - Enhanced button styles with proper hover states
   - Improved form control styling
   - Better focus states for accessibility

7. **Layout Improvements**
   - Better responsive design
   - Improved spacing and alignment
   - Enhanced mobile support

8. **Component Organization**
   - Separated CSS into logical files:
     - `base-styles.css`: Global variables and base styles
     - `layout-styles.css`: Container and layout styles
     - `components-styles.css`: UI component styles
     - `streamlined.css`: Additional styling enhancements

## Todoist-Inspired UI

To transform the web app UI to be inspired by Todoist, implement these specific changes:

1. **Primary Color Change**:
   - Change from blue (`#007bff`) to Todoist red (`#e44232`)

2. **Background & Borders**:
   - Use clean white background (`#ffffff`) 
   - Implement subtle gray borders (`#f5f5f5`)

3. **Message Bubbles**:
   - Redesign to look like task items
   - Add checkmarks for completed messages

4. **Interactive Elements**:
   - Add subtle hover effects on all interactive elements

5. **Spacing**:
   - Implement Todoist-style spacing
   - Use 16px as base spacing
   - Use 24px between sections

6. **Typography**:
   - Use Todoist font stack: `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, system-ui`

7. **Shadows**:
   - Replace current shadow styles with Todoist subtle shadows
   - Use `0 1px 3px rgba(0,0,0,0.1)` for subtle elevation

8. **Layout**:
   - Add a sidebar layout option similar to Todoist
   - Place model selection on the left side

9. **Functionality**:
   - Keep all existing functionality intact
   - Ensure CSS changes don't break any interactive elements

## Implementation

To implement these changes, modify the CSS variables and styles in the HTML template:

```bash
OLLAMA_HOST=127.0.0.1 ollama run claude-sonnet:latest "Transform the web app UI to be inspired by Todoist with these specific changes: 
1. Change the primary color from blue (#007bff) to Todoist red (#e44232)
2. Use clean white background (#ffffff) with subtle gray borders (#f5f5f5)
3. Redesign message bubbles to look like task items with checkmarks for completed messages
4. Add subtle hover effects on interactive elements
5. Implement Todoist-style spacing with 16px base and 24px between sections
6. Use Todoist font stack: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, system-ui
7. Replace current shadow styles with Todoist subtle shadows: 0 1px 3px rgba(0,0,0,0.1)
8. Add a sidebar layout option like Todoist with model selection on the left
9. Keep all existing functionality intact
Make these changes to the CSS variables and styles in the HTML template."
```

Run the above command to have Claude Sonnet generate the necessary CSS modifications to achieve the Todoist-inspired look.

## Implementation Details

### CSS Organization
```css
/* Base styles and variables */
:root {
    --primary-color: #e44232;
    --primary-hover: #c2362c;
    --secondary-color: #6c757d;
    --border-radius: 8px;
    --spacing: 1rem;
    --transition: all 0.2s ease;
    --bg-color: #ffffff;
    --text-color: #333333;
    --border-color: #f5f5f5;
    --bg-light: #f8f9fa;
    --dark-bg-light: #2d2d2d;
    --dark-text: #f8f9fa;
}

/* Dark mode support */
.dark-mode {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --border-color: #333333;
    --bg-light: #2d2d2d;
    --dark-bg-light: #2d2d2d;
    --dark-text: #f8f9fa;
}
```

### Component Styles
```css
/* Message bubbles */
.message {
    max-width: 85%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    position: relative;
    animation: slideIn 0.3s ease;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

/* Token statistics */
.usage-stats-panel {
    margin-bottom: 1rem;
    background-color: var(--bg-light);
    border-radius: var(--border-radius);
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* Model controls */
.model-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
}

/* Responsive design */
@media (max-width: 768px) {
    .control-group {
        flex-direction: column;
        gap: 1rem;
    }
    
    .primary-controls,
    .secondary-controls {
        width: 100%;
        flex: none;
    }
}

/* Compact Prompt Guide */
.prompt-guide-compact {
    border-radius: var(--border-radius);
    transition: all 0.3s ease;
    margin-bottom: 1rem;
    width: 100%;
}

/* Usage Statistics Panel */
.usage-stats-panel {
    margin-bottom: 1rem;
    background-color: var(--bg-light);
    border-radius: var(--border-radius);
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* Message Input */
.input-group {
    margin-bottom: 1rem;
}

/* Image Preview */
.image-preview {
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    margin-bottom: 1rem;
    padding: 0.75rem;
}
```

### Dark Mode Enhancements

- Improved contrast ratios for better readability
- Better handling of hover and active states
- Enhanced visual hierarchy in dark mode
- Smooth transitions between light and dark modes
- Better color harmony across components

### Responsive Design

- Better mobile-first approach
- Improved breakpoint handling
- Better touch target sizes
- Enhanced spacing on smaller screens
- Improved form control layouts

## Authentication UI Design

### Login/Registration Flow
- Modal-based authentication interface
- Clean, minimal design with clear call-to-actions
- Responsive layout for all screen sizes
- Progress indicators for OAuth flows

### Profile Management
- Accessible profile settings panel
- Clear visual hierarchy for user information
- Intuitive preference management
- Secure password change interface

### Session Management
- Clear session status indicators
- Easy logout functionality
- "Remember me" option with clear explanation
- Session timeout notifications

### Security Indicators
- Visual indicators for secure connections
- Clear OAuth provider branding
- Security status badges
- Session activity indicators

## Conversation Management Integration

### Functionality Integration Command

The command below focuses solely on properly integrating the conversation management feature with your application:

```bash
OLLAMA_HOST=127.0.0.1 ollama run claude-sonnet:latest "Properly integrate the conversation management system with the main application, focusing solely on functionality and integration (not design). Implement these specific changes:

1. Fix integration with the main chat interface:
   - Update conversation_manager.js to fully connect with the existing chat system
   - Ensure user/assistant messages are correctly added to the active conversation
   - Implement proper conversation switching with state preservation

2. Create seamless state synchronization:
   - Connect with both localStorage and server-side API-based history
   - Implement proper loading of conversations from server history API
   - Ensure conversation state persists across page reloads
   - Fix transitions between conversations to maintain proper continuity

3. Fix current implementation issues:
   - Ensure the sidebar toggle works correctly
   - Fix the conversation export/import functionality for both JSON and Markdown
   - Fix the search functionality to properly filter conversations
   - Add proper error handling for failed operations
   - Ensure categories are properly managed and conversations are correctly organized

4. Improve UI behavior:
   - Fix any UI glitches or layout issues in the current implementation
   - Ensure all buttons and controls function as expected
   - Fix z-index issues with the conversation sidebar
   - Ensure mobile responsiveness works properly

Use proper JavaScript modules, maintain clean separation of concerns, and ensure the code follows best practices for maintainability."
```

### UI/UX Seamlessness Improvement Command

To enhance the UI/UX seamlessness of your conversation management system, use this command:

```bash
OLLAMA_HOST=127.0.0.1 ollama run claude-sonnet:latest "Uncaught TypeError: window.conversationManager.getAllConversations is not a function
    loadConversations http://127.0.0.1:58659/static/js/main.js:282
    initConversationManager http://127.0.0.1:58659/static/js/main.js:90
    <anonymous> http://127.0.0.1:58659/static/js/main.js:72
main.js:282:54
    loadConversations http://127.0.0.1:58659/static/js/main.js:282
    initConversationManager http://127.0.0.1:58659/static/js/main.js:90
    <anonymous> http://127.0.0.1:58659/static/js/main.js:72
    "
```

This command focuses on enhancing the UI/UX seamlessness of your conversation management system, making it feel more integrated, intuitive, and polished for users.