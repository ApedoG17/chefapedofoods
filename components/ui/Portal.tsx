"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

/**
 * Renders child components directly into document.body using React Portals.
 * Decouples modals, slide-out carts, and drawers from nested parent DOM hierarchies
 * to eliminate z-index stacking collisions and mobile overflow clipping.
 */
export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(children, document.body);
}
