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
   ⟁  DOMAIN       : API ROUTES

   ⟁  PURPOSE      : Define API endpoints and route handlers

   ⟁  WHY          : Organized API structure and request routing

   ⟁  WHAT         : Express route definitions and middleware application

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/routes.md

   ⟁  USAGE RULES  : Define endpoints • Apply middleware • Handle routing

        "Routes defined. Endpoints organized. API structured."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import express from 'express';
import expressRateLimit from 'express-rate-limit';
import {
  register,
  verifyOTP,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  resendOTP,
  getUserProfile,
  updateUserProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { emailService } from '../utils/emailService.js';
import {
  validate,
  registerSchema,
  loginSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Rate limiting for brute force prevention
const loginLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    status: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = expressRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    status: false,
    message: 'Too many password reset requests from this IP, please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = expressRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 OTP requests per windowMs
  message: {
    status: false,
    message: 'Too many OTP requests from this IP, please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Test route for email service
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'Email is required'
      });
    }

    // Test verification email
    await emailService.sendVerificationEmail(email, '123456');

    res.json({
      status: true,
      message: 'Test email sent successfully. Check console for mock email output.'
    });
  } catch (error) {
    //
    // console.error('Test email error:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Auth routes
router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/reset-password-request', passwordResetLimiter, validate(resetPasswordRequestSchema), requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/resend-otp', otpLimiter, resendOTP);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, validate(updateProfileSchema), updateUserProfile);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);

export default router;