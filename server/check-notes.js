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
   ⟁  DOMAIN       : DEVELOPMENT TOOLS

   ⟁  PURPOSE      : Debug and test system functionality

   ⟁  WHY          : Ensure code quality and troubleshoot issues

   ⟁  WHAT         : Development utilities and testing scripts

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : LOW
   ⟁  DOCS : /docs/backend/tasks.md

   ⟁  USAGE RULES  : Run in development • Debug issues • Test functionality

        "Code tested. Issues debugged. Quality ensured."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Note from './models/note.js';

dotenv.config();

async function checkNotes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://mohitrajsinhjadeja139200_db_user:hBHsQxS19FKl8nZ8@aiva.sur4x0x.mongodb.net/?retryWrites=true&w=majority&appName=aiva');
    console.log('Connected to MongoDB');

    const notes = await Note.find({
      workspace: '69007294603522910d637200',
      $or: [
        { isTrashed: false },
        { isTrashed: { $exists: false } },
        { isTrashed: null }
      ]
    }).limit(10);

    console.log(`Found ${notes.length} notes:`);
    notes.forEach((note, index) => {
      console.log(`${index + 1}. ID: ${note._id}, Title: ${note.title}, Trashed: ${note.isTrashed}, Archived: ${note.isArchived}`);
      console.log(`   Content length: ${note.content?.length || 0}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkNotes();