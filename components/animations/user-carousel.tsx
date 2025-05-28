'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface UserProfile {
    name: string;
    position: string;
    company: string;
    location: string;
    avatar: string;
    industry: string;
}

interface UserCarouselProps {
    users: UserProfile[];
    interval?: number;
    className?: string;
}

export function UserCarousel({
    users,
    interval = 4000,
    className = '',
}: UserCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % users.length);
        }, interval);

        return () => clearInterval(timer);
    }, [users.length, interval]);

    const currentUser = users[currentIndex];

    if (!currentUser) return null;

    return (
        <div className={`relative ${className}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="p-4 border rounded-lg shadow-sm bg-card"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <motion.div
                            className="flex items-center justify-center w-10 h-10 font-bold rounded-full bg-primary/10 text-primary text-[10px] uppercase font-body"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            {currentUser.avatar}
                        </motion.div>
                        <div className="flex-1">
                            <motion.div
                                className="text-xs font-medium uppercase font-body"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.3 }}
                            >
                                {currentUser.name}
                            </motion.div>
                            <motion.div
                                className="text-[10px] font-normal uppercase text-muted-foreground font-body"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.3 }}
                            >
                                {currentUser.position}
                            </motion.div>
                            <motion.div
                                className="text-[10px] font-normal uppercase text-muted-foreground font-body"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                            >
                                {currentUser.company} • {currentUser.location}
                            </motion.div>
                        </div>
                    </div>

                    {/* Industry tag */}
                    <motion.div
                        className="inline-flex items-center px-2 py-1 text-[10px] font-normal rounded-full bg-primary/5 text-primary uppercase font-body"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                    >
                        {currentUser.industry}
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Progress indicator */}
            <div className="flex justify-center gap-1 mt-3">
                {users.map((_, index) => (
                    <motion.div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-300 ${
                            index === currentIndex
                                ? 'bg-primary w-8'
                                : 'bg-primary/20 w-2'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.2 }}
                    />
                ))}
            </div>
        </div>
    );
}
