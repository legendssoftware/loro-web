'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { newPasswordSchema } from '@/lib/schemas/auth';
import { useSetPasswordMutation, useResetPasswordMutation } from '@/store/use-auth-store';

type NewPasswordSchema = z.infer<typeof newPasswordSchema>;

const NewPasswordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const isVerified = searchParams.get('verified') === 'true';
    const setPasswordMutation = useSetPasswordMutation();
    const resetPasswordMutation = useResetPasswordMutation();
    const isLoading = setPasswordMutation.isPending || resetPasswordMutation.isPending;
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [form, setForm] = useState<NewPasswordSchema>({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{ [K in keyof NewPasswordSchema]?: string }>({});

    useEffect(() => {
        if (!token) {
            router.push('/forgot-password');
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = newPasswordSchema.safeParse(form);

        if (!result.success) {
            const formattedErrors = result.error.issues.reduce((acc: { [key: string]: string }, issue: z.ZodIssue) => {
                const path = issue.path[0] as keyof NewPasswordSchema;
                acc[path] = issue.message;
                return acc;
            }, {});

            setErrors(formattedErrors);
            return;
        }

        if (form.password !== form.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }

        setErrors({});

        try {
            const mutation = isVerified ? setPasswordMutation : resetPasswordMutation;
            const response = await mutation.mutateAsync({
                token: token!,
                password: form.password.trim(),
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
                icon: '🔒',
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
        <div
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
                <h1 className='text-2xl font-normal text-center text-white sm:text-3xl font-heading'>
                    Create New Password
                </h1>
                <p className='text-sm font-light text-center text-white/70'>
                    Your new password must be different from previously used passwords.
                </p>
                <form onSubmit={handleSubmit} className='mt-4 space-y-4 sm:mt-6'>
                    <div className='space-y-1'>
                        <label htmlFor='password' className='block text-xs font-light text-white uppercase font-body'>
                            New Password
                        </label>
                        <div className='relative'>
                            <Input
                                id='password'
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={e =>
                                    setForm((prev: NewPasswordSchema) => ({ ...prev, password: e.target.value }))
                                }
                                placeholder='***********************'
                                disabled={isLoading}
                                className={cn(
                                    'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light pr-10',
                                    errors.password && 'border-red-500 focus-visible:ring-red-500',
                                    isLoading && 'opacity-50',
                                )}
                                aria-label='Password'
                            />
                            <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                disabled={isLoading}
                                onClick={() => setShowPassword(!showPassword)}
                                className={cn(
                                    'absolute top-0 right-0 h-full px-3 text-white/70 hover:text-white hover:bg-transparent',
                                    isLoading && 'opacity-50',
                                )}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                            </Button>
                        </div>
                        {errors.password && <p className='mt-1 text-xs text-red-500'>{errors.password}</p>}
                    </div>

                    <div className='space-y-1'>
                        <label
                            htmlFor='confirmPassword'
                            className='block text-xs font-light text-white uppercase font-body'
                        >
                            Confirm New Password
                        </label>
                        <div className='relative'>
                            <Input
                                id='confirmPassword'
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={e =>
                                    setForm((prev: NewPasswordSchema) => ({ ...prev, confirmPassword: e.target.value }))
                                }
                                placeholder='***********************'
                                disabled={isLoading}
                                className={cn(
                                    'bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light pr-10',
                                    errors.confirmPassword && 'border-red-500 focus-visible:ring-red-500',
                                    isLoading && 'opacity-50',
                                )}
                                aria-label='Confirm Password'
                            />
                            <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                disabled={isLoading}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={cn(
                                    'absolute top-0 right-0 h-full px-3 text-white/70 hover:text-white hover:bg-transparent',
                                    isLoading && 'opacity-50',
                                )}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                            </Button>
                        </div>
                        {errors.confirmPassword && (
                            <p className='mt-1 text-xs text-red-500'>{errors.confirmPassword}</p>
                        )}
                    </div>

                    <Button
                        type='submit'
                        disabled={isLoading}
                        className={cn(
                            'w-full p-5 text-base font-normal uppercase bg-primary hover:bg-primary/90 font-body',
                            isLoading && 'opacity-50',
                        )}
                        aria-label='Reset Password'
                    >
                        {isLoading ? (
                            <div className='flex items-center justify-center space-x-1'>
                                <p className='font-normal text-white uppercase'>Updating Password</p>
                                <Loader2 className='w-4 h-4 mr-2 text-white animate-spin' size={16} strokeWidth={1.5} />
                            </div>
                        ) : (
                            <span className='font-normal text-white'>Update Password</span>
                        )}
                    </Button>
                </form>
                <div className='space-y-2 text-center'>
                    <div className='text-[10px] text-white font-light flex flex-row items-center space-x-1 justify-center'>
                        <p className='font-body uppercase text-[10px] text-white'>Remember your password?</p>
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
        </div>
    );
};

export default NewPasswordPage;
