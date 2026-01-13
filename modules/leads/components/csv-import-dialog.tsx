'use client';

import { useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Download, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/services/api-client';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { useUsersQuery } from '@/hooks/use-users-query';

interface CSVImportDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (result: ImportResult) => void;
}

interface ImportResult {
    success: boolean;
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
    assignments: Array<{ leadId: number; userId: number; userName: string }>;
}

type FollowUpInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export function CSVImportDialog({ open, onClose, onSuccess }: CSVImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [followUpInterval, setFollowUpInterval] = useState<FollowUpInterval>('WEEKLY');
    const [followUpDuration, setFollowUpDuration] = useState<number>(90);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const { toast } = useToast();

    // Fetch users for sales rep selection
    const {
        users,
        isLoading: isLoadingUsers,
        error: usersError,
        refetch: refetchUsers,
    } = useUsersQuery({
        limit: 500, // Get all available users
    });

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                toast({
                    title: 'Invalid file type',
                    description: 'Please select a CSV file',
                    variant: 'destructive',
                });
                return;
            }
            setFile(selectedFile);
            setImportResult(null);
        }
    }, [toast]);

    const handleImport = useCallback(async () => {
        if (!file) {
            toast({
                title: 'No file selected',
                description: 'Please select a CSV file to import',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        setImportResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Build query parameters
            const queryParams = new URLSearchParams({
                followUpInterval: followUpInterval,
                followUpDuration: followUpDuration.toString(),
            });

            // Add selected user IDs if any are selected
            if (selectedUserIds.length > 0) {
                queryParams.append('assignedUserIds', selectedUserIds.join(','));
            }

            const response = await axiosInstance.post<ImportResult>(
                `/leads/import-csv?${queryParams.toString()}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const result = response.data;

            setImportResult(result);

            // Always call onSuccess to trigger refetch, but don't close modal
            // Modal will stay open to show summary
            if (result.success && result.imported > 0) {
                onSuccess(result);
            } else if (result.imported > 0) {
                // Partial success - still refetch but show errors in summary
                onSuccess(result);
            }
        } catch (error: any) {
            toast({
                title: 'Import failed',
                description: error.message || 'Failed to import leads',
                variant: 'destructive',
            });
            setImportResult({
                success: false,
                imported: 0,
                failed: 0,
                errors: [{ row: 0, error: error.message || 'Import failed' }],
                assignments: [],
            });
        } finally {
            setIsUploading(false);
        }
    }, [file, followUpInterval, followUpDuration, selectedUserIds, toast, onSuccess]);

    const handleClose = useCallback(() => {
        setFile(null);
        setImportResult(null);
        setFollowUpInterval('WEEKLY');
        setFollowUpDuration(90);
        setSelectedUserIds([]);
        onClose();
    }, [onClose]);

    const handleRetry = useCallback(() => {
        // Reset all form state to allow new import
        setFile(null);
        setImportResult(null);
        setFollowUpInterval('WEEKLY');
        setFollowUpDuration(90);
        setSelectedUserIds([]);
        setIsUploading(false);
    }, []);

    // Prepare user options for MultiSelect
    const userOptions: MultiSelectOption[] =
        users?.map((user) => ({
            value: user.uid,
            label: `${user.name} ${user.surname}${user.email ? ` - ${user.email}` : ''}`,
        })) || [];

    const downloadExampleCSV = useCallback(() => {
        const csvContent = `name,email,phone,companyName,notes,image,attachments,latitude,longitude,category,status,intent,userQualityRating,temperature,source,priority,lifecycleStage,jobTitle,decisionMakerRole,industry,businessSize,budgetRange,purchaseTimeline,preferredCommunication,timezone,bestContactTime,painPoints,estimatedValue,competitorInfo,referralSource,campaignName,landingPage,utmSource,utmMedium,utmCampaign,utmTerm,utmContent,customFields
John Doe,john.doe@example.com,+27123456789,Acme Corp,Interested in our product,,"https://example.com/doc1.pdf,https://example.com/doc2.pdf",-33.9249,18.4241,BUSINESS,PENDING,PURCHASE,4,WARM,WEBSITE,HIGH,LEAD,Marketing Manager,MANAGER,TECHNOLOGY,MEDIUM,R100K_250K,SHORT_TERM,EMAIL,Africa/Johannesburg,9:00-17:00,"High costs,Manual processes",50000,Currently using CompetitorX,Jane Smith,Summer2024-TechSolution,https://example.com/landing,google,cpc,summer-tech-2024,business software,header-cta,"{""customField1"":""value1"",""customField2"":""value2""}"
Jane Smith,jane.smith@example.com,+27987654321,Tech Solutions,Looking for enterprise solution,,,,-33.9250,18.4242,BUSINESS,PENDING,ENQUIRY,5,HOT,REFERRAL,CRITICAL,SALES_QUALIFIED_LEAD,CTO,CTO,TECHNOLOGY,LARGE,R250K_500K,IMMEDIATE,PHONE,Africa/Johannesburg,8:00-16:00,"Integration issues,Scaling problems",100000,Using Legacy System,John Doe,Winter2024-Enterprise,https://example.com/enterprise,linkedin,sponsored,enterprise-winter-2024,enterprise solution,cta-button,"{""companySize"":""500+"",""currentVendor"":""LegacyCorp""}"
Bob Johnson,bob@example.com,+27555123456,Retail Plus,Need point of sale system,,,,-33.9251,18.4243,RETAIL,REVIEW,QUOTE_REQUEST,3,COLD,EMAIL_CAMPAIGN,MEDIUM,LEAD,Store Manager,MANAGER,RETAIL,SMALL,R50K_100K,MEDIUM_TERM,SMS,Africa/Johannesburg,10:00-18:00,"Cost efficiency,Inventory management",25000,,,Spring2024-Retail,https://example.com/retail,facebook,display,retail-spring-2024,retail pos,sidebar-ad,"{""storeCount"":""5"",""currentSystem"":""Manual""}"`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads-import-template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, []);

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                // Prevent closing when clicking outside if showing summary
                // User must use Close button to close after viewing summary
                if (!isOpen && importResult) {
                    return; // Don't close - user must click Close button
                }
                if (!isOpen) {
                    handleClose();
                }
            }}
        >
            <DialogContent
                className="max-w-[740px] max-h-[90vh] overflow-y-auto"
                onInteractOutside={(e) => {
                    // Prevent closing on outside click when showing summary
                    if (importResult) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-thin uppercase font-body">
                        Import Leads from CSV
                    </DialogTitle>
                    <DialogDescription className="text-sm font-body">
                        Upload a CSV file to import leads. They will be automatically assigned to sales reps evenly.
                    </DialogDescription>
                </DialogHeader>

                {importResult ? (
                    /* Summary View */
                    <div className="py-4 space-y-4">
                        <div className="flex gap-2 items-center">
                            {importResult.success ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-500" />
                            )}
                            <span className="text-lg font-medium font-body">
                                Import Results
                            </span>
                        </div>
                        <div className="space-y-4 text-sm font-body">
                            <div className="flex gap-4 items-center">
                                <p>
                                    <span className="font-medium">Imported:</span>{' '}
                                    <strong className="text-green-600">{importResult.imported}</strong>
                                </p>
                                {importResult.failed > 0 && (
                                    <p>
                                        <span className="font-medium">Failed:</span>{' '}
                                        <strong className="text-red-600">{importResult.failed}</strong>
                                    </p>
                                )}
                            </div>
                            {importResult.assignments.length > 0 && (
                                <div>
                                    <p className="mb-2 font-medium">Assignments:</p>
                                    <ul className="space-y-1 text-xs list-disc list-inside">
                                        {importResult.assignments.map((assignment, idx) => (
                                            <li key={idx}>
                                                Lead #{assignment.leadId} → {assignment.userName}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {importResult.errors.length > 0 && (
                                <div>
                                    <p className="mb-2 font-medium text-red-500">Errors:</p>
                                    <ul className="overflow-y-auto space-y-1 max-h-40 text-xs list-disc list-inside text-red-500">
                                        {importResult.errors.map((error, idx) => (
                                            <li key={idx}>
                                                Row {error.row}: {error.error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Form View */
                    <div className="py-4 space-y-6">
                        {/* CSV Format Info */}
                        <Alert>
                            <FileText className="w-4 h-4" />
                            <AlertDescription className="text-xs font-body">
                                <strong>Required columns:</strong> name (or email/phone), companyName<br />
                                <strong>Optional columns:</strong><br />
                                <span className="ml-2">
                                    <strong>Basic:</strong> email, phone, notes, image, attachments (comma-separated URLs), latitude, longitude, category, status<br />
                                    <strong>Qualification:</strong> intent, userQualityRating (1-5), temperature, source, priority, lifecycleStage<br />
                                    <strong>Company Info:</strong> jobTitle, decisionMakerRole, industry, businessSize, budgetRange, purchaseTimeline<br />
                                    <strong>Communication:</strong> preferredCommunication, timezone, bestContactTime<br />
                                    <strong>Business Context:</strong> painPoints (comma-separated), estimatedValue, competitorInfo, referralSource<br />
                                    <strong>Campaign Tracking:</strong> campaignName, landingPage, utmSource, utmMedium, utmCampaign, utmTerm, utmContent<br />
                                    <strong>Custom:</strong> customFields (JSON string)<br />
                                </span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-xs underline mt-2"
                                    onClick={downloadExampleCSV}
                                >
                                    <Download className="mr-1 w-3 h-3" />
                                    Download example CSV template
                                </Button>
                            </AlertDescription>
                        </Alert>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="csv-file" className="text-sm font-body">
                                Select CSV File
                            </Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="csv-file"
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={handleFileSelect}
                                    className="text-xs font-body"
                                    disabled={isUploading}
                                />
                                {file && (
                                    <div className="flex gap-2 items-center text-xs text-primary font-body">
                                        <FileText className="w-4 h-4" />
                                        <span>Chosen file: {file.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sales Rep Selection */}
                        <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                                <Label htmlFor="assigned-users" className="text-sm font-body">
                                    Assign to Sales Reps (Optional)
                                </Label>
                                {selectedUserIds.length === 0 && !isLoadingUsers && userOptions.length > 0 && (
                                    <span className="text-xs italic text-muted-foreground font-body">
                                        (If none is selected, leads will be spread across all active sales reps in the company)
                                    </span>
                                )}
                            </div>
                            <MultiSelect
                                options={userOptions}
                                selectedValues={selectedUserIds}
                                onSelectionChange={(values) =>
                                    setSelectedUserIds(values as number[])
                                }
                                placeholder={
                                    isLoadingUsers
                                        ? 'Loading sales reps...'
                                        : userOptions.length === 0
                                          ? 'No sales reps available'
                                          : 'Select sales reps to assign leads to (leave empty for all active reps)...'
                                }
                                disabled={isUploading || isLoadingUsers}
                                className="w-full"
                            />
                            {isLoadingUsers && (
                                <p className="text-xs text-muted-foreground font-body">
                                    Loading sales reps...
                                </p>
                            )}
                            {usersError && (
                                <div className="text-xs text-red-500 font-body">
                                    Failed to load sales reps.{' '}
                                    <button
                                        type="button"
                                        onClick={() => refetchUsers()}
                                        className="underline hover:no-underline"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                            {!isLoadingUsers && !usersError && userOptions.length === 0 && (
                                <p className="text-xs text-muted-foreground font-body">
                                    No sales reps available for assignment.
                                </p>
                            )}
                            {selectedUserIds.length > 0 && (
                                <p className="text-xs text-muted-foreground font-body">
                                    Leads will be assigned to {selectedUserIds.length} selected sales rep{selectedUserIds.length !== 1 ? 's' : ''} only.
                                </p>
                            )}
                            {selectedUserIds.length === 0 && !isLoadingUsers && userOptions.length > 0 && (
                                <p className="text-xs text-muted-foreground font-body">
                                    When no sales reps are selected, leads will be automatically distributed evenly across all active sales reps in your organization.
                                </p>
                            )}
                        </div>

                        {/* Follow-up Settings */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="follow-up-interval" className="text-sm font-body">
                                    Follow-up Interval
                                </Label>
                                <Select
                                    value={followUpInterval}
                                    onValueChange={(value: FollowUpInterval) => setFollowUpInterval(value)}
                                    disabled={isUploading}
                                >
                                    <SelectTrigger id="follow-up-interval" className="text-xs font-body">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Daily</SelectItem>
                                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="follow-up-duration" className="text-sm font-body">
                                    Duration (days)
                                </Label>
                                <Input
                                    id="follow-up-duration"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={followUpDuration}
                                    onChange={(e) => setFollowUpDuration(Number(e.target.value))}
                                    className="text-xs font-body"
                                    disabled={isUploading}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {importResult ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleRetry}
                                className="text-xs text-white uppercase bg-primary font-body"
                            >
                                Retry
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="text-xs text-white uppercase bg-red-500 font-body"
                            >
                                Close
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={isUploading}
                                className="text-xs font-body"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!file || isUploading}
                                className="text-xs font-body"
                            >
                                {isUploading ? (
                                    <>
                                        <Upload className="mr-2 w-4 h-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 w-4 h-4" />
                                        Import Leads
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
