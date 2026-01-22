const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  // Get all requests
  async getAllRequests() {
    const response = await fetch(`${API_BASE_URL}/requests`);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },

  // Get single request by ID
  async getRequestById(id) {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`);
    if (!response.ok) throw new Error('Failed to fetch request');
    return response.json();
  },

  // Create new request
  async createRequest(request) {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to create request');
    return response.json();
  },

  // Add submission to a request
  async addSubmission(requestId, submission) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    if (!response.ok) throw new Error('Failed to add submission');
    return response.json();
  },

  // Update request status
  async updateRequestStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  // Update full request
  async updateRequest(id, updates) {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update request');
    return response.json();
  },
};
