"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const AnimatedHearts = () => {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    // Create initial hearts
    const initialHearts = Array.from({ length: 15 }, () => ({
      size: Math.random() * 20 + 10,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    setHearts(initialHearts);

    // Regenerate hearts periodically
    const interval = setInterval(() => {
      setHearts((prevHearts) => {
        const newHeart = {
          size: Math.random() * 20 + 10,
          left: Math.random() * 100,
          delay: 0,
          duration: Math.random() * 10 + 15,
          opacity: Math.random() * 0.5 + 0.1,
        };

        const newHearts = [...prevHearts];
        const randomIndex = Math.floor(Math.random() * newHearts.length);
        newHearts[randomIndex] = newHeart;

        return newHearts;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart, index) => (
        <div
          key={index}
          className="absolute bottom-[-10%] animate-float-up"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            opacity: heart.opacity,
          }}
        >
          <Heart
            className="text-rose-400 fill-rose-400"
            style={{ width: heart.size, height: heart.size }}
          />
        </div>
      ))}
    </div>
  );
};

export default AnimatedHearts;
