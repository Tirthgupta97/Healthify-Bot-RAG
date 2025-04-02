// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Helper for API requests with authentication
export async function apiRequest(endpoint, options = {}) {
  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Handle different error status codes
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login?error=session_expired';
        return null;
      }
      
      // Parse and throw the error from the server
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    throw error;
  }
}