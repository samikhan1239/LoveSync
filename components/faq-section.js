"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the matching algorithm work?",
    answer:
      "Our AI-powered matching algorithm analyzes your profile information, preferences, and behavior on the platform to suggest compatible matches. It takes into account factors like interests, values, and relationship goals to find the best potential partners for you.",
  },
  {
    question: "Is my personal information secure?",
    answer:
      "Yes, we take privacy and security very seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent, and our messaging system is end-to-end encrypted for your privacy.",
  },
  {
    question: "Can I use the platform for free?",
    answer:
      "Yes, we offer a free basic membership that allows you to create a profile, browse other profiles, and receive a limited number of matches daily. For additional features like unlimited messaging and advanced filters, you can upgrade to our Premium or VIP plans.",
  },
  {
    question: "How do you verify profiles?",
    answer:
      "We use a combination of AI verification and manual review to ensure all profiles are genuine. Users can verify their profiles through photo verification, social media linking, and ID verification for an additional trust badge.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. If you cancel, you'll continue to have access to premium features until the end of your current billing period.",
  },
  {
    question: "What makes LoveSync different from other dating platforms?",
    answer:
      "LoveSync focuses on meaningful connections rather than casual dating. Our advanced AI matching, verified profiles, and compatibility tests are designed to help you find a long-term partner who truly matches your values and lifestyle.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null); // Fixed from TypeScript to JS

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-32 relative">
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
              FAQ
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Find answers to common questions about our platform and how it
            works.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-4"
            >
              <button
                onClick={() => toggleFaq(index)}
                className={`w-full p-5 rounded-xl text-left flex justify-between items-center transition-colors ${
                  openIndex === index
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <span className="font-medium text-white">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-white/70 transition-transform ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 mt-2" : "max-h-0"
                }`}
              >
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white/70">{faq.answer}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
