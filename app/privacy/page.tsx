'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/animations/page-transition';
import { FadeIn } from '@/components/animations/fade-in';
import { ArrowLeft, Shield, Lock, Eye, Database, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
    return (
        <PageTransition>
            <div className="flex flex-col min-h-screen">
                <FadeIn duration={0.8}>
                    <header className="sticky top-0 z-50 border-b backdrop-blur-sm bg-background/80">
                        <div className="container flex justify-between items-center px-4 mx-auto h-16">
                            <Link href="/" className="flex gap-2 items-center">
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="text-xl font-normal tracking-tight uppercase font-body"
                                >
                                    LORO CRM
                                </motion.span>
                            </Link>
                            <Link href="/">
                                <Button variant="ghost" size="sm" className="text-xs font-normal uppercase font-body">
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </header>
                </FadeIn>

                <main className="flex-1 py-12 md:py-20">
                    <div className="container px-4 mx-auto md:px-6">
                        <motion.div
                            className="mx-auto max-w-4xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Header */}
                            <div className="mb-12 text-center">
                                <motion.div
                                    className="inline-flex justify-center items-center mb-6 w-16 h-16 rounded-full bg-primary/10"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <Shield className="w-8 h-8 text-primary" />
                                </motion.div>
                                <h1 className="mb-4 text-4xl font-normal tracking-tighter uppercase md:text-5xl font-body">
                                    Privacy Policy
                                </h1>
                                <p className="text-sm uppercase text-muted-foreground font-body">
                                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Introduction */}
                            <motion.div
                                className="p-6 mb-8 rounded-xl bg-muted/50"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    At LORO CRM, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our customer relationship management platform and related services.
                                </p>
                            </motion.div>

                            {/* Privacy Sections */}
                            <div className="space-y-8">
                                {[
                                    {
                                        icon: Database,
                                        title: 'Information We Collect',
                                        content: [
                                            {
                                                subtitle: 'Personal Information',
                                                text: 'We collect information you provide directly to us, including name, email address, phone number, company information, and any other details you choose to provide when creating an account or using our services.'
                                            },
                                            {
                                                subtitle: 'Usage Data',
                                                text: 'We automatically collect information about your interactions with our platform, including IP address, browser type, device information, pages visited, and actions taken within the application.'
                                            },
                                            {
                                                subtitle: 'Location Data',
                                                text: 'With your permission, we collect location data from field service personnel to enable GPS tracking and route optimization features.'
                                            }
                                        ]
                                    },
                                    {
                                        icon: Lock,
                                        title: 'How We Use Your Information',
                                        content: [
                                            {
                                                subtitle: 'Service Delivery',
                                                text: 'We use your information to provide, maintain, and improve our CRM services, including lead management, field service tracking, and analytics.'
                                            },
                                            {
                                                subtitle: 'Communication',
                                                text: 'We may use your contact information to send service-related notifications, updates, security alerts, and support messages.'
                                            },
                                            {
                                                subtitle: 'Analytics & Improvement',
                                                text: 'We analyze usage patterns to understand how our services are used and to improve functionality, develop new features, and enhance user experience.'
                                            }
                                        ]
                                    },
                                    {
                                        icon: Shield,
                                        title: 'Data Security',
                                        content: [
                                            {
                                                subtitle: 'Encryption',
                                                text: 'All data transmitted between your devices and our servers is encrypted using industry-standard SSL/TLS protocols. Data at rest is encrypted using AES-256 encryption.'
                                            },
                                            {
                                                subtitle: 'Access Controls',
                                                text: 'We implement strict access controls and authentication measures to ensure only authorized personnel can access your data.'
                                            },
                                            {
                                                subtitle: 'Regular Audits',
                                                text: 'We conduct regular security audits and vulnerability assessments to maintain the highest security standards.'
                                            }
                                        ]
                                    },
                                    {
                                        icon: Users,
                                        title: 'Data Sharing & Disclosure',
                                        content: [
                                            {
                                                subtitle: 'Third-Party Services',
                                                text: 'We may share your information with trusted third-party service providers who assist us in operating our platform, such as cloud hosting providers and payment processors.'
                                            },
                                            {
                                                subtitle: 'Legal Requirements',
                                                text: 'We may disclose your information if required by law, court order, or governmental regulation, or if we believe disclosure is necessary to protect our rights or the safety of others.'
                                            },
                                            {
                                                subtitle: 'Business Transfers',
                                                text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.'
                                            }
                                        ]
                                    },
                                    {
                                        icon: Eye,
                                        title: 'Your Rights',
                                        content: [
                                            {
                                                subtitle: 'Access & Correction',
                                                text: 'You have the right to access, update, or correct your personal information at any time through your account settings.'
                                            },
                                            {
                                                subtitle: 'Data Portability',
                                                text: 'You can request a copy of your data in a portable format at any time by contacting our support team.'
                                            },
                                            {
                                                subtitle: 'Deletion',
                                                text: 'You may request deletion of your account and associated data. Please note that some information may be retained for legal or legitimate business purposes.'
                                            },
                                            {
                                                subtitle: 'Opt-Out',
                                                text: 'You can opt out of marketing communications at any time by following the unsubscribe instructions in our emails or updating your notification preferences.'
                                            }
                                        ]
                                    },
                                    {
                                        icon: FileText,
                                        title: 'Data Retention',
                                        content: [
                                            {
                                                subtitle: 'Active Accounts',
                                                text: 'We retain your information for as long as your account is active or as needed to provide you services.'
                                            },
                                            {
                                                subtitle: 'After Cancellation',
                                                text: 'After account cancellation, your data remains accessible for 30 days to allow for reactivation or data export. After this period, data is permanently deleted from our systems.'
                                            },
                                            {
                                                subtitle: 'Legal Obligations',
                                                text: 'Some data may be retained for longer periods if required by law or for legitimate business purposes such as fraud prevention and financial record-keeping.'
                                            }
                                        ]
                                    }
                                ].map((section, index) => (
                                    <motion.div
                                        key={section.title}
                                        className="p-6 rounded-xl border shadow-sm bg-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                    >
                                        <div className="flex gap-4 items-start mb-4">
                                            <div className="flex justify-center items-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
                                                <section.icon className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-normal uppercase font-body">
                                                    {section.title}
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="pl-16 space-y-4">
                                            {section.content.map((item, i) => (
                                                <div key={i}>
                                                    <h3 className="mb-2 text-sm font-medium uppercase font-body">
                                                        {item.subtitle}
                                                    </h3>
                                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                                        {item.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Cookies Policy */}
                            <motion.div
                                className="p-6 mt-8 rounded-xl bg-muted/50"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1 }}
                            >
                                <h2 className="mb-3 text-lg font-normal uppercase font-body">
                                    Cookies & Tracking Technologies
                                </h2>
                                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                                    We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with small amounts of data that are sent to your browser and stored on your device.
                                </p>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                                </p>
                            </motion.div>

                            {/* Contact Information */}
                            <motion.div
                                className="p-6 mt-8 text-center rounded-xl border shadow-sm bg-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 1.1 }}
                            >
                                <h2 className="mb-3 text-lg font-normal uppercase font-body">
                                    Questions About Privacy?
                                </h2>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium"><a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`} className="text-primary hover:underline">{process.env.NEXT_PUBLIC_EMAIL}</a></p>
                                    <p className="font-medium"><a href={`tel:${process.env.NEXT_PUBLIC_PHONE}`} className="text-primary hover:underline">{process.env.NEXT_PUBLIC_PHONE}</a></p>
                                </div>
                            </motion.div>

                            {/* Updates Notice */}
                            <motion.div
                                className="p-4 mt-8 rounded-lg border-l-4 bg-primary/5 border-primary"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 1.2 }}
                            >
                                <p className="text-xs uppercase text-muted-foreground">
                                    <strong>Notice of Changes:</strong> We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </main>

                {/* Simple Footer */}
                <footer className="py-8 border-t bg-muted/30">
                    <div className="container px-4 mx-auto text-center md:px-6">
                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                            © {new Date().getFullYear()} LORO CRM. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </PageTransition>
    );
}

