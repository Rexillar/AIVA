/*=================================================================
* Project: AIVA-WEB
* File: canvasService.js
* Author: Mohitraj Jadeja
* Date Created: October 25, 2025
* Last Modified: October 25, 2025
*=================================================================
* Description:
* Canvas service for handling canvas CRUD operations with the API.
*=================================================================
* Copyright (c) 2025 Mohitraj Jadeja. All rights reserved.
*=================================================================*/

const API_BASE_URL = '/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Temporarily disabled for testing
  // const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    // 'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Create a new canvas
export const createCanvas = async (canvasData) => {
  const response = await fetch(`${API_BASE_URL}/canvas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(canvasData),
  });
  return handleResponse(response);
};

// Get all canvases for the current user
export const getCanvases = async (workspaceId = null) => {
  const url = workspaceId
    ? `${API_BASE_URL}/canvas?workspaceId=${workspaceId}`
    : `${API_BASE_URL}/canvas`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get a single canvas by ID
export const getCanvasById = async (canvasId) => {
  const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Update a canvas
export const updateCanvas = async (canvasId, canvasData) => {
  const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(canvasData),
  });
  return handleResponse(response);
};

// Delete a canvas (soft delete)
export const deleteCanvas = async (canvasId) => {
  const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Permanently delete a canvas
export const permanentDeleteCanvas = async (canvasId) => {
  const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}/permanent`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Restore a deleted canvas
export const restoreCanvas = async (canvasId) => {
  const response = await fetch(`${API_BASE_URL}/canvas/${canvasId}/restore`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get deleted canvases
export const getDeletedCanvases = async () => {
  const response = await fetch(`${API_BASE_URL}/canvas/deleted`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};