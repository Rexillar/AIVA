import { GoogleGenerativeAI } from '@google/generative-ai';
import MeetingTranscript from '../models/meetingTranscript.js';
import Task from '../models/task.js';

// Validate Gemini API Key on startup
const validateGeminiApiKey = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
        console.warn(
            '\n⚠️  WARNING: GEMINI_API_KEY is not set!\n' +
            'Meeting Intelligence will not work.\n' +
            'Set GEMINI_API_KEY in your .env file or environment variables.\n'
        );
        return null;
    }
    
    // Check if it looks like a valid API key (should be ~39 characters)
    if (apiKey.length < 30) {
        console.warn(
            '\n⚠️  WARNING: GEMINI_API_KEY looks invalid (too short)!\n' +
            'Expected length: ~39 characters\n' +
            'Actual length: ' + apiKey.length + ' characters\n'
        );
    }
    
    console.log(`✅ GEMINI_API_KEY loaded (${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)})`);
    return apiKey;
};

const GEMINI_API_KEY = validateGeminiApiKey();
let genAI = null;
let INTELLIGENCE_AVAILABLE = false;

if (GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        INTELLIGENCE_AVAILABLE = true;
    } catch (error) {
        console.error('Failed to initialize Gemini AI:', error.message);
        INTELLIGENCE_AVAILABLE = false;
    }
}

// In-memory map to track active transcription sessions
// key: channelId, value: MeetingTranscript document _id
const activeSessions = new Map();

// Cache for processed transcripts to avoid re-processing
const transcriptCache = new Map();

// Timeout for Gemini API (prevent hanging)
const GEMINI_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Start a new transcript session for a meeting.
 * Called when the first audio chunk arrives with no existing session.
 */
export async function startSession(workspaceId, channelId) {
    if (activeSessions.has(channelId)) {
        return activeSessions.get(channelId);
    }

    const transcript = await MeetingTranscript.create({
        workspaceId,
        channelId,
        status: 'recording',
        segments: [],
        createdAt: new Date()
    });

    activeSessions.set(channelId, transcript._id);
    console.log(`[Meeting Intelligence] Session started for channel: ${channelId}`);
    return transcript._id;
}

/**
 * Saves a pre-transcribed text chunk (from the local WebGPU STT) to the active transcript.
 * Optimized for fast, batched database updates.
 */
export async function saveTextChunk(channelId, text, timestamp) {
    try {
        const sessionId = activeSessions.get(channelId);
        if (!sessionId) {
            console.warn(`[Meeting Intelligence] No active session for channel: ${channelId}. Skipping chunk.`);
            return;
        }

        if (text && text.trim().length > 0) {
            // Use updateOne with $push for atomic append (faster than findByIdAndUpdate)
            await MeetingTranscript.updateOne(
                { _id: sessionId },
                {
                    $push: {
                        segments: {
                            text: text.trim(),
                            timestamp: timestamp || new Date()
                        }
                    },
                    $set: { updatedAt: new Date() }
                }
            );
            console.log(`[Meeting Intelligence] Segment saved (${text.length} chars): "${text.substring(0, 40)}..."`);
        }

    } catch (error) {
        console.error('[Meeting Intelligence] Save chunk error:', error.message);
    }
}

/**
 * End the session, run the intelligence extraction, and auto-create Tasks.
 * Returns the final extracted intelligence JSON.
 * Optimized with timeout handling, caching, and retry logic.
 */
export async function endSessionAndExtract(channelId, workspaceId) {
    const sessionId = activeSessions.get(channelId);
    if (!sessionId) {
        console.warn(`[Meeting Intelligence] No active session to end for channel: ${channelId}`);
        return null;
    }

    activeSessions.delete(channelId);

    try {
        // Mark as processing
        const startTime = performance.now();
        const transcript = await MeetingTranscript.findByIdAndUpdate(
            sessionId,
            { status: 'processing', processingStartedAt: new Date() },
            { new: true }
        );

        if (!transcript || transcript.segments.length === 0) {
            await MeetingTranscript.findByIdAndUpdate(sessionId, { status: 'completed' });
            console.log(`[Meeting Intelligence] Session ${sessionId} ended but had no segments.`);
            return null;
        }

        // Check cache to avoid reprocessing
        const cacheKey = JSON.stringify(transcript.segments);
        if (transcriptCache.has(cacheKey)) {
            console.log(`[Meeting Intelligence] Using cached intelligence result`);
            return transcriptCache.get(cacheKey);
        }

        // Combine all segments into a single transcript string
        const fullTranscript = transcript.segments.map(s => s.text).join('\n');
        console.log(`[Meeting Intelligence] Processing ${transcript.segments.length} segments (${fullTranscript.length} chars)...`);

        // Check if Gemini API is available
        if (!INTELLIGENCE_AVAILABLE || !genAI) {
            console.warn('[Meeting Intelligence] Gemini API not available. Check GEMINI_API_KEY');
            // Save transcript and return fallback
            const fallbackIntelligence = {
                summary: "Transcript saved successfully.",
                action_items: [],
                decisions: [],
                risks: ["⚠️ Meeting intelligence extraction temporarily unavailable. Please configure GEMINI_API_KEY."]
            };

            await MeetingTranscript.findByIdAndUpdate(sessionId, {
                status: 'completed',
                intelligence: fallbackIntelligence,
                completedAt: new Date()
            });

            return fallbackIntelligence;
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const extractionPrompt = `
You are an AI meeting assistant. Analyze the following meeting transcript and extract structured intelligence:

### TRANSCRIPT ###
${fullTranscript}
### END TRANSCRIPT ###

Return ONLY a valid JSON object with this EXACT structure:
{
  "summary": "A 2-3 sentence summary of the meeting",
  "action_items": [
    { "assignee": "person name or 'Team'", "task_title": "clear task description", "deadline": "deadline if mentioned or null" }
  ],
  "decisions": ["decision made in the meeting"],
  "risks": ["any risk or concern raised"]
}

If there are no action items, decisions, or risks, return empty arrays. Do not add any text before or after the JSON.
`;

        // Set timeout for Gemini API call (prevent hanging)
        let intelligence;
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Gemini API timeout')), GEMINI_TIMEOUT_MS)
            );

            const resultPromise = model.generateContent(extractionPrompt);
            const result = await Promise.race([resultPromise, timeoutPromise]);
            
            let rawJson = result.response.text().trim();
            // Strip any markdown code fences if Gemini returns them
            rawJson = rawJson.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            intelligence = JSON.parse(rawJson);
        } catch (apiError) {
            const errorMsg = apiError.message || apiError.toString();
            
            // Better error messages
            if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid')) {
                console.error('[Meeting Intelligence] ❌ GEMINI_API_KEY is INVALID!');
                console.error('   Check that GEMINI_API_KEY environment variable is set correctly.');
                console.error('   Get a valid key from: https://ai.google.dev');
            } else if (errorMsg.includes('timeout')) {
                console.warn('[Meeting Intelligence] ⏱️ Gemini API timeout. Using fallback.');
            } else {
                console.error(`[Meeting Intelligence] API error: ${errorMsg}`);
            }
            
            // Fallback for API errors
            intelligence = {
                summary: "Meeting transcript captured successfully.",
                action_items: [],
                decisions: [],
                risks: ["⚠️ Meeting intelligence extraction failed. Check GEMINI_API_KEY configuration."]
            };
        }

        const processingTime = performance.now() - startTime;
        console.log(`[Meeting Intelligence] Extraction complete in ${processingTime.toFixed(0)}ms. ${intelligence.action_items?.length || 0} tasks found.`);

        // Auto-create tasks from action items (concurrent operations)
        if (intelligence.action_items && intelligence.action_items.length > 0) {
            const taskDocs = intelligence.action_items.map(item => ({
                title: item.task_title,
                description: `Assigned to: ${item.assignee || 'Team'}. Auto-extracted from meeting.`,
                deadline: item.deadline ? new Date(item.deadline) : null,
                workspaceId,
                source: 'meeting_intelligence',
                status: 'todo',
                createdAt: new Date()
            }));

            // Batch insert tasks with error recovery
            try {
                await Task.insertMany(taskDocs, { ordered: false });
                console.log(`[Meeting Intelligence] Auto-created ${taskDocs.length} tasks.`);
            } catch (taskError) {
                console.warn('[Meeting Intelligence] Some tasks failed insertion:', taskError.message);
                // Continue anyway - some tasks may have succeeded
            }
        }

        // Mark as completed and save the intelligence
        await MeetingTranscript.findByIdAndUpdate(sessionId, {
            status: 'completed',
            intelligence,
            processingTime: processingTime.toFixed(0),
            completedAt: new Date()
        });

        // Cache the result for 1 hour to avoid reprocessing
        transcriptCache.set(cacheKey, intelligence);
        setTimeout(() => transcriptCache.delete(cacheKey), 3600000);

        return intelligence;

    } catch (error) {
        console.error('[Meeting Intelligence] Extraction failed:', error.message);

        // Graceful degradation
        const fallbackIntelligence = {
            summary: "Transcript saved successfully.",
            action_items: [],
            decisions: [],
            risks: ["Automatic task extraction temporarily unavailable."]
        };

        try {
            await MeetingTranscript.findByIdAndUpdate(sessionId, {
                status: 'completed',
                intelligence: fallbackIntelligence,
                completedAt: new Date()
            });
        } catch (dbError) {
            console.error('[Meeting Intelligence] Failed to save fallback:', dbError.message);
        }

        return fallbackIntelligence;
    }
}

export function hasActiveSession(channelId) {
    return activeSessions.has(channelId);
}
