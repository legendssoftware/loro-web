'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { signUpSchema } from '@/lib/schema/auth';
import { useRouter } from 'next/navigation';
import { useSignUpMutation } from '@/store/use-auth-store';
import { motion } from 'framer-motion';
import { containerVariants } from '@/lib/utils/animations';

type SignUpSchema = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
    const router = useRouter();
    const signUpMutation = useSignUpMutation();
    const isLoading = signUpMutation.isPending;

    const [form, setForm] = useState<SignUpSchema>({
        email: '',
    });
    const [errors, setErrors] = useState<{ [K in keyof SignUpSchema]?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = signUpSchema.safeParse(form);

        if (!result.success) {
            const formattedErrors = result.error.issues.reduce((acc: { [key: string]: string }, issue: z.ZodIssue) => {
                const path = issue.path[0] as keyof SignUpSchema;
                acc[path] = issue.message;
                return acc;
            }, {});

            setErrors(formattedErrors);
            return;
        }

        setErrors({});

        try {
            const response = await signUpMutation.mutateAsync({
                email: form.email.trim(),
            });

            toast.success(response.message, {
                style: {
                    borderRadius: '5px',
                    background: '#333',
                    color: '#fff',
                    fontFamily: 'var(--font-unbounded)',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    padding: '16px',
                },
                duration: 5000,
                position: 'bottom-center',
                icon: '📧',
            });

            // Wait for toast to finish
            await new Promise(resolve => setTimeout(resolve, 2000));
            router.push('/sign-in');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message, {
                    style: {
                        borderRadius: '5px',
                        background: '#333',
                        color: '#fff',
                        fontFamily: 'var(--font-unbounded)',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        fontWeight: '300',
                        padding: '16px',
                    },
                    duration: 5000,
                    position: 'bottom-center',
                    icon: '❌',
                });
            }
        }
    };

    return (
        <motion.div
            initial='hidden'
            animate='show'
            variants={containerVariants}
            className='relative flex items-center justify-center min-h-screen p-4'
            style={{
                backgroundImage:
                    'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className='absolute inset-0 bg-black/50' />
            <div className='relative w-full max-w-md p-6 space-y-4 shadow-lg sm:p-8 sm:space-y-6 bg-white/10 backdrop-blur-lg rounded-xl'>
                <h1 className='text-2xl font-normal text-center text-white uppercase sm:text-3xl font-heading'>
                    Claim Account
                </h1>
                <form onSubmit={handleSubmit} className='mt-4 space-y-4 sm:mt-6'>
                    <div className='space-y-1'>
                        <label htmlFor='email' className='block text-xs font-light text-white uppercase font-body'>
                            Email Address
                        </label>
                        <Input
                            id='email'
                            type='email'
                            value={form.email}
                            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder='jdoe@gmail.com'
                            disabled={isLoading}
                            className={cn(
                                'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light',
                                errors.email && 'border-red-500 focus-visible:ring-red-500',
                                isLoading && 'opacity-50',
                            )}
                            aria-label='Email'
                        />
                        {errors.email && <p className='mt-1 text-xs text-red-500'>{errors.email}</p>}
                    </div>

                    <Button
                        type='submit'
                        disabled={isLoading}
                        className={cn(
                            'w-full p-5 text-xs font-normal uppercase bg-primary hover:bg-primary/90 font-body',
                            isLoading && 'opacity-50',
                        )}
                        aria-label='Claim Account'
                    >
                        {isLoading ? (
                            <div className='flex items-center justify-center space-x-1'>
                                <p className='font-normal text-white uppercase'>Sending Verification</p>
                                <Loader2 className='w-4 h-4 mr-2 text-white animate-spin' size={16} strokeWidth={1.5} />
                            </div>
                        ) : (
                            <span className='font-normal text-white'>Claim Account</span>
                        )}
                    </Button>
                </form>
                <div className='space-y-2 text-center'>
                    <div className='text-[10px] text-white font-light flex flex-row items-center space-x-1 justify-center'>
                        <p className='font-body uppercase text-[10px]'>Already have an account?</p>
                        <Link
                            href='/sign-in'
                            className={cn(
                                'text-white hover:text-white/80 font-normal uppercase font-body text-[10px]',
                                isLoading && 'pointer-events-none opacity-50',
                            )}
                            tabIndex={isLoading ? -1 : 0}
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SignUpPage;
