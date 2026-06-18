const API_BASE_URL = import.meta.env.PROD
  ? 'https://mindframe.theshaheens.info' // The reverse proxy will handle routing to the correct port
  : 'http://localhost:3002';
const API_URL = `${API_BASE_URL}/api`;

/**
 * A helper function to handle fetch requests and responses in a centralized way.
 * It automatically adds the Authorization header if a token is provided.
 * @param {string} endpoint - The API endpoint to call (e.g., '/sessions').
 * @param {object} options - Fetch options, including an optional 'token'.
 * @returns {Promise<{ok: boolean, data?: any, status?: number, error?: string}>}
 */
async function apiRequest(endpoint, options = {}) {
  const { token, ...restOptions } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...restOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...restOptions, headers });

    // Handle auth errors specifically for auto-logout
    if (response.status === 401 || response.status === 403) {
      return { ok: false, status: response.status, error: 'Unauthorized' };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API request failed: ${response.statusText}`);
    }

    return { ok: true, data };
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    // Re-throw to be caught by the calling function's try/catch block
    throw error;
  }
}

// --- Auth ---
export const login = (username, password) => 
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const register = (username, password) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

// --- Data Fetching ---
export const getInitialData = (token) => 
  Promise.all([
    apiRequest('/sessions', { token }),
    apiRequest('/settings', { token }),
  ]);

export const migrateLegacyData = async (token, legacyHistory) => {
  for (const item of legacyHistory) {
    await apiRequest('/sessions', { method: 'POST', token, body: JSON.stringify(item) });
  }
};

// --- Sessions ---
export const saveSession = (token, session) =>
  apiRequest('/sessions', { method: 'POST', token, body: JSON.stringify(session) });

export const deleteSession = (token, id) =>
  apiRequest(`/sessions/${id}`, { method: 'DELETE', token });

// --- Settings ---
export const updateSettings = (token, newSettings) =>
  apiRequest('/settings', {
    method: 'PUT',
    token,
    body: JSON.stringify(newSettings),
  });

// --- Admin ---
export const getUsers = (token) => apiRequest('/users', { token });
export const createUser = (token, userData) => 
  apiRequest('/users', { method: 'POST', token, body: JSON.stringify(userData) });
export const updateUser = (token, id, userData) => 
  apiRequest(`/users/${id}`, { method: 'PUT', token, body: JSON.stringify(userData) });