# Testing Guide

This document outlines the testing strategy and practices for the AIVA Web Application.

## Testing Strategy

### Testing Pyramid

```
End-to-End Tests (E2E)
    ↕️
Integration Tests
    ↕️
Unit Tests
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: 70%+ coverage for API endpoints
- **E2E Tests**: Critical user journeys (login, task creation, workspace management)

## Backend Testing (Node.js/Express)

### Unit Testing Setup

```javascript
// server/__tests__/setup.js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});
```

### Model Testing

```javascript
// server/__tests__/models/task.test.js
import Task from '../../models/task';
import User from '../../models/user';
import Workspace from '../../models/workspace';

describe('Task Model', () => {
  let testUser;
  let testWorkspace;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    testWorkspace = await Workspace.create({
      name: 'Test Workspace',
      creator: testUser._id
    });
  });

  describe('Task Creation', () => {
    it('should create a valid task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        status: 'not_started',
        priority: 'medium',
        creator: testUser._id,
        workspace: testWorkspace._id
      };

      const task = await Task.create(taskData);

      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.status).toBe(taskData.status);
      expect(task.priority).toBe(taskData.priority);
      expect(task.creator.toString()).toBe(testUser._id.toString());
      expect(task.workspace.toString()).toBe(testWorkspace._id.toString());
    });

    it('should fail without required title', async () => {
      const taskData = {
        description: 'Test description',
        creator: testUser._id,
        workspace: testWorkspace._id
      };

      await expect(Task.create(taskData)).rejects.toThrow();
    });

    it('should fail with invalid status', async () => {
      const taskData = {
        title: 'Test Task',
        status: 'invalid_status',
        creator: testUser._id,
        workspace: testWorkspace._id
      };

      await expect(Task.create(taskData)).rejects.toThrow();
    });
  });

  describe('Task Methods', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        creator: testUser._id,
        workspace: testWorkspace._id
      });
    });

    it('should assign user to task', async () => {
      const newUser = await User.create({
        name: 'Assignee',
        email: 'assignee@example.com',
        password: 'password123'
      });

      await task.assignTo(newUser._id);

      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.assignees).toContainEqual(newUser._id);
    });

    it('should not assign same user twice', async () => {
      await task.assignTo(testUser._id);
      await task.assignTo(testUser._id);

      const updatedTask = await Task.findById(task._id);
      expect(updatedTask.assignees).toHaveLength(1);
    });
  });

  describe('Task Virtuals', () => {
    it('should return true for overdue tasks', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const task = await Task.create({
        title: 'Overdue Task',
        dueDate: pastDate,
        status: 'in_progress',
        creator: testUser._id,
        workspace: testWorkspace._id
      });

      expect(task.isOverdue).toBe(true);
    });

    it('should return false for completed overdue tasks', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const task = await Task.create({
        title: 'Completed Overdue Task',
        dueDate: pastDate,
        status: 'completed',
        creator: testUser._id,
        workspace: testWorkspace._id
      });

      expect(task.isOverdue).toBe(false);
    });
  });

  describe('Task Statics', () => {
    beforeEach(async () => {
      await Task.create([
        {
          title: 'Task 1',
          creator: testUser._id,
          workspace: testWorkspace._id
        },
        {
          title: 'Task 2',
          creator: testUser._id,
          workspace: testWorkspace._id
        }
      ]);
    });

    it('should find tasks by workspace', async () => {
      const tasks = await Task.findByWorkspace(testWorkspace._id);

      expect(tasks).toHaveLength(2);
      tasks.forEach(task => {
        expect(task.workspace.toString()).toBe(testWorkspace._id.toString());
      });
    });
  });
});
```

### Controller Testing

```javascript
// server/__tests__/controllers/taskController.test.js
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import taskRoutes from '../../routes/taskRoutes';
import User from '../../models/user';
import Workspace from '../../models/workspace';
import jwt from 'jsonwebtoken';

describe('Task Controller', () => {
  let app;
  let mongoServer;
  let testUser;
  let testWorkspace;
  let authToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test app
    app = express();
    app.use(express.json());
    app.use('/api/tasks', taskRoutes);

    // Create test user and workspace
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    testWorkspace = await Workspace.create({
      name: 'Test Workspace',
      creator: testUser._id
    });

    // Generate auth token
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        workspace: testWorkspace._id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.creator).toBe(testUser._id.toString());
    });

    it('should return 401 without auth token', async () => {
      const taskData = {
        title: 'New Task',
        workspace: testWorkspace._id
      };

      await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);
    });

    it('should return 400 with invalid data', async () => {
      const invalidData = {
        title: '', // Empty title
        workspace: testWorkspace._id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task 1',
          workspace: testWorkspace._id,
          status: 'not_started'
        });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task 2',
          workspace: testWorkspace._id,
          status: 'completed'
        });
    });

    it('should return all tasks for workspace', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ workspace: testWorkspace._id })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({
          workspace: testWorkspace._id,
          status: 'completed'
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach(task => {
        expect(task.status).toBe('completed');
      });
    });
  });
});
```

### Service Testing

```javascript
// server/__tests__/services/taskService.test.js
import TaskService from '../../services/taskService';
import Task from '../../models/task';
import User from '../../models/user';
import Workspace from '../../models/workspace';

jest.mock('../../models/task');
jest.mock('../../models/user');
jest.mock('../../models/workspace');

describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const validTaskData = {
      title: 'Test Task',
      description: 'Test description',
      workspace: 'workspace-123'
    };

    const mockUser = {
      _id: 'user-456',
      name: 'Test User'
    };

    it('should create task successfully', async () => {
      const mockTask = {
        ...validTaskData,
        _id: 'task-789',
        creator: mockUser._id
      };

      Task.create.mockResolvedValue(mockTask);
      User.findById.mockResolvedValue(mockUser);
      Workspace.findById.mockResolvedValue({ _id: 'workspace-123' });

      const result = await TaskService.createTask(validTaskData, mockUser._id);

      expect(Task.create).toHaveBeenCalledWith({
        ...validTaskData,
        creator: mockUser._id
      });
      expect(result).toEqual(mockTask);
    });

    it('should validate task data', async () => {
      const invalidData = { title: '' };

      await expect(TaskService.createTask(invalidData, mockUser._id))
        .rejects.toThrow('Title is required');
    });

    it('should check workspace access', async () => {
      const spy = jest.spyOn(TaskService, 'checkWorkspaceAccess');
      spy.mockResolvedValue();

      Task.create.mockResolvedValue({ ...validTaskData, _id: 'task-789' });

      await TaskService.createTask(validTaskData, mockUser._id);

      expect(spy).toHaveBeenCalledWith('workspace-123', mockUser._id);
    });
  });

  describe('getTasks', () => {
    it('should return paginated tasks', async () => {
      const mockTasks = [
        { title: 'Task 1', status: 'not_started' },
        { title: 'Task 2', status: 'completed' }
      ];

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTasks)
      };

      Task.find.mockReturnValue(mockQuery);

      const result = await TaskService.getTasks({
        workspace: 'workspace-123',
        page: 1,
        limit: 10
      });

      expect(result.tasks).toEqual(mockTasks);
      expect(result.pagination).toBeDefined();
    });

    it('should apply filters correctly', async () => {
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([])
      };

      Task.find.mockReturnValue(mockQuery);

      await TaskService.getTasks({
        workspace: 'workspace-123',
        status: 'completed',
        assignee: 'user-456'
      });

      expect(mockQuery.find).toHaveBeenCalledWith({
        workspace: 'workspace-123',
        status: 'completed',
        assignees: 'user-456'
      });
    });
  });
});
```

### Middleware Testing

```javascript
// server/__tests__/middlewares/authMiddleware.test.js
import jwt from 'jsonwebtoken';
import { protect } from '../../middlewares/authMiddleware';
import User from '../../models/user';

jest.mock('../../models/user');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('protect middleware', () => {
    it('should call next with valid token', async () => {
      const mockUser = {
        _id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      };

      const token = jwt.sign({ id: mockUser._id }, 'test-secret');
      mockReq.headers.authorization = `Bearer ${token}`;

      User.findById.mockResolvedValue(mockUser);

      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual(mockUser);
    });

    it('should return 401 without token', async () => {
      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Not authorized, no token'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 'user-123' },
        'test-secret',
        { expiresIn: '-1h' }
      );
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      await protect(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
```

## Frontend Testing (React)

### Component Testing Setup

```javascript
// client/src/__tests__/setup.js
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({
  testIdAttribute: 'data-testid'
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};
```

### Component Testing

```javascript
// client/src/__tests__/components/TaskCard.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TaskCard from '../../components/tasks/TaskCard';
import { updateTask } from '../../redux/slices/taskSlice';

const mockStore = configureStore([thunk]);

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
    dueDate: '2024-01-15T10:00:00.000Z',
    assignees: [{ id: 'user-1', name: 'John Doe' }],
    creator: { id: 'user-2', name: 'Jane Smith' }
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
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('displays formatted due date', () => {
    render(
      <Provider store={store}>
        <TaskCard task={mockTask} />
      </Provider>
    );

    expect(screen.getByText(/Due:/)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();

    render(
      <Provider store={store}>
        <TaskCard task={mockTask} onEdit={mockOnEdit} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('dispatches updateTask when mark complete is clicked', async () => {
    render(
      <Provider store={store}>
        <TaskCard task={mockTask} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(updateTask({
        id: mockTask.id,
        updates: { status: 'completed' }
      }));
    });
  });

  it('shows loading state during completion', async () => {
    store = mockStore({
      tasks: {
        loading: true,
        error: null
      }
    });

    render(
      <Provider store={store}>
        <TaskCard task={mockTask} />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /mark complete/i }));

    expect(screen.getByText('Completing...')).toBeInTheDocument();
  });

  it('disables complete button for completed tasks', () => {
    const completedTask = { ...mockTask, status: 'completed' };

    render(
      <Provider store={store}>
        <TaskCard task={completedTask} />
      </Provider>
    );

    const completeButton = screen.getByRole('button', { name: /mark complete/i });
    expect(completeButton).toBeDisabled();
  });
});
```

### Hook Testing

```javascript
// client/src/__tests__/hooks/useTask.test.js
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useTask } from '../../hooks/useTask';
import * as taskSlice from '../../redux/slices/taskSlice';

const mockStore = configureStore([thunk]);

describe('useTask', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      tasks: {
        tasks: [],
        loading: false,
        error: null,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      }
    });
  });

  const wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );

  it('fetches tasks on mount when workspaceId is provided', async () => {
    const mockFetchTasks = jest.spyOn(taskSlice, 'fetchTasks');
    mockFetchTasks.mockReturnValue({ type: 'tasks/fetchTasks' });

    const { result } = renderHook(() => useTask('workspace-123'), { wrapper });

    await waitFor(() => {
      expect(mockFetchTasks).toHaveBeenCalledWith({
        workspaceId: 'workspace-123',
        status: 'all',
        assignee: 'all'
      });
    });
  });

  it('does not fetch tasks when workspaceId is not provided', () => {
    const mockFetchTasks = jest.spyOn(taskSlice, 'fetchTasks');

    renderHook(() => useTask(), { wrapper });

    expect(mockFetchTasks).not.toHaveBeenCalled();
  });

  it('returns tasks from store', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1' },
      { id: '2', title: 'Task 2' }
    ];

    store = mockStore({
      tasks: {
        tasks: mockTasks,
        loading: false,
        error: null,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      }
    });

    const { result } = renderHook(() => useTask('workspace-123'), {
      wrapper: ({ children }) => (
        <Provider store={store}>{children}</Provider>
      )
    });

    expect(result.current.tasks).toEqual(mockTasks);
  });

  it('updates filters correctly', () => {
    const mockFetchTasks = jest.spyOn(taskSlice, 'fetchTasks');
    mockFetchTasks.mockReturnValue({ type: 'tasks/fetchTasks' });

    const { result } = renderHook(() => useTask('workspace-123'), { wrapper });

    act(() => {
      result.current.filterTasks({ status: 'completed' });
    });

    expect(result.current.filters.status).toBe('completed');
  });

  it('creates new task', async () => {
    const mockCreateTask = jest.spyOn(taskSlice, 'createTask');
    mockCreateTask.mockReturnValue({ type: 'tasks/createTask' });

    const { result } = renderHook(() => useTask('workspace-123'), { wrapper });

    const taskData = { title: 'New Task' };

    act(() => {
      result.current.createNewTask(taskData);
    });

    expect(mockCreateTask).toHaveBeenCalledWith({
      ...taskData,
      workspace: 'workspace-123'
    });
  });
});
```

### Redux Testing

```javascript
// client/src/__tests__/redux/slices/taskSlice.test.js
import taskReducer, {
  fetchTasks,
  createTask,
  updateTask,
  clearError,
  setCurrentTask
} from '../../../redux/slices/taskSlice';

describe('Task Slice', () => {
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

  it('should return the initial state', () => {
    expect(taskReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const stateWithError = {
        ...initialState,
        error: 'Test error'
      };

      const action = clearError();
      const result = taskReducer(stateWithError, action);

      expect(result.error).toBeNull();
    });
  });

  describe('setCurrentTask', () => {
    it('should set current task', () => {
      const mockTask = { id: '1', title: 'Test Task' };

      const action = setCurrentTask(mockTask);
      const result = taskReducer(initialState, action);

      expect(result.currentTask).toEqual(mockTask);
    });
  });

  describe('fetchTasks', () => {
    it('should handle fetchTasks.pending', () => {
      const action = { type: fetchTasks.pending.type };
      const result = taskReducer(initialState, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle fetchTasks.fulfilled', () => {
      const mockTasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' }
      ];
      const mockPagination = {
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1
      };

      const action = {
        type: fetchTasks.fulfilled.type,
        payload: {
          data: mockTasks,
          pagination: mockPagination
        }
      };
      const result = taskReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.tasks).toEqual(mockTasks);
      expect(result.pagination).toEqual(mockPagination);
    });

    it('should handle fetchTasks.rejected', () => {
      const errorMessage = 'Failed to fetch tasks';

      const action = {
        type: fetchTasks.rejected.type,
        payload: errorMessage
      };
      const result = taskReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(errorMessage);
    });
  });

  describe('createTask', () => {
    it('should handle createTask.pending', () => {
      const action = { type: createTask.pending.type };
      const result = taskReducer(initialState, action);

      expect(result.loading).toBe(true);
    });

    it('should handle createTask.fulfilled', () => {
      const mockTask = { id: '1', title: 'New Task' };

      const action = {
        type: createTask.fulfilled.type,
        payload: { data: mockTask }
      };
      const result = taskReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.tasks).toEqual([mockTask]);
    });

    it('should handle createTask.rejected', () => {
      const errorMessage = 'Failed to create task';

      const action = {
        type: createTask.rejected.type,
        payload: errorMessage
      };
      const result = taskReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(errorMessage);
    });
  });
});
```

### API Testing

```javascript
// client/src/__tests__/services/taskAPI.test.js
import axios from 'axios';
import TaskAPI from '../../services/taskAPI';

jest.mock('axios');
const mockedAxios = axios;

describe('TaskAPI', () => {
  let taskAPI;

  beforeEach(() => {
    taskAPI = new TaskAPI();
    mockedAxios.create.mockReturnValue(mockedAxios);
    localStorage.setItem('authToken', 'test-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('getTasks', () => {
    it('should fetch tasks with correct parameters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', title: 'Task 1' }],
          pagination: { page: 1, total: 1 }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await taskAPI.getTasks('workspace-123', {
        status: 'completed',
        page: 1
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/tasks?workspace=workspace-123&status=completed&page=1'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include auth token in headers', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await taskAPI.getTasks('workspace-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
    });
  });

  describe('createTask', () => {
    it('should create task with correct data', async () => {
      const taskData = { title: 'New Task', workspace: 'workspace-123' };
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', ...taskData }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await taskAPI.createTask(taskData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/tasks', taskData, {
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should redirect to login on 401 error', async () => {
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      mockedAxios.get.mockRejectedValue({
        response: { status: 401 }
      });

      await expect(taskAPI.getTasks('workspace-123')).rejects.toThrow();

      expect(window.location.href).toBe('/login');

      window.location = originalLocation;
    });

    it('should not redirect on other errors', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 500 }
      });

      await expect(taskAPI.getTasks('workspace-123')).rejects.toThrow();

      expect(window.location.href).not.toBe('/login');
    });
  });
});
```

## Integration Testing

### API Integration Tests

```javascript
// server/__tests__/integration/taskWorkflow.test.js
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import taskRoutes from '../../routes/taskRoutes';
import authRoutes from '../../routes/authRoutes';
import User from '../../models/user';
import Workspace from '../../models/workspace';

describe('Task Workflow Integration', () => {
  let app;
  let mongoServer;
  let authToken;
  let testWorkspace;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test app with all routes
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/tasks', taskRoutes);

    // Register and login test user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;

    // Create test workspace
    const workspaceResponse = await request(app)
      .post('/api/workspaces')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Workspace'
      });

    testWorkspace = workspaceResponse.body.data;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('Complete Task Workflow', () => {
    let createdTask;

    it('should create a new task', async () => {
      const taskData = {
        title: 'Integration Test Task',
        description: 'Testing complete workflow',
        priority: 'high',
        workspace: testWorkspace._id
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.status).toBe('not_started');

      createdTask = response.body.data;
    });

    it('should retrieve the created task', async () => {
      const response = await request(app)
        .get(`/api/tasks/${createdTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(createdTask._id);
    });

    it('should update task status', async () => {
      const updateData = {
        status: 'in_progress'
      };

      const response = await request(app)
        .put(`/api/tasks/${createdTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('in_progress');
    });

    it('should add a comment to the task', async () => {
      const commentData = {
        content: 'This is a test comment'
      };

      const response = await request(app)
        .post(`/api/tasks/${createdTask._id}/comment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
    });

    it('should retrieve task comments', async () => {
      const response = await request(app)
        .get(`/api/tasks/${createdTask._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should list tasks in workspace', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .query({ workspace: testWorkspace._id })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should delete the task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${createdTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should not find deleted task', async () => {
      const response = await request(app)
        .get(`/api/tasks/${createdTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
```

## End-to-End Testing

### E2E Test Setup

```javascript
// e2e/__tests__/taskManagement.test.js
import { test, expect } from '@playwright/test';

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new task', async ({ page }) => {
    // Navigate to tasks page
    await page.click('[data-testid="tasks-nav-link"]');
    await page.waitForURL('/tasks');

    // Click create task button
    await page.click('[data-testid="create-task-button"]');

    // Fill task form
    await page.fill('[data-testid="task-title-input"]', 'E2E Test Task');
    await page.fill('[data-testid="task-description-input"]', 'Testing task creation');
    await page.selectOption('[data-testid="task-priority-select"]', 'high');

    // Submit form
    await page.click('[data-testid="submit-task-button"]');

    // Verify task appears in list
    await expect(page.locator('[data-testid="task-list"]')).toContainText('E2E Test Task');
  });

  test('should complete a task', async ({ page }) => {
    // Navigate to tasks and find existing task
    await page.click('[data-testid="tasks-nav-link"]');
    await page.waitForURL('/tasks');

    // Click complete button on first task
    await page.click('[data-testid="task-item"]:first-child [data-testid="complete-task-button"]');

    // Verify task shows as completed
    await expect(page.locator('[data-testid="task-item"]:first-child')).toHaveClass(/completed/);
  });

  test('should edit task details', async ({ page }) => {
    // Navigate to tasks
    await page.click('[data-testid="tasks-nav-link"]');
    await page.waitForURL('/tasks');

    // Click edit button on first task
    await page.click('[data-testid="task-item"]:first-child [data-testid="edit-task-button"]');

    // Update task title
    await page.fill('[data-testid="task-title-input"]', 'Updated Task Title');

    // Save changes
    await page.click('[data-testid="save-task-button"]');

    // Verify update
    await expect(page.locator('[data-testid="task-item"]:first-child')).toContainText('Updated Task Title');
  });
});
```

## Test Automation

### CI/CD Pipeline Testing

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run backend tests
      run: npm run test:server
      working-directory: server

    - name: Run frontend tests
      run: npm run test:client
      working-directory: client

    - name: Run integration tests
      run: npm run test:integration

    - name: Generate coverage report
      run: npm run coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "npm run test:server && npm run test:client",
    "test:server": "cd server && npm test",
    "test:client": "cd client && npm test",
    "test:integration": "cd server && npm run test:integration",
    "test:e2e": "cd e2e && npm test",
    "coverage": "npm run coverage:server && npm run coverage:client",
    "coverage:server": "cd server && npm run coverage",
    "coverage:client": "cd client && npm run coverage"
  }
}
```

```json
// server/package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js"
  },
  "jest": {
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["<rootDir>/__tests__/setup.js"],
    "testMatch": ["**/__tests__/**/*.test.js"],
    "collectCoverageFrom": [
      "controllers/**/*.js",
      "models/**/*.js",
      "services/**/*.js",
      "middlewares/**/*.js",
      "utils/**/*.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

```json
// client/package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  },
  "vitest": {
    "environment": "jsdom",
    "setupFiles": ["src/__tests__/setup.js"],
    "test": {
      "globals": true,
      "environment": "jsdom"
    },
    "coverage": {
      "reporter": ["text", "json", "html"],
      "exclude": [
        "node_modules/",
        "src/__tests__/"
      ]
    }
  }
}
```

## Performance Testing

### Load Testing

```javascript
// server/__tests__/performance/taskLoad.test.js
import autocannon from 'autocannon';
import { createServer } from 'http';

describe('Task API Load Testing', () => {
  let server;
  let url;

  beforeAll((done) => {
    // Start test server
    server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: [] }));
    });

    server.listen(0, () => {
      url = `http://localhost:${server.address().port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should handle 100 concurrent requests', async () => {
    const result = await autocannon({
      url,
      connections: 100,
      duration: 10,
      requests: [{
        method: 'GET',
        path: '/api/tasks'
      }]
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result['2xx']).toBeGreaterThan(0);
    expect(result.averageLatency).toBeLessThan(1000); // Less than 1 second average
  });

  it('should handle task creation load', async () => {
    const result = await autocannon({
      url,
      connections: 50,
      duration: 10,
      requests: [{
        method: 'POST',
        path: '/api/tasks',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Load Test Task',
          workspace: 'workspace-123'
        })
      }]
    });

    expect(result.errors).toBe(0);
    expect(result['2xx']).toBeGreaterThan(0);
  });
});
```

This comprehensive testing guide ensures the AIVA Web Application maintains high quality, reliability, and performance through systematic testing practices at all levels of the testing pyramid.