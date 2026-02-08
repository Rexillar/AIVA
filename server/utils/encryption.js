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

   ⟁  PURPOSE      : Provide cryptographic utilities for data protection

   ⟁  WHY          : Zero-trust data storage model

   ⟁  WHAT         : AES-256-GCM encryption and decryption utilities

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : AES-256-GCM (AEAD)
   ⟁  TRUST LEVEL  : CRITICAL
   ⟁  DOCS : /docs/backend/encryption.md

   ⟁  USAGE RULES  : Pure functions • Error handling • Documentation

        "Data encrypted. Privacy protected. Security enforced."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import crypto from 'crypto';

const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: ENCRYPTION_KEY not found in environment. Production requires a stable key.');
    }
    console.warn('⚠️ ENCRYPTION_KEY not found, using dev fallback.');
    return Buffer.alloc(32, 'aiva-dev-fallback-key');
  }
  // Log first 4 chars of key for verification (safe for debugging)
  const keyBuffer = Buffer.from(key, 'hex');
  console.log(`🔑 Using ENCRYPTION_KEY: ${key.substring(0, 4)}... (Length: ${keyBuffer.length} bytes)`);
  return keyBuffer;
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM, this is 12-16 bytes
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;

class FieldEncryption {
  /**
   * Encrypt a string value
   * @param {string} text - The text to encrypt
   * @returns {string} - Encrypted text in format: salt:iv:tag:encrypted
   */
  static encrypt(text) {
    if (!text || typeof text !== 'string') {
      return text; // Return as-is if not a string or empty
    }

    // Check if already encrypted
    const parts = text.split(':');
    if (parts.length === 4) {
      return text; // Already encrypted
    }

    try {
      // Generate random salt for this field
      const salt = crypto.randomBytes(SALT_LENGTH);

      // Derive key from master key and salt
      const key = crypto.pbkdf2Sync(
        getEncryptionKey(),
        salt,
        10000,
        32,
        'sha256'
      );

      // Generate random IV
      const iv = crypto.randomBytes(IV_LENGTH);

      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      // Encrypt
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Combine salt:iv:tag:encrypted
      return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback to unencrypted text
    }
  }

  /**
   * Decrypt a string value
   * @param {string} encryptedText - The encrypted text in format: salt:iv:tag:encrypted
   * @returns {string} - Decrypted text
   */
  static decrypt(encryptedText) {
    if (!encryptedText || typeof encryptedText !== 'string') {
      return encryptedText; // Return as-is if not a string or empty
    }

    // Check if it's in encrypted format
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      return encryptedText; // Assume it's unencrypted plain text
    }

    try {
      const [saltHex, ivHex, tagHex, encrypted] = parts;

      // Convert from hex
      const salt = Buffer.from(saltHex, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');

      // Derive key from master key and salt
      const key = crypto.pbkdf2Sync(
        getEncryptionKey(),
        salt,
        10000,
        32,
        'sha256'
      );

      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error(`❌ Decryption error [Payload: ${encryptedText.substring(0, 20)}...]:`, error.message);
      return encryptedText; // Fallback to encrypted text if decryption fails
    }
  }
}

/**
 * Mongoose plugin for automatic field encryption
 * @param {mongoose.Schema} schema - The mongoose schema
 * @param {Object} options - Plugin options
 * @param {Array} options.encryptedFields - Array of field names to encrypt
 */
export const encryptionPlugin = (schema, options = {}) => {
  const { encryptedFields = [] } = options;

  // Helper function to check if a value is already encrypted
  const isEncrypted = (value) => {
    if (!value || typeof value !== 'string') return false;
    const parts = value.split(':');
    return parts.length === 4; // salt:iv:tag:encrypted format
  };

  // Pre-save hook to encrypt all specified fields
  schema.pre('save', function (next) {
    try {
      encryptedFields.forEach(fieldPath => {
        if (fieldPath.includes('.')) {
          // Handle nested fields (e.g., 'labels.name', 'subtasks.title')
          const parts = fieldPath.split('.');
          const arrayPath = parts[0];
          const nestedField = parts.slice(1).join('.');

          const array = this.get(arrayPath);

          if (Array.isArray(array)) {
            array.forEach(item => {
              if (item && item[nestedField] !== undefined) {
                const value = item[nestedField];
                if (typeof value === 'string' && value && !isEncrypted(value)) {
                  item[nestedField] = FieldEncryption.encrypt(value);
                }
              }
            });
          }
        } else {
          // Handle top-level fields
          const value = this.get(fieldPath);
          if (typeof value === 'string' && value && !isEncrypted(value)) {
            this.set(fieldPath, FieldEncryption.encrypt(value));
          }
        }
      });
      next();
    } catch (error) {
      console.error('Encryption error in pre-save hook:', error);
      next(error);
    }
  });

  // Post-save hook to decrypt fields (so the returned document is readable)
  schema.post('save', function (doc) {
    try {
      encryptedFields.forEach(fieldPath => {
        if (fieldPath.includes('.')) {
          // Handle nested fields
          const parts = fieldPath.split('.');
          const arrayPath = parts[0];
          const nestedField = parts.slice(1).join('.');

          const array = doc.get(arrayPath);

          if (Array.isArray(array)) {
            array.forEach(item => {
              if (item && item[nestedField] !== undefined) {
                const value = item[nestedField];
                if (typeof value === 'string' && value && isEncrypted(value)) {
                  item[nestedField] = FieldEncryption.decrypt(value);
                }
              }
            });
          }
        } else {
          // Handle top-level fields
          const value = doc.get(fieldPath);
          if (typeof value === 'string' && value && isEncrypted(value)) {
            doc.set(fieldPath, FieldEncryption.decrypt(value), { strict: false });
          }
        }
      });
    } catch (error) {
      console.error('Decryption error in post-save hook:', error);
    }
  });

  // Post-init hook to decrypt fields when loading from database
  schema.post('init', function () {
    try {
      encryptedFields.forEach(fieldPath => {
        if (fieldPath.includes('.')) {
          // Handle nested fields
          const parts = fieldPath.split('.');
          const arrayPath = parts[0];
          const nestedField = parts.slice(1).join('.');

          const array = this.get(arrayPath);

          if (Array.isArray(array)) {
            array.forEach(item => {
              if (item && item[nestedField] !== undefined) {
                const value = item[nestedField];
                if (typeof value === 'string' && value && isEncrypted(value)) {
                  item[nestedField] = FieldEncryption.decrypt(value);
                }
              }
            });
          }
        } else {
          // Handle top-level fields
          const value = this.get(fieldPath);
          if (typeof value === 'string' && value && isEncrypted(value)) {
            this.set(fieldPath, FieldEncryption.decrypt(value), { strict: false });
          }
        }
      });
    } catch (error) {
      console.error('Decryption error in post-init hook:', error);
    }
  });
};

/**
 * Encrypt search queries for encrypted fields
 * @param {Object} query - MongoDB query object
 * @param {Array} encryptedFields - Array of encrypted field names
 * @returns {Object} - Modified query with encrypted values
 */
export const encryptQuery = (query, encryptedFields = []) => {
  const encryptedQuery = { ...query };

  encryptedFields.forEach(field => {
    if (encryptedQuery[field] && typeof encryptedQuery[field] === 'string') {
      encryptedQuery[field] = FieldEncryption.encrypt(encryptedQuery[field]);
    }
  });

  return encryptedQuery;
};

/**
 * Decrypt document fields for response
 * @param {Object} doc - MongoDB document
 * @param {Array} encryptedFields - Array of encrypted field names
 * @returns {Object} - Document with decrypted fields
 */
export const decryptDocument = (doc, encryptedFields = []) => {
  if (!doc) return doc;

  const decryptedDoc = doc.toObject ? doc.toObject() : { ...doc };

  encryptedFields.forEach(field => {
    if (decryptedDoc[field] && typeof decryptedDoc[field] === 'string') {
      decryptedDoc[field] = FieldEncryption.decrypt(decryptedDoc[field]);
    }
  });

  return decryptedDoc;
};

export { FieldEncryption };
export default FieldEncryption;