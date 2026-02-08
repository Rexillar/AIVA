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

   ⟁  PURPOSE      : Implement complex functionality with object-oriented design

   ⟁  WHY          : Organized code structure and reusability

   ⟁  WHAT         : Class-based implementation with methods and state

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : MEDIUM
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Pure functions • Error handling • Documentation

        "Classes designed. Methods implemented. Functionality delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

const primaryColor = "#0ea5e9"; // Primary blue
const darkColor = "#1e293b"; // Dark mode background
const textColor = "#ffffff"; // White text for contrast

// Token storage with expiry and encryption
class TokenManager {
  constructor() {
    this.tokens = new Map();
    this.cleanupInterval = setInterval(() => this.cleanupExpiredTokens(), 5 * 60 * 1000);
    console.log('TokenManager initialized with persistent storage');
  }

  generateToken() {
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString('base64url');
    console.log('Generated new token:', token.substring(0, 10) + '...');
    return token;
  }

  generateOTP() {
    const min = 100000;
    const max = 999999;
    const otp = crypto.randomInt(min, max + 1).toString().padStart(6, '0');
    console.log('Generated new OTP:', otp);
    return otp;
  }

  storeToken(email, type = 'reset', providedOtp = null) {
    if (!email) {
      console.error('Store token failed: Email is required');
      return null;
    }

    const normalizedEmail = email.toLowerCase();
    const key = `${type}_${normalizedEmail}`;

    // Clean up any existing tokens for this email
    this.cleanupTokensForEmail(normalizedEmail, type);

    // Generate new token and use provided OTP or generate new one
    const token = this.generateToken();
    const otp = providedOtp || this.generateOTP();
    const expiresAt = Date.now() + (30 * 60 * 1000); // Extend to 30 minutes

    // Store token data
    const tokenData = {
      token,
      otp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now(),
      email: normalizedEmail,
      type
    };

    console.log('Storing token data:', {
      key,
      hasToken: !!token,
      hasOTP: !!otp,
      expiresAt: new Date(expiresAt).toISOString(),
      tokenPreview: token.substring(0, 10) + '...',
      otpPreview: otp
    });

    // Store in Map
    this.tokens.set(key, tokenData);

    // Debug: Print all stored tokens
    console.log('Current stored tokens:', this.debugTokens());

    // Verify storage
    const storedData = this.tokens.get(key);
    if (!storedData || storedData.token !== token || storedData.otp !== otp) {
      console.error('Token storage verification failed');
      return null;
    }

    return {
      success: true,
      token,
      otp,
      expiresAt
    };
  }

  validateToken(email, token, otp, type = 'reset') {
    if (!email) {
      console.error('Token validation failed: Email is required');
      return { isValid: false, reason: 'Email is required' };
    }

    if (!token && !otp) {
      console.error('Token validation failed: Token or OTP is required');
      return { isValid: false, reason: 'Token or OTP is required' };
    }

    const normalizedEmail = email.toLowerCase();
    const key = `${type}_${normalizedEmail}`;

    // Debug: Print all stored tokens before validation
    console.log('All stored tokens before validation:', this.debugTokens());

    const tokenData = this.tokens.get(key);

    console.log('Validation attempt:', {
      email: normalizedEmail,
      type,
      key,
      hasToken: !!token,
      hasOTP: !!otp,
      tokenPreview: token ? `${token.substring(0, 10)}...` : null,
      otpPreview: otp,
      foundTokenData: !!tokenData,
      storedTokenPreview: tokenData?.token ? `${tokenData.token.substring(0, 10)}...` : null,
      storedOTP: tokenData?.otp,
      expiresAt: tokenData?.expiresAt ? new Date(tokenData.expiresAt).toISOString() : null,
      attempts: tokenData?.attempts || 0
    });

    if (!tokenData) {
      console.error('Token validation failed: No token data found for key:', key);
      return {
        isValid: false,
        reason: 'No token found. Please request a new one.'
      };
    }

    if (Date.now() > tokenData.expiresAt) {
      console.error('Token validation failed: Token expired');
      this.tokens.delete(key);
      return {
        isValid: false,
        reason: 'Token has expired. Please request a new one.'
      };
    }

    // Validate token or OTP
    const isTokenValid = token && tokenData.token === token;
    const isOTPValid = otp && tokenData.otp === otp;

    console.log('Validation check:', {
      isTokenValid,
      isOTPValid,
      tokenMatch: isTokenValid,
      otpMatch: isOTPValid
    });

    if (!isTokenValid && !isOTPValid) {
      tokenData.attempts = (tokenData.attempts || 0) + 1;
      this.tokens.set(key, tokenData);

      if (tokenData.attempts >= 3) {
        this.tokens.delete(key);
        return {
          isValid: false,
          reason: 'Too many invalid attempts. Please request a new reset link.'
        };
      }

      return {
        isValid: false,
        reason: 'Invalid credentials. Please try again.'
      };
    }

    // Successful validation - clean up the token
    this.tokens.delete(key);
    return { isValid: true };
  }

  cleanupTokensForEmail(email, type) {
    if (!email) return;
    const key = `${type}_${email.toLowerCase()}`;
    this.tokens.delete(key);
  }

  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [key, data] of this.tokens.entries()) {
      if (now > data.expiresAt) {
        this.tokens.delete(key);
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.tokens.clear();
  }

  // Debug method to check current tokens (sanitized)
  debugTokens() {
    const tokenDebug = {};
    for (const [key, value] of this.tokens.entries()) {
      tokenDebug[key] = {
        email: value.email,
        type: value.type,
        attempts: value.attempts,
        expiryFormatted: new Date(value.expiresAt).toISOString(),
        hasToken: !!value.token,
        hasOTP: !!value.otp,
        remainingTime: Math.max(0, value.expiresAt - Date.now()) / 1000
      };
    }
    return tokenDebug;
  }
}

// Create a singleton instance
const tokenManager = new TokenManager();

const getStyledTemplate = (title, content) => `
  <div style="font-family: 'Arial', sans-serif; background-color: ${darkColor}; color: ${textColor}; padding: 20px; border-radius: 10px; text-align: center; max-width: 600px; margin: auto;">
    <h2 style="color: ${primaryColor};">${title}</h2>
    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; color: #000;">
      ${content}
    </div>
    <footer style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
      AIVA Task Manager | <a href="${BASE_URL}" style="color: ${primaryColor}; text-decoration: none;">Visit Dashboard</a>
    </footer>
  </div>
`;

const TEMPLATES = {
  VERIFICATION: (otp, email, token) =>
    getStyledTemplate("Verify Your AIVA Account", `
      <p>Your verification code is: <strong style="color: ${primaryColor}; font-size: 18px;">${otp}</strong></p>
      <p>This code expires in 10 minutes. Do not share it with anyone.</p>
      <a href="${BASE_URL}/verify?email=${encodeURIComponent(email)}&token=${token}" 
         style="display: inline-block; padding: 10px 20px; background: ${primaryColor}; color: ${textColor}; border-radius: 5px; text-decoration: none; font-weight: bold;">
        Verify Now
      </a>
    `),

  WELCOME: getStyledTemplate("Welcome to AIVA!", `
    <p>We're excited to have you onboard.</p>
    <p>Start setting up your tasks and collaborating with your team.</p>
    <a href="${BASE_URL}/dashboard" style="display: inline-block; padding: 10px 20px; background: ${primaryColor}; color: ${textColor}; border-radius: 5px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
  `),

  RESET_PASSWORD: (otp, email, token) =>
    getStyledTemplate("Reset Your Password", `
      <div style="text-align: center;">
        <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password for your AIVA account.</p>
        
        <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin-bottom: 10px; color: #94a3b8;">Your verification code is:</p>
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${primaryColor};">${otp}</span>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">
          This code will expire in 10 minutes.<br/>
          If you did not request this password reset, please ignore this email.
        </p>
        
        <a href="${BASE_URL}/reset-password?email=${encodeURIComponent(email)}&token=${token}&otp=${otp}" 
           style="display: inline-block; padding: 12px 24px; background: ${primaryColor}; color: ${textColor}; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
          Reset Password
        </a>
      </div>
    `),

  WORKSPACE_INVITE: (inviterName, workspaceId) =>
    getStyledTemplate("You're Invited to Join a Workspace", `
      <p><strong>${inviterName}</strong> has invited you to join their workspace on AIVA.</p>
      <a href="${BASE_URL}/workspace/${workspaceId}/join" style="display: inline-block; padding: 10px 20px; background: ${primaryColor}; color: ${textColor}; border-radius: 5px; text-decoration: none; font-weight: bold;">Join Now</a>
    `),

  REMINDER: (taskTitle, subtasks, workspaceName, dueDate, reminderTime, taskId) =>
    getStyledTemplate("Task Reminder", `
      <p><strong>Task:</strong> ${taskTitle}</p>
      <p><strong>Subtasks:</strong> ${subtasks.length > 0 ? subtasks.join(', ') : 'No subtasks'}</p>
      <p><strong>Workspace:</strong> ${workspaceName}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
      <p><strong>Reminder Set For:</strong> ${reminderTime}</p>
      <a href="${BASE_URL}/tasks/${taskId}" style="display: inline-block; padding: 10px 20px; background: ${primaryColor}; color: ${textColor}; border-radius: 5px; text-decoration: none; font-weight: bold;">View Task</a>
    `)
};

class EmailService {
  constructor() {
    if (!GMAIL_USER || !GMAIL_PASS) {
      console.error('❌ Missing email credentials!');
      process.exit(1);
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      logger: false,
      debug: false
    });

    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service ready');
    } catch (error) {
      console.error('Email service error');
    }
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `AIVA Support <${GMAIL_USER}>`,
        to,
        subject,
        html
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to send email' };
    }
  }

  async sendVerificationEmail(email, providedOtp) {
    try {
      // Store the provided OTP
      const tokenData = tokenManager.storeToken(email, 'verification', providedOtp);
      if (!tokenData?.success) {
        console.error('Failed to store verification token for:', email);
        return false;
      }

      const html = TEMPLATES.VERIFICATION(providedOtp, email, tokenData.token);
      await this.sendEmail(email, 'Verify Your AIVA Account', html);
      return true;
    } catch (error) {
      console.error('Send verification email error:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email) {
    return await this.sendEmail(email, 'Welcome to AIVA!', TEMPLATES.WELCOME);
  }

  async sendResetPasswordEmail(email) {
    try {
      if (!email) {
        console.error('Send reset email failed: Email is required');
        return { success: false, error: 'Email is required' };
      }

      const normalizedEmail = email.toLowerCase();
      console.log('Generating reset tokens for:', normalizedEmail);

      // First, clean up any existing tokens for this email
      tokenManager.cleanupTokensForEmail(normalizedEmail, 'reset');

      // Generate and store tokens using tokenManager
      const tokenData = tokenManager.storeToken(normalizedEmail, 'reset');
      if (!tokenData || !tokenData.success) {
        console.error('Failed to generate reset tokens');
        return { success: false, error: 'Failed to generate reset tokens' };
      }

      const { token, otp } = tokenData;

      // Verify token storage
      const storedData = tokenManager.tokens.get(`reset_${normalizedEmail}`);
      console.log('Verifying token storage:', {
        email: normalizedEmail,
        tokenStored: !!storedData,
        tokenMatches: storedData?.token === token,
        otpMatches: storedData?.otp === otp,
        expiresAt: storedData?.expiresAt ? new Date(storedData.expiresAt).toISOString() : null
      });

      if (!storedData || storedData.token !== token || storedData.otp !== otp) {
        console.error('Token storage verification failed');
        return { success: false, error: 'Failed to store reset tokens' };
      }

      // Send email using the RESET_PASSWORD template
      const result = await this.sendEmail(
        normalizedEmail,
        'Password Reset Instructions',
        TEMPLATES.RESET_PASSWORD(otp, normalizedEmail, token)
      );

      if (!result.success) {
        console.error('Failed to send reset email');
        // Clean up stored token if email fails
        tokenManager.cleanupTokensForEmail(normalizedEmail, 'reset');
        return { success: false, error: 'Failed to send reset email' };
      }

      console.log('Reset email sent successfully to:', normalizedEmail);
      return { success: true, token, otp };

    } catch (error) {
      console.error('Send reset email error:', error);
      // Clean up stored token if there's an error
      if (email) {
        tokenManager.cleanupTokensForEmail(email.toLowerCase(), 'reset');
      }
      return { success: false, error: error.message };
    }
  }

  async sendWorkspaceInvite(email, inviterName, workspaceId) {
    return await this.sendEmail(email, 'Workspace Invitation', TEMPLATES.WORKSPACE_INVITE(inviterName, workspaceId));
  }

  async sendTaskReminder(email, taskTitle, subtasks = [], workspaceName, dueDate, reminderTime, taskId) {
    return await this.sendEmail(email, 'Task Reminder',
      TEMPLATES.REMINDER(taskTitle, subtasks, workspaceName, dueDate, reminderTime, taskId)
    );
  }

  validateToken(email, token, otp, type = 'reset') {
    return tokenManager.validateToken(email, token, otp, type);
  }
}

// Create a singleton instance
const emailService = new EmailService();

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Cleaning up email service...');
  tokenManager.destroy();
  emailService.transporter.close();
});

process.on('SIGINT', () => {
  console.log('Cleaning up email service...');
  tokenManager.destroy();
  emailService.transporter.close();
});

export { emailService };
