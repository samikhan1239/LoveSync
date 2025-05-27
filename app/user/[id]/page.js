"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Edit3,
  Save,
  X,
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Users,
  Home,
  Shield,
  Star,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";

const DEFAULT_IMAGE = "/placeholder.svg?height=400&width=300";
const availableInterests = [
  "Travel",
  "Reading",
  "Music",
  "Dancing",
  "Cooking",
  "Photography",
  "Sports",
  "Yoga",
  "Fitness",
  "Movies",
  "Art",
  "Technology",
  "Nature",
  "Gardening",
  "Writing",
  "Gaming",
  "Fashion",
  "Spirituality",
];

export default function UserProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id || "me"; // Default to "me" for /dashboard/user

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchProfileData = useCallback(async () => {
    if (!id || status !== "authenticated") {
      setError("Invalid profile ID or not authenticated");
      setIsLoading(false);
      return;
    }

    console.log(
      `Fetching profile for id: ${id}, session user: ${session?.user?.id}`
    );

    try {
      const response = await fetch(`/api/profiles/${id}`, {
        credentials: "include",
      });

      console.log(`API response status: ${response.status}`);

      if (!response.ok) {
        const text = await response.text();
        console.log(`API error response: ${text}`);
        if (response.status === 404) {
          if (id === "me" || session?.user?.id === id) {
            console.log(
              "Profile not found for current user, redirecting to /create-profile"
            );
            router.push("/dashboard/user");
            return;
          }
          throw new Error("Profile not found");
        }
        if (response.status === 403) {
          throw new Error("This profile is pending and not accessible");
        }
        throw new Error(
          `Failed to fetch profile: ${response.status} ${
            text || "No response body"
          }`
        );
      }

      const profileData = await response.json();
      console.log("Profile data received:", profileData);

      const images =
        Array.isArray(profileData.photos) && profileData.photos.length
          ? profileData.photos.filter((url) => {
              try {
                new URL(url);
                return true;
              } catch {
                console.warn(`Invalid photo URL for profile ${id}: ${url}`);
                return false;
              }
            })
          : [DEFAULT_IMAGE];

      const formattedProfile = {
        id: profileData.userId || id,
        name: profileData.name || "Unknown",
        age: profileData.age?.toString() || "N/A",
        location: profileData.location || "Not specified",
        occupation: profileData.occupation || "Not specified",
        company: profileData.company || "Not specified",
        education: profileData.education?.degree || "Not specified",
        height: profileData.height
          ? `${Math.floor(profileData.height / 30.48)}\'${Math.round(
              (profileData.height % 30.48) / 2.54
            )}\"`
          : "N/A",
        weight: profileData.weight ? `${profileData.weight} kg` : "N/A",
        religion: profileData.religion || "N/A",
        caste: profileData.caste || "N/A",
        motherTongue: profileData.motherTongue || "N/A",
        maritalStatus: profileData.maritalStatus || "N/A",
        verified: profileData.status === "approved",
        premium: profileData.premium || false,
        about: profileData.bio || "No bio provided",
        interests: Array.isArray(profileData.interests)
          ? profileData.interests
          : [],
        images,
        family: {
          father: profileData.family?.father || "Not specified",
          mother: profileData.family?.mother || "Not specified",
          siblings: profileData.family?.siblings || "Not specified",
          familyType: profileData.family?.familyType || "Not specified",
          familyValues: profileData.family?.familyValues || "Not specified",
        },
        lifestyle: {
          diet: profileData.diet || "Not specified",
          drinking: profileData.drinking || "Not specified",
          smoking: profileData.smoking || "Not specified",
          exercise: profileData.exercise || "Not specified",
        },
        partner: {
          ageRange: profileData.partnerAgeMin
            ? `${profileData.partnerAgeMin}-${profileData.partnerAgeMax}`
            : "Not specified",
          heightRange: "Not specified",
          education: "Not specified",
          occupation: "Not specified",
          location: profileData.partnerLocation || "Not specified",
        },
        profileViews: profileData.profileViews || 0,
        profileLikes: profileData.profileLikes || 0,
        connectionsReceived: profileData.connectionsReceived || 0,
        connectionsSent: profileData.connectionsSent || 0,
      };

      setUserData(formattedProfile);
      setEditData(formattedProfile);
      setIsLoading(false);
      setError("");
    } catch (err) {
      const message = err.message || "Failed to load profile data.";
      console.error("Error fetching profile:", message);
      setError(message);
      setIsLoading(false);
      toast.error(message, {
        description: "Error Loading Profile",
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  }, [id, status, session, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileData();
    } else if (status === "unauthenticated") {
      setError("Please log in to view this profile.");
      setIsLoading(false);
    }
  }, [status, fetchProfileData]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(userData);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: editData.name,
        bio: editData.about,
        age: parseInt(editData.age) || null,
        location: editData.location,
        occupation: editData.occupation,
        company: editData.company,
        education: { degree: editData.education },
        height:
          parseFloat(editData.height.replace(/[^0-9.]/g, "")) * 30.48 || null,
        weight: parseFloat(editData.weight.replace(/[^0-9.]/g, "")) || null,
        religion: editData.religion,
        caste: editData.caste,
        motherTongue: editData.motherTongue,
        maritalStatus: editData.maritalStatus,
        photos: editData.images,
        interests: editData.interests,
        diet: editData.lifestyle.diet,
        drinking: editData.lifestyle.drinking,
        smoking: editData.lifestyle.smoking,
        exercise: editData.lifestyle.exercise,
        family: editData.family,
        partnerAgeMin:
          parseInt(editData.partner.ageRange?.split("-")[0]) || null,
        partnerAgeMax:
          parseInt(editData.partner.ageRange?.split("-")[1]) || null,
        partnerLocation: editData.partner.location,
      };

      console.log("Saving profile with payload:", payload);

      const response = await fetch(`/api/profiles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Failed to update profile: ${response.status} ${
            text || "No response body"
          }`
        );
      }

      setUserData({ ...editData, verified: userData.verified });
      setIsEditing(false);
      toast.success("Profile Updated!", {
        description: "Your profile changes have been saved successfully.",
        style: {
          background: "#22c55e",
          color: "#ffffff",
          border: "1px solid #16a34a",
        },
      });
    } catch (err) {
      console.error("Error saving profile:", err.message);
      toast.error("Failed to Update Profile", {
        description: err.message || "Unknown error",
        style: {
          background: "#ef4444",
          color: "#ffffff",
          border: "1px solid #dc2626",
        },
      });
    }
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleInterestToggle = (interest) => {
    setEditData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleImageDelete = (index) => {
    setEditData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleImageError = (e) => {
    console.warn(`Failed to load image for profile ${id}`);
    e.target.src = DEFAULT_IMAGE;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Toaster position="top-right" closeButton richColors />
        <div className="container mx-auto px-4 py-20 flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="dual-ring" />
            <p className="text-white/70">Loading profile...</p>
          </div>
        </div>
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
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <Toaster position="top-right" closeButton richColors />
        <div className="container mx-auto px-4 py-20 flex h-[400px] flex-col items-center justify-center gap-4">
          <p className="text-xl text-white/70">
            {error || "Profile not found."}
          </p>
          <Button asChild>
            <a href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <Toaster position="top-right" closeButton richColors />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-14">
          {session?.user?.id !== userData.id && (
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              asChild
            >
              <a href="/profiles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profiles
              </a>
            </Button>
          )}
          <h1 className="text-4xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Your Matrimonial Profile
          </h1>
        </div>
        <div className="flex gap-2">
          {session?.user?.id === userData.id && !isEditing ? (
            <Button
              onClick={handleEdit}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : session?.user?.id === userData.id ? (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-1">
          {/* Profile Card */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={userData.images[0] || DEFAULT_IMAGE}
                    alt={userData.name || "Profile"}
                    fill
                    className="object-cover rounded-full border-4 border-pink-500/30"
                    onError={handleImageError}
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                  <div className="absolute top-0 right-0 flex flex-col gap-1">
                    {userData.verified && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {userData.premium && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-1">
                  {userData.name}, {userData.age}
                </h2>
                <div className="space-y-1 text-white/70 text-sm">
                  <div className="flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-1 text-pink-500" />
                    {userData.location}
                  </div>
                  <div className="flex items-center justify-center">
                    <Briefcase className="h-4 w-4 mr-1 text-pink-500" />
                    {userData.occupation}
                  </div>
                  <div className="flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 mr-1 text-pink-500" />
                    {userData.education}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Profile Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Profile Views</span>
                <span className="text-white font-semibold">
                  {userData.profileViews}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Profile Likes</span>
                <span className="text-white font-semibold">
                  {userData.profileLikes}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Requests Received</span>
                <span className="text-white font-semibold">
                  {userData.connectionsReceived}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Requests Sent</span>
                <span className="text-white font-semibold">
                  {userData.connectionsSent}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Photo Gallery */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center justify-between">
                Photo Gallery
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Photo
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {userData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image || DEFAULT_IMAGE}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      onError={handleImageError}
                    />
                    {isEditing && (
                      <button
                        onClick={() => handleImageDelete(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 border border-white/20">
              <TabsTrigger
                value="basic"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 text-white"
              >
                Basic Info
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

            <TabsContent value="basic" className="mt-6">
              <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-5 w-5 mr-2 text-pink-500" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">About Me</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.about || ""}
                        onChange={(e) =>
                          handleInputChange("about", e.target.value)
                        }
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500 min-h-[100px]"
                      />
                    ) : (
                      <p className="text-white/80 leading-relaxed">
                        {userData.about}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">
                        Personal Details
                      </h4>
                      <div className="space-y-3">
                        {[
                          { label: "Height", field: "height" },
                          { label: "Weight", field: "weight" },
                          { label: "Religion", field: "religion" },
                          { label: "Caste", field: "caste" },
                          { label: "Mother Tongue", field: "motherTongue" },
                          { label: "Marital Status", field: "maritalStatus" },
                        ].map(({ label, field }) => (
                          <div
                            key={field}
                            className="flex justify-between items-center"
                          >
                            <span className="text-white/60">{label}:</span>
                            {isEditing ? (
                              <Input
                                value={editData[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(field, e.target.value)
                                }
                                className="w-32 bg-white/10 border-white/20 text-white text-sm"
                              />
                            ) : (
                              <span className="text-white">
                                {userData[field] || "N/A"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">
                        Professional Details
                      </h4>
                      <div className="space-y-3">
                        {[
                          { label: "Occupation", field: "occupation" },
                          { label: "Company", field: "company" },
                          { label: "Education", field: "education" },
                        ].map(({ label, field }) => (
                          <div
                            key={field}
                            className="flex justify-between items-center"
                          >
                            <span className="text-white/60">{label}:</span>
                            {isEditing ? (
                              <Input
                                value={editData[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(field, e.target.value)
                                }
                                className="w-40 bg-white/10 border-white/20 text-white text-sm"
                              />
                            ) : (
                              <span className="text-white">
                                {userData[field] || "N/A"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Interests & Hobbies</Label>
                    {isEditing ? (
                      <div className="flex flex-wrap gap-2">
                        {availableInterests.map((interest) => (
                          <Badge
                            key={interest}
                            variant={
                              editData.interests.includes(interest)
                                ? "default"
                                : "outline"
                            }
                            className={`cursor-pointer transition-colors ${
                              editData.interests.includes(interest)
                                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                                : "border-white/20 text-white/70 hover:bg-white/10"
                            }`}
                            onClick={() => handleInterestToggle(interest)}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {userData.interests.length > 0 ? (
                          userData.interests.map((interest, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-pink-500/30 text-pink-400"
                            >
                              {interest}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-white/60">
                            No interests specified
                          </span>
                        )}
                      </div>
                    )}
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
                    {Object.entries(userData.family).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span className="text-white/60 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}:
                        </span>
                        {isEditing ? (
                          <Input
                            value={editData.family[key] || ""}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "family",
                                key,
                                e.target.value
                              )
                            }
                            className="w-48 bg-white/10 border-white/20 text-white text-sm"
                          />
                        ) : (
                          <span className="text-white">{value || "N/A"}</span>
                        )}
                      </div>
                    ))}
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
                    {Object.entries(userData.lifestyle).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span className="text-white/60 capitalize">{key}:</span>
                        {isEditing ? (
                          <Select
                            value={editData.lifestyle[key] || ""}
                            onValueChange={(val) =>
                              handleNestedInputChange("lifestyle", key, val)
                            }
                          >
                            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                              {key === "diet" && (
                                <>
                                  <SelectItem value="Vegetarian">
                                    Vegetarian
                                  </SelectItem>
                                  <SelectItem value="Non-Vegetarian">
                                    Non-Vegetarian
                                  </SelectItem>
                                  <SelectItem value="Vegan">Vegan</SelectItem>
                                </>
                              )}
                              {(key === "drinking" || key === "smoking") && (
                                <>
                                  <SelectItem value="Never">Never</SelectItem>
                                  <SelectItem value="Occasionally">
                                    Occasionally
                                  </SelectItem>
                                  <SelectItem value="Socially">
                                    Socially
                                  </SelectItem>
                                  <SelectItem value="Regularly">
                                    Regularly
                                  </SelectItem>
                                </>
                              )}
                              {key === "exercise" && (
                                <>
                                  <SelectItem value="Never">Never</SelectItem>
                                  <SelectItem value="Occasionally">
                                    Occasionally
                                  </SelectItem>
                                  <SelectItem value="Regular">
                                    Regular
                                  </SelectItem>
                                  <SelectItem value="Daily">Daily</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-white">{value || "N/A"}</span>
                        )}
                      </div>
                    ))}
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
                    {Object.entries(userData.partner).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span className="text-white/60 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}:
                        </span>
                        {isEditing ? (
                          <Input
                            value={editData.partner[key] || ""}
                            onChange={(e) =>
                              handleNestedInputChange(
                                "partner",
                                key,
                                e.target.value
                              )
                            }
                            className="w-48 bg-white/10 border-white/20 text-white text-sm"
                          />
                        ) : (
                          <span className="text-white">{value || "N/A"}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
