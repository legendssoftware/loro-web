'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/useAuthStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { cn } from "@/lib/utils"
import { signUpSchema } from '@/lib/schemas/auth'

type SignUpSchema = z.infer<typeof signUpSchema>

const SignUpPage = () => {
    const { isLoading, setIsLoading, reset } = useAuthStore()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: '',
        },
    })

    const handleSignUp = async (data: SignUpSchema) => {
        setIsLoading(true)

        try {
            console.log('Sign up attempt:', {
                email: data.email
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
                <h1 className="text-2xl sm:text-3xl font-normal text-center text-white font-heading uppercase">
                    Claim Account
                </h1>
                <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4 mt-4 sm:mt-6">
                    <div className="space-y-1">
                        <label htmlFor="email" className="block text-xs font-light text-white font-body uppercase">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="jdoe@gmail.com"
                            className={cn(
                                "bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light",
                                errors.email && "border-red-500 focus-visible:ring-red-500"
                            )}
                            aria-label="Email"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 p-5 text-base font-normal font-body uppercase"
                        disabled={isLoading}
                        aria-label="Sign Up">
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-1">
                                <p className="text-white font-normal uppercase">Processing</p>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            </div>
                        ) : (
                            <span className="font-normal">Claim Account</span>
                        )}
                    </Button>
                </form>
                <div className="text-center space-y-2">
                    <div className="text-[10px] text-white font-light flex flex-row items-center space-x-1 justify-center">
                        <p className="font-body uppercase text-[10px]">Already have an account?</p>
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

export default SignUpPage 