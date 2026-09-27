"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FastForward } from "lucide-react";

interface SplashSequenceProps {
  children: React.ReactNode;
}

type SplashPhase = "bubbling" | "video" | "exiting" | "ended";

export function SplashSequence({ children }: SplashSequenceProps) {
  const shouldReduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<SplashPhase>("ended");
  const [isMounted, setIsMounted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  };

  useEffect(() => {
    setIsMounted(true);

    // Guardrail: check sessionStorage to play strictly once per session
    try {
      const hasSeen = sessionStorage.getItem("hasSeenSplash");
      if (hasSeen === "true" || shouldReduceMotion) {
        setPhase("ended");
        return;
      }

      // First time in this session: start bubbling sequence
      sessionStorage.setItem("hasSeenSplash", "true");
      setPhase("bubbling");

      // Phase 2 -> Phase 3: Transition to video reel after ~2.5s bubbling
      const t1 = setTimeout(() => {
        setPhase("video");
      }, 2500);

      // Phase 3 -> Phase 4: Trigger exit after video plays for ~4.0s (total 6.5s)
      const t2 = setTimeout(() => {
        setPhase("exiting");
      }, 6500);

      // Phase 4: Fully unmount splash after exit slide-up completes (700ms)
      const t3 = setTimeout(() => {
        setPhase("ended");
      }, 7200);

      timerRef.current = [t1, t2, t3];
    } catch {
      // If sessionStorage fails (e.g. private mode restrictions), fallback directly to app
      setPhase("ended");
    }

    return () => {
      clearAllTimers();
    };
  }, [shouldReduceMotion]);

  // Instant Skip action
  const handleSkip = () => {
    clearAllTimers();
    setPhase("exiting");
    const tExit = setTimeout(() => {
      setPhase("ended");
    }, 400);
    timerRef.current.push(tExit);
  };

  // Randomized offset configurations for 5 boiling icons
  const bubbleIcons = [
    { id: 0, x: -45, yPeak: -50, scalePeak: 1.25, delay: 0.05, duration: 2.1 },
    { id: 1, x: 28, yPeak: -45, scalePeak: 1.15, delay: 0.3, duration: 2.2 },
    { id: 2, x: -12, yPeak: -65, scalePeak: 1.3, delay: 0.55, duration: 2.0 },
    { id: 3, x: 52, yPeak: -40, scalePeak: 1.2, delay: 0.75, duration: 2.3 },
    { id: 4, x: -32, yPeak: -55, scalePeak: 1.18, delay: 0.95, duration: 2.1 },
  ];

  return (
    <>
      {/* Underlying transactional site layout */}
      {children}

      {/* Cinematic Splash Overlay Sequence */}
      <AnimatePresence>
        {isMounted && phase !== "ended" && (
          <motion.div
            key="splash-container"
            initial={{ opacity: 1, y: 0 }}
            animate={
              phase === "exiting"
                ? { opacity: 0, y: -50 }
                : { opacity: 1, y: 0 }
            }
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden bg-[#18110E] select-none pointer-events-auto"
          >
            {/* ============================================================= */}
            {/* PHASE 2: BUBBLING LOGOS SIMULATION (SOLID DEEP BURGUNDY)      */}
            {/* ============================================================= */}
            {phase === "bubbling" && (
              <motion.div
                key="bubbling-phase"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 bg-brand-red flex flex-col items-center justify-center overflow-hidden"
              >
                {/* Ambient warm pot glow */}
                <div className="absolute w-[420px] h-[420px] bg-brand-yellow/20 rounded-full blur-[100px] pointer-events-none" />

                {/* 5 Grouped Boiling Icons */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {bubbleIcons.map((icon) => (
                    <motion.div
                      key={icon.id}
                      initial={{ y: 0, scale: 0, opacity: 0, x: icon.x }}
                      animate={{
                        y: [0, icon.yPeak * 0.7, icon.yPeak * 0.2, icon.yPeak, 0],
                        scale: [0, icon.scalePeak, 0.9, icon.scalePeak * 0.95, 0],
                        opacity: [0, 1, 1, 0.85, 0],
                        x: [icon.x, icon.x + 8, icon.x - 6, icon.x + 4, icon.x],
                      }}
                      transition={{
                        duration: icon.duration,
                        delay: icon.delay,
                        ease: "easeInOut",
                        times: [0, 0.3, 0.5, 0.8, 1],
                      }}
                      className="absolute w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
                    >
                      <Image
                        src="/images/chef_apedo_logo_variations/chef_apedo_icon.png"
                        alt="Chef Apedo Icon"
                        fill
                        priority
                        sizes="96px"
                        className="object-contain"
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Subtle Monospace Loading Micro-Label */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0.8] }}
                  transition={{ duration: 1.5, delay: 0.4 }}
                  className="absolute bottom-16 text-center"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-yellow/80 font-bold">
                    Simmering Small Batches
                  </span>
                </motion.div>
              </motion.div>
            )}

            {/* ============================================================= */}
            {/* PHASE 3: CINEMATIC KITCHEN ACTION VIDEO REEL                  */}
            {/* ============================================================= */}
            {(phase === "video" || phase === "exiting") && (
              <motion.div
                key="video-phase"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1.0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full overflow-hidden"
              >
                {/* HTML5 Autoplaying Muted Culinary Reel */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                >
                  <source src="/videos/culinary-reel.webm" type="video/webm" />
                </video>

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-black/45 bg-gradient-to-t from-black/80 via-black/40 to-black/60 pointer-events-none" />

                {/* Center Massive Light Logo Scaling Up Elegantly */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1.05, opacity: 1 }}
                    transition={{ duration: 3.5, ease: "easeOut" }}
                    className="relative w-72 sm:w-96 md:w-[480px] lg:w-[540px] aspect-[431/280] drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
                  >
                    <Image
                      src="/images/chef_apedo_logo_variations/logo-light-transparent.png"
                      alt="Chef Apedo Foods"
                      fill
                      priority
                      sizes="(max-width: 640px) 288px, (max-width: 1024px) 480px, 540px"
                      className="object-contain"
                    />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.0, delay: 0.6 }}
                    className="mt-6 text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-brand-yellow font-bold text-center drop-shadow-md"
                  >
                    Ghanaian Food. Made to Order.
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* ============================================================= */}
            {/* PHASE 1: PERSISTENT SKIP BUTTON (FROSTED GLASS PILL)          */}
            {/* ============================================================= */}
            <motion.button
              type="button"
              onClick={handleSkip}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="fixed bottom-8 right-8 z-[9999] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/25 text-xs font-mono uppercase tracking-wider shadow-2xl transition-all cursor-pointer group"
              aria-label="Skip Introduction"
            >
              <span>Skip</span>
              <FastForward className="w-3.5 h-3.5 text-brand-yellow transition-transform group-hover:translate-x-0.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
