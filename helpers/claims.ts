import axios from "axios";
import {
  ClaimResponse,
  CreateClaimDTO,
  UpdateClaimDTO,
} from "@/lib/types/claims";
import { RequestConfig } from "@/lib/types/tasks";
import { API_URL } from "@/lib/utils/endpoints";

// Fetch all claims
export const fetchClaims = async (config: RequestConfig) => {
  if (!config?.headers?.token) {
    return {
      claims: [],
      message: "Authentication token is missing",
      stats: null,
    };
  }

  try {
    const response = await axios.get<ClaimResponse>(`${API_URL}/claims`, {
      headers: {
        Authorization: `Bearer ${config.headers.token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          claims: [],
          message: "Authentication failed. Please sign in again.",
          stats: null,
        };
      }
      return { claims: [], message: error.message, stats: null };
    }
    return { claims: [], message: "Error fetching claims", stats: null };
  }
};

// Fetch a single claim by reference
export const fetchClaimByRef = async (ref: number, config: RequestConfig) => {
  if (!config?.headers?.token) {
    return { claim: null, message: "Authentication token is missing" };
  }

  try {
    const response = await axios.get<ClaimResponse>(
      `${API_URL}/claims/${ref}`,
      {
        headers: {
          Authorization: `Bearer ${config.headers.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          claim: null,
          message: "Authentication failed. Please sign in again.",
        };
      }
      return { claim: null, message: error.message };
    }
    return { claim: null, message: "Error fetching claim" };
  }
};

// Fetch claims by user reference
export const fetchClaimsByUser = async (ref: number, config: RequestConfig) => {
  if (!config?.headers?.token) {
    return {
      claims: [],
      message: "Authentication token is missing",
      stats: null,
    };
  }

  try {
    const response = await axios.get<ClaimResponse>(
      `${API_URL}/claims/for/${ref}`,
      {
        headers: {
          Authorization: `Bearer ${config.headers.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return {
          claims: [],
          message: "Authentication failed. Please sign in again.",
          stats: null,
        };
      }
      return { claims: [], message: error.message, stats: null };
    }
    return { claims: [], message: "Error fetching user claims", stats: null };
  }
};

// Create a new claim
export const createClaim = async (
  claim: CreateClaimDTO,
  config: RequestConfig
) => {
  if (!config?.headers?.token) {
    return { message: "Authentication token is missing" };
  }

  try {
    const response = await axios.post<ClaimResponse>(
      `${API_URL}/claims`,
      claim,
      {
        headers: {
          Authorization: `Bearer ${config.headers.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { message: "Authentication failed. Please sign in again." };
      }
      return { message: error.message };
    }
    return { message: "Error creating claim" };
  }
};

// Update a claim
export const updateClaim = async ({
  ref,
  updatedClaim,
  config,
}: {
  ref: number;
  updatedClaim: UpdateClaimDTO;
  config: RequestConfig;
}) => {
  if (!config?.headers?.token) {
    return { message: "Authentication token is missing" };
  }

  try {
    const response = await axios.patch<ClaimResponse>(
      `${API_URL}/claims/${ref}`,
      updatedClaim,
      {
        headers: {
          Authorization: `Bearer ${config.headers.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { message: "Authentication failed. Please sign in again." };
      }
      return { message: error.message };
    }
    return { message: "Error updating claim" };
  }
};

// Delete a claim
export const deleteClaim = async (ref: number, config: RequestConfig) => {
  if (!config?.headers?.token) {
    return { message: "Authentication token is missing" };
  }

  try {
    const response = await axios.delete<ClaimResponse>(
      `${API_URL}/claims/${ref}`,
      {
        headers: {
          Authorization: `Bearer ${config.headers.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { message: "Authentication failed. Please sign in again." };
      }
      return { message: error.message };
    }
    return { message: "Error deleting claim" };
  }
};

// Restore a deleted claim
export const restoreClaim = async (ref: number, config: RequestConfig) => {
  if (!config?.headers?.token) {
    return { message: "Authentication token is missing" };
  }

  try {
    const response = await axios.patch<ClaimResponse>(
      `${API_URL}/claims/restore/${ref}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${config.headers.token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { message: "Authentication failed. Please sign in again." };
      }
      return { message: error.message };
    }
    return { message: "Error restoring claim" };
  }
};
