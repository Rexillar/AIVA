/*=================================================================
* Project: AIVA-WEB
* File: db.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Database configuration and connection setup for MongoDB using
* Mongoose with GridFS for file storage.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import jwt from 'jsonwebtoken';

/**
 * Generate JWT token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'HOLA!88amigo!',
    { expiresIn: '30d' }
  );
};

/**
 * Generate token and set in HTTP-only cookie
 * @param {Response} res - Express response object
 * @param {string} userId - User ID to encode in token
 * @returns {string} Generated token
 */
export const generateTokenAndSetCookie = (res, userId) => {
  const token = generateToken(userId);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return token;
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'HOLA!88amigo!');
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 