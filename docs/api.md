# API Reference

This document provides a conceptual overview of the AIVA REST API.

## Base URL
All API requests are made to:
`http://localhost:5000/api`

## Authentication
Most endpoints require authentication using a **JSON Web Token (JWT)**.
You must include the token in the `Authorization` header of your requests:

```http
Authorization: Bearer <your_token_here>
```

To obtain a token, use the `/api/auth/login` or `/api/auth/register` endpoints.

## Response Format
The API uses a standardized JSON response format:

**Success:**
```json
{
  "success": true,
  "data": { ...Result Object... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description here"
}
```

## detailed Documentation

For a complete list of all available endpoints, parameters, and examples, please primarily refer to:

1.  **[Detailed Endpoint Reference](./api/API_ENDPOINTS.md)**: A complete markdown reference of all routes.
2.  **[Postman Collection](./api/AIVA_Postman_Collection.json)**: Import this file into Postman to test the API directly.

## Rate Limiting
The API implements rate limiting to prevent abuse. If you receive a `429 Too Many Requests` response, please wait a moment before retrying.
