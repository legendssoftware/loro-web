'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { cn } from "@/lib/utils"

const VerifyOTPPage = () => {
    return (
        <div
            className="relative flex items-center justify-center min-h-screen p-4"
            style={{
                backgroundImage: 'url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat'
            }}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative w-full max-w-md p-6 space-y-4 shadow-lg sm:p-8 sm:space-y-6 bg-white/10 backdrop-blur-lg rounded-xl">
                <h1 className="text-2xl font-normal text-center text-white uppercase sm:text-3xl font-heading">
                    Verify OTP
                </h1>
                <form  className="mt-4 space-y-4 sm:mt-6">
                    <div className="space-y-1">
                        <label htmlFor="otp" className="block text-xs font-light text-white uppercase font-body">
                            OTP
                        </label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            className={cn(
                                "bg-white/10 border-white/20 text-white placeholder:text-white/50 font-light",
                            )}
                            aria-label="OTP"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full p-5 text-base font-normal uppercase bg-primary hover:bg-primary/90 font-body"
                        aria-label="Verify OTP">
                        <span className="font-normal text-white">Verify OTP</span>
                    </Button>
                </form>
                <div className="space-y-2 text-center">
                    <div className="text-[10px] text-white font-light flex flex-row items-center space-x-1 justify-center">
                        <p className="font-body uppercase text-[10px] text-white">Didn&apos;t receive an OTP?</p>
                        <Link
                            href="/sign-in"
                            className="text-white hover:text-white/80 font-normal uppercase font-body text-[10px]"
                            tabIndex={0}>
                            Resend OTP
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyOTPPage
