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

   ⟁  PURPOSE      : Provide specific functionality and operations

   ⟁  WHY          : Modular code organization and reusability

   ⟁  WHAT         : Function-based utilities and operations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : HIGH
   ⟁  DOCS : /docs/api/controllers.md

   ⟁  USAGE RULES  : Validate inputs • Handle errors • Log activities

        "Functions implemented. Operations executed. Results delivered."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import asyncHandler from 'express-async-handler';
import User from '../models/user.js';
import { Workspace } from '../models/workspace.js';
import {
  generateToken
} from '../utils/generateToken.js';
import {
  sendWelcomeEmail
} from '../services/emailService.js';

/**
 * @desc    Register a new user
 * @route   POST /api/user/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password
  } = req.body;

  // Check if user exists
  const userExists = await User.findOne({
    email
  });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    otp,
    otpExpires
  });

  if (user) {
    // Create private workspace for the user
    const privateWorkspace = await Workspace.create({
      name: `${user.name}'s Private Workspace`,
      owner: user._id,
      user: user._id,
      members: [{
        user: user._id,
        isActive: true
      }],
      type: 'PrivateWorkspace'
    });

    // Update user with private workspace reference
    user.privateWorkspace = privateWorkspace._id;
    await user.save();

    // Send verification email
    const emailSent = await emailService.sendVerificationOTP(email, otp);
    if (!emailSent) {
      // If email fails, clean up the created user and workspace
      await Workspace.findByIdAndDelete(privateWorkspace._id);
      await User.findByIdAndDelete(user._id);
      res.status(500);
      throw new Error('Failed to send verification email');
    }

    res.status(201).json({
      status: true,
      message: 'Registration successful. Please check your email for verification code.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Verify email OTP
 * @route   POST /api/user/verify-otp
 * @access  Public
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const {
    email,
    otp
  } = req.body;

  // Check if email and OTP are provided
  if (!email || !otp) {
    console.log('Empty fields in verification request:', {
      hasEmail: !!email,
      hasOTP: !!otp,
      email,
      otp
    });
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  // Validate OTP format (should be 6 digits)
  if (!/^\d{6}$/.test(otp)) {
    console.log('Invalid OTP format:', {
      receivedOTP: otp,
      email
    });
    res.status(400);
    throw new Error('OTP must be a 6-digit number');
  }

  console.log('Verifying OTP:', {
    email,
    receivedOTP: otp,
    timestamp: new Date().toISOString()
  });

  const user = await User.findOne({
    email
  });
  if (!user) {
    console.log('User not found:', email);
    res.status(404);
    throw new Error('User not found');
  }

  console.log('Found user:', {
    userId: user._id,
    email: user.email,
    storedOTP: user.otp,
    otpExpires: user.otpExpires,
    isVerified: user.isVerified
  });

  if (user.isVerified) {
    console.log('User already verified:', email);
    res.status(400);
    throw new Error('Email already verified');
  }

  if (!user.otp || !user.otpExpires) {
    console.log('No OTP found:', {
      hasOTP: !!user.otp,
      hasExpiry: !!user.otpExpires
    });
    res.status(400);
    throw new Error('Invalid or expired verification code');
  }

  if (user.otpExpires < new Date()) {
    console.log('OTP expired:', {
      expiryTime: user.otpExpires,
      currentTime: new Date(),
      timeDiff: (new Date() - user.otpExpires) / 1000 + ' seconds'
    });
    res.status(400);
    throw new Error('OTP has expired');
  }

  if (user.otp !== otp) {
    console.log('OTP mismatch:', {
      storedOTP: user.otp,
      receivedOTP: otp
    });
    res.status(400);
    throw new Error('Invalid verification code');
  }

  // Create private workspace for verified user
  console.log('Creating private workspace for user:', user._id);
  const workspace = await Workspace.create({
    name: `${user.name}'s Private Space`,
    description: `Private workspace for ${user.name}`,
    owner: user._id,
    type: 'private',
    members: [{
      user: user._id,
      role: 'owner',
      isAdmin: true,
      isActive: true
    }]
  });

  // Update user verification status and workspace
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.workspaces = [workspace._id];
  await user.save();

  console.log('User verified successfully:', {
    userId: user._id,
    workspaceId: workspace._id
  });

  res.json({
    status: true,
    message: 'Email verified successfully',
    workspace: {
      _id: workspace._id,
      name: workspace.name,
      type: workspace.type
    }
  });
});

/**
 * @desc    Request password reset
 * @route   POST /api/user/reset-password-request
 * @access  Public
 */
const requestPasswordReset = asyncHandler(async (req, res) => {
  const {
    email
  } = req.body;
  const user = await User.findOne({
    email
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const otp = generateOTP();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  user.resetPasswordToken = otp;
  user.resetPasswordExpiresAt = otpExpiry;
  await user.save();

  // Send password reset email
  const emailSent = await emailService.sendPasswordResetEmail(email, otp);

  if (!emailSent) {
    res.status(500);
    throw new Error('Failed to send reset password email');
  }

  res.status(200).json({
    status: true,
    message: 'Password reset OTP has been sent to your email'
  });
});

/**
 * @desc    Reset password with OTP
 * @route   POST /api/user/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const {
    email,
    otp,
    newPassword
  } = req.body;
  const user = await User.findOne({
    email,
    resetPasswordToken: otp,
    resetPasswordExpiresAt: {
      $gt: Date.now()
    }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  res.status(200).json({
    status: true,
    message: 'Password has been reset successfully'
  });
});

/**
 * @desc    Resend verification OTP
 * @route   POST /api/user/resend-otp
 * @access  Public
 */
const resendOTP = asyncHandler(async (req, res) => {
  const {
    email
  } = req.body;
  const user = await User.findOne({
    email,
    isVerified: false
  });

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
  const emailSent = await emailService.sendVerificationOTP(email, otp);
  if (!emailSent) {
    res.status(500);
    throw new Error('Failed to send verification email');
  }

  res.status(200).json({
    status: true,
    message: 'New verification code has been sent to your email'
  });
});

/**
 * @desc    Login user
 * @route   POST /api/user/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const {
    email,
    password
  } = req.body;

  // First find the user with password
  const user = await User.findOne({
    email
  }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    res.status(401);
    throw new Error('Please verify your email first');
  }

  // Check if user has a private workspace, if not create one
  let privateWorkspace = await Workspace.findById(user.privateWorkspace);

  if (!privateWorkspace) {
    privateWorkspace = await Workspace.create({
      name: `${user.name}'s Private Workspace`,
      owner: user._id,
      user: user._id,
      members: [{
        user: user._id,
        isActive: true
      }],
      type: 'PrivateWorkspace'
    });

    user.privateWorkspace = privateWorkspace._id;
    await user.save();
  }

  // Get user data without password and with populated workspace
  const populatedUser = await User.findById(user._id)
    .select('-password')
    .populate({
      path: 'privateWorkspace',
      model: 'Workspace',
      strictPopulate: false
    });

  // Generate token and set cookie
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.json({
    status: true,
    data: {
      user: {
        _id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        avatar: populatedUser.avatar,
        isAdmin: populatedUser.isAdmin,
        isVerified: populatedUser.isVerified,
        privateWorkspace: privateWorkspace
      }
    }
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/user/logout
 * @access  Public
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    status: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Get user profile
 * @route   GET /api/user/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        status: false,
        message: 'Not authenticated'
      });
    }

    const user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'workspaces',
        select: 'name description type isActive members',
        match: {
          isActive: true
        }
      })
      .lean();

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Ensure workspaces is always an array and filter out null/undefined values
    const workspaces = (user.workspaces || [])
      .filter(Boolean)
      .map(workspace => ({
        _id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        type: workspace.type,
        isActive: workspace.isActive,
        memberCount: workspace.members?.length || 0,
        isAdmin: workspace.members?.some(m =>
          m.user.toString() === user._id.toString() && m.isAdmin
        ) || false
      }));

    return res.status(200).json({
      status: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        settings: user.settings || {},
        workspaces
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return res.status(500).json({
      status: false,
      message: error.message || 'Error retrieving user profile'
    });
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/user/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    title
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update user fields if provided
  user.name = name || user.name;
  user.title = title || user.title;

  // Only update email if it's changed and not already taken
  if (email && email !== user.email) {
    const emailExists = await User.findOne({
      email
    });
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
      isVerified: updatedUser.isVerified
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/user/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const {
    currentPassword,
    newPassword
  } = req.body;
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

/**
 * @desc    Get user notifications
 * @route   GET /api/user/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
    isRead: false
  })
    .sort('-createdAt')
    .limit(10);

  res.json(notifications);
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/user/notifications/read
 * @access  Private
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const {
    type,
    id
  } = req.body;

  if (type === 'all') {
    await Notification.updateMany({
      user: req.user._id
    },
      {
        isRead: true
      });
  } else {
    await Notification.findByIdAndUpdate(id, {
      isRead: true
    });
  }

  res.json({
    message: 'Notification(s) marked as read'
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/user/all
 * @access  Private
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('name email avatar')
    .lean();

  res.json({
    status: true,
    data: users
  });
});

const handleProfileUpdate = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user._id;

    // Extract the update data from the request body
    const updates = {};

    // Handle name update from either JSON body or form data
    if (req.body.name) {
      updates.name = req.body.name;
    }

    // Handle avatar file if uploaded
    if (req.file) {
      updates.avatar = req.file.path;
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId, {
      $set: updates
    }, {
      new: true
    }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // Return success response
    res.json({
      status: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Error updating profile'
    });
  }
};

export {
  registerUser,
  verifyOTP,
  requestPasswordReset,
  resetPassword,
  resendOTP,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getNotifications,
  markNotificationAsRead,
  getAllUsers,
  handleProfileUpdate
};