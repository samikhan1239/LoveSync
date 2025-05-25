"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    content:
      "I was skeptical at first, but after a month on LoveSync, I met my now-fiancé! The matching algorithm is truly incredible at finding compatible partners.",
    author: "Jessica & David",
    location: "New York, USA",
    image: "/bg6.png",
  },
  {
    id: 2,
    content:
      "After trying several dating apps without success, LoveSync was a breath of fresh air. The verified profiles made me feel safe, and I found my perfect match within weeks!",
    author: "Michael & Emma",
    location: "London, UK",
    image: "/bg8.png",
  },
  {
    id: 3,
    content:
      "The compatibility tests on LoveSync are what sets it apart. They matched me with someone who shares my values and interests, and we've been together for over a year now.",
    author: "Priya & Raj",
    location: "Mumbai, India",
    image: "/bg4.png",
  },
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section id="testimonials" className="py-20 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-3 py-1 mb-6 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20">
            <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Success Stories
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Real People, Real{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Connections
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Hear from couples who found their perfect match on our platform and
            are now living their happily ever after.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 md:p-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="absolute top-6 right-8">
              <Quote className="h-12 w-12 text-pink-500/20" />
            </div>

            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`transition-opacity duration-500 ${
                    index === activeIndex
                      ? "opacity-100"
                      : "opacity-0 absolute inset-0"
                  }`}
                >
                  <p className="text-xl md:text-2xl text-white/90 mb-8 italic">
                    &quot; {testimonial.content}&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-semibold text-white">
                        {testimonial.author}
                      </h4>
                      <p className="text-white/70">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-8 right-8 flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full border-white/10 bg-black/20 backdrop-blur-sm hover:bg-white/10 text-white"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full border-white/10 bg-black/20 backdrop-blur-sm hover:bg-white/10 text-white"
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex
                    ? "bg-pink-500"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
