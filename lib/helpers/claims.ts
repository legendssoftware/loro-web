import axios from "axios";
import { Claim, CreateClaimDTO, UpdateClaimDTO } from "../types/claims";
import { API_URL } from "../utils/endpoints";

export async function fetchClaims(): Promise<Claim[]> {
    try {
        const { data } = await axios.get<Claim[]>(`${API_URL}/claims`);
        return data;
    } catch (error) {
        console.error("Error fetching claims:", error);
        throw new Error("Failed to fetch claims");
    }
}

export async function createClaim(claim: CreateClaimDTO): Promise<Claim> {
    try {
        const { data } = await axios.post<Claim>(`${API_URL}/claims`, claim);
        return data;
    } catch (error) {
        console.error("Error creating claim:", error);
        throw new Error("Failed to create claim");
    }
}

export async function updateClaim(claim: UpdateClaimDTO & { id: number }): Promise<Claim> {
    try {
        const { data } = await axios.patch<Claim>(`${API_URL}/claims/${claim.id}`, claim);
        return data;
    } catch (error) {
        console.error("Error updating claim:", error);
        throw new Error("Failed to update claim");
    }
}

export async function deleteClaim(uid: number): Promise<void> {
    try {
        await axios.delete(`${API_URL}/claims/${uid}`);
    } catch (error) {
        console.error("Error deleting claim:", error);
        throw new Error("Failed to delete claim");
    }
}

export async function restoreClaim(uid: number): Promise<void> {
    try {
        await axios.patch(`${API_URL}/claims/${uid}/restore`);
    } catch (error) {
        console.error("Error restoring claim:", error);
        throw new Error("Failed to restore claim");
    }
} 