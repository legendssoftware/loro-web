'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Lead, LeadStatus, LeadStatusHistoryEntry } from '@/lib/types/lead';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertCircle,
    Calendar,
    Clock,
    User,
    Building,
    Mail,
    Phone,
    Trash2,
    Check,
    X,
    Edit,
    Plus,
    MapPin,
    CheckCircle2,
    XCircle,
    RefreshCw,
    CalendarCheck,
    Paperclip,
    Send,
    Image,
    MessageSquare,
    FileIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    ClientForm,
    ClientFormValues,
} from '@/modules/clients/components/client-form';
import { ClientStatus } from '@/hooks/use-clients-query';
import { toast } from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { TaskPriority, TaskType } from '@/lib/types/task';
import { axiosInstance } from '@/lib/services/api-client';
import TaskForm from '@/modules/tasks/components/task-form';
import {
    useInteractionsQuery,
    InteractionType,
} from '@/hooks/use-interactions-query';
import { useAuthStore, selectProfileData } from '@/store/auth-store';
import { Progress } from '@/components/ui/progress';

interface LeadDetailsModalProps {
    lead: Lead;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus?: (
        leadId: number, 
        newStatus: string, 
        reason?: string, 
        description?: string
    ) => void;
    onDelete?: (leadId: number) => void;
}

export function LeadDetailsModal({
    lead,
    isOpen,
    onClose,
    onUpdateStatus,
    onDelete,
}: LeadDetailsModalProps) {
    const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status);
    const [activeTab, setActiveTab] = useState<string>('details');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] =
        useState<boolean>(false);
    const [pendingStatusChange, setPendingStatusChange] =
        useState<LeadStatus | null>(null);
    const [statusChangeReason, setStatusChangeReason] = useState<string>('');
    const [statusChangeDescription, setStatusChangeDescription] = useState<string>('');
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isClientFormOpen, setIsClientFormOpen] = useState<boolean>(false);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState<boolean>(false);
    const [newMessage, setNewMessage] = useState<string>('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const profileData = useAuthStore(selectProfileData);
    const [localInteractions, setLocalInteractions] = useState<any[]>([]);

    // Use the interactions query hook
    const {
        useLeadInteractions,
        sendMessageWithAttachment,
        uploadProgress,
        isUploading,
    } = useInteractionsQuery();

    // Fetch interactions for the current lead
    const {
        data: interactions = [],
        isLoading: isLoadingInteractions,
        refetch: refetchInteractions,
    } = useLeadInteractions(lead.uid);

    // Update local interactions when server data changes
    useEffect(() => {
        if (interactions?.length > 0) {
            setLocalInteractions(interactions);
        }
    }, [interactions]);

    // Refetch interactions when the modal is opened
    useEffect(() => {
        if (isOpen && lead.uid) {
            refetchInteractions();
        }
    }, [isOpen, lead.uid, refetchInteractions]);

    // Set up polling to periodically check for new messages
    useEffect(() => {
        let pollingInterval: NodeJS.Timeout;

        if (isOpen && activeTab === 'chat') {
            // Poll every 10 seconds when chat tab is active
            pollingInterval = setInterval(() => {
                refetchInteractions();
            }, 10000);
        }

        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [isOpen, activeTab, refetchInteractions]);

    const formatDate = (date?: Date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM d, yyyy');
    };

    const formatTime = (date?: Date) => {
        if (!date) return '';
        return format(new Date(date), 'h:mm a');
    };

    const getStatusBadgeColor = (status: LeadStatus) => {
        switch (status) {
            case LeadStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case LeadStatus.APPROVED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case LeadStatus.REVIEW:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case LeadStatus.DECLINED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case LeadStatus.CONVERTED:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case LeadStatus.CANCELLED:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusButtonVariant = (status: LeadStatus) => {
        switch (status) {
            case LeadStatus.PENDING:
                return `text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-yellow-900/30 ${currentStatus === status ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`;
            case LeadStatus.APPROVED:
                return `text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${currentStatus === status ? 'bg-green-100 dark:bg-green-900/30' : ''}`;
            case LeadStatus.REVIEW:
                return `text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:border-blue-900/30 ${currentStatus === status ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`;
            case LeadStatus.DECLINED:
                return `text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${currentStatus === status ? 'bg-red-100 dark:bg-red-900/30' : ''}`;
            case LeadStatus.CONVERTED:
                return `text-purple-800 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30 ${currentStatus === status ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`;
            case LeadStatus.CANCELLED:
                return `text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${currentStatus === status ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`;
            default:
                return '';
        }
    };

    const handleStatusChange = (newStatus: LeadStatus) => {
        if (newStatus === currentStatus) return;

        // For conversion, show the client form instead of confirmation dialog
        if (newStatus === LeadStatus.CONVERTED) {
            setPendingStatusChange(newStatus);
            setIsClientFormOpen(true);
            showSuccessToast(
                'Marking this lead as converted will change this lead to a client of yours',
                toast,
            );
        } else {
            setPendingStatusChange(newStatus);
            setConfirmStatusChangeOpen(true);
        }
    };

    const handleClientFormSubmit = async (data: ClientFormValues) => {
        try {
            // Here you would submit the client data to your API
            // After successful submission, update the lead status
            if (pendingStatusChange && onUpdateStatus) {
                setCurrentStatus(pendingStatusChange);
                onUpdateStatus(
                    lead.uid, 
                    pendingStatusChange,
                    "Lead converted to client", // Default reason
                    `Converted to client with ID: ${data.ref || 'N/A'}` // Default description
                );
            }
            setIsClientFormOpen(false);
            onClose();
        } catch (error) {
            showErrorToast('Failed to convert lead to client', toast);
        }
    };

    const confirmStatusChange = () => {
        if (onUpdateStatus && pendingStatusChange) {

            // Call the parent component's update function with the reason and description
            onUpdateStatus(
                Number(lead.uid), 
                pendingStatusChange,
                statusChangeReason,
                statusChangeDescription
            );

            // Update local state
            setCurrentStatus(pendingStatusChange);
            
            // Reset the dialog state
            setConfirmStatusChangeOpen(false);
            setPendingStatusChange(null);
            setStatusChangeReason('');
            setStatusChangeDescription('');
        }
    };

    const handleDelete = () => {
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete) {
            onDelete(lead.uid);
            setConfirmDeleteOpen(false);
            onClose();
        }
    };

    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);

            // Refetch interactions when switching to chat tab
            if (tabId === 'chat') {
                refetchInteractions();
            }
        }
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'media', label: 'Media' },
        { id: 'activity', label: 'Activity' },
        { id: 'chat', label: 'Chat' },
    ];

    const formatAddress = (address?: any) => {
        if (!address) return 'No address provided';

        const parts = [];
        if (address?.street) parts.push(address.street);
        if (address?.suburb) parts.push(address.suburb);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.postalCode) parts.push(address.postalCode);
        if (address.country) parts.push(address.country);

        return parts.join(', ') || 'No address details provided';
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        {/* Lead Description/Notes */}
                        <div className="p-4 rounded-lg bg-card">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Description
                            </h3>
                            <p className="text-xs font-thin font-body">
                                {lead.notes || 'No description provided'}
                            </p>
                        </div>

                        {/* Lead Information */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Name
                                </h3>
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-1 text-card-foreground/60" />
                                    <span className="text-xs font-thin uppercase font-body">
                                        {lead.name}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Email
                                </h3>
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 mr-1 text-card-foreground/60" />
                                    <span className="text-xs font-thin uppercase font-body">
                                        {lead.email}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Phone
                                </h3>
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-1 text-card-foreground/60" />
                                    <span className="text-xs font-thin uppercase font-body">
                                        {lead.phone}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Created
                                </h3>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1 text-card-foreground/60" />
                                    <span className="text-xs font-thin uppercase font-body">
                                        {formatDate(lead.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lead Status */}
                        <div>
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Status
                            </h3>
                            <div className="flex items-center">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] px-4 py-1 border-0 ${getStatusBadgeColor(
                                        lead.status,
                                    )}`}
                                >
                                    <AlertCircle className="w-5 h-5 mr-1" />
                                    <span className="text-xs font-normal uppercase font-body">
                                        {lead.status.replace('_', ' ')}
                                    </span>
                                </Badge>
                            </div>
                        </div>

                        {/* Lead Branch */}
                        {lead.branch && (
                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Branch Details
                                </h3>
                                <div className="p-4 border rounded-lg border-card">
                                    <div className="flex items-center mb-2">
                                        <Building className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-medium font-body">
                                            {lead.branch.name}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center">
                                            <Mail className="w-3 h-3 mr-1 text-card-foreground/60" />
                                            <span className="text-[10px] font-thin font-body">
                                                {lead.branch.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="w-3 h-3 mr-1 text-card-foreground/60" />
                                            <span className="text-[10px] font-thin font-body">
                                                {lead.branch.phone}
                                            </span>
                                        </div>
                                        {lead.branch.address && (
                                            <div className="flex items-start col-span-2 mt-1">
                                                <MapPin className="w-3 h-3 mr-1 mt-0.5 text-card-foreground/60" />
                                                <span className="text-[10px] font-thin font-body">
                                                    {formatAddress(
                                                        lead.branch.address,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lead Assignees */}
                        {lead.assignees && lead.assignees.length > 0 && (
                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Assignees
                                </h3>
                                <div className="space-y-3">
                                    {lead.assignees.map((assignee: any) => (
                                        <div key={assignee.uid} className="flex items-center p-3 border rounded-lg border-card">
                                            <Avatar className="w-12 h-12 mr-3 border border-primary">
                                                <AvatarImage
                                                    src={assignee.photoURL || ''}
                                                    alt={assignee.name || ''}
                                                />
                                                <AvatarFallback>
                                                    {assignee.name?.charAt(0) || ''}
                                                    {assignee.surname?.charAt(0) || ''}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-xs font-medium font-body">
                                                    {assignee.name || ''}{' '}
                                                    {assignee.surname || ''}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-body">
                                                    {assignee.email || ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lead Owner */}
                        {lead.owner && (
                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Owner
                                </h3>
                                <div className="flex items-center p-3 border rounded-lg border-card">
                                    <Avatar className="w-12 h-12 mr-3 border border-primary">
                                        <AvatarImage
                                            src={lead?.owner?.photoURL}
                                            alt={lead?.owner?.name}
                                        />
                                        <AvatarFallback>
                                            {lead?.owner?.name?.charAt(0)}
                                            {lead?.owner?.surname?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-medium font-body">
                                            {lead?.owner?.name}{' '}
                                            {lead?.owner?.surname}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            {lead?.owner?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'media':
                return (
                    <div className="space-y-6">
                        {lead.image ? (
                            <div className="p-4 rounded-lg bg-card">
                                <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                    Lead Media
                                </h3>
                                <div className="flex flex-col items-center">
                                    <div className="w-full max-w-lg overflow-hidden border rounded-md border-border">
                                        <img
                                            src={lead?.image}
                                            alt={`${lead?.name}'s media`}
                                            className="object-cover w-full h-auto"
                                        />
                                    </div>
                                    {lead?.companyName && (
                                        <p className="mt-4 text-xs font-thin font-body">
                                            <span className="font-normal">
                                                Company:
                                            </span>{' '}
                                            {lead?.companyName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 p-4 rounded-lg bg-card">
                                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                    No media available for this lead
                                </p>
                            </div>
                        )}
                    </div>
                );
            case 'activity':
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-card">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Status Change History
                            </h3>
                            {lead?.changeHistory && lead?.changeHistory?.length > 0 ? (
                                <div className="space-y-4">
                                    {lead?.changeHistory?.map((history, index) => (
                                        <div key={`activity-${index}`} className="p-3 border rounded-lg border-border">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn(
                                                            'text-[10px] font-normal uppercase font-body px-4 py-1 border-0',
                                                            getStatusBadgeColor(history.newStatus)
                                                        )}
                                                    >
                                                        {history?.newStatus?.replace('_', ' ')}
                                                    </Badge>
                                                    {history.oldStatus && (
                                                        <>
                                                            <span className="mx-2 text-[10px] uppercase text-muted-foreground font-body">from</span>
                                                            <Badge 
                                                                variant="outline" 
                                                                className={cn(
                                                                    'text-[10px] font-normal uppercase font-body px-4 py-1 border-0',
                                                                    getStatusBadgeColor(history.oldStatus)
                                                                )}
                                                            >
                                                                {history.oldStatus.replace('_', ' ')}
                                                            </Badge>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="text-[10px] uppercase text-muted-foreground font-body">
                                                    {formatDate(history.timestamp)}
                                                </p>
                                            </div>
                                            {history.reason && (
                                                <div className="mt-2">
                                                    <span className="text-[10px] font-medium uppercase font-body">Reason:</span> 
                                                    <span className="text-[10px] font-thin uppercase font-body ml-1">{history.reason}</span>
                                                </div>
                                            )}
                                            {history.description && (
                                                <div className="mt-1">
                                                    <span className="text-[10px] font-thin uppercase font-body text-muted-foreground">{history.description}</span>
                                                </div>
                                            )}
                                            {history?.userId && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    {history?.user ? (
                                                        <>
                                                            <Avatar className="w-6 h-6">
                                                                <AvatarImage src={history?.user?.photoURL} alt={history?.user?.name} />
                                                                <AvatarFallback>{history?.user?.name?.[0]}{history?.user?.surname?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-medium font-body">{history?.user?.name} {history?.user?.surname}</span>
                                                                <span className="text-[9px] text-muted-foreground font-body">{history?.user?.email} • {history?.user?.accessLevel}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            Changed by User ID: {history.userId}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-8 border border-dashed rounded-lg border-muted-foreground/20">
                                    <p className="text-xs font-thin text-muted-foreground font-body">
                                        No status change history available
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'chat':
                return (
                    <div className="flex flex-col h-full">
                        {/* Chat Messages */}
                        <div className="flex flex-col flex-1 gap-3 py-3 overflow-y-auto max-h-[50vh]">
                            {isLoadingInteractions &&
                            localInteractions.length === 0 ? (
                                <div className="flex items-center justify-center h-20">
                                    <svg
                                        className="w-8 h-8 animate-spin text-primary"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                </div>
                            ) : localInteractions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32">
                                    <MessageSquare
                                        className="w-10 h-10 mb-2 text-muted-foreground"
                                        strokeWidth={1}
                                    />
                                    <p className="text-xs font-light text-muted-foreground font-body">
                                        No messages yet. Start the conversation!
                                    </p>
                                </div>
                            ) : (
                                localInteractions.map((interaction) => {
                                    // Determine if the message is from the current user
                                    const isCurrentUser =
                                        interaction?.createdBy?.uid ===
                                        Number(profileData?.uid);
                                    // Prepare sender name for display
                                    const senderName = isCurrentUser
                                        ? 'You' // Or keep empty if preferred
                                        : `${interaction?.createdBy?.name || ''} ${interaction?.createdBy?.surname || ''}`.trim();
                                    // Prepare initials for fallback avatar
                                    const senderInitial =
                                        (interaction?.createdBy?.name?.charAt(
                                            0,
                                        ) || '') +
                                        (interaction?.createdBy?.surname?.charAt(
                                            0,
                                        ) || '');

                                    return (
                                        <div
                                            key={interaction?.uid}
                                            className={`flex gap-2 flex-row ${isCurrentUser ? 'justify-end' : 'items-end'} ${interaction?.isOptimistic ? 'opacity-70' : ''}`}
                                        >
                                            {/* Avatar for other users (left) */}
                                            {!isCurrentUser && (
                                                <Avatar className="w-8 h-8 bg-gray-700">
                                                    <AvatarImage
                                                        src={
                                                            interaction
                                                                ?.createdBy
                                                                ?.photoURL ||
                                                            '/images/placeholder-avatar.jpg'
                                                        }
                                                        alt={
                                                            interaction
                                                                ?.createdBy
                                                                ?.name
                                                        }
                                                    />
                                                    <AvatarFallback className="text-xs font-normal text-white uppercase font-body">
                                                        {senderInitial.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}

                                            {/* Message Content Column */}
                                            <div
                                                className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}
                                            >
                                                {/* Sender Name (only for other users) */}
                                                {!isCurrentUser && (
                                                    <p className="mb-1 text-[10px] font-medium text-muted-foreground font-body ml-3">
                                                        {senderName}
                                                    </p>
                                                )}

                                                {/* Message Bubble */}
                                                <div
                                                    className={`px-4 py-2 rounded-lg ${
                                                        isCurrentUser
                                                            ? 'bg-purple-600 text-white rounded-br-none' // Current user bubble style
                                                            : 'bg-gray-800 text-white rounded-bl-none' // Other user bubble style
                                                    }`}
                                                >
                                                    <p className="text-xs font-thin font-body md:text-sm">
                                                        {interaction?.message}
                                                    </p>
                                                    {interaction?.attachmentUrl && (
                                                        <div className="mt-2">
                                                            {interaction?.attachmentUrl.match(
                                                                /\.(jpeg|jpg|gif|png)$/i,
                                                            ) ? (
                                                                <img
                                                                    src={
                                                                        interaction?.attachmentUrl
                                                                    }
                                                                    alt="Attachment"
                                                                    className="object-cover max-w-full rounded-md max-h-48"
                                                                />
                                                            ) : (
                                                                <a
                                                                    href={
                                                                        interaction?.attachmentUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 p-2 text-white rounded bg-black/30"
                                                                >
                                                                    <FileIcon className="w-4 h-4" />
                                                                    <span className="text-xs underline">
                                                                        View
                                                                        Attachment
                                                                    </span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="mt-1 text-[10px] font-normal text-white/70 font-body uppercase">
                                                        {format(
                                                            new Date(
                                                                interaction?.createdAt,
                                                            ),
                                                            'MMM d, h:mm a',
                                                        )}
                                                        {interaction?.isOptimistic &&
                                                            ' (sending...)'}
                                                    </p>
                                                </div>
                                                {/* Avatar for current user (right) */}
                                                {isCurrentUser && (
                                                    <Avatar className="w-8 h-8 mt-2">
                                                        <AvatarImage
                                                            src={
                                                                interaction
                                                                    ?.createdBy
                                                                    ?.photoURL ||
                                                                '/images/placeholder-avatar.jpg'
                                                            }
                                                            alt={
                                                                interaction
                                                                    ?.createdBy
                                                                    ?.name
                                                            }
                                                        />
                                                        <AvatarFallback className="text-xs font-normal text-white uppercase bg-gray-700 font-body">
                                                            {senderInitial.toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="pt-4 mt-auto">
                            <div className="p-3 border border-gray-800 rounded-md bg-gray-950">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    placeholder="type your message here..."
                                    className="w-full min-h-[80px] bg-transparent placeholder:text-xs placeholder:font-thin border-0 focus:ring-0 text-[13px] text-white resize-none font-normal focus:outline-none font-body"
                                />

                                {/* Selected attachment preview */}
                                {attachments?.length > 0 && (
                                    <div className="p-2 mt-2 border border-gray-700 rounded">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <FileIcon
                                                    className="w-4 h-4 mr-2 text-muted-foreground"
                                                    strokeWidth={1.5}
                                                />
                                                <span className="text-xs font-light font-body truncate max-w-[150px] text-white">
                                                    {attachments[0]?.name}
                                                </span>
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    (
                                                    {Math.round(
                                                        attachments[0]?.size /
                                                            1024,
                                                    )}{' '}
                                                    KB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                className="p-1 text-gray-400 rounded hover:bg-gray-800"
                                                onClick={() =>
                                                    setAttachments([])
                                                }
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Progress bar */}
                                        {isUploading &&
                                            uploadProgress[
                                                attachments[0].name
                                            ] && (
                                                <Progress
                                                    value={
                                                        uploadProgress[
                                                            attachments[0]?.name
                                                        ]
                                                    }
                                                    className="h-1 mt-2 bg-gray-700"
                                                />
                                            )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center justify-center w-8 h-8 text-gray-400 transition rounded-full cursor-pointer hover:bg-gray-800">
                                            <Paperclip className="w-4 h-4" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (
                                                        e.target.files &&
                                                        e.target.files.length >
                                                            0
                                                    ) {
                                                        setAttachments([
                                                            e.target.files[0],
                                                        ]);
                                                    }
                                                }}
                                                disabled={
                                                    isLoading || isUploading
                                                }
                                            />
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={
                                            (!newMessage.trim() &&
                                                attachments.length === 0) ||
                                            isLoading ||
                                            isUploading
                                        }
                                        className="px-8 py-2 text-[10px] font-normal text-white transition-colors rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        {isLoading || isUploading ? (
                                            <>
                                                <span className="text-xs font-normal uppercase font-body">
                                                    Sending...
                                                </span>
                                                <svg
                                                    className="w-3 h-3 ml-1 animate-spin"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs font-normal uppercase font-body">
                                                    Send
                                                </p>
                                                <Send
                                                    className="w-4 h-4 ml-1"
                                                    strokeWidth={1.2}
                                                />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleCreateTask = () => {
        setIsTaskFormOpen(true);
    };

    const handleTaskFormSubmit = async (taskData: any) => {
        try {
            // Here you would submit the task data to your API
            const response = await axiosInstance.post('/tasks', taskData);

            if (response.data) {
                showSuccessToast('Task created successfully', toast);
                setIsTaskFormOpen(false);
            }
        } catch (error) {
            showErrorToast('Failed to create task', toast);
            console.error('Error creating task:', error);
        }
    };

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && attachments.length === 0) || isLoading)
            return;

        setIsLoading(true);

        try {
            // Create optimistic update
            const optimisticMessage = {
                uid: Date.now(), // Temporary ID
                message: newMessage,
                attachmentUrl:
                    attachments.length > 0
                        ? URL.createObjectURL(attachments[0])
                        : null,
                type: InteractionType.MESSAGE,
                createdBy: {
                    uid: Number(profileData?.uid),
                    name: profileData?.name,
                    surname: profileData?.surname,
                    photoURL: profileData?.photoURL,
                },
                createdAt: new Date().toISOString(),
                isOptimistic: true, // Flag to identify optimistic updates
            };

            // Update local state immediately for responsive UI
            setLocalInteractions((prev) => [...prev, optimisticMessage]);

            // Clear form after sending (for responsive UI)
            setNewMessage('');
            const submittedAttachments = [...attachments];
            setAttachments([]);

            // Send message with attachment if available
            if (submittedAttachments.length > 0) {
                await sendMessageWithAttachment({
                    message: newMessage,
                    file: submittedAttachments[0],
                    type: InteractionType.MESSAGE,
                    leadUid: lead.uid,
                });
            } else {
                // Send message without attachment
                await sendMessageWithAttachment({
                    message: newMessage,
                    type: InteractionType.MESSAGE,
                    leadUid: lead.uid,
                });
            }

            // Refetch interactions to show the new message with real data
            await refetchInteractions();
        } catch (error) {
            console.error('Error sending message:', error);
            showErrorToast('Failed to send message. Please try again.', toast);

            // Remove optimistic message on failure
            setLocalInteractions((prev) =>
                prev.filter((msg) => !msg.isOptimistic),
            );

            // Restore message input on failure for better UX
            setNewMessage(newMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Replace current attachments with new one (single file upload)
            setAttachments([e.target.files[0]]);
        }
    };

    const removeAttachment = () => {
        setAttachments([]);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card">
                    <DialogHeader className="flex flex-row items-start justify-between">
                        <div>
                            <DialogTitle className="text-lg font-medium font-body">
                                {lead.name}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'text-[10px] font-normal uppercase font-body px-4 py-1 border-0',
                                        getStatusBadgeColor(lead.status),
                                    )}
                                >
                                    {lead.status.replace('_', ' ')}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9"
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* Tab Navigation */}
                    <div className="flex mb-4">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                className={`px-4 py-2 cursor-pointer transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-primary text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => handleTabChange(tab.id)}
                            >
                                <span className="text-xs font-thin uppercase font-body">
                                    {tab.label}
                                </span>
                            </div>
                        ))}
                        <div className="flex-1"></div>
                    </div>

                    {/* Tab Content */}
                    {renderTabContent()}

                    {/* Status Change Section */}
                    <DialogFooter className="flex-col items-center gap-6 pt-4 mt-6 border-t sm:gap-4">
                        {lead.status !== LeadStatus.CONVERTED &&
                            activeTab !== 'chat' && (
                                <div className="flex flex-col items-center w-full gap-4">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-thin uppercase font-body">
                                            Quick Actions
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap justify-center w-full gap-3">
                                        {/* PENDING */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={`w-14 h-14 rounded-full ${getStatusButtonVariant(LeadStatus.PENDING)}`}
                                            onClick={() =>
                                                handleStatusChange(
                                                    LeadStatus.PENDING,
                                                )
                                            }
                                            title="Set as Pending"
                                        >
                                            <Clock
                                                strokeWidth={1.2}
                                                className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                                            />
                                        </Button>
                                        {/* REVIEW */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={`w-14 h-14 rounded-full ${getStatusButtonVariant(LeadStatus.REVIEW)}`}
                                            onClick={() =>
                                                handleStatusChange(
                                                    LeadStatus.REVIEW,
                                                )
                                            }
                                            title="Set to Review"
                                        >
                                            <RefreshCw
                                                strokeWidth={1.2}
                                                className="text-blue-600 w-7 h-7 dark:text-blue-400"
                                            />
                                        </Button>
                                        {/* CREATE TASK */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full w-14 h-14 text-cyan-800 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 dark:text-cyan-300 dark:hover:bg-cyan-900/20 dark:border-cyan-900/30"
                                            onClick={handleCreateTask}
                                            title="Create Task"
                                        >
                                            <CalendarCheck
                                                strokeWidth={1.2}
                                                className="text-cyan-600 w-7 h-7 dark:text-cyan-400"
                                            />
                                        </Button>
                                        {/* DECLINED */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={`w-14 h-14 rounded-full ${getStatusButtonVariant(LeadStatus.DECLINED)}`}
                                            onClick={() =>
                                                handleStatusChange(
                                                    LeadStatus.DECLINED,
                                                )
                                            }
                                            title="Set as Declined"
                                        >
                                            <XCircle
                                                strokeWidth={1.2}
                                                className="text-red-600 w-7 h-7 dark:text-red-400"
                                            />
                                        </Button>
                                        {/* CANCELLED */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={`w-14 h-14 rounded-full ${getStatusButtonVariant(LeadStatus.CANCELLED)}`}
                                            onClick={() =>
                                                handleStatusChange(
                                                    LeadStatus.CANCELLED,
                                                )
                                            }
                                            title="Set as Cancelled"
                                        >
                                            <X
                                                strokeWidth={1.2}
                                                className="text-gray-600 w-7 h-7 dark:text-gray-400"
                                            />
                                        </Button>
                                        {/* APPROVED */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={`w-14 h-14 rounded-full ${getStatusButtonVariant(LeadStatus.APPROVED)}`}
                                            onClick={() =>
                                                handleStatusChange(
                                                    LeadStatus.APPROVED,
                                                )
                                            }
                                            title="Set as Approved"
                                        >
                                            <CheckCircle2
                                                strokeWidth={1.2}
                                                className="text-green-600 w-7 h-7 dark:text-green-400"
                                            />
                                        </Button>
                                        {/* CONVERTED */}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={`w-14 h-14 rounded-full ${getStatusButtonVariant(LeadStatus.CONVERTED)}`}
                                            onClick={() =>
                                                handleStatusChange(
                                                    LeadStatus.CONVERTED,
                                                )
                                            }
                                            title="Set as Converted"
                                        >
                                            <Check
                                                strokeWidth={1.2}
                                                className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                            />
                                        </Button>
                                        {/* DELETE */}
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="rounded-full w-14 h-14 dark:bg-red-900/80 dark:text-white dark:hover:bg-red-900 dark:border-none"
                                            onClick={handleDelete}
                                            title="Delete Lead"
                                        >
                                            <Trash2
                                                className="w-7 h-7"
                                                strokeWidth={1.5}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        {lead.status === LeadStatus.CONVERTED && (
                            <div className="flex flex-col items-center w-full gap-4">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        This lead has been converted to a client
                                        and cannot be modified further.
                                    </p>
                                </div>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Lead Modal */}
            <Dialog
                open={isEditModalOpen}
                onOpenChange={() => setIsEditModalOpen(false)}
            >
                <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-thin uppercase font-body"></DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center h-64">
                        <h2 className="text-xs font-thin uppercase font-body">
                            Activating Soon
                        </h2>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Client Form Modal for Conversion */}
            <Dialog
                open={isClientFormOpen}
                onOpenChange={() => setIsClientFormOpen(false)}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-medium uppercase font-body">
                            Convert Lead to Client
                        </DialogTitle>
                    </DialogHeader>
                    <ClientForm
                        onSubmit={handleClientFormSubmit}
                        initialData={{
                            name: lead?.name,
                            email: lead?.email,
                            phone: lead?.phone,
                            contactPerson: lead?.name,
                            status: ClientStatus.ACTIVE,
                            description: lead?.notes,
                            address: {
                                street: '',
                                suburb: '',
                                city: '',
                                state: '',
                                country: 'South Africa',
                                postalCode: '',
                            },
                            ref: `CL${Math.floor(100000 + Math.random() * 900000)}`,
                        }}
                        isLoading={false}
                    />
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog for Status Change */}
            <AlertDialog
                open={confirmStatusChangeOpen}
                onOpenChange={(open) => {
                    setConfirmStatusChangeOpen(open);
                    if (!open) {
                        setStatusChangeReason('');
                        setStatusChangeDescription('');
                    }
                }}
            >
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Lead Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingStatusChange && `Change status to ${pendingStatusChange.replace('_', ' ')}`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="my-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="statusChangeReason" className="text-xs font-normal font-body">
                                Reason for Change <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="statusChangeReason"
                                value={statusChangeReason}
                                onChange={(e) => setStatusChangeReason(e.target.value)}
                                placeholder="Brief reason for this status change"
                                className="w-full text-xs font-thin font-body placeholder:text-muted-foreground"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="statusChangeDescription" className="text-xs font-normal font-body">
                                Detailed Description
                            </Label>
                            <Textarea
                                id="statusChangeDescription"
                                value={statusChangeDescription}
                                onChange={(e) => setStatusChangeDescription(e.target.value)}
                                placeholder="Additional details (optional)"
                                className="w-full min-h-[100px] text-xs font-thin font-body placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmStatusChange}
                            disabled={!statusChangeReason.trim()}
                            className={!statusChangeReason.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                            Save & Change Status
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirmation Dialog for Delete */}
            <AlertDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lead</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this lead? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Task Creation Modal */}
            <Dialog
                open={isTaskFormOpen}
                onOpenChange={(open) => {
                    if (!open) setIsTaskFormOpen(false);
                }}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-medium uppercase font-body">
                            Create Task for Lead: {lead.name}
                        </DialogTitle>
                    </DialogHeader>
                    <TaskForm
                        onSubmit={handleTaskFormSubmit}
                        initialData={{
                            title: `Follow up with lead: ${lead.name}`,
                            description: `Lead Information:
                            Name: ${lead.name}
                            Email: ${lead.email}
                            Phone: ${lead.phone}
                            ${lead.notes ? `Notes: ${lead.notes}` : ''}`,
                            taskType: TaskType.FOLLOW_UP,
                            priority: TaskPriority.MEDIUM,
                            client: lead.uid
                                ? [
                                      {
                                          uid: lead.uid,
                                          name: lead.name,
                                          email: lead.email,
                                          phone: lead.phone,
                                      },
                                  ]
                                : [],
                        }}
                        isLoading={false}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
