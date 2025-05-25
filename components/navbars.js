"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Bell, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/70 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-7 w-7 text-pink-500 fill-pink-500" />
            <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              LoveSync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              FAQ
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white/80 hover:text-white hover:bg-white/10"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                2
              </span>
              <span className="sr-only">Notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-[1px] hover:from-pink-600 hover:to-purple-700"
                >
                  <div className="bg-black rounded-full h-full w-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="sr-only">My Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-black/80 backdrop-blur-lg border-slate-800 text-white"
              >
                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-lg border-t border-slate-800">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="#features"
              className="block py-2 text-white/80 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="block py-2 text-white/80 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="block py-2 text-white/80 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="block py-2 text-white/80 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex items-center space-x-4 pt-2 border-t border-slate-800">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white/80 hover:text-white hover:bg-white/10"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  2
                </span>
              </Button>
              <Link
                href="#"
                className="flex items-center text-white/80 hover:text-white"
              >
                <User className="h-5 w-5 mr-2" />
                My Profile
              </Link>
            </div>
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
