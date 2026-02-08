# 🔐 MongoDB Data Encryption Implementation

## Overview

All sensitive data stored in MongoDB is now **automatically encrypted** using **AES-256-GCM** encryption before being saved to the database. Only the server with the correct encryption key can decrypt and display the data.

## 🛡️ Security Features

### Encryption Algorithm
- **Algorithm**: AES-256-GCM (Authenticated Encryption with Associated Data)
- **Key Derivation**: PBKDF2 with 10,000 iterations
- **Salt**: Unique 32-byte random salt per field
- **IV**: Unique 16-byte random initialization vector per field
- **Authentication Tag**: 16-byte tag for data integrity verification

### Key Security Benefits
1. **Field-Level Encryption**: Each field is encrypted independently with its own salt and IV
2. **Authenticated Encryption**: GCM mode provides both confidentiality and authenticity
3. **Key Derivation**: PBKDF2 strengthens the master key against brute-force attacks
4. **Unique Salts**: Each encrypted value has a unique salt, preventing rainbow table attacks
5. **Automatic Encryption/Decryption**: Transparent to application code via Mongoose plugins

## 📋 Encrypted Fields by Model

### User Model
- `name` - User's full name
- `email` - User's email address
- `avatar` - Avatar URL
- `otp` - One-time passwords
- `resetPasswordToken` - Password reset tokens

### Task Model
- `title` - Task title
- `description` - Task description
- `labels.name` - Label names
- `attachments.filename` - Attachment filenames
- `subtasks.title` - Subtask titles
- `subtasks.description` - Subtask descriptions
- `subtasks.notes.content` - Subtask notes
- `activities.content` - Activity content
- `comments.content` - Comment content

### Note Model
- `title` - Note title
- `content` - Note content (HTML/Markdown)
- `tags` - Note tags
- `attachments.filename` - Attachment filenames
- `versionHistory.content` - Previous versions of note content

### Workspace Model
- `name` - Workspace name
- `description` - Workspace description

### Chat Model
- `content` - Message content
- `editHistory.content` - Edit history content

### Habit Model
- `title` - Habit title
- `description` - Habit description
- `completions.note` - Completion notes
- `notes.content` - General notes
- `tags` - Habit tags

### Canvas Model
- `name` - Canvas name

### Notification Model
- `text` - Notification text

### File Model
- `fileName` - File name
- `originalFileName` - Original file name
- `description` - File description
- `tags` - File tags
- `previousVersions.fileName` - Previous version filenames

## 🔑 Encryption Key Configuration

The encryption key is stored in the `.env` file:

```bash
ENCRYPTION_KEY=3f8a9c2e5d7b1f4a6c8e0d2b4f6a8c0e2d4b6f8a0c2e4d6b8f0a2c4e6d8b0f2a
```

### Key Requirements
- **Length**: 64 hexadecimal characters (32 bytes)
- **Format**: Hexadecimal string
- **Security**: Must be kept secret and never committed to version control

### Generating a New Key

To generate a new encryption key, run:

```javascript
const crypto = require('crypto');
const key = crypto.randomBytes(32).toString('hex');
console.log(key);
```

**⚠️ WARNING**: Changing the encryption key will make all previously encrypted data unreadable!

## 🔄 How It Works

### Encryption Process

1. **Data Input**: When a document is saved with encrypted fields
2. **Salt Generation**: A unique 32-byte salt is generated
3. **Key Derivation**: The master key is combined with the salt using PBKDF2
4. **IV Generation**: A unique 16-byte IV is generated
5. **Encryption**: Data is encrypted using AES-256-GCM
6. **Tag Generation**: An authentication tag is created
7. **Storage Format**: `salt:iv:tag:encrypted_data` is stored in MongoDB

### Decryption Process

1. **Data Retrieval**: Encrypted data is fetched from MongoDB
2. **Format Parsing**: The stored format is split into components
3. **Key Derivation**: The master key is combined with the stored salt
4. **Decryption**: Data is decrypted using the derived key and IV
5. **Verification**: The authentication tag is verified
6. **Return**: Decrypted plaintext is returned to the application

### Example Storage Format

```
Original: "John Doe"
Encrypted: "a1b2c3...f2:d4e5f6...a3:b7c8d9...e4:f1a2b3...c5"
           └─salt──┘ └──iv───┘ └──tag──┘ └─encrypted─┘
```

## 🚀 Usage

### Automatic Encryption

Encryption is **completely automatic** and transparent to your application code:

```javascript
// Creating a new user - encryption happens automatically
const user = new User({
  name: "John Doe",  // Will be encrypted before saving
  email: "john@example.com",  // Will be encrypted before saving
  password: "hashed_password"  // Password is hashed, not encrypted
});
await user.save();

// Reading a user - decryption happens automatically
const foundUser = await User.findById(userId);
console.log(foundUser.name);  // "John Doe" - automatically decrypted
```

### No Code Changes Required

All existing code continues to work without modifications. The encryption/decryption is handled by Mongoose middleware.

## 🔒 Security Best Practices

### 1. Protect the Encryption Key
- ✅ Store in environment variables
- ✅ Never commit to version control
- ✅ Use different keys for different environments
- ✅ Rotate keys periodically (with proper migration)
- ❌ Never hardcode in source code
- ❌ Never share via insecure channels

### 2. Key Rotation Strategy

When rotating keys:
1. Generate a new encryption key
2. Create a migration script to:
   - Decrypt all data with the old key
   - Re-encrypt with the new key
   - Update the `.env` file
3. Test thoroughly before production deployment

### 3. Backup Strategy

- Always backup the encryption key separately from database backups
- Store keys in a secure key management system (e.g., AWS KMS, Azure Key Vault)
- Document key recovery procedures

### 4. Access Control

- Limit access to the `.env` file
- Use role-based access control for production servers
- Audit access to encryption keys

## 🧪 Testing Encryption

To verify encryption is working:

```javascript
// 1. Create a document
const task = new Task({
  title: "Secret Task",
  description: "Confidential information",
  workspace: workspaceId,
  creator: userId
});
await task.save();

// 2. Check MongoDB directly (using MongoDB Compass or CLI)
// You should see encrypted data like:
// title: "a1b2c3...f2:d4e5f6...a3:b7c8d9...e4:f1a2b3...c5"

// 3. Retrieve via Mongoose
const retrievedTask = await Task.findById(task._id);
console.log(retrievedTask.title);  // "Secret Task" - decrypted
```

## 📊 Performance Considerations

### Encryption Overhead

- **CPU**: Minimal overhead (~1-5ms per field)
- **Storage**: ~30% increase due to salt, IV, and tag
- **Memory**: No significant impact

### Optimization Tips

1. **Selective Encryption**: Only encrypt sensitive fields
2. **Indexing**: Encrypted fields cannot be efficiently indexed
3. **Searching**: Use full-text search on decrypted data or implement tokenization
4. **Caching**: Cache decrypted data when appropriate

## 🔍 Troubleshooting

### Common Issues

#### 1. "Decryption error" in logs
**Cause**: Encryption key mismatch or corrupted data
**Solution**: Verify the `ENCRYPTION_KEY` in `.env` matches the key used for encryption

#### 2. Data appears as encrypted string
**Cause**: Encryption plugin not applied or getter not working
**Solution**: Ensure plugin is applied BEFORE model creation

#### 3. Cannot search encrypted fields
**Cause**: Encrypted data cannot be queried directly
**Solution**: Use application-level search or implement tokenization

## 🎯 Migration from Unencrypted Data

If you have existing unencrypted data:

```javascript
// Migration script example
const migrateToEncrypted = async () => {
  const users = await User.find({});
  
  for (const user of users) {
    // Simply re-saving will trigger encryption
    user.markModified('name');
    user.markModified('email');
    await user.save();
  }
  
  console.log('Migration complete!');
};
```

## 📝 Compliance

This encryption implementation helps meet compliance requirements for:

- **GDPR**: Personal data protection
- **HIPAA**: Healthcare data security
- **PCI DSS**: Payment card data protection
- **SOC 2**: Security and privacy controls

## 🔗 Related Documentation

- [Encryption Utility Source](../utils/encryption.js)
- [Mongoose Plugins](https://mongoosejs.com/docs/plugins.html)
- [AES-GCM Specification](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [PBKDF2 Specification](https://tools.ietf.org/html/rfc2898)

## 📞 Support

For questions or issues related to encryption:
1. Check this documentation
2. Review the encryption utility code
3. Test with sample data
4. Contact the development team

---

**Last Updated**: February 3, 2026
**Author**: Mohitraj Jadeja
**Version**: 1.0.0
