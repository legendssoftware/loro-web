"use client";

import type React from "react";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

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
  threshold = 0.2,
}: MotionSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const getDirectionVariants = () => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -50 },
          visible: { opacity: 1, y: 0 },
        };
      case "left":
        return {
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        };
      case "right":
        return {
          hidden: { opacity: 0, x: -50 },
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
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      id={id}
    >
      {children}
    </motion.section>
  );
}
