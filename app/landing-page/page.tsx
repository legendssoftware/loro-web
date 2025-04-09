'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Menu, LogIn, User, Download, Smartphone } from 'lucide-react';
import { ThemeToggler } from '@/modules/navigation/theme.toggler';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { PageTransition } from '@/components/animations/page-transition';
import { FloatingCallButton } from '@/components/navigation/floating-call-button';

const LandingPage: React.FunctionComponent = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    // Handle account button click - directs to dashboard if logged in, sign-in if not
    const handleAccountClick = () => {
        if (isAuthenticated) {
            router.push('/');
        } else {
            router.push('/sign-in');
        }
    };

    return (
        <PageTransition type="fade">
            <div className="relative flex flex-col min-h-screen bg-background">
                {/* Navigation */}
                <nav className="relative flex items-center justify-between p-6">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link
                            href="/"
                            className="text-xl tracking-tight uppercase font-body"
                        >
                            <span>LORO CRM</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation - Hidden on mobile */}
                    <div className="items-center hidden space-x-6 md:flex">
                        <ThemeToggler />
                        <Button
                            className="text-xs font-normal text-white uppercase transition-colors bg-primary font-body hover:bg-primary/80"
                            onClick={handleAccountClick}
                        >
                            {isAuthenticated ? (
                                <>
                                    <User className="w-4 h-4 mr-2" />
                                    <span>Dashboard</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex items-center md:hidden">
                        <ThemeToggler />
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Open Menu"
                            className="p-0 ml-2"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        {/* Mobile Menu */}
                        {isMenuOpen && (
                            <div className="absolute top-0 left-0 z-50 w-full p-4 mt-16 bg-background">
                                <div className="p-4 space-y-4 border rounded-md shadow-lg border-border">
                                    <div className="flex flex-col space-y-3">
                                        <Button
                                            className="justify-start w-full text-xs font-normal text-white uppercase transition-colors bg-primary font-body hover:bg-primary/80"
                                            onClick={handleAccountClick}
                                        >
                                            {isAuthenticated ? (
                                                <>
                                                    <User className="w-4 h-4 mr-2" />
                                                    <span>Dashboard</span>
                                                </>
                                            ) : (
                                                <>
                                                    <LogIn className="w-4 h-4 mr-2" />
                                                    <span>Sign In</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full"
                    >
                        <h1 className="max-w-3xl mx-auto text-4xl font-normal uppercase md:text-5xl lg:text-6xl font-body">
                            Unified Business Platform That Works Anywhere
                        </h1>
                        <p className="max-w-2xl mx-auto mt-6 text-xs uppercase text-muted-foreground font-body">
                            A comprehensive enterprise resource planning and
                            customer relationship management system that works
                            seamlessly online and offline, providing maximum
                            flexibility for field and office staff
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative flex items-center justify-center w-full mt-16 max-w-7xl"
                    >
                        <div className="relative w-full aspect-[16/9] flex items-center justify-center">
                            <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-background to-transparent" />

                            {/* Dashboard/Web View */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src="/web.png"
                                    alt="LORO CRM Dashboard Interface"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </motion.div>

                            {/* Mobile View - Hidden on mobile, visible on larger screens */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="absolute hidden xl:block -right-4 -bottom-10 w-[200px] h-[400px] lg:w-[300px] lg:h-[600px] xl:w-[320px] xl:h-[650px] lg:-right-10 lg:-bottom-16 z-20"
                            >
                                <div className="relative w-full h-full drop-shadow-2xl">
                                    <Image
                                        src="/mobile.png"
                                        alt="LORO CRM Mobile App Interface"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </motion.div>

                            {/* Decorative Elements */}
                            <div className="absolute w-32 h-32 rounded-full top-1/4 left-1/4 bg-primary/10 blur-3xl" />
                            <div className="absolute w-32 h-32 rounded-full bottom-1/4 right-1/4 bg-primary/10 blur-3xl" />
                        </div>
                    </motion.div>

                    {/* Responsive adjustments for dashboard image */}
                    <style jsx global>{`
                        @media (max-width: 768px) {
                            .aspect-[16/9] {
                                aspect-ratio: 4/3;
                            }
                        }
                        @media (min-width: 769px) and (max-width: 1024px) {
                            .aspect-[16/9] {
                                aspect-ratio: 16/10;
                            }
                        }
                    `}</style>
                </section>

                {/* Mobile App Download Section */}
                <section className="py-16 bg-gradient-to-r from-background to-background/90">
                    <div className="container px-4 mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col items-center justify-center space-y-8 text-center"
                        >
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                                <Smartphone className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="max-w-2xl text-2xl font-normal uppercase md:text-3xl font-body">
                                Get LORO CRM on Your Mobile Device
                            </h2>
                            <p className="max-w-xl mx-auto text-xs uppercase text-muted-foreground font-body">
                                Experience the full power of LORO CRM on the go
                                with our mobile application. Currently available
                                for Android devices, with iOS support coming
                                soon.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <a
                                    href="https://storage.googleapis.com/crmapplications/resources/apk.apk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                >
                                    <Button className="px-8 py-6 text-xs font-normal text-white uppercase transition-colors bg-primary hover:bg-primary/90 font-body">
                                        <Download className="w-4 h-4 mr-2" />
                                        <span>Download Android APK</span>
                                    </Button>
                                </a>
                                <Button
                                    disabled
                                    className="px-8 py-6 text-xs font-normal uppercase transition-colors cursor-not-allowed bg-muted/50 hover:bg-muted/50 text-muted-foreground font-body"
                                >
                                    <span>iOS Version Coming Soon</span>
                                </Button>
                            </div>
                            <p className="text-[10px] uppercase text-muted-foreground/70 font-body">
                                For Android devices running Android 5.0 or
                                newer. Enable installation from unknown sources
                                in your device settings to install.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12">
                    <div className="container px-4 mx-auto">
                        <div className="grid gap-8 text-center md:text-left md:grid-cols-4">
                            <div className="md:col-span-1">
                                <span className="text-xl tracking-tight uppercase font-body">
                                    LORO CRM
                                </span>
                                <div className="mt-4 text-xs uppercase text-muted-foreground font-body">
                                    <span className="text-[10px] uppercase font-body">
                                        Comprehensive ERP & CRM system for
                                        modern businesses with seamless online
                                        and offline operations
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h4 className="mb-4 text-xs font-normal uppercase font-body">
                                    Platform
                                </h4>
                                <ul className="space-y-2 text-xs uppercase text-muted-foreground font-body">
                                    <li>
                                        <Link
                                            href="#features"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Web Dashboard
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#solutions"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Mobile App
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/pricing"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                API & Integration
                                            </span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 text-xs font-normal uppercase font-body">
                                    Resources
                                </h4>
                                <ul className="space-y-2 text-xs uppercase text-muted-foreground font-body">
                                    <li>
                                        <Link
                                            href="/docs"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Documentation
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/api"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                API Reference
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/contact"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Support Center
                                            </span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 text-xs font-normal uppercase font-body">
                                    Company
                                </h4>
                                <ul className="space-y-2 text-xs uppercase text-muted-foreground font-body">
                                    <li>
                                        <Link
                                            href="/about"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                About
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/blog"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Blog
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/contact"
                                            className="transition-colors hover:text-primary"
                                        >
                                            <span className="text-[10px] uppercase font-body">
                                                Contact Us
                                            </span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-between pt-8 mt-8 text-center border-t md:flex-row md:text-left">
                            <div className="text-xs text-muted-foreground font-body">
                                <span className="text-[10px] uppercase font-body">
                                    © 2024 LORO CRM. All rights reserved.
                                </span>
                            </div>
                            <div className="flex gap-4 mt-4 md:mt-0">
                                <Link
                                    href="#"
                                    className="text-[10px] uppercase transition-colors text-muted-foreground hover:text-primary font-body"
                                >
                                    <span>Privacy Policy</span>
                                </Link>
                                <Link
                                    href="#"
                                    className="text-[10px] uppercase transition-colors text-muted-foreground hover:text-primary font-body"
                                >
                                    <span>Terms of Service</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Floating Call Button */}
                <FloatingCallButton
                    position="bottom-right"
                    offset={32}
                    showOnScroll={true}
                />
            </div>
        </PageTransition>
    );
};

export default LandingPage;
