# Task Management

The task management system is the core feature of AIVA, providing comprehensive project and personal task tracking with advanced collaboration features.

## Overview

Tasks in AIVA are hierarchical, collaborative work items that can be organized within workspaces. Each task supports subtasks, comments, file attachments, time tracking, and progress monitoring.

## Task Creation

### Basic Task Properties

```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication with email verification",
  "priority": "high",
  "status": "in_progress",
  "dueDate": "2024-02-15",
  "estimatedHours": 16,
  "tags": ["authentication", "security", "backend"]
}
```

### Advanced Properties

- **Assignees**: Multiple users can be assigned to a task
- **Watchers**: Users who want to follow task progress
- **Dependencies**: Tasks that must be completed first
- **Custom Fields**: Workspace-specific additional properties

## Task Status Workflow

```
not_started → in_progress → completed
     ↓            ↓
 cancelled    paused
```

### Status Definitions

- **not_started**: Task is planned but work hasn't begun
- **in_progress**: Active work is being done
- **paused**: Work is temporarily stopped
- **completed**: Task is finished
- **cancelled**: Task is no longer needed

## Subtasks

Tasks can contain subtasks for breaking down complex work:

```json
{
  "title": "Setup authentication API",
  "subtasks": [
    {
      "title": "Create user registration endpoint",
      "status": "completed",
      "estimatedDuration": 2
    },
    {
      "title": "Implement JWT token generation",
      "status": "in_progress",
      "estimatedDuration": 3
    },
    {
      "title": "Add email verification",
      "status": "not_started",
      "estimatedDuration": 4
    }
  ]
}
```

### Subtask Features

- Independent status tracking
- Time estimation and tracking
- Due dates
- Priority levels

## Comments and Discussion

### Adding Comments

```javascript
// API call to add comment
POST /api/tasks/:taskId/comment
{
  "content": "I've completed the JWT implementation. Ready for review.",
  "mentions": ["@john-doe", "@jane-smith"]
}
```

### Comment Features

- **Rich Text**: Support for formatting, links, code blocks
- **Mentions**: @username notifications
- **Attachments**: Files can be attached to comments
- **Threading**: Reply to specific comments
- **Reactions**: Emoji reactions to comments

## File Attachments

### Supported File Types

- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPG, PNG, GIF, SVG
- **Code Files**: JS, TS, PY, JAVA, etc.
- **Archives**: ZIP, RAR, TAR
- **Spreadsheets**: XLS, XLSX, CSV

### Attachment Management

```javascript
// Upload attachment
POST /api/tasks/:taskId/attachments
Content-Type: multipart/form-data

// Delete attachment
DELETE /api/tasks/:taskId/attachments/:attachmentId
```

### Storage Options

- **Google Cloud Storage**: Primary storage for production
- **MongoDB GridFS**: Fallback storage
- **Local Filesystem**: Development only

## Time Tracking

### Manual Time Entry

```json
{
  "taskId": "task-123",
  "startTime": "2024-01-15T09:00:00Z",
  "endTime": "2024-01-15T12:00:00Z",
  "description": "Implemented login endpoint"
}
```

### Automatic Tracking

- Browser-based time tracking
- Idle detection
- Manual start/stop controls
- Productivity analytics

## Task Templates

### Creating Templates

Pre-defined task structures for common work patterns:

```json
{
  "name": "Bug Fix Template",
  "description": "Standard process for fixing software bugs",
  "template": {
    "title": "Fix: [Bug Description]",
    "priority": "high",
    "subtasks": [
      { "title": "Reproduce the bug", "estimatedDuration": 1 },
      { "title": "Identify root cause", "estimatedDuration": 2 },
      { "title": "Implement fix", "estimatedDuration": 3 },
      { "title": "Write tests", "estimatedDuration": 2 },
      { "title": "Code review", "estimatedDuration": 1 }
    ],
    "checklist": [
      "Update documentation",
      "Test edge cases",
      "Deploy to staging"
    ]
  }
}
```

## Task Views

### Kanban Board

Visual drag-and-drop interface:

```
┌─────────────┬─────────────┬─────────────┐
│  To Do      │ In Progress │   Done      │
├─────────────┼─────────────┼─────────────┤
│ Task 1      │ Task 3      │ Task 2      │
│ Task 4      │             │             │
└─────────────┴─────────────┴─────────────┘
```

### List View

Detailed list with sorting and filtering:

- Sort by: Due date, Priority, Created date, Updated date
- Filter by: Status, Assignee, Priority, Tags, Due date range
- Group by: Status, Assignee, Priority, Workspace

### Calendar View

Time-based visualization:

- Monthly calendar showing due dates
- Weekly view with time blocks
- Timeline view for project schedules

## Task Dependencies

### Dependency Types

- **Finish-to-Start**: Task B can't start until Task A finishes
- **Start-to-Start**: Task B can't start until Task A starts
- **Finish-to-Finish**: Task B can't finish until Task A finishes
- **Start-to-Finish**: Task B can't finish until Task A starts

### Dependency Management

```json
{
  "taskId": "task-456",
  "dependencies": [
    {
      "taskId": "task-123",
      "type": "finish-to-start"
    }
  ]
}
```

## Notifications

### Task Notifications

- **Assignment**: When assigned to a task
- **Due Date**: Reminders before due date
- **Status Changes**: When task status updates
- **Comments**: When new comments are added
- **Mentions**: When @mentioned in comments

### Notification Preferences

```json
{
  "taskAssigned": { "email": true, "push": true },
  "taskDue": { "email": true, "push": false, "advanceNotice": 24 },
  "commentAdded": { "email": false, "push": true },
  "mention": { "email": true, "push": true }
}
```

## Task Analytics

### Productivity Metrics

- **Completion Rate**: Tasks completed vs created
- **Average Cycle Time**: Time from start to completion
- **Burndown Charts**: Progress over time
- **Velocity Tracking**: Work completed per period

### Team Analytics

- **Workload Distribution**: Tasks per team member
- **Bottleneck Identification**: Tasks causing delays
- **Quality Metrics**: Bug rates, rework frequency

## Integration Features

### External Integrations

- **GitHub**: Link commits to tasks
- **Slack**: Task notifications and updates
- **Jira**: Bidirectional synchronization
- **Google Calendar**: Sync due dates

### API Integration

```javascript
// Webhook for task updates
POST https://your-app.com/webhooks/tasks
{
  "event": "task.updated",
  "task": { "id": "task-123", "status": "completed" },
  "user": { "id": "user-456", "name": "John Doe" }
}
```

## Task Import/Export

### CSV Import

```csv
Title,Description,Priority,Assignee,Due Date,Tags
"Fix login bug","Users can't login","high","john@example.com","2024-02-01","bug,urgent"
"Update documentation","Add API docs","medium","jane@example.com","2024-02-15","docs"
```

### JSON Export

```json
{
  "tasks": [
    {
      "id": "task-123",
      "title": "Fix login bug",
      "status": "completed",
      "exportedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "metadata": {
    "totalTasks": 1,
    "exportedBy": "user-456",
    "workspace": "workspace-789"
  }
}
```

## Security and Permissions

### Task Permissions

- **Creator**: Full access, can delete
- **Assignee**: Can update status, add comments
- **Watcher**: Read-only, can comment
- **Workspace Admin**: Full access to all tasks
- **Workspace Member**: Can view and comment on tasks

### Data Privacy

- Tasks are scoped to workspaces
- Private workspaces restrict access
- Audit logs track all changes
- Data encryption at rest

## Best Practices

### Task Creation

1. **Clear Titles**: Use descriptive, actionable titles
2. **Detailed Descriptions**: Include context and requirements
3. **Appropriate Priority**: Don't overuse "urgent"
4. **Realistic Deadlines**: Allow buffer time
5. **Break Down Large Tasks**: Use subtasks for complex work

### Task Management

1. **Regular Updates**: Keep status current
2. **Clear Communication**: Use comments for discussions
3. **File Organization**: Attach relevant documents
4. **Time Tracking**: Log actual time spent
5. **Dependency Mapping**: Link related tasks

### Team Collaboration

1. **Clear Assignment**: One primary assignee per task
2. **Regular Check-ins**: Weekly status reviews
3. **Knowledge Sharing**: Document solutions in comments
4. **Feedback Loops**: Review completed work
5. **Continuous Improvement**: Analyze metrics and adjust processes

This comprehensive task management system provides the foundation for effective project management and team collaboration in AIVA.