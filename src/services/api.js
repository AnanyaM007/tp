const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001/api';

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}`);
    }
    return data;
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Server Error (${response.status}): ${text.substring(0, 100)}`);
    }
    return text;
  }
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  // Users
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  async updateUserRole(id, role) {
    const response = await fetch(`${API_BASE_URL}/users/${id}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(response);
  },

  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Requests
  async getAllRequests() {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async getRequestById(id) {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async createRequest(request) {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse(response);
  },

  async addSubmission(requestId, submission) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/submissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(submission),
    });
    return handleResponse(response);
  },

  async updateRequestStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  async updateRequest(id, updates) {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async deleteRequest(id) {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
