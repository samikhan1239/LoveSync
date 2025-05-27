"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Heart, Mail, Lock, ArrowRight } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || `Registration failed: ${res.statusText}`);
        setIsLoading(false);
        return;
      }
      if (result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed: " + error.message);
      setIsLoading(false);
    }
  };

  // Animated background particles
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1,
        when: "beforeChildren",
        staggerChildren: 0.3,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const heartVariants = {
    hidden: { scale: 0, rotate: -45 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const particleVariants = {
    animate: (i) => ({
      y: [0, -1200],
      opacity: [0, 0.7, 0],
      scale: [1, 1.2, 1],
      transition: {
        y: { duration: i.duration, repeat: Infinity, ease: "linear" },
        opacity: { duration: i.duration, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: i.duration, repeat: Infinity, ease: "easeInOut" },
        delay: i.delay,
      },
    }),
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 md:py-24 relative overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            custom={particle}
            variants={particleVariants}
            animate="animate"
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
          >
            <Heart className="text-pink-400/40 fill-pink-400/20" />
          </motion.div>
        ))}
        <div className="absolute top-1/3 left-1/5 w-[350px] h-[350px] bg-pink-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/5 right-1/5 w-[450px] h-[450px] bg-purple-500/15 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-10 md:gap-16 px-6 md:px-12 relative z-10">
        {/* Left Side: About LoveSync */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:w-1/2 flex flex-col justify-center p-8 md:p-12 text-white"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center mb-8 md:mb-10"
          >
            <motion.div variants={heartVariants}>
              <Heart className="h-14 w-14 text-pink-400 mr-4 animate-pulse" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent leading-snug">
              LoveSync
            </h1>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-3xl md:text-4xl font-semibold mb-6 md:mb-8 text-white/90"
          >
            Find Your Soulmate Today
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-white/80 mb-8 md:mb-10 leading-relaxed max-w-lg"
          >
            LoveSync connects you with like-minded individuals seeking
            meaningful, lifelong partnerships. Start your journey to love with a
            platform built on trust and compatibility.
          </motion.p>
          <motion.ul
            variants={itemVariants}
            className="space-y-5 text-white/80 text-lg md:text-xl max-w-md"
          >
            <motion.li variants={itemVariants} className="flex items-start">
              <Heart
                className="h-7 w-7 text-pink-400 mr-4 mt-1 animate-pulse"
                style={{ animationDelay: "0.1s" }}
              />
              <span>
                Personalized matching based on your values and preferences
              </span>
            </motion.li>
            <motion.li variants={itemVariants} className="flex items-start">
              <Heart
                className="h-7 w-7 text-pink-400 mr-4 mt-1 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <span>
                Secure and private environment for authentic connections
              </span>
            </motion.li>
            <motion.li variants={itemVariants} className="flex items-start">
              <Heart
                className="h-7 w-7 text-pink-400 mr-4 mt-1 animate-pulse"
                style={{ animationDelay: "0.3s" }}
              />
              <span>
                Join thousands of singles ready for lasting relationships
              </span>
            </motion.li>
          </motion.ul>
          <motion.div variants={itemVariants} className="mt-10">
            <Button
              asChild
              className="bg-transparent border-2 border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white text-lg font-semibold py-6 px-8 rounded-full transition-all duration-300"
            >
              <Link href="/about">Learn More About LoveSync</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Side: Registration Form */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="md:w-1/2 w-full max-w-md"
        >
          <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl">
            <CardHeader className="space-y-3 flex flex-col items-center text-center p-6 md:p-10">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 mb-5"
              >
                <Heart className="h-8 w-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-white">
                Create Your{" "}
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  LoveSync Profile
                </span>
              </CardTitle>
              <CardDescription className="text-white/70 text-lg md:text-xl">
                Begin your journey to find true love
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                  <Label
                    htmlFor="email"
                    className="text-white text-lg md:text-xl"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-6 w-6" />
                    <Input
                      id="email"
                      {...register("email")}
                      placeholder="name@example.com"
                      className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-400 rounded-lg text-lg md:text-xl"
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-400 text-sm md:text-base mt-2"
                        >
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label
                    htmlFor="password"
                    className="text-white text-lg md:text-xl"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-6 w-6" />
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder="••••••••"
                      className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-400 rounded-lg text-lg md:text-xl"
                    />
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-400 text-sm md:text-base mt-2"
                        >
                          {errors.password.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center text-sm md:text-base"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white border-0 h-14 rounded-lg text-lg md:text-xl font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                  {!isLoading && <ArrowRight className="ml-3 h-6 w-6" />}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-5 text-center p-6 md:p-10">
              <div className="text-base md:text-lg text-white/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Sign in
                </Link>
              </div>
              <div className="text-sm md:text-base text-white/50">
                By registering, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-white/70">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-white/70">
                  Privacy Policy
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
