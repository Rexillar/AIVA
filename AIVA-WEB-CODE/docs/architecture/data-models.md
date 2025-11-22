# Data Models

This document describes the core data models used in the AIVA Web Application, including their structure, relationships, and business logic.

## Overview

The application uses MongoDB with Mongoose ODM for data persistence. All models follow a consistent structure with timestamps, validation, and proper indexing.

## User Model

### Schema Definition

```javascript
{
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  otp: String,
  otpExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  workspaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    reminders: {
      taskDue: {
        enabled: { type: Boolean, default: true },
        advanceNotice: { type: Number, default: 24 }
      },
      dailyDigest: {
        enabled: { type: Boolean, default: true },
        time: { type: String, default: '09:00' }
      },
      weeklyReport: {
        enabled: { type: Boolean, default: true },
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], default: 'monday' },
        time: { type: String, default: '09:00' }
      }
    }
  }
}
```

### Key Features

- **Authentication**: Password hashing with bcrypt, OTP verification
- **Authorization**: Admin role, active status control
- **Preferences**: Theme, notification settings, reminder preferences
- **Relationships**: References to workspaces the user belongs to

### Indexes

- Unique index on email
- Compound index on workspaces for efficient queries

## Workspace Model

### Schema Definition

```javascript
{
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['personal', 'team', 'public'],
    default: 'personal'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    isPublic: { type: Boolean, default: false },
    allowGuestInvites: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Key Features

- **Multi-tenancy**: Personal, team, and public workspaces
- **Role-based access**: Admin, member, viewer roles
- **Membership management**: Active/inactive status, join dates
- **Settings**: Privacy and invitation controls

### Relationships

- **Owner**: Single user who created the workspace
- **Members**: Array of users with roles and status
- **Tasks**: Tasks belong to workspaces
- **Notes**: Notes are scoped to workspaces

## Task Model

### Schema Definition

```javascript
{
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
    default: 'not_started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  subtasks: [subtaskSchema],
  comments: [commentSchema],
  attachments: [attachmentSchema],
  activities: [activitySchema],
  tags: [String],
  dueDate: Date,
  startDate: Date,
  completedAt: Date,
  estimatedHours: Number,
  actualHours: Number,
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}
```

### Embedded Schemas

#### Subtask Schema
```javascript
{
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  dueDate: Date,
  completedAt: Date
}
```

#### Comment Schema
```javascript
{
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

#### Attachment Schema
```javascript
{
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimetype: String,
  size: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedAt: { type: Date, default: Date.now }
}
```

#### Activity Schema
```javascript
{
  content: { type: String, required: true },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Key Features

- **Hierarchical structure**: Tasks contain subtasks
- **Collaboration**: Multiple assignees, watchers, comments
- **Progress tracking**: Status, time estimation, completion dates
- **File management**: Attachment support
- **Audit trail**: Activity logging

## Note Model

### Schema Definition

```javascript
{
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Note content is required']
  },
  type: {
    type: String,
    enum: ['text', 'diagram', 'template'],
    default: 'text'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['read', 'write'], default: 'read' }
  }],
  version: {
    type: Number,
    default: 1
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}
```

### Key Features

- **Rich content**: Support for text and diagrams
- **Collaboration**: Multiple collaborators with permissions
- **Versioning**: Track changes and edits
- **Organization**: Tags and workspace scoping

## Habit Model

### Schema Definition

```javascript
{
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true
  },
  description: String,
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  target: {
    type: Number,
    default: 1,
    min: 1
  },
  unit: {
    type: String,
    default: 'times'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  category: {
    type: String,
    enum: ['health', 'productivity', 'learning', 'social', 'other'],
    default: 'other'
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastCompleted: Date
  },
  reminders: {
    enabled: { type: Boolean, default: true },
    time: { type: String, default: '09:00' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  archivedAt: Date
}
```

### Key Features

- **Flexible scheduling**: Daily, weekly, monthly habits
- **Progress tracking**: Streaks, targets, completion history
- **Reminders**: Automated notifications
- **Analytics**: Performance tracking and insights

## Chat Models

### Chat History Schema
```javascript
{
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'system'], default: 'text' },
    timestamp: { type: Date, default: Date.now }
  }],
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}
```

### Completion Schema (AI Interactions)
```javascript
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  model: {
    type: String,
    default: 'gemini-pro'
  },
  tokens: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

## Notification Model

### Schema Definition

```javascript
{
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['task_assigned', 'task_due', 'comment_added', 'workspace_invite', 'reminder'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    taskId: mongoose.Schema.Types.ObjectId,
    workspaceId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}
```

## File Model

### Schema Definition

```javascript
{
  filename: {
    type: String,
    required: true
  },
  originalName: String,
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: String,
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  folder: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}
```

## Data Relationships

### Entity Relationship Diagram

```
User
├── 1:N Workspaces (member)
├── 1:N Tasks (creator/assignee)
├── 1:N Notes (creator)
├── 1:N Habits (creator)
├── 1:N Files (uploader)
└── 1:N Notifications (recipient)

Workspace
├── 1:1 Owner (User)
├── 1:N Members (User)
├── 1:N Tasks
├── 1:N Notes
├── 1:N Habits
├── 1:N Files
└── 1:1 Chat History

Task
├── 1:1 Creator (User)
├── 1:N Assignees (User)
├── 1:1 Workspace
├── 1:N Subtasks (embedded)
├── 1:N Comments (embedded)
├── 1:N Attachments (embedded)
├── 1:N Activities (embedded)
└── 1:N Watchers (User)

Note
├── 1:1 Creator (User)
├── 1:1 Workspace
└── 1:N Collaborators (User)

Habit
├── 1:1 Creator (User)
├── 1:1 Workspace (optional)
└── 1:1 Streak (embedded)
```

## Indexing Strategy

### Performance Indexes

```javascript
// User indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ workspaces: 1 });

// Workspace indexes
WorkspaceSchema.index({ owner: 1 });
WorkspaceSchema.index({ 'members.user': 1 });
WorkspaceSchema.index({ type: 1, isActive: 1 });

// Task indexes
TaskSchema.index({ workspace: 1, status: 1 });
TaskSchema.index({ creator: 1 });
TaskSchema.index({ assignees: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdAt: -1 });

// Note indexes
NoteSchema.index({ workspace: 1 });
NoteSchema.index({ creator: 1 });
NoteSchema.index({ tags: 1 });

// File indexes
FileSchema.index({ workspace: 1 });
FileSchema.index({ uploadedBy: 1 });
FileSchema.index({ mimetype: 1 });
```

## Data Validation

### Pre-save Hooks

- **Password hashing**: Automatic bcrypt hashing for user passwords
- **Timestamps**: Automatic createdAt/updatedAt management
- **Data sanitization**: Trim strings, lowercase emails

### Custom Validation

- **Email format**: Regex validation for email addresses
- **Password strength**: Minimum length and complexity requirements
- **Reference integrity**: Ensure referenced documents exist
- **Business rules**: Custom validation for business logic constraints

## Migration and Seeding

### Data Migration
- Version-controlled migration scripts
- Backward compatibility for schema changes
- Data transformation utilities

### Seed Data
- Development seed scripts
- Test data generation
- Demo workspace creation

This data model provides a solid foundation for the application's features while maintaining flexibility for future enhancements.