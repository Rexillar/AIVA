import { google } from 'googleapis';
import GoogleIntegration from '../models/googleIntegration.js';
import googleAuthService from './googleAuthService.js';

/**
 * Gmail Read Service
 * Provides read-only access to user's Gmail inbox through the Google Gmail API.
 * Requires the 'gmail' scope to be authorized by the user.
 */

/**
 * Get an authenticated Gmail API client for a user/workspace
 */
async function getGmailClient(userId, workspaceId) {
  const integration = await GoogleIntegration.findOne({
    userId,
    workspaceId,
    isActive: true,
  });

  if (!integration) {
    throw new Error('Google integration not found. Please connect your Google account first.');
  }

  // Check if gmail scope is authorized
  const hasGmailScope = integration.scopes?.includes('gmail') ||
    integration.authorizedScopes?.some(s => s.includes('gmail'));
  if (!hasGmailScope) {
    throw new Error('Gmail access not authorized. Please re-connect with Gmail permissions.');
  }

  // Refresh token if needed
  if (googleAuthService.isTokenExpired(integration.tokenExpiry)) {
    const refreshed = await googleAuthService.refreshToken(integration.refreshToken);
    integration.accessToken = googleAuthService.encrypt(refreshed.access_token);
    integration.tokenExpiry = refreshed.expiry_date;
    await integration.save();
  }

  const authClient = googleAuthService.getAuthenticatedClient(
    integration.accessToken,
    integration.refreshToken
  );

  return google.gmail({ version: 'v1', auth: authClient });
}

/**
 * Parse email headers into a clean object
 */
function parseHeaders(headers) {
  const result = {};
  const headerMap = ['From', 'To', 'Subject', 'Date', 'Cc', 'Bcc', 'Reply-To'];
  for (const h of headers) {
    if (headerMap.includes(h.name)) {
      result[h.name.toLowerCase().replace('-', '')] = h.value;
    }
  }
  return result;
}

/**
 * Extract plain text body from message parts
 */
function extractBody(payload) {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  if (payload.parts) {
    // Prefer plain text
    const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      return Buffer.from(textPart.body.data, 'base64').toString('utf-8');
    }
    // Fallback to HTML
    const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
    if (htmlPart?.body?.data) {
      return Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
    }
    // Recurse into nested parts
    for (const part of payload.parts) {
      if (part.parts) {
        const body = extractBody(part);
        if (body) return body;
      }
    }
  }
  return '';
}

/**
 * List inbox messages with pagination
 * @param {string} userId
 * @param {string} workspaceId
 * @param {Object} options - { maxResults, pageToken, query, labelIds }
 */
export async function listInboxMessages(userId, workspaceId, options = {}) {
  const gmail = await getGmailClient(userId, workspaceId);
  const { maxResults = 20, pageToken, query, labelIds } = options;

  const params = {
    userId: 'me',
    maxResults: Math.min(maxResults, 50),
    labelIds: labelIds || ['INBOX'],
  };
  if (pageToken) params.pageToken = pageToken;
  if (query) params.q = query;

  const listRes = await gmail.users.messages.list(params);
  const messages = listRes.data.messages || [];
  const nextPageToken = listRes.data.nextPageToken;
  const resultSizeEstimate = listRes.data.resultSizeEstimate;

  // Fetch metadata for each message (batch)
  const detailed = await Promise.all(
    messages.map(async (msg) => {
      try {
        const full = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        });
        const headers = parseHeaders(full.data.payload?.headers || []);
        return {
          id: full.data.id,
          threadId: full.data.threadId,
          snippet: full.data.snippet,
          labelIds: full.data.labelIds,
          isUnread: full.data.labelIds?.includes('UNREAD'),
          isStarred: full.data.labelIds?.includes('STARRED'),
          from: headers.from || '',
          to: headers.to || '',
          subject: headers.subject || '(no subject)',
          date: headers.date || '',
          internalDate: full.data.internalDate,
        };
      } catch {
        return { id: msg.id, error: 'Failed to fetch' };
      }
    })
  );

  return {
    messages: detailed,
    nextPageToken,
    resultSizeEstimate,
  };
}

/**
 * Get a single email message by ID (full content)
 */
export async function getMessage(userId, workspaceId, messageId) {
  const gmail = await getGmailClient(userId, workspaceId);

  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const msg = res.data;
  const headers = parseHeaders(msg.payload?.headers || []);
  const body = extractBody(msg.payload || {});

  // Extract attachments metadata
  const attachments = [];
  function findAttachments(parts) {
    if (!parts) return;
    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body.size,
          attachmentId: part.body.attachmentId,
        });
      }
      if (part.parts) findAttachments(part.parts);
    }
  }
  findAttachments(msg.payload?.parts);

  return {
    id: msg.id,
    threadId: msg.threadId,
    snippet: msg.snippet,
    labelIds: msg.labelIds,
    isUnread: msg.labelIds?.includes('UNREAD'),
    isStarred: msg.labelIds?.includes('STARRED'),
    from: headers.from || '',
    to: headers.to || '',
    cc: headers.cc || '',
    replyto: headers.replyto || '',
    subject: headers.subject || '(no subject)',
    date: headers.date || '',
    internalDate: msg.internalDate,
    body,
    attachments,
  };
}

/**
 * Get a thread with all messages
 */
export async function getThread(userId, workspaceId, threadId) {
  const gmail = await getGmailClient(userId, workspaceId);

  const res = await gmail.users.threads.get({
    userId: 'me',
    id: threadId,
    format: 'full',
  });

  const thread = res.data;
  const messages = (thread.messages || []).map((msg) => {
    const headers = parseHeaders(msg.payload?.headers || []);
    return {
      id: msg.id,
      snippet: msg.snippet,
      labelIds: msg.labelIds,
      from: headers.from || '',
      to: headers.to || '',
      subject: headers.subject || '',
      date: headers.date || '',
      body: extractBody(msg.payload || {}),
    };
  });

  return {
    id: thread.id,
    historyId: thread.historyId,
    messages,
  };
}

/**
 * Get unread count
 */
export async function getUnreadCount(userId, workspaceId) {
  const gmail = await getGmailClient(userId, workspaceId);

  const res = await gmail.users.labels.get({
    userId: 'me',
    id: 'INBOX',
  });

  return {
    messagesTotal: res.data.messagesTotal,
    messagesUnread: res.data.messagesUnread,
    threadsTotal: res.data.threadsTotal,
    threadsUnread: res.data.threadsUnread,
  };
}

/**
 * Get available labels
 */
export async function getLabels(userId, workspaceId) {
  const gmail = await getGmailClient(userId, workspaceId);
  const res = await gmail.users.labels.list({ userId: 'me' });
  return (res.data.labels || []).map(l => ({
    id: l.id,
    name: l.name,
    type: l.type,
    messagesTotal: l.messagesTotal,
    messagesUnread: l.messagesUnread,
  }));
}

/**
 * Search emails
 */
export async function searchEmails(userId, workspaceId, query, maxResults = 20) {
  return listInboxMessages(userId, workspaceId, {
    query,
    maxResults,
    labelIds: undefined, // search all labels
  });
}
