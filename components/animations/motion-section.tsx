"use client";

import type React from "react";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { getMobileOptimizedMotionProps, getViewportThreshold, getOptimizedDuration } from "@/lib/utils/animations";

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  id?: string;
  once?: boolean;
  threshold?: number;
}

export function MotionSection({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.5,
  id,
  once = true,
  threshold,
}: MotionSectionProps) {
  const ref = useRef(null);

  // Use mobile-optimized props if no specific threshold is provided
  const mobileProps = getMobileOptimizedMotionProps();
  const finalThreshold = threshold ?? mobileProps.threshold;
  const isInView = useInView(ref, {
    once,
    amount: finalThreshold,
    margin: mobileProps.rootMargin as any // Type assertion since framer-motion types are restrictive
  });

  // Get mobile-optimized duration
  const optimizedDuration = getOptimizedDuration(duration);
  const optimizedDelay = getOptimizedDuration(delay);

  const getDirectionVariants = () => {
    // Reduce movement amounts on mobile for better performance
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const moveAmount = isMobile ? 25 : 50;

    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: moveAmount },
          visible: { opacity: 1, y: 0 },
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -moveAmount },
          visible: { opacity: 1, y: 0 },
        };
      case "left":
        return {
          hidden: { opacity: 0, x: moveAmount },
          visible: { opacity: 1, x: 0 },
        };
      case "right":
        return {
          hidden: { opacity: 0, x: -moveAmount },
          visible: { opacity: 1, x: 0 },
        };
      case "none":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
    }
  };

  const variants = getDirectionVariants();

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration: optimizedDuration,
        delay: optimizedDelay,
        ease: "easeOut"
      }}
      className={className}
      id={id}
    >
      {children}
    </motion.section>
  );
}
