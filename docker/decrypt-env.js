#!/usr/bin/env node

/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ⟁  SYSTEM LAYER : DOCKER UTILITIES
   ⟁  PURPOSE      : Decrypt .env.secret.encrypted file

   ⟁  USAGE        : node docker/decrypt-env.js [password]

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;

/**
 * Decrypt the .env.secret.encrypted file
 */
function decryptEnvFile(password) {
    try {
        const encryptedPath = path.join(__dirname, '..', 'server', '.env.secret.encrypted');
        const outputPath = path.join(__dirname, '..', 'server', '.env.secret');

        // Check if encrypted file exists
        if (!fs.existsSync(encryptedPath)) {
            console.error('❌ Error: .env.secret.encrypted file not found!');
            console.log('📝 Please ensure you have the encrypted file in server/.env.secret.encrypted');
            process.exit(1);
        }

        // Read encrypted data
        const encryptedData = fs.readFileSync(encryptedPath, 'utf8');
        const parts = encryptedData.split(':');

        if (parts.length !== 4) {
            console.error('❌ Error: Invalid encrypted file format!');
            process.exit(1);
        }

        const [saltHex, ivHex, tagHex, encrypted] = parts;

        // Convert from hex
        const salt = Buffer.from(saltHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');

        // Derive key from password
        const key = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        // Decrypt
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Write decrypted file
        fs.writeFileSync(outputPath, decrypted, 'utf8');

        console.log('✅ Successfully decrypted .env.secret!');
        console.log(`📁 Decrypted file: ${outputPath}`);
        console.log('');
        console.log('🔐 SECURITY REMINDER:');
        console.log('1. .env.secret contains sensitive credentials');
        console.log('2. NEVER commit this file to version control');
        console.log('3. Keep it secure on your local machine');
        console.log('4. You can now run: docker-compose up');
        console.log('');
        console.log('🧹 Cleanup (optional):');
        console.log('   Delete .env.secret.encrypted after decryption');

    } catch (error) {
        if (error.message.includes('Unsupported state or unable to authenticate data')) {
            console.error('❌ Decryption failed: Incorrect password!');
        } else {
            console.error('❌ Decryption failed:', error.message);
        }
        process.exit(1);
    }
}

/**
 * Main execution
 */
function main() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   🔓 AIVA Environment File Decryption Utility');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    // Get password from command line
    let password = process.argv[2];

    if (!password) {
        console.log('⚠️  No password provided!');
        console.log('');
        console.log('Usage: node docker/decrypt-env.js [password]');
        console.log('');
        console.log('Example:');
        console.log('  node docker/decrypt-env.js "MySecurePassword123!"');
        console.log('');
        process.exit(1);
    }

    decryptEnvFile(password);
}

main();
