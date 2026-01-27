# Google Calendar/Tasks/Meet Integration

## Overview

AIVA now supports integrating multiple Google accounts per workspace for Calendar, Tasks, and Meet functionality. This allows teams to view and manage events from multiple Google calendars alongside AIVA's native events.

## Features

### Multi-Account Support
- **Multiple Google accounts per workspace** - Each workspace can connect unlimited Google accounts
- **Independent configuration** - Each account has its own sync settings and permissions
- **Account isolation** - One account failure doesn't affect others
- **Visual differentiation** - Color codes and labels distinguish each account's data

### Sync Capabilities

#### Calendar Integration
- **Read-only by default** - Safe viewing without risking data modification
- **Optional bidirectional sync** - Enable two-way sync if needed
- **Selective calendar sync** - Choose which calendars to sync per account
- **Background sync** - Automatic sync every 15 minutes
- **Manual sync trigger** - Force sync anytime via UI

#### Google Tasks
- **Task list import** - Import tasks from Google Tasks (optional)
- **Read-only mode** - View Google tasks without modification
- **AIVA conversion** - Option to convert Google tasks to AIVA tasks
- **Selective sync** - Choose which task lists to import

#### Google Meet
- **Automatic link detection** - Detects Meet links in calendar events
- **One-click join** - Quick access to meetings
- **Multi-provider support** - Also detects Zoom, Teams links

### Permissions & Access Control

#### Role-Based Permissions
- **Owner/Admin** - Can add any Google account to workspace
- **Members** - Can only add their own Google accounts
- **Account ownership** - Only account connector + Owner/Admin can modify/disconnect

#### Sync Directions
- **Read-only** (default) - Safe viewing without modification
- **Bidirectional** - Full two-way sync (advanced users only)

## Setup Guide

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Google Calendar API
   - Google Tasks API
   - Google People API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/google/callback` (or your domain)
5. Copy Client ID and Client Secret

### 2. Environment Configuration

Add to `server/.env`:

```bash
# Google OAuth credentials
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# Generate encryption key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
GOOGLE_TOKEN_ENCRYPTION_KEY=your-64-character-hex-key-here

# Client URL
CLIENT_URL=http://localhost:3000

# Optional: Disable auto-sync
GOOGLE_SYNC_ENABLED=true
```

### 3. Install Dependencies

```bash
cd server
npm install googleapis node-cron
```

### 4. Database Models

The system uses three MongoDB models:

- **GoogleIntegration** - Stores OAuth tokens and sync settings per workspace
- **ExternalCalendarEvent** - Unified storage for AIVA + Google events
- **ExternalTask** - Google Tasks with optional AIVA conversion

## API Endpoints

### OAuth Flow

```http
POST /api/google/auth-url
Body: { workspaceId, scopes: ['calendar', 'tasks', 'meet'] }
Returns: { authUrl }

POST /api/google/callback
Body: { code, state }
Returns: { success, account }
```

### Account Management

```http
GET /api/google/accounts/:workspaceId
Returns: { accounts: [...] }

PATCH /api/google/accounts/:workspaceId/:accountId
Body: { syncSettings }
Returns: { success, account }

DELETE /api/google/accounts/:workspaceId/:accountId
Returns: { success }
```

### Sync Operations

```http
POST /api/google/sync/:workspaceId/:accountId
Body: { syncType: 'calendar' | 'tasks' | 'both' }
Returns: { success, results }

GET /api/google/sync-status/:workspaceId
Returns: { connected, accounts, accountsCount }
```

### Data Retrieval

```http
GET /api/google/events/:workspaceId?startDate=...&endDate=...&source=google
Returns: { events: [...] }
```

## Architecture

### Backend Services

1. **googleAuthService.js**
   - OAuth 2.0 flow management
   - Token refresh and encryption
   - Scope validation
   - Token revocation

2. **googleSyncService.js**
   - Calendar event syncing
   - Task syncing
   - Meet link extraction
   - Conflict detection

3. **syncScheduler.js**
   - Background sync every 15 minutes
   - Account-level sync isolation
   - Error handling and retry logic
   - Health monitoring

4. **googleIntegrationController.js**
   - API request handling
   - Permission validation
   - Workspace access control

### Frontend Architecture

1. **Redux Slices**
   - `googleIntegrationSlice` - Account management state
   - `externalEventsSlice` - External event data and filters

2. **Components** (to be implemented)
   - `GoogleAccountManager` - Account connection UI
   - `ExternalEventCard` - Event display with source indicator
   - `CalendarFilters` - Filter panel for multi-source events

## Data Flow

### Initial Connection Flow
1. User clicks "Connect Google Account"
2. Frontend requests OAuth URL from backend
3. Backend generates state (workspaceId + userId) and returns auth URL
4. User redirects to Google OAuth consent screen
5. User approves permissions
6. Google redirects to callback with code
7. Backend exchanges code for tokens
8. Backend encrypts and stores tokens
9. Backend triggers initial sync
10. Frontend updates UI with connected account

### Sync Flow
1. Scheduler wakes every 15 minutes
2. Fetches all workspaces with active Google accounts
3. For each account:
   - Checks token expiry, refreshes if needed
   - Syncs calendar events (if enabled)
   - Syncs tasks (if enabled)
   - Detects Meet links
   - Updates last sync timestamp
4. Stores events in ExternalCalendarEvent collection
5. Frontend refetches events and updates UI

### Event Display Flow
1. Calendar component loads
2. Fetches AIVA events (existing flow)
3. Fetches external events (new)
4. Merges and sorts by time
5. Applies filters (account, source)
6. Renders with visual differentiation:
   - Color codes per account
   - Source badges (Google/AIVA)
   - Read-only indicators
   - Meet link buttons

## Security

### Token Encryption
- **AES-256-CBC** encryption for OAuth tokens
- **Random IV** per encryption
- **64-character hex key** stored in environment
- **Never expose tokens** in API responses

### Permission Model
- **Workspace-level** - Users must be workspace members
- **Account ownership** - Only connector + admins can modify
- **Sync direction controls** - Default to read-only
- **Token revocation** - Proper cleanup on disconnect

### Rate Limiting
- Uses existing AIVA rate limiting system
- Google API has its own quotas (monitor in console)
- Sync scheduler respects rate limits

## Troubleshooting

### Token Expired
- **Symptom**: Account status shows "expired"
- **Fix**: Automatic refresh on next sync, or manually reconnect

### Sync Not Working
- **Check**: `GOOGLE_SYNC_ENABLED` env variable
- **Check**: Account status is "active"
- **Check**: Sync settings are enabled
- **Check**: Token not revoked in Google account

### Missing Events
- **Check**: Selected calendars in sync settings
- **Check**: Date range (syncs last 7 days + next 90 days)
- **Check**: Account permissions include calendar.readonly

### Duplicate Events
- System uses `googleEventId` to prevent duplicates
- If duplicates occur, check sync settings or manually trigger sync

## Best Practices

### For Administrators
1. **Start with read-only** - Enable bidirectional sync only when needed
2. **Select specific calendars** - Don't sync everything
3. **Monitor sync errors** - Check account sync status regularly
4. **Use color codes** - Assign distinct colors per account
5. **Document account purpose** - Add notes for team clarity

### For Developers
1. **Handle token expiry** - Always check expiry before API calls
2. **Use batch operations** - Minimize API calls where possible
3. **Implement retry logic** - Google API can be rate-limited
4. **Log sync operations** - Track sync performance and errors
5. **Test disconnection** - Ensure proper cleanup

## Scaling Considerations

### Performance
- **15-minute sync interval** - Balance freshness vs API usage
- **Selective sync** - Only sync needed calendars/lists
- **Cursor pagination** - Handle large event sets efficiently
- **Background jobs** - Keep sync off main request thread

### Google API Quotas
- **Calendar API**: 1M queries/day (typically sufficient)
- **Tasks API**: 50K queries/day
- **Monitor usage** in Google Cloud Console
- **Implement backoff** if hitting limits

## Future Enhancements

### Planned Features
- [ ] Event creation from AIVA to Google (bidirectional)
- [ ] Task creation synchronization
- [ ] Conflict resolution UI
- [ ] Bulk import/export
- [ ] Calendar subscription via iCal
- [ ] Webhook-based sync (instead of polling)
- [ ] Analytics dashboard (sync stats, API usage)
- [ ] Advanced filtering (by attendee, location, etc.)

### Integration Expansion
- [ ] Microsoft 365 Calendar/Tasks
- [ ] Outlook integration
- [ ] Apple Calendar (iCloud)
- [ ] Slack calendar sync
- [ ] Notion calendar integration

## Support

### Documentation
- [Google Calendar API Docs](https://developers.google.com/calendar)
- [Google Tasks API Docs](https://developers.google.com/tasks)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)

### Internal Resources
- Backend code: `server/services/google*`, `server/controllers/googleIntegrationController.js`
- Frontend code: `client/src/slices/google*`
- Database models: `server/models/google*`, `server/models/external*`

---

**Version**: 1.0.0  
**Last Updated**: January 11, 2026  
**Author**: Mohitraj Jadeja
