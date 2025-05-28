"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  delay?: number
  staggerChildren?: number
  once?: boolean
  threshold?: number
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  staggerChildren = 0.1,
  once = true,
  threshold = 0.2,
}: StaggerContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, threshold })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}
