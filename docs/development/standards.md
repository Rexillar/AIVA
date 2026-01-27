# Coding Standards

This document outlines the coding standards and best practices for the AIVA Web Application codebase.

## General Principles

### Code Quality

- **Readability**: Code should be self-documenting and easy to understand
- **Maintainability**: Code should be easy to modify and extend
- **Performance**: Code should be efficient and scalable
- **Security**: Code should follow security best practices
- **Consistency**: Code should follow consistent patterns and conventions

### DRY (Don't Repeat Yourself)

```javascript
// ❌ Bad: Repeated validation logic
function createUser(data) {
  if (!data.name) throw new Error('Name required');
  if (!data.email) throw new Error('Email required');
  // ... more validation
}

function updateUser(id, data) {
  if (!data.name) throw new Error('Name required');
  if (!data.email) throw new Error('Email required');
  // ... more validation
}

// ✅ Good: Shared validation function
function validateUserData(data) {
  if (!data.name) throw new Error('Name required');
  if (!data.email) throw new Error('Email required');
  // ... validation logic
}

function createUser(data) {
  validateUserData(data);
  // ... create logic
}

function updateUser(id, data) {
  validateUserData(data);
  // ... update logic
}
```

## Backend Standards (Node.js/Express)

### Project Structure

```
server/
├── config/           # Configuration files
├── controllers/      # Route handlers
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── middlewares/     # Express middlewares
├── utils/           # Utility functions
├── validations/     # Input validation
└── tests/           # Test files
```

### File Naming

```javascript
// Controllers: [resource]Controller.js
taskController.js
userController.js
workspaceController.js

// Models: [resource].js
task.js
user.js
workspace.js

// Routes: [resource]Routes.js
taskRoutes.js
userRoutes.js
workspaceRoutes.js

// Services: [resource]Service.js
taskService.js
emailService.js
aiService.js
```

### Controller Structure

```javascript
// controllers/taskController.js
import asyncHandler from 'express-async-handler';
import Task from '../models/task.js';
import taskService from '../services/taskService.js';

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user._id);

  res.status(201).json({
    success: true,
    data: task,
    message: 'Task created successfully'
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const { tasks, pagination } = await taskService.getTasks(req.query, req.user._id);

  res.status(200).json({
    success: true,
    data: tasks,
    pagination
  });
});

export { createTask, getTasks };
```

### Service Layer

```javascript
// services/taskService.js
class TaskService {
  async createTask(taskData, userId) {
    // Validate input
    this.validateTaskData(taskData);

    // Check permissions
    await this.checkWorkspaceAccess(taskData.workspace, userId);

    // Create task
    const task = await Task.create({
      ...taskData,
      creator: userId
    });

    // Send notifications
    await this.sendTaskCreatedNotifications(task);

    return task;
  }

  validateTaskData(data) {
    // Validation logic
  }

  async checkWorkspaceAccess(workspaceId, userId) {
    // Permission check logic
  }

  async sendTaskCreatedNotifications(task) {
    // Notification logic
  }
}

export default new TaskService();
```

### Model Definitions

```javascript
// models/task.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
taskSchema.index({ workspace: 1, status: 1 });
taskSchema.index({ creator: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ dueDate: 1 });

// Virtuals
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Methods
taskSchema.methods.assignTo = function(userId) {
  if (!this.assignees.includes(userId)) {
    this.assignees.push(userId);
  }
  return this.save();
};

// Statics
taskSchema.statics.findByWorkspace = function(workspaceId) {
  return this.find({ workspace: workspaceId });
};

export default mongoose.model('Task', taskSchema);
```

### Route Definitions

```javascript
// routes/taskRoutes.js
import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { canModifyTask } from '../middlewares/taskMiddleware.js';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Task CRUD routes
router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(canModifyTask, updateTask)
  .delete(canModifyTask, deleteTask);

// Sub-routes
router.post('/:id/comment', canModifyTask, addTaskComment);
router.get('/:id/comments', getTaskComments);

export default router;
```

### Middleware Patterns

```javascript
// middlewares/authMiddleware.js
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// middlewares/validationMiddleware.js
export const validateTaskCreation = (req, res, next) => {
  const { title, workspace } = req.body;

  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!workspace) {
    errors.push('Workspace is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors
      }
    });
  }

  next();
};
```

## Frontend Standards (React)

### Project Structure

```
client/src/
├── components/       # Reusable UI components
│   ├── common/      # Generic components (Button, Input, etc.)
│   ├── layout/      # Layout components (Header, Sidebar, etc.)
│   └── features/    # Feature-specific components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── services/        # API service functions
├── store/           # Redux store configuration
├── redux/           # Redux slices and actions
├── utils/           # Utility functions
├── constants/       # Application constants
├── styles/          # Global styles and themes
└── types/           # TypeScript type definitions
```

### Component Structure

```jsx
// components/tasks/TaskCard.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateTask } from '../../redux/slices/taskSlice';
import { formatDate } from '../../utils/formatters';

function TaskCard({ task, onEdit, onDelete }) {
  const dispatch = useDispatch();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await dispatch(updateTask({
        id: task.id,
        updates: { status: 'completed' }
      }));
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`task-priority priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span className="task-due-date">
          Due: {formatDate(task.dueDate)}
        </span>
        <span className="task-assignees">
          Assigned to: {task.assignees.map(u => u.name).join(', ')}
        </span>
      </div>

      <div className="task-actions">
        <button
          onClick={handleComplete}
          disabled={isCompleting || task.status === 'completed'}
          className="btn btn-primary"
        >
          {isCompleting ? 'Completing...' : 'Mark Complete'}
        </button>

        <button onClick={onEdit} className="btn btn-secondary">
          Edit
        </button>

        <button onClick={onDelete} className="btn btn-danger">
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
```

### Custom Hooks

```javascript
// hooks/useTask.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, createTask, updateTask } from '../redux/slices/taskSlice';

export function useTask(workspaceId) {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector(state => state.tasks);
  const [filters, setFilters] = useState({ status: 'all', assignee: 'all' });

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchTasks({ workspaceId, ...filters }));
    }
  }, [dispatch, workspaceId, filters]);

  const createNewTask = async (taskData) => {
    return dispatch(createTask({ ...taskData, workspace: workspaceId }));
  };

  const updateExistingTask = async (taskId, updates) => {
    return dispatch(updateTask({ id: taskId, updates }));
  };

  const filterTasks = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    tasks,
    loading,
    error,
    filters,
    createNewTask,
    updateExistingTask,
    filterTasks
  };
}
```

### Redux Structure

```javascript
// redux/slices/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskAPI from '../../services/taskAPI';

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  }
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ workspaceId, filters }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTasks(workspaceId, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskAPI.createTask(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    updateTaskOptimistically: (state, action) => {
      const { id, updates } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = { ...state.tasks[taskIndex], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload.data);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setCurrentTask, updateTaskOptimistically } = taskSlice.actions;
export default taskSlice.reducer;
```

### API Services

```javascript
// services/taskAPI.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class TaskAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle token expiration
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getTasks(workspaceId, filters = {}) {
    const params = new URLSearchParams({
      workspace: workspaceId,
      ...filters
    });

    return this.client.get(`/tasks?${params}`);
  }

  async createTask(taskData) {
    return this.client.post('/tasks', taskData);
  }

  async updateTask(taskId, updates) {
    return this.client.put(`/tasks/${taskId}`, updates);
  }

  async deleteTask(taskId) {
    return this.client.delete(`/tasks/${taskId}`);
  }

  async getTaskComments(taskId) {
    return this.client.get(`/tasks/${taskId}/comments`);
  }

  async addTaskComment(taskId, comment) {
    return this.client.post(`/tasks/${taskId}/comment`, { content: comment });
  }
}

export default new TaskAPI();
```

### Styling Standards

```css
/* styles/components/task-card.css */
.task-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-shadow;
}

.task-card:hover {
  @apply shadow-md;
}

.task-header {
  @apply flex items-start justify-between mb-3;
}

.task-title {
  @apply text-lg font-semibold text-gray-900 flex-1 mr-3;
}

.task-description {
  @apply text-gray-600 mb-3 line-clamp-2;
}

.task-meta {
  @apply flex flex-wrap gap-4 text-sm text-gray-500 mb-4;
}

.task-actions {
  @apply flex gap-2;
}

/* Priority indicators */
.priority-low {
  @apply bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium;
}

.priority-medium {
  @apply bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium;
}

.priority-high {
  @apply bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium;
}

.priority-urgent {
  @apply bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium;
}
```

## Testing Standards

### Unit Test Structure

```javascript
// __tests__/services/taskService.test.js
import TaskService from '../../services/taskService';
import Task from '../../models/task';

jest.mock('../../models/task');

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const validTaskData = {
      title: 'Test Task',
      workspace: 'workspace-123',
      creator: 'user-456'
    };

    it('should create task with valid data', async () => {
      const mockTask = { ...validTaskData, _id: 'task-789' };
      Task.create.mockResolvedValue(mockTask);

      const result = await TaskService.createTask(validTaskData, 'user-456');

      expect(Task.create).toHaveBeenCalledWith({
        ...validTaskData,
        creator: 'user-456'
      });
      expect(result).toEqual(mockTask);
    });

    it('should validate required fields', async () => {
      const invalidData = { title: '' };

      await expect(TaskService.createTask(invalidData, 'user-456'))
        .rejects.toThrow('Title is required');
    });

    it('should check workspace access', async () => {
      const spy = jest.spyOn(TaskService, 'checkWorkspaceAccess');
      spy.mockResolvedValue();

      await TaskService.createTask(validTaskData, 'user-456');

      expect(spy).toHaveBeenCalledWith('workspace-123', 'user-456');
    });
  });
});
```

### Component Test Structure

```javascript
// __tests__/components/TaskCard.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TaskCard from '../../components/tasks/TaskCard';

const mockStore = configureStore([]);

describe('TaskCard', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      tasks: {
        loading: false,
        error: null
      }
    });
  });

  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test description',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-01-15',
    assignees: [{ name: 'John Doe' }]
  };

  it('renders task information correctly', () => {
    render(
      <Provider store={store}>
        <TaskCard task={mockTask} />
      </Provider>
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();

    render(
      <Provider store={store}>
        <TaskCard task={mockTask} onEdit={mockOnEdit} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('shows loading state during completion', async () => {
    render(
      <Provider store={store}>
        <TaskCard task={mockTask} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Mark Complete'));

    await waitFor(() => {
      expect(screen.getByText('Completing...')).toBeInTheDocument();
    });
  });
});
```

## Performance Standards

### Backend Performance

- **Response Time**: API responses should be < 500ms for simple operations
- **Database Queries**: Avoid N+1 queries, use proper indexing
- **Memory Usage**: Monitor for memory leaks, optimize large data processing
- **Concurrent Users**: Support 1000+ concurrent users with proper scaling

### Frontend Performance

- **Bundle Size**: Keep initial bundle < 500KB (gzipped)
- **First Paint**: < 2 seconds on 3G connection
- **Runtime Performance**: 60 FPS animations, smooth scrolling
- **Memory Usage**: No memory leaks, efficient component re-renders

## Security Standards

### Input Validation

```javascript
// Server-side validation with Joi
const taskValidationSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .required()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters'
    }),

  description: Joi.string()
    .max(2000)
    .trim()
    .allow('')
    .optional(),

  priority: Joi.string()
    .valid('low', 'medium', 'high', 'urgent')
    .default('medium'),

  dueDate: Joi.date()
    .min('now')
    .optional()
});
```

### Authentication & Authorization

```javascript
// Role-based access control
const checkPermission = (user, resource, action) => {
  const roles = user.roles || [];
  const permissions = roles.flatMap(role => role.permissions);

  return permissions.some(permission =>
    permission.resource === resource &&
    permission.actions.includes(action)
  );
};

// Usage in routes
router.put('/:id', protect, canModifyTask, async (req, res) => {
  // Only users with modify permission reach here
});
```

### Data Sanitization

```javascript
// HTML sanitization
import DOMPurify from 'dompurify';

const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: []
  });
};

// SQL injection prevention (MongoDB)
const safeQuery = (userInput) => {
  // MongoDB is safe from SQL injection, but validate input types
  if (typeof userInput !== 'string') {
    throw new Error('Invalid input type');
  }
  return userInput.trim();
};
```

These standards ensure consistent, maintainable, and high-quality code across the entire AIVA Web Application codebase.