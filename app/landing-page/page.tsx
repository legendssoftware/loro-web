'use client'

import { motion } from 'framer-motion';

const AnimatedSection = ({ children, index }: { children: React.ReactNode; index: number }) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.8,
                delay: index * 0.2,
                ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="h-screen w-full snap-start flex items-center justify-center flex-col gap-6"
        >
            {children}
        </motion.section>
    );
};

export default function Index() {
    return (
        <main className="w-full h-screen snap-y snap-mandatory overflow-y-scroll">
            <AnimatedSection index={0}>
                <motion.h1
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl font-bold uppercase font-body">
                    Hero Section
                </motion.h1>
            </AnimatedSection>
            <AnimatedSection index={1}>
                <h2 className="text-5xl font-bold font-body uppercase">One</h2>
            </AnimatedSection>
            <AnimatedSection index={2}>
                <h2 className="text-5xl font-bold font-body uppercase">Two</h2>
            </AnimatedSection>
            <AnimatedSection index={3}>
                <h2 className="text-5xl font-bold font-body uppercase">Three</h2>
            </AnimatedSection>
            <AnimatedSection index={4}>
                <h2 className="text-5xl font-bold font-body uppercase">Partners</h2>
            </AnimatedSection>
            <AnimatedSection index={5}>
                <h2 className="text-5xl font-bold font-body uppercase">Pricing</h2>
            </AnimatedSection>
            <AnimatedSection index={6}>
                <h2 className="text-5xl font-bold font-body uppercase">Contact</h2>
            </AnimatedSection>
            <motion.footer
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                    duration: 0.8,
                    delay: 1.4,
                    ease: [0.43, 0.13, 0.23, 0.96]
                }}
                className="h-screen w-full snap-start flex items-center justify-center flex-col gap-6">
                <h2 className="text-5xl font-bold font-body uppercase">Footer</h2>
            </motion.footer>
        </main>
    );
}
