'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { cn } from "@/lib/utils"
import { newPasswordSchema } from '@/lib/schemas/auth'

type NewPasswordSchema = z.infer<typeof newPasswordSchema>

const NewPasswordPage = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { isLoading, setIsLoading, reset } = useAuthStore()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewPasswordSchema>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })

    const handleNewPassword = async (data: NewPasswordSchema) => {
        setIsLoading(true)

        try {
            console.log('New password attempt:', {
                password: data.password,
                confirmPassword: data.confirmPassword
            })

            await new Promise(resolve => setTimeout(resolve, 2000))
            reset()
            router.push('/sign-in')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{
                backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat'
            }}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="w-full max-w-md p-6 sm:p-8 space-y-4 sm:space-y-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg relative">
                <h1 className="text-2xl sm:text-3xl font-normal text-center text-white font-heading">
                    Create New Password
                </h1>
                <p className="text-white/70 text-center text-sm font-light">
                    Your new password must be different from previously used passwords.
                </p>
                <form onSubmit={handleSubmit(handleNewPassword)} className="space-y-4 mt-4 sm:mt-6">
                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-xs font-light text-white font-body uppercase">
                            New Password
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                {...register('password')}
                                placeholder="***********************"
                                className={cn(
                                    "bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light pr-10",
                                    errors.password && "border-red-500 focus-visible:ring-red-500"
                                )}
                                aria-label="Password"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="confirmPassword" className="block text-xs font-light text-white font-body uppercase">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                {...register('confirmPassword')}
                                placeholder="***********************"
                                className={cn(
                                    "bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light pr-10",
                                    errors.confirmPassword && "border-red-500 focus-visible:ring-red-500"
                                )}
                                aria-label="Confirm Password"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 p-5 text-base font-normal font-body uppercase"
                        disabled={isLoading}
                        aria-label="Reset Password">
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-1 text-white">
                                <p className="text-white font-normal uppercase">Updating Password</p>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            </div>
                        ) : (
                            <span className="font-normal text-white">Update Password</span>
                        )}
                    </Button>
                </form>
                <div className="text-center space-y-2">
                    <div className="text-[10px] text-white font-light flex flex-row items-center space-x-1 justify-center">
                        <p className="font-body uppercase text-[10px] text-white">Remember your password?</p>
                        <Link
                            href="/sign-in"
                            className="text-white hover:text-white/80 font-normal uppercase font-body text-[10px]"
                            tabIndex={0}>
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewPasswordPage
