# Storage Configuration Guide

This application supports multiple storage providers for file uploads. You can configure which storage service to use by setting the `STORAGE_TYPE` environment variable.

## Supported Storage Types

### 1. Google Drive (`google-drive`)
- **Description**: Files are stored in Google Drive using the Google Drive API
- **Requirements**: Google Cloud service account with Drive API enabled
- **Environment Variables**:
  ```env
  STORAGE_TYPE=google-drive
  GOOGLE_DRIVE_CREDENTIALS_PATH=./config/gcs-key.json
  GOOGLE_DRIVE_FOLDER_ID=  # Optional: Specific folder ID for uploads
  ```

### 2. MongoDB GridFS (`gridfs`)
- **Description**: Files are stored in MongoDB using GridFS
- **Requirements**: MongoDB connection
- **Environment Variables**:
  ```env
  STORAGE_TYPE=gridfs
  ```

### 3. Google Cloud Storage (`gcs`)
- **Description**: Files are stored in Google Cloud Storage buckets
- **Requirements**: Google Cloud service account with Storage API enabled
- **Environment Variables**:
  ```env
  STORAGE_TYPE=gcs
  GCP_PROJECT_ID=your-project-id
  GCS_BUCKET_NAME=your-bucket-name
  GCS_KEY_FILE=./config/gcs-key.json
  ```

## Google Drive Setup

1. **Enable Google Drive API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Google Drive API for your project

2. **Create Service Account**:
   - Create a service account in Google Cloud Console
   - Download the JSON key file
   - Place it in `server/config/gcs-key.json`

3. **Share Drive Folder** (Optional):
   - Create a folder in Google Drive
   - Share it with the service account email (found in the JSON key)
   - Set `GOOGLE_DRIVE_FOLDER_ID` to the folder ID

## Switching Storage Types

To switch between storage types:

1. Update the `STORAGE_TYPE` in your `.env` file
2. Ensure the required credentials are configured
3. Restart the server
4. Existing files will remain accessible, but new uploads will use the new storage type

## File Access

Regardless of the storage type, files are accessed through the same API endpoints:
- Upload: `POST /api/workspace/:workspaceId/uploads`
- Download: `GET /api/uploads/:fileId`
- Delete: `DELETE /api/uploads/:fileId`

The application automatically handles the differences between storage providers.