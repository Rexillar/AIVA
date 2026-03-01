import mongoose from 'mongoose';

const transcriptSegmentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const meetingTranscriptSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true
        },
        channelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VoiceChannel',
            required: true
        },
        status: {
            type: String,
            enum: ['recording', 'processing', 'completed', 'failed'],
            default: 'recording'
        },
        segments: [transcriptSegmentSchema],
        intelligence: {
            type: mongoose.Schema.Types.Mixed, // Stores the Gemini JSON output
            default: null
        },
        // ── Privacy Controls ──
        visibility: {
            type: String,
            enum: ['private', 'workspace', 'participants_only'],
            default: 'private'   // private-by-default
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        participants: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            consentGiven: { type: Boolean, default: false },
            consentAt: Date
        }],
        recordingConsent: {
            required: { type: Boolean, default: true },
            allConsented: { type: Boolean, default: false }
        },
        retentionDays: {
            type: Number,
            default: 90    // auto-delete after 90 days
        },
        expiresAt: Date,
        // ── Meeting Type / Class Support ──
        meetingType: {
            type: String,
            enum: ['meeting', 'class', 'lecture', 'standup', 'workshop', 'other'],
            default: 'meeting'
        },
        title: String,
        courseId: String,      // for class/lecture linking
        tags: [String]
    },
    { timestamps: true }
);

// Auto-delete expired transcripts
meetingTranscriptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
meetingTranscriptSchema.index({ workspaceId: 1, status: 1 });
meetingTranscriptSchema.index({ owner: 1 });

// Pre-save: set expiry date based on retention
meetingTranscriptSchema.pre('save', function (next) {
  if (this.isNew && this.retentionDays && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + this.retentionDays * 24 * 60 * 60 * 1000);
  }
  next();
});

// Static: check if user can access this transcript
meetingTranscriptSchema.methods.canAccess = function (userId) {
  if (this.visibility === 'workspace') return true;
  if (this.owner?.toString() === userId.toString()) return true;
  if (this.visibility === 'participants_only') {
    return this.participants.some(p => p.user?.toString() === userId.toString());
  }
  // private → only owner
  return false;
};

export default mongoose.model('MeetingTranscript', meetingTranscriptSchema);
