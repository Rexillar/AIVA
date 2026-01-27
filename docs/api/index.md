# AIVA-WEB API Documentation

This document provides a comprehensive overview of the AIVA-WEB API endpoints.

## Table of Contents

- [Authentication](#authentication)
- [Tasks](#tasks)
- [Workspaces](#workspaces)
- [Habits](#habits)
- [Files](#files)
- [Chat](#chat)
- [Notes](#notes)
- [Notifications](#notifications)
- [Reminders](#reminders)

---

## Authentication

Base Path: `/api/auth`

| Method | Endpoint                     | Description                                      | Protected |
|--------|------------------------------|--------------------------------------------------|-----------|
| POST   | `/register`                  | Register a new user.                             | No        |
| POST   | `/verify-otp`                | Verify user's email with OTP.                    | No        |
| POST   | `/login`                     | Login a user.                                    | No        |
| POST   | `/logout`                    | Logout a user.                                   | Yes       |
| POST   | `/reset-password-request`    | Request a password reset email.                  | No        |
| POST   | `/reset-password`            | Reset user's password.                           | No        |
| POST   | `/resend-otp`                | Resend OTP for email verification.               | No        |
| GET    | `/profile`                   | Get user's profile information.                  | Yes       |
| PUT    | `/profile`                   | Update user's profile information.               | Yes       |
| PUT    | `/change-password`           | Change user's password.                          | Yes       |
| POST   | `/test-email`                | **Test route** for sending emails.               | No        |

---

## Tasks

Base Path: `/api/tasks`

All task routes are protected and require authentication.

| Method | Endpoint                               | Description                                      |
|--------|----------------------------------------|--------------------------------------------------|
| GET    | `/`                                    | Get all tasks for the user.                      |
| POST   | `/`                                    | Create a new task.                               |
| GET    | `/dashboard`                           | Get dashboard statistics for tasks.              |
| GET    | `/workspace`                           | Get all tasks for a specific workspace.          |
| GET    | `/:id`                                 | Get a single task by its ID.                     |
| PUT    | `/:id`                                 | Update a task.                                   |
| DELETE | `/:id`                                 | Delete a task.                                   |
| POST   | `/:id/duplicate`                       | Duplicate a task.                                |
| POST   | `/:id/subtask`                         | Create a new subtask for a task.                 |
| PUT    | `/:id/subtask/:subtaskId`              | Update a subtask.                                |
| DELETE | `/:id/subtask/:subtaskId`              | Delete a subtask.                                |
| PUT    | `/:id/subtask/:subtaskId/complete`     | Mark a subtask as complete.                      |
| POST   | `/:id/activity`                        | Post an activity to a task.                      |
| PUT    | `/:id/trash`                           | Move a task to the trash.                        |
| PUT    | `/:id/restore`                         | Restore a task from the trash.                   |
| POST   | `/:id/attachments`                     | Upload attachments to a task.                    |
| DELETE | `/:id/attachments/:attachmentId`       | Delete a task attachment.                        |
| POST   | `/:id/comment`                         | Add a comment to a task.                         |
| GET    | `/:id/comments`                        | Get comments for a task.                         |

---

## Workspaces

Base Path: `/api/workspaces`

Most workspace routes are protected and require authentication.

| Method | Endpoint                               | Description                                      | Protected |
|--------|----------------------------------------|--------------------------------------------------|-----------|
| GET    | `/invitation/:token`                   | Get details of a workspace invitation.           | No        |
| GET    | `/users/all`                           | Get all users for member selection.              | Yes       |
| GET    | `/private/all`                         | Get all private workspaces for the user.         | Yes       |
| GET    | `/private`                             | Get the user's private workspace.                | Yes       |
| GET    | `/public`                              | Get all public workspaces the user is a member of| Yes       |
| GET    | `/invitations`                         | Get pending invitations for the user.            | Yes       |
| GET    | `/invitations/leaderboard`             | Get the referral leaderboard.                    | Yes       |
| POST   | `/:workspaceId/invitations`            | Handle a workspace invitation (accept/decline).  | Yes       |
| POST   | `/:workspaceId/invite`                 | Send a workspace invitation to a user.           | Yes       |
| GET    | `/trash`                               | Get all trashed workspaces for the user.         | Yes       |
| GET    | `/`                                    | Get all workspaces for the user.                 | Yes       |
| POST   | `/`                                    | Create a new workspace.                          | Yes       |
| GET    | `/:id`                                 | Get a single workspace by its ID.                | Yes       |
| PUT    | `/:id`                                 | Update a workspace.                              | Yes       |
| DELETE | `/:id`                                 | Delete a workspace.                              | Yes       |
| GET    | `/:id/members`                         | Get all members of a workspace.                  | Yes       |
| POST   | `/:id/members`                         | Add a member to a workspace.                     | Yes       |
| DELETE | `/:id/members/:memberId`               | Remove a member from a workspace.                | Yes       |
| PATCH  | `/:id/members/:memberId`               | Update a member's status in a workspace.         | Yes       |
| GET    | `/:id/stats`                           | Get statistics for a workspace.                  | Yes       |
| GET    | `/:workspaceId/activity`               | Get the activity feed for a workspace.           | Yes       |
| PUT    | `/:workspaceId/members/:userId/role`   | Update a member's role in a workspace.           | Yes       |
| GET    | `/:workspaceId/members/:userId/permissions` | Get a member's permissions in a workspace.   | Yes       |
| PUT    | `/:workspaceId/members/:userId/permissions` | Update a member's permissions in a workspace.| Yes       |
| PUT    | `/:id/trash`                           | Move a workspace to the trash.                   | Yes       |
| PUT    | `/:id/restore`                         | Restore a workspace from the trash.              | Yes       |
| DELETE | `/:id/delete-permanent`                | Permanently delete a workspace.                  | Yes       |
| GET    | `/:workspaceId/files`                  | Get all files in a workspace.                    | Yes       |
| POST   | `/:workspaceId/uploads`                | Upload a file to a workspace.                    | Yes       |
| POST   | `/:workspaceId/task/:taskId/uploads`   | Upload a file for a specific task.               | Yes       |

---

## Habits

Base Path: `/api/habits`

All habit routes are protected and require authentication.

| Method | Endpoint                     | Description                                      |
|--------|------------------------------|--------------------------------------------------|
| GET    | `/analytics/user`            | Get habit analytics for the user.                |
| GET    | `/due-today`                 | Get habits due for today.                        |
| GET    | `/user`                      | Get all habits for the user.                     |
| GET    | `/workspace/:workspaceId`    | Get all habits for a specific workspace.         |
| GET    | `/`                          | Get all habits.                                  |
| POST   | `/`                          | Create a new habit.                              |
| GET    | `/:id`                       | Get a single habit by its ID.                    |
| PUT    | `/:id`                       | Update a habit.                                  |
| DELETE | `/:id`                       | Delete a habit.                                  |
| POST   | `/:id/complete`              | Toggle a habit's completion for the day.         |
| PATCH  | `/:id/archive`               | Archive a habit.                                 |
| PATCH  | `/:id/pause`                 | Pause a habit.                                   |
| GET    | `/:id/statistics`            | Get statistics for a habit.                      |
| GET    | `/:id/history`               | Get the history of a habit.                      |
| POST   | `/:id/notes`                 | Add a note to a habit.                           |
| DELETE | `/:id/notes/:noteId`         | Delete a note from a habit.                      |

---

## Files

Base Path: `/api/files`

All file routes are protected and require authentication.

| Method | Endpoint                     | Description                                      |
|--------|------------------------------|--------------------------------------------------|
| POST   | `/upload`                    | Upload a file to a workspace.                    |
| GET    | `/workspace/:workspaceId`    | Get all files in a workspace.                    |
| GET    | `/trash/:workspaceId`        | Get all trashed files in a workspace.            |
| GET    | `/:id`                       | Get details of a single file.                    |
| PUT    | `/:id`                       | Update metadata of a file.                       |
| DELETE | `/:id`                       | Delete a file.                                   |
| GET    | `/:id/download`              | Download a file.                                 |
| POST   | `/:id/restore`               | Restore a file from the trash.                   |

---

## Chat

Base Path: `/api/chat`

All chat routes are protected and require authentication.

| Method | Endpoint                     | Description                                      |
|--------|------------------------------|--------------------------------------------------|
| POST   | `/:workspaceId/messages`     | Send a message in a workspace chat.              |
| POST   | `/message`                   | Send a message to the chatbot.                   |
| GET    | `/history`                   | Get chat history for a workspace.                |

---

## Notes

Base Path: `/api/notes`

All note routes are protected and require authentication.

| Method | Endpoint                     | Description                                      |
|--------|------------------------------|--------------------------------------------------|
| GET    | `/`                          | Get all notes in a workspace.                    |
| POST   | `/`                          | Create a new note.                               |
| GET    | `/:id`                       | Get a single note by its ID.                     |
| PUT    | `/:id`                       | Update a note.                                   |
| DELETE | `/:id`                       | Delete a note.                                   |
| POST   | `/:id/share`                 | Share a note.                                    |

---

## Notifications

Base Path: `/api/notifications`

All notification routes are protected and require authentication.

| Method | Endpoint                     | Description                                      |
|--------|------------------------------|--------------------------------------------------|
| GET    | `/`                          | Get all notifications for the user.              |
| PUT    | `/:id/read`                  | Mark a notification as read.                     |
| DELETE | `/:id`                       | Delete a notification.                           |

---

## Reminders

Base Path: `/api/reminders`

All reminder routes are protected and require authentication.

| Method | Endpoint                     | Description                                      |
|--------|------------------------------|--------------------------------------------------|
| GET    | `/`                          | Get all reminders for the user.                  |
| POST   | `/create`                    | Create a new reminder.                           |
| GET    | `/date/:date`                | Get reminders for a specific date.               |
| PUT    | `/:id`                       | Update a reminder.                               |
| DELETE | `/:id`                       | Delete a reminder.                               |