import Link from "next/link";
import { Heart, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-black/50 backdrop-blur-lg border-t border-white/10 text-white/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-pink-500 fill-pink-500" />
              <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                LoveSync
              </span>
            </div>
            <p className="text-white/60 mb-6 max-w-md">
              LoveSync is a modern matchmaking platform designed to help you
              find meaningful connections and lasting relationships. Our
              AI-powered matching system connects you with compatible partners
              based on your preferences and values.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-white/60 hover:text-pink-500 transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-pink-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-pink-500 transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-pink-500 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-white/60 hover:text-pink-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="text-white/60 hover:text-pink-500 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#testimonials"
                  className="text-white/60 hover:text-pink-500 transition-colors"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-white/60 hover:text-pink-500 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#faq"
                  className="text-white/60 hover:text-pink-500 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-white/60 mb-4">
              Get the latest updates and dating tips delivered to your inbox.
            </p>
            <div className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
              />
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} LoveSync. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="#"
              className="text-white/60 hover:text-pink-500 transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-white/60 hover:text-pink-500 transition-colors text-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-white/60 hover:text-pink-500 transition-colors text-sm"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
