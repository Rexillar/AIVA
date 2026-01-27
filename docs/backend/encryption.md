# Encryption

## Purpose

This document covers data encryption implementation in the backend.

## Encryption Methods

- AES-256 for data at rest
- TLS 1.3 for data in transit
- bcrypt for password hashing

## Key Management

- Secure key generation
- Key rotation policies
- Backup and recovery procedures

## Implementation Details

- Encryption service in `server/services/encryptionService.js`
- Database field encryption
- API response encryption for sensitive data
