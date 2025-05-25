"use client";
import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Heart,
  User,
  Briefcase,
  Home,
  Menu,
  X,
  Filter,
  Eye,
  ArrowLeft,
  MessageCircle,
  Share2,
  MapPin,
  GraduationCap,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export default function ProfilePage({ params }) {
  const resolvedParams = React.use(params); // Unwrap params Promise
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(true);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [filters, setFilters] = useState({
    ageMin: "",
    ageMax: "",
    religion: "",
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [sendingRequest, setSendingRequest] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Default placeholder image
  const DEFAULT_IMAGE = "/default-profile.jpg"; // Ensure this exists in /public

  // Fetch profile data, suggested profiles, and connection status
  const fetchProfileData = useCallback(async () => {
    if (!resolvedParams?.id) {
      setError("Invalid profile ID");
      setIsLoading(false);
      setIsSuggestionsLoading(false);
      return;
    }

    if (status !== "authenticated") return;

    try {
      const [profileRes, suggestionsRes, requestsRes] = await Promise.all([
        fetch(`/api/profiles/${resolvedParams.id}`, { credentials: "include" }),
        fetch("/api/profiles", { credentials: "include" }),
        fetch("/api/requests", { credentials: "include" }),
      ]);

      // Handle profile fetch
      if (!profileRes.ok) {
        const text = await profileRes.text();
        if (profileRes.status === 404) throw new Error("Profile not found");
        if (profileRes.status === 403)
          throw new Error("This profile is pending and not accessible");
        throw new Error(
          `Failed to fetch profile: ${profileRes.status} ${
            text || "No response body"
          }`
        );
      }
      const profileData = await profileRes.json();
      console.log("Profile data:", profileData);

      // Validate photos
      const photos =
        Array.isArray(profileData.photos) && profileData.photos.length
          ? profileData.photos.filter((url) => {
              try {
                new URL(url);
                return true;
              } catch {
                console.warn(
                  `Invalid photo URL for profile ${resolvedParams.id}: ${url}`
                );
                return false;
              }
            })
          : [DEFAULT_IMAGE];

      const formattedProfile = {
        ...profileData,
        photos,
        location: profileData.location || "India",
        education: profileData.education?.degree || "Not specified",
        verified: profileData.status === "approved",
        premium: profileData.premium || false,
        lastSeen:
          profileData.lastSeen ||
          (Math.random() > 0.7
            ? "Online now"
            : `${Math.floor(Math.random() * 24)} hours ago`),
      };
      setProfile(formattedProfile);

      // Handle suggested profiles
      if (!suggestionsRes.ok) {
        throw new Error(
          `Failed to fetch suggested profiles: ${suggestionsRes.status}`
        );
      }
      const suggestionsData = await suggestionsRes.json();
      console.log("Suggestions data:", suggestionsData);

      const formattedProfiles = Array.isArray(suggestionsData.profiles)
        ? suggestionsData.profiles
            .filter((p) => p.status === "approved")
            .map((p) => ({
              ...p,
              photos:
                Array.isArray(p.photos) && p.photos.length
                  ? p.photos.filter((url) => {
                      try {
                        new URL(url);
                        return true;
                      } catch {
                        console.warn(
                          `Invalid photo URL for suggestion ${p._id}: ${url}`
                        );
                        return false;
                      }
                    })
                  : [DEFAULT_IMAGE],
              location: p.location || "India",
              education: p.education?.degree || "Not specified",
            }))
        : [];
      setSuggestedProfiles(formattedProfiles);

      // Handle connection status
      if (!requestsRes.ok) throw new Error("Failed to fetch connection status");
      const requestsData = await requestsRes.json();
      const isMutual =
        Array.isArray(requestsData.invitations) &&
        requestsData.invitations.some(
          (inv) =>
            (inv.targetProfileId === resolvedParams.id ||
              inv.sourceProfileId === resolvedParams.id) &&
            inv.status === "mutual"
        );
      setIsConnected(isMutual);

      setIsLoading(false);
      setIsSuggestionsLoading(false);
      setError("");
    } catch (err) {
      const message = err.message || "Failed to load data.";
      setError(message);
      setIsLoading(false);
      setIsSuggestionsLoading(false);
      toast.error(message, { description: "Error Loading Data" });
    }
  }, [resolvedParams?.id, status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileData();
    } else if (status === "unauthenticated") {
      setError("Please log in to view this profile.");
      setIsLoading(false);
      setIsSuggestionsLoading(false);
    }
  }, [status, fetchProfileData]);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image navigation
  const nextImage = () => {
    if (profile?.photos?.length && profile.photos.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === profile.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (profile?.photos?.length && profile.photos.length > 1) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? profile.photos.length - 1 : prev - 1
      );
    }
  };

  // Handle sending connection request
  const handleSendRequest = async (targetUserId, actionType = "connect") => {
    if (!targetUserId) {
      toast.error("Invalid user ID.", { description: "Request Failed" });
      return;
    }

    setSendingRequest((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to send ${actionType}: ${res.status} ${
            text || "No response body"
          }`
        );
      }

      toast.success(
        actionType === "connect"
          ? "Connection request sent successfully!"
          : "Invitation sent successfully!",
        {
          description:
            actionType === "connect"
              ? "You will be notified when accepted."
              : "You will be notified when the invitation is accepted.",
          style: {
            background: "#22c55e",
            color: "#ffffff",
            border: "1px solid #16a34a",
          },
        }
      );
    } catch (err) {
      const message = err.message || "Unknown error";
      toast.error(message, { description: "Request Failed" });
    } finally {
      setSendingRequest((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  // Handle sharing profile
  const handleShare = () => {
    if (typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}/profiles/${resolvedParams.id}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("Profile Link Copied!", {
          description: `The link to ${
            profile?.name || "this profile"
          }'s profile has been copied to your clipboard.`,
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
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #dc2626",
          },
        });
      });
  };

  // Handle report profile
  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting.", {
        description: "Validation Error",
      });
      return;
    }

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: resolvedParams.id,
          reason: reportReason,
        }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to submit report");

      setShowReportDialog(false);
      setReportReason("");
      toast.success("Report Submitted", {
        description:
          "Thank you for reporting. Our team will review the profile.",
        style: {
          background: "#22c55e",
          color: "#ffffff",
          border: "1px solid #16a34a",
        },
      });
    } catch (err) {
      const message = err.message || "Unknown error";
      toast.error("Failed to Submit Report", {
        description: message,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  // Apply filters to suggested profiles
  const filteredProfiles = suggestedProfiles.filter((p) => {
    const matchesAgeMin = filters.ageMin
      ? p.age >= Number(filters.ageMin)
      : true;
    const matchesAgeMax = filters.ageMax
      ? p.age <= Number(filters.ageMax)
      : true;
    const matchesReligion = filters.religion
      ? p.religion?.toLowerCase().includes(filters.religion.toLowerCase())
      : true;
    return matchesAgeMin && matchesAgeMax && matchesReligion;
  });

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
      `}</style>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/profiles">
            <Button
              variant="outline"
              className="justify-between bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profiles
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {profile && session?.user?.id !== profile.userId?._id && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                  onClick={() =>
                    handleSendRequest(profile.userId?._id, "connect")
                  }
                  disabled={sendingRequest[profile.userId?._id] || isConnected}
                  aria-label="Connect with profile"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                  onClick={() =>
                    handleSendRequest(profile.userId?._id, "connect")
                  }
                  disabled={sendingRequest[profile.userId?._id] || isConnected}
                  aria-label="Connect with profile"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => setShowReportDialog(true)}
                >
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="dual-ring" />
              <p className="text-white/70">Loading profile...</p>
            </div>
          </div>
        ) : !profile ? (
          <div className="flex h-[400px] flex-col items-center justify-center gap-4">
            <p className="text-xl text-white/70">Profile not found.</p>
            <Button asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-white/10 border-white/20">
              <TabsTrigger
                value="profile"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="matches"
                className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Matches</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Images and Actions */}
                <div className="lg:col-span-1">
                  <Card className="overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image
                        src={profile.photos[currentImageIndex] || DEFAULT_IMAGE}
                        alt={profile.name || "Profile"}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          console.warn(
                            `Failed to load image for profile ${resolvedParams.id}: ${profile.photos[currentImageIndex]}`
                          );
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      {profile.photos.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            aria-label="Previous Image"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={nextImage}
                            aria-label="Next Image"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                            {profile.photos.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                aria-label={`Go to image ${index + 1}`}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                  index === currentImageIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {profile.verified && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {profile.premium && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            profile.lastSeen === "Online now"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                        <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                          {profile.lastSeen}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      {profile && session?.user?.id !== profile.userId?._id ? (
                        <>
                          <Button
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                            onClick={() =>
                              handleSendRequest(profile.userId?._id, "connect")
                            }
                            disabled={sendingRequest[profile.userId?._id]}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            {sendingRequest[profile.userId?._id]
                              ? "Connecting..."
                              : "Connect"}
                          </Button>
                          <Button
                            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                            onClick={() =>
                              handleSendRequest(
                                profile.userId?._id,
                                "invitation"
                              )
                            }
                            disabled={sendingRequest[profile.userId?._id]}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {sendingRequest[profile.userId?._id]
                              ? "Sending..."
                              : "Send Invitation"}
                          </Button>
                          {isConnected && (
                            <div className="grid grid-cols-2 gap-2">
                              {profile.phone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 text-white hover:bg-white/10"
                                  asChild
                                >
                                  <a href={`tel:${profile.phone}`}>
                                    <Phone className="h-4 w-4 mr-1" />
                                    Call
                                  </a>
                                </Button>
                              )}
                              {profile.email && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 text-white hover:bg-white/10"
                                  asChild
                                >
                                  <a href={`mailto:${profile.email}`}>
                                    <Mail className="h-4 w-4 mr-1" />
                                    Email
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  </Card>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="lg:col-span-2">
                  <Card className="border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h1 className="text-3xl font-bold text-white mb-2">
                            {profile.name}, {profile.age}
                          </h1>
                          <div className="space-y-2">
                            <div className="flex items-center text-white/70">
                              <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                              {profile.location || "India"}
                            </div>
                            <div className="flex items-center text-white/70">
                              <Briefcase className="h-4 w-4 mr-2 text-pink-500" />
                              {profile.occupation || "Not specified"}
                            </div>
                            <div className="flex items-center text-white/70">
                              <GraduationCap className="h-4 w-4 mr-2 text-pink-500" />
                              {profile.education}
                            </div>
                            {isConnected && profile.phone && (
                              <div className="flex items-center text-white/70">
                                <Phone className="h-4 w-4 mr-2 text-pink-500" />
                                {profile.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/60 text-sm">Last seen</div>
                          <div className="text-white font-medium">
                            {profile.lastSeen}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Tabs defaultValue="about" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white/10 border border-white/20">
                      <TabsTrigger
                        value="about"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
                      >
                        About
                      </TabsTrigger>
                      <TabsTrigger
                        value="family"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
                      >
                        Family
                      </TabsTrigger>
                      <TabsTrigger
                        value="lifestyle"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
                      >
                        Lifestyle
                      </TabsTrigger>
                      <TabsTrigger
                        value="partner"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
                      >
                        Partner Preference
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="mt-6">
                      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-white">About Me</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <Collapsible>
                            <CollapsibleTrigger className="w-full text-left">
                              <p className="text-white/80 leading-relaxed">
                                {profile.bio?.length > 200
                                  ? `${profile.bio.substring(0, 200)}...`
                                  : profile.bio || "No bio provided."}
                              </p>
                              {profile.bio?.length > 200 && (
                                <span className="text-pink-500 text-sm">
                                  Read more
                                </span>
                              )}
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <p className="text-white/80 leading-relaxed mt-2">
                                {profile.bio}
                              </p>
                            </CollapsibleContent>
                          </Collapsible>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-white">
                                Personal Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-white/60">Height:</span>
                                  <span className="text-white">
                                    {profile.height
                                      ? `${profile.height} cm`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">Weight:</span>
                                  <span className="text-white">
                                    {profile.weight
                                      ? `${profile.weight} kg`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">
                                    Religion:
                                  </span>
                                  <span className="text-white">
                                    {profile.religion || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">Caste:</span>
                                  <span className="text-white">
                                    {profile.caste || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">
                                    Marital Status:
                                  </span>
                                  <span className="text-white">
                                    {profile.maritalStatus || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold text-white">
                                Professional Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-white/60">
                                    Occupation:
                                  </span>
                                  <span className="text-white">
                                    {profile.occupation || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">
                                    Education:
                                  </span>
                                  <span className="text-white">
                                    {profile.education}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">
                                    Annual Income:
                                  </span>
                                  <span className="text-white">
                                    {profile.income
                                      ? `₹${profile.income.toLocaleString()}`
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="family" className="mt-6">
                      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Users className="h-5 w-5 mr-2 text-pink-500" />
                            Family Details
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-white/60">
                                  Family Type:
                                </span>
                                <span className="text-white">
                                  {profile.familyType || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">
                                  Family Status:
                                </span>
                                <span className="text-white">
                                  {profile.familyStatus || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">
                                  Family Values:
                                </span>
                                <span className="text-white">
                                  {profile.familyValues || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="lifestyle" className="mt-6">
                      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Home className="h-5 w-5 mr-2 text-pink-500" />
                            Lifestyle
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-white/60">Diet:</span>
                                <span className="text-white">
                                  {profile.diet || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Smoking:</span>
                                <span className="text-white">
                                  {profile.smoking || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Drinking:</span>
                                <span className="text-white">
                                  {profile.drinking || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="partner" className="mt-6">
                      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Heart className="h-5 w-5 mr-2 text-pink-500" />
                            Partner Preferences
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-white/60">
                                  Age Range:
                                </span>
                                <span className="text-white">
                                  {profile.partnerAgeMin &&
                                  profile.partnerAgeMax
                                    ? `${profile.partnerAgeMin} - ${profile.partnerAgeMax} years`
                                    : "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Religion:</span>
                                <span className="text-white">
                                  {profile.partnerReligion || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Caste:</span>
                                <span className="text-white">
                                  {profile.partnerCaste || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Suggested Matches
                </h2>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 justify-between bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Filter className="h-4 w-4" />
                      Filter Profiles
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <label
                              htmlFor="ageMin"
                              className="text-sm font-medium text-white"
                            >
                              Min Age
                            </label>
                            <Input
                              id="ageMin"
                              name="ageMin"
                              type="number"
                              value={filters.ageMin}
                              onChange={handleFilterChange}
                              placeholder="Min Age"
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="ageMax"
                              className="text-sm font-medium text-white"
                            >
                              Max Age
                            </label>
                            <Input
                              id="ageMax"
                              name="ageMax"
                              type="number"
                              value={filters.ageMax}
                              onChange={handleFilterChange}
                              placeholder="Max Age"
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="religion"
                              className="text-sm font-medium text-white"
                            >
                              Religion
                            </label>
                            <Input
                              id="religion"
                              name="religion"
                              value={filters.religion}
                              onChange={handleFilterChange}
                              placeholder="Religion"
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {isSuggestionsLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="dual-ring" />
                    <p className="text-white/70">
                      Loading suggested profiles...
                    </p>
                  </div>
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-white/20">
                  <p className="text-center text-white/70">
                    No profiles match your criteria.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProfiles
                    .filter((p) => p.userId?._id !== session?.user?.id)
                    .map((profile) => (
                      <Card
                        key={profile._id}
                        className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm"
                      >
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16 border border-rose-200">
                                <AvatarImage
                                  src={profile.photos[0] || DEFAULT_IMAGE}
                                  alt={profile.name}
                                  onError={(e) => {
                                    console.warn(
                                      `Failed to load avatar for profile ${profile._id}: ${profile.photos[0]}`
                                    );
                                    e.target.src = DEFAULT_IMAGE;
                                  }}
                                />
                                <AvatarFallback className="bg-rose-100 text-rose-700">
                                  {getInitials(profile.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-white">
                                  {profile.name}
                                </h3>
                                <p className="text-sm text-white/70">
                                  {profile.age} years •{" "}
                                  {profile.religion || "N/A"}
                                </p>
                                {profile.occupation && (
                                  <p className="text-sm text-white/70">
                                    {profile.occupation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between p-4 gap-2">
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-white hover:bg-white/10"
                            >
                              <Link href={`/profiles/${profile._id}`}>
                                <Eye className="h-4 w-4" />
                                View
                              </Link>
                            </Button>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="gap-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                onClick={() =>
                                  handleSendRequest(
                                    profile.userId?._id,
                                    "connect"
                                  )
                                }
                                disabled={sendingRequest[profile.userId?._id]}
                              >
                                <Heart className="h-4 w-4" />
                                {sendingRequest[profile.userId?._id]
                                  ? "Connecting..."
                                  : "Connect"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                                onClick={() =>
                                  handleSendRequest(
                                    profile.userId?._id,
                                    "invitation"
                                  )
                                }
                                disabled={sendingRequest[profile.userId?._id]}
                              >
                                <MessageCircle className="h-4 w-4" />
                                {sendingRequest[profile.userId?._id]
                                  ? "Sending..."
                                  : "Send Invitation"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Report Profile Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent className="bg-black/80 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Report Profile
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to report this profile? Please provide a
              reason for reporting, and our team will review it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              placeholder="Reason for reporting..."
              className="w-full min-h-[100px] bg-white/10 border border-white/20 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleReport}
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
