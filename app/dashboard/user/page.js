"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  User,
  Briefcase,
  Users,
  Home,
  Heart as HeartIcon,
  Camera,
  ChevronLeft,
  ChevronRight,
  Save,
  LogOut,
  Eye,
  Mail,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define the schema for form validation
const schema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name cannot exceed 100 characters"),
    location: z
      .string()
      .min(1, "Location is required")
      .max(100, "Location cannot exceed 100 characters"),
    birthLocation: z
      .string()
      .max(100, "Birth location cannot exceed 100 characters")
      .optional(),
    workLocation: z
      .string()
      .max(100, "Work location cannot exceed 100 characters")
      .optional(),
    age: z.number().min(18, "Must be at least 18").max(100, "Invalid age"),
    gender: z.enum(["Male", "Female", "Other"], {
      required_error: "Gender is required",
    }),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    maritalStatus: z.enum(["Never Married", "Divorced", "Widowed"], {
      required_error: "Marital status is required",
    }),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    height: z
      .number()
      .min(100, "Height must be at least 100 cm")
      .max(250, "Height cannot exceed 250 cm"),
    weight: z
      .number()
      .min(30, "Weight must be at least 30 kg")
      .max(200, "Weight cannot exceed 200 kg"),
    complexion: z.enum(["Fair", "Medium", "Dark"], {
      required_error: "Complexion is required",
    }),
    religion: z.enum(
      [
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
      ],
      { required_error: "Religion is required" }
    ),
    caste: z.enum(["General", "OBC", "SC/ST"], {
      required_error: "Caste is required",
    }),
    diet: z.enum(["Vegetarian", "Non-Vegetarian", "Vegan"], {
      required_error: "Diet is required",
    }),
    smoking: z.enum(["Non-Smoker", "Occasional", "Regular"], {
      required_error: "Smoking status is required",
    }),
    drinking: z.enum(["Non-Drinker", "Occasional", "Regular"], {
      required_error: "Drinking status is required",
    }),
    education: z.object({
      degree: z
        .string()
        .min(1, "Degree is required")
        .max(100, "Degree cannot exceed 100 characters"),
      institution: z
        .string()
        .min(1, "Institution is required")
        .max(200, "Institution cannot exceed 200 characters"),
      fieldOfStudy: z
        .string()
        .max(100, "Field of study cannot exceed 100 characters")
        .optional(),
      graduationYear: z
        .number()
        .min(1950, "Year must be 1950 or later")
        .max(
          new Date().getFullYear(),
          `Year cannot exceed ${new Date().getFullYear()}`
        )
        .optional(),
    }),
    occupation: z
      .string()
      .min(1, "Occupation is required")
      .max(100, "Occupation cannot exceed 100 characters"),
    income: z.number().min(0, "Income cannot be negative"),
    familyType: z.enum(["Nuclear", "Joint", "Extended"], {
      required_error: "Family type is required",
    }),
    familyStatus: z.enum(["Middle Class", "Upper Class", "Lower Class"], {
      required_error: "Family status is required",
    }),
    familyValues: z.enum(["Traditional", "Moderate", "Liberal"], {
      required_error: "Family values are required",
    }),
    partnerAgeMin: z
      .number()
      .min(18, "Minimum partner age must be at least 18"),
    partnerAgeMax: z.number().max(100, "Maximum partner age is invalid"),
    partnerReligion: z.enum(
      [
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
      ],
      { required_error: "Partner religion preference is required" }
    ),
    partnerCaste: z.enum(["General", "OBC", "SC/ST"], {
      required_error: "Partner caste preference is required",
    }),
    bio: z
      .string()
      .min(1, "Bio is required")
      .max(1000, "Bio cannot exceed 1000 characters"),
    photos: z
      .array(z.string().url("Each photo must be a valid URL"))
      .min(1, "At least one photo is required")
      .max(3, "Maximum 3 photos allowed"),
  })
  .refine((data) => data.partnerAgeMax >= data.partnerAgeMin, {
    message: "Maximum partner age must be greater than or equal to minimum",
    path: ["partnerAgeMax"],
  });

// Define step-specific schemas for validation
const stepSchemas = [
  z.object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name cannot exceed 100 characters"),
    location: z
      .string()
      .min(1, "Location is required")
      .max(100, "Location cannot exceed 100 characters"),
    birthLocation: z
      .string()
      .max(100, "Birth location cannot exceed 100 characters")
      .optional(),
    workLocation: z
      .string()
      .max(100, "Work location cannot exceed 100 characters")
      .optional(),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["Male", "Female", "Other"], {
      required_error: "Gender is required",
    }),
    age: z.number().min(18, "Must be at least 18").max(100, "Invalid age"),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    height: z
      .number()
      .min(100, "Height must be at least 100 cm")
      .max(250, "Height cannot exceed 250 cm"),
    weight: z
      .number()
      .min(30, "Weight must be at least 30 kg")
      .max(200, "Weight cannot exceed 200 kg"),
    complexion: z.enum(["Fair", "Medium", "Dark"], {
      required_error: "Complexion is required",
    }),
    religion: z.enum(
      [
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
      ],
      { required_error: "Religion is required" }
    ),
    caste: z.enum(["General", "OBC", "SC/ST"], {
      required_error: "Caste is required",
    }),
    maritalStatus: z.enum(["Never Married", "Divorced", "Widowed"], {
      required_error: "Marital status is required",
    }),
    bio: z
      .string()
      .min(1, "Bio is required")
      .max(1000, "Bio cannot exceed 1000 characters"),
  }),
  z.object({
    education: z.object({
      degree: z
        .string()
        .min(1, "Degree is required")
        .max(100, "Degree cannot exceed 100 characters"),
      institution: z
        .string()
        .min(1, "Institution is required")
        .max(200, "Institution cannot exceed 200 characters"),
      fieldOfStudy: z
        .string()
        .max(100, "Field of study cannot exceed 100 characters")
        .optional(),
      graduationYear: z
        .number()
        .min(1950, "Year must be 1950 or later")
        .max(
          new Date().getFullYear(),
          `Year cannot exceed ${new Date().getFullYear()}`
        )
        .optional(),
    }),
    occupation: z
      .string()
      .min(1, "Occupation is required")
      .max(100, "Occupation cannot exceed 100 characters"),
    income: z.number().min(0, "Income cannot be negative"),
  }),
  z.object({
    familyType: z.enum(["Nuclear", "Joint", "Extended"], {
      required_error: "Family type is required",
    }),
    familyStatus: z.enum(["Middle Class", "Upper Class", "Lower Class"], {
      required_error: "Family status is required",
    }),
    familyValues: z.enum(["Traditional", "Moderate", "Liberal"], {
      required_error: "Family values are required",
    }),
  }),
  z.object({
    diet: z.enum(["Vegetarian", "Non-Vegetarian", "Vegan"], {
      required_error: "Diet is required",
    }),
    smoking: z.enum(["Non-Smoker", "Occasional", "Regular"], {
      required_error: "Smoking status is required",
    }),
    drinking: z.enum(["Non-Drinker", "Occasional", "Regular"], {
      required_error: "Drinking status is required",
    }),
  }),
  z
    .object({
      partnerAgeMin: z
        .number()
        .min(18, "Minimum partner age must be at least 18"),
      partnerAgeMax: z.number().max(100, "Maximum partner age is invalid"),
      partnerReligion: z.enum(
        [
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
        ],
        { required_error: "Partner religion preference is required" }
      ),
      partnerCaste: z.enum(["General", "OBC", "SC/ST"], {
        required_error: "Partner caste preference is required",
      }),
    })
    .refine((data) => data.partnerAgeMax >= data.partnerAgeMin, {
      message: "Maximum partner age must be greater than or equal to minimum",
      path: ["partnerAgeMax"],
    }),
  z.object({
    photos: z
      .array(z.string().url("Each photo must be a valid URL"))
      .min(1, "At least one photo is required")
      .max(3, "Maximum 3 photos allowed"),
  }),
];

const steps = [
  { id: 1, title: "Basic Information", icon: User },
  { id: 2, title: "Professional Details", icon: Briefcase },
  { id: 3, title: "Family Background", icon: Users },
  { id: 4, title: "Lifestyle", icon: Home },
  { id: 5, title: "Partner Preferences", icon: HeartIcon },
  { id: 6, title: "Photos", icon: Camera },
];

const bioSuggestions = [
  "I'm a friendly and ambitious individual who values family and tradition. I enjoy traveling, reading, and exploring new cuisines. Looking for a kind-hearted partner who shares similar values and is ready for a meaningful journey together.",
  "A passionate professional with a love for music and outdoor adventures. I believe in balancing work and life, and I'm seeking someone who is supportive, understanding, and shares my enthusiasm for life's little joys.",
  "I’m a simple, down-to-earth person who cherishes honesty and respect in relationships. In my free time, I enjoy cooking and spending time with loved ones. Hoping to meet someone who is compassionate and family-oriented.",
  "An optimist who finds joy in learning and growing. I’m dedicated to my career but make time for fitness and creativity. I’m looking for a partner who is open-minded and ready to build a future together.",
];

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [showHearts, setShowHearts] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stepErrors, setStepErrors] = useState({});

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      location: "",
      birthLocation: "",
      workLocation: "",
      age: 18,
      gender: "Male",
      dateOfBirth: "",
      maritalStatus: "Never Married",
      phone: "",
      height: 100,
      weight: 30,
      complexion: "Fair",
      religion: "Hindu",
      caste: "General",
      diet: "Vegetarian",
      smoking: "Non-Smoker",
      drinking: "Non-Drinker",
      education: {
        degree: "",
        institution: "",
        fieldOfStudy: "",
        graduationYear: null,
      },
      occupation: "",
      income: 0,
      familyType: "Nuclear",
      familyStatus: "Middle Class",
      familyValues: "Moderate",
      partnerAgeMin: 18,
      partnerAgeMax: 100,
      partnerReligion: "Hindu",
      partnerCaste: "General",
      bio: "",
      photos: [],
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user?.id) {
      fetchProfile();
    } else if (status === "unauthenticated") {
      setError("Please log in to view your profile.");
      router.push("/signin");
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profiles", { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Failed to fetch profile: ${res.status}`);
      }
      const data = await res.json();
      let userProfile = null;

      // Handle both array and single object responses
      if (Array.isArray(data.profiles)) {
        userProfile = data.profiles.find((p) => p.userId === session.user.id);
      } else if (data.userId === session.user.id) {
        userProfile = data;
      }

      if (userProfile) {
        // Map API response to form schema
        const profileData = {
          name: userProfile.name || "",
          location: userProfile.location || "",
          birthLocation: userProfile.birthLocation || "",
          workLocation: userProfile.workLocation || "",
          age: userProfile.age || 18,
          gender: userProfile.gender || "Male",
          dateOfBirth: userProfile.dateOfBirth
            ? new Date(userProfile.dateOfBirth).toISOString().split("T")[0]
            : "",
          maritalStatus: userProfile.maritalStatus || "Never Married",
          phone: userProfile.phone || "",
          height: userProfile.height || 100,
          weight: userProfile.weight || 30,
          complexion: userProfile.complexion || "Fair",
          religion: userProfile.religion || "Hindu",
          caste: userProfile.caste || "General",
          diet: userProfile.diet || "Vegetarian",
          smoking: userProfile.smoking || "Non-Smoker",
          drinking: userProfile.drinking || "Non-Drinker",
          education: {
            degree: userProfile.education?.degree || "",
            institution: userProfile.education?.institution || "",
            fieldOfStudy: userProfile.education?.fieldOfStudy || "",
            graduationYear: userProfile.education?.graduationYear || null,
          },
          occupation: userProfile.occupation || "",
          income: userProfile.income || 0,
          familyType: userProfile.familyType || "Nuclear",
          familyStatus: userProfile.familyStatus || "Middle Class",
          familyValues: userProfile.familyValues || "Moderate",
          partnerAgeMin: userProfile.partnerAgeMin || 18,
          partnerAgeMax: userProfile.partnerAgeMax || 100,
          partnerReligion: userProfile.partnerReligion || "Hindu",
          partnerCaste: userProfile.partnerCaste || "General",
          bio: userProfile.bio || "",
          photos: userProfile.photos || [],
          _id: userProfile._id || "",
          userId: userProfile.userId || "",
        };
        setProfile(profileData);
        reset(profileData);
        setPreviewPhotos(userProfile.photos || []);
        setIsSubmitted(true);
        setIsEditing(false);
      } else {
        setProfile(null);
        setIsSubmitted(false);
        setIsEditing(true);
        setPreviewPhotos([]);
        reset({
          name: "",
          location: "",
          birthLocation: "",
          workLocation: "",
          age: 18,
          gender: "Male",
          dateOfBirth: "",
          maritalStatus: "Never Married",
          phone: "",
          height: 100,
          weight: 30,
          complexion: "Fair",
          religion: "Hindu",
          caste: "General",
          diet: "Vegetarian",
          smoking: "Non-Smoker",
          drinking: "Non-Drinker",
          education: {
            degree: "",
            institution: "",
            fieldOfStudy: "",
            graduationYear: null,
          },
          occupation: "",
          income: 0,
          familyType: "Nuclear",
          familyStatus: "Middle Class",
          familyValues: "Moderate",
          partnerAgeMin: 18,
          partnerAgeMax: 100,
          partnerReligion: "Hindu",
          partnerCaste: "General",
          bio: "",
          photos: [],
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err.message);
      setError("Failed to load profile. Please try again.");
      setProfile(null);
      setIsSubmitted(false);
      setIsEditing(true);
    }
  };

  const onSubmit = async (data) => {
    try {
      await schema.parseAsync(data);
      setError("");

      if (!session || !session.user?.id) {
        throw new Error("User not authenticated. Please log in again.");
      }

      const res = await fetch("/api/profiles", {
        method: profile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...data, userId: session.user.id }),
      });

      if (!res.ok) {
        throw new Error(
          `Failed to ${profile ? "update" : "create"} profile: ${res.status}`
        );
      }

      const result = await res.json();
      const newProfile = {
        ...data,
        _id: result.profileId,
        userId: session.user.id,
      };
      setProfile(newProfile);
      reset(newProfile);
      setPreviewPhotos(data.photos);
      setIsEditing(false);
      setIsSubmitted(true);
      setSuccessMessage(
        "Profile will be approved in two to three days. You will be notified."
      );
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 4000);
    } catch (err) {
      console.error("Profile submit error:", err);
      if (err instanceof z.ZodError) {
        const errors = err.flatten().fieldErrors;
        setStepErrors(errors);
        setError(
          "Please correct the following errors:\n" +
            Object.entries(errors)
              .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
              .join("\n")
        );
      } else {
        setError(
          `Failed to ${
            profile ? "update" : "create"
          } profile. Please try again.`
        );
      }
    }
  };

  const handleImageUpload = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.target.files);
    if (files.length === 0) {
      setError("No files selected. Please choose at least one image.");
      return;
    }
    if (files.length + previewPhotos.length > 3) {
      setError("You can upload a maximum of 3 photos.");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadProgress(0);

    const newPreviews = [...previewPhotos];
    const newUrls = [...(getValues("photos") || [])];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          throw new Error(`File ${file.name} is not an image.`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 5MB.`);
        }

        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => {
            newPreviews.push(reader.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        setUploadProgress(((i + 1) / files.length) * 100);

        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name}: ${res.status}`);
        }

        const result = await res.json();
        if (!result.secure_url) {
          throw new Error(
            `Upload failed for ${file.name}: No secure URL returned.`
          );
        }
        newUrls.push(result.secure_url);
      }

      setPreviewPhotos(newPreviews);
      setValue("photos", newUrls, { shouldValidate: true });
    } catch (err) {
      setError(`Failed to upload images: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = null;
    }
  };

  const removePhoto = (index) => {
    const updatedPreviews = previewPhotos.filter((_, i) => i !== index);
    const updatedUrls = (getValues("photos") || []).filter(
      (_, i) => i !== index
    );
    setPreviewPhotos(updatedPreviews);
    setValue("photos", updatedUrls, { shouldValidate: true });
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setIsSubmitted(false);
    setCurrentStep(1);
  };

  const handleViewProfile = () => {
    if (profile?._id) {
      router.push(`/profiles/${profile._id}`);
    }
  };

  const validateStep = async () => {
    const stepIndex = currentStep - 1;
    const stepSchema = stepSchemas[stepIndex];
    const formData = getValues();

    try {
      await stepSchema.parseAsync(formData);
      setStepErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.flatten().fieldErrors;
        setStepErrors(errors);
        setError(
          "Please fill in all required fields correctly before proceeding."
        );
      }
      return false;
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length) {
      const isValid = await validateStep();
      if (isValid) {
        setError("");
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
      setStepErrors({});
    }
  };

  const handleBrowseProfiles = () => {
    router.push("/profiles");
  };

  const handleContactUs = () => {
    router.push("/contact");
  };

  const handleBioSuggestion = (bio) => {
    setValue("bio", bio, { shouldValidate: true });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                  placeholder="Enter your name"
                />
                {(errors.name || stepErrors.name) && (
                  <p className="text-red-500 text-sm">
                    {errors.name?.message || stepErrors.name?.[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">
                  Current Location *
                </Label>
                <Input
                  id="location"
                  {...register("location")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                  placeholder="e.g., New York, NY"
                />
                {(errors.location || stepErrors.location) && (
                  <p className="text-red-500 text-sm">
                    {errors.location?.message || stepErrors.location?.[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthLocation" className="text-white">
                  Birth Location
                </Label>
                <Input
                  id="birthLocation"
                  {...register("birthLocation")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                  placeholder="e.g., Mumbai, India"
                />
                {(errors.birthLocation || stepErrors.birthLocation) && (
                  <p className="text-red-500 text-sm">
                    {errors.birthLocation?.message ||
                      stepErrors.birthLocation?.[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="workLocation" className="text-white">
                  Work Location
                </Label>
                <Input
                  id="workLocation"
                  {...register("workLocation")}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500"
                  placeholder="e.g., Bangalore, India"
                />
                {(errors.workLocation || stepErrors.workLocation) && (
                  <p className="text-red-500 text-sm">
                    {errors.workLocation?.message ||
                      stepErrors.workLocation?.[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-white">
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("dateOfBirth")}
                  className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                />
                {(errors.dateOfBirth || stepErrors.dateOfBirth) && (
                  <p className="text-red-500 text-sm">
                    {errors.dateOfBirth?.message || stepErrors.dateOfBirth?.[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-white">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  {...register("age", { valueAsNumber: true })}
                  className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                />
                {(errors.age || stepErrors.age) && (
                  <p className="text-red-500 text-sm">
                    {errors.age?.message || stepErrors.age?.[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Gender *</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setValue("gender", value, { shouldValidate: true })
                }
                defaultValue={getValues("gender")}
                className="flex space-x-6"
              >
                {["Male", "Female", "Other"].map((gender) => (
                  <div key={gender} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={gender}
                      id={gender.toLowerCase()}
                      className="border-white/20 text-pink-500"
                    />
                    <Label
                      htmlFor={gender.toLowerCase()}
                      className="text-white"
                    >
                      {gender}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {(errors.gender || stepErrors.gender) && (
                <p className="text-red-500 text-sm">
                  {errors.gender?.message || stepErrors.gender?.[0]}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                  placeholder="e.g., +1234567890"
                />
                {(errors.phone || stepErrors.phone) && (
                  <p className="text-red-500 text-sm">
                    {errors.phone?.message || stepErrors.phone?.[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="text-white">
                  Height (cm) *
                </Label>
                <Input
                  id="height"
                  type="number"
                  {...register("height", { valueAsNumber: true })}
                  className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                  placeholder="e.g., 170"
                />
                {(errors.height || stepErrors.height) && (
                  <p className="text-red-500 text-sm">
                    {errors.height?.message || stepErrors.height?.[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-white">
                  Weight (kg) *
                </Label>
                <Input
                  id="weight"
                  type="number"
                  {...register("weight", { valueAsNumber: true })}
                  className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                  placeholder="e.g., 65"
                />
                {(errors.weight || stepErrors.weight) && (
                  <p className="text-red-500 text-sm">
                    {errors.weight?.message || stepErrors.weight?.[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="complexion" className="text-white">
                  Complexion *
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue("complexion", value, { shouldValidate: true })
                  }
                  defaultValue={getValues("complexion")}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select complexion" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                    {["Fair", "Medium", "Dark"].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(errors.complexion || stepErrors.complexion) && (
                  <p className="text-red-500 text-sm">
                    {errors.complexion?.message || stepErrors.complexion?.[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="religion" className="text-white">
                  Religion *
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue("religion", value, { shouldValidate: true })
                  }
                  defaultValue={getValues("religion")}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                    {[
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
                    ].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(errors.religion || stepErrors.religion) && (
                  <p className="text-red-500 text-sm">
                    {errors.religion?.message || stepErrors.religion?.[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="caste" className="text-white">
                  Caste *
                </Label>
                <Select
                  onValueChange={(value) =>
                    setValue("caste", value, { shouldValidate: true })
                  }
                  defaultValue={getValues("caste")}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select caste" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                    {["General", "OBC", "SC/ST"].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(errors.caste || stepErrors.caste) && (
                  <p className="text-red-500 text-sm">
                    {errors.caste?.message || stepErrors.caste?.[0]}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2 ">
              <Label htmlFor="maritalStatus" className="text-white">
                Marital Status *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("maritalStatus", value, { shouldValidate: true })
                }
                defaultValue={getValues("maritalStatus")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                  {["Never Married", "Divorced", "Widowed"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors.maritalStatus || stepErrors.maritalStatus) && (
                <p className="text-red-500 text-sm">
                  {errors.maritalStatus?.message ||
                    stepErrors.maritalStatus?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-white">
                  About Me *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Suggest Bio
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white w-96">
                    <h4 className="font-medium mb-2">Bio Suggestions</h4>
                    <ul className="space-y-2">
                      {bioSuggestions.map((bio, index) => (
                        <li
                          key={index}
                          className="p-2 rounded hover:bg-white/10 cursor-pointer"
                          onClick={() => handleBioSuggestion(bio)}
                        >
                          {bio.slice(0, 100)}...
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
              <Textarea
                id="bio"
                {...register("bio")}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-pink-500 min-h-[100px]"
                placeholder="Tell us about yourself..."
              />
              {(errors.bio || stepErrors.bio) && (
                <p className="text-red-500 text-sm">
                  {errors.bio?.message || stepErrors.bio?.[0]}
                </p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="education.degree" className="text-white">
                Degree *
              </Label>
              <Input
                id="education.degree"
                {...register("education.degree")}
                className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                placeholder="e.g., B.Tech"
              />
              {(errors.education?.degree || stepErrors.education?.degree) && (
                <p className="text-red-500 text-sm">
                  {errors.education?.degree?.message ||
                    stepErrors.education?.degree?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="education.institution" className="text-white">
                Institution *
              </Label>
              <Input
                id="education.institution"
                {...register("education.institution")}
                className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                placeholder="e.g., IIT Delhi"
              />
              {(errors.education?.institution ||
                stepErrors.education?.institution) && (
                <p className="text-red-500 text-sm">
                  {errors.education?.institution?.message ||
                    stepErrors.education?.institution?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="education.fieldOfStudy" className="text-white">
                Field of Study
              </Label>
              <Input
                id="education.fieldOfStudy"
                {...register("education.fieldOfStudy")}
                className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                placeholder="e.g., Computer Science"
              />
              {(errors.education?.fieldOfStudy ||
                stepErrors.education?.fieldOfStudy) && (
                <p className="text-red-500 text-sm">
                  {errors.education?.fieldOfStudy?.message ||
                    stepErrors.education?.fieldOfStudy?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="education.graduationYear" className="text-white">
                Graduation Year
              </Label>
              <Input
                id="education.graduationYear"
                type="number"
                {...register("education.graduationYear", {
                  valueAsNumber: true,
                })}
                className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                placeholder="e.g., 2020"
              />
              {(errors.education?.graduationYear ||
                stepErrors.education?.graduationYear) && (
                <p className="text-red-500 text-sm">
                  {errors.education?.graduationYear?.message ||
                    stepErrors.education?.graduationYear?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation" className="text-white">
                Occupation *
              </Label>
              <Input
                id="occupation"
                {...register("occupation")}
                className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                placeholder="Your job title"
              />
              {(errors.occupation || stepErrors.occupation) && (
                <p className="text-red-500 text-sm">
                  {errors.occupation?.message || stepErrors.occupation?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="income" className="text-white">
                Annual Income *
              </Label>
              <Input
                id="income"
                type="number"
                {...register("income", { valueAsNumber: true })}
                className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                placeholder="Enter your annual income"
              />
              {(errors.income || stepErrors.income) && (
                <p className="text-red-500 text-sm">
                  {errors.income?.message || stepErrors.income?.[0]}
                </p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="familyType" className="text-white">
                Family Type *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("familyType", value, { shouldValidate: true })
                }
                defaultValue={getValues("familyType")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select family type" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                  {["Nuclear", "Joint", "Extended"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors.familyType || stepErrors.familyType) && (
                <p className="text-red-500 text-sm">
                  {errors.familyType?.message || stepErrors.familyType?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyStatus" className="text-white">
                Family Status *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("familyStatus", value, { shouldValidate: true })
                }
                defaultValue={getValues("familyStatus")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select family status" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                  {["Middle Class", "Upper Class", "Lower Class"].map(
                    (option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              {(errors.familyStatus || stepErrors.familyStatus) && (
                <p className="text-red-500 text-sm">
                  {errors.familyStatus?.message || stepErrors.familyStatus?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyValues" className="text-white">
                Family Values *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("familyValues", value, { shouldValidate: true })
                }
                defaultValue={getValues("familyValues")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select family values" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                  {["Traditional", "Moderate", "Liberal"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors.familyValues || stepErrors.familyValues) && (
                <p className="text-red-500 text-sm">
                  {errors.familyValues?.message || stepErrors.familyValues?.[0]}
                </p>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="diet" className="text-white">
                Diet *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("diet", value, { shouldValidate: true })
                }
                defaultValue={getValues("diet")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select diet" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                  {["Vegetarian", "Non-Vegetarian", "Vegan"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors.diet || stepErrors.diet) && (
                <p className="text-red-500 text-sm">
                  {errors.diet?.message || stepErrors.diet?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="smoking" className="text-white">
                Smoking *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("smoking", value, { shouldValidate: true })
                }
                defaultValue={getValues("smoking")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select smoking status" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                  {["Non-Smoker", "Occasional", "Regular"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors.smoking || stepErrors.smoking) && (
                <p className="text-red-500 text-sm">
                  {errors.smoking?.message || stepErrors.smoking?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="drinking" className="text-white">
                Drinking *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("drinking", value, { shouldValidate: true })
                }
                defaultValue={getValues("drinking")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select drinking status" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                  {["Non-Drinker", "Occasional", "Regular"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors.drinking || stepErrors.drinking) && (
                <p className="text-red-500 text-sm">
                  {errors.drinking?.message || stepErrors.drinking?.[0]}
                </p>
              )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white">Partner Age Range *</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  {...register("partnerAgeMin", { valueAsNumber: true })}
                  className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                  placeholder="Min age"
                />
                <Input
                  type="number"
                  {...register("partnerAgeMax", { valueAsNumber: true })}
                  className="bg-white/10 border-white/20 text-white focus:border-pink-500"
                  placeholder="Max age"
                />
              </div>
              {(errors.partnerAgeMin || stepErrors.partnerAgeMin) && (
                <p className="text-red-500 text-sm">
                  {errors.partnerAgeMin?.message ||
                    stepErrors.partnerAgeMin?.[0]}
                </p>
              )}
              {(errors.partnerAgeMax || stepErrors.partnerAgeMax) && (
                <p className="text-red-500 text-sm">
                  {errors.partnerAgeMax?.message ||
                    stepErrors.partnerAgeMax?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="partnerReligion" className="text-white">
                Partner Religion *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("partnerReligion", value, { shouldValidate: true })
                }
                defaultValue={getValues("partnerReligion")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select partner religion" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                  {[
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
                  ].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors.partnerReligion || stepErrors.partnerReligion) && (
                <p className="text-red-500 text-sm">
                  {errors.partnerReligion?.message ||
                    stepErrors.partnerReligion?.[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="partnerCaste" className="text-white">
                Partner Caste *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("partnerCaste", value, { shouldValidate: true })
                }
                defaultValue={getValues("partnerCaste")}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select partner caste" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 backdrop-blur-lg border-slate-800 text-white">
                  {["General", "OBC", "SC/ST"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(errors.partnerCaste || stepErrors.partnerCaste) && (
                <p className="text-red-500 text-sm">
                  {errors.partnerCaste?.message || stepErrors.partnerCaste?.[0]}
                </p>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Upload Your Photos
              </h3>
              <p className="text-white/70">
                Add at least 1 and up to 3 clear, recent photos to make your
                profile stand out
              </p>
            </div>
            {isUploading && (
              <div className="w-full bg-white/10 rounded-full h-4 mb-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {(errors.photos || stepErrors.photos) && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Photo Error</AlertTitle>
                <AlertDescription>
                  {errors.photos?.message ||
                    stepErrors.photos?.[0] ||
                    "Please upload at least one valid photo."}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {previewPhotos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square border-2 border-dashed border-white/20 rounded-lg bg-white/5"
                >
                  <img
                    src={photo}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                    onClick={() => removePhoto(index)}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              ))}
              {previewPhotos.length < 3 && (
                <div className="aspect-square border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative">
                  <Camera className="h-8 w-8 text-white/50 mb-2" />
                  <span className="text-white/50 text-sm">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                </div>
              )}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Photo Guidelines:</h4>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• Upload clear, recent photos of yourself</li>
                <li>• At least one photo is required</li>
                <li>• Avoid group photos or photos with sunglasses</li>
                <li>• Photos should be appropriate and family-friendly</li>
                <li>• Maximum file size: 5MB</li>
                <li>• Maximum 3 photos allowed</li>
              </ul>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {isClient &&
        Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={`heart-bg-${i}`}
            className="absolute text-pink-300"
            initial={{
              x: Math.random() * 1920,
              y: 1080 + 100,
              opacity: 0.3 + Math.random() * 0.4,
              scale: 0.5 + Math.random() * 1.2,
            }}
            animate={{
              y: -100,
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              scale: [0.5, 1.5, 0.5],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Number.POSITIVE_INFINITY,
              ease: ["easeInOut", "easeIn", "easeOut"],
              delay: Math.random() * 6,
              times: [0, 0.5, 1],
            }}
          >
            <Heart size={15 + Math.random() * 20} fill="currentColor" />
          </motion.div>
        ))}

      {showHearts && isClient && (
        <div className="fixed inset-0 overflow-hidden z-50 pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => {
            const randomX = Math.random() * window.innerWidth;
            const randomScale = 0.6 + Math.random() * 0.6;
            const heartSize = 20 + Math.random() * 20;
            const duration = 3 + Math.random() * 2;
            const delay = Math.random() * 2;
            const rotateDirection = Math.random() > 0.5 ? 1 : -1;

            return (
              <motion.div
                key={`heart-shower-${i}`}
                className="absolute text-pink-500"
                initial={{
                  x: randomX,
                  y: -50,
                  opacity: 0.8,
                  scale: randomScale,
                }}
                animate={{
                  y: window.innerHeight + 50,
                  x: randomX + (Math.random() * 100 - 50),
                  rotate: [0, rotateDirection * 360],
                  opacity: [0.8, 0.5, 0],
                  scale: [randomScale, 1.1, 0.4],
                }}
                transition={{
                  duration,
                  ease: "easeInOut",
                  delay,
                }}
              >
                <Heart
                  size={heartSize}
                  fill="currentColor"
                  className="drop-shadow-md"
                />
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Your Matrimonial Profile
          </h1>
          <p className="text-white/70 text-lg">
            Create or update your profile to find your perfect match
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/20">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              <span>{successMessage}</span>
              <div className="flex gap-4">
                <Button
                  onClick={handleBrowseProfiles}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  Browse Profiles
                </Button>
                <Button
                  onClick={handleContactUs}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us for Fast Approval
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isSubmitted && !isEditing ? (
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-pink-500" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {profile?.photos?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-2">
                      Profile Photo
                    </h4>
                    <div className="flex justify-center">
                      <img
                        src={profile.photos[0]}
                        alt="Primary Profile Photo"
                        className="w-48 h-48 object-cover rounded-full border-4 border-pink-500 shadow-lg"
                      />
                    </div>
                    {profile.photos.length > 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {profile.photos.slice(1).map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Profile Photo ${index + 2}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-white/20"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Name", value: profile?.name },
                    { label: "Location", value: profile?.location },
                    { label: "Age", value: profile?.age },
                    { label: "Gender", value: profile?.gender },
                    {
                      label: "Date of Birth",
                      value: profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString()
                        : null,
                    },
                    { label: "Marital Status", value: profile?.maritalStatus },
                    { label: "Phone", value: profile?.phone },
                    {
                      label: "Height",
                      value: profile?.height ? `${profile.height} cm` : null,
                    },
                    {
                      label: "Weight",
                      value: profile?.weight ? `${profile.weight} kg` : null,
                    },
                    { label: "Complexion", value: profile?.complexion },
                    { label: "Religion", value: profile?.religion },
                    { label: "Caste", value: profile?.caste },
                    { label: "Diet", value: profile?.diet },
                    { label: "Smoking", value: profile?.smoking },
                    { label: "Drinking", value: profile?.drinking },
                    { label: "Degree", value: profile?.education?.degree },
                    {
                      label: "Institution",
                      value: profile?.education?.institution,
                    },
                    { label: "Occupation", value: profile?.occupation },
                    {
                      label: "Income",
                      value: profile?.income ? `${profile.income}` : null,
                    },
                    { label: "Family Type", value: profile?.familyType },
                    { label: "Family Status", value: profile?.familyStatus },
                    { label: "Family Values", value: profile?.familyValues },
                    {
                      label: "Partner Age Range",
                      value:
                        profile?.partnerAgeMin && profile?.partnerAgeMax
                          ? `${profile.partnerAgeMin} - ${profile.partnerAgeMax}`
                          : null,
                    },
                    {
                      label: "Partner Religion",
                      value: profile?.partnerReligion,
                    },
                    { label: "Partner Caste", value: profile?.partnerCaste },
                    { label: "Bio", value: profile?.bio },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="bg-pink-500/20 text-white"
                      >
                        {label}
                      </Badge>
                      <span className="text-white">
                        {value || "Not provided"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-4 mt-6">
                  <Button
                    onClick={handleViewProfile}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    View My Profile
                  </Button>
                  <Button
                    onClick={handleEditProfile}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 border-pink-500 text-white"
                            : isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-white/20 text-white/50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-xs mt-2 text-center ${
                          isActive ? "text-white" : "text-white/50"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    {React.createElement(steps[currentStep - 1].icon, {
                      className: "h-5 w-5 mr-2 text-pink-500",
                    })}
                    {steps[currentStep - 1].title}
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderStepContent()}</CardContent>
              </Card>

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                {currentStep === steps.length ? (
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || isUploading || previewPhotos.length === 0
                    }
                    className={`bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 ${
                      isSubmitting || isUploading || previewPhotos.length === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Profile"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                    disabled={isUploading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
