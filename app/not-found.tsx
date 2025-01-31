'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSessionStore } from "@/store/use-session-store"

export default function NotFound() {
    const router = useRouter()
    const { isAuthenticated } = useSessionStore()

    const handleReturn = () => {
        router.push(isAuthenticated ? '/' : '/landing-page')
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen w-full flex flex-col items-center justify-center bg-background p-4"
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut"
                }}
                className="flex flex-col items-center justify-center gap-6 max-w-md text-center"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-9xl font-bold font-heading text-primary"
                >
                    oops!
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs uppercase text-card-foreground font-body"
                >
                    The page you are looking for could not be found.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Button
                        onClick={handleReturn}
                        className="bg-primary hover:bg-primary px-6 py-1 text-white font-body uppercase text-xs"
                    >
                        Return Home
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    )
} 