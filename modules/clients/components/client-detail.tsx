'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Building,
    Mail,
    Phone,
    Calendar,
    Edit,
    X,
    MapPin,
    Globe,
    FileText,
    Tag,
    AlertCircle,
    Trash,
    CheckCircle,
    Ban,
    CreditCard,
    MessageCircle,
    Cake,
    Award,
    Percent,
    TrendingUp,
    Users,
    DollarSign,
    BarChart2,
    Heart,
    Languages,
    ShoppingBag,
    AtSign,
    CreditCardIcon,
    Map,
    Facebook,
    Linkedin,
    Twitter,
    Instagram,
    AlertTriangle,
    ExternalLink,
} from 'lucide-react';
import { Client, ClientStatus } from '@/hooks/use-clients-query';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { EditClientModal } from './edit-client-modal';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { useQueryClient } from '@tanstack/react-query';
import { StatusColors } from '@/lib/types/quotation';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    ComposedChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { ClientQuotationReport } from '@/modules/reports/components/client-quotation-report';

interface ClientDetailsModalProps {
    client: Client;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus?: (clientId: number, newStatus: string) => void;
    onDelete?: (clientId: number) => void;
    onViewQuotation?: (quotationId: number) => void;
    errors?: Record<string, { message: string }>;
}

export function ClientDetail({
    client,
    isOpen,
    onClose,
    onUpdateStatus,
    onDelete,
    onViewQuotation,
    errors,
}: ClientDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<string>('reports');
    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showStatusChangeConfirmation, setShowStatusChangeConfirmation] =
        useState<boolean>(false);
    const [pendingStatusChange, setPendingStatusChange] =
        useState<ClientStatus | null>(null);
    const [activeReportTab, setActiveReportTab] = useState<string>('overview');
    const queryClient = useQueryClient();

    // Format dates
    const formatDate = (date?: Date | string | null) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM d, yyyy');
    };

    // Handle status change
    const initiateStatusChange = (status: ClientStatus) => {
        if (!onUpdateStatus) {
            showErrorToast(
                'Status update functionality is not available',
                toast,
            );
            return;
        }

        if (client.status === status) {
            showSuccessToast(
                `Client is already ${status.toUpperCase()}`,
                toast,
            );
            return;
        }

        setPendingStatusChange(status);
        setShowStatusChangeConfirmation(true);
    };

    const confirmStatusChange = () => {
        if (!pendingStatusChange || !onUpdateStatus) {
            showErrorToast(
                'Cannot update client status. Missing required information.',
                toast,
            );
            setShowStatusChangeConfirmation(false);
            setPendingStatusChange(null);
            return;
        }

        try {
            // onUpdateStatus will show appropriate toast messages based on server response
            onUpdateStatus(client.uid, pendingStatusChange);

            // Invalidate queries to refresh the UI
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            queryClient.invalidateQueries({ queryKey: ['client', client.uid] });

            // Refetch the specific client data
            queryClient.refetchQueries({
                queryKey: ['client', client.uid],
                type: 'active',
            });

            setShowStatusChangeConfirmation(false);
            setPendingStatusChange(null);

            // The toast will be shown in handleUpdateClientStatus in the clients/page.tsx
        } catch (error: any) {
            showErrorToast(
                error?.message ||
                    'Failed to update client status. Please try again.',
                toast,
            );
            console.error('Error updating client status:', error);
        }
    };

    const cancelStatusChange = () => {
        setShowStatusChangeConfirmation(false);
        setPendingStatusChange(null);
    };

    const getStatusDisplayName = (status: ClientStatus | null): string => {
        if (!status) return 'UNKNOWN';

        // Ensure we're dealing with a string that can be uppercased
        const statusString = String(status);
        return statusString.toUpperCase();
    };

    // Handle tab change
    const handleTabChange = useCallback((tabId: string) => {
        setActiveTab(tabId);
    }, []);

    // Get status badge color
    const getStatusBadgeColor = (status?: ClientStatus) => {
        if (!status)
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

        switch (status) {
            case ClientStatus.ACTIVE:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case ClientStatus.INACTIVE:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case ClientStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case ClientStatus.DELETED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    // Get category badge color
    const getCategoryBadgeColor = (category?: string) => {
        if (!category)
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

        // Map common categories to colors
        const categoryColors: Record<string, string> = {
            contract:
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            supplier:
                'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            partner:
                'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
            distributor:
                'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
        };

        return (
            categoryColors[category.toLowerCase()] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        );
    };

    // Handle delete client
    const handleDelete = useCallback(() => {
        if (onDelete) {
            try {
                onDelete(client.uid);

                // Invalidate queries after deletion
                queryClient.invalidateQueries({ queryKey: ['clients'] });

                setShowDeleteConfirmation(false);
                showSuccessToast('Client deleted successfully', toast);
                onClose();
            } catch (error) {
                showErrorToast(
                    'Failed to delete client. Please try again.',
                    toast,
                );
                console.error('Error deleting client:', error);
            }
        }
    }, [client.uid, onDelete, onClose, queryClient]);

    // Show the "Activating Soon" modal when Edit is clicked
    const handleEditClick = () => {
        setShowEditModal(true);
    };

    // Close the edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    // Add the client updated handler
    const handleClientUpdated = (updatedClient: Client) => {
        // If there's an onUpdateStatus handler, we can use it to update the UI
        if (onUpdateStatus && updatedClient?.status !== client?.status) {
            onUpdateStatus(updatedClient?.uid, updatedClient?.status as string);
        }

        // Invalidate queries to refresh the UI with updated data
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        queryClient.invalidateQueries({ queryKey: ['client', client.uid] });

        // Refetch the specific client data
        queryClient.refetchQueries({
            queryKey: ['client', client.uid],
            type: 'active',
        });

        // Close the edit modal
        setShowEditModal(false);

        // Show success toast using standardized config
        showSuccessToast('Client updated successfully', toast);
    };

    // Update the delete confirmation logic to use a separate Dialog
    const handleInitiateDelete = () => {
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = () => {
        if (!onDelete) {
            showErrorToast('Delete functionality is not available', toast);
            setShowDeleteConfirmation(false);
            return;
        }

        try {
            // onDelete will show appropriate toast messages based on server response
            onDelete(client.uid);

            // Invalidate queries after deletion
            queryClient.invalidateQueries({ queryKey: ['clients'] });

            setShowDeleteConfirmation(false);
            onClose();

            // The toast will be shown in handleDeleteClient in the clients/page.tsx
        } catch (error: any) {
            showErrorToast(
                error?.message || 'Failed to delete client. Please try again.',
                toast,
            );
            console.error('Error deleting client:', error);
        }
    };

    // Calendar action handler
    const handleCalendarAction = () => {
        showSuccessToast('Opening calendar for client...', toast);
        // Additional calendar functionality would go here
    };

    // Display branch information if available
    const renderBranchInfo = () => {
        if (!client.branch) return null;

        return (
            <span className="text-xs uppercase text-muted-foreground font-body">
                {client.branch.name || 'Branch'}
                {client.branch.uid && ` (${client.branch.uid})`}
            </span>
        );
    };

    const tabs = [
        {
            id: 'reports',
            label: 'Reports',
            icon: <BarChart2 className="w-4 h-4 mr-1" />,
        },

        {
            id: 'details',
            label: 'Details',
            icon: <FileText className="w-4 h-4 mr-1" />,
        },
        {
            id: 'organisation',
            label: 'Organisation',
            icon: <Building className="w-4 h-4 mr-1" />,
        },
        {
            id: 'quotes',
            label: 'Quotations',
            icon: <FileText className="w-4 h-4 mr-1" />,
        },
        {
            id: 'checkins',
            label: 'Check-ins',
            icon: <MapPin className="w-4 h-4 mr-1" />,
        },
        {
            id: 'tasks',
            label: 'Job History',
            icon: <CheckCircle className="w-4 h-4 mr-1" />,
        },
        {
            id: 'assignees',
            label: 'Assignees',
            icon: <Users className="w-4 h-4 mr-1" />,
        },
    ];

    const contentTabs = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        {/* Contact Information - Updated to match Communication Preferences style */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {client.email && (
                                    <div className="flex items-start">
                                        <Mail className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.email}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Email
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.phone && (
                                    <div className="flex items-start">
                                        <Phone className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.phone}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Primary Phone
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.alternativePhone && (
                                    <div className="flex items-start">
                                        <Phone className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.alternativePhone}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Alternative Phone
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.website && (
                                    <div className="flex items-start">
                                        <Globe className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.website}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Website
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.address && (
                                    <div className="flex items-start">
                                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.address.street &&
                                                    `${client.address.street}, `}
                                                {client.address.suburb &&
                                                    `${client.address.suburb}`}
                                                <br />
                                                {client.address.city &&
                                                    `${client.address.city}, `}
                                                {client.address.state &&
                                                    `${client.address.state} `}
                                                {client.address.postalCode &&
                                                    `${client.address.postalCode}`}
                                                <br />
                                                {client.address.country &&
                                                    `${client.address.country}`}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Address
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* GPS Coordinates */}
                                {client.latitude && client.longitude && (
                                    <div className="flex items-start">
                                        <Map className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs font-body">
                                                Lat: {client.latitude}, Long:{' '}
                                                {client.longitude}
                                            </p>
                                            {client.enableGeofence && (
                                                <div className="mt-1">
                                                    <Badge className="text-[9px] bg-blue-100 text-blue-800">
                                                        Geofence:{' '}
                                                        {client.geofenceRadius}m
                                                    </Badge>
                                                </div>
                                            )}
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                GPS Coordinates
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Social Profiles */}
                                {client.socialProfiles &&
                                    typeof client.socialProfiles === 'object' &&
                                    client.socialProfiles !== null &&
                                    Object.keys(client.socialProfiles).length >
                                        0 && (
                                        <div className="flex items-start">
                                            <AtSign className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                                            <div>
                                                <div className="flex gap-2">
                                                    {client.socialProfiles
                                                        .linkedin && (
                                                        <a
                                                            href={
                                                                client
                                                                    .socialProfiles
                                                                    .linkedin
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600"
                                                        >
                                                            <Linkedin className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {client.socialProfiles
                                                        .twitter && (
                                                        <a
                                                            href={
                                                                client
                                                                    .socialProfiles
                                                                    .twitter
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400"
                                                        >
                                                            <Twitter className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {client.socialProfiles
                                                        .facebook && (
                                                        <a
                                                            href={
                                                                client
                                                                    .socialProfiles
                                                                    .facebook
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-800"
                                                        >
                                                            <Facebook className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {client.socialProfiles
                                                        .instagram && (
                                                        <a
                                                            href={
                                                                client
                                                                    .socialProfiles
                                                                    .instagram
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-pink-600"
                                                        >
                                                            <Instagram className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-muted-foreground font-body">
                                                    Social Profiles
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Communication Preferences */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Communication Preferences
                            </h3>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {client.preferredContactMethod && (
                                    <div className="flex items-center">
                                        <MessageCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.preferredContactMethod}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Preferred Contact Method
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.preferredLanguage && (
                                    <div className="flex items-center">
                                        <Languages className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.preferredLanguage}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Preferred Language
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.lastVisitDate && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {formatDate(
                                                    client.lastVisitDate,
                                                )}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Last Visit Date
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.nextContactDate && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {formatDate(
                                                    client.nextContactDate,
                                                )}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Next Contact Date
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.birthday && (
                                    <div className="flex items-center">
                                        <Cake className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {formatDate(client.birthday)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Birthday
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.anniversaryDate && (
                                    <div className="flex items-center">
                                        <Award className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {formatDate(
                                                    client.anniversaryDate,
                                                )}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Anniversary Date
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.createdAt && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {formatDate(client.createdAt)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Created At
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.updatedAt && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {formatDate(client.updatedAt)}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Updated At
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Financial Information
                            </h3>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {client.creditLimit !== undefined && (
                                    <div className="flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                R
                                                {typeof client.creditLimit ===
                                                'number'
                                                    ? client.creditLimit.toLocaleString()
                                                    : parseFloat(
                                                          String(
                                                              client.creditLimit,
                                                          ) || '0',
                                                      ).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Credit Limit
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.outstandingBalance !== undefined && (
                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                R
                                                {typeof client.outstandingBalance ===
                                                'number'
                                                    ? client.outstandingBalance.toLocaleString()
                                                    : parseFloat(
                                                          String(
                                                              client.outstandingBalance,
                                                          ) || '0',
                                                      ).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Outstanding Balance
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.lifetimeValue !== undefined && (
                                    <div className="flex items-center">
                                        <TrendingUp className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                R
                                                {typeof client.lifetimeValue ===
                                                'number'
                                                    ? client.lifetimeValue.toLocaleString()
                                                    : parseFloat(
                                                          String(
                                                              client.lifetimeValue,
                                                          ) || '0',
                                                      ).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Lifetime Value
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.discountPercentage !== undefined && (
                                    <div className="flex items-center">
                                        <Percent className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {typeof client.discountPercentage ===
                                                'number'
                                                    ? client.discountPercentage
                                                    : parseFloat(
                                                          String(
                                                              client.discountPercentage,
                                                          ) || '0',
                                                      )}
                                                %
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Discount Percentage
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.preferredPaymentMethod && (
                                    <div className="flex items-center">
                                        <CreditCardIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.preferredPaymentMethod.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Preferred Payment Method
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.paymentTerms && (
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.paymentTerms}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Payment Terms
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.annualRevenue !== undefined &&
                                    client.annualRevenue !== null && (
                                        <div className="flex items-center">
                                            <BarChart2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-body">
                                                    R
                                                    {typeof client.annualRevenue ===
                                                    'number'
                                                        ? client.annualRevenue.toLocaleString()
                                                        : parseFloat(
                                                              String(
                                                                  client.annualRevenue,
                                                              ) || '0',
                                                          ).toLocaleString()}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-body">
                                                    Annual Revenue
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Customer Insights */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Customer Insights
                            </h3>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {client.satisfactionScore !== undefined && (
                                    <div className="flex items-center">
                                        <Heart className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.satisfactionScore} / 10
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Satisfaction Score
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.npsScore !== undefined && (
                                    <div className="flex items-center">
                                        <BarChart2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.npsScore}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Net Promoter Score
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client.acquisitionChannel && (
                                    <div className="flex items-center">
                                        <ShoppingBag className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {client.acquisitionChannel.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Acquisition Channel
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client?.acquisitionDate && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs font-body">
                                                {formatDate(
                                                    client?.acquisitionDate,
                                                )}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body">
                                                Acquisition Date
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {client?.geofenceType &&
                                    client?.geofenceType !== 'none' && (
                                        <div className="flex items-center">
                                            <Map className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs font-body">
                                                    {client?.geofenceType?.toUpperCase()}
                                                    {client?.enableGeofence && (
                                                        <span className="ml-1">
                                                            (Radius:{' '}
                                                            {
                                                                client.geofenceRadius
                                                            }
                                                            m)
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-body">
                                                    Geofence Type
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Additional Notes */}
                        {client.description && (
                            <div className="p-4 rounded-lg bg-card/50">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Notes & Description
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-start">
                                        <FileText className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-xs whitespace-pre-line font-body">
                                                {client.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'quotes':
                return (
                    <div className="space-y-6">
                        {client.quotations && client.quotations.length > 0 ? (
                            <>
                                <div className="p-4 rounded-lg bg-card/50">
                                    <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                        Client Quotations
                                    </h3>
                                    <div className="space-y-4">
                                        {client?.quotations.map(
                                            (quotation: any, index: number) => (
                                                <div
                                                    key={
                                                        quotation?.uid || index
                                                    }
                                                    className="p-3 border rounded-md border-border/80"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-medium font-body">
                                                            {quotation.quotationNumber ||
                                                                `#${quotation.uid || index + 1}`}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[10px] px-4 py-1 font-body border-0 ${
                                                                quotation.status ===
                                                                'approved'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                    : quotation.status ===
                                                                        'pending'
                                                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                                      : quotation.status ===
                                                                          'rejected'
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                            }`}
                                                        >
                                                            {quotation.status
                                                                ? quotation.status.toUpperCase()
                                                                : 'DRAFT'}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1 mb-2">
                                                        <div className="flex items-center">
                                                            <Calendar
                                                                className="w-3 h-3 mr-1 text-muted-foreground"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-body">
                                                                    Created:{' '}
                                                                    {formatDate(
                                                                        quotation.quotationDate ||
                                                                            quotation.createdAt,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar
                                                                className="w-3 h-3 mr-1 text-muted-foreground"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-body">
                                                                    Valid Until:{' '}
                                                                    {formatDate(
                                                                        quotation.validUntil ||
                                                                            quotation.expiryDate,
                                                                    ) ||
                                                                        'Not set'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1 mb-2">
                                                        <div className="flex items-center">
                                                            <Tag
                                                                className="w-3 h-3 mr-1 text-muted-foreground"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-body">
                                                                    Items:{' '}
                                                                    {quotation.totalItems ||
                                                                        quotation
                                                                            .quotationItems
                                                                            ?.length ||
                                                                        '0'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <ShoppingBag
                                                                className="w-3 h-3 mr-1 text-muted-foreground"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-body">
                                                                    {quotation.isConverted
                                                                        ? 'Converted'
                                                                        : 'Not converted'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {quotation.placedBy && (
                                                        <div className="flex items-center mb-2">
                                                            <Users
                                                                className="w-3 h-3 mr-1 text-muted-foreground"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] uppercase text-muted-foreground font-body">
                                                                    Created by:{' '}
                                                                    {
                                                                        quotation
                                                                            .placedBy
                                                                            .name
                                                                    }{' '}
                                                                    {quotation
                                                                        .placedBy
                                                                        .surname ||
                                                                        ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="text-sm font-medium font-body">
                                                            R{' '}
                                                            {typeof quotation.totalAmount ===
                                                            'number'
                                                                ? quotation.totalAmount.toLocaleString()
                                                                : typeof quotation.totalAmount ===
                                                                    'string'
                                                                  ? parseFloat(
                                                                        quotation.totalAmount,
                                                                    ).toLocaleString()
                                                                  : typeof quotation.total ===
                                                                      'number'
                                                                    ? quotation.total.toLocaleString()
                                                                    : '-'}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-[10px] uppercase font-body font-thin px-10"
                                                            onClick={() => {
                                                                onViewQuotation?.(
                                                                    quotation.uid,
                                                                );
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 gap-1">
                                <div className="p-4 text-center rounded-full bg-muted/20">
                                    <FileText
                                        className="w-8 h-8 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="mb-1 text-xs font-normal uppercase font-body">
                                        No Quotations
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-body">
                                        This client has no quotations yet.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'checkins':
                return (
                    <div className="space-y-6">
                        {client.checkIns && client.checkIns.length > 0 ? (
                            <>
                                <div className="p-4 rounded-lg bg-card/50">
                                    <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                        Client Check-ins
                                    </h3>
                                    <div className="space-y-4">
                                        {client.checkIns.map(
                                            (checkIn: any, index: number) => (
                                                <div
                                                    key={checkIn?.uid || index}
                                                    className="p-3 border rounded-md border-border/30"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-sm font-medium font-body">
                                                            Check-in #
                                                            {checkIn.uid ||
                                                                index + 1}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] px-2 py-0.5 font-body border-0 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                        >
                                                            {checkIn.type
                                                                ? checkIn.type.toUpperCase()
                                                                : 'VISIT'}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 mb-2 md:grid-cols-2">
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            <span>
                                                                {checkIn.checkInTime &&
                                                                    formatDate(
                                                                        checkIn.checkInTime,
                                                                    )}
                                                                {checkIn.checkInTime &&
                                                                    ' '}
                                                                {checkIn.checkInTime &&
                                                                    new Date(
                                                                        checkIn.checkInTime,
                                                                    ).toLocaleTimeString(
                                                                        [],
                                                                        {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        },
                                                                    )}
                                                            </span>
                                                        </div>
                                                        {checkIn.owner && (
                                                            <div className="flex items-center text-xs text-muted-foreground">
                                                                <Users className="w-3 h-3 mr-1" />
                                                                <span>
                                                                    By:{' '}
                                                                    {checkIn
                                                                        .owner
                                                                        .name ||
                                                                        checkIn
                                                                            .owner
                                                                            .email ||
                                                                        'Staff Member'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {checkIn.notes && (
                                                        <div className="p-2 mt-2 text-xs rounded bg-card/50">
                                                            <p className="text-xs whitespace-pre-wrap text-muted-foreground font-body">
                                                                {checkIn.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {checkIn.location && (
                                                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                                            <MapPin className="w-3 h-3 mr-1" />
                                                            <span className="truncate">
                                                                {
                                                                    checkIn.location
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 gap-1">
                                <div className="p-4 text-center rounded-full bg-muted/20">
                                    <MapPin
                                        className="w-8 h-8 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="mb-1 text-xs font-normal uppercase font-body">
                                        No Check-ins
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-body">
                                        This client has no check-ins recorded
                                        yet.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'organisation':
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Organisation Details
                            </h3>
                            {client.organisation ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-16 h-16 border-2 border-primary">
                                            <AvatarImage
                                                src={client.organisation.logo}
                                                alt={client.organisation.name}
                                                className="object-contain p-1"
                                            />
                                            <AvatarFallback className="text-xl font-body">
                                                {client.organisation.name
                                                    ?.slice(0, 2)
                                                    .toUpperCase() || 'ORG'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1">
                                            <h2 className="text-lg font-bold font-body">
                                                {client.organisation.name}
                                            </h2>
                                            <p className="text-xs text-muted-foreground font-body">
                                                ID: {client.organisation.uid}
                                            </p>

                                            {client.organisation
                                                .description && (
                                                <p className="mt-2 text-sm font-body">
                                                    {
                                                        client.organisation
                                                            .description
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {client.organisation.email && (
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-body">
                                                        {
                                                            client.organisation
                                                                .email
                                                        }
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-body">
                                                        Email
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {client.organisation.phone && (
                                            <div className="flex items-center">
                                                <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-body">
                                                        {
                                                            client.organisation
                                                                .phone
                                                        }
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-body">
                                                        Phone
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {client.organisation.website && (
                                            <div className="flex items-center">
                                                <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-body">
                                                        {
                                                            client.organisation
                                                                .website
                                                        }
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-body">
                                                        Website
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {client.branch && (
                                            <div className="flex items-center">
                                                <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-body">
                                                        {client.branch.name}
                                                        {client.branch.uid && (
                                                            <span className="ml-1 text-[10px] text-muted-foreground">
                                                                (Ref:{' '}
                                                                {
                                                                    client
                                                                        .branch
                                                                        .uid
                                                                }
                                                                )
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-body">
                                                        Branch
                                                        {client.branch
                                                            .contactPerson &&
                                                            ` • Contact: ${client.branch?.contactPerson}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {client.branch &&
                                            client.branch.address && (
                                                <div className="flex items-start">
                                                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-body">
                                                            {client.branch
                                                                .address.street
                                                                ? `${client.branch.address.street}, `
                                                                : ''}
                                                            {client.branch
                                                                .address.suburb
                                                                ? `${client.branch.address.suburb}, `
                                                                : ''}
                                                            {client.branch
                                                                .address.city
                                                                ? `${client.branch.address.city}, `
                                                                : ''}
                                                            {client.branch
                                                                .address
                                                                .postalCode ||
                                                                ''}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground font-body">
                                                            Branch Address
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                        {client.branch &&
                                            client.branch.email && (
                                                <div className="flex items-center">
                                                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs font-body">
                                                            {
                                                                client.branch
                                                                    .email
                                                            }
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground font-body">
                                                            Branch Email
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                        {client.branch &&
                                            client.branch.phone && (
                                                <div className="flex items-center">
                                                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs font-body">
                                                            {
                                                                client.branch
                                                                    .phone
                                                            }
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground font-body">
                                                            Branch Phone
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                        {client.assignedSalesRep ? (
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-body">
                                                        {client.assignedSalesRep
                                                            .name ||
                                                            client
                                                                .assignedSalesRep
                                                                .email ||
                                                            `ID: ${client.assignedSalesRep.uid}`}
                                                        {client.assignedSalesRep
                                                            .surname &&
                                                            ` ${client.assignedSalesRep.surname}`}
                                                    </p>
                                                    {client.assignedSalesRep
                                                        .role && (
                                                        <div className="mt-1">
                                                            <Badge className="text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                                {client.assignedSalesRep.role.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-muted-foreground font-body">
                                                        Assigned Sales Rep
                                                        {client.assignedSalesRep
                                                            .phone &&
                                                            ` • ${client.assignedSalesRep.phone}`}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <div>
                                                    <p className="text-xs font-body text-muted-foreground">
                                                        No sales rep assigned
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-body">
                                                        Assigned Sales Rep
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 gap-1">
                                    <div className="p-4 text-center rounded-full bg-muted/20">
                                        <Building
                                            className="w-8 h-8 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="mb-1 text-xs font-normal uppercase font-body">
                                            No Organisation Details
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-body">
                                            This client is not associated with
                                            any organisation.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'reports':
                const renderReportContent = () => {
                    switch (activeReportTab) {
                        case 'overview':
                            return (
                                <>
                                    {/* Add View Full Report button */}
                                    <div className="flex justify-end mb-4">
                                        <Link href={`/dashboard/clients/${client.uid}/reports`}>
                                            <Button variant="outline" className="gap-2">
                                                <ExternalLink className="w-4 h-4" />
                                                View Full Report
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Charts Section */}
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="p-6 border rounded border-border/80 bg-card">
                                            <h3 className="text-sm font-normal uppercase font-body">
                                                Quotation Values
                                            </h3>
                                            <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                                Comparison of quotation amounts
                                            </p>
                                            {client.quotations &&
                                            client.quotations.length > 0 ? (
                                                <div className="h-64">
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                    >
                                                        <BarChart
                                                            data={client.quotations.map(
                                                                (quote) => ({
                                                                    name:
                                                                        quote.quotationNumber?.substring(
                                                                            quote
                                                                                .quotationNumber
                                                                                .length -
                                                                                8,
                                                                        ) ||
                                                                        `#${quote.uid}`,
                                                                    value: Number(
                                                                        quote.totalAmount ||
                                                                            0,
                                                                    ),
                                                                    fullNumber:
                                                                        quote.quotationNumber,
                                                                    date:
                                                                        quote.quotationDate ||
                                                                        quote.createdAt,
                                                                    status: quote.status,
                                                                    itemCount:
                                                                        quote
                                                                            .quotationItems
                                                                            ?.length ||
                                                                        0,
                                                                }),
                                                            )}
                                                            margin={{
                                                                top: 10,
                                                                right: 30,
                                                                left: 0,
                                                                bottom: 20,
                                                            }}
                                                            barSize={25}
                                                        >
                                                            <CartesianGrid
                                                                strokeDasharray="3 3"
                                                                vertical={false}
                                                                opacity={0.1}
                                                            />
                                                            <XAxis
                                                                dataKey="name"
                                                                axisLine={{
                                                                    stroke: '#e5e7eb',
                                                                    strokeWidth: 0.5,
                                                                }}
                                                                tickLine={false}
                                                                tick={(
                                                                    props,
                                                                ) => {
                                                                    const {
                                                                        x,
                                                                        y,
                                                                        payload,
                                                                    } = props;
                                                                    return (
                                                                        <g
                                                                            transform={`translate(${x},${y})`}
                                                                        >
                                                                            <text
                                                                                dy={
                                                                                    16
                                                                                }
                                                                                textAnchor="middle"
                                                                                fill="#888"
                                                                                className="text-[8px] font-body uppercase"
                                                                            >
                                                                                {
                                                                                    payload.value
                                                                                }
                                                                            </text>
                                                                        </g>
                                                                    );
                                                                }}
                                                                label={{
                                                                    value: 'QUOTATIONS',
                                                                    position:
                                                                        'insideBottom',
                                                                    offset: -10,
                                                                    className:
                                                                        'text-[10px] font-unbounded uppercase font-body',
                                                                }}
                                                            />
                                                            <YAxis
                                                                tick={(
                                                                    props,
                                                                ) => {
                                                                    const {
                                                                        x,
                                                                        y,
                                                                        payload,
                                                                    } = props;
                                                                    return (
                                                                        <g
                                                                            transform={`translate(${x},${y})`}
                                                                        >
                                                                            <text
                                                                                x={
                                                                                    -5
                                                                                }
                                                                                textAnchor="end"
                                                                                fill="#888"
                                                                                className="text-[8px] font-body uppercase"
                                                                            >
                                                                                {
                                                                                    payload.value
                                                                                }
                                                                            </text>
                                                                        </g>
                                                                    );
                                                                }}
                                                                label={{
                                                                    value: 'AMOUNT (R)',
                                                                    angle: -90,
                                                                    position:
                                                                        'insideLeft',
                                                                    style: {
                                                                        textAnchor:
                                                                            'middle',
                                                                        fontSize:
                                                                            '10px',
                                                                        fontFamily:
                                                                            'var(--font-unbounded)',
                                                                        textTransform:
                                                                            'uppercase',
                                                                    },
                                                                }}
                                                                axisLine={{
                                                                    stroke: '#e5e7eb',
                                                                    strokeWidth: 0.5,
                                                                }}
                                                                tickLine={false}
                                                            />
                                                            <Tooltip
                                                                cursor={false}
                                                                content={({
                                                                    active,
                                                                    payload,
                                                                }) => {
                                                                    if (
                                                                        active &&
                                                                        payload &&
                                                                        payload.length
                                                                    ) {
                                                                        const data =
                                                                            payload[0]
                                                                                .payload;
                                                                        return (
                                                                            <div className="p-3 bg-white border rounded shadow-md">
                                                                                <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                    <FileText className="inline-block w-3 h-3" />
                                                                                    <p className="text-xs uppercase font-unbounded font-body">
                                                                                        {data.fullNumber ||
                                                                                            `Quotation #${data.name}`}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                    <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                        Amount
                                                                                        (R):
                                                                                    </p>
                                                                                    <p className="text-xs uppercase font-unbounded font-body">
                                                                                        {data.value.toFixed(
                                                                                            2,
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                    <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                        Items:
                                                                                    </p>
                                                                                    <p className="text-xs uppercase font-unbounded font-body">
                                                                                        {
                                                                                            data.itemCount
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                                <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                    <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                        Date:
                                                                                    </p>
                                                                                    <p className="text-xs uppercase font-unbounded font-body">
                                                                                        {data.date
                                                                                            ? new Date(
                                                                                                  data.date,
                                                                                              ).toLocaleDateString()
                                                                                            : 'Unknown date'}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                    <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                        Status:
                                                                                    </p>
                                                                                    <p className="text-xs uppercase font-unbounded font-body">
                                                                                        {(
                                                                                            data.status ||
                                                                                            'pending'
                                                                                        ).toUpperCase()}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }}
                                                            />
                                                            <Legend
                                                                verticalAlign="top"
                                                                height={36}
                                                                formatter={(value) => (
                                                                    <span className="text-[8px] uppercase font-body">
                                                                        Quotation Amount
                                                                    </span>
                                                                )}
                                                                style={{
                                                                    fontSize: '10px',
                                                                    fontFamily: 'var(--font-body)',
                                                                    textTransform: 'uppercase'
                                                                }}
                                                            />
                                                            <Bar
                                                                dataKey="value"
                                                                name="Amount"
                                                                fill="#3b82f6"
                                                                radius={[
                                                                    4, 4, 4, 4,
                                                                ]}
                                                            />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                                    <p className="text-xs">
                                                        No quotation data
                                                        available
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 border rounded border-border/80 bg-card">
                                            <h3 className="text-sm font-normal uppercase font-body">
                                                Items Distribution
                                            </h3>
                                            <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                                Number of items per quotation
                                            </p>
                                            {client.quotations &&
                                            client.quotations.length > 0 ? (
                                                <div className="h-64">
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                    >
                                                        <PieChart>
                                                            <Pie
                                                                data={Object.entries(
                                                                    client.quotations.reduce((acc, quote) => {
                                                                        const status = quote.status || 'pending';
                                                                        acc[status] = (acc[status] || 0) + 1;
                                                                        return acc;
                                                                    }, {} as Record<string, number>)
                                                                ).map(([status, count]) => ({
                                                                    name: status.replace(/_/g, ' ').toLowerCase(),
                                                                    value: count,
                                                                    status: status,
                                                                }))}
                                                                cx="50%"
                                                                cy="50%"
                                                                outerRadius={80}
                                                                innerRadius={50}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                                paddingAngle={1}
                                                                cornerRadius={4}
                                                            >
                                                                {Object.entries(StatusColors).map(
                                                                    ([status, colors]) => (
                                                                        <Cell
                                                                            key={`cell-${status}`}
                                                                            fill={colors.text.includes('green') ? '#22c55e' :
                                                                                  colors.text.includes('red') ? '#ef4444' :
                                                                                  colors.text.includes('yellow') ? '#eab308' :
                                                                                  colors.text.includes('blue') ? '#3b82f6' :
                                                                                  colors.text.includes('purple') ? '#a855f7' :
                                                                                  colors.text.includes('orange') ? '#f97316' :
                                                                                  colors.text.includes('teal') ? '#14b8a6' :
                                                                                  '#6b7280'}
                                                                        />
                                                                    ),
                                                                )}
                                                            </Pie>
                                                            <Tooltip
                                                                content={({active, payload}) => {
                                                                    if (active && payload && payload.length) {
                                                                        const data = payload[0].payload;
                                                                        return (
                                                                            <div className="p-2 bg-white border rounded-lg shadow-sm">
                                                                                <div className="mb-1">
                                                                                    <p className="text-[10px] uppercase font-unbounded">
                                                                                        {data.name}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="mb-1">
                                                                                    <p className="text-[10px] uppercase font-body">
                                                                                        Count: {data.value}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }}
                                                            />
                                                            <Legend
                                                                verticalAlign="bottom"
                                                                height={36}
                                                                formatter={(value) => (
                                                                    <span className="text-[8px] uppercase font-body">
                                                                        {value}
                                                                    </span>
                                                                )}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                                    <p className="text-xs">
                                                        No quotation data available
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            );
                        case 'quotations':
                            return (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="p-6 border rounded border-border/80 bg-card">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Quotation Timeline
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Quotation values over time
                                        </p>

                                        {client.quotations &&
                                        client.quotations.length > 0 ? (
                                            <div className="h-64">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <LineChart
                                                        data={client.quotations.map(
                                                            (quote) => ({
                                                                name: quote.quotationDate
                                                                    ? new Date(
                                                                          quote.quotationDate,
                                                                      ).toLocaleDateString()
                                                                    : quote.createdAt
                                                                      ? new Date(
                                                                            quote.createdAt,
                                                                        ).toLocaleDateString()
                                                                      : 'Unknown',
                                                                value: Number(
                                                                    quote.totalAmount ||
                                                                        0,
                                                                ),
                                                                fullNumber: quote.quotationNumber,
                                                                status: quote.status,
                                                                itemCount: quote.quotationItems?.length || 0,
                                                            }),
                                                        )}
                                                        margin={{
                                                            top: 10,
                                                            right: 30,
                                                            left: 0,
                                                            bottom: 20,
                                                        }}
                                                    >
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            vertical={false}
                                                            opacity={0.1}
                                                        />
                                                        <XAxis
                                                            dataKey="name"
                                                            axisLine={{
                                                                stroke: '#e5e7eb',
                                                                strokeWidth: 0.5,
                                                            }}
                                                            tickLine={false}
                                                            tick={(props) => {
                                                                const {
                                                                    x,
                                                                    y,
                                                                    payload,
                                                                } = props;
                                                                return (
                                                                    <g
                                                                        transform={`translate(${x},${y})`}
                                                                    >
                                                                        <text
                                                                            dy={16}
                                                                            textAnchor="middle"
                                                                            fill="#888"
                                                                            className="text-[8px] font-body uppercase"
                                                                        >
                                                                            {payload.value}
                                                                        </text>
                                                                    </g>
                                                                );
                                                            }}
                                                            label={{
                                                                value: 'DATE',
                                                                position: 'insideBottom',
                                                                offset: -10,
                                                                className: 'text-[10px] font-unbounded uppercase font-body',
                                                            }}
                                                        />
                                                        <YAxis
                                                            axisLine={{
                                                                stroke: '#e5e7eb',
                                                                strokeWidth: 0.5,
                                                            }}
                                                            tickLine={false}
                                                            tick={(props) => {
                                                                const {
                                                                    x,
                                                                    y,
                                                                    payload,
                                                                } = props;
                                                                return (
                                                                    <g
                                                                        transform={`translate(${x},${y})`}
                                                                    >
                                                                        <text
                                                                            x={-5}
                                                                            textAnchor="end"
                                                                            fill="#888"
                                                                            className="text-[8px] font-body uppercase"
                                                                        >
                                                                            {payload.value}
                                                                        </text>
                                                                    </g>
                                                                );
                                                            }}
                                                            label={{
                                                                value: 'AMOUNT (R)',
                                                                angle: -90,
                                                                position: 'insideLeft',
                                                                style: {
                                                                    textAnchor: 'middle',
                                                                    fontSize: '10px',
                                                                    fontFamily: 'var(--font-unbounded)',
                                                                    textTransform: 'uppercase',
                                                                },
                                                            }}
                                                        />
                                                        <Tooltip
                                                            cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                                                            content={({active, payload}) => {
                                                                if (active && payload && payload.length) {
                                                                    const data = payload[0].payload;
                                                                    return (
                                                                        <div className="p-3 bg-white border rounded shadow-md">
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <FileText className="inline-block w-3 h-3" />
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {data.fullNumber || `Quotation on ${data.name}`}
                                                                                </p>
                                                                            </div>
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                    Amount (R):
                                                                                </p>
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {data.value.toFixed(2)}
                                                                                </p>
                                                                            </div>
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                    Date:
                                                                                </p>
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {data.name}
                                                                                </p>
                                                                            </div>
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                    Status:
                                                                                </p>
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {(data.status || 'pending').toUpperCase()}
                                                                                </p>
                                                                            </div>
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                    Items:
                                                                                </p>
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {data.itemCount}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                        <Legend
                                                            verticalAlign="top"
                                                            height={36}
                                                            formatter={(value) => (
                                                                <span className="text-[8px] uppercase font-body">
                                                                    Quotation Value
                                                                </span>
                                                            )}
                                                            style={{
                                                                fontSize: '10px',
                                                                fontFamily: 'var(--font-body)',
                                                                textTransform: 'uppercase'
                                                            }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="#3b82f6"
                                                            strokeWidth={2}
                                                            dot={{ r: 4, fill: "#3b82f6", stroke: "#3b82f6", strokeWidth: 1 }}
                                                            activeDot={{ r: 6, fill: "#60a5fa", stroke: "#3b82f6", strokeWidth: 1 }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-64 text-muted-foreground">
                                                <p className="text-xs">
                                                    No timeline data available
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 border rounded border-border/80 bg-card">
                                        <h3 className="text-sm font-normal uppercase font-body">
                                            Quotation Comparison
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Items vs Amount for each quotation
                                        </p>

                                        {client.quotations &&
                                        client.quotations.length > 0 ? (
                                            <div className="h-64">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <ComposedChart
                                                        data={client.quotations.map(
                                                            (quote) => ({
                                                                name:
                                                                    quote.quotationNumber?.substring(
                                                                        quote
                                                                            .quotationNumber
                                                                            .length -
                                                                            8,
                                                                    ) ||
                                                                    `#${quote.uid}`,
                                                                amount: Number(
                                                                    quote.totalAmount ||
                                                                        0,
                                                                ),
                                                                items:
                                                                    quote.totalItems ||
                                                                    0,
                                                                fullNumber:
                                                                    quote.quotationNumber,
                                                                date:
                                                                    quote.quotationDate ||
                                                                    quote.createdAt,
                                                                status: quote.status,
                                                            }),
                                                        )}
                                                        margin={{
                                                            top: 10,
                                                            right: 30,
                                                            left: 0,
                                                            bottom: 20,
                                                        }}
                                                        barSize={25}
                                                    >
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            vertical={false}
                                                            opacity={0.1}
                                                        />
                                                        <XAxis
                                                            dataKey="name"
                                                            axisLine={{
                                                                stroke: '#e5e7eb',
                                                                strokeWidth: 0.5,
                                                            }}
                                                            tickLine={false}
                                                            tick={(props) => {
                                                                const {
                                                                    x,
                                                                    y,
                                                                    payload,
                                                                } = props;
                                                                return (
                                                                    <g
                                                                        transform={`translate(${x},${y})`}
                                                                    >
                                                                        <text
                                                                            dy={
                                                                                16
                                                                            }
                                                                            textAnchor="middle"
                                                                            fill="#888"
                                                                            className="text-[8px] font-body uppercase"
                                                                        >
                                                                            {
                                                                                payload.value
                                                                            }
                                                                        </text>
                                                                    </g>
                                                                );
                                                            }}
                                                            label={{
                                                                value: 'QUOTATIONS',
                                                                position:
                                                                    'insideBottom',
                                                                offset: -10,
                                                                className:
                                                                    'text-[10px] font-unbounded uppercase font-body',
                                                            }}
                                                        />
                                                        <YAxis
                                                            yAxisId="left"
                                                            axisLine={{
                                                                stroke: '#e5e7eb',
                                                                strokeWidth: 0.5,
                                                            }}
                                                            tickLine={false}
                                                            tick={(props) => {
                                                                const {
                                                                    x,
                                                                    y,
                                                                    payload,
                                                                } = props;
                                                                return (
                                                                    <g
                                                                        transform={`translate(${x},${y})`}
                                                                    >
                                                                        <text
                                                                            x={
                                                                                -5
                                                                            }
                                                                            textAnchor="end"
                                                                            fill="#888"
                                                                            className="text-[8px] font-body uppercase"
                                                                        >
                                                                            {
                                                                                payload.value
                                                                            }
                                                                        </text>
                                                                    </g>
                                                                );
                                                            }}
                                                            label={{
                                                                value: 'AMOUNT (R)',
                                                                angle: -90,
                                                                position:
                                                                    'insideLeft',
                                                                style: {
                                                                    textAnchor:
                                                                        'middle',
                                                                    fontSize:
                                                                        '10px',
                                                                    fontFamily:
                                                                        'var(--font-unbounded)',
                                                                    textTransform:
                                                                        'uppercase',
                                                                },
                                                            }}
                                                        />
                                                        <YAxis
                                                            yAxisId="right"
                                                            orientation="right"
                                                            axisLine={{
                                                                stroke: '#e5e7eb',
                                                                strokeWidth: 0.5,
                                                            }}
                                                            tickLine={false}
                                                            tick={(props) => {
                                                                const {
                                                                    x,
                                                                    y,
                                                                    payload,
                                                                } = props;
                                                                return (
                                                                    <g
                                                                        transform={`translate(${x},${y})`}
                                                                    >
                                                                        <text
                                                                            x={
                                                                                5
                                                                            }
                                                                            textAnchor="start"
                                                                            fill="#888"
                                                                            className="text-[8px] font-body uppercase"
                                                                        >
                                                                            {
                                                                                payload.value
                                                                            }
                                                                        </text>
                                                                    </g>
                                                                );
                                                            }}
                                                            label={{
                                                                value: 'ITEMS',
                                                                angle: 90,
                                                                position:
                                                                    'insideRight',
                                                                style: {
                                                                    textAnchor:
                                                                        'middle',
                                                                    fontSize:
                                                                        '10px',
                                                                    fontFamily:
                                                                        'var(--font-unbounded)',
                                                                    textTransform:
                                                                        'uppercase',
                                                                },
                                                            }}
                                                        />
                                                        <Tooltip
                                                            cursor={false}
                                                            content={({
                                                                active,
                                                                payload,
                                                            }) => {
                                                                if (
                                                                    active &&
                                                                    payload &&
                                                                    payload.length
                                                                ) {
                                                                    const data =
                                                                        payload[0]
                                                                            .payload;
                                                                    return (
                                                                        <div className="p-3 bg-white border rounded shadow-md">
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <FileText className="inline-block w-3 h-3" />
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {data.fullNumber ||
                                                                                        `Quotation #${data.name}`}
                                                                                </p>
                                                                            </div>
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                    Amount
                                                                                    (R)
                                                                                    :
                                                                                </p>
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {
                                                                                        data.amount
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                    Items
                                                                                    :{' '}
                                                                                </p>
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {
                                                                                        data.items
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                    Date
                                                                                    created
                                                                                    :{' '}
                                                                                </p>
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {data.date
                                                                                        ? new Date(
                                                                                              data.date,
                                                                                          ).toLocaleDateString()
                                                                                        : 'Unknown date'}
                                                                                </p>
                                                                            </div>
                                                                            <div className="mb-1 font-unbounded text-[10px] text-gray-800 uppercase flex items-center justify-start gap-1">
                                                                                <p className="text-[10px] uppercase font-unbounded font-body font-thin">
                                                                                    Status
                                                                                    :{' '}
                                                                                </p>
                                                                                <p className="text-xs uppercase font-unbounded font-body">
                                                                                    {(
                                                                                        data.status ||
                                                                                        'pending'
                                                                                    ).toUpperCase()}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            }}
                                                        />
                                                        <Legend
                                                            verticalAlign="top"
                                                            height={36}
                                                            formatter={(
                                                                value,
                                                            ) => (
                                                                <span className="text-[8px] uppercase font-body">
                                                                    {value ===
                                                                    'amount'
                                                                        ? 'Amount'
                                                                        : 'Items'}
                                                                </span>
                                                            )}
                                                            style={{
                                                                fontSize:
                                                                    '10px',
                                                                fontFamily:
                                                                    'var(--font-body)',
                                                                textTransform:
                                                                    'uppercase',
                                                            }}
                                                        />
                                                        <Bar
                                                            yAxisId="left"
                                                            dataKey="amount"
                                                            name="amount"
                                                            fill="#3b82f6"
                                                            radius={[
                                                                4, 4, 4, 4,
                                                            ]}
                                                        />
                                                        <Bar
                                                            yAxisId="right"
                                                            dataKey="items"
                                                            name="items"
                                                            fill="#93c5fd"
                                                            radius={[
                                                                4, 4, 4, 4,
                                                            ]}
                                                        />
                                                    </ComposedChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-64 text-muted-foreground">
                                                <p className="text-xs">
                                                    No comparison data available
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        case 'fullreport':
                            return (
                                <>
                                    {/* Add View Full Report button */}
                                    <div className="flex justify-end mb-4">
                                        <Link href={`/dashboard/clients/${client.uid}/reports`}>
                                            <Button variant="outline" className="gap-2">
                                                <ExternalLink className="w-4 h-4" />
                                                View Full Report
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Full Client Quotation Report Section */}
                                    <div className="p-6 border rounded border-border/80 bg-card">
                                        <h3 className="mb-4 text-sm font-normal uppercase font-body">
                                            Comprehensive Quotation Analysis
                                        </h3>
                                        <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                            Detailed reports and analytics of client quotations
                                        </p>
                                        <div className="h-full">
                                            <ClientQuotationReport clientId={client.uid} />
                                        </div>
                                    </div>
                                </>
                            );
                        default:
                            return null;
                    }
                };

                return (
                    <div className="flex flex-col justify-start gap-4">
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex flex-col justify-center p-4 border rounded cursor-pointer bg-card/50 border-border/80">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Total Quotation Value
                                </h3>
                                <div className="flex flex-row items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-semibold font-body">
                                            R{' '}
                                            {Number(
                                                client.quotations?.reduce(
                                                    (sum, quote) =>
                                                        sum +
                                                        Number(
                                                            quote?.totalAmount ||
                                                                0,
                                                        ),
                                                    0,
                                                ) || 0,
                                            ).toFixed(2)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body uppercase">
                                            Across{' '}
                                            {client.quotations?.length || 0}{' '}
                                            quotations
                                        </p>
                                    </div>
                                    <DollarSign size={30} strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center p-4 border rounded cursor-pointer bg-card/50 border-border/80">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Total Items
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-semibold font-body">
                                            {client.quotations?.reduce(
                                                (sum, quote) =>
                                                    sum +
                                                    (quote?.totalItems || 0),
                                                0,
                                            ) || 0}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body uppercase">
                                            Average{' '}
                                            {(
                                                (client.quotations?.reduce(
                                                    (sum, quote) =>
                                                        sum +
                                                        (quote?.totalItems ||
                                                            0),
                                                    0,
                                                ) || 0) /
                                                Math.max(
                                                    client.quotations?.length ||
                                                        1,
                                                    1,
                                                )
                                            ).toFixed(1)}{' '}
                                            per quotation
                                        </p>
                                    </div>
                                    <ShoppingBag size={30} strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center p-4 border rounded cursor-pointer bg-card/50 border-border/80">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Latest Quotation
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-semibold font-body">
                                            R{' '}
                                            {Number(
                                                client.quotations &&
                                                    client.quotations.length > 0
                                                    ? client.quotations[
                                                          client.quotations
                                                              .length - 1
                                                      ]?.totalAmount || 0
                                                    : 0,
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                    <FileText size={30} strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="flex flex-col justify-center p-4 border rounded cursor-pointer bg-card/50 border-border/80">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Average Quotation Value
                                </h3>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-semibold font-body">
                                            R{' '}
                                            {(
                                                (client.quotations?.reduce(
                                                    (sum, quote) =>
                                                        sum +
                                                        Number(
                                                            quote?.totalAmount ||
                                                                0,
                                                        ),
                                                    0,
                                                ) || 0) /
                                                Math.max(
                                                    client.quotations?.length ||
                                                        1,
                                                    1,
                                                )
                                            ).toFixed(2)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body uppercase">
                                            Based on{' '}
                                            {client.quotations?.length || 0}{' '}
                                            quotations
                                        </p>
                                    </div>
                                    <TrendingUp size={30} strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex w-full overflow-hidden border-b border-border/10">
                            <button
                                className={`px-8 py-3 text-xs font-normal uppercase border-b-2 font-body ${activeReportTab === 'overview' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                                onClick={() => setActiveReportTab('overview')}
                            >
                                Overview
                            </button>
                            <button
                                className={`px-8 py-3 text-xs font-normal uppercase border-b-2 font-body ${activeReportTab === 'quotations' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                                onClick={() => setActiveReportTab('quotations')}
                            >
                                Quotations
                            </button>
                            <button
                                className={`px-8 py-3 text-xs font-normal uppercase border-b-2 font-body ${activeReportTab === 'fullreport' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
                                onClick={() => setActiveReportTab('fullreport')}
                            >
                                Full Report
                            </button>
                        </div>

                        {/* Render the active tab content */}
                        {renderReportContent()}
                    </div>
                );
            case 'tasks':
                return (
                    <div className="flex flex-col items-center justify-center h-40 gap-1">
                        <div className="p-4 text-center rounded-full bg-muted/20">
                            <CheckCircle
                                className="w-8 h-8 text-muted-foreground"
                                strokeWidth={1.5}
                            />
                        </div>
                        <div className="text-center">
                            <h3 className="mb-1 text-xs font-normal uppercase font-body">
                                ACTIVATING SOON
                            </h3>
                            <p className="text-xs text-muted-foreground font-body">
                                Tasks management functionality will be available
                                soon
                            </p>
                        </div>
                    </div>
                );
            case 'assignees':
                return (
                    <div className="space-y-6">
                        {client.assignedSalesRep ? (
                            <div className="p-4 border rounded-lg bg-card/50 border-border/80">
                                <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                    Assigned Team Members
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-3 border rounded-md border-border/30">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="w-10 h-10 border border-primary">
                                                <AvatarImage
                                                    src={
                                                        client.assignedSalesRep
                                                            .photoURL
                                                    }
                                                    alt={
                                                        client.assignedSalesRep
                                                            .name || 'Sales Rep'
                                                    }
                                                />
                                                <AvatarFallback className="text-xs font-body">
                                                    {client.assignedSalesRep
                                                        .name
                                                        ? client.assignedSalesRep.name
                                                              .slice(0, 2)
                                                              .toUpperCase()
                                                        : 'SR'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium uppercase font-body">
                                                        {client.assignedSalesRep
                                                            .name ||
                                                            'Unnamed'}{' '}
                                                        {client.assignedSalesRep
                                                            .surname || ''}
                                                    </h4>
                                                    {client.assignedSalesRep
                                                        .role && (
                                                        <div className="mt-1">
                                                            <Badge className="text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                                                {client.assignedSalesRep.role.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 mt-2">
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        <span className="text-[10px] font-normal uppercase font-body">
                                                            {
                                                                client
                                                                    .assignedSalesRep
                                                                    .email
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Phone className="w-3 h-3 mr-1" />
                                                        <span className="text-[10px] font-normal uppercase font-body">
                                                            {
                                                                client
                                                                    .assignedSalesRep
                                                                    .phone
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Users className="w-3 h-3 mr-1" />
                                                        <span className="text-[10px] font-normal uppercase font-body">
                                                            Access Level:{' '}
                                                            {
                                                                client
                                                                    .assignedSalesRep
                                                                    .accessLevel
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 gap-1">
                                <div className="p-4 text-center rounded-full bg-muted/20">
                                    <Users
                                        className="w-8 h-8 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="mb-1 text-xs font-normal uppercase font-body">
                                        No Assigned Team Members
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-body">
                                        This client has no team members assigned
                                        yet.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    // Render the main modal
    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="min-w-[100vw] h-[100vh] overflow-hidden bg-card sm:rounded-none p-4 flex flex-col justify-between gap-4 bg-card">
                    <div className="flex flex-col justify-start gap-4 h-[90vh] overflow-hidden">
                        <DialogHeader className="flex flex-row items-start justify-between h-[7vh]">
                            <div className="flex flex-row items-center gap-3">
                                <Avatar className="w-16 h-16 border-2 border-primary">
                                    <AvatarImage
                                        src={client.logo}
                                        alt={client.name}
                                        className="object-contain p-1"
                                    />
                                    <AvatarFallback className="text-2xl font-body">
                                        {client.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0">
                                    <DialogTitle className="text-xl font-semibold uppercase font-body">
                                        {client?.name}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        {renderBranchInfo()}
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] font-normal uppercase font-body px-4 py-1 border-0 ${getStatusBadgeColor(
                                                client?.status,
                                            )}`}
                                        >
                                            {client?.status?.toUpperCase() ||
                                                'UNKNOWN'}
                                        </Badge>
                                        {client?.category && (
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] font-normal uppercase font-body px-4 py-1 border-0 ${getCategoryBadgeColor(
                                                    client?.category,
                                                )}`}
                                            >
                                                {client?.category?.toUpperCase()}
                                            </Badge>
                                        )}
                                    </div>
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
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-9 h-9"
                                    onClick={handleEditClick}
                                >
                                    <Edit className="w-5 h-5" />
                                </Button>
                            </div>
                        </DialogHeader>

                        {/* Tabs */}
                        <div className="h-[83vh]">
                            <div className="flex items-center h-[5vh] overflow-x-auto border-b border-border/10">
                                {tabs.map((tab) => (
                                    <div
                                        key={tab?.id}
                                        className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28 md:w-36"
                                    >
                                        <div
                                            className={`mb-3 font-body px-0 font-normal flex items-center ${
                                                activeTab === tab?.id
                                                    ? 'text-primary dark:text-primary'
                                                    : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                            onClick={() =>
                                                handleTabChange(tab?.id)
                                            }
                                        >
                                            {tab.icon}
                                            <span className="text-xs font-thin uppercase font-body">
                                                {tab?.label}
                                            </span>
                                        </div>
                                        {activeTab === tab?.id && (
                                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="overflow-y-auto h-[78vh] pb-20">
                                {contentTabs()}
                            </div>
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <DialogFooter className="flex flex-col flex-wrap gap-4 h-[10vh] border-t dark:border-gray-700 p-2">
                        <div className="flex flex-col items-center justify-center w-full">
                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                Quick Actions
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center w-full gap-3">
                            {/* Warning/Pending Button */}
                            {onUpdateStatus && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-yellow-900/30 ${client.status === ClientStatus.PENDING ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                                    onClick={() =>
                                        initiateStatusChange(
                                            ClientStatus.PENDING,
                                        )
                                    }
                                    title="Set as Pending"
                                >
                                    <AlertCircle
                                        strokeWidth={1.2}
                                        className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                                    />
                                </Button>
                            )}

                            {/* Active/Approved Button */}
                            {onUpdateStatus && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${client.status === ClientStatus.ACTIVE ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                                    onClick={() =>
                                        initiateStatusChange(
                                            ClientStatus.ACTIVE,
                                        )
                                    }
                                    title="Set as Active"
                                >
                                    <CheckCircle
                                        strokeWidth={1.2}
                                        className="text-green-600 w-7 h-7 dark:text-green-400"
                                    />
                                </Button>
                            )}

                            {/* Inactive/Disabled Button */}
                            {onUpdateStatus && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${client.status === ClientStatus.INACTIVE ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                                    onClick={() =>
                                        initiateStatusChange(
                                            ClientStatus.INACTIVE,
                                        )
                                    }
                                    title="Set as Inactive"
                                >
                                    <Ban
                                        strokeWidth={1.2}
                                        className="text-red-600 w-7 h-7 dark:text-red-400"
                                    />
                                </Button>
                            )}

                            {/* Calendar Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-purple-800 border-purple-200 rounded-full w-14 h-14 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30"
                                onClick={handleCalendarAction}
                                title="Schedule"
                            >
                                <Calendar
                                    strokeWidth={1.2}
                                    className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                />
                            </Button>

                            {/* Edit Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-blue-800 border-blue-200 rounded-full w-14 h-14 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:border-blue-900/30"
                                onClick={handleEditClick}
                                title="Edit Client"
                            >
                                <Edit
                                    strokeWidth={1.2}
                                    className="text-blue-600 w-7 h-7 dark:text-blue-400"
                                />
                            </Button>

                            {/* Delete Button - Note: Currently inactive as mentioned by user */}
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-red-800 border-red-200 rounded-full w-14 h-14 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30"
                                    onClick={handleInitiateDelete}
                                    title="Delete Client"
                                >
                                    <Trash
                                        strokeWidth={1.2}
                                        className="text-red-600 w-7 h-7 dark:text-red-400"
                                    />
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Client Modal */}
            {showEditModal && (
                <EditClientModal
                    client={client}
                    isOpen={showEditModal}
                    onClose={handleCloseEditModal}
                    onClientUpdated={handleClientUpdated}
                />
            )}

            {/* Status Change Confirmation Dialog */}
            {showStatusChangeConfirmation && (
                <Dialog
                    open={showStatusChangeConfirmation}
                    onOpenChange={() => setShowStatusChangeConfirmation(false)}
                >
                    <DialogContent className="max-w-md p-6 text-white border-0 bg-black/90">
                        <DialogTitle className="sr-only">
                            Confirm Status Change
                        </DialogTitle>
                        <div className="p-0">
                            <h2 className="mb-4 text-base font-semibold text-center uppercase font-body">
                                CONFIRM STATUS CHANGE
                            </h2>
                            <p className="mb-6 text-sm text-center uppercase font-body">
                                ARE YOU SURE YOU WANT TO CHANGE THE STATUS OF
                                THIS CLIENT TO{' '}
                                <span className="font-semibold">
                                    {pendingStatusChange &&
                                        getStatusDisplayName(
                                            pendingStatusChange,
                                        )}
                                </span>
                                ?
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    className="w-32 h-10 text-xs text-white uppercase bg-red-600 border-0 font-body hover:bg-red-700"
                                    onClick={cancelStatusChange}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant="default"
                                    className="w-32 h-10 text-xs text-white uppercase bg-purple-600 font-body hover:bg-purple-700"
                                    onClick={confirmStatusChange}
                                >
                                    CONFIRM
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirmation && (
                <Dialog
                    open={showDeleteConfirmation}
                    onOpenChange={() => setShowDeleteConfirmation(false)}
                >
                    <DialogContent className="max-w-md p-6 text-white border-0 bg-black/90">
                        <DialogTitle className="sr-only">
                            Confirm Delete Client
                        </DialogTitle>
                        <div className="p-0">
                            <h2 className="mb-4 text-base font-semibold text-center uppercase font-body">
                                CONFIRM DELETE CLIENT
                            </h2>
                            <p className="mb-6 text-sm text-center uppercase font-body">
                                ARE YOU SURE YOU WANT TO DELETE THIS CLIENT?
                                THIS ACTION CANNOT BE UNDONE.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    className="w-32 h-10 text-xs text-white uppercase bg-red-600 border-0 font-body hover:bg-red-700"
                                    onClick={() =>
                                        setShowDeleteConfirmation(false)
                                    }
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant="default"
                                    className="w-32 h-10 text-xs text-white uppercase bg-purple-600 font-body hover:bg-purple-700"
                                    onClick={handleConfirmDelete}
                                >
                                    CONFIRM
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {errors && Object.keys(errors).length > 0 && (
                <div className="p-3 mb-4 rounded-md bg-red-100/10">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <p className="text-[8px] font-normal uppercase text-red-500 font-body">
                            Please fix the following errors:
                        </p>
                    </div>
                    <ul className="mt-2 space-y-1">
                        {Object.entries(errors).map(([key, value]) => (
                            <li
                                key={key}
                                className="text-[8px] font-normal uppercase text-red-500 font-body"
                            >
                                {value.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <p className="text-[8px] font-normal uppercase text-muted-foreground font-body">
                * indicates required fields
            </p>
        </>
    );
}
