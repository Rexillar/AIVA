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
   ⟁  DOMAIN       : MIDDLEWARE

   ⟁  PURPOSE      : Authenticate and authorize API requests

   ⟁  WHY          : Secure API access and user verification

   ⟁  WHAT         : JWT validation and role-based access control

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : AES-256-GCM (JWT)
   ⟁  TRUST LEVEL  : CRITICAL
   ⟁  DOCS : /docs/backend/auth.md

   ⟁  USAGE RULES  : Validate tokens • Check permissions • Log requests

        "Requests authenticated. Access authorized. Security maintained."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import { Workspace } from "../models/index.js";

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
  if (!token) {
    return res.status(401).json({ status: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    const user = await User.findById(decoded.id || decoded.userId)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User not found"
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        status: false,
        message: "Email not verified",
        requiresVerification: true
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: false,
        message: "Account is deactivated"
      });
    }

    req.user = user;
    req._modifiedBy = user._id;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ status: false, message: 'Token is not valid' });
  }
});

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Set JWT token in HTTP-only cookie
export const setTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// Check workspace membership
export const checkWorkspaceAccess = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: false,
      message: 'Not authorized'
    });
  }

  // Skip workspace validation for special routes
  const specialRoutes = ['/trash', '/private', '/public', '/private/all'];
  const path = req.path.toLowerCase();
  if (specialRoutes.some(route => path.includes(route))) {
    return next();
  }

  const workspaceId = req.params.id || req.params.workspaceId || req.body.workspaceId;

  if (!workspaceId) {
    return res.status(400).json({
      status: false,
      message: 'Workspace ID is required'
    });
  }

  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        status: false,
        message: 'Workspace not found'
      });
    }

    // Check ownership and membership
    const isOwner = String(workspace.owner) === String(req.user._id);
    const member = workspace.members?.find(m => String(m.user) === String(req.user._id));
    const isMember = Boolean(member);
    const isAdmin = member?.role === 'admin' || isOwner;

    if (!isOwner && !isMember) {
      return res.status(403).json({
        status: false,
        message: 'You are not a member of this workspace'
      });
    }

    // Determine user role
    const userRole = isOwner ? 'owner' : (member?.role || 'member');

    // Always allow owners and admins to access settings
    if (isOwner || isAdmin) {
      req.workspace = workspace;
      req.userRole = userRole;
      return next();
    }

    // For settings routes, only allow owners and admins
    if (path.includes('/settings')) {
      return res.status(403).json({
        status: false,
        message: 'Only workspace owners and admins can access settings'
      });
    }

    req.workspace = workspace;
    req.userRole = userRole;
    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Error checking workspace access'
    });
  }
}); 