"use client";

import { motion } from "framer-motion";
import { Users, Heart, MessageSquare, Calendar } from "lucide-react";

const stats = [
  {
    icon: <Users className="h-8 w-8 text-pink-500" />,
    value: "2M+",
    label: "Active Users",
  },
  {
    icon: <Heart className="h-8 w-8 text-pink-500" />,
    value: "150K+",
    label: "Successful Matches",
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-pink-500" />,
    value: "10M+",
    label: "Messages Daily",
  },
  {
    icon: <Calendar className="h-8 w-8 text-pink-500" />,
    value: "5K+",
    label: "Dates Every Day",
  },
];

export default function StatisticsSection() {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-600/10 z-0" />
      <div className="absolute inset-0 backdrop-blur-3xl z-0" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4">
                {stat.icon}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </h3>
              <p className="text-white/70">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
