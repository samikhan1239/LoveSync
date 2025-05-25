"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const slides = [
  {
    image: "/placeholder.svg?height=800&width=1920",
    title: "Find Your Perfect Match",
    description:
      "Join thousands of happy couples who found their soulmate on our platform",
  },
  {
    image: "/placeholder.svg?height=800&width=1920",
    title: "Verified Profiles",
    description:
      "Connect with genuine people looking for meaningful relationships",
  },
  {
    image: "/placeholder.svg?height=800&width=1920",
    title: "Success Stories Every Day",
    description:
      "Be the next success story in our growing community of happy couples",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-16">
      {/* Slides */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white p-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-4xl animate-fade-up">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mb-8 animate-fade-up animation-delay-200">
                {slide.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animation-delay-300">
                <Button
                  size="lg"
                  className="bg-rose-500 hover:bg-rose-600 text-white"
                >
                  Find Matches
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white/20"
                >
                  Create Profile
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Box */}
      <div className="absolute bottom-12 left-0 right-0 z-30 mx-auto max-w-4xl px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Quick Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                I am a
              </label>
              <select className="w-full rounded-md border border-gray-300 p-2 text-sm">
                <option>Man</option>
                <option>Woman</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Looking for
              </label>
              <select className="w-full rounded-md border border-gray-300 p-2 text-sm">
                <option>Woman</option>
                <option>Man</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Age</label>
              <select className="w-full rounded-md border border-gray-300 p-2 text-sm">
                <option>18-25</option>
                <option>26-35</option>
                <option>36-45</option>
                <option>46+</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-rose-500 hover:bg-rose-600">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-32 left-0 right-0 z-30 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-8 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
