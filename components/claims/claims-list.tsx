import { Claim } from "@/lib/types/claims";
import { ClaimCard } from "./claim-card";

interface ClaimsListProps {
    claims: Claim[];
    onEdit?: (claim: Claim) => void;
    onDelete?: (claim: Claim) => void;
}

export function ClaimsList({ claims, onEdit, onDelete }: ClaimsListProps) {
    if (!claims.length) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-lg font-semibold text-gray-600">No claims found</p>
                <p className="text-sm text-gray-500">Create a new claim to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {claims.map((claim) => (
                <ClaimCard
                    key={claim.uid}
                    claim={claim}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
} 