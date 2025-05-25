"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Bell, User, Search, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar at the top of the page
      if (currentScrollY <= 10) {
        setIsVisible(true);
        setIsScrolled(false);
      } else {
        // Hide navbar when scrolling down, show when scrolling up
        setIsVisible(currentScrollY < lastScrollY);
        setIsScrolled(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/70 backdrop-blur-lg shadow-lg" : "bg-transparent"
      } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
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
              href="/"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/profiles"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Browse Profiles
            </Link>
            <Link
              href="#testimonials"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Success Stories
            </Link>
            <Link
              href="/contact"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <Link href="/profiles">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search Profiles</span>
              </Button>
            </Link>

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

            {status === "authenticated" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-[1px] hover:from-pink-600 hover:to-purple-700 h-9 w-9 md:h-10 md:w-10"
                  >
                    <div className="bg-black rounded-full h-full w-full flex items-center justify-center">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <span className="sr-only">My Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-black/80 backdrop-blur-lg border-slate-800 text-white"
                >
                  <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                    <Link
                      href="/my-profile"
                      className="flex items-center w-full"
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                    <Link
                      href="/connections"
                      className="flex items-center w-full"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      My Connections
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                    <Link
                      href="/create-profile"
                      className="flex items-center w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                    <Link href="/settings" className="flex items-center w-full">
                      <span className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                    <Link
                      href="/"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center w-full"
                    >
                      <span className="h-4 w-4 mr-2" />
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/signin">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 text-sm">
                  Sign In
                </Button>
              </Link>
            )}

            {status === "authenticated" && (
              <Link href="/create-profile" className="hidden lg:block">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 text-sm">
                  Create Profile
                </Button>
              </Link>
            )}
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
              href="/"
              className="block py-2 text-white/80 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/profiles"
              className="block py-2 text-white/80 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Profiles
            </Link>
            <Link
              href="#testimonials"
              className="block py-2 text-white/80 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Success Stories
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-white/80 hover:text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {status === "authenticated" ? (
              <>
                <Link
                  href="/my-profile"
                  className="block py-2 text-white/80 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/connections"
                  className="block py-2 text-white/80 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Connections
                </Link>
                <Link
                  href="/create-profile"
                  className="block py-2 text-white/80 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Create Profile
                </Link>
                <Link
                  href="/settings"
                  className="block py-2 text-white/80 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  href="/"
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 text-white/80 hover:text-white"
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link
                href="/signin"
                className="block py-2 text-white/80 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
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
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
