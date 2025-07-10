import { axiosInstance } from '@/lib/services/api-client';
import { Client } from '@/hooks/use-clients-query';
import { ClientFormValues } from '../components/client-form';

interface ApiResponse<T> {
  data: T | null;
  message: string;
  success: boolean;
}

/**
 * Service for handling client-related API calls
 */
export const ClientService = {
  /**
   * Create a new client
   * @param clientData - The client data to create
   * @returns The created client
   */
  async createClient(clientData: ClientFormValues): Promise<ApiResponse<Client>> {
    try {
      const response = await axiosInstance.post('/clients', clientData);
      return {
        data: response.data.client || null,
        message: response.data.message || 'Client created successfully',
        success: true
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create client';
      console.error('Error creating client:', error);
      return {
        data: null,
        message: errorMessage,
        success: false
      };
    }
  },

  /**
   * Update an existing client
   * @param clientId - The ID of the client to update
   * @param clientData - The client data to update
   * @returns The updated client
   */
  async updateClient(clientId: number, clientData: Partial<ClientFormValues>): Promise<ApiResponse<Client>> {
    try {
      const response = await axiosInstance.patch(`/clients/${clientId}`, clientData);
      return {
        data: response.data.client || null,
        message: response.data.message || 'Client updated successfully',
        success: true
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update client';
      console.error('Error updating client:', error);
      return {
        data: null,
        message: errorMessage,
        success: false
      };
    }
  },

  /**
   * Get a client by ID
   * @param clientId - The ID of the client to get
   * @returns The client data
   */
  async getClientById(clientId: number): Promise<ApiResponse<Client>> {
    try {
      const response = await axiosInstance.get(`/clients/${clientId}`);
      return {
        data: response.data.client || null,
        message: response.data.message || 'Client fetched successfully',
        success: true
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch client';
      console.error('Error fetching client:', error);
      return {
        data: null,
        message: errorMessage,
        success: false
      };
    }
  },

  /**
   * Update client profile (for authenticated clients)
   * @param profileData - The profile data to update
   * @returns The updated profile
   */
  async updateClientProfile(profileData: Partial<any>): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.patch('/clients/profile', profileData);
      return {
        data: response.data.data || null,
        message: response.data.message || 'Profile updated successfully',
        success: true
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      console.error('Error updating client profile:', error);
      return {
        data: null,
        message: errorMessage,
        success: false
      };
    }
  }
};
