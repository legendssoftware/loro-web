import axios from "axios";
import { LeadResponse, CreateLeadDTO, UpdateLeadDTO } from "@/lib/types/leads";
import { RequestConfig } from "@/lib/types/tasks";
import { API_URL } from "@/lib/utils/endpoints";

// Fetch all leads
export const fetchLeads = async (config: RequestConfig) => {
    if (!config?.headers?.token) {
        return { leads: [], message: "Authentication token is missing", stats: null };
    }

    try {
        const response = await axios.get<LeadResponse>(`${API_URL}/leads`, {
            headers: {
                Authorization: `Bearer ${config.headers.token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return { leads: [], message: "Authentication failed. Please sign in again.", stats: null };
            }
            return { leads: [], message: error.message, stats: null };
        }
        return { leads: [], message: "Error fetching leads", stats: null };
    }
};

// Fetch a single lead by reference
export const fetchLeadByRef = async (ref: number, config: RequestConfig) => {
    if (!config?.headers?.token) {
        return { lead: null, message: "Authentication token is missing" };
    }

    try {
        const response = await axios.get<LeadResponse>(`${API_URL}/leads/${ref}`, {
            headers: {
                Authorization: `Bearer ${config.headers.token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return { lead: null, message: "Authentication failed. Please sign in again." };
            }
            return { lead: null, message: error.message };
        }
        return { lead: null, message: "Error fetching lead" };
    }
};

// Fetch leads by user reference
export const fetchLeadsByUser = async (ref: number, config: RequestConfig) => {
    if (!config?.headers?.token) {
        return { leads: [], message: "Authentication token is missing", stats: null };
    }

    try {
        const response = await axios.get<LeadResponse>(`${API_URL}/leads/for/${ref}`, {
            headers: {
                Authorization: `Bearer ${config.headers.token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return { leads: [], message: "Authentication failed. Please sign in again.", stats: null };
            }
            return { leads: [], message: error.message, stats: null };
        }
        return { leads: [], message: "Error fetching user leads", stats: null };
    }
};

// Create a new lead
export const createLead = async (lead: CreateLeadDTO, config: RequestConfig) => {
    if (!config?.headers?.token) {
        return { message: "Authentication token is missing" };
    }

    try {
        const response = await axios.post<LeadResponse>(`${API_URL}/leads`, lead, {
            headers: {
                Authorization: `Bearer ${config.headers.token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return { message: "Authentication failed. Please sign in again." };
            }
            return { message: error.message };
        }
        return { message: "Error creating lead" };
    }
};

// Update a lead
export const updateLead = async ({
    ref,
    updatedLead,
    config,
}: {
    ref: number;
    updatedLead: UpdateLeadDTO;
    config: RequestConfig;
}) => {
    if (!config?.headers?.token) {
        return { message: "Authentication token is missing" };
    }

    try {
        const response = await axios.patch<LeadResponse>(`${API_URL}/leads/${ref}`, updatedLead, {
            headers: {
                Authorization: `Bearer ${config.headers.token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return { message: "Authentication failed. Please sign in again." };
            }
            return { message: error.message };
        }
        return { message: "Error updating lead" };
    }
};

// Delete a lead (soft delete)
export const deleteLead = async (ref: number, config: RequestConfig) => {
    if (!config?.headers?.token) {
        return { message: "Authentication token is missing" };
    }

    try {
        const response = await axios.delete<LeadResponse>(`${API_URL}/leads/${ref}`, {
            headers: {
                Authorization: `Bearer ${config.headers.token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return { message: "Authentication failed. Please sign in again." };
            }
            return { message: error.message };
        }
        return { message: "Error deleting lead" };
    }
};

// Restore a deleted lead
export const restoreLead = async (ref: number, config: RequestConfig) => {
    if (!config?.headers?.token) {
        return { message: "Authentication token is missing" };
    }

    try {
        const response = await axios.patch<LeadResponse>(`${API_URL}/leads/restore/${ref}`, {}, {
            headers: {
                Authorization: `Bearer ${config.headers.token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return { message: "Authentication failed. Please sign in again." };
            }
            return { message: error.message };
        }
        return { message: "Error restoring lead" };
    }
}; 