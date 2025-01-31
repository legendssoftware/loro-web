'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggler } from "@/modules/navigation/theme.toggler"
import { Users, BarChart3, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import phoneCover from '../../public/phone-cover.png'
import { useRouter } from 'next/navigation'

const features = [
    {
        title: "Client Management",
        description: "Efficiently manage your client relationships with detailed profiles, interaction history, and communication tracking.",
        image: "/client-management.jpg",
        icon: <Users className="" strokeWidth={1.5} size={30} />,
        index: "01",
    },
    {
        title: "Performance Analytics",
        description: "Track your team's performance with real-time analytics, custom reports, and actionable insights.",
        image: "/analytics.jpg",
        icon: <BarChart3 className="" strokeWidth={1.5} size={30} />,
        index: "02",
    },
    {
        title: "Task Scheduling",
        description: "Stay organized with integrated calendar, task management, and automated reminders.",
        image: "/scheduling.jpg",
        icon: <Calendar className="" strokeWidth={1.5} size={30} />,
        index: "03",
    }
];

const stats = [
    {
        value: "27k+",
        label: "Active Users",
        description: "Growing community of professionals"
    },
    {
        value: "150+",
        label: "Daily Tasks",
        description: "Managed efficiently"
    }
];

const LandingPage: React.FunctionComponent = () => {
    const router = useRouter();

    const handleSignIn = () => router.push('/sign-in');

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto flex items-center justify-between py-4 px-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-body tracking-tight uppercase">LORO CRM</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Button variant="ghost" className="font-body uppercase font-normal text-xs">Service</Button>
                        <Button variant="ghost" className="font-body uppercase font-normal text-xs">Pricing</Button>
                        <Button variant="ghost" className="font-body uppercase font-normal text-xs">Learn</Button>
                        <ThemeToggler />
                        <Button
                            variant="outline"
                            className="font-body uppercase font-normal text-xs"
                            onClick={handleSignIn}
                        >
                            Sign In
                        </Button>
                    </nav>
                </div>
            </header >
            <section className="pt-32 pb-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            <span className="text-sm text-purple-600 dark:text-purple-400 font-body uppercase">Welcome to CRM Mastery</span>
                            <h1 className="text-3xl md:text-6xl font-bold leading-tight font-body uppercase">
                                Transform Your Client Relations
                            </h1>
                            <p className="text-card-foreground text-sm font-body uppercase">
                                Manage your clients, tasks, and team all in one powerful mobile platform
                            </p>
                            <div className="flex gap-4">
                                <Button className="text-white font-body uppercase font-normal text-xs" size="lg">
                                    Get Started
                                </Button>
                                <Button variant="outline" size="lg" className='font-body uppercase font-normal text-xs'>
                                    Watch Demo
                                </Button>
                            </div>
                        </motion.div>
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}>
                            <div className="flex items-center justify-center">
                                <Image src={phoneCover} height={400} width={400} alt='LORO CRM' className='rounded-xl' />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
            <section className="py-16 bg-purple-50 dark:bg-purple-900/5">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl font-bold font-body uppercase"
                        >
                            Empowering Your<br />Business Growth
                        </motion.h2>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden">
                                    <div className="p-6">
                                        <div className='flex items-center justify-start gap-4'>
                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                                                {feature.icon}
                                            </div>
                                        </div>
                                        <h3 className="text-xl mb-2 font-body uppercase font-normal">{feature.title}</h3>
                                        <p className="text-card-foreground mb-4 font-body uppercase text-xs">{feature.description}</p>
                                        <Button variant="link" className="p-0 h-auto text-purple-600 dark:text-purple-400 font-body uppercase font-normal textx-xs">
                                            Learn More →
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <h2 className="text-4xl font-bold mb-8 font-body uppercase">
                            Transforming Client Management,<br />One Relationship at a Time
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {stats.map((stat, index) => (
                                <Card key={index} className="p-6">
                                    <div >
                                        <p className="text-4xl font-bold mb-2 font-body uppercase">{stat?.value}</p>
                                    </div>
                                    <div >
                                        <p className="text-md font-bold font-body uppercase">{stat?.label}</p>
                                    </div>
                                    <div >
                                        <p className="text-xs font-normal mb-2 font-body uppercase">{stat?.description}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>
            <section className="py-16 bg-purple-50 dark:bg-purple-900/5">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl mx-auto"
                    >
                        <h2 className="text-3xl font-bold mb-6 font-body uppercase">Ready to Transform Your Business?</h2>
                        <p className="text-card-foreground mb-8 font-body uppercase text-xs">
                            Join thousands of professionals who trust LORO CRM to manage their client relationships.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button variant="default" size="lg" className="font-body uppercase font-normal text-xs text-white">
                                Schedule Demo
                            </Button>
                            <Button variant="outline" size="lg" className="font-body uppercase font-normal text-xs">
                                Learn More
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
            <footer className="py-8 border-t">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <span className="text-card-foreground text-xs font-body uppercase">© 2024 LORO CRM by Legend Systems</span>
                        <div className="flex gap-4">
                            <Button variant="ghost" size="sm" className="font-body uppercase font-normal">Terms of Use</Button>
                            <Button variant="ghost" size="sm" className="font-body uppercase font-normal">Privacy Policy</Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    )
}

export default LandingPage
