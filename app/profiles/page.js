"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  MessageCircle,
  ChevronDown,
  SlidersHorizontal,
  Share2,
  Sparkles,
  HeartHandshakeIcon,
  Eye,
  User,
  Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProfilesPage = () => {
  const { data: session, status } = useSession();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ageRange, setAgeRange] = useState([18, 60]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [invitedProfiles, setInvitedProfiles] = useState([]);
  const [invitationMessage, setInvitationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState("");

  // Default placeholder image
  const DEFAULT_IMAGE = "/default-profile.jpg"; // Ensure this image exists in /public

  // Memoized resetFilters function
  const resetFilters = useCallback(async () => {
    setIsResetLoading(true);
    setSearchQuery("");
    setAgeRange([18, 60]);
    setSelectedLocation("All");
    setSelectedGender("All");
    setFilteredProfiles(profiles);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsResetLoading(false);
    toast.success("Filters Reset", {
      description: "All filters have been cleared. Showing all profiles.",
      icon: <Sparkles className="h-5 w-5 text-pink-500" />,
      style: {
        background: "#22c55e",
        color: "#ffffff",
        border: "1px solid #16a34a",
      },
    });
  }, [profiles]);

  // Memoized applyFilters function
  const applyFilters = useCallback(() => {
    console.log("Applying filters with:", {
      searchQuery,
      ageRange,
      selectedLocation,
      selectedGender,
    });
    const filtered = profiles.filter((profile) => {
      const matchesSearch =
        !searchQuery ||
        (profile.name || "")
          .toLowerCase()
          .trim()
          .includes(searchQuery.toLowerCase().trim()) ||
        (profile.occupation || "")
          .toLowerCase()
          .trim()
          .includes(searchQuery.toLowerCase().trim()) ||
        (profile.about || "")
          .toLowerCase()
          .trim()
          .includes(searchQuery.toLowerCase().trim()) ||
        (profile.location || "")
          .toLowerCase()
          .trim()
          .includes(searchQuery.toLowerCase().trim());

      const matchesAge =
        (profile.age || 0) >= ageRange[0] && (profile.age || 0) <= ageRange[1];

      const matchesLocation =
        selectedLocation === "All" ||
        (profile.location || "")
          .toLowerCase()
          .trim()
          .includes(selectedLocation.toLowerCase().trim());

      const matchesGender =
        selectedGender === "All" ||
        (profile.gender || "")
          .toLowerCase()
          .trim()
          .includes(selectedGender.toLowerCase().trim());

      const result =
        matchesSearch && matchesAge && matchesLocation && matchesGender;
      if (!result) {
        console.log(`Profile filtered out:`, {
          id: profile.id,
          name: profile.name,
          age: profile.age,
          location: profile.location,
          gender: profile.gender,
          matches: {
            matchesSearch,
            matchesAge,
            matchesLocation,
            matchesGender,
          },
        });
      }
      return result;
    });

    console.log(`Filtered ${filtered.length} profiles`, filtered);
    setFilteredProfiles(filtered);
  }, [profiles, searchQuery, ageRange, selectedLocation, selectedGender]);

  // Fetch profiles from the database
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/profiles", {
          credentials: "include",
        });
        if (!response.ok) {
          const text = await response.text();
          console.error("Profiles raw response:", {
            status: response.status,
            body: text || "No response body",
          });
          throw new Error(
            `Failed to fetch profiles: ${response.status} ${
              text || "No response body"
            }`
          );
        }
        const data = await response.json();
        console.log("Profiles response:", data);

        if (!Array.isArray(data.profiles)) {
          throw new Error(
            "Invalid response structure: 'profiles' is not an array"
          );
        }

        const approvedProfiles = data.profiles
          .filter((profile) => profile.status === "approved")
          .map((profile) => {
            // Validate photos
            const photos =
              Array.isArray(profile.photos) && profile.photos.length > 0
                ? profile.photos.filter((url) => {
                    try {
                      new URL(url);
                      return true;
                    } catch {
                      console.warn(
                        `Invalid photo URL for profile ${profile._id}: ${url}`
                      );
                      return false;
                    }
                  })
                : [DEFAULT_IMAGE];

            return {
              id: profile._id,
              name: profile.name || "Unknown",
              age: profile.age || 0,
              gender: profile.gender || "Not specified",
              location: profile.location
                ? `${profile.location}, India`
                : "India",
              occupation: profile.occupation || "Not specified",
              education: profile.education?.degree || "Not specified",
              height: profile.height
                ? `${Math.floor(profile.height / 30.48)}\'${Math.round(
                    (profile.height % 30.48) / 2.54
                  )}\"`
                : "Not specified",
              religion: profile.religion || "Not specified",
              caste: profile.caste || "Not specified",
              about: profile.bio || "No bio provided.",
              interests: [
                profile.occupation,
                profile.education?.degree,
                profile.religion,
                profile.hobbies,
              ].filter(Boolean),
              images: photos,
              verified: true, // Assume approved profiles are verified
              premium: Math.random() > 0.5, // Mock premium status
              lastSeen:
                Math.random() > 0.7
                  ? "Online now"
                  : `${Math.floor(Math.random() * 24)} hours ago`,
            };
          });
        console.log(
          `Fetched ${approvedProfiles.length} approved profiles`,
          approvedProfiles
        );
        setProfiles(approvedProfiles);
        setFilteredProfiles(approvedProfiles);
        resetFilters();
      } catch (err) {
        console.error("Fetch profiles error:", err.message, err.stack);
        setError("Failed to load profiles. Please try again.");
        toast.error("Failed to load profiles", {
          description: err.message,
          icon: <Sparkles className="h-5 w-5 text-red-500" />,
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #dc2626",
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [resetFilters]);

  // Fetch sent invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await fetch("/api/requests", {
          credentials: "include",
        });
        if (!response.ok) {
          const text = await response.text();
          console.error("Invitations raw response:", {
            status: response.status,
            body: text || "No response body",
          });
          throw new Error(
            `Failed to fetch invitations: ${response.status} ${
              text || "No response body"
            }`
          );
        }
        const data = await response.json();
        console.log("Invitations response:", data);

        if (!Array.isArray(data.invitations)) {
          throw new Error(
            "Invalid response structure: 'invitations' is not an array"
          );
        }

        const sentProfileIds = data.invitations
          .filter((inv) =>
            ["pending", "accepted", "mutual"].includes(inv.status)
          )
          .map((inv) => inv.targetProfileId);
        console.log(
          `Fetched ${sentProfileIds.length} sent invitations`,
          sentProfileIds
        );
        setInvitedProfiles(sentProfileIds);
      } catch (err) {
        console.error("Fetch invitations error:", err.message, err.stack);
        toast.error("Failed to load invitations", {
          description: err.message,
          icon: <Sparkles className="h-5 w-5 text-red-500" />,
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #dc2626",
          },
        });
      }
    };

    if (status === "authenticated") {
      console.log("Fetching invitations for user:", {
        userId: session?.user?.id,
        role: session?.user?.role,
      });
      fetchInvitations();
    }
  }, [status, session]);

  // Handle form submission
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // Auto-apply filters with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (profiles.length > 0) {
        applyFilters();
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [
    profiles,
    searchQuery,
    ageRange,
    selectedLocation,
    selectedGender,
    applyFilters,
  ]);

  // Handle sending connection invitation
  const handleSendInvitation = async (profileId, name, message) => {
    if (status !== "authenticated") {
      toast.error("Please log in to send an invitation", {
        icon: <Sparkles className="h-5 w-5 text-red-500" />,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
      return;
    }

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetProfileId: profileId, message }),
        credentials: "include",
      });

      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        errorData = { error: response.statusText || "Unknown error" };
      }

      if (!response.ok) {
        console.error("Send invitation failed:", {
          status: response.status,
          error: errorData.error,
        });
        let userFriendlyMessage = errorData.error;
        if (response.status === 404) {
          userFriendlyMessage = "Invitation service is currently unavailable.";
        } else if (response.status === 401) {
          userFriendlyMessage = "Please log in to send an invitation.";
        } else if (response.status === 400 || response.status === 403) {
          userFriendlyMessage = errorData.error;
        } else {
          userFriendlyMessage =
            "An error occurred while sending the invitation.";
        }
        throw new Error(userFriendlyMessage);
      }

      setInvitedProfiles([...invitedProfiles, profileId]);
      toast.success("Invitation Sent!", {
        description: `Your invitation has been sent to ${name}. We\'ll notify you when they respond.`,
        duration: 5000,
        icon: <Sparkles className="h-5 w-5 text-red-500" />,
        style: {
          background: "#22c55e",
          color: "#ffffff",
          border: "1px solid #16a34a",
        },
      });
    } catch (err) {
      console.error("Send invitation error:", err.message, err.stack);
      toast.error("Failed to Send Invitation", {
        description: err.message,
        icon: <Sparkles className="h-5 w-5 text-red-500" />,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  // Handle share profile
  const handleShare = (profileId, profileName) => {
    const shareUrl = `${window.location.origin}/profiles/${profileId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("Profile Link Copied!", {
          description: `The link to ${profileName}\'s profile has been copied to your clipboard.`,
          duration: 3000,
          icon: <Sparkles className="h-5 w-5 text-red-500" />,
          style: {
            background: "#22c55e",
            color: "#ffffff",
            border: "1px solid #16a34a",
          },
        });
      })
      .catch(() => {
        toast.error("Failed to Copy Link", {
          description: "Unable to copy the profile link. Please try again.",
          icon: <Sparkles className="h-5 w-5 text-red-500" />,
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #dc2626",
          },
        });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <style jsx>{`
        .dual-ring {
          display: inline-block;
          width: 64px;
          height: 64px;
          position: relative;
        }
        .dual-ring::after {
          content: " ";
          display: block;
          width: 48px;
          height: 48px;
          margin: 8px;
          border-radius: 50%;
          border: 6px solid transparent;
          border-color: #ec4899 transparent #9333ea transparent;
          animation: dual-ring 1.2s linear infinite;
        }
        @keyframes dual-ring {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .wave-loader {
          display: inline-block;
          width: 80px;
          height: 20px;
          position: relative;
          overflow: hidden;
        }
        .wave-loader::before,
        .wave-loader::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(236, 72, 153, 0.3),
            transparent
          );
          animation: wave 2s linear infinite;
        }
        .wave-loader::after {
          animation-delay: 1s;
        }
        @keyframes wave {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      <Toaster position="top-right" closeButton richColors />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="text-sm font-medium text-white">
                Matrimonial App
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white hover:text-pink-500 transition-colors hidden md:block"
            >
              My Profile
            </Link>
            {status === "authenticated" && (
              <Link
                href="/dashboard#requests"
                className="text-sm font-medium text-white hover:text-pink-500 transition-colors hidden md:block"
              >
                Invitations
              </Link>
            )}
            <Button
              variant="outline"
              className="border-pink-500 text-pink-500 hover:bg-pink-500/10"
              disabled
            >
              <Heart className="h-4 w-4 mr-2" /> My Matches
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Find Your Perfect Match
          </h1>
          <p className="text-white/70 text-lg">
            Browse through verified profiles and connect with compatible
            partners
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-8 shadow-md border border-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16">
            <div className="dual-ring mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">
              Finding your matches...
            </h3>
          </div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <form
                onSubmit={handleSearch}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                  <Input
                    placeholder="Search by name, location, profession..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-between bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Age: {ageRange[0]}-{ageRange[1]} years
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70">
                          {ageRange[0]} years
                        </span>
                        <span className="text-sm text-white/70">
                          {ageRange[1]} years
                        </span>
                      </div>
                      <Slider
                        defaultValue={[18, 60]}
                        min={18}
                        max={60}
                        step={1}
                        value={ageRange}
                        onValueChange={setAgeRange}
                        className="[&_[role=slider]]:bg-pink-500"
                      />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-between bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Location: {selectedLocation}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                    <DropdownMenuItem
                      onClick={() => setSelectedLocation("All")}
                      className="hover:bg-white/10"
                    >
                      All Locations
                    </DropdownMenuItem>
                    {[
                      "Mumbai",
                      "Delhi",
                      "Bangalore",
                      "Chennai",
                      "Hyderabad",
                      "Kolkata",
                      "Pune",
                      "Jaipur",
                    ].map((city) => (
                      <DropdownMenuItem
                        key={city}
                        onClick={() => setSelectedLocation(city)}
                        className="hover:bg-white/10"
                      >
                        {city}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-between bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Gender: {selectedGender}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                    <DropdownMenuItem
                      onClick={() => setSelectedGender("All")}
                      className="hover:bg-white/10"
                    >
                      All Genders
                    </DropdownMenuItem>
                    {["Male", "Female", "Other"].map((gender) => (
                      <DropdownMenuItem
                        key={gender}
                        onClick={() => setSelectedGender(gender)}
                        className="hover:bg-white/10"
                      >
                        {gender}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </form>

              <Sheet>
                <SheetTrigger asChild>
                  <Button className="mt-4 w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Advanced Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-black/80 backdrop-blur-lg border-white/10 text-white">
                  <SheetHeader>
                    <SheetTitle className="text-white">
                      Filter Profiles
                    </SheetTitle>
                    <SheetDescription className="text-white/70">
                      Refine your search to find your perfect match.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Age Range
                      </label>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70">
                          {ageRange[0]} years
                        </span>
                        <span className="text-sm text-white/70">
                          {ageRange[1]} years
                        </span>
                      </div>
                      <Slider
                        defaultValue={[18, 60]}
                        min={18}
                        max={60}
                        step={1}
                        value={ageRange}
                        onValueChange={setAgeRange}
                        className="[&_[role=slider]]:bg-pink-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Location
                      </label>
                      <Select
                        value={selectedLocation}
                        onValueChange={setSelectedLocation}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                          <SelectItem value="All">All Locations</SelectItem>
                          {[
                            "Mumbai",
                            "Delhi",
                            "Bangalore",
                            "Chennai",
                            "Hyderabad",
                            "Kolkata",
                            "Pune",
                            "Jaipur",
                          ].map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">
                        Gender
                      </label>
                      <Select
                        value={selectedGender}
                        onValueChange={setSelectedGender}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                          <SelectItem value="All">All Genders</SelectItem>
                          {["Male", "Female", "Other"].map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <SheetFooter>
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="border-white/20 text-white hover:bg-white/10"
                      disabled={isResetLoading}
                    >
                      {isResetLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-pink-500" />
                      ) : (
                        <Heart className="h-4 w-4 mr-2" />
                      )}
                      Reset Filters
                    </Button>
                    <SheetClose asChild>
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                        Apply Filters
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-white/70">
                Showing {filteredProfiles.length} profiles
              </p>
            </div>

            {/* Profiles Grid */}
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="wave-loader mb-4" />
                <h3 className="text-2xl font-semibold mb-2 text-white">
                  No Matches Found
                </h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  It looks like we cannot find any profiles matching your
                  criteria. Try broadening your search to discover more
                  potential matches!
                </p>
                <Button
                  onClick={resetFilters}
                  disabled={isResetLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                >
                  {isResetLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-pink-500" />
                  ) : (
                    <Heart className="h-4 w-4 mr-2" />
                  )}
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfiles.map((profile) => (
                  <Card
                    key={profile.id}
                    className="overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group"
                  >
                    <div className="relative">
                      <Image
                        src={profile.images[0]}
                        alt={profile.name}
                        width={300}
                        height={400}
                        className="w-full h-80 object-cover"
                        onError={(e) => {
                          console.warn(
                            `Failed to load image for profile ${profile.id}: ${profile.images[0]}`
                          );
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />

                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {profile.verified && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            Verified
                          </Badge>
                        )}
                        {profile.premium && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            Premium
                          </Badge>
                        )}
                      </div>

                      {/* Online Status */}
                      <div className="absolute top-3 right-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            profile.lastSeen === "Online now"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Link href={`/profiles/${profile.id}`}>
                          <Button
                            size="sm"
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
                          >
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                          onClick={() => handleShare(profile.id, profile.name)}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-white">
                          {profile.name}, {profile.age}
                        </h3>
                        <span className="text-xs text-white/60">
                          {profile.lastSeen}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-white/70 text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                          {profile.location}
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <Briefcase className="h-4 w-4 mr-2 text-pink-500" />
                          {profile.occupation}
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <GraduationCap className="h-4 w-4 mr-2 text-pink-500" />
                          {profile.education}
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <User className="h-4 w-4 mr-2 text-pink-500" />
                          {profile.gender}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {profile.interests
                          .slice(0, 2)
                          .map((interest, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs border-pink-500/30 text-pink-400"
                            >
                              {interest}
                            </Badge>
                          ))}
                        {profile.interests.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-white/30 text-white/60"
                          >
                            +{profile.interests.length - 2} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/profiles/${profile.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              className={`${
                                invitedProfiles.includes(profile.id)
                                  ? "bg-pink-100 text-pink-600 hover:bg-pink-100 cursor-default"
                                  : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                              }`}
                              disabled={
                                invitedProfiles.includes(profile.id) ||
                                status !== "authenticated"
                              }
                            >
                              {invitedProfiles.includes(profile.id) ? (
                                <>
                                  <HeartHandshakeIcon className="h-4 w-4 mr-1 text-pink-500" />
                                  Invited
                                </>
                              ) : (
                                <>
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Connect
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          {!invitedProfiles.includes(profile.id) && (
                            <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <Sparkles className="h-5 w-5 text-pink-500" />
                                  Send an Invitation
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-white/70">
                                  you are about to send a connection invitation
                                  to {profile.name}. They will be notified and
                                  can choose to accept or decline.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-pink-200">
                                    <Image
                                      src={profile.images[0]}
                                      alt={profile.name}
                                      fill
                                      className="object-cover"
                                      onError={(e) => {
                                        console.warn(
                                          `Failed to load thumbnail for profile ${profile.id}`
                                        );
                                        e.target.src = DEFAULT_IMAGE;
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-white">
                                      {profile.name}, {profile.age}
                                    </h4>
                                    <p className="text-sm text-white/70">
                                      {profile.location}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <label className="text-sm font-medium text-white">
                                    Add a personal message (optional)
                                  </label>
                                  <textarea
                                    className="mt-1 w-full rounded-md border border-white/20 bg-white/10 p-2 text-sm text-white focus:border-pink-500 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                                    rows={3}
                                    placeholder="Hi! I found your profile interesting and would love to connect..."
                                    value={invitationMessage}
                                    onChange={(e) =>
                                      setInvitationMessage(e.target.value)
                                    }
                                  ></textarea>
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                  onClick={() => {
                                    handleSendInvitation(
                                      profile.id,
                                      profile.name,
                                      invitationMessage
                                    );
                                    setInvitationMessage("");
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Send Invitation
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Load More */}
            <div className="text-center mt-12">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
                Load More Profiles
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ProfilesPage;
