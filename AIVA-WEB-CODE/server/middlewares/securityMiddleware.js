/*=================================================================
* Project: AIVA-WEB
* File: securityMiddleware.js
* Author: Mohitraj Jadeja
* Date Created: November 8, 2025
* Last Modified: November 8, 2025
*=================================================================
* Description:
* Additional security middleware for the application
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import crypto from 'crypto';

// Rate limiting for general API endpoints
export const generalRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting (for production, use Redis)
  const clientIP = req.ip || req.connection.remoteAddress;
  const key = `rate_limit_${clientIP}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // 100 requests per 15 minutes

  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const userRequests = global.rateLimitStore.get(key) || [];
  const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);

  if (validRequests.length >= maxRequests) {
    return res.status(429).json({
      status: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }

  validRequests.push(now);
  global.rateLimitStore.set(key, validRequests);

  next();
};

// Content Security Policy middleware
export const cspMiddleware = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

// Request logging middleware for security events
export const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Log suspicious activities
  if (method === 'POST' && (url.includes('/login') || url.includes('/register'))) {
    console.log(`[${timestamp}] SECURITY: ${method} ${url} from ${ip} - ${userAgent}`);
  }

  // Log potential attacks
  if (req.url.includes('..') || req.url.includes('%2e%2e')) {
    console.warn(`[${timestamp}] SECURITY ALERT: Path traversal attempt from ${ip}: ${url}`);
  }

  next();
};

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS payloads
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};