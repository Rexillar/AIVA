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
   ⟁  DOMAIN       : UNKNOWN

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : UNKNOWN
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : UNKNOWN

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

let storage = null;

export const initializeGCS = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // In production (Cloud Run), credentials are automatically handled.
      console.log('Initializing GCS for production...');
      const projectId = process.env.GCP_PROJECT_ID;
      if (!projectId) {
        throw new Error('GCP_PROJECT_ID is not defined for production environment.');
      }
      storage = new Storage({ projectId });
    } else {
      // In development (local/docker), use the key file.
      console.log('Initializing GCS for development...');
      const keyFilename = process.env.GCS_KEY_FILE || path.join(process.cwd(), 'config', 'gcs-key.json');

      if (!fs.existsSync(keyFilename)) {
        throw new Error(`GCS key file not found at path: ${keyFilename}. Please ensure the file exists.`);
      }

      // The key file itself must contain the project_id.
      storage = new Storage({ keyFilename });
    }

    // Perform a connection test.
    await storage.getBuckets();
    console.log('✅ Google Cloud Storage connection successful.');

  } catch (error) {
    console.error('❌ FATAL: Could not connect to Google Cloud Storage.');
    // Re-throw the error to be caught by the startup process in index.js
    throw error;
  }
};

export { storage };
