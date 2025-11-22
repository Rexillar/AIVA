/*=================================================================
* Project: AIVA-WEB
* File: Referral.js
* Author: Mohitraj Jadeja
* Date Created: February 28, 2024
* Last Modified: February 28, 2024
*=================================================================
* Description:
* Referral model schema defining referral properties and relationships
* with other entities.
*=================================================================
* Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '30d' // Automatically remove documents older than 30 days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;