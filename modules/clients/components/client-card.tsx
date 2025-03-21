'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Client, ClientStatus } from '@/hooks/use-clients-query';
import {
    Mail,
    Phone,
    Briefcase,
    MapPin,
    Building,
    Tag,
    Calendar,
    CreditCard,
} from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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
import { ClientDetailsModal } from './client-details-modal';

interface ClientCardProps {
    client: Client;
    onEdit?: (client: Client) => void;
    onDelete?: (clientId: number) => void;
    onUpdateStatus?: (clientId: number, newStatus: string) => void;
    index?: number;
}

// Create the ClientCard as a standard component
function ClientCardComponent({
    client,
    onEdit,
    onDelete,
    onUpdateStatus,
    index = 0,
}: ClientCardProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use CSS variables for animation delay - match tasks component's variable name
    const cardStyle = {
        '--task-delay': `${Math.min(index * 50, 500)}ms`,
    } as React.CSSProperties;

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

    const formatDate = (date?: Date) => {
        if (!date) return null;
        return format(new Date(date), 'MMM d, yyyy');
    };

    const handleStatusChange = useCallback(
        (newStatus: string) => {
            if (onUpdateStatus) {
                onUpdateStatus(client.uid, newStatus);
            }
        },
        [onUpdateStatus, client.uid],
    );

    const handleDelete = useCallback(() => {
        setIsDeleteAlertOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (onDelete) {
            onDelete(client.uid);
        }
        setIsDeleteAlertOpen(false);
    }, [onDelete, client.uid]);

    const handleEdit = useCallback(() => {
        if (onEdit) {
            onEdit(client);
        }
    }, [onEdit, client]);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return (
        <>
            <div
                className="p-3 overflow-hidden border rounded-md shadow-sm cursor-pointer bg-card border-border/50 hover:shadow-md animate-task-appear"
                style={cardStyle}
                onClick={openModal}
            >
                <div className="flex items-center justify-between mb-2">
                    {/* Client Avatar */}
                    <Avatar className="w-12 h-12 mr-3 border border-primary">
                        <AvatarImage src={client?.logo} alt={client?.name} />
                        <AvatarFallback className="text-xs font-normal uppercase font-body">
                            {client?.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                    </Avatar>

                    {/* Client Name & Status Badge */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium uppercase truncate text-card-foreground font-body">
                            {client.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="outline"
                                className={`text-[9px] font-normal uppercase font-body px-2 py-1 border-0 ${getStatusBadgeColor(
                                    client?.status,
                                )}`}
                            >
                                {client?.status?.replace('_', ' ')}
                            </Badge>
                            {client.category && (
                                <Badge
                                    variant="outline"
                                    className="text-[9px] font-normal uppercase font-body px-2 py-1 border-0 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                >
                                    {client.category}
                                </Badge>
                            )}
                            {client.type && (
                                <Badge
                                    variant="outline"
                                    className="text-[9px] font-normal uppercase font-body px-2 py-1 border-0 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                >
                                    {client.type}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Client Details */}
                <div className="mt-2 space-y-4 text-xs text-muted-foreground">
                    {/* Client Meta Information */}
                    <div className="grid grid-cols-2 gap-1">
                        {/* Email */}
                        {client?.email && (
                            <div className="flex items-center col-span-2">
                                <Mail className="w-4 h-4 mr-1" />
                                <span className="text-[10px] font-normal font-body">
                                    {client.email}
                                </span>
                            </div>
                        )}

                        {/* Phone */}
                        {client?.phone && (
                            <div className="flex items-center col-span-2">
                                <Phone className="w-4 h-4 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {client.phone}
                                </span>
                            </div>
                        )}

                        {/* Contact Person */}
                        {client.contactPerson && (
                            <div className="flex items-center col-span-2">
                                <Briefcase className="w-4 h-4 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {client.contactPerson}
                                </span>
                            </div>
                        )}

                        {/* Industry */}
                        {client.industry && (
                            <div className="flex items-center col-span-2">
                                <Building className="w-4 h-4 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {client.industry}
                                </span>
                            </div>
                        )}

                        {/* Address */}
                        {client.address && (
                            <div className="flex items-center col-span-2">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body truncate">
                                    {client.address.street &&
                                    client.address.city
                                        ? `${client.address.street}, ${client.address.city}${
                                              client.address.country
                                                  ? `, ${client.address.country}`
                                                  : ''
                                          }`
                                        : 'Address available'}
                                </span>
                            </div>
                        )}

                        {/* Tags */}
                        {client.tags && client.tags.length > 0 && (
                            <div className="flex flex-wrap items-center col-span-2 gap-1 mt-1">
                                <Tag className="w-3 h-3 mr-1" />
                                {client.tags.slice(0, 3).map((tag, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-[8px] font-normal px-1.5 py-0.5 border-0 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                                {client.tags.length > 3 && (
                                    <Badge
                                        variant="outline"
                                        className="text-[8px] font-normal px-1.5 py-0.5 border-0 bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                                    >
                                        +{client.tags.length - 3}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Financial Info */}
                        {(client.creditLimit || client.outstandingBalance) && (
                            <div className="flex items-center col-span-2 mt-1">
                                <CreditCard className="w-3 h-3 mr-1" />
                                <span className="text-[9px] font-normal uppercase font-body uppercase">
                                    {client.outstandingBalance
                                        ? `Balance: R${client.outstandingBalance}`
                                        : ''}
                                    {client.outstandingBalance &&
                                    client.creditLimit
                                        ? ' | '
                                        : ''}
                                    {client.creditLimit
                                        ? `Limit: R${client.creditLimit}`
                                        : ''}
                                </span>
                            </div>
                        )}

                        {/* Created Date & Anniversary */}
                        <div className="flex items-center justify-between col-span-2 mt-2">
                            {client?.createdAt && (
                                <span className="text-[9px] font-normal uppercase font-body">
                                    <Calendar className="inline w-3 h-3 mr-1" />
                                    Since: {formatDate(client.createdAt)}
                                </span>
                            )}
                            {client?.anniversaryDate && (
                                <span className="text-[9px] font-normal uppercase font-body">
                                    <Calendar className="inline w-3 h-3 mr-1" />
                                    Anniv: {formatDate(client.anniversaryDate)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog
                open={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the client{' '}
                            {client.name}. This action cannot be undone.
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

            {/* Client Details Modal */}
            <ClientDetailsModal
                client={client}
                isOpen={isModalOpen}
                onClose={closeModal}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
            />
        </>
    );
}

// Export a memoized version to prevent unnecessary re-renders
export const ClientCard = memo(ClientCardComponent);
