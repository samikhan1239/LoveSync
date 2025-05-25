"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Basic features to get you started",
    features: [
      { included: true, text: "Create a profile" },
      { included: true, text: "Browse profiles" },
      { included: true, text: "5 matches per day" },
      { included: false, text: "Advanced filters" },
      { included: false, text: "Unlimited messaging" },
      { included: false, text: "See who liked you" },
      { included: false, text: "Priority support" },
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "$19.99",
    period: "per month",
    description: "Everything you need to find your match",
    features: [
      { included: true, text: "Create a profile" },
      { included: true, text: "Browse profiles" },
      { included: true, text: "Unlimited matches" },
      { included: true, text: "Advanced filters" },
      { included: true, text: "Unlimited messaging" },
      { included: true, text: "See who liked you" },
      { included: false, text: "Priority support" },
    ],
    buttonText: "Get Premium",
    popular: true,
  },
  {
    name: "VIP",
    price: "$39.99",
    period: "per month",
    description: "Premium features with VIP treatment",
    features: [
      { included: true, text: "Create a profile" },
      { included: true, text: "Browse profiles" },
      { included: true, text: "Unlimited matches" },
      { included: true, text: "Advanced filters" },
      { included: true, text: "Unlimited messaging" },
      { included: true, text: "See who liked you" },
      { included: true, text: "Priority support" },
    ],
    buttonText: "Get VIP",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32 relative">
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
              Pricing Plans
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Choose the Perfect{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Plan
            </span>{" "}
            for You
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            We offer flexible plans to suit your needs. Start for free or
            upgrade for premium features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-6 rounded-2xl border ${
                plan.popular
                  ? "border-pink-500/50 bg-gradient-to-b from-pink-500/10 to-purple-600/10"
                  : "border-white/10 bg-white/5"
              } backdrop-blur-sm`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="px-4 py-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2 text-white">
                  {plan.name}
                </h3>
                <div className="flex items-end justify-center mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-white/70 ml-1">{plan.period}</span>
                  )}
                </div>
                <p className="text-white/70">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-pink-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-white/30 mr-2 flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included ? "text-white" : "text-white/50"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
