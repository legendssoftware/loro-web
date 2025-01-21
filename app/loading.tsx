'use client'

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen w-full flex flex-col items-center justify-center bg-background"
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut"
                }}
                className="flex flex-col items-center justify-center gap-4"
            >
                <Loader2 className="animate-spin text-primary" strokeWidth={1.5} size={50} />
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: 0.2,
                        duration: 0.5,
                        ease: "easeOut"
                    }}
                    className="text-sm font-body uppercase text-muted-foreground"
                >
                    Loading...
                </motion.p>
            </motion.div>
        </motion.div>
    )
} 