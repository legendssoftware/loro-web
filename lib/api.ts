import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  // Don't get token from store in interceptor to avoid SSR issues
  // Token should be passed in headers from the component/hook
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the component handle the error
    return Promise.reject(error);
  }
);

export const fetchOrganisations = async (token: string) => {
  try {
    const response = await api.get('/organisations', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchBranches = async (organisationId: number | null, token: string) => {
  if (!organisationId) return [];
  try {
    const response = await api.get(`/branches?organisation=${organisationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 