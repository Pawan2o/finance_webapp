// API utility for making authenticated HTTP requests with token refresh
import config from '../config/global.json';
import { getAuthToken, redirectToLogin } from './auth';

export const API_BASE_URL = import.meta.env.DEV ? '' : (config.api.host_ || config.api.host);

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

// Makes API requests with automatic token refresh on 401 errors
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  // Get the access token from localStorage
  const token = getAuthToken();
  
  // Prepare headers with authorization token if available
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  // Make the initial API request
  let response = await fetch(url, { ...options, headers });

  // Handle 401 Unauthorized - attempt to refresh token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh');
    
    if (refreshToken) {
      try {
        // Request a new access token using the refresh token
        const refreshRes = await fetch(apiUrl(config.api.refreshToken), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });

        if (refreshRes.ok) {
          // Save the new access token
          const data = await refreshRes.json();
          localStorage.setItem('token', data.access);
          
          // Retry the original request with the new token
          headers.Authorization = `Bearer ${data.access}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed - clear storage and redirect to login
          redirectToLogin();
        }
      } catch (error) {
        // Error during refresh - clear storage and redirect to login
        redirectToLogin();
      }
    } else {
      // No refresh token available - redirect to login
      redirectToLogin();
    }
  }

  return response;
};
