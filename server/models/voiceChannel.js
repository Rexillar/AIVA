import mongoose from 'mongoose';

const { Schema } = mongoose;

const voiceChannelSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Voice channel name is required'],
            trim: true,
            minlength: [1, 'Name must be at least 1 character long'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
            index: true,
        },
        activeMeetLink: {
            type: String,
            default: null,
        },
        activeParticipants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Ensure a workspace doesn't have duplicate channel names
voiceChannelSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

const VoiceChannel =
    mongoose.models.VoiceChannel || mongoose.model('VoiceChannel', voiceChannelSchema);

export default VoiceChannel;
