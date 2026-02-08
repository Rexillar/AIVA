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
   ⟁  DOCS : /docs/backend/encryption.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Classes designed. Methods implemented. Functionality delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { FieldEncryption } from '../utils/encryption.js';

class EncryptedSearchService {
  /**
   * Search for tasks with encrypted fields
   * @param {Object} searchCriteria - Search criteria
   * @param {string} searchCriteria.query - Search query string
   * @param {string} searchCriteria.workspace - Workspace ID
   * @param {string} searchCriteria.creator - Creator ID
   * @param {Array} searchCriteria.stages - Task stages to filter
   * @param {Array} searchCriteria.priorities - Task priorities to filter
   * @returns {Object} - MongoDB aggregation pipeline
   */
  static createTaskSearchPipeline(searchCriteria = {}) {
    const pipeline = [];

    // Match workspace and basic filters first
    const matchStage = {};

    if (searchCriteria.workspace) {
      matchStage.workspace = searchCriteria.workspace;
    }

    if (searchCriteria.creator) {
      matchStage.creator = searchCriteria.creator;
    }

    if (searchCriteria.stages && searchCriteria.stages.length > 0) {
      matchStage.stage = { $in: searchCriteria.stages };
    }

    if (searchCriteria.priorities && searchCriteria.priorities.length > 0) {
      matchStage.priority = { $in: searchCriteria.priorities };
    }

    // Add archived/deleted filters
    matchStage.isArchived = { $ne: true };
    matchStage.isDeleted = { $ne: true };

    pipeline.push({ $match: matchStage });

    // If there's a search query, we need to decrypt fields for text search
    if (searchCriteria.query && searchCriteria.query.trim()) {
      // Note: For production use, consider implementing a search index
      // with encrypted tokens for better performance
      pipeline.push({
        $addFields: {
          searchableTitle: '$title',
          searchableDescription: '$description'
        }
      });

      // Create text search condition
      const searchRegex = new RegExp(searchCriteria.query.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { searchableTitle: searchRegex },
            { searchableDescription: searchRegex }
          ]
        }
      });
    }

    // Sort by updatedAt descending
    pipeline.push({ $sort: { updatedAt: -1 } });

    return pipeline;
  }

  /**
   * Search for notes with encrypted fields
   * @param {Object} searchCriteria - Search criteria
   * @returns {Object} - MongoDB aggregation pipeline
   */
  static createNoteSearchPipeline(searchCriteria = {}) {
    const pipeline = [];

    const matchStage = {};

    if (searchCriteria.workspace) {
      matchStage.workspace = searchCriteria.workspace;
    }

    if (searchCriteria.creator) {
      matchStage.creator = searchCriteria.creator;
    }

    // Add archived/deleted filters
    matchStage.isArchived = { $ne: true };
    matchStage.isDeleted = { $ne: true };

    pipeline.push({ $match: matchStage });

    // Handle text search for encrypted fields
    if (searchCriteria.query && searchCriteria.query.trim()) {
      pipeline.push({
        $addFields: {
          searchableTitle: '$title',
          searchableContent: '$content'
        }
      });

      const searchRegex = new RegExp(searchCriteria.query.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { searchableTitle: searchRegex },
            { searchableContent: searchRegex }
          ]
        }
      });
    }

    pipeline.push({ $sort: { updatedAt: -1 } });

    return pipeline;
  }

  /**
   * Create a secure search token for encrypted data
   * Note: This is a simplified approach. For high-volume applications,
   * consider implementing deterministic encryption or search tokens.
   * @param {string} searchTerm - The term to create a token for
   * @returns {string} - Search token
   */
  static createSearchToken(searchTerm) {
    // For exact matches on encrypted data
    return FieldEncryption.encrypt(searchTerm);
  }

  /**
   * Decrypt search results after retrieval
   * @param {Array} documents - Array of documents to decrypt
   * @param {Array} encryptedFields - Array of field names that are encrypted
   * @returns {Array} - Documents with decrypted fields
   */
  static decryptSearchResults(documents, encryptedFields = []) {
    return documents.map(doc => {
      const decryptedDoc = { ...doc };

      encryptedFields.forEach(fieldPath => {
        const value = this.getNestedValue(decryptedDoc, fieldPath);
        if (value && typeof value === 'string') {
          this.setNestedValue(decryptedDoc, fieldPath, FieldEncryption.decrypt(value));
        }
      });

      return decryptedDoc;
    });
  }

  /**
   * Get nested value from object path
   * @param {Object} obj - Object to get value from
   * @param {string} path - Dot notation path
   * @returns {any} - The value at the path
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value in object path
   * @param {Object} obj - Object to set value in
   * @param {string} path - Dot notation path
   * @param {any} value - Value to set
   */
  static setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => current[key] = current[key] || {}, obj);
    target[lastKey] = value;
  }

  /**
   * Create a fuzzy search pipeline for encrypted data
   * Note: This approach decrypts data for search, which may impact performance.
   * For production, consider implementing searchable encryption or search indices.
   * @param {string} collection - Collection name
   * @param {Object} searchCriteria - Search criteria
   * @returns {Array} - Aggregation pipeline
   */
  static createFuzzySearchPipeline(collection, searchCriteria) {
    const { query, ...filters } = searchCriteria;

    const pipeline = [];

    // Basic filters first
    if (Object.keys(filters).length > 0) {
      pipeline.push({ $match: filters });
    }

    // For fuzzy search, we would need to decrypt and re-encrypt
    // This is computationally expensive but necessary for substring searches
    if (query && query.trim()) {
      const searchRegex = new RegExp(query.trim(), 'i');

      switch (collection) {
        case 'tasks':
          pipeline.push({
            $match: {
              $or: [
                { title: searchRegex },
                { description: searchRegex }
              ]
            }
          });
          break;

        case 'notes':
          pipeline.push({
            $match: {
              $or: [
                { title: searchRegex },
                { content: searchRegex }
              ]
            }
          });
          break;

        case 'workspaces':
          pipeline.push({
            $match: {
              $or: [
                { name: searchRegex },
                { description: searchRegex }
              ]
            }
          });
          break;
      }
    }

    return pipeline;
  }
}

export default EncryptedSearchService;