/*=================================================================
* Project: AIVA-WEB
* File: Token.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Token model schema defining token properties and relationships with
* other entities.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
    // Remove: index: true if present
  },
  // ...existing code...
});

// Remove this line if it exists:
// tokenSchema.index({ token: 1 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;