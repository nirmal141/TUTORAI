// Get the API base URL from environment variables or use a default
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Function to get the full API URL
export const getApiUrl = (endpoint: string): string => {
  // If the endpoint already starts with http, return it as is (for external APIs)
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // If the endpoint already starts with /api, use it directly
  if (endpoint.startsWith('/api')) {
    // In production, we use relative URLs
    if (API_BASE_URL) {
      // Remove the leading /api if API_BASE_URL already includes it
      const path = API_BASE_URL.endsWith('/api') 
        ? endpoint.replace(/^\/api/, '') 
        : endpoint;
      return `${API_BASE_URL}${path}`;
    }
    return endpoint;
  }
  
  // Otherwise, prepend /api to the endpoint
  return `${API_BASE_URL}/api/${endpoint}`;
};

// Helper function for making API requests
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = getApiUrl(endpoint);
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}; 