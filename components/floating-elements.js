"use client";

import { useEffect, useState } from "react";

export default function FloatingElements() {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const colors = [
      "bg-pink-500",
      "bg-purple-600",
      "bg-indigo-500",
      "bg-violet-500",
    ];

    const newElements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 200 + 50,
      opacity: Math.random() * 0.15 + 0.05,
      blur: Math.random() * 70 + 30,
      speed: Math.random() * 100 + 50,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute rounded-full ${element.color}`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            opacity: element.opacity,
            filter: `blur(${element.blur}px)`,
            animation: `float ${element.speed}s infinite alternate ease-in-out`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
