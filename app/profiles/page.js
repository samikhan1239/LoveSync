"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { debounce } from "lodash";
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
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [recommendedProfiles, setRecommendedProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ageRange, setAgeRange] = useState([18, 60]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedCaste, setSelectedCaste] = useState("All");
  const [selectedReligion, setSelectedReligion] = useState("All");
  const [invitedProfiles, setInvitedProfiles] = useState([]);
  const [invitationMessage, setInvitationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("recommended");

  const DEFAULT_IMAGE = "/default-profile.jpg";

  const casteOptions = ["All", "General", "OBC", "SC/ST"]; // Aligned with backend schema
  const religionOptions = [
    "All",
    "Hindu",
    "Muslim",
    "Christian",
    "Sikh",
    "Jain",
    "Buddhist",
    "Jewish",
    "Parsi",
    "Baháʼí",
    "Other",
  ]; // Aligned with backend schema

  const resetFilters = useCallback(async () => {
    setIsResetLoading(true);
    setSearchQuery("");
    setAgeRange([18, 60]);
    setSelectedLocation("All");
    setSelectedGender("All");
    setSelectedCaste("All");
    setSelectedReligion("All");
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

  const applyFilters = useCallback(() => {
    console.log("Applying filters with:", {
      searchQuery,
      ageRange,
      selectedLocation,
      selectedGender,
      selectedCaste,
      selectedReligion,
    });

    const filtered = profiles.filter((profile) => {
      const name = (profile.name || "").toLowerCase().trim();
      const occupation = (profile.occupation || "").toLowerCase().trim();
      const bio = (profile.bio || "").toLowerCase().trim();
      const location = (profile.location || "").toLowerCase().trim();
      const gender = (profile.gender || "").toLowerCase().trim();
      const caste = (profile.caste || "not specified").toLowerCase().trim();
      const religion = (profile.religion || "not specified")
        .toLowerCase()
        .trim();
      const age = profile.age || 0;

      const searchTerm = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchTerm ||
        name.includes(searchTerm) ||
        occupation.includes(searchTerm) ||
        bio.includes(searchTerm) ||
        location.includes(searchTerm);

      const matchesAge = age >= ageRange[0] && age <= ageRange[1];

      const matchesLocation =
        selectedLocation === "All" ||
        location.includes(selectedLocation.toLowerCase().trim());

      const matchesGender =
        selectedGender === "All" ||
        gender === selectedGender.toLowerCase().trim();

      const matchesCaste =
        selectedCaste === "All" || caste === selectedCaste.toLowerCase().trim();

      const matchesReligion =
        selectedReligion === "All" ||
        religion === selectedReligion.toLowerCase().trim();

      const result =
        matchesSearch &&
        matchesAge &&
        matchesLocation &&
        matchesGender &&
        matchesCaste &&
        matchesReligion;

      if (!result) {
        console.log(`Profile filtered out:`, {
          userId: profile.userId,
          name,
          age,
          location,
          gender,
          caste,
          religion,
          matches: {
            matchesSearch,
            matchesAge,
            matchesLocation,
            matchesGender,
            matchesCaste,
            matchesReligion,
          },
        });
      }

      return result;
    });

    console.log(`Filtered ${filtered.length} profiles`, filtered);
    setFilteredProfiles(filtered);
  }, [
    profiles,
    searchQuery,
    ageRange,
    selectedLocation,
    selectedGender,
    selectedCaste,
    selectedReligion,
  ]);

  const debouncedApplyFilters = useCallback(
    debounce(() => {
      applyFilters();
    }, 300),
    [applyFilters]
  );

  const applyRecommendedFilters = useCallback(() => {
    if (!userProfile || !profiles.length) return;

    console.log("Applying recommended filters with user profile:", userProfile);
    const filtered = profiles.filter((profile) => {
      if (profile.userId === userProfile.userId) return false;

      const matchesAge =
        (profile.age || 0) >= (userProfile.partnerPreferences?.minAge || 18) &&
        (profile.age || 0) <= (userProfile.partnerPreferences?.maxAge || 60);

      const matchesLocation =
        !userProfile.partnerPreferences?.location ||
        (profile.location || "")
          .toLowerCase()
          .trim()
          .includes(
            userProfile.partnerPreferences.location.toLowerCase().trim()
          );

      const matchesGender =
        !userProfile.partnerPreferences?.gender ||
        (profile.gender || "")
          .toLowerCase()
          .trim()
          .includes(userProfile.partnerPreferences.gender.toLowerCase().trim());

      const matchesCaste =
        !userProfile.partnerPreferences?.caste ||
        (profile.caste || "not specified")
          .toLowerCase()
          .trim()
          .includes(userProfile.partnerPreferences.caste.toLowerCase().trim());

      const matchesReligion =
        !userProfile.partnerPreferences?.religion ||
        (profile.religion || "not specified")
          .toLowerCase()
          .trim()
          .includes(
            userProfile.partnerPreferences.religion.toLowerCase().trim()
          );

      const result =
        matchesAge &&
        matchesLocation &&
        matchesGender &&
        matchesCaste &&
        matchesReligion;

      if (!result) {
        console.log(`Recommended profile filtered out:`, {
          userId: profile.userId,
          name: profile.name,
          age: profile.age,
          location: profile.location,
          gender: profile.gender,
          caste: profile.caste,
          religion: profile.religion,
          matches: {
            matchesAge,
            matchesLocation,
            matchesGender,
            matchesCaste,
            matchesReligion,
          },
        });
      }
      return result;
    });

    console.log(`Recommended ${filtered.length} profiles`, filtered);
    setRecommendedProfiles(filtered);
  }, [userProfile, profiles]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status !== "authenticated" || !session?.user?.id) return;

      try {
        const response = await fetch("/api/profiles/me", {
          credentials: "include",
        });
        if (!response.ok) {
          if (response.status === 404) {
            console.log("No user profile found, redirecting to create-profile");
            toast.info("Please create your profile to view matches.", {
              action: {
                label: "Create Profile",
                onClick: () => router.push("/dashboard/user"),
              },
            });
            router.push("/dashboard/user");
            return;
          }
          const text = await response.text();
          console.error("User profile raw response:", {
            status: response.status,
            body: text || "No response body",
          });
          throw new Error(
            `Failed to fetch user profile: ${response.status} ${
              text || "No response body"
            }`
          );
        }
        const data = await response.json();
        console.log("User profile response:", data);

        setUserProfile({
          userId: data.profile.userId,
          partnerPreferences: {
            minAge: data.profile.partnerAgeMin || 18,
            maxAge: data.profile.partnerAgeMax || 60,
            location: data.profile.location || "",
            gender: data.profile.gender || "",
            caste: data.profile.partnerCaste || "",
            religion: data.profile.partnerReligion || "",
          },
        });
      } catch (err) {
        console.error("Fetch user profile error:", err.message, err.stack);
        toast.error("Failed to load user profile", {
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

    fetchUserProfile();
  }, [status, session, router]);

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
            const photos =
              Array.isArray(profile.photos) && profile.photos.length > 0
                ? profile.photos.filter((url) => {
                    try {
                      new URL(url);
                      return true;
                    } catch {
                      console.warn(
                        `Invalid photo URL for profile ${profile.userId}: ${url}`
                      );
                      return false;
                    }
                  })
                : [DEFAULT_IMAGE];

            return {
              userId: profile.userId,
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
              bio: profile.bio || "No bio provided.",
              partnerPreferences: {
                caste: profile.partnerCaste || "Not specified",
                religion: profile.partnerReligion || "Not specified",
              },
              interests: [
                profile.occupation,
                profile.education?.degree,
                profile.religion,
                profile.hobbies,
              ].filter(Boolean),
              images: photos,
              verified: true,
              premium: Math.random() > 0.5,
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
  }, []);

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

  useEffect(() => {
    if (userProfile && profiles.length > 0) {
      applyRecommendedFilters();
    }
  }, [userProfile, profiles, applyRecommendedFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveTab("filtered");
    debouncedApplyFilters();
  };

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
        description: `Your invitation has been sent to ${name}. We'll notify you when they respond.`,
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

  const handleShare = (profileId, profileName) => {
    const shareUrl = `${window.location.origin}/profiles/${profileId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("Profile Link Copied!", {
          description: `The link to ${profileName}'s profile has been copied to your clipboard.`,
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

  const handleImageError = (profileId) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.userId === profileId ? { ...p, images: [DEFAULT_IMAGE] } : p
      )
    );
    setFilteredProfiles((prev) =>
      prev.map((p) =>
        p.userId === profileId ? { ...p, images: [DEFAULT_IMAGE] } : p
      )
    );
    setRecommendedProfiles((prev) =>
      prev.map((p) =>
        p.userId === profileId ? { ...p, images: [DEFAULT_IMAGE] } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
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

      <main className="container mx-auto px-4 py-20">
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
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8 shadow-md border border-red-200">
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
            <div className="mb-8 p-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
              <form
                onSubmit={handleSearch}
                className="grid grid-cols-1 md:grid-cols-5 gap-4"
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-between bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Caste: {selectedCaste}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                    {casteOptions.map((caste) => (
                      <DropdownMenuItem
                        key={caste}
                        onClick={() => setSelectedCaste(caste)}
                        className="hover:bg-white/10"
                      >
                        {caste}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </form>

              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
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
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Preferred Caste
                        </label>
                        <Select
                          value={selectedCaste}
                          onValueChange={setSelectedCaste}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select caste" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                            {casteOptions.map((caste) => (
                              <SelectItem key={caste} value={caste}>
                                {caste}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                          Preferred Religion
                        </label>
                        <Select
                          value={selectedReligion}
                          onValueChange={setSelectedReligion}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="Select religion" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                            {religionOptions.map((religion) => (
                              <SelectItem key={religion} value={religion}>
                                {religion}
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
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                        <Button
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                          onClick={() => {
                            setActiveTab("filtered");
                            debouncedApplyFilters();
                          }}
                        >
                          Apply Filters
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                <Button
                  className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                  onClick={() => {
                    setActiveTab("filtered");
                    debouncedApplyFilters();
                  }}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Apply Filter
                </Button>
              </div>
            </div>

            <div className="mb-8">
              <nav className="flex space-x-4 border-b border-white/20">
                {status === "authenticated" && (
                  <button
                    onClick={() => setActiveTab("recommended")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "recommended"
                        ? "border-b-2 border-pink-500 text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    Recommended Profiles ({recommendedProfiles.length})
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "all"
                      ? "border-b-2 border-pink-500 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  All Profiles ({profiles.length})
                </button>
                <button
                  onClick={() => setActiveTab("filtered")}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "filtered"
                      ? "border-b-2 border-pink-500 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Filtered Profiles ({filteredProfiles.length})
                </button>
              </nav>
            </div>

            <div className="mb-12">
              {activeTab === "recommended" && status === "authenticated" && (
                <>
                  {recommendedProfiles.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <div className="wave-loader mb-4" />
                      <h3 className="text-2xl font-semibold mb-2 text-white">
                        No Recommended Profiles
                      </h3>
                      <p className="text-white/70 mb-6 max-w-md mx-auto">
                        We couldn't find profiles matching your preferences. Try
                        updating your partner preferences!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendedProfiles.map((profile) => (
                        <Card
                          key={profile.userId}
                          className="w-full max-w-md mx-auto overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group rounded-lg shadow-md hover:shadow-lg"
                        >
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={profile.images[0]}
                              alt={profile.name}
                              fill
                              className="object-contain object-top rounded-t-lg"
                              onError={() => handleImageError(profile.userId)}
                            />
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {profile.verified && (
                                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                                  Verified
                                </Badge>
                              )}
                              {profile.premium && (
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="absolute top-2 right-2">
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  profile.lastSeen === "Online now"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }`}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                              <Link href={`/profiles/${profile.userId}`}>
                                <Button
                                  size="sm"
                                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20 text-xs"
                                >
                                  View Profile
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 text-xs"
                                onClick={() =>
                                  handleShare(profile.userId, profile.name)
                                }
                              >
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-base text-white">
                                {profile.name}, {profile.age}
                              </h3>
                              <span className="text-xs text-white/60">
                                {profile.lastSeen}
                              </span>
                            </div>
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center text-white/70 text-xs">
                                <MapPin className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.location}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <Briefcase className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.occupation}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <GraduationCap className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.education}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <User className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.gender}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <Sparkles className="h-3 w-3 mr-1.5 text-pink-500" />
                                Religion: {profile.religion}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <Sparkles className="h-3 w-3 mr-1.5 text-pink-500" />
                                Caste: {profile.caste}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
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
                                href={`/profiles/${profile.userId}`}
                                className="flex-1"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Profile
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className={`${
                                      invitedProfiles.includes(profile.userId)
                                        ? "bg-pink-100 text-pink-600 hover:bg-pink-100 cursor-default"
                                        : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                                    } text-xs`}
                                    disabled={
                                      invitedProfiles.includes(
                                        profile.userId
                                      ) || status !== "authenticated"
                                    }
                                  >
                                    {invitedProfiles.includes(
                                      profile.userId
                                    ) ? (
                                      <>
                                        <HeartHandshakeIcon className="h-3 w-3 mr-1 text-pink-500" />
                                        Invited
                                      </>
                                    ) : (
                                      <>
                                        <MessageCircle className="h-3 w-3 mr-1" />
                                        Connect
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                {!invitedProfiles.includes(profile.userId) && (
                                  <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-pink-500" />
                                        Send an Invitation
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-white/70">
                                        You are about to send a connection
                                        invitation to {profile.name}. They will
                                        be notified and can choose to accept or
                                        decline.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-4">
                                      <div className="flex items-center gap-4">
                                        <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-pink-200">
                                          <Image
                                            src={profile.images[0]}
                                            alt={profile.name}
                                            fill
                                            className="object-contain"
                                            onError={() =>
                                              handleImageError(profile.userId)
                                            }
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
                                      <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                        onClick={() => {
                                          handleSendInvitation(
                                            profile.userId,
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
                </>
              )}

              {activeTab === "all" && (
                <>
                  {profiles.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                      <div className="wave-loader mb-4" />
                      <h3 className="text-2xl font-semibold mb-2 text-white">
                        No Profiles Available
                      </h3>
                      <p className="text-white/70 mb-6 max-w-md mx-auto">
                        No profiles are currently available. Please check back
                        later.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profiles.map((profile) => (
                        <Card
                          key={profile.userId}
                          className="w-full max-w-md mx-auto overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group rounded-lg shadow-md hover:shadow-lg"
                        >
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={profile.images[0]}
                              alt={profile.name}
                              fill
                              className="object-contain rounded-t-lg"
                              onError={() => handleImageError(profile.userId)}
                            />
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {profile.verified && (
                                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                                  Verified
                                </Badge>
                              )}
                              {profile.premium && (
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="absolute top-2 right-2">
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  profile.lastSeen === "Online now"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }`}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                              <Link href={`/profiles/${profile.userId}`}>
                                <Button
                                  size="sm"
                                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20 text-xs"
                                >
                                  View Profile
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 text-xs"
                                onClick={() =>
                                  handleShare(profile.userId, profile.name)
                                }
                              >
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-base text-white">
                                {profile.name}, {profile.age}
                              </h3>
                              <span className="text-xs text-white/60">
                                {profile.lastSeen}
                              </span>
                            </div>
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center text-white/70 text-xs">
                                <MapPin className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.location}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <Briefcase className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.occupation}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <GraduationCap className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.education}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <User className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.gender}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <Sparkles className="h-3 w-3 mr-1.5 text-pink-500" />
                                Religion: {profile.religion}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <Sparkles className="h-3 w-3 mr-1.5 text-pink-500" />
                                Caste: {profile.caste}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
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
                                href={`/profiles/${profile.userId}`}
                                className="flex-1"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Profile
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className={`${
                                      invitedProfiles.includes(profile.userId)
                                        ? "bg-pink-100 text-pink-600 hover:bg-pink-100 cursor-default"
                                        : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                                    } text-xs`}
                                    disabled={
                                      invitedProfiles.includes(
                                        profile.userId
                                      ) || status !== "authenticated"
                                    }
                                  >
                                    {invitedProfiles.includes(
                                      profile.userId
                                    ) ? (
                                      <>
                                        <HeartHandshakeIcon className="h-3 w-3 mr-1 text-pink-500" />
                                        Invited
                                      </>
                                    ) : (
                                      <>
                                        <MessageCircle className="h-3 w-3 mr-1" />
                                        Connect
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                {!invitedProfiles.includes(profile.userId) && (
                                  <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-pink-500" />
                                        Send an Invitation
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-white/70">
                                        You are about to send a connection
                                        invitation to {profile.name}. They will
                                        be notified and can choose to accept or
                                        decline.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-4">
                                      <div className="flex items-center gap-4">
                                        <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-pink-200">
                                          <Image
                                            src={profile.images[0]}
                                            alt={profile.name}
                                            fill
                                            className="object-contain"
                                            onError={() =>
                                              handleImageError(profile.userId)
                                            }
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
                                      <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                        onClick={() => {
                                          handleSendInvitation(
                                            profile.userId,
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
                </>
              )}

              {activeTab === "filtered" && (
                <>
                  {filteredProfiles.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProfiles.map((profile) => (
                        <Card
                          key={profile.userId}
                          className="w-full max-w-md mx-auto overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group rounded-lg shadow-md hover:shadow-lg"
                        >
                          <div className="relative aspect-[4/3]">
                            <Image
                              src={profile.images[0]}
                              alt={profile.name}
                              fill
                              className="object-contain rounded-t-lg"
                              onError={() => handleImageError(profile.userId)}
                            />
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {profile.verified && (
                                <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                                  Verified
                                </Badge>
                              )}
                              {profile.premium && (
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="absolute top-2 right-2">
                              <div
                                className={`w-2.5 h-2.5 rounded-full ${
                                  profile.lastSeen === "Online now"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }`}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                              <Link href={`/profiles/${profile.userId}`}>
                                <Button
                                  size="sm"
                                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20 text-xs"
                                >
                                  View Profile
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 text-xs"
                                onClick={() =>
                                  handleShare(profile.userId, profile.name)
                                }
                              >
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-base text-white">
                                {profile.name}, {profile.age}
                              </h3>
                              <span className="text-xs text-white/60">
                                {profile.lastSeen}
                              </span>
                            </div>
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center text-white/70 text-xs">
                                <MapPin className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.location}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <Briefcase className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.occupation}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <GraduationCap className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.education}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <User className="h-3 w-3 mr-1.5 text-pink-500" />
                                {profile.gender}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <Sparkles className="h-3 w-3 mr-1.5 text-pink-500" />
                                Religion: {profile.religion}
                              </div>
                              <div className="flex items-center text-white/70 text-xs">
                                <Sparkles className="h-3 w-3 mr-1.5 text-pink-500" />
                                Caste: {profile.caste}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
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
                                href={`/profiles/${profile.userId}`}
                                className="flex-1"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Profile
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className={`${
                                      invitedProfiles.includes(profile.userId)
                                        ? "bg-pink-100 text-pink-600 hover:bg-pink-100 cursor-default"
                                        : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                                    } text-xs`}
                                    disabled={
                                      invitedProfiles.includes(
                                        profile.userId
                                      ) || status !== "authenticated"
                                    }
                                  >
                                    {invitedProfiles.includes(
                                      profile.userId
                                    ) ? (
                                      <>
                                        <HeartHandshakeIcon className="h-3 w-3 mr-1 text-pink-500" />
                                        Invited
                                      </>
                                    ) : (
                                      <>
                                        <MessageCircle className="h-3 w-3 mr-1" />
                                        Connect
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                {!invitedProfiles.includes(profile.userId) && (
                                  <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-pink-500" />
                                        Send an Invitation
                                      </AlertDialogTitle>
                                      <AlertDialogDescription className="text-white/70">
                                        You are about to send a connection
                                        invitation to {profile.name}. They will
                                        be notified and can choose to accept or
                                        decline.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-4">
                                      <div className="flex items-center gap-4">
                                        <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-pink-200">
                                          <Image
                                            src={profile.images[0]}
                                            alt={profile.name}
                                            fill
                                            className="object-contain"
                                            onError={() =>
                                              handleImageError(profile.userId)
                                            }
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
                                      <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                        onClick={() => {
                                          handleSendInvitation(
                                            profile.userId,
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
                </>
              )}
            </div>

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
