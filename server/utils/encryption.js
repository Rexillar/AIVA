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

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
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

    try {
      // Generate random salt for this field
      const salt = crypto.randomBytes(SALT_LENGTH);
      
      // Derive key from master key and salt
      const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 10000, 32, 'sha256');
      
      // Generate random IV
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Create cipher
      const cipher = crypto.createCipherGCM(ALGORITHM, key, iv);
      
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
      const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 10000, 32, 'sha256');
      
      // Create decipher
      const decipher = crypto.createDecipherGCM(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Fallback to encrypted text if decryption fails
    }
  }

  /**
   * Create encrypted getter for mongoose schema
   * @param {string} fieldPath - The field path in the schema
   * @returns {Function} - Getter function
   */
  static createGetter(fieldPath) {
    return function() {
      const value = this.get(fieldPath, null, { getters: false });
      return FieldEncryption.decrypt(value);
    };
  }

  /**
   * Create encrypted setter for mongoose schema
   * @param {string} fieldPath - The field path in the schema
   * @returns {Function} - Setter function
   */
  static createSetter(fieldPath) {
    return function(value) {
      return FieldEncryption.encrypt(value);
    };
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

  encryptedFields.forEach(fieldPath => {
    // Get the field definition
    const field = schema.path(fieldPath);
    
    if (field && field.instance === 'String') {
      // Add getter and setter for encryption/decryption
      field.get(FieldEncryption.createGetter(fieldPath));
      field.set(FieldEncryption.createSetter(fieldPath));
    }
  });

  // Handle nested fields in subdocuments
  schema.pre('save', function(next) {
    encryptedFields.forEach(fieldPath => {
      if (fieldPath.includes('.')) {
        // Handle nested fields in arrays
        const [arrayPath, nestedField] = fieldPath.split('.');
        const array = this.get(arrayPath);
        
        if (Array.isArray(array)) {
          array.forEach(item => {
            if (item && typeof item[nestedField] === 'string') {
              item[nestedField] = FieldEncryption.encrypt(item[nestedField]);
            }
          });
        }
      }
    });
    next();
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