# AIVA - AI Virtual Assistant

**AIVA** (AI Virtual Assistant) is a powerful, deterministic, and state-aware AI assistant designed to streamline your digital life. It combines advanced reasoning capabilities with deep system integration to help you organize, automate, and execute tasks efficiently.

## 🚀 Features

*   **Intelligent Assistance**: Powered by Google's Gemini AI for high-level reasoning and context awareness.
*   **Real-time Collaboration**: Seamless synchronization of tasks, chats, and notes across devices using Socket.io.
*   **Rich Text Editor**: A versatile editor based on Tiptap for creating beautiful documents and notes.
*   **Smart Calendar**: Integrated FullCalendar for managing your schedule and events.
*   **Secure Storage**: Encrypted file storage supporting MinIO and Google Cloud Storage.
*   **Cross-Platform**: Available as a modern web application and a dedicated desktop app (Electron).

## 🛠️ Tech Stack

### Client
*   **Framework**: React (Vite)
*   **Desktop Wrapper**: Electron
*   **Styling**: TailwindCSS
*   **State Management**: Redux Toolkit & Zustand
*   **Editor**: Tiptap
*   **Visualization**: Recharts, React Flow

### Server
*   **Runtime**: Node.js
*   **Framework**: Express
*   **Database**: MongoDB (Mongoose)
*   **Real-time**: Socket.io
*   **Caching**: Redis
*   **AI Integration**: Google Generative AI (Gemini)
*   **Task Scheduling**: Node-cron

## 📖 Documentation

We have comprehensive documentation to help you get started:

*   [**Getting Started**](./docs/getting-started.md): The fastest way to get AIVA running.
*   [**Docker Guide**](./docs/docker.md): Detailed instructions for Docker deployment.
*   [**Architecture**](./docs/architecture.md): Overview of the system design.
*   [**Configuration**](./docs/configuration.md): Managing environment variables.
*   [**API Overview**](./docs/api.md): Developer guide to the backend API.
*   [**Contributing**](./docs/contributing.md): How to contribute to AIVA.

## 🏁 Quick Start

To run AIVA locally using Docker (recommended):

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Rexillar/AIVA.git
    cd AIVA
    ```

2.  **Start the application**:
    Please refer to the [Getting Started Guide](./docs/getting-started.md) for detailed instructions on setting up your environment and running the containers.

## 🤝 Contributing

We welcome contributions from the community! Please check out our [Contributing Guide](./docs/contributing.md) to learn how you can help improve AIVA.

## 📄 License

This project is licensed under the [ISC License](LICENSE).
