/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Deterministic Execution System
   ◉  Rule-Bound • State-Aware • Non-Emotive

   ⟁  SYSTEM LAYER : BACKEND CORE
   ⟁  DOMAIN       : UTILITIES

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Pure functions • Error handling • Documentation

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { adminStorage } from '../config/firebase.js';

export const uploadFileToFirebase = async (file, path) => {
  try {
    // Validate inputs
    if (!file?.buffer) {
      throw new Error('Invalid file object');
    }

    if (!path) {
      throw new Error('File path is required');
    }

    // Create file options
    const options = {
      destination: path,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalname: file.originalname
        }
      }
    };

    // Upload file
    const [uploadedFile] = await adminStorage.upload(file.buffer, options);

    // Make file public
    await uploadedFile.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${adminStorage.name}/${path}`;

    return {
      filename: file.originalname,
      url: publicUrl,
      path: path,
      mimetype: file.mimetype,
      size: file.size
    };
  } catch (error) {
    //console.error('Firebase upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

export const generateStoragePath = (workspaceId, taskId, filename) => {
  if (!workspaceId || !taskId || !filename) {
    throw new Error('Invalid storage path parameters');
  }

  // Sanitize the filename to remove special characters
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.]/g, '_');

  // Generate a unique path with timestamp
  return `workspaces/${workspaceId}/tasks/${taskId}/${Date.now()}_${sanitizedFilename}`;
}; 