/*=================================================================
* Project: AIVA-WEB
* File: errorMiddleware.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Error handling middleware for processing and formatting error
* responses across the application.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

// Route not found middleware
export const routeNotFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MongoDB casting error
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: false,
      message: 'Invalid ID format',
      stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: false,
      message: Object.values(err.errors).map(e => e.message).join(', '),
      stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: false,
      message: 'Invalid or expired token',
      stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: false,
      message: `${field} already exists`,
      stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 