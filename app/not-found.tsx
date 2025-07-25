'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { PageTransition } from '@/components/animations/page-transition';

export default function NotFound() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    const handleReturn = () => {
        router.push(isAuthenticated ? '/' : '/landing-page');
    };

    return (
        <PageTransition type="fade">
            <div className='flex flex-col items-center justify-center w-full h-screen p-4 bg-background'>
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        ease: 'easeOut',
                    }}
                    className='flex flex-col items-center justify-center max-w-md gap-6 text-center'
                >
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className='font-bold text-9xl font-heading text-primary'
                    >
                        oops!
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className='text-xs font-normal uppercase text-card-foreground font-body'
                    >
                        The page you are looking for could not be found.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <Button
                            onClick={handleReturn}
                            className='px-6 py-1 text-[10px] uppercase text-white bg-primary hover:bg-primary font-body'
                        >
                            Return Home
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </PageTransition>
    );
}
