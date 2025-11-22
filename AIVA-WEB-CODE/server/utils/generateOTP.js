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

/**
 * Generates a 6-digit OTP
 * @returns {string} A 6-digit OTP as a string
 */
export function generateOTP() {
  // Generate a random 6-digit number between 100000 and 999999
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
} 