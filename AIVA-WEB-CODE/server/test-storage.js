#!/usr/bin/env node

/*=================================================================
* Project: AIVA-WEB
* File: test-storage.js
* Author: Mohitraj Jadeja
* Date Created: October 22, 2025
* Last Modified: October 22, 2025
*=================================================================
* Description:
* Test script to verify storage service configuration
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

import dotenv from 'dotenv';
import { storageService, STORAGE_TYPE } from './services/storageService.js';
import { driveService } from './services/googleDriveService.js';
import { initializeGridFS } from './services/mongoFileService.js';

// Load environment variables
dotenv.config();

async function testStorage() {
  console.log('🧪 Testing Storage Configuration');
  console.log('================================');
  console.log(`Storage Type: ${STORAGE_TYPE}`);
  console.log('');

  try {
    // Test storage service initialization
    console.log('1. Testing storage service...');
    // The storage service is initialized on import

    console.log('✅ Storage service loaded');

    // Test specific services based on type
    if (STORAGE_TYPE === 'google-drive') {
      console.log('2. Testing Google Drive service...');
      const driveReady = await driveService.initialize();
      if (driveReady) {
        console.log('✅ Google Drive service initialized');

        // Test basic Drive API call
        console.log('3. Testing Drive API access...');
        try {
          const files = await driveService.listFiles(null, 1);
          console.log(`✅ Drive API working - Found ${files.length} files`);
        } catch (error) {
          console.log(`⚠️ Drive API test failed: ${error.message}`);
          console.log('   This might be normal if no files exist or permissions are limited');
        }
      } else {
        console.log('❌ Google Drive service failed to initialize');
      }
    } else if (STORAGE_TYPE === 'gridfs') {
      console.log('2. Testing GridFS service...');
      const gridfsReady = initializeGridFS();
      if (gridfsReady) {
        console.log('✅ GridFS service initialized');
      } else {
        console.log('❌ GridFS service failed to initialize');
      }
    }

    console.log('');
    console.log('🎉 Storage configuration test completed!');
    console.log('');
    console.log('Next steps:');
    console.log('- Start the server: npm start');
    console.log('- Test file upload through the API');
    console.log('- Check that files are stored in the configured storage');

  } catch (error) {
    console.error('❌ Storage test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testStorage();