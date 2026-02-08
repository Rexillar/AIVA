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
   ⟁  DOMAIN       : BUSINESS LOGIC

   ⟁  PURPOSE      : Implement complex functionality with object-oriented design

   ⟁  WHY          : Organized code structure and reusability

   ⟁  WHAT         : Class-based implementation with methods and state

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Classes designed. Methods implemented. Functionality delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import { driveService } from './googleDriveService.js';
import { uploadFileToMongo, getFileFromMongo, deleteFileFromMongo, getFileInfo } from './mongoFileService.js';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'google-drive'; // google-drive, gridfs, gcs

class StorageService {
  constructor() {
    this.type = STORAGE_TYPE;
  }

  async uploadFile(fileBuffer, fileName, mimeType, metadata = {}) {
    switch (this.type) {
      case 'google-drive':
        return await driveService.uploadFile(fileBuffer, fileName, mimeType, metadata);

      case 'gridfs':
        return await uploadFileToMongo(fileBuffer, fileName, mimeType, metadata);

      case 'gcs':
        throw new Error('GCS storage not implemented yet');

      default:
        throw new Error(`Unknown storage type: ${this.type}`);
    }
  }

  async downloadFile(fileId) {
    switch (this.type) {
      case 'google-drive':
        return await driveService.downloadFile(fileId);

      case 'gridfs':
        return await getFileFromMongo(fileId);

      case 'gcs':
        throw new Error('GCS storage not implemented yet');

      default:
        throw new Error(`Unknown storage type: ${this.type}`);
    }
  }

  async deleteFile(fileId) {
    switch (this.type) {
      case 'google-drive':
        return await driveService.deleteFile(fileId);

      case 'gridfs':
        return await deleteFileFromMongo(fileId);

      case 'gcs':
        throw new Error('GCS storage not implemented yet');

      default:
        throw new Error(`Unknown storage type: ${this.type}`);
    }
  }

  async getFileInfo(fileId) {
    switch (this.type) {
      case 'google-drive':
        return await driveService.getFileInfo(fileId);

      case 'gridfs':
        return await getFileInfo(fileId);

      case 'gcs':
        throw new Error('GCS storage not implemented yet');

      default:
        throw new Error(`Unknown storage type: ${this.type}`);
    }
  }
}

const storageService = new StorageService();

export { storageService, STORAGE_TYPE };
export default storageService;