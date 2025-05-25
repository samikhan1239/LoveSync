"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Heart SVG component
const Heart = ({ size, fill }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill || "currentColor"}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export default function AnimatedHeartsBackground() {
  const [windowSize, setWindowSize] = useState({
    width: 1920,
    height: 1080,
  });

  // Update window dimensions on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Generate hearts array
  const hearts = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    size: 15 + Math.random() * 20,
    initialX: Math.random() * windowSize.width,
    delay: Math.random() * 6,
    duration: 8 + Math.random() * 12,
    rotation: 360 * (Math.random() > 0.5 ? 1 : -1),
    initialOpacity: 0.3 + Math.random() * 0.4,
    initialScale: 0.5 + Math.random() * 1.2,
    color: getRandomPinkShade(),
  }));

  function getRandomPinkShade() {
    const pinkShades = [
      "#FF69B4", // Hot Pink
      "#FFB6C1", // Light Pink
      "#FFC0CB", // Pink
      "#FF1493", // Deep Pink
      "#DB7093", // Pale Violet Red
      "#F08080", // Light Coral
      "#FF0066", // Strong Pink
      "#FF77FF", // Light Magenta
      "#FF007F", // Rose
      "#FF66B2", // Light Hot Pink
    ];
    return pinkShades[Math.floor(Math.random() * pinkShades.length)];
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {hearts.map((heart) => (
        <motion.div
          key={`heart-bg-${heart.id}`}
          className="absolute"
          style={{ color: heart.color }}
          initial={{
            x: heart.initialX,
            y: windowSize.height + 100,
            opacity: heart.initialOpacity,
            scale: heart.initialScale,
          }}
          animate={{
            y: -100,
            rotate: [0, heart.rotation],
            scale: [0.5, 1.5, 0.5],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            ease: ["easeInOut", "easeIn", "easeOut"],
            delay: heart.delay,
            times: [0, 0.5, 1],
          }}
        >
          <Heart size={heart.size} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
}
