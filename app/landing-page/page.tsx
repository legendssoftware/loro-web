'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    Download,
    ClipboardList,
    Users,
    Package,
    Store,
    CheckSquare,
    Cloud,
    Check,
    CreditCard,
    Building2,
    Menu,
} from 'lucide-react';
import { ThemeToggler } from '@/modules/navigation/theme.toggler';
import router from 'next/router';
import { useState } from 'react';
import { itemVariants, containerVariants } from '@/lib/utils/animations';
import { pricingPlans } from '@/data/app-data';

const LandingPage: React.FunctionComponent = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className='relative flex flex-col min-h-screen bg-background'>
            {/* Navigation */}
            <nav className='relative flex items-center justify-between p-6'>
                {/* Logo */}
                <div className='flex items-center'>
                    <Link href='/' className='text-xl tracking-tight uppercase font-body'>
                        LORO CRM
                    </Link>
                </div>

                {/* Desktop Navigation - Hidden on mobile */}
                <div className='items-center hidden space-x-6 md:flex'>
                    <Link href='#features' className='text-xs uppercase transition-colors hover:text-primary font-body'>
                        Features
                    </Link>
                    <Link
                        href='#solutions'
                        className='text-xs uppercase transition-colors hover:text-primary font-body'
                    >
                        Solutions
                    </Link>
                    <ThemeToggler />
                    <Link href='/sign-in'>
                        <Button className='text-xs font-normal text-white uppercase transition-colors bg-primary font-body hover:bg-primary/80'>
                            My Account
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Button - Visible only on mobile */}
                <div className='flex items-center space-x-4 md:hidden'>
                    <ThemeToggler />
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className='md:hidden'
                    >
                        <Menu className='w-6 h-6' />
                    </Button>
                </div>

                {/* Mobile Menu - Centered with overlay */}
                {isMenuOpen && (
                    <>
                        {/* Overlay */}
                        <div
                            className='fixed inset-0 z-40 bg-background/80 backdrop-blur-sm'
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Centered Menu */}
                        <div className='fixed inset-0 z-50 flex items-center justify-center'>
                            <div className='w-full max-w-sm p-6 mx-4 shadow-lg bg-card rounded-xl'>
                                <div className='flex flex-col items-center space-y-6'>
                                    <Link
                                        href='#features'
                                        className='text-xs font-normal uppercase transition-colors hover:text-primary font-body'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href='#solutions'
                                        className='text-xs font-normal uppercase transition-colors hover:text-primary font-body'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Solutions
                                    </Link>
                                    <Link href='/sign-in' onClick={() => setIsMenuOpen(false)} className='w-full'>
                                        <Button className='w-full text-xs text-white uppercase transition-colors bg-primary font-body hover:bg-primary/80'>
                                            My Account
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </nav>

            {/* Hero Section */}
            <section className='flex flex-col items-center justify-center px-4 py-20 text-center'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className='w-full'
                >
                    <h1 className='max-w-3xl mx-auto text-4xl font-normal uppercase md:text-5xl lg:text-6xl font-body'>
                        Enterprise-Grade CRM Solution
                    </h1>
                    <p className='max-w-2xl mx-auto mt-6 text-xs uppercase text-muted-foreground font-body'>
                        Streamline your business operations with our comprehensive mobile-first platform for claims,
                        quotations, and staff management
                    </p>
                    <div className='flex flex-row justify-center gap-4 mt-8'>
                        <Button
                            className='h-12 xs:text-[8px] text-xs text-white uppercase transition-colors bg-primary font-body hover:bg-primary/80 font-normal'
                            onClick={() => router.push('/sign-up')}
                        >
                            Start Free Trial
                        </Button>
                        <Button
                            variant='outline'
                            className='h-12 text-xs font-normal uppercase transition-colors font-body hover:bg-primary hover:text-white'
                            onClick={() => router.push('/schedule-demo')}
                        >
                            Schedule Demo
                        </Button>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className='relative flex items-center justify-center w-full mt-16 max-w-7xl'
                >
                    <div className='relative w-full aspect-[16/9] flex items-center justify-center'>
                        <div className='absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-background to-transparent' />

                        {/* Dashboard/Web View */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className='relative w-full h-full'
                        >
                            <Image
                                src='/web.png'
                                alt='LORO CRM Dashboard Interface'
                                fill
                                className='object-contain'
                                priority
                            />
                        </motion.div>

                        {/* Mobile View - Hidden on mobile, visible on larger screens */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className='absolute hidden xl:block -right-4 -bottom-10 w-[200px] h-[400px] lg:w-[300px] lg:h-[600px] xl:w-[320px] xl:h-[650px] lg:-right-10 lg:-bottom-16 z-20'
                        >
                            <div className='relative w-full h-full drop-shadow-2xl'>
                                <Image
                                    src='/mobile.png'
                                    alt='LORO CRM Mobile App Interface'
                                    fill
                                    className='object-contain'
                                    priority
                                />
                            </div>
                        </motion.div>

                        {/* Decorative Elements */}
                        <div className='absolute w-32 h-32 rounded-full top-1/4 left-1/4 bg-primary/10 blur-3xl' />
                        <div className='absolute w-32 h-32 rounded-full bottom-1/4 right-1/4 bg-primary/10 blur-3xl' />
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

            {/* Features Showcase Section */}
            <section id='features' className='w-full py-20 bg-accent/5'>
                <motion.div
                    variants={containerVariants}
                    initial='hidden'
                    animate='show'
                    className='container px-4 mx-auto'
                >
                    <h2 className='text-3xl font-normal text-center uppercase font-body'>Manage Your Business</h2>
                    <div className='grid grid-cols-1 gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3'>
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-shadow bg-card rounded-xl hover:shadow-lg'
                        >
                            <ClipboardList className='w-8 h-8 text-primary' />
                            <h3 className='mt-4 text-lg font-normal uppercase font-body'>Real-Time Task Management</h3>
                            <p className='mt-2 text-xs text-muted-foreground font-body'>
                                Create, track, and update tasks with instant notifications and status changes
                            </p>
                        </motion.div>
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-shadow bg-card rounded-xl hover:shadow-lg'
                        >
                            <Users className='w-8 h-8 text-primary' />
                            <h3 className='mt-4 text-lg font-normal uppercase font-body'>Staff Management</h3>
                            <p className='mt-2 text-xs text-muted-foreground font-body'>
                                Efficiently manage your team, track performance, and handle staff documentation
                            </p>
                        </motion.div>
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-shadow bg-card rounded-xl hover:shadow-lg'
                        >
                            <Package className='w-8 h-8 text-primary' />
                            <h3 className='mt-4 text-lg font-normal uppercase font-body'>Quotation Processing</h3>
                            <p className='mt-2 text-xs text-muted-foreground font-body'>
                                Streamline your quotation workflow with automated processing and tracking
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Success Metrics Section */}
            <section className='w-full py-20'>
                <motion.div
                    variants={containerVariants}
                    initial='hidden'
                    animate='show'
                    className='container px-4 mx-auto'
                >
                    <h2 className='text-3xl font-normal text-center uppercase font-body'>Impact on Your Business</h2>
                    <div className='grid grid-cols-1 gap-8 mt-12 md:grid-cols-3'>
                        <motion.div variants={itemVariants} className='p-6 text-center'>
                            <p className='text-4xl font-normal text-primary font-body'>99.9%</p>
                            <p className='mt-2 text-xs uppercase text-muted-foreground font-body'>Uptime</p>
                            <p className='mt-1 text-xs font-body'>Enterprise-grade reliability</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className='p-6 text-center'>
                            <p className='text-4xl font-normal text-primary font-body'>60%</p>
                            <p className='mt-2 text-xs uppercase text-muted-foreground font-body'>Time Saved</p>
                            <p className='mt-1 text-xs font-body'>In task management</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className='p-6 text-center'>
                            <p className='text-4xl font-normal text-primary font-body'>45%</p>
                            <p className='mt-2 text-xs uppercase text-muted-foreground font-body'>Productivity Boost</p>
                            <p className='mt-1 text-xs font-body'>Team efficiency increase</p>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Use Case Showcase */}
            <section className='w-full py-20 bg-accent/5'>
                <motion.div
                    variants={containerVariants}
                    initial='hidden'
                    animate='show'
                    className='container px-4 mx-auto'
                >
                    <h2 className='text-3xl font-normal text-center uppercase font-body'>Perfect For Every Team</h2>
                    <div className='grid grid-cols-1 gap-8 mt-12 md:grid-cols-2'>
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-shadow bg-card rounded-xl hover:shadow-lg'
                        >
                            <Building2 className='w-8 h-8 text-primary' />
                            <h3 className='mt-4 text-lg font-normal uppercase font-body'>Enterprise Teams</h3>
                            <p className='mt-2 text-xs text-muted-foreground font-body'>
                                Scale your operations with unlimited users and custom workflows
                            </p>
                            <ul className='mt-4 space-y-2'>
                                <li className='flex items-center text-xs font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' />
                                    Multi-branch management
                                </li>
                                <li className='flex items-center text-xs font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' />
                                    Custom integrations
                                </li>
                                <li className='flex items-center text-xs font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' />
                                    Advanced analytics
                                </li>
                            </ul>
                        </motion.div>
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-shadow bg-card rounded-xl hover:shadow-lg'
                        >
                            <Store className='w-8 h-8 text-primary' />
                            <h3 className='mt-4 text-lg font-normal uppercase font-body'>Growing Businesses</h3>
                            <p className='mt-2 text-xs text-muted-foreground font-body'>
                                Optimize your operations with scalable solutions
                            </p>
                            <ul className='mt-4 space-y-2'>
                                <li className='flex items-center text-xs font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' />
                                    Automated workflows
                                </li>
                                <li className='flex items-center text-xs font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' />
                                    Real-time reporting
                                </li>
                                <li className='flex items-center text-xs font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' />
                                    Team collaboration
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Call-to-Action Section */}
            <section className='w-full py-20'>
                <motion.div
                    variants={containerVariants}
                    initial='hidden'
                    animate='show'
                    className='container px-4 mx-auto'
                >
                    <div className='p-8 text-center bg-primary rounded-xl'>
                        <h2 className='text-3xl font-normal text-white uppercase font-body'>
                            Start Optimizing Your Business Today
                        </h2>
                        <p className='mt-4 text-xs uppercase text-white/80 font-body'>
                            Join thousands of businesses already using LORO CRM
                        </p>
                        <Button
                            className='h-12 mt-8 text-xs font-normal uppercase transition-colors bg-white text-primary font-body hover:bg-white/90'
                            onClick={() => router.push('/sign-up')}
                        >
                            Start Free Trial
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id='features' className='py-20 bg-muted/30'>
                <div className='container px-4 mx-auto'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className='max-w-3xl mx-auto mb-16 text-center'
                    >
                        <h2 className='mb-4 text-2xl font-normal uppercase md:text-3xl lg:text-4xl font-body'>
                            Comprehensive Business Management Suite
                        </h2>
                        <p className='text-xs uppercase text-muted-foreground font-body'>
                            Everything you need to streamline your operations and scale your business
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial='hidden'
                        whileInView='show'
                        viewport={{ once: true }}
                        className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'
                    >
                        {/* Claims Management */}
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-all bg-card rounded-xl hover:shadow-lg'
                        >
                            <div className='flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10'>
                                <ClipboardList className='w-6 h-6 text-primary' />
                            </div>
                            <h3 className='mb-2 text-lg font-normal uppercase font-body'>Claims Management</h3>
                            <p className='text-xs uppercase text-muted-foreground font-body'>
                                Streamlined claims processing with automated workflows, document management, and
                                real-time tracking
                            </p>
                            <ul className='mt-4 space-y-2'>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Automated Processing
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Document Management
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Status Tracking
                                </li>
                            </ul>
                        </motion.div>

                        {/* Lead Management */}
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-all bg-card rounded-xl hover:shadow-lg'
                        >
                            <div className='flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10'>
                                <Users className='w-6 h-6 text-primary' />
                            </div>
                            <h3 className='mb-2 text-lg font-normal uppercase font-body'>Lead Management</h3>
                            <p className='text-xs uppercase text-muted-foreground font-body'>
                                Capture and nurture leads with automated follow-ups and conversion tracking
                            </p>
                            <ul className='mt-4 space-y-2'>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Lead Scoring
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Automated Follow-ups
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Pipeline Analytics
                                </li>
                            </ul>
                        </motion.div>

                        {/* Merchandise Management */}
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-all bg-card rounded-xl hover:shadow-lg'
                        >
                            <div className='flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10'>
                                <Package className='w-6 h-6 text-primary' />
                            </div>
                            <h3 className='mb-2 text-lg font-normal uppercase font-body'>Merchandise Control</h3>
                            <p className='text-xs uppercase text-muted-foreground font-body'>
                                Complete merchandise management with inventory tracking and analytics
                            </p>
                            <ul className='mt-4 space-y-2'>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Stock Management
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Product Cataloging
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Sales Analytics
                                </li>
                            </ul>
                        </motion.div>

                        {/* Online Store */}
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-all bg-card rounded-xl hover:shadow-lg'
                        >
                            <div className='flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10'>
                                <Store className='w-6 h-6 text-primary' />
                            </div>
                            <h3 className='mb-2 text-lg font-normal uppercase font-body'>Online Store</h3>
                            <p className='text-xs uppercase text-muted-foreground font-body'>
                                Integrated e-commerce solution with payment processing and order management
                            </p>
                            <ul className='mt-4 space-y-2'>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Payment Integration
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Order Tracking
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Customer Portal
                                </li>
                            </ul>
                        </motion.div>

                        {/* Task Management */}
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-all bg-card rounded-xl hover:shadow-lg'
                        >
                            <div className='flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10'>
                                <CheckSquare className='w-6 h-6 text-primary' />
                            </div>
                            <h3 className='mb-2 text-lg font-normal uppercase font-body'>Advanced Task Management</h3>
                            <p className='text-xs uppercase text-muted-foreground font-body'>
                                Comprehensive task management with automation and team collaboration
                            </p>
                            <ul className='mt-4 space-y-2'>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Team Assignment
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Progress Tracking
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Automated Workflows
                                </li>
                            </ul>
                        </motion.div>

                        {/* Enterprise Communication */}
                        <motion.div
                            variants={itemVariants}
                            className='p-6 transition-all bg-card rounded-xl hover:shadow-lg'
                        >
                            <div className='flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary/10'>
                                <Cloud className='w-6 h-6 text-primary' />
                            </div>
                            <h3 className='mb-2 text-lg font-normal uppercase font-body'>Enterprise Communication</h3>
                            <p className='text-xs uppercase text-muted-foreground font-body'>
                                Unified communication platform with real-time notifications and team collaboration
                            </p>
                            <ul className='mt-4 space-y-2'>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Real-time Notifications
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Team Chat & Updates
                                </li>
                                <li className='flex items-center text-xs uppercase text-muted-foreground font-body'>
                                    <Check className='w-4 h-4 mr-2 text-primary' /> Document Sharing
                                </li>
                            </ul>
                        </motion.div>
                    </motion.div>

                    {/* Feature Summary */}
                    <motion.div
                        variants={itemVariants}
                        initial='hidden'
                        whileInView='show'
                        viewport={{ once: true }}
                        className='max-w-2xl p-6 mx-auto mt-16 text-center bg-primary/5 rounded-xl'
                    >
                        <h4 className='mb-2 text-sm font-normal uppercase font-body'>Enterprise-Grade Integration</h4>
                        <p className='text-xs uppercase text-muted-foreground font-body'>
                            A comprehensive suite of business tools working seamlessly together to power your
                            organization
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className='py-20 bg-muted/30'>
                <div className='container px-4 mx-auto'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className='max-w-3xl mx-auto mb-16 text-center'
                    >
                        <h2 className='mb-4 text-2xl font-normal uppercase md:text-3xl lg:text-4xl font-body'>
                            Choose Your Plan
                        </h2>
                        <p className='text-xs uppercase text-muted-foreground font-body'>
                            Flexible plans for businesses of all sizes
                        </p>
                    </motion.div>

                    {/* Pricing Plans */}
                    <motion.div
                        variants={containerVariants}
                        initial='hidden'
                        whileInView='show'
                        viewport={{ once: true }}
                        className='grid grid-cols-1 gap-8 mt-16 md:grid-cols-2 lg:grid-cols-4'
                    >
                        {pricingPlans.map(plan => (
                            <motion.div
                                key={plan.name}
                                variants={itemVariants}
                                className='relative p-8 text-center transition-all cursor-pointer bg-card rounded-xl hover:shadow-lg group'
                            >
                                {plan.isPopular && (
                                    <div className='absolute top-4 right-4'>
                                        <span className='px-3 py-1 text-xs uppercase rounded-full bg-primary/10 text-primary font-body'>
                                            Popular
                                        </span>
                                    </div>
                                )}
                                <div className='flex flex-col items-center gap-6'>
                                    <div className='flex items-center justify-center w-10 h-10'>
                                        <plan.icon className='w-6 h-6 text-primary' />
                                    </div>
                                    <div>
                                        <h3 className='text-lg font-normal uppercase font-body'>{plan.name}</h3>
                                        <p className='mt-1 text-xs uppercase text-muted-foreground font-body'>
                                            {plan.description}
                                        </p>
                                    </div>
                                    <div className='flex items-baseline gap-1'>
                                        <span className='text-4xl font-normal font-body'>{plan.price}</span>
                                        <span className='text-xs text-muted-foreground font-body'>/month</span>
                                    </div>
                                    <div className='flex flex-col items-center gap-4'>
                                        <p className='text-xs uppercase font-body'>Features</p>
                                        <ul className='space-y-4'>
                                            {plan.features.map((feature, featureIndex) => (
                                                <li
                                                    key={featureIndex}
                                                    className='flex items-center justify-center text-xs uppercase font-body'
                                                >
                                                    <Check className='w-4 h-4 mr-3 text-primary' />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Button
                                        variant='outline'
                                        className='w-full h-12 mt-4 text-xs uppercase transition-all group-hover:bg-primary group-hover:text-white'
                                    >
                                        {plan.buttonText}
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        initial='hidden'
                        whileInView='show'
                        viewport={{ once: true }}
                        className='max-w-xl p-6 mx-auto mt-16 text-center'
                    >
                        <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground font-body'>
                            <CreditCard className='w-4 h-4' />
                            All plans include 15-day grace period and 30-day renewal window
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Solutions Showcase */}
            <section id='solutions' className='py-20'>
                <div className='container px-4 mx-auto'>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className='mb-16 text-2xl font-normal text-center uppercase font-body'
                    >
                        Complete Business Management Suite
                    </motion.h2>
                    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='overflow-hidden bg-black rounded-xl'>
                            <Image
                                src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png'
                                alt='Efficient Claims Processing'
                                width={400}
                                height={300}
                                className='object-cover w-full h-48'
                            />
                            <div className='p-6'>
                                <h3 className='mb-2 text-sm font-normal text-white uppercase font-body'>
                                    Efficient Claims Processing
                                </h3>
                                <p className='text-xs text-gray-400 uppercase font-body'>
                                    Streamlined workflow management
                                </p>
                            </div>
                        </div>
                        <div className='overflow-hidden bg-black rounded-xl'>
                            <Image
                                src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png'
                                alt='Staff Management Dashboard'
                                width={400}
                                height={300}
                                className='object-cover w-full h-48'
                            />
                            <div className='p-6'>
                                <h3 className='mb-2 text-sm font-normal text-white uppercase font-body'>
                                    Complete Staff Overview
                                </h3>
                                <p className='text-xs text-gray-400 uppercase font-body'>
                                    Real-time performance tracking
                                </p>
                            </div>
                        </div>
                        <div className='overflow-hidden bg-black rounded-xl'>
                            <Image
                                src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rcRWmJ3wUamu61uy3uz2BHS5rxJP3t.png'
                                alt='Quotation System Interface'
                                width={400}
                                height={300}
                                className='object-cover w-full h-48'
                            />
                            <div className='p-6'>
                                <h3 className='mb-2 text-sm font-normal text-white uppercase font-body'>
                                    Professional Quotations
                                </h3>
                                <p className='text-xs text-gray-400 uppercase font-body'>Automated quote generation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='relative py-20 text-white bg-primary'>
                <div className='container px-4 mx-auto'>
                    <div className='max-w-2xl mx-auto'>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className='text-xs uppercase text-white/80 font-body'>TRY IT NOW</span>
                            <h2 className='mt-4 text-4xl font-normal tracking-tight uppercase font-body'>
                                Ready to Transform Your Business Operations?
                            </h2>
                            <p className='mt-4 text-xs uppercase text-white/80 font-body'>
                                Experience the power of LORO CRM with comprehensive features including claims
                                management, lead tracking, GPS monitoring, attendance tracking, and professional
                                quotation generation. All your business tools in one mobile-first platform.
                            </p>
                            <ul className='grid grid-cols-2 gap-3 mt-6'>
                                <li className='flex items-center text-xs uppercase text-white/80 font-body'>
                                    <Check className='w-4 h-4 mr-2 text-white/80' /> Claims Processing
                                </li>
                                <li className='flex items-center text-xs uppercase text-white/80 font-body'>
                                    <Check className='w-4 h-4 mr-2 text-white/80' /> Lead Management
                                </li>
                                <li className='flex items-center text-xs uppercase text-white/80 font-body'>
                                    <Check className='w-4 h-4 mr-2 text-white/80' /> GPS Tracking
                                </li>
                                <li className='flex items-center text-xs uppercase text-white/80 font-body'>
                                    <Check className='w-4 h-4 mr-2 text-white/80' /> Staff Monitoring
                                </li>
                                <li className='flex items-center text-xs uppercase text-white/80 font-body'>
                                    <Check className='w-4 h-4 mr-2 text-white/80' /> Quotation System
                                </li>
                                <li className='flex items-center text-xs uppercase text-white/80 font-body'>
                                    <Check className='w-4 h-4 mr-2 text-white/80' /> Real-time Analytics
                                </li>
                            </ul>
                            <div className='flex flex-col justify-center gap-4 mt-8 sm:flex-row'>
                                <Link href='/awesome0loro.apk' target='_blank' rel='noopener noreferrer' download>
                                    <Button
                                        variant='secondary'
                                        className='w-full h-12 text-xs uppercase transition-colors bg-white text-primary font-body hover:bg-white/90 sm:w-auto'
                                    >
                                        <Download className='w-4 h-4 mr-2' />
                                        Download App
                                    </Button>
                                </Link>
                                <Button
                                    variant='outline'
                                    className='w-full h-12 text-xs text-white uppercase transition-colors border-white font-body hover:bg-white/10 sm:w-auto'
                                    onClick={() => router.push('/sign-up')}
                                >
                                    Get Started
                                    <span className='ml-2'>↗</span>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className='py-12'>
                <div className='container px-4 mx-auto'>
                    <div className='grid gap-8 text-center md:text-left md:grid-cols-4'>
                        <div className='md:col-span-1'>
                            <span className='text-xl tracking-tight uppercase font-body'>LORO CRM</span>
                            <div className='mt-4 text-xs text-muted-foreground font-body'>
                                Enterprise-grade mobile CRM solution for modern businesses
                            </div>
                        </div>
                        <div>
                            <h4 className='mb-4 text-xs font-normal uppercase font-body'>Product</h4>
                            <ul className='space-y-2 text-xs uppercase text-muted-foreground font-body'>
                                <li>
                                    <Link href='#features' className='transition-colors hover:text-primary'>
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link href='#solutions' className='transition-colors hover:text-primary'>
                                        Solutions
                                    </Link>
                                </li>
                                <li>
                                    <Link href='/pricing' className='transition-colors hover:text-primary'>
                                        Pricing
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className='mb-4 text-xs font-normal uppercase font-body'>Support</h4>
                            <ul className='space-y-2 text-xs uppercase text-muted-foreground font-body'>
                                <li>
                                    <Link href='/docs' className='transition-colors hover:text-primary'>
                                        Documentation
                                    </Link>
                                </li>
                                <li>
                                    <Link href='/api' className='transition-colors hover:text-primary'>
                                        API Reference
                                    </Link>
                                </li>
                                <li>
                                    <Link href='/contact' className='transition-colors hover:text-primary'>
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className='mb-4 text-xs font-normal uppercase font-body'>Company</h4>
                            <ul className='space-y-2 text-xs uppercase text-muted-foreground font-body'>
                                <li>
                                    <Link href='/about' className='transition-colors hover:text-primary'>
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link href='/blog' className='transition-colors hover:text-primary'>
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link href='/careers' className='transition-colors hover:text-primary'>
                                        Careers
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className='flex flex-col items-center justify-between pt-8 mt-8 text-center border-t md:flex-row md:text-left'>
                        <div className='text-xs text-muted-foreground font-body'>
                            © 2024 LORO CRM. All rights reserved.
                        </div>
                        <div className='flex gap-4 mt-4 md:mt-0'>
                            <Link
                                href='#'
                                className='text-xs uppercase transition-colors text-muted-foreground hover:text-primary font-body'
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href='#'
                                className='text-xs uppercase transition-colors text-muted-foreground hover:text-primary font-body'
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
