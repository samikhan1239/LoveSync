"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Shield,
  Search,
  MessageCircle,
  UserCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: <Heart className="h-6 w-6 text-pink-500" />,
    title: "Smart Matching",
    description:
      "Our AI algorithm analyzes your preferences and behavior to suggest the most compatible matches.",
  },
  {
    icon: <Shield className="h-6 w-6 text-pink-500" />,
    title: "Verified Profiles",
    description:
      "All profiles are manually verified to ensure you're connecting with real people.",
  },
  {
    icon: <Search className="h-6 w-6 text-pink-500" />,
    title: "Advanced Filters",
    description:
      "Find exactly what you're looking for with our detailed search filters and preferences.",
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-pink-500" />,
    title: "Secure Messaging",
    description:
      "End-to-end encrypted messaging keeps your conversations private and secure.",
  },
  {
    icon: <UserCheck className="h-6 w-6 text-pink-500" />,
    title: "Compatibility Tests",
    description:
      "Take our in-depth compatibility tests to find your perfect match based on values and interests.",
  },
  {
    icon: <Sparkles className="h-6 w-6 text-pink-500" />,
    title: "Virtual Dates",
    description:
      "Get to know your matches better with our integrated video calling feature.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

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
              Our Features
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Everything You Need to Find{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              The One
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Our platform is designed with cutting-edge features to make your
            journey to finding love smooth, secure, and successful.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
