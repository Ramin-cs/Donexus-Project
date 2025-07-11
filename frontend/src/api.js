// API service for frontend
// Handles all communication with the backend API

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle validation errors with details
    if (errorData.code === 'VALIDATION_ERROR' && errorData.details) {
      const messages = errorData.details.map(detail => detail.message);
      throw new Error(messages.join(', '));
    }
    
    // Handle other specific error codes
    if (errorData.code === 'USER_DELETION_ERROR') {
      throw new Error('Cannot delete user. User may have associated tickets or other data.');
    }
    
    if (errorData.code === 'COMPANY_HAS_DATA') {
      throw new Error(`Cannot delete company. It has ${errorData.data?.members || 0} members and ${errorData.data?.issues || 0} tickets.`);
    }
    
    // Handle general errors with details
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to make authenticated requests
const authenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
};

// Authentication API calls
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);
    
    // Store tokens
    if (data.data?.tokens) {
      localStorage.setItem('authToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  },

  // Register user
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await handleResponse(response);
    
    // Store tokens
    if (data.data?.tokens) {
      localStorage.setItem('authToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  },

  // Logout user
  logout: async () => {
    try {
      await authenticatedRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user profile
  getProfile: async () => {
    return authenticatedRequest('/api/auth/me');
  },

  // Refresh token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await handleResponse(response);
    
    if (data.data?.accessToken) {
      localStorage.setItem('authToken', data.data.accessToken);
    }

    return data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Tickets API calls
export const ticketsAPI = {
  // Get all tickets with optional filters
  getTickets: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });

    const url = `/api/tickets${params.toString() ? `?${params.toString()}` : ''}`;
    return authenticatedRequest(url);
  },

  // Get specific ticket by ID
  getTicket: async (id) => {
    return authenticatedRequest(`/api/tickets/${id}`);
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    return authenticatedRequest('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  // Update ticket
  updateTicket: async (id, updateData) => {
    return authenticatedRequest(`/api/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  // Delete ticket (admin only)
  deleteTicket: async (id) => {
    return authenticatedRequest(`/api/tickets/${id}`, {
      method: 'DELETE',
    });
  },

  // Get ticket statistics
  getTicketStats: async () => {
    return authenticatedRequest('/api/tickets/stats/summary');
  }
};

// Users API calls (admin only)
export const usersAPI = {
  // Get all users
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });

    const url = `/api/users${params.toString() ? `?${params.toString()}` : ''}`;
    return authenticatedRequest(url);
  },

  // Get specific user
  getUser: async (id) => {
    return authenticatedRequest(`/api/users/${id}`);
  },

  // Create new user
  createUser: async (userData) => {
    return authenticatedRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user
  updateUser: async (id, updateData) => {
    return authenticatedRequest(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  // Delete user
  deleteUser: async (id) => {
    return authenticatedRequest(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Get user statistics
  getUserStats: async () => {
    return authenticatedRequest('/api/users/stats/summary');
  }
};

// Companies API calls (admin only)
export const companiesAPI = {
  // Get all companies
  getCompanies: async () => {
    return authenticatedRequest('/api/companies');
  },

  // Get specific company
  getCompany: async (id) => {
    return authenticatedRequest(`/api/companies/${id}`);
  },

  // Create new company
  createCompany: async (companyData) => {
    return authenticatedRequest('/api/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  },

  // Update company
  updateCompany: async (id, updateData) => {
    return authenticatedRequest(`/api/companies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  // Delete company
  deleteCompany: async (id) => {
    return authenticatedRequest(`/api/companies/${id}`, {
      method: 'DELETE',
    });
  },

  // Get company statistics
  getCompanyStats: async () => {
    return authenticatedRequest('/api/companies/stats/summary');
  }
};

// Message API
export const messagesAPI = {
  async getMessages(ticketId) {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return handleResponse(response);
  },

  async createMessage(ticketId, content) {
    const response = await fetch(`${API_URL}/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ content })
    });
    return handleResponse(response);
  }
};

// Legacy functions for backward compatibility
export async function getTickets() {
  try {
    const response = await ticketsAPI.getTickets();
    return response.data.tickets || [];
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
}

export async function createTicket(data) {
  try {
    const response = await ticketsAPI.createTicket(data);
    return response.data.ticket;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

export async function updateTicketStatus(id, status) {
  try {
    const response = await ticketsAPI.updateTicket(id, { state: status });
    return response.data.ticket;
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
}

export async function deleteTicket(id) {
  try {
    await ticketsAPI.deleteTicket(id);
    return true;
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
}
