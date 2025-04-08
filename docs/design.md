# UI Design Guidelines

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