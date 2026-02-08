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
   ⟁  PURPOSE      : Encrypt .env.secret for secure sharing

   ⟁  USAGE        : node docker/encrypt-env.js [password]

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
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Encrypt the .env.secret file
 */
function encryptEnvFile(password) {
    try {
        const envSecretPath = path.join(__dirname, '..', 'server', '.env.secret');
        const outputPath = path.join(__dirname, '..', 'server', '.env.secret.encrypted');

        // Check if .env.secret exists
        if (!fs.existsSync(envSecretPath)) {
            console.error('❌ Error: .env.secret file not found!');
            console.log('📝 Please create server/.env.secret with your credentials first.');
            console.log('💡 You can use server/.env.secret.example as a template.');
            process.exit(1);
        }

        // Read the file
        const fileContent = fs.readFileSync(envSecretPath, 'utf8');

        // Generate random salt
        const salt = crypto.randomBytes(SALT_LENGTH);

        // Derive key from password
        const key = crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');

        // Generate random IV
        const iv = crypto.randomBytes(IV_LENGTH);

        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Encrypt
        let encrypted = cipher.update(fileContent, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get authentication tag
        const tag = cipher.getAuthTag();

        // Combine: salt:iv:tag:encrypted
        const encryptedData = `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;

        // Write encrypted file
        fs.writeFileSync(outputPath, encryptedData, 'utf8');

        console.log('✅ Successfully encrypted .env.secret!');
        console.log(`📁 Encrypted file: ${outputPath}`);
        console.log('');
        console.log('🔐 IMPORTANT SECURITY NOTES:');
        console.log('1. Share .env.secret.encrypted via secure channel (email, Slack, etc.)');
        console.log('2. Share the password separately (voice call, SMS, password manager)');
        console.log('3. NEVER commit .env.secret or .env.secret.encrypted to git');
        console.log('4. Delete .env.secret.encrypted after sharing');
        console.log('');
        console.log('📤 To decrypt on another machine:');
        console.log('   node docker/decrypt-env.js [password]');

    } catch (error) {
        console.error('❌ Encryption failed:', error.message);
        process.exit(1);
    }
}

/**
 * Main execution
 */
function main() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   🔐 AIVA Environment File Encryption Utility');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    // Get password from command line or prompt
    let password = process.argv[2];

    if (!password) {
        console.log('⚠️  No password provided!');
        console.log('');
        console.log('Usage: node docker/encrypt-env.js [password]');
        console.log('');
        console.log('Example:');
        console.log('  node docker/encrypt-env.js "MySecurePassword123!"');
        console.log('');
        console.log('💡 Use a strong password (min 16 characters, mix of letters, numbers, symbols)');
        process.exit(1);
    }

    // Validate password strength
    if (password.length < 16) {
        console.log('⚠️  Password too weak! Minimum 16 characters required.');
        process.exit(1);
    }

    encryptEnvFile(password);
}

main();
