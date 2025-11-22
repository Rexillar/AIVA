# File Management

AIVA provides comprehensive file management capabilities with multiple storage backends, access controls, and collaboration features.

## Overview

The file management system supports secure file storage, sharing, and collaboration with support for various file types and storage providers.

## Storage Architecture

### Primary Storage: Google Cloud Storage

```json
{
  "provider": "gcs",
  "bucket": "aiva-files-prod",
  "region": "us-central1",
  "features": {
    "versioning": true,
    "encryption": true,
    "cdn": true
  }
}
```

### Fallback Storage: MongoDB GridFS

```json
{
  "provider": "gridfs",
  "database": "aiva-files",
  "chunkSize": 255 * 1024, // 255KB chunks
  "features": {
    "metadata": true,
    "streaming": true
  }
}
```

### Alternative Storage: MinIO

```json
{
  "provider": "minio",
  "endpoint": "minio.example.com",
  "bucket": "aiva-files",
  "features": {
    "s3-compatible": true,
    "distributed": true
  }
}
```

## File Upload Process

### Single File Upload

```javascript
// Frontend upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('workspaceId', workspaceId);

fetch('/api/files/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Batch Upload

```javascript
// Multiple file upload
const formData = new FormData();
files.forEach((file, index) => {
  formData.append(`files[${index}]`, file);
});

fetch('/api/files/upload/batch', {
  method: 'POST',
  body: formData
});
```

### Drag and Drop Upload

```javascript
// HTML5 drag and drop
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  uploadFiles(files);
});
```

## File Organization

### Folder Structure

```json
{
  "workspace": "ws-123",
  "folders": [
    {
      "name": "Documents",
      "path": "/documents",
      "permissions": {
        "read": ["member", "viewer"],
        "write": ["admin", "member"]
      },
      "subfolders": [
        {
          "name": "Project Docs",
          "path": "/documents/project-docs"
        }
      ]
    },
    {
      "name": "Images",
      "path": "/images",
      "allowedTypes": ["jpg", "png", "gif", "svg"]
    }
  ]
}
```

### File Metadata

```json
{
  "id": "file-456",
  "filename": "project-proposal.pdf",
  "originalName": "Project Proposal v2.pdf",
  "mimetype": "application/pdf",
  "size": 2457600, // bytes
  "path": "/documents/project-proposal.pdf",
  "uploadedBy": "user-789",
  "workspace": "ws-123",
  "folder": "documents",
  "version": 2,
  "checksum": "a1b2c3d4...",
  "permissions": {
    "public": false,
    "allowedUsers": ["user-111", "user-222"]
  },
  "tags": ["proposal", "important"],
  "uploadedAt": "2024-01-15T10:30:00Z",
  "lastModified": "2024-01-15T14:20:00Z"
}
```

## Access Control

### Permission Levels

```json
{
  "filePermissions": {
    "owner": {
      "read": true,
      "write": true,
      "delete": true,
      "share": true,
      "download": true
    },
    "editor": {
      "read": true,
      "write": true,
      "delete": false,
      "share": false,
      "download": true
    },
    "viewer": {
      "read": true,
      "write": false,
      "delete": false,
      "share": false,
      "download": true
    }
  }
}
```

### Sharing Options

```javascript
// Share with specific users
POST /api/files/:fileId/share
{
  "users": [
    { "userId": "user-123", "permission": "editor" },
    { "userId": "user-456", "permission": "viewer" }
  ],
  "message": "Please review this document"
}

// Generate public link
POST /api/files/:fileId/public-link
{
  "expiresIn": 86400, // 24 hours
  "downloadAllowed": true,
  "password": "optional-password"
}
```

## File Operations

### Download Files

```javascript
// Direct download
GET /api/files/:fileId/download

// Stream download for large files
GET /api/files/:fileId/download?stream=true

// Batch download
POST /api/files/download/batch
{
  "fileIds": ["file-1", "file-2", "file-3"],
  "format": "zip"
}
```

### File Versioning

```json
{
  "fileId": "file-456",
  "versions": [
    {
      "version": 1,
      "uploadedAt": "2024-01-10T09:00:00Z",
      "uploadedBy": "user-789",
      "size": 2048000,
      "changes": "Initial version"
    },
    {
      "version": 2,
      "uploadedAt": "2024-01-15T10:30:00Z",
      "uploadedBy": "user-123",
      "size": 2457600,
      "changes": "Updated pricing section"
    }
  ]
}
```

### File Preview

```javascript
// Generate preview
GET /api/files/:fileId/preview

// Supported preview types:
// - Images: Direct display
// - PDFs: PDF.js viewer
// - Documents: Google Docs viewer
// - Code: Syntax highlighted
// - Videos: HTML5 player
```

## Search and Discovery

### File Search

```javascript
// Basic search
GET /api/files/search?q=document

// Advanced search
GET /api/files/search?query=document&type=pdf&uploadedBy=user-123&dateFrom=2024-01-01
```

### Search Filters

```json
{
  "filters": {
    "query": "project proposal",
    "type": ["pdf", "docx"],
    "uploadedBy": ["user-123"],
    "workspace": "ws-456",
    "folder": "/documents",
    "dateRange": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "sizeRange": {
      "min": 1024,
      "max": 10485760
    },
    "tags": ["important", "review"]
  },
  "sort": {
    "field": "uploadedAt",
    "order": "desc"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

## File Processing

### Image Processing

```json
{
  "processing": {
    "resize": {
      "width": 800,
      "height": 600,
      "maintainAspectRatio": true
    },
    "optimize": {
      "quality": 85,
      "format": "webp"
    },
    "thumbnail": {
      "sizes": [150, 300, 600]
    }
  }
}
```

### Document Processing

```json
{
  "processing": {
    "extract": {
      "text": true,
      "metadata": true,
      "images": false
    },
    "convert": {
      "targetFormat": "pdf",
      "options": {
        "quality": "high",
        "ocr": true
      }
    }
  }
}
```

## Synchronization

### Cloud Sync

```javascript
// Sync with Google Drive
POST /api/files/sync/gdrive
{
  "folderId": "gdrive-folder-id",
  "workspaceId": "ws-123",
  "syncDirection": "bidirectional"
}

// Sync with Dropbox
POST /api/files/sync/dropbox
{
  "path": "/AIVA Files",
  "workspaceId": "ws-123"
}
```

### Real-time Sync

```javascript
// WebSocket events for file changes
socket.on('file-updated', (data) => {
  console.log('File updated:', data.fileId);
  refreshFileList();
});

socket.on('file-deleted', (data) => {
  removeFileFromUI(data.fileId);
});
```

## Security Features

### Encryption

```json
{
  "encryption": {
    "atRest": {
      "algorithm": "AES-256-GCM",
      "keyManagement": "envelope-encryption"
    },
    "inTransit": {
      "protocol": "TLS 1.3",
      "certificate": "Let's Encrypt"
    }
  }
}
```

### Virus Scanning

```json
{
  "security": {
    "virusScan": {
      "enabled": true,
      "engine": "ClamAV",
      "action": "quarantine"
    },
    "contentFilter": {
      "blockTypes": ["exe", "bat", "scr"],
      "maxFileSize": 100 * 1024 * 1024 // 100MB
    }
  }
}
```

## Analytics and Monitoring

### Usage Statistics

```json
{
  "analytics": {
    "totalFiles": 15420,
    "totalSize": "2.5GB",
    "uploadsThisMonth": 1234,
    "downloadsThisMonth": 5678,
    "popularTypes": [
      { "type": "pdf", "count": 4520 },
      { "type": "jpg", "count": 3210 },
      { "type": "docx", "count": 2890 }
    ]
  }
}
```

### Performance Monitoring

```json
{
  "performance": {
    "uploadSpeed": "5.2 MB/s",
    "downloadSpeed": "8.1 MB/s",
    "averageResponseTime": 245, // ms
    "errorRate": 0.02,
    "storageUtilization": 0.75 // 75%
  }
}
```

## Backup and Recovery

### Automated Backup

```json
{
  "backup": {
    "schedule": "daily",
    "retention": {
      "daily": 30,
      "weekly": 12,
      "monthly": 24
    },
    "storage": {
      "primary": "gcs-backup-bucket",
      "secondary": "aws-s3-backup"
    }
  }
}
```

### Disaster Recovery

```json
{
  "recovery": {
    "rpo": 3600, // 1 hour Recovery Point Objective
    "rto": 14400, // 4 hours Recovery Time Objective
    "procedures": {
      "dataRestoration": "Automated from backup",
      "serviceRestoration": "Blue-green deployment",
      "communication": "Automated alerts to stakeholders"
    }
  }
}
```

## Integration APIs

### Webhooks

```javascript
// File upload webhook
POST https://your-app.com/webhooks/files
{
  "event": "file.uploaded",
  "file": {
    "id": "file-123",
    "name": "document.pdf",
    "size": 2048000
  },
  "workspace": "ws-456",
  "uploadedBy": "user-789"
}
```

### REST API

```javascript
// Programmatic file access
const files = await fetch('/api/files', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const upload = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData
});
```

The file management system provides a robust, scalable solution for handling all file-related operations in the AIVA platform, with strong emphasis on security, performance, and user experience.