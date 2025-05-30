"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveTextSize } from '@/hooks/use-mobile';
import { heroTextVariants } from '@/lib/utils/animations';
import { Button } from '@/components/ui/button';
import { PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { StaggerItem } from '@/components/animations/stagger-item';

interface MobileHeroProps {
  currentPhraseIndex: number;
  heroPhrases: string[];
  isCallInitializing: boolean;
  isCallActive: boolean;
  connectionError: Error | null;
  formattedTimeRemaining: string | null;
  startDemoCall: () => void;
}

export function MobileHero({
  currentPhraseIndex,
  heroPhrases,
  isCallInitializing,
  isCallActive,
  connectionError,
  formattedTimeRemaining,
  startDemoCall,
}: MobileHeroProps) {
  const { heroTextSize, isMobile, isSmallMobile } = useResponsiveTextSize();

  return (
    <>
      <StaggerItem className="space-y-2">
        <div className={`relative overflow-hidden p-1 ${
          isSmallMobile
            ? 'h-20 sm:h-24'
            : isMobile
              ? 'h-24 sm:h-32'
              : 'h-32 sm:h-40 md:h-48'
        }`}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentPhraseIndex}
              variants={heroTextVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`absolute inset-0 flex items-center font-normal tracking-tighter uppercase font-body ${heroTextSize}`}
              style={{
                lineHeight: isSmallMobile ? '1.1' : '1.2',
                wordBreak: 'break-word'
              }}
            >
              {heroPhrases[currentPhraseIndex]}
            </motion.h1>
          </AnimatePresence>
        </div>
        <p className={`max-w-[600px] uppercase text-muted-foreground font-body ${
          isSmallMobile
            ? 'text-[10px] leading-relaxed tracking-wide'
            : 'text-xs md:text-xs leading-relaxed'
        }`}>
          Stop juggling multiple systems. Loro combines CRM, field service management, inventory tracking, quotation system, task management, and real-time analytics in one powerful platform.
        </p>
      </StaggerItem>

      <StaggerItem className="flex flex-col gap-2 min-[400px]:flex-row">
        <motion.div
          whileHover={!isMobile ? { scale: 1.05 } : {}}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            size={isSmallMobile ? "default" : "lg"}
            className={`font-normal uppercase animate-pulse font-body ${
              isSmallMobile
                ? 'text-[10px] px-3 py-2 h-8'
                : 'text-xs'
            }`}
            onClick={startDemoCall}
            disabled={isCallInitializing}
          >
            {isCallInitializing ? (
              <>
                <PhoneCall className={`mr-2 animate-pulse ${
                  isSmallMobile ? 'w-3 h-3' : 'w-4 h-4'
                }`} />
                <span>CONNECTING...</span>
              </>
            ) : isCallActive ? (
              <>
                <PhoneCall className={`mr-2 animate-pulse ${
                  isSmallMobile ? 'w-3 h-3' : 'w-4 h-4'
                }`} />
                <span className={isSmallMobile ? 'text-[9px]' : ''}>
                  CALL ACTIVE {formattedTimeRemaining && !isSmallMobile && `(${formattedTimeRemaining})`}
                </span>
              </>
            ) : connectionError ? (
              <>
                <PhoneCall className={`mr-2 ${
                  isSmallMobile ? 'w-3 h-3' : 'w-4 h-4'
                }`} />
                <span>Retry Call</span>
              </>
            ) : (
              <>
                <PhoneCall className={`mr-2 ${
                  isSmallMobile ? 'w-3 h-3' : 'w-4 h-4'
                }`} color='white' />
                <span className='text-white'>
                  {isSmallMobile ? 'Demo Call' : 'Instant Demo - Do you need LORO?'}
                </span>
              </>
            )}
          </Button>
        </motion.div>

        <motion.div
          whileHover={!isMobile ? { scale: 1.05 } : {}}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            asChild
            variant="outline"
            size={isSmallMobile ? "default" : "lg"}
            className={`font-normal uppercase font-body ${
              isSmallMobile
                ? 'text-[10px] px-3 py-2 h-8'
                : 'text-xs'
            }`}
          >
            <Link href="#features">
              See Features
            </Link>
          </Button>
        </motion.div>
      </StaggerItem>
    </>
  );
}
