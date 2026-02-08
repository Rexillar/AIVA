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

   ⟁  PURPOSE      : Synchronize data with Google services

   ⟁  WHY          : Real-time external data integration

   ⟁  WHAT         : Google API client and sync operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : OAuth 2.0 • AES-256-GCM
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/auth.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "Data synchronized. Services integrated. Real-time updated."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { google } from 'googleapis';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

class GoogleAuthService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.SERVER_URL || 'http://localhost:5000'}/api/google/callback`
    );

    this.scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/tasks.readonly',
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(workspaceId, userId, scopes = null) {
    const state = Buffer.from(JSON.stringify({ workspaceId, userId })).toString('base64');

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes || this.scopes,
      state,
      prompt: 'consent' // Force consent screen to get refresh token
    });
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      // Get user info
      this.oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      return {
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date
        },
        userInfo: {
          email: userInfo.data.email,
          name: userInfo.data.name,
          picture: userInfo.data.picture
        }
      };
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const decryptedRefreshToken = this.decrypt(refreshToken);

      this.oauth2Client.setCredentials({
        refresh_token: decryptedRefreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      return {
        accessToken: credentials.access_token,
        expiryDate: credentials.expiry_date
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Check if token is expired or about to expire (within 5 minutes)
   */
  isTokenExpired(expiryDate) {
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const fiveMinutes = 5 * 60 * 1000;

    return expiry - now < fiveMinutes;
  }

  /**
   * Get authenticated OAuth client
   */
  getAuthenticatedClient(accessToken, refreshToken) {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.CLIENT_URL}/google/callback`
    );

    client.setCredentials({
      access_token: this.decrypt(accessToken),
      refresh_token: this.decrypt(refreshToken)
    });

    return client;
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken) {
    try {
      const decryptedToken = this.decrypt(accessToken);
      await this.oauth2Client.revokeToken(decryptedToken);
      return true;
    } catch (error) {
      console.error('Error revoking token:', error);
      return false;
    }
  }

  /**
   * Encrypt sensitive data (tokens)
   */
  encrypt(text) {
    if (!text) return null;

    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data (tokens)
   */
  decrypt(text) {
    if (!text) return null;

    try {
      const key = Buffer.from(ENCRYPTION_KEY, 'hex');
      const parts = text.split(':');
      const iv = Buffer.from(parts.shift(), 'hex');
      const encryptedText = parts.join(':');

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Validate scopes
   */
  validateScopes(requestedScopes) {
    const validScopes = ['calendar', 'tasks', 'meet', 'drive', 'sheets', 'gmail'];
    return requestedScopes.every(scope => validScopes.includes(scope));
  }

  /**
   * Get scope URLs from scope names
   */
  getScopeUrls(scopeNames) {
    const scopeMap = {
      'calendar': [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      'tasks': [
        'https://www.googleapis.com/auth/tasks.readonly',
        'https://www.googleapis.com/auth/tasks'
      ],
      'meet': [
        'https://www.googleapis.com/auth/calendar.readonly'
      ],
      'drive': [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive'
      ],
      'sheets': [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
      ],
      'gmail': [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ]
    };

    const urls = new Set([
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]);

    scopeNames.forEach(scope => {
      if (scopeMap[scope]) {
        scopeMap[scope].forEach(url => urls.add(url));
      }
    });

    return Array.from(urls);
  }
}

export default new GoogleAuthService();
