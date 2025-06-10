"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import {
  Heart,
  User,
  Briefcase,
  Home,
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
  Sparkles,
  User2,
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
  AlertDialogTrigger,
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
    caste: "", // Added caste filter to align with backend schema
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [sendingRequest, setSendingRequest] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [invitedProfiles, setInvitedProfiles] = useState([]);
  const [invitationMessage, setInvitationMessage] = useState("");

  // Default placeholder image
  const DEFAULT_IMAGE = "/default-profile.jpg"; // Ensure this exists in /public

  // Fetch profile data, suggested profiles, connection status, and invitations
  const fetchProfileData = useCallback(async () => {
    if (!resolvedParams?.id) {
      setError("Invalid profile ID");
      setIsLoading(false);
      setIsSuggestionsLoading(false);
      return;
    }

    if (status !== "authenticated") return;

    try {
      const [profileRes, suggestionsRes, requestsRes, userProfileRes] =
        await Promise.all([
          fetch(`/api/profiles/${resolvedParams.id}`, {
            credentials: "include",
          }),
          fetch("/api/profiles", { credentials: "include" }),
          fetch("/api/requests", { credentials: "include" }),
          fetch("/api/profiles/me", { credentials: "include" }), // Fetch current user's profile
        ]);

      // Handle user profile fetch (to check if user has a profile)
      if (!userProfileRes.ok) {
        if (userProfileRes.status === 404) {
          console.log("No user profile found, redirecting to create-profile");
          toast.info("Please create your profile to view matches.", {
            action: {
              label: "Create Profile",
              onClick: () => router.push("/create-profile"),
            },
          });
          router.push("/create-profile");
          return;
        }
        const text = await userProfileRes.text();
        throw new Error(
          `Failed to fetch user profile: ${userProfileRes.status} ${
            text || "No response body"
          }`
        );
      }

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
      console.log("Profile response:", profileData);

      // Validate photos
      const photos =
        Array.isArray(profileData.profile.photos) &&
        profileData.profile.photos.length
          ? profileData.profile.photos.filter((url) => {
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
        userId: profileData.profile.userId,
        name: profileData.profile.name || "Unknown",
        age: profileData.profile.age || 0,
        location: profileData.profile.location
          ? `${profileData.profile.location}, India`
          : "India",
        occupation: profileData.profile.occupation || "Not specified",
        education: profileData.profile.education?.degree || "Not specified",
        bio: profileData.profile.bio || "No bio provided.",
        height: profileData.profile.height
          ? `${Math.floor(profileData.profile.height / 30.48)}\'${Math.round(
              (profileData.profile.height % 30.48) / 2.54
            )}\"`
          : "Not specified",
        weight: profileData.profile.weight || 0,
        religion: profileData.profile.religion || "Not specified",
        caste: profileData.profile.caste || "Not specified",
        maritalStatus: profileData.profile.maritalStatus || "Not specified",
        phone: profileData.profile.phone || "",
        email: profileData.profile.email || "",
        income: profileData.profile.income || 0,
        familyType: profileData.profile.familyType || "Not specified",
        familyStatus: profileData.profile.familyStatus || "Not specified",
        familyValues: profileData.profile.familyValues || "Not specified",
        diet: profileData.profile.diet || "Not specified",
        smoking: profileData.profile.smoking || "Not specified",
        drinking: profileData.profile.drinking || "Not specified",
        partnerAgeMin: profileData.profile.partnerAgeMin || 18,
        partnerAgeMax: profileData.profile.partnerAgeMax || 60,
        partnerReligion: profileData.profile.partnerReligion || "Not specified",
        partnerCaste: profileData.profile.partnerCaste || "Not specified",
        photos,
        verified: profileData.profile.status === "approved",
        premium: profileData.profile.premium || false,
        lastSeen:
          Math.random() > 0.7
            ? "Online now"
            : `${Math.floor(Math.random() * 24)} hours ago`,
      };
      setProfile(formattedProfile);

      // Handle suggested profiles
      if (!suggestionsRes.ok) {
        const text = await suggestionsRes.text();
        throw new Error(
          `Failed to fetch suggested profiles: ${suggestionsRes.status} ${
            text || "No response body"
          }`
        );
      }
      const suggestionsData = await suggestionsRes.json();
      console.log("Suggested profiles response:", suggestionsData);

      const formattedProfiles = Array.isArray(suggestionsData.profiles)
        ? suggestionsData.profiles
            .filter(
              (p) => p.status === "approved" && p.userId !== resolvedParams.id
            )
            .map((p) => ({
              userId: p.userId,
              name: p.name || "Unknown",
              age: p.age || 0,
              religion: p.religion || "Not specified",
              caste: p.caste || "Not specified",
              occupation: p.occupation || "Not specified",
              education: p.education?.degree || "Not specified",
              location: p.location ? `${p.location}, India` : "India",
              photos:
                Array.isArray(p.photos) && p.photos.length
                  ? p.photos.filter((url) => {
                      try {
                        new URL(url);
                        return true;
                      } catch {
                        console.warn(
                          `Invalid photo URL for suggestion ${p.userId}: ${url}`
                        );
                        return false;
                      }
                    })
                  : [DEFAULT_IMAGE],
              verified: p.status === "approved",
              premium: Math.random() > 0.5,
            }))
        : [];
      setSuggestedProfiles(formattedProfiles);

      // Handle connection and invitation status
      if (!requestsRes.ok) {
        const text = await requestsRes.text();
        throw new Error(
          `Failed to fetch connection status: ${requestsRes.status} ${
            text || "No response body"
          }`
        );
      }
      const requestsData = await requestsRes.json();
      console.log("Requests response:", requestsData);

      const isMutual =
        Array.isArray(requestsData.invitations) &&
        requestsData.invitations.some(
          (inv) =>
            (inv.targetProfileId === resolvedParams.id ||
              inv.sourceProfileId === resolvedParams.id) &&
            inv.status === "mutual"
        );
      setIsConnected(isMutual);

      const sentProfileIds = Array.isArray(requestsData.invitations)
        ? requestsData.invitations
            .filter((inv) =>
              ["pending", "accepted", "mutual"].includes(inv.status)
            )
            .map((inv) => inv.targetProfileId)
        : [];
      setInvitedProfiles(sentProfileIds);

      setIsLoading(false);
      setIsSuggestionsLoading(false);
      setError("");
    } catch (err) {
      console.error("Fetch profile data error:", err.message, err.stack);
      const message = err.message || "Failed to load data.";
      setError(message);
      setIsLoading(false);
      setIsSuggestionsLoading(false);
      toast.error(message, {
        description: "Error Loading Data",
        icon: <Sparkles className="h-5 w-5 text-red-500" />,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  }, [resolvedParams?.id, status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Fetching profile data for user:", {
        userId: session?.user?.id,
        profileId: resolvedParams?.id,
      });
      fetchProfileData();
    } else if (status === "unauthenticated") {
      setError("Please log in to view this profile.");
      setIsLoading(false);
      setIsSuggestionsLoading(false);
    }
  }, [status, fetchProfileData, resolvedParams?.id, session?.user?.id]);

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

  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  // Handle sending invitation
  const handleSendInvitation = async (profileId, name) => {
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
        body: JSON.stringify({
          targetProfileId: profileId,
          message: invitationMessage,
        }),
        credentials: "include",
      });

      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText || "Unknown error" };
      }

      if (!response.ok) {
        let userFriendlyMessage =
          errorData.error || "An error occurred while sending the invitation.";
        if (response.status === 404) {
          userFriendlyMessage = "Invitation service is currently unavailable.";
        } else if (response.status === 401) {
          userFriendlyMessage = "Please log in to send an invitation.";
        } else if (response.status === 400 || response.status === 403) {
          userFriendlyMessage = errorData.error;
        }
        throw new Error(userFriendlyMessage);
      }

      setInvitedProfiles((prev) => [...prev, profileId]);
      toast.success("Invitation Sent!", {
        description: `Your invitation has been sent to ${name}. We'll notify you when they respond.`,
        duration: 5000,
        icon: <Sparkles className="h-5 w-5 text-green-500" />,
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

  // Handle sending connection request
  const handleSendRequest = async (targetUserId, actionType = "connect") => {
    if (!targetUserId) {
      toast.error("Invalid user ID.", {
        description: "Request Failed",
        icon: <Sparkles className="h-5 w-5 text-red-500" />,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
      return;
    }

    setSendingRequest((prev) => ({ ...prev, [targetUserId]: true }));

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetProfileId: targetUserId }),
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
      console.error("Send request error:", err.message, err.stack);
      toast.error(err.message || "Unknown error", {
        description: "Request Failed",
        icon: <Sparkles className="h-5 w-5 text-red-500" />,
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
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
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: resolvedParams.id,
          reason: reportReason,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to submit report: ${res.status} ${text || "No response body"}`
        );
      }

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
      console.error("Report error:", err.message, err.stack);
      toast.error("Failed to Submit Report", {
        description: err.message || "Unknown error",
        icon: <Sparkles className="h-5 w-5 text-red-500" />,
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
    const matchesCaste = filters.caste
      ? p.caste?.toLowerCase().includes(filters.caste.toLowerCase())
      : true;
    return matchesAgeMin && matchesAgeMax && matchesReligion && matchesCaste;
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

  // Handle image error
  const handleImageError = (profileId) => {
    console.warn(`Failed to load image for profile ${profileId}`);
    setProfile((prev) =>
      prev && prev.userId === profileId
        ? { ...prev, photos: [DEFAULT_IMAGE] }
        : prev
    );
    setSuggestedProfiles((prev) =>
      prev.map((p) =>
        p.userId === profileId ? { ...p, photos: [DEFAULT_IMAGE] } : p
      )
    );
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
      <Toaster position="top-right" closeButton richColors />

      <div className="container mx-auto px-4 py-20">
        {/* Notification Banner */}
        {!isLoading && profile && session?.user?.id !== profile.userId && (
          <Card className="mb-6 border border-white/10 bg-gray-900/70 backdrop-blur-lg text-white shadow-xl rounded-2xl">
            <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="text-sm md:text-base font-medium text-white">
                You’ll receive the contact details once your request is
                accepted. For any queries, feel free to reach out.
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </CardContent>
          </Card>
        )}

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
            {profile && session?.user?.id !== profile.userId && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                  onClick={() => handleSendRequest(profile.userId, "connect")}
                  disabled={sendingRequest[profile.userId] || isConnected}
                  aria-label="Connect with profile"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`${
                        invitedProfiles.includes(resolvedParams.id)
                          ? "bg-pink-100 text-pink-600 hover:bg-pink-100 cursor-default"
                          : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                      }`}
                      disabled={
                        invitedProfiles.includes(resolvedParams.id) ||
                        status !== "authenticated"
                      }
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  {!invitedProfiles.includes(resolvedParams.id) && (
                    <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-pink-500" />
                          Send an Invitation
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70">
                          You are about to send a connection invitation to{" "}
                          {profile?.name || "Unknown"}. They will be notified
                          and can choose to accept or decline.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 rounded-full overflow-hidden border border-white shadow-md">
                            <Image
                              src={profile?.photos?.[0] || DEFAULT_IMAGE}
                              alt={profile?.name || "Profile"}
                              fill
                              className="object-contain"
                              onError={() => handleImageError(profile.userId)}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">
                              {profile?.name || "Unknown"},{" "}
                              {profile?.age || "N/A"}
                            </h4>
                            <p className="text-sm text-white/70">
                              {profile?.location || "Not specified"}
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
                          />
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
                              resolvedParams.id,
                              profile?.name || "Unknown"
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
              <Link href="/">
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
                    <div className="relative aspect-[4/3] h-64 overflow-hidden">
                      <Image
                        src={
                          profile.photos?.[currentImageIndex] || DEFAULT_IMAGE
                        }
                        alt={profile.name || "Profile"}
                        fill
                        className="object-contain"
                        onError={() => handleImageError(profile.userId)}
                      />
                      {profile.photos?.length > 1 && (
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
                    {profile.photos?.length > 1 && (
                      <div className="p-4">
                        <div className="grid grid-cols-4 gap-2">
                          {profile.photos.map((photo, index) => (
                            <div
                              key={index}
                              className={`relative h-16 cursor-pointer rounded overflow-hidden ${
                                index === currentImageIndex
                                  ? "ring-2 ring-pink-500"
                                  : ""
                              }`}
                              onClick={() => handleThumbnailClick(index)}
                            >
                              <Image
                                src={photo}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                onError={() => handleImageError(profile.userId)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-3 p-4">
                      {profile && session?.user?.id !== profile.userId ? (
                        <>
                          <Button
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                            onClick={() =>
                              handleSendRequest(profile.userId, "connect")
                            }
                            disabled={sendingRequest[profile.userId]}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            {sendingRequest[profile.userId]
                              ? "Connecting..."
                              : "Connect"}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className={`w-full ${
                                  invitedProfiles.includes(resolvedParams.id)
                                    ? "bg-pink-100 text-pink-600 hover:bg-pink-100 cursor-default"
                                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                                }`}
                                disabled={invitedProfiles.includes(
                                  resolvedParams.id
                                )}
                              >
                                {invitedProfiles.includes(resolvedParams.id) ? (
                                  <>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Invited
                                  </>
                                ) : (
                                  <>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Send Invitation
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            {!invitedProfiles.includes(resolvedParams.id) && (
                              <AlertDialogContent className="bg-black/80 border-white/10 text-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-pink-500" />
                                    Send an Invitation
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-white/70">
                                    You are about to send a connection
                                    invitation to {profile.name || "Unknown"}.
                                    They will be notified and can choose to
                                    accept or decline.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <div className="flex items-center gap-4">
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-pink-200">
                                      <Image
                                        src={
                                          profile.photos?.[0] || DEFAULT_IMAGE
                                        }
                                        alt={profile.name || "Unknown"}
                                        fill
                                        className="object-contain"
                                        onError={() =>
                                          handleImageError(profile.userId)
                                        }
                                      />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white">
                                        {profile.name || "Unknown"},{" "}
                                        {profile.age || "N/A"}
                                      </h4>
                                      <p className="text-sm text-white/70">
                                        {profile.location || "Not specified"}
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
                                    />
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
                                        resolvedParams.id,
                                        profile.name || "Unknown"
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
                              {profile.location}
                            </div>
                            <div className="flex items-center text-white/70">
                              <Briefcase className="h-4 w-4 mr-2 text-pink-500" />
                              {profile.occupation}
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
                          <CardTitle className="text-white flex items-center">
                            <User2 className="h-5 w-5 mr-2 text-pink-500" />
                            About Me
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <Collapsible>
                            <CollapsibleTrigger className="w-full text-left">
                              <p className="text-white/80 leading-relaxed">
                                {profile.bio?.length > 200
                                  ? `${profile.bio.substring(0, 200)}...`
                                  : profile.bio}
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
                                    {profile.height}
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
                                    {profile.religion}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">Caste:</span>
                                  <span className="text-white">
                                    {profile.caste}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">
                                    Marital Status:
                                  </span>
                                  <span className="text-white">
                                    {profile.maritalStatus}
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
                                    {profile.occupation}
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
                                  {profile.familyType}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">
                                  Family Status:
                                </span>
                                <span className="text-white">
                                  {profile.familyStatus}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">
                                  Family Values:
                                </span>
                                <span className="text-white">
                                  {profile.familyValues}
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
                                  {profile.diet}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Smoking:</span>
                                <span className="text-white">
                                  {profile.smoking}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Drinking:</span>
                                <span className="text-white">
                                  {profile.drinking}
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
                                <span className="text-white">{`${profile.partnerAgeMin} - ${profile.partnerAgeMax} years`}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Religion:</span>
                                <span className="text-white">
                                  {profile.partnerReligion}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Caste:</span>
                                <span className="text-white">
                                  {profile.partnerCaste}
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
                        <div className="grid gap-4 sm:grid-cols-4">
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
                          <div className="space-y-2">
                            <label
                              htmlFor="caste"
                              className="text-sm font-medium text-white"
                            >
                              Caste
                            </label>
                            <Input
                              id="caste"
                              name="caste"
                              value={filters.caste}
                              onChange={handleFilterChange}
                              placeholder="Caste"
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
                    .filter((p) => p.userId !== session?.user?.id)
                    .map((p) => (
                      <Card
                        key={p.userId}
                        className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm"
                      >
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-16 w-16 border border-rose-200">
                                <AvatarImage
                                  src={p.photos?.[0] || DEFAULT_IMAGE}
                                  alt={p.name}
                                  onError={() => handleImageError(p.userId)}
                                />
                                <AvatarFallback className="bg-rose-100 text-rose-700">
                                  {getInitials(p.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-white">
                                  {p.name}
                                </h3>
                                <p className="text-sm text-white/70">
                                  {p.age} years • {p.religion}
                                </p>
                                <p className="text-sm text-white/70">
                                  {p.occupation}
                                </p>
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
                              <Link href={`/profiles/${p.userId}`}>
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
                                  handleSendRequest(p.userId, "connect")
                                }
                                disabled={sendingRequest[p.userId]}
                              >
                                <Heart className="h-4 w-4" />
                                {sendingRequest[p.userId]
                                  ? "Connecting..."
                                  : "Connect"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                                onClick={() =>
                                  handleSendRequest(p.userId, "invitation")
                                }
                                disabled={sendingRequest[p.userId]}
                              >
                                <MessageCircle className="h-4 w-4" />
                                {sendingRequest[p.userId]
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
