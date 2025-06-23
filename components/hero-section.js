"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/bg6.png", "/bg4.png", "/bg1.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-block px-3 py-1 mb-6 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-600/10 border border-pink-500/20 backdrop-blur-sm">
              <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Find your perfect match today
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-[1.5]">
              Where{" "}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Love
              </span>{" "}
              Stories Begin
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl mx-auto lg:mx-0">
              Join thousands of singles who have found their perfect match on
              our platform. Our AI-powered matching system connects you with
              compatible partners.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 h-12 px-6"
                >
                  Create Free Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Browse Matches
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <div className="flex items-center text-white/70">
                <CheckCircle2 className="h-5 w-5 text-pink-500 mr-2" />
                <span>Verified Profiles</span>
              </div>
              <div className="flex items-center text-white/70">
                <CheckCircle2 className="h-5 w-5 text-pink-500 mr-2" />
                <span>Privacy Focused</span>
              </div>
              <div className="flex items-center text-white/70">
                <CheckCircle2 className="h-5 w-5 text-pink-500 mr-2" />
                <span>AI Matching</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-[500px] w-full max-w-[500px] mx-auto">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-full blur-[100px] z-0" />

              {/* Image container with glass effect */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm bg-white/5 z-10">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImage ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`Couple ${index + 1}`}
                      fill
                      className="object-cover rounded-3xl"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>

              {/* Floating cards */}
              <div className="absolute -top-6 -left-6 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl z-20 w-48 animate-float">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div className="ml-2">
                    <div className="text-white font-medium">Jessica, 28</div>
                    <div className="text-white/60 text-xs">New York</div>
                  </div>
                </div>
                <div className="text-white/80 text-sm">
                  Just matched with David!
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 shadow-xl z-20 w-48 animate-float-delayed">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="ml-2">
                    <div className="text-white font-medium">Michael, 32</div>
                    <div className="text-white/60 text-xs">London</div>
                  </div>
                </div>
                <div className="text-white/80 text-sm">
                  5 new matches today!
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
