/*=================================================================
 * Project: AIVA-WEB
 * File: AMBIGUITY_DIALOG_INTEGRATION.md
 * Author: AI Enhancement Module
 * Date Created: January 9, 2026
 *=================================================================
 * Description:
 * Guide for integrating the Ambiguity Dialog system
 *=================================================================*/

# Ambiguity Dialog Integration Guide

## Overview

The Ambiguity Dialog system prevents confusion when the AI assistant asks questions with multiple options. Instead of parsing ambiguous responses like "yes" or "no", it forces users to explicitly select from presented options.

## Architecture

### Frontend Components

1. **ConfirmationDialog.jsx** - Tailwind-styled modal with keyboard navigation
2. **ambiguityStateManager.js** - Client-side state management
3. **ambiguityDialogSlice.js** - Redux state for dialog
4. **Chatbot.jsx** - Integration point

### Backend Components

1. **conversationStateTracker.js** - Extended with ambiguity detection
2. **unifiedChatbotService.js** - Needs to return ambiguity triggers

## Backend Integration Example

In your `unifiedChatbotService.js` or `improvedGeminiService.js`, when detecting ambiguity:

```javascript
// Example: User says "create the task node in the my workspace 7434"
// But they're currently in "mohitrajsinh's Workspace"

import { startExplicitChoice } from './conversationStateTracker.js';

// When you detect an ambiguous scenario:
const result = {
  intent: 'create_task',
  reply: "I see you mentioned 'My Workspace 7434'. You're currently in 'mohitrajsinh's Workspace'. Where would you like to create this task?",
  requiresExplicitChoice: true,
  choiceData: {
    title: "Choose Workspace",
    question: "Where would you like to create the task 'node'?",
    intent: 'create_task',
    options: [
      {
        id: 'current_workspace',
        label: "Current Workspace (mohitrajsinh's Workspace)",
        description: "Create in the workspace you're currently viewing",
        icon: "📍",
        action: {
          method: 'POST',
          endpoint: '/api/tasks',
          body: {
            title: 'node',
            workspace: currentWorkspaceId
          }
        }
      },
      {
        id: 'my_workspace_7434',
        label: "My Workspace 7434",
        description: "Switch to and create in My Workspace 7434",
        icon: "🗂️",
        action: {
          method: 'POST',
          endpoint: '/api/tasks',
          body: {
            title: 'node',
            workspace: 'workspace-id-7434'
          }
        }
      }
    ]
  }
};

// Save the state
await startExplicitChoice(userId, workspaceId, {
  question: result.choiceData.question,
  options: result.choiceData.options,
  originalIntent: 'create_task',
  contextData: { taskTitle: 'node' }
});

return result;
```

## Response Flow

### 1. Initial Request
```
User: "create the task node in the my workspace 7434"
```

### 2. Backend Response
```json
{
  "intent": "create_task",
  "reply": "Where would you like to create this task?",
  "requiresExplicitChoice": true,
  "choiceData": {
    "title": "Choose Workspace",
    "question": "Where would you like to create the task 'node'?",
    "options": [...]
  }
}
```

### 3. Dialog Opens
- Frontend detects `requiresExplicitChoice: true`
- Opens ConfirmationDialog with options
- Enters LOCKED state

### 4. User Types "yes"
- Chatbot detects locked state
- Rejects ambiguous input
- Shows: "I'm not sure which option you meant. Please select one explicitly."

### 5. User Clicks Option
- Selection processed
- Action executed
- State cleared
- Dialog closed

## Key Features

### 🔒 Locked State
When dialog is open, the conversation is LOCKED:
- Natural language input is blocked
- Only explicit selections accepted
- Prevents "yes/no" confusion

### ⌨️ Keyboard Navigation
- Arrow keys to navigate
- Enter to select
- Escape to cancel

### 🎨 Tailwind Styling
- Responsive design
- Dark mode support
- Smooth animations
- No external CSS needed

## Common Use Cases

### 1. Workspace Ambiguity
User mentions workspace different from current one.

### 2. Multiple Entities Match
"Delete the task" when there are multiple tasks with similar names.

### 3. Confirmation with Context
"Are you sure?" but with explicit "Yes, delete" vs "No, cancel" buttons.

### 4. Multi-step Wizards
Guide users through complex operations with explicit choices at each step.

## Testing the Integration

### Test Case 1: Basic Ambiguity
```
1. User in "Workspace A"
2. User says: "create task in workspace B"
3. Expected: Dialog appears with 2 options
4. User types: "yes"
5. Expected: Message "Please select one explicitly"
6. User clicks: "Workspace B"
7. Expected: Task created, dialog closes
```

### Test Case 2: Expired State
```
1. Dialog opens
2. Wait 10 minutes
3. User tries to select
4. Expected: "Question has expired. Please ask again."
```

## Backend Detection Patterns

```javascript
// Detect workspace ambiguity
const mentionedWorkspace = extractWorkspaceFromMessage(message);
const currentWorkspace = context.currentWorkspace;

if (mentionedWorkspace && mentionedWorkspace._id !== currentWorkspace._id) {
  return {
    requiresExplicitChoice: true,
    choiceData: {
      title: "Workspace Clarification",
      question: `Would you like to work in "${mentionedWorkspace.name}" or stay in "${currentWorkspace.name}"?`,
      options: [
        { id: 'stay', label: `Stay in ${currentWorkspace.name}`, icon: '📍' },
        { id: 'switch', label: `Switch to ${mentionedWorkspace.name}`, icon: '🔄' }
      ]
    }
  };
}
```

## Error Handling

```javascript
// If backend doesn't recognize the selected option
if (!result.valid) {
  return {
    reply: "That option is no longer valid. Please try again.",
    requiresExplicitChoice: false
  };
}
```

## Benefits

✅ **No More "Yes" Confusion** - Forces explicit choices
✅ **Better UX** - Visual buttons instead of text parsing  
✅ **Keyboard Accessible** - Full keyboard navigation
✅ **Responsive** - Works on mobile and desktop
✅ **State Management** - Proper locked state prevents errors
✅ **Timeout Handling** - States expire after 10 minutes
✅ **Dark Mode** - Respects user preferences

## Next Steps

1. Update `improvedGeminiService.js` to detect ambiguous scenarios
2. Return `requiresExplicitChoice` when needed
3. Test with real user scenarios
4. Monitor for edge cases
5. Adjust timeout values if needed

## Example Full Flow

```javascript
// In improvedGeminiService.js or unifiedChatbotService.js

export const handleChatbotQuery = async (message, userId, workspaceId) => {
  // ... existing logic ...
  
  // Detect ambiguity in workspace mention
  const workspaceMatch = message.match(/workspace[\\s]+([0-9]+)/i);
  const currentWorkspace = await getCurrentWorkspace(userId);
  
  if (workspaceMatch && workspaceMatch[1] !== currentWorkspace._id) {
    const targetWorkspace = await findWorkspace(workspaceMatch[1]);
    
    if (targetWorkspace) {
      // Trigger explicit choice dialog
      return {
        intent: 'clarify_workspace',
        reply: `I see you mentioned workspace "${targetWorkspace.name}". You're currently in "${currentWorkspace.name}". Where should I perform this action?`,
        requiresExplicitChoice: true,
        choiceData: {
          title: "Choose Workspace",
          question: "Which workspace should I use?",
          options: [
            {
              id: 'current',
              label: currentWorkspace.name,
              description: 'Use your current workspace',
              icon: '📍'
            },
            {
              id: 'mentioned',
              label: targetWorkspace.name,
              description: 'Switch to the mentioned workspace',
              icon: '🔄'
            }
          ]
        }
      };
    }
  }
  
  // ... rest of logic ...
};
```

---

This system ensures reliable, unambiguous user interactions! 🎯
