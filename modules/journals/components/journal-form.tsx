'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/auth-store';
import { CreateJournalDto } from '@/lib/types/journal';

// Schema for journal form validation
const journalFormSchema = z.object({
    clientRef: z.string().min(1, 'Client reference is required'),
    fileURL: z.string().url('Must be a valid URL'),
    comments: z.string().min(1, 'Comments are required'),
});

type JournalFormValues = z.infer<typeof journalFormSchema>;

interface JournalFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateJournalDto) => Promise<void>;
}

export function JournalForm({ isOpen, onClose, onSubmit }: JournalFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { profileData } = useAuthStore();

    // Initialize form with react-hook-form and zod validation
    const form = useForm<JournalFormValues>({
        resolver: zodResolver(journalFormSchema),
        defaultValues: {
            clientRef: '',
            fileURL: '',
            comments: '',
        },
    });

    // Handle form submission
    const handleSubmit = async (values: JournalFormValues) => {
        try {
            setIsSubmitting(true);

            // Create the DTO with owner and branch info from profile
            const journalData: CreateJournalDto = {
                ...values,
                owner: { uid: Number(profileData?.uid) },
                branch: { uid: Number(profileData?.branch?.uid) }
            };

            await onSubmit(journalData);
            form.reset();
            onClose();
        } catch (error) {
            console.error('Error submitting journal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="flex flex-row items-start justify-between">
                    <div>
                        <DialogTitle className="text-base font-medium uppercase font-body">
                            Add New Journal
                        </DialogTitle>
                        <DialogDescription className="text-xs font-thin font-body">
                            Fill in the details to create a new journal entry
                        </DialogDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={onClose}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="clientRef"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium uppercase font-body">
                                        Client Reference
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter client reference"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fileURL"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium uppercase font-body">
                                        File URL
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/file.pdf"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="comments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-medium uppercase font-body">
                                        Comments
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add your comments here..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="text-xs font-medium uppercase font-body"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="text-xs font-medium uppercase font-body"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
