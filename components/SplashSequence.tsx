'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SplashSequence() {
  const [showSplash, setShowSplash] = useState(false);
  const [phase, setPhase] = useState<'bubbling' | 'video' | 'exiting'>('bubbling');

  useEffect(() => {
    // Check if user has already seen the splash this session
    try {
      const hasSeenSplash = sessionStorage.getItem('chefApedoSplashSeen');
      if (hasSeenSplash) {
        return;
      }
      setShowSplash(true);
    } catch {
      return;
    }

    // Sequence Timers
    const bubblingTimer = setTimeout(() => setPhase('video'), 2500);
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
      setTimeout(() => closeSplash(), 800); // Wait for exit animation to finish
    }, 6500);

    return () => {
      clearTimeout(bubblingTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  const closeSplash = () => {
    try {
      sessionStorage.setItem('chefApedoSplashSeen', 'true');
    } catch {}
    setShowSplash(false);
  };

  if (!showSplash) return null;

  // Generate 5 random positions for the bubbling icons
  const bubbles = [
    { id: 0, xOffset: -22, delay: 0.05 },
    { id: 1, xOffset: 18, delay: 0.25 },
    { id: 2, xOffset: -8, delay: 0.45 },
    { id: 3, xOffset: 25, delay: 0.65 },
    { id: 4, xOffset: -16, delay: 0.85 },
  ];

  return (
    <AnimatePresence>
      {phase !== 'exiting' && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-brand-red overflow-hidden"
        >
          {/* SKIP BUTTON */}
          <button
            onClick={closeSplash}
            className="absolute bottom-8 right-8 z-50 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold tracking-wider hover:bg-white/30 transition-colors cursor-pointer"
          >
            Skip Intro ✕
          </button>

          {/* PHASE 1: BUBBLING LOGOS */}
          <AnimatePresence>
            {phase === 'bubbling' && (
              <motion.div 
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.5 }}
                className="relative flex items-center justify-center w-full h-full"
              >
                {bubbles.map((bubble) => (
                  <motion.div
                    key={bubble.id}
                    initial={{ opacity: 0, scale: 0, y: 50, x: bubble.xOffset }}
                    animate={{
                      opacity: [0, 1, 1, 0.8, 0],
                      scale: [0, 1.2, 0.9, 1.1, 0],
                      y: [50, -20, 10, -60, -100],
                      x: bubble.xOffset,
                    }}
                    transition={{
                      duration: 2,
                      delay: bubble.delay,
                      ease: 'easeInOut',
                    }}
                    className="absolute"
                  >
                    <Image
                      src="/images/chef_apedo_logo_variations/chef_apedo_icon.png"
                      alt="Chef Apedo Icon"
                      width={80}
                      height={80}
                      className="object-contain drop-shadow-2xl"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* PHASE 2: KITCHEN VIDEO */}
          <AnimatePresence>
            {phase === 'video' && (
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full"
              >
                <video
                  autoPlay
                  muted
                  playsInline
                  loop
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/videos/kitchen-broll.mp4" type="video/mp4" />
                  <source src="/videos/culinary-reel.webm" type="video/webm" />
                </video>

                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

                {/* Final Logo Reveal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1.05 }}
                  transition={{ delay: 0.5, duration: 3, ease: 'easeOut' }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Image
                    src="/images/chef_apedo_logo_variations/logo-light-transparent.png"
                    alt="Chef Apedo Foods"
                    width={400}
                    height={200}
                    className="object-contain drop-shadow-2xl px-6"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Named export for flexibility
export { SplashSequence };
