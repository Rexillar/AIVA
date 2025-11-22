# Contributing Guidelines

Welcome to the AIVA Web Application project! This document outlines the processes and standards for contributing to the codebase.

## Getting Started

### Development Environment Setup

1. **Prerequisites**
   ```bash
   # Required software versions
   Node.js >= 18.0.0
   npm >= 8.0.0
   MongoDB >= 6.0
   Git >= 2.30.0
   ```

2. **Clone and Setup**
   ```bash
   git clone https://github.com/jadeja-mohitrajsinh/AIVA-LANDINGPAGE.git
   cd AIVA-LANDINGPAGE/AIVA-WEB-CODE

   # Install dependencies
   npm run install:all

   # Setup environment
   cp server/.env.example server/.env
   cp client/.env.example client/.env

   # Start development servers
   npm run dev
   ```

3. **Verify Setup**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080
   - API Health: http://localhost:8080/api/test

## Development Workflow

### Branching Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bug fix branch
git checkout -b bugfix/issue-description

# Create hotfix branch (from main)
git checkout -b hotfix/critical-fix
```

### Commit Conventions

We follow conventional commits for clear and structured commit messages:

```bash
# Format: type(scope): description

# Feature commits
feat(auth): add JWT token refresh functionality
feat(ui): implement dark mode toggle

# Bug fixes
fix(api): resolve task creation validation error
fix(ui): fix responsive layout on mobile devices

# Documentation
docs(api): update authentication endpoint documentation
docs(readme): add deployment instructions

# Refactoring
refactor(auth): simplify user registration flow
refactor(db): optimize task query performance

# Testing
test(auth): add unit tests for password validation
test(e2e): add end-to-end test for task creation

# Breaking changes
feat(api)!: migrate to GraphQL API
```

### Pull Request Process

1. **Create PR**
   - Use descriptive title following commit conventions
   - Provide detailed description of changes
   - Reference related issues

2. **PR Template**
   ```markdown
   ## Description
   Brief description of the changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Manual testing completed

   ## Screenshots (if applicable)
   Add screenshots of UI changes

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] Tests pass
   - [ ] No breaking changes
   ```

3. **Code Review**
   - At least one reviewer approval required
   - Address all review comments
   - Keep PRs focused and small

4. **Merge Strategy**
   - Squash merge for feature branches
   - Merge commit for releases
   - Linear history maintained

## Code Quality Standards

### Code Style

#### JavaScript/TypeScript
```javascript
// Use ES6+ features
const user = { name, email };
const users = await User.find({ active: true });

// Prefer async/await over promises
async function getUser(id) {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    logger.error('User not found', { userId: id, error });
    throw error;
  }
}

// Use destructuring
function processUser({ name, email, preferences }) {
  // implementation
}
```

#### React Components
```jsx
// Functional components with hooks
function TaskCard({ task, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="task-card">
      {isEditing ? (
        <TaskForm task={task} onSave={handleSave} />
      ) : (
        <TaskDisplay task={task} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}
```

### Naming Conventions

```javascript
// Files and directories: kebab-case
// user-profile.jsx, task-manager.js

// Components: PascalCase
// UserProfile, TaskManager

// Functions and variables: camelCase
// getUserData, processTaskUpdate

// Constants: UPPER_SNAKE_CASE
// MAX_RETRY_ATTEMPTS, DEFAULT_TIMEOUT

// Database models: PascalCase
// User, Task, Workspace
```

### Error Handling

```javascript
// Backend error handling
app.use(asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json(task);
}));

// Frontend error handling
try {
  const result = await api.createTask(taskData);
  showSuccess('Task created successfully');
} catch (error) {
  showError(error.message || 'Failed to create task');
  logger.error('Task creation failed', error);
}
```

## Testing Requirements

### Unit Tests

```javascript
// Backend unit test
describe('Task Service', () => {
  describe('createTask', () => {
    it('should create a task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        creator: userId,
        workspace: workspaceId
      };

      const task = await taskService.createTask(taskData);

      expect(task.title).toBe('Test Task');
      expect(task.creator.toString()).toBe(userId);
    });

    it('should throw error for invalid data', async () => {
      const invalidData = { title: '' };

      await expect(taskService.createTask(invalidData))
        .rejects.toThrow('Title is required');
    });
  });
});
```

### Integration Tests

```javascript
// API integration test
describe('Task API', () => {
  let authToken;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('POST /api/tasks', () => {
    it('should create task and return 201', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Integration Test Task',
          workspace: workspaceId
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Integration Test Task');
    });
  });
});
```

### Frontend Tests

```javascript
// React component test
import { render, screen, fireEvent } from '@testing-library/react';

describe('TaskCard', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    status: 'in_progress'
  };

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onUpdate when status changes', () => {
    const mockOnUpdate = jest.fn();
    render(<TaskCard task={mockTask} onUpdate={mockOnUpdate} />);

    fireEvent.click(screen.getByText('Mark Complete'));

    expect(mockOnUpdate).toHaveBeenCalledWith('task-1', { status: 'completed' });
  });
});
```

## Documentation Requirements

### Code Documentation

```javascript
/**
 * Creates a new task in the specified workspace
 * @param {Object} taskData - Task creation data
 * @param {string} taskData.title - Task title (required)
 * @param {string} taskData.description - Task description
 * @param {string} taskData.workspace - Workspace ID (required)
 * @param {string} taskData.creator - Creator user ID (required)
 * @returns {Promise<Object>} Created task object
 * @throws {Error} If validation fails or workspace not found
 */
async function createTask(taskData) {
  // implementation
}
```

### API Documentation

```javascript
/**
 * POST /api/tasks
 * Create a new task
 *
 * Request Body:
 * {
 *   "title": "Task title",
 *   "description": "Task description",
 *   "workspace": "workspace-id",
 *   "priority": "medium"
 * }
 *
 * Response: 201 Created
 * {
 *   "success": true,
 *   "data": { ...task object }
 * }
 */
router.post('/', createTask);
```

## Security Guidelines

### Input Validation

```javascript
// Server-side validation
const validateTaskData = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(2000),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    dueDate: Joi.date().min('now')
  });

  return schema.validate(data);
};
```

### Authentication Checks

```javascript
// Middleware for protected routes
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Data Sanitization

```javascript
// Sanitize user input
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u'],
    allowedAttributes: {}
  });
};
```

## Performance Guidelines

### Database Optimization

```javascript
// Add proper indexes
TaskSchema.index({ workspace: 1, status: 1 });
TaskSchema.index({ creator: 1 });
TaskSchema.index({ dueDate: 1 });

// Use lean queries for read-only operations
const tasks = await Task.find({ workspace: workspaceId }).lean();

// Implement pagination
const tasks = await Task.find()
  .sort({ createdAt: -1 })
  .limit(20)
  .skip((page - 1) * 20);
```

### Frontend Optimization

```javascript
// Use React.memo for expensive components
const TaskCard = React.memo(({ task, onUpdate }) => {
  // component logic
});

// Implement virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

// Lazy load heavy components
const DiagramEditor = lazy(() => import('./DiagramEditor'));
```

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Rollback plan prepared

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Email**: mohitrajjadeja4@gmail.com for direct support

### Issue Reporting

When reporting bugs, please include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Environment details** (OS, browser, Node version)
5. **Error messages and stack traces**
6. **Screenshots** (for UI issues)

### Feature Requests

For new features, please provide:

1. **Problem description**
2. **Proposed solution**
3. **Alternative solutions considered**
4. **Additional context**

Thank you for contributing to AIVA! Your efforts help make this platform better for everyone.