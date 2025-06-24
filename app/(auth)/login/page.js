"use client";

import { signIn, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
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
    setError(""); // Clear previous errors
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setError(result.error);
      toast.error(result.error, {
        description: "Login Failed",
      });
      setIsLoading(false);
      return;
    }

    // Fetch session to get user role
    try {
      const session = await getSession();
      if (!session) {
        throw new Error("Failed to establish session");
      }
      toast.success("Login successful!", {
        description: `Welcome back, ${session.user.email}!`,
        style: {
          background: "#22c55e",
          color: "#ffffff",
          border: "1px solid #16a34a",
        },
      });
      if (session.user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/user");
      }
    } catch (err) {
      setError("Failed to fetch session. Please try again.");
      toast.error("Failed to fetch session", {
        description: err.message,
      });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-lg">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-white/70">
            Sign in to your LoveSync account to continue your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <Input
                  id="email"
                  {...register("email")}
                  placeholder="name@example.com"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm text-white/70">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              Sign up
            </Link>
          </div>
          <div className="text-xs text-white/50">
            By signing in, you agree to our{" "}
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
    </div>
  );
}
