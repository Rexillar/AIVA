import { Storage } from '@google-cloud/storage';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyFilePath = path.join(__dirname, '../config/gcs-key.json');

const storage = new Storage({
  keyFilename: keyFilePath,
  projectId: 'plasma-line-471215-r9'
});

export const checkGCSConnection = async () => {
  try {
    console.log('🔄 Checking GCS connection...');
    await storage.getBuckets({ maxResults: 1 });
    console.log('✅ GCS service ready');
    return true;
  } catch (error) {
    console.error('❌ GCS connection failed:', error.message);
    return false;
  }
};

export { storage };
