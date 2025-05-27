"use client";

import { useState } from "react";
import Image from "next/image";
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
} from "lucide-react";

// Mock user data
const mockUserData = {
  id: "user123",
  name: "Priya Sharma",
  age: 28,
  location: "Mumbai, India",
  occupation: "Software Engineer",
  company: "Tech Solutions Pvt Ltd",
  education: "B.Tech Computer Science, IIT Mumbai",
  height: "5'4\"",
  weight: "55 kg",
  religion: "Hindu",
  caste: "Brahmin",
  motherTongue: "Hindi",
  maritalStatus: "Never Married",
  images: [
    "/placeholder.svg?height=400&width=300",
    "/placeholder.svg?height=400&width=300",
    "/placeholder.svg?height=400&width=300",
    "/placeholder.svg?height=400&width=300",
  ],
  verified: true,
  premium: true,
  about:
    "I am a passionate software engineer who loves to explore new technologies and travel to different places. I believe in maintaining a work-life balance and enjoy spending time with family and friends. Looking for a life partner who shares similar values and interests.",
  interests: ["Travel", "Reading", "Yoga", "Photography", "Cooking", "Dancing"],
  family: {
    father: "Business Owner",
    mother: "Homemaker",
    siblings: "1 Sister (Married)",
    familyType: "Nuclear Family",
    familyValues: "Traditional with modern outlook",
  },
  lifestyle: {
    diet: "Vegetarian",
    drinking: "Never",
    smoking: "Never",
    exercise: "Regular",
  },
  partner: {
    ageRange: "26-32",
    heightRange: "5'6\" - 6'0\"",
    education: "Graduate or higher",
    occupation: "Any",
    location: "Mumbai, Delhi, Bangalore",
  },
  profileViews: 245,
  profileLikes: 89,
  connectionsReceived: 23,
  connectionsSent: 15,
};

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
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(mockUserData);
  const [editData, setEditData] = useState(mockUserData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(userData);
  };

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              onClick={handleEdit}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
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
          )}
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
                    src={userData.images[0] || "/placeholder.svg"}
                    alt={userData.name}
                    fill
                    className="object-cover rounded-full border-4 border-pink-500/30"
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
                      src={image || "/placeholder.svg"}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    {isEditing && (
                      <button className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1">
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
                        value={editData.about}
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
                                {userData[field] || ""}
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
                                {userData[field] || ""}
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
                        {userData.interests.map((interest, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-pink-500/30 text-pink-400"
                          >
                            {interest}
                          </Badge>
                        ))}
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
                          <span className="text-white">{value}</span>
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
                          <span className="text-white">{value}</span>
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
                          <span className="text-white">{value}</span>
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
