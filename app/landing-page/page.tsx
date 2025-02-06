"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const LandingPage: React.FunctionComponent = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-xl tracking-tight uppercase font-body">LORO CRM</Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="#features" className="text-xs uppercase hover:text-primary font-body">Features</Link>
          <Link href="#solutions" className="text-xs uppercase hover:text-primary font-body">Solutions</Link>
          <Link href="/auth/signin">
            <Button className="text-xs text-white uppercase bg-primary font-body hover:bg-primary/90">Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="max-w-3xl text-4xl font-normal uppercase md:text-5xl lg:text-6xl font-body">
            Enterprise-Grade Mobile CRM Solution
          </h1>
          <p className="max-w-2xl mt-6 text-xs uppercase text-muted-foreground font-body">
            Streamline your business operations with our comprehensive mobile-first platform for claims, quotations, and staff management
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Button className="h-12 text-xs text-white uppercase bg-primary font-body hover:bg-primary/90">
              Start Free Trial
            </Button>
            <Button variant="outline" className="h-12 text-xs uppercase font-body">
              Schedule Demo
            </Button>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mt-16"
        >
          <Image
            src="/app-preview.png"
            alt="LORO CRM Mobile App Interface"
            width={800}
            height={400}
            className="shadow-xl rounded-xl"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto mb-16 text-center"
          >
            <h2 className="mb-4 text-2xl font-normal uppercase font-body">
              Powerful Features for Modern Businesses
            </h2>
            <p className="text-xs uppercase text-muted-foreground font-body">
              Everything you need to manage your business operations efficiently
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-6 bg-card rounded-xl"
            >
              <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10" />
              <h3 className="mb-2 text-lg font-normal uppercase font-body">Claims Management</h3>
              <p className="text-xs uppercase text-muted-foreground font-body">
                Streamline your claims processing with automated workflows and real-time tracking
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-6 bg-card rounded-xl"
            >
              <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10" />
              <h3 className="mb-2 text-lg font-normal uppercase font-body">Staff Management</h3>
              <p className="text-xs uppercase text-muted-foreground font-body">
                Complete control over staff attendance, tasks, and performance tracking
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 bg-card rounded-xl"
            >
              <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10" />
              <h3 className="mb-2 text-lg font-normal uppercase font-body">Quotation System</h3>
              <p className="text-xs uppercase text-muted-foreground font-body">
                Create and manage professional quotations with automated follow-ups
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solutions Showcase */}
      <section id="solutions" className="py-20">
        <div className="container px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-2xl font-normal text-center uppercase font-body"
          >
            Complete Business Management Suite
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="overflow-hidden bg-black rounded-xl">
              <Image
                src="/loro-app-preview.png"
                alt="LORO CRM Mobile App Interface"
                width={400}
                height={300}
                className="object-cover w-full h-48"
              />
              <div className="p-6">
                <h3 className="mb-2 text-sm font-normal text-white uppercase font-body">
                  Efficient Claims Processing
                </h3>
                <p className="text-xs text-gray-400 uppercase font-body">
                  Streamlined workflow management
                </p>
              </div>
            </div>
            <div className="overflow-hidden bg-black rounded-xl">
              <Image
                src="/feature-staff.png"
                alt="Staff Management Dashboard"
                width={400}
                height={300}
                className="object-cover w-full h-48"
              />
              <div className="p-6">
                <h3 className="mb-2 text-sm font-normal text-white uppercase font-body">
                  Complete Staff Overview
                </h3>
                <p className="text-xs text-gray-400 uppercase font-body">
                  Real-time performance tracking
                </p>
              </div>
            </div>
            <div className="overflow-hidden bg-black rounded-xl">
              <Image
                src="/feature-quotes.png"
                alt="Quotation System Interface"
                width={400}
                height={300}
                className="object-cover w-full h-48"
              />
              <div className="p-6">
                <h3 className="mb-2 text-sm font-normal text-white uppercase font-body">
                  Professional Quotations
                </h3>
                <p className="text-xs text-gray-400 uppercase font-body">
                  Automated quote generation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-white bg-primary">
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-8 text-2xl font-normal uppercase font-body">
              Ready to Transform Your Business Operations?
            </h2>
            <div className="flex justify-center gap-4">
              <Link href="/downloads/loro-crm.apk" download>
                <Button variant="secondary" className="h-12 text-xs uppercase font-body">
                  Download APK
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="h-12 text-xs text-white uppercase border-white font-body hover:bg-white hover:text-primary">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <span className="text-xl tracking-tight uppercase font-body">LORO CRM</span>
              <div className="mt-4 text-xs text-muted-foreground font-body">
                Enterprise-grade mobile CRM solution for modern businesses
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-normal uppercase font-body">Product</h4>
              <ul className="space-y-2 text-xs uppercase text-muted-foreground font-body">
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#solutions">Solutions</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-normal uppercase font-body">Support</h4>
              <ul className="space-y-2 text-xs uppercase text-muted-foreground font-body">
                <li><Link href="/docs">Documentation</Link></li>
                <li><Link href="/api">API Reference</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-normal uppercase font-body">Company</h4>
              <ul className="space-y-2 text-xs uppercase text-muted-foreground font-body">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t md:flex-row">
            <div className="text-xs text-muted-foreground font-body">
              © 2024 LORO CRM. All rights reserved.
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-xs uppercase text-muted-foreground hover:text-primary font-body">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs uppercase text-muted-foreground hover:text-primary font-body">
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
