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

   ⟁  PURPOSE      : Provide AI-powered features and responses

   ⟁  WHY          : Intelligent automation and assistance

   ⟁  WHAT         : Google Gemini API integration and processing

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : API Keys • TLS
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Handle errors • Log operations • Validate inputs

        "AI powered. Intelligence delivered. Automation achieved."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const primaryColor = '#3B82F6'; // Blue
const textColor = '#FFFFFF';

const TEMPLATES = {
  WORKSPACE_INVITE: ({
    inviterName,
    workspaceName,
    invitationToken,
    isExistingUser,
    tier,
    perks,
    achievements
  }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Workspace Invitation</h2>
      <p>Hello!</p>
      <p>${inviterName} has invited you to join the workspace "${workspaceName}".</p>
      
      ${isExistingUser ? `
        <p>As an existing user, you can accept this invitation by clicking the button below:</p>
        <a href="${process.env.CLIENT_URL}/workspace/invitation/${invitationToken}/accept" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Accept Invitation
        </a>
      ` : `
        <p>To join the workspace, you'll need to create an account first. Click the button below to get started:</p>
        <a href="${process.env.CLIENT_URL}/sign-up?invitation=${invitationToken}" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Create Account & Join
        </a>
      `}
      
      ${tier ? `
        <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 6px;">
          <h3 style="color: #4b5563; margin-top: 0;">Your Invitation Perks</h3>
          <p style="color: #6b7280; margin-bottom: 8px;">Current Tier: ${tier}</p>
          ${perks?.length ? `
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              ${perks.map(perk => `<li>${perk.replace('_', ' ').toUpperCase()}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      ` : ''}
      
      ${achievements?.length ? `
        <div style="margin: 24px 0; padding: 16px; background-color: #f3f4f6; border-radius: 6px;">
          <h3 style="color: #4b5563; margin-top: 0;">Achievements Unlocked</h3>
          <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
            ${achievements.map(achievement => `
              <li>${achievement.icon} ${achievement.name} - ${achievement.description}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
        This invitation will expire in 7 days. If you have any questions, please contact the workspace owner.
      </p>
    </div>
  `,
};

class EmailService {
  constructor() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      // console.error('Missing email configuration. Please check GMAIL_USER and GMAIL_PASS in .env file');
      throw new Error('Email configuration missing');
    }

    // Configure Gmail SMTP transport
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Don't fail on invalid certs
      },
      debug: process.env.NODE_ENV === 'production', // Enable debug logs in development
      logger: process.env.NODE_ENV === 'production' // Enable built-in logger in development
    });

    // Verify connection configuration
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      const verification = await this.transporter.verify();
      if (verification) {
        // console.log('SMTP connection successful');
      }
    } catch (error) {
      // console.error('SMTP connection error:', error);
      throw new Error('Failed to establish SMTP connection');
    }
  }

  async sendWorkspaceInvite(params) {
    const {
      email,
      inviterName,
      workspaceName,
      invitationToken,
      isExistingUser,
      tier,
      perks,
      achievements
    } = params;

    const subject = `${inviterName} invited you to join ${workspaceName}`;
    const html = TEMPLATES.WORKSPACE_INVITE({
      inviterName,
      workspaceName,
      invitationToken,
      isExistingUser,
      tier,
      perks,
      achievements
    });

    return await this.sendEmail(email, subject, html);
  }

  async sendVerificationOTP(email, otp) {
    try {
      const mailOptions = {
        from: `"AIVA Verification" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">
                ${otp}
              </div>
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in 30 minutes.
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      // console.log('Verification email sent:', info.messageId);
      return true;
    } catch (error) {
      // console.error('Failed to send verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email, otp) {
    try {
      const mailOptions = {
        from: `"AIVA Password Reset" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Reset your password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset</h2>
            <p>Your password reset code is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">
                ${otp}
              </div>
            </div>
            <p style="color: #666; font-size: 14px;">
              This code will expire in 10 minutes.
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      // console.log('Password reset email sent:', info.messageId);
      return true;
    } catch (error) {
      // console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendEmail(email, subject, html) {
    try {
      if (!email || !subject || !html) {
        throw new Error('Missing required fields for sending email');
      }

      // console.log('Preparing to send email:', {
      //   to: email,
      //   subject: subject
      // });

      const mailOptions = {
        from: {
          name: 'AIVA Workspace',
          address: process.env.GMAIL_USER
        },
        to: email,
        subject: subject,
        html: html
      };

      // console.log('Sending email with options:', {
      //   to: mailOptions.to,
      //   from: mailOptions.from,
      //   subject: mailOptions.subject
      // });

      const info = await this.transporter.sendMail(mailOptions);
      // console.log('Email sent successfully:', {
      //   messageId: info.messageId,
      //   response: info.response
      // });
      return true;
    } catch (error) {
      // console.error('Failed to send email:', {
      //   error: error.message,
      //   stack: error.stack,
      //   code: error.code,
      //   command: error.command
      // });
      throw error;
    }
  }
}

export const emailService = new EmailService(); 