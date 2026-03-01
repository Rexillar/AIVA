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
   ⟁  DOMAIN       : DATA MODELS

   ⟁  PURPOSE      : Define source/citation data structure

   ⟁  WHY          : Enable research copilot tracking

   ⟁  WHAT         : MongoDB schema for sources/citations

   ⟁  TECH STACK   : Node.js • Express • MongoDB
   ⟁  CRYPTO       : N/A
   ⟁  TRUST LEVEL  : CRITICAL

   ⟁  USAGE RULES  : Validate schemas • Index properly • Support multiple formats

        "Sources tracked. Citations managed. Research enabled."

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    // Basic source information
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["website", "academic_paper", "book", "article", "interview", "other"],
      default: "website",
    },

    // Bibliographic metadata
    authors: [{
      type: String,
      trim: true,
    }],
    publicationDate: Date,
    publisher: String,
    doi: String, // Digital Object Identifier
    issn: String, // International Standard Serial Number
    isbn: String, // International Standard Book Number
    
    // Access information
    accessedAt: {
      type: Date,
      default: Date.now,
    },
    retrievedDate: Date,
    
    // Categorization
    category: String,
    tags: [String],
    notes: String, // User's notes about the source
    
    // Workspace & user information
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // Relationships
    relatedNotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    }],
    relatedTasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }],
    
    // Citation formats (cached for performance)
    citations: {
      apa: String,
      mla: String,
      chicago: String,
      harvard: String,
    },
    
    // Metadata
    credibilityScore: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
sourceSchema.index({ workspace: 1, addedBy: 1 });
sourceSchema.index({ workspace: 1, type: 1 });
sourceSchema.index({ workspace: 1, tags: 1 });
sourceSchema.index({ url: 1 }, { sparse: true });
sourceSchema.index({ doi: 1 }, { sparse: true });
sourceSchema.index({ title: "text", authors: "text", tags: "text" }); // Full-text search

// Virtuals
sourceSchema.virtual('citationPreview').get(function() {
  if (this.authors && this.authors.length > 0) {
    const authorString = this.authors.length > 1 
      ? `${this.authors[0]} et al.`
      : this.authors[0];
    return `${authorString} (${this.publicationDate?.getFullYear() || 'n.d.'}) - ${this.title}`;
  }
  return this.title;
});

// Methods
sourceSchema.methods.generateCitations = function() {
  const authors = this.authors && this.authors.length > 0 
    ? this.authors.join(", ")
    : "Unknown";
  
  const year = this.publicationDate?.getFullYear() || "n.d.";
  const title = this.title;
  const url = this.url || "";
  
  // APA Format
  this.citations.apa = `${authors} (${year}). ${title}. Retrieved from ${url}`;
  
  // MLA Format
  this.citations.mla = `${authors}. "${title}." Web. Accessed ${new Date().getFullYear()}.`;
  
  // Chicago Format
  this.citations.chicago = `${authors}. "${title}." Accessed ${new Date().toLocaleDateString()}. ${url}.`;
  
  // Harvard Format
  this.citations.harvard = `${authors} ${year}. ${title}. Available at: ${url}`;
  
  return this.citations;
};

sourceSchema.methods.updateRelation = function(modelName, itemId) {
  if (modelName === 'Note') {
    this.relatedNotes.push(itemId);
  } else if (modelName === 'Task') {
    this.relatedTasks.push(itemId);
  }
};

/**
 * Auto-calculate credibility score based on metadata completeness
 */
sourceSchema.methods.calculateCredibility = function() {
  let score = 3; // base

  // Has URL → +1
  if (this.url && this.url.trim()) score += 1;
  // Has DOI → +2 (peer-reviewed indicator)
  if (this.doi && this.doi.trim()) score += 2;
  // Has authors → +1
  if (this.authors && this.authors.length > 0) score += 1;
  // Has publication date → +1
  if (this.publicationDate) score += 1;
  // Academic paper type → +1
  if (this.type === 'academic_paper') score += 1;
  // Verified → +1
  if (this.isVerified) score += 1;

  this.credibilityScore = Math.min(score, 10);
  return this.credibilityScore;
};

// Pre-save hook
sourceSchema.pre("save", function(next) {
  if (!this.citations.apa) {
    this.generateCitations();
  }
  this.calculateCredibility();
  this.updatedAt = new Date();
  next();
});

const Source = mongoose.models.Source || mongoose.model("Source", sourceSchema);

export default Source;
