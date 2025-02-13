import { memo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSessionStore } from "@/store/use-session-store";
import { Lead, LeadStatus } from "@/lib/types/leads";
import { fetchLeads, updateLead, deleteLead, restoreLead } from "@/helpers/leads";
import { RequestConfig } from "@/lib/types/tasks";
import LeadList from "./lead-list";
import LeadDetailModal from "./lead-detail-modal";

const LeadsModule = () => {
    const { accessToken } = useSessionStore();
    const queryClient = useQueryClient();
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const config: RequestConfig = {
        headers: {
            token: accessToken || "",
        },
    };

    const { data: leadsData, isLoading } = useQuery({
        queryKey: ["leads"],
        queryFn: () => fetchLeads(config),
        enabled: !!accessToken,
    });

    const updateLeadMutation = useMutation({
        mutationFn: ({ ref, updatedLead }: { ref: number; updatedLead: Partial<Lead> }) =>
            updateLead({ ref, updatedLead, config }),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success(response.message || "Lead status updated successfully");
            setIsModalOpen(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update lead status");
        },
    });

    const deleteLeadMutation = useMutation({
        mutationFn: (ref: number) => deleteLead(ref, config),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success(response.message || "Lead deleted successfully");
            setIsModalOpen(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete lead");
        },
    });

    const restoreLeadMutation = useMutation({
        mutationFn: (ref: number) => restoreLead(ref, config),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success(response.message || "Lead restored successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to restore lead");
        },
    });

    const handleLeadClick = (lead: Lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = (lead: Lead) => {
        const newStatus =
            lead.status === LeadStatus.APPROVED
                ? LeadStatus.REVIEW
                : lead.status === LeadStatus.REVIEW
                ? LeadStatus.DECLINED
                : LeadStatus.APPROVED;

        updateLeadMutation.mutate({
            ref: lead.uid,
            updatedLead: { status: newStatus },
        });
    };

    const handleDeleteLead = (lead: Lead) => {
        if (window.confirm("Are you sure you want to delete this lead?")) {
            deleteLeadMutation.mutate(lead.uid);
        }
    };

    const handleRestoreLead = (lead: Lead) => {
        restoreLeadMutation.mutate(lead.uid);
    };

    return (
        <div className="space-y-4">
            <LeadList
                leads={leadsData?.leads || []}
                onLeadClick={handleLeadClick}
                isLoading={isLoading}
            />
            <LeadDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedLead={selectedLead}
                onUpdate={handleUpdateStatus}
                onDelete={handleDeleteLead}
                onRestore={handleRestoreLead}
                isUpdating={updateLeadMutation.isPending}
                isDeleting={deleteLeadMutation.isPending}
                isRestoring={restoreLeadMutation.isPending}
            />
        </div>
    );
};

export default memo(LeadsModule);
