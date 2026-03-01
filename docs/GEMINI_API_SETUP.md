# Gemini API Setup

**Last Updated**: March 2026

AIVA uses **Google Gemini 2.5 Flash** for all AI-powered features. This guide walks through obtaining and configuring your Gemini API key.

---

## Features Powered by Gemini

| Feature | Description |
|---------|-------------|
| **AI Chat** | 31+ intent chatbot with deterministic handlers for CRUD + AI fallback |
| **Note AI Formatting** | Paste messy data → Gemini formats into clean tables, lists, summaries |
| **AI Diagrams** | Natural language → canvas diagrams (flowcharts, mind maps, etc.) |
| **Intelligence Engine** | Analytics, productivity insights, task predictions |
| **Knowledge Hub** | Knowledge graph generation, concept linking |
| **Work Orchestrator** | AI-powered daily planning and task scheduling |
| **Text Completion** | Inline AI text suggestions |
| **Meeting Intelligence** | Meeting notes analysis and action item extraction |

---

## Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select or create a Google Cloud project
5. Copy the generated API key

> **Free Tier**: Gemini 2.5 Flash includes a generous free tier — sufficient for personal use and development.

---

## Step 2: Configure AIVA

Add the key to your server environment file:

```env
# server/.env
GEMINI_API_KEY=AIzaSy...your-key-here
```

### Alternative Key Variable
Some services accept an alternative key name as fallback:
```env
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...your-key-here
```

---

## Step 3: Verify

Start the server and check the console output:
```
🔑 GEMINI_API_KEY after load: AIzaSy1234...
```

Test the AI chat:
1. Open AIVA in your browser
2. Navigate to the AI Chat page
3. Send a message like "What tasks do I have?"
4. If Gemini responds thoughtfully, the key is working

---

## API Usage Details

### Model
AIVA uses **Gemini 2.5 Flash** via the REST API:
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

### Request Format
```javascript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: 'Your prompt here' }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }
    })
  }
);
```

### Services Using Gemini
| File | Purpose |
|------|---------|
| `server/services/geminiService.js` | Primary Gemini wrapper |
| `server/services/improvedGeminiService.js` | Enhanced chat with context |
| `server/services/enhancedGeminiService.js` | Advanced chat features |
| `server/services/meetingIntelligenceService.js` | Meeting analysis |
| `server/services/intentClassifier.js` | Natural language intent classification |
| `server/controllers/noteController.js` | Note AI formatting endpoint |

---

## Rate Limits & Quotas

### Google's Limits (Gemini 2.5 Flash — Free Tier)
- 15 requests per minute (RPM)
- 1 million tokens per minute (TPM)
- 1,500 requests per day (RPD)

### AIVA's Rate Limiting
AIVA applies its own rate limiting on top of Google's:
- Per-user limits on AI endpoints
- Advanced rate limiter with sliding window
- Quota tracking via `/api/quotas`

### Handling Rate Limit Errors
If you hit Google's rate limit, the server returns a 429 error. The client automatically retries with exponential backoff.

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| "GEMINI_API_KEY not found" in logs | Ensure `.env` file exists in `server/` and contains `GEMINI_API_KEY` |
| AI chat returns errors | Check the server console for Gemini API error messages |
| 429 Too Many Requests | You've hit Google's rate limit — wait a minute or upgrade to a paid plan |
| "API key not valid" | Regenerate the key in [Google AI Studio](https://aistudio.google.com/apikey) |
| AI features work but are slow | Gemini 2.5 Flash is fast; check network latency to Google's servers |

---

## Google Cloud Console (Advanced)

For production deployments requiring higher quotas:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Enabled APIs**
3. Enable **Generative Language API**
4. Go to **Quotas** to view and request quota increases
5. Set up billing if needed for higher limits

---

## Security Notes

- **Never** commit your API key to version control
- Add `GEMINI_API_KEY` to `.gitignore` patterns
- Use environment variables or Docker secrets in production
- Rotate keys periodically via Google AI Studio
- Monitor usage in Google Cloud Console
