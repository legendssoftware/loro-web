"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggler } from "@/modules/navigation/theme.toggler";
import {
  Users,
  BarChart3,
  User,
  FileText,
  MapPin,
  ClipboardCheck,
  Download,
  Bell,
  Smartphone
} from "lucide-react";
import Image from "next/image";
import phoneCover from "../../public/phone-cover.png";
import { useRouter } from "next/navigation";

const features = [
  {
    title: "Claims Management",
    description: "Streamline claims processing with automated workflows, document management, and status tracking.",
    icon: <FileText className="" strokeWidth={1.5} size={30} />,
    index: "01",
  },
  {
    title: "Quotation System",
    description: "Create and manage professional quotations with customizable templates and automated follow-ups.",
    icon: <ClipboardCheck className="" strokeWidth={1.5} size={30} />,
    index: "02",
  },
  {
    title: "Attendance Tracking",
    description: "Monitor staff attendance with biometric integration, leave management, and real-time reporting.",
    icon: <Users className="" strokeWidth={1.5} size={30} />,
    index: "03",
  },
  {
    title: "Location Tracking",
    description: "Track field staff locations in real-time with offline support and route optimization.",
    icon: <MapPin className="" strokeWidth={1.5} size={30} />,
    index: "04",
  },
  {
    title: "Staff Management",
    description: "Comprehensive staff management with performance tracking, task assignment, and skill mapping.",
    icon: <BarChart3 className="" strokeWidth={1.5} size={30} />,
    index: "05",
  },
  {
    title: "Automated Reporting",
    description: "Generate detailed reports automatically with customizable templates and scheduled delivery.",
    icon: <Bell className="" strokeWidth={1.5} size={30} />,
    index: "06",
  },
];

const stats = [
  {
    value: "50k+",
    label: "Claims Processed",
    description: "Efficiently managed claims",
  },
  {
    value: "98%",
    label: "Client Satisfaction",
    description: "Based on user feedback",
  },
  {
    value: "24/7",
    label: "Offline Access",
    description: "Always available",
  },
];

const LandingPage: React.FunctionComponent = () => {
  const router = useRouter();
  const handleSignIn = () => router.push("/sign-in");
  const APK_DOWNLOAD_URL = "/awesome0loro.apk";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl tracking-tight uppercase font-body">
              LORO CRM
            </span>
          </div>
          <nav className="items-center hidden gap-6 md:flex">
            <ThemeToggler />
            <User
              size={20}
              className="cursor-pointer"
              strokeWidth={1.5}
              onClick={handleSignIn}
            />
          </nav>
        </div>
      </header>

      <section className="pt-32 pb-16">
        <div className="container px-4 mx-auto">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <span className="text-sm text-purple-600 uppercase dark:text-purple-400 font-body">
                Enterprise-Grade CRM Solution
              </span>
              <h1 className="text-3xl font-bold leading-tight uppercase md:text-6xl font-body">
                Complete Business Management Suite
              </h1>
              <p className="text-sm uppercase text-card-foreground font-body">
                Manage claims, quotations, staff, and operations with our powerful mobile-first platform
              </p>
              <div className="flex gap-4">
                <Button
                  className="text-xs font-normal text-white uppercase font-body"
                  size="lg"
                  onClick={handleSignIn}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-xs font-normal uppercase font-body"
                >
                  Schedule Demo
                </Button>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-center">
                <Image
                  src={phoneCover}
                  height={400}
                  width={400}
                  alt="LORO CRM Mobile App"
                  className="rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-purple-100 rounded-full dark:bg-purple-900/20">
              <Smartphone className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="mb-6 text-3xl font-bold uppercase font-body">
              Try Our APK
            </h2>
            <p className="mb-8 text-sm uppercase text-card-foreground font-body">
              Download our Android app now and experience seamless offline access to all features.
            </p>
            <Button
              variant="default"
              size="lg"
              className="gap-2 text-xs font-normal text-white uppercase font-body"
              onClick={() => window.open(APK_DOWNLOAD_URL, '_blank')}
            >
              <Download size={16} />
              GET APK
            </Button>
            <p className="mt-4 text-[9px] text-gray-500 uppercase font-body">
              V1.0.3 | Android 15.0+
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-purple-50 dark:bg-purple-900/5">
        <div className="container px-4 mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-3xl font-bold text-center uppercase font-body"
          >
            Comprehensive Business Solutions
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 rounded-full dark:bg-purple-900/20">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="mb-2 text-xl font-normal uppercase font-body">
                      {feature.title}
                    </h3>
                    <p className="mb-4 text-xs uppercase text-card-foreground font-body">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="mb-8 text-4xl font-bold text-center uppercase font-body">
              Trusted by Industry Leaders
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6">
                  <div>
                    <p className="mb-2 text-4xl font-bold text-center uppercase font-body">
                      {stat?.value}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-center uppercase text-md font-body">
                      {stat?.label}
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-normal text-center uppercase font-body">
                      {stat?.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container px-4 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="mb-6 text-3xl font-bold uppercase font-body">
              Ready to Transform Your Operations?
            </h2>
            <p className="mb-8 text-xs uppercase text-card-foreground font-body">
              Join industry leaders who trust LORO CRM for complete business management.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="default"
                size="lg"
                className="text-xs font-normal text-white uppercase font-body"
                onClick={handleSignIn}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-xs font-normal uppercase font-body"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
