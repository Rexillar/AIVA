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

import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const generateOTP = () => {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');
  return otp;
};

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
  }
};

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};
