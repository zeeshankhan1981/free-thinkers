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
OLLAMA_HOST=127.0.0.1 ollama run claude-sonnet:latest "Improve the UI/UX seamlessness of the conversation management system by implementing these specific enhancements:

1. Create a more integrated conversation experience:
   - Add visual transitions when switching between conversations (subtle fade or slide)
   - Implement an 'untitled conversation' state for new chats before the first message
   - Add visual indicators for unsaved changes in the current conversation
   - Create a visual connection between the sidebar and main chat when a conversation is active

2. Improve conversation management UX:
   - Add inline editing of conversation titles (click to edit without modal)
   - Implement conversation pinning to keep important chats at the top
   - Add drag-and-drop reordering of conversations in the list
   - Create a more intuitive organization system for conversations with collapsible categories
   - Implement a more seamless search experience with instant results and highlighting

3. Add helpful empty states and user guidance:
   - Design informative empty states for the conversation list
   - Add tooltips for key actions to guide new users
   - Create subtle animations for state changes (loading, saving, etc.)
   - Implement a 'What's New' indicator for newly added conversations
   - Add contextual help for conversation management features

4. Enhance keyboard navigation and shortcuts:
   - Add keyboard shortcuts for common actions (new conversation, switching, etc.)
   - Implement arrow key navigation for the conversation list
   - Add Tab key support for moving between UI sections
   - Create a keyboard shortcut reference/help panel
   - Ensure all interactive elements are properly focusable

5. Implement smooth transitions and feedback:
   - Add loading states with skeleton screens instead of spinners
   - Implement optimistic UI updates (show changes before server confirms)
   - Add subtle animations for actions (saving, deleting, creating)
   - Create micro-interactions for common tasks (favoriting, etc.)
   - Implement a system-wide notification framework for actions

6. Ensure the experience feels native and integrated:
   - Make sure the sidebar behavior matches platform conventions
   - Implement proper scrolling behavior that feels natural
   - Add natural touch gestures for mobile users (swipe to delete, etc.)
   - Ensure consistent styling between conversation management and chat UI
   - Create smooth transitions between all states of the application

Implement these changes with clean, maintainable code using modern JavaScript practices. Focus on making the experience feel cohesive, intuitive, and polished."
```

This command focuses on enhancing the UI/UX seamlessness of your conversation management system, making it feel more integrated, intuitive, and polished for users.