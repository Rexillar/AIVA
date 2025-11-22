# AIVA Web Application Documentation

## Overview

AIVA is a comprehensive web-based productivity and collaboration platform that combines task management, workspace collaboration, AI-powered assistance, and various productivity tools into a unified application.

### Key Features

- **Task Management**: Create, organize, and track tasks with subtasks, due dates, priorities, and progress tracking
- **Workspace Collaboration**: Multi-user workspaces with role-based permissions, member management, and team collaboration
- **AI Assistant**: Integrated AI chatbot powered by Google's Gemini for intelligent assistance and automation
- **Notes & Documentation**: Rich text editor with diagram support for creating and sharing notes
- **Habits Tracking**: Personal habit tracking with analytics and progress monitoring
- **File Management**: Secure file upload, storage, and sharing with multiple storage backends
- **Real-time Communication**: Socket.io-powered real-time updates and notifications
- **Calendar Integration**: Calendar view for tasks, reminders, and scheduling

### Technology Stack

**Frontend:**
- React 18 with Vite
- Redux Toolkit & RTK Query for state management
- Tailwind CSS for styling
- Socket.io client for real-time features

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication with role-based access control
- Socket.io for real-time communication
- Google Gemini AI integration
- Multiple storage backends (Google Cloud Storage, MinIO, MongoDB GridFS)

**Infrastructure:**
- Docker support for containerization
- Google Cloud Platform integration
- Email services (Gmail SMTP)
- File storage services

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB database
- Google Cloud Platform account (for storage and AI services)
- Gmail account (for email notifications)

### Installation

1. Clone the repository
2. Install dependencies for both client and server
3. Configure environment variables
4. Start the development servers

See [Setup Guide](./setup/) for detailed instructions.

## Documentation Structure

### 📁 [Setup](./setup/)
- [Installation Guide](./setup/installation.md)
- [Environment Configuration](./setup/environment.md)
- [Deployment Guide](./setup/deployment.md)

### 📁 [Architecture](./architecture/)
- [System Overview](./architecture/overview.md)
- [Data Models](./architecture/data-models.md)
- [API Design](./architecture/api-design.md)
- [Security](./architecture/security.md)

### 📁 [API Reference](./api/)
- [Authentication](./api/authentication.md)
- [Tasks API](./api/tasks.md)
- [Workspaces API](./api/workspaces.md)
- [AI/Chat API](./api/chat.md)
- [Complete API Documentation](./api/index.md)

### 📁 [Features](./features/)
- [Task Management](./features/tasks.md)
- [Workspace Collaboration](./features/workspaces.md)
- [AI Assistant](./features/ai-assistant.md)
- [File Management](./features/files.md)
- [Notes & Diagrams](./features/notes.md)

### 📁 [Development](./development/)
- [Contributing Guidelines](./development/contributing.md)
- [Coding Standards](./development/standards.md)
- [Testing](./development/testing.md)
- [Development Inventory](./development/inventory.md)

## Project Structure

```
AIVA-WEB-CODE/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # State management
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                 # Node.js backend application
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   ├── middlewares/      # Express middlewares
│   └── config/           # Configuration files
├── docs/                  # Documentation (this folder)
└── AIVA-LANDING/         # Landing page
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./development/contributing.md) for details on how to get started.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## Support

- 📧 **Email**: mohitrajjadeja4@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/jadeja-mohitrajsinh/AIVA-LANDINGPAGE/issues)
- 📖 **Documentation**: This docs folder

## License

This project is proprietary software owned by Mohitraj Jadeja.

## Version History

- **v1.0.0** - Initial release with core features
  - Task management system
  - Workspace collaboration
  - AI assistant integration
  - File storage and sharing
  - Real-time notifications

---

*Last updated: October 28, 2025*