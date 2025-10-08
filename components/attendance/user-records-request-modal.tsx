'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar as CalendarIcon, CheckCircle, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useSessionStore } from '@/store/use-session-store';
import toast from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

interface User {
    uid: number;
    name: string;
    surname: string;
    email: string;
    role: string;
    branch?: {
        name: string;
    };
}

interface UserRecordsRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserRecordsRequestModal: React.FC<UserRecordsRequestModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [step, setStep] = useState<'select-user' | 'date-range' | 'confirm' | 'success'>('select-user');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [startDate, setStartDate] = useState<Date | undefined>(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default to 30 days ago
    );
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('');

    const { accessToken } = useAuthStore();
    const { profileData } = useSessionStore();

    // Load users when modal opens
    useEffect(() => {
        if (isOpen && step === 'select-user') {
            loadUsers();
        }
    }, [isOpen, step]);

    // Reset modal state when closed
    useEffect(() => {
        if (!isOpen) {
            setStep('select-user');
            setSelectedUserId(null);
            setSelectedUser(null);
            setError(null);
            setSuccessMessage('');
            setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
            setEndDate(new Date());
        }
    }, [isOpen]);

    const loadUsers = async () => {
        setIsLoadingUsers(true);
        setError(null);

        try {
            const response = await axiosInstance.get('/user');
            if (response.data?.users) {
                setUsers(response.data.users);
            } else {
                setError('No users found in your organization');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setError('Failed to load users. Please try again.');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleUserSelect = (userId: number) => {
        const user = users.find(u => u.uid === userId);
        setSelectedUserId(userId);
        setSelectedUser(user || null);
    };

    const handleSubmitRequest = async () => {
        if (!selectedUserId || !startDate || !endDate) {
            setError('Please select a user and date range');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post('/att/request-user-records', {
                userId: selectedUserId,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
            });

            if (response.data?.success) {
                setSuccessMessage(response.data.message);
                setStep('success');
                showSuccessToast('Request submitted successfully! Check your email for the records.', toast);
            } else {
                throw new Error(response.data?.message || 'Request failed');
            }
        } catch (error: any) {
            console.error('Error requesting records:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to request records';
            setError(errorMessage);
            showErrorToast(errorMessage, toast);
        } finally {
            setIsLoading(false);
        }
    };

    const renderSelectUser = () => (
        <div className="space-y-4">
            <div>
                <Label htmlFor="user-select">Select Employee</Label>
                <Select
                    value={selectedUserId?.toString() || ""}
                    onValueChange={(value) => handleUserSelect(parseInt(value))}
                    disabled={isLoadingUsers}
                >
                    <SelectTrigger className="mt-2">
                        <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Choose an employee"} />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((user) => (
                            <SelectItem key={user.uid} value={user.uid.toString()}>
                                <div className="flex flex-col">
                                    <span className="font-medium">{user.name} {user.surname}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {user.role}{user.branch?.name ? ` • ${user.branch.name}` : ''}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedUser && (
                <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected Employee</h4>
                    <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {selectedUser.name} {selectedUser.surname}</p>
                        <p><strong>Email:</strong> {selectedUser.email}</p>
                        <p><strong>Role:</strong> {selectedUser.role}</p>
                        {selectedUser.branch?.name && (
                            <p><strong>Branch:</strong> {selectedUser.branch.name}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="flex justify-between">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={() => setStep('date-range')}
                    disabled={!selectedUserId || isLoadingUsers}
                >
                    Next: Date Range
                </Button>
            </div>
        </div>
    );

    const renderDateRange = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Start Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal mt-2",
                                    !startDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div>
                    <Label>End Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal mt-2",
                                    !endDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Date Range Information</h4>
                <div className="text-sm text-blue-700 space-y-1">
                    <p>• Records will be exported for the selected date range</p>
                    <p>• Default range is the last 30 days</p>
                    <p>• All times will be in your organization's timezone</p>
                    <p>• The report will be sent to your email address</p>
                </div>
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('select-user')}>
                    Back
                </Button>
                <Button
                    onClick={() => setStep('confirm')}
                    disabled={!startDate || !endDate}
                >
                    Next: Confirm
                </Button>
            </div>
        </div>
    );

    const renderConfirm = () => (
        <div className="space-y-4">
            <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-4">Review Your Request</h4>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-muted-foreground">Employee:</span>
                            <p className="mt-1">{selectedUser?.name} {selectedUser?.surname}</p>
                        </div>
                        <div>
                            <span className="font-medium text-muted-foreground">Email:</span>
                            <p className="mt-1">{selectedUser?.email}</p>
                        </div>
                        <div>
                            <span className="font-medium text-muted-foreground">Start Date:</span>
                            <p className="mt-1">{startDate ? format(startDate, "PPP") : 'Not selected'}</p>
                        </div>
                        <div>
                            <span className="font-medium text-muted-foreground">End Date:</span>
                            <p className="mt-1">{endDate ? format(endDate, "PPP") : 'Not selected'}</p>
                        </div>
                        <div>
                            <span className="font-medium text-muted-foreground">Report will be sent to:</span>
                            <p className="mt-1">{profileData?.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                    The attendance records will be compiled and sent to your email address.
                    This may take a few minutes depending on the amount of data.
                </AlertDescription>
            </Alert>

            <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('date-range')} disabled={isLoading}>
                    Back
                </Button>
                <Button onClick={handleSubmitRequest} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending Request...
                        </>
                    ) : (
                        'Send Request'
                    )}
                </Button>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="space-y-4 text-center">
            <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
            </div>

            <div>
                <h3 className="text-lg font-semibold text-green-700">Request Sent Successfully!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    {successMessage}
                </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg text-left">
                <h4 className="font-medium text-green-900 mb-2">What happens next?</h4>
                <div className="text-sm text-green-700 space-y-1">
                    <p>• Attendance records for <strong>{selectedUser?.name} {selectedUser?.surname}</strong> are being compiled</p>
                    <p>• The report will be sent to <strong>{profileData?.email?.replace(/(.{3}).*@/, '$1***@')}</strong></p>
                    <p>• Check your email in the next few minutes</p>
                    <p>• The email will contain a detailed table of all attendance records</p>
                </div>
            </div>

            <Button onClick={onClose} className="w-full">
                Close
            </Button>
        </div>
    );

    const getDialogTitle = () => {
        switch (step) {
            case 'select-user':
                return 'Request Attendance Records - Select Employee';
            case 'date-range':
                return 'Request Attendance Records - Date Range';
            case 'confirm':
                return 'Request Attendance Records - Confirm';
            case 'success':
                return 'Request Sent Successfully';
            default:
                return 'Request Attendance Records';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="py-4">
                    {step === 'select-user' && renderSelectUser()}
                    {step === 'date-range' && renderDateRange()}
                    {step === 'confirm' && renderConfirm()}
                    {step === 'success' && renderSuccess()}
                </div>
            </DialogContent>
        </Dialog>
    );
};
