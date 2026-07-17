const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const config = {
    method,
    headers,
    credentials: 'include',
  };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  // If no content, just return ok status
  if (response.status === 204) return { success: true };

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    throw error;
  }
  return data;
};

// Auth API
export const loginUser = (email, password) => 
  request('/api/auth/login', 'POST', { email, password });

export const registerUser = (email, password) => 
  request('/api/auth/register', 'POST', { email, password });

// URL API
export const shortenUrl = (urlData, token) => 
  request('/', 'POST', urlData, token);

export const getUserUrls = (token) => 
  request('/api/user/urls', 'GET', null, token);

export const deleteUserUrl = (id, token) => 
  request(`/api/user/urls/${id}`, 'DELETE', null, token);

export const getUrlAnalytics = (shortUrlId, token) => 
  request(`/api/user/urls/${shortUrlId}/analytics`, 'GET', null, token);

export const getUrlQR = (shortUrlId, token) => 
  request(`/api/urls/${shortUrlId}/qr`, 'GET', null, token);
