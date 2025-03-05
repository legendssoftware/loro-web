import { Lead, LeadFilterParams, LeadStatus, PaginatedLeadsResponse } from '@/lib/types/lead';
import { axiosInstance } from './api-client';
import { mockLeads } from './mock-data';

// Check if we're in development mode
const IS_DEV = process.env.NODE_ENV === 'development';

class LeadsService {
    /**
     * Fetch all leads with optional filters
     */
    async getLeads(filters?: LeadFilterParams): Promise<PaginatedLeadsResponse> {
        if (IS_DEV) {
            // Use mock data in development
            return this.getMockLeads(filters);
        }

        try {
            const response = await axiosInstance.get('/leads', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching leads:', error);
            throw error;
        }
    }

    /**
     * Get mock leads data for development
     */
    private getMockLeads(filters?: LeadFilterParams): PaginatedLeadsResponse {
        let filteredLeads = [...mockLeads];

        // Apply filters if provided
        if (filters) {
            if (filters.status) {
                filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
            }

            if (filters.search) {
                const search = filters.search.toLowerCase();
                filteredLeads = filteredLeads.filter(lead =>
                    lead.name.toLowerCase().includes(search) ||
                    lead.email.toLowerCase().includes(search) ||
                    lead.companyName.toLowerCase().includes(search) ||
                    lead.phone.includes(search)
                );
            }

            if (filters.startDate) {
                const startDate = new Date(filters.startDate);
                filteredLeads = filteredLeads.filter(lead =>
                    new Date(lead.createdAt) >= startDate
                );
            }

            if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                filteredLeads = filteredLeads.filter(lead =>
                    new Date(lead.createdAt) <= endDate
                );
            }
        }

        // Calculate pagination
        const page = filters?.page || 1;
        const limit = filters?.limit || 25;
        const total = filteredLeads.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

        return {
            items: paginatedLeads,
            total,
            page,
            limit,
            totalPages,
        };
    }

    /**
     * Fetch a single lead by id
     */
    async getLead(id: number): Promise<{ lead: Lead; message: string; stats: any }> {
        if (IS_DEV) {
            // Use mock data in development
            const lead = mockLeads.find(lead => lead.uid === id);

            if (!lead) {
                throw new Error(`Lead with id ${id} not found`);
            }

            return {
                lead,
                message: 'Lead retrieved successfully',
                stats: {
                    responseTime: '2 days',
                    qualityScore: 85,
                    conversionRate: '65%'
                }
            };
        }

        try {
            const response = await axiosInstance.get(`/leads/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching lead ${id}:`, error);
            throw error;
        }
    }

    /**
     * Create a new lead
     */
    async createLead(leadData: Partial<Lead>): Promise<{ message: string; data: Lead | null }> {
        if (IS_DEV) {
            // Create a mock lead in development
            const newId = Math.max(...mockLeads.map(lead => lead.uid)) + 1;
            const newLead: Lead = {
                uid: newId,
                name: leadData.name || 'New Lead',
                email: leadData.email || 'newlead@example.com',
                phone: leadData.phone || '(555) 555-5555',
                companyName: leadData.companyName || 'New Company',
                notes: leadData.notes || '',
                status: leadData.status || LeadStatus.NEW,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                owner: {
                    uid: 1,
                    name: 'Current User',
                    email: 'user@example.com',
                }
            };

            mockLeads.push(newLead);

            return {
                message: 'Lead created successfully',
                data: newLead
            };
        }

        try {
            const response = await axiosInstance.post('/leads', leadData);
            return response.data;
        } catch (error) {
            console.error('Error creating lead:', error);
            throw error;
        }
    }

    /**
     * Update an existing lead
     */
    async updateLead(id: number, leadData: Partial<Lead>): Promise<{ message: string }> {
        if (IS_DEV) {
            // Update a mock lead in development
            const leadIndex = mockLeads.findIndex(lead => lead.uid === id);

            if (leadIndex === -1) {
                throw new Error(`Lead with id ${id} not found`);
            }

            mockLeads[leadIndex] = {
                ...mockLeads[leadIndex],
                ...leadData,
                updatedAt: new Date()
            };

            return {
                message: 'Lead updated successfully'
            };
        }

        try {
            const response = await axiosInstance.put(`/leads/${id}`, leadData);
            return response.data;
        } catch (error) {
            console.error(`Error updating lead ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a lead
     */
    async deleteLead(id: number): Promise<{ message: string }> {
        if (IS_DEV) {
            // Delete a mock lead in development
            const leadIndex = mockLeads.findIndex(lead => lead.uid === id);

            if (leadIndex === -1) {
                throw new Error(`Lead with id ${id} not found`);
            }

            // Set isDeleted to true instead of actually removing from the array
            mockLeads[leadIndex].isDeleted = true;

            return {
                message: 'Lead deleted successfully'
            };
        }

        try {
            const response = await axiosInstance.delete(`/leads/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting lead ${id}:`, error);
            throw error;
        }
    }

    /**
     * Restore a deleted lead
     */
    async restoreLead(id: number): Promise<{ message: string }> {
        if (IS_DEV) {
            // Restore a mock lead in development
            const leadIndex = mockLeads.findIndex(lead => lead.uid === id);

            if (leadIndex === -1) {
                throw new Error(`Lead with id ${id} not found`);
            }

            mockLeads[leadIndex].isDeleted = false;

            return {
                message: 'Lead restored successfully'
            };
        }

        try {
            const response = await axiosInstance.post(`/leads/${id}/restore`);
            return response.data;
        } catch (error) {
            console.error(`Error restoring lead ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get leads grouped by status for Kanban view
     */
    async getLeadsByStatus(): Promise<Record<LeadStatus, Lead[]>> {
        try {
            const response = await this.getLeads({ limit: 100 });

            // Group leads by status
            const leadsByStatus: Record<LeadStatus, Lead[]> = {
                [LeadStatus.NEW]: [],
                [LeadStatus.CONTACTED]: [],
                [LeadStatus.CLOSED_WON]: [],
                [LeadStatus.CLOSED_LOST]: []
            };

            response.items.forEach(lead => {
                if (lead.status in leadsByStatus) {
                    leadsByStatus[lead.status as LeadStatus].push(lead);
                } else {
                    // If the status doesn't match our enum, default to NEW
                    leadsByStatus[LeadStatus.NEW].push(lead);
                }
            });

            return leadsByStatus;
        } catch (error) {
            console.error('Error fetching leads by status:', error);
            throw error;
        }
    }
}

export const leadsService = new LeadsService();
