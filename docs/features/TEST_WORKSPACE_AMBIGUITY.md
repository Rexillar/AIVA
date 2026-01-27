/*=================================================================
 * Project: AIVA-WEB
 * File: TEST_WORKSPACE_AMBIGUITY.md
 * Author: AI Enhancement Module
 * Date Created: January 9, 2026
 *=================================================================
 * Description:
 * Test scenarios for workspace ambiguity detection
 *=================================================================*/

# Workspace Ambiguity Resolution - Test Scenarios

## ✅ Test Case 1: Your Exact Scenario

### Initial State
- User is in: **"mohitrajsinh's Workspace"**
- User wants to use: **"My Workspace 7434"**

### Conversation Flow

```
👤 User: "create a task odoo in the my workspace 7434"

🤖 Assistant: [Backend detects workspace ambiguity]
Response: {
  intent: "workspace_ambiguity",
  reply: "You're currently in 'mohitrajsinh's Workspace', but you mentioned 'My Workspace 7434'. Where would you like me to create task 'odoo'?",
  requiresExplicitChoice: true,
  choiceData: {
    title: "Choose Workspace",
    question: "Where would you like to create task 'odoo'?",
    options: [
      {
        id: "current_workspace",
        label: "mohitrajsinh's Workspace (Current)",
        description: "Use the workspace you're currently viewing",
        icon: "📍",
        workspaceId: "workspace-id-123",
        workspaceName: "mohitrajsinh's Workspace"
      },
      {
        id: "mentioned_workspace",
        label: "My Workspace 7434",
        description: "Switch to the mentioned workspace",
        icon: "🔄",
        workspaceId: "workspace-id-7434",
        workspaceName: "My Workspace 7434"
      }
    ]
  }
}

[Frontend shows ConfirmationDialog with 2 explicit buttons]
[Conversation enters LOCKED STATE]

👤 User types: "yes"

🤖 Assistant: "I'm not sure which option you meant. Please select one explicitly."
[Dialog remains open - input rejected]

👤 User clicks: [My Workspace 7434] button

🤖 Backend receives: {
  message: "My Workspace 7434",
  selectedOptionId: "mentioned_workspace",
  workspaceId: "current-workspace-id"
}

🤖 Backend processes:
- Detects selectedOptionId
- Calls processExplicitChoice()
- Extracts selected workspace ID
- Creates task in correct workspace
- Clears conversation state

🤖 Response: {
  intent: "create_task",
  reply: "✅ Created task 'odoo' in My Workspace 7434",
  data: { task details }
}

✅ SUCCESS!
```

## ✅ Test Case 2: Subtask Context Awareness

### Current Limitation
```
👤 User: "add subtask make something in the odoo task"

🤖 Current behavior: Creates habit named "subtask make something in the odoo task" ❌
```

### Expected Flow (Needs Implementation)
```
👤 User: "add subtask make something in the odoo task"

🤖 Backend detects:
- Keywords: "subtask", "in the [task name]"
- Context: Recent task "odoo" was created
- Intent: ADD_SUBTASK (not CREATE_HABIT)

🤖 Backend searches for task named "odoo"
- Found task: { _id: "task-id", title: "odoo", workspace: "workspace-7434" }

🤖 Response: {
  intent: "add_subtask",
  reply: "Added subtask 'make something' to task 'odoo' ✅",
  action: {
    method: "POST",
    endpoint: "/api/tasks/task-id/subtasks",
    body: {
      title: "make something"
    }
  }
}
```

## Patterns the System Detects

### 1. Workspace Mention Patterns
```javascript
// These patterns trigger ambiguity detection:
"create task X in workspace Y"
"create task X in my workspace Y"  
"create task X in the workspace Y"
"add task X to workspace Y"
"make task X in workspace Y"
"create task X in Y workspace"
```

### 2. Ambiguous Input Patterns
```javascript
// These are REJECTED when dialog is open:
"yes", "y", "ok", "okay", "sure", "yep", "yeah"
"no", "nope", "nah"
"maybe", "either", "both", "any", "depends"
"first", "second", "option", "choice"
"one", "two", "three"
```

### 3. Clear Input (ACCEPTED)
```javascript
// These are ACCEPTED even in locked state:
"mohitrajsinh's Workspace" - matches option label
"My Workspace 7434" - matches option label
"current" - matches option ID
"mentioned" - matches option ID
```

## Implementation Status

### ✅ Completed
- [x] ConfirmationDialog component (Tailwind)
- [x] Ambiguity state manager (client)
- [x] Redux slice for dialog
- [x] Backend conversation state tracker
- [x] Workspace ambiguity detection
- [x] chatController handles explicit choices
- [x] Locked state prevents ambiguous input
- [x] Keyboard navigation
- [x] Dark mode support

### 🚧 Needs Enhancement
- [ ] Subtask context awareness
- [ ] Better task name extraction
- [ ] Recent entity context (last created task)
- [ ] Multi-entity disambiguation (multiple tasks with same name)
- [ ] Habit vs Subtask intent classification

## Quick Integration Test

### Test the System Now

1. **Start the backend:**
```bash
cd server
npm start
```

2. **Start the frontend:**
```bash
cd client
npm run dev
```

3. **Test the exact scenario:**
```
1. Login to app
2. Open chatbot
3. Navigate to "mohitrajsinh's Workspace"
4. Type: "create task odoo in my workspace 7434"
5. See dialog appear with 2 options ✅
6. Type: "yes"
7. See rejection message ✅
8. Click "My Workspace 7434" button
9. See task created in correct workspace ✅
```

## Backend Code Flow

```
User Message
    ↓
chatController.sendMessage()
    ↓
Check for selectedOptionId?
    ├─ YES → processExplicitChoice()
    │         ├─ Extract selected workspace
    │         ├─ Create entity in workspace
    │         └─ Return success
    │
    └─ NO → handleChatbotQuery()
              ↓
         getImprovedAIResponse()
              ↓
         classifyIntent()
              ↓
         detectWorkspaceAmbiguity()
              ├─ No ambiguity → Continue normal flow
              │
              └─ Ambiguity found!
                  ├─ Save explicit choice state
                  └─ Return dialog data
                      ↓
                  Frontend shows dialog
                  Conversation LOCKED
                      ↓
                  User selects option
                      ↓
                  Loop back to top with selectedOptionId
```

## Error Handling

### Expired State
```javascript
// After 10 minutes, state expires
User clicks option → Backend checks state
State expired → Return error
"Question has expired. Please ask again."
```

### Invalid Option
```javascript
// If somehow invalid option is sent
Backend validates option ID
Not found → Return error
"Invalid option selected."
```

### Network Errors
```javascript
// Frontend handles network errors
try {
  await sendMessage(...)
} catch (error) {
  Show error message
  Keep dialog open
  Allow retry
}
```

## Performance Considerations

- **Cache workspace lookups** (Redis)
- **Index workspace names** (MongoDB)
- **Limit ambiguity checks** (only for create intents)
- **Timeout states** (10 minutes TTL)
- **Debounce input** (frontend)

## Next Steps

1. **Test with real users**
2. **Monitor ambiguity patterns**
3. **Add more intent types** (update, delete, etc.)
4. **Improve entity extraction**
5. **Add analytics** (track disambiguation success rate)

---

## Summary

The system now correctly handles workspace ambiguity with explicit confirmation dialogs! No more "yes" confusion. 🎉

When a user mentions a different workspace than their current one, they must explicitly click a button to choose, preventing all ambiguous interpretation errors.
