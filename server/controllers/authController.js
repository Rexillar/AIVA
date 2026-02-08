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
   ⟁  DOMAIN       : API CONTROLLERS

   ⟁  PURPOSE      : Handle user authentication and authorization

   ⟁  WHY          : Secure access control and user management

   ⟁  WHAT         : JWT token management and user sessions

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : AES-256-GCM (JWT)
   ⟁  TRUST LEVEL  : CRITICAL
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Access controlled. Security enforced. Users authenticated."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import asyncHandler from 'express-async-handler';
import User from '../models/user.js';
import { Workspace } from '../models/index.js';
import { generateOTP } from '../utils/index.js';
import { generateToken, setTokenCookie } from '../middlewares/authMiddleware.js';
import { emailService } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        status: false,
        message: 'Password must contain at least 8 characters, including uppercase and lowercase letters, numbers, and special characters (@$!%*?&)',
        details: {
          password: 'Invalid password format'
        }
      });
    }

    // Check if user exists and is not verified
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({
          status: false,
          message: 'User already exists'
        });
      } else {
        // User exists but is not verified - generate new OTP
        const otp = generateOTP();
        existingUser.otp = otp;
        existingUser.otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await existingUser.save();

        // Send verification email with the same OTP
        await emailService.sendVerificationEmail(email, otp);
        console.log('Regenerated OTP for existing user:', { email, otp });

        return res.status(200).json({
          status: true,
          message: 'Verification code sent to your email',
          data: {
            email: existingUser.email
          }
        });
      }
    }

    // Create new user if doesn't exist
    const otp = generateOTP();
    console.log('Generated new OTP for registration:', { email, otp });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      otp,
      otpExpires: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    });

    // Send verification email with the same OTP
    await emailService.sendVerificationEmail(email, otp);

    res.status(201).json({
      status: true,
      message: 'Registration successful. Please check your email for verification code.',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      status: false,
      message: 'Error registering user'
    });
  }
});

// @desc    Verify email OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      console.log('Missing fields:', { email, otp });
      res.status(400);
      throw new Error('Email and OTP are required');
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      res.status(404);
      throw new Error("User not found");
    }

    // Check if already verified
    if (user.isVerified) {
      console.log('User already verified:', email);
      res.status(400);
      throw new Error("Email is already verified");
    }

    // Check if OTP matches and not expired
    console.log('Comparing OTPs:', {
      providedOTP: otp,
      storedOTP: user.otp,
      providedType: typeof otp,
      storedType: typeof user.otp
    });

    if (!user.otp || user.otp.toString() !== otp.toString()) {
      console.log('Invalid OTP:', {
        provided: otp,
        stored: user.otp
      });
      res.status(400);
      throw new Error("Invalid verification code");
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      console.log('OTP expired:', {
        expiryTime: user.otpExpires,
        currentTime: new Date()
      });
      res.status(400);
      throw new Error("Verification code has expired");
    }

    // Mark email as verified and clear OTP fields
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Create private workspace for the user
    const workspace = await Workspace.create({
      name: `${user.name}'s Workspace`,
      description: 'Your personal workspace',
      owner: user._id,
      createdBy: user._id,
      visibility: 'private',
      type: 'PrivateWorkspace',
      members: [{
        user: user._id,
        role: 'admin',
        isActive: true
      }],
      isActive: true,
      settings: {
        theme: 'system',
        notifications: {
          email: true,
          push: true
        }
      }
    });

    // Add workspace reference to user
    user.workspaces = [workspace._id];
    await user.save();

    // Generate token
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    console.log('Email verified and workspace created:', {
      userId: user._id,
      workspaceId: workspace._id
    });

    res.status(200).json({
      status: true,
      message: "Email verified successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified
        },
        token,
        workspace
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(error.status || 500).json({
      status: false,
      message: error.message || 'Verification failed',
      error: error
    });
  }
});


// @desc    Request password reset
// @route   POST /api/auth/reset-password-request
// @access  Public
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log('Password reset request received for:', email);

  if (!email) {
    return res.status(400).json({
      status: false,
      message: 'Email address is required'
    });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    console.log('Looking up user:', normalizedEmail);

    // Find user first
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Don't reveal user existence, but don't proceed with reset
      return res.status(200).json({
        status: true,
        message: 'If an account exists with this email, you will receive password reset instructions shortly.'
      });
    }

    // Only proceed with reset if user exists
    const { success, token, otp, error } = await emailService.sendResetPasswordEmail(normalizedEmail);
    console.log('Email service response:', { success, hasToken: !!token, hasOTP: !!otp });

    if (!success) {
      console.error('Failed to send reset email:', error);
      return res.status(500).json({
        status: false,
        message: 'Unable to send reset instructions. Please try again later.'
      });
    }

    // Update user with reset tokens
    user.resetPasswordToken = token;
    user.resetPasswordOTP = otp;
    user.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    console.log('User reset tokens updated successfully');

    return res.status(200).json({
      status: true,
      message: 'Password reset instructions have been sent to your email.',
      data: { email: normalizedEmail }
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

// @desc    Reset password with token or OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, otp, newPassword } = req.body;
  console.log('Password reset attempt:', {
    email,
    hasToken: !!token,
    hasOTP: !!otp,
    passwordLength: newPassword?.length || 0
  });

  // Validate required fields
  if (!email) {
    return res.status(400).json({
      status: false,
      message: 'Email is required',
      details: { email: 'Email is required' }
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      status: false,
      message: 'New password is required',
      details: { password: 'New password is required' }
    });
  }

  if (!token && !otp) {
    return res.status(400).json({
      status: false,
      message: 'Either token or OTP is required',
      details: { validation: 'Either token or OTP is required' }
    });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    console.log('Looking up user:', normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Invalid reset request. Please try again.',
        details: { email: 'User not found' }
      });
    }

    // Validate token or OTP
    const validationResult = await emailService.validateToken(normalizedEmail, token, otp);
    console.log('Token validation result:', validationResult);

    if (!validationResult.isValid) {
      return res.status(400).json({
        status: false,
        message: validationResult.reason || 'Invalid or expired reset credentials',
        details: { validation: validationResult.reason || 'Invalid or expired reset credentials' }
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    console.log('Password updated successfully for user:', user._id);

    return res.status(200).json({
      status: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while resetting your password',
      details: { server: error.message }
    });
  }
});

// @desc    Resend verification OTP
// @route   POST /api/user/resend-otp
// @access  Public
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, isVerified: false });

  if (!user) {
    res.status(400);
    throw new Error('User not found or already verified');
  }

  // Generate new OTP
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save();

  // Send verification email
  const emailSent = await emailService.sendVerificationEmail(email, otp);
  if (!emailSent) {
    res.status(500);
    throw new Error('Failed to send verification email');
  }

  res.status(200).json({
    status: true,
    message: 'New verification code has been sent to your email'
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: 'Please provide both email and password.'
    });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    console.warn(`Login attempt failed: User not found for email - ${email}`);
    return res.status(401).json({
      status: false,
      message: 'Invalid credentials. Please check your email and password.'
    });
  }

  // Check if user is verified
  if (!user.isVerified) {
    return res.status(403).json({
      status: false,
      message: 'Please verify your email before logging in.'
    });
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    console.warn(`Login attempt failed: Invalid password for user - ${email}`);
    return res.status(401).json({
      status: false,
      message: 'Invalid credentials. Please check your email and password.'
    });
  }

  // Generate token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  // Set token cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Get user's private workspace
  const workspace = await Workspace.findOne({
    owner: user._id,
    visibility: 'private',
    type: 'PrivateWorkspace'
  }).populate('owner', 'name email')
    .populate('members.user', 'name email');

  // Remove password from response
  const userWithoutPassword = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isAdmin: user.isAdmin,
    isVerified: user.isVerified
  };

  res.json({
    status: true,
    data: {
      user: userWithoutPassword,
      token,
      privateWorkspace: workspace
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logout = asyncHandler(async (req, res) => {
  try {
    // Clear the JWT cookie
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict'
    });

    res.status(200).json({
      status: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      status: false,
      message: 'Error during logout'
    });
  }
});

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate({
      path: 'workspaces',
      select: 'name description status',
      match: { status: { $ne: 'deleted' } }
    });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Ensure workspaces is always an array
  const workspaces = user.workspaces || [];

  res.status(200).json({
    status: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      title: user.title,
      isVerified: user.isVerified,
      settings: user.settings,
      workspaces: workspaces.map(workspace => ({
        _id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        status: workspace.status
      }))
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, email, title, preferences } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update user fields if provided
  if (name) user.name = name;
  if (title) user.title = title;
  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences
    };
  }

  // Only update email if changed and not already taken
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
    user.email = email;
  }

  const updatedUser = await user.save();
  res.status(200).json({
    status: true,
    message: 'Profile updated successfully',
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      title: updatedUser.title,
      isVerified: updatedUser.isVerified,
      preferences: updatedUser.preferences
    }
  });
});

// @desc    Change password
// @route   PUT /api/user/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: true,
    message: 'Password changed successfully'
  });
});

// Add other auth controller functions as needed... 