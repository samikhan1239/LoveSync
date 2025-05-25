import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [1, "Name cannot be empty"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      minlength: [1, "Location cannot be empty"],
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    birthLocation: {
      type: String,
      trim: true,
      maxlength: [100, "Birth location cannot exceed 100 characters"],
      default: "",
    },
    workLocation: {
      type: String,
      trim: true,
      maxlength: [100, "Work location cannot exceed 100 characters"],
      default: "",
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Age must be at least 18"],
      max: [100, "Age cannot exceed 100"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female", "Other"],
        message: "Gender must be Male, Female, or Other",
      },
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    maritalStatus: {
      type: String,
      required: [true, "Marital status is required"],
      enum: {
        values: ["Never Married", "Divorced", "Widowed"],
        message: "Marital status must be Never Married, Divorced, or Widowed",
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"],
    },
    height: {
      type: Number,
      required: [true, "Height is required"],
      min: [100, "Height must be at least 100 cm"],
      max: [250, "Height cannot exceed 250 cm"],
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [30, "Weight must be at least 30 kg"],
      max: [200, "Weight cannot exceed 200 kg"],
    },
    complexion: {
      type: String,
      required: [true, "Complexion is required"],
      enum: {
        values: ["Fair", "Medium", "Dark"],
        message: "Complexion must be Fair, Medium, or Dark",
      },
    },
    religion: {
      type: String,
      required: [true, "Religion is required"],
      enum: {
        values: [
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
        message: "Invalid religion value",
      },
    },
    caste: {
      type: String,
      required: [true, "Caste is required"],
      enum: {
        values: ["General", "OBC", "SC/ST"],
        message: "Caste must be General, OBC, or SC/ST",
      },
    },
    diet: {
      type: String,
      required: [true, "Diet is required"],
      enum: {
        values: ["Vegetarian", "Non-Vegetarian", "Vegan"],
        message: "Diet must be Vegetarian, Non-Vegetarian, or Vegan",
      },
    },
    smoking: {
      type: String,
      required: [true, "Smoking status is required"],
      enum: {
        values: ["Non-Smoker", "Occasional", "Regular"],
        message: "Smoking status must be Non-Smoker, Occasional, or Regular",
      },
    },
    drinking: {
      type: String,
      required: [true, "Drinking status is required"],
      enum: {
        values: ["Non-Drinker", "Occasional", "Regular"],
        message: "Drinking status must be Non-Drinker, Occasional, or Regular",
      },
    },
    education: {
      degree: {
        type: String,
        required: [true, "Degree is required"],
        trim: true,
        minlength: [1, "Degree cannot be empty"],
        maxlength: [100, "Degree cannot exceed 100 characters"],
      },
      institution: {
        type: String,
        required: [true, "Institution is required"],
        trim: true,
        minlength: [1, "Institution cannot be empty"],
        maxlength: [200, "Institution cannot exceed 200 characters"],
      },
      fieldOfStudy: {
        type: String,
        trim: true,
        maxlength: [100, "Field of study cannot exceed 100 characters"],
        default: "",
      },
      graduationYear: {
        type: Number,
        min: [1950, "Graduation year must be 1950 or later"],
        max: [
          new Date().getFullYear(),
          `Graduation year cannot exceed ${new Date().getFullYear()}`,
        ],
        default: null,
      },
    },
    occupation: {
      type: String,
      required: [true, "Occupation is required"],
      trim: true,
      minlength: [1, "Occupation cannot be empty"],
      maxlength: [100, "Occupation cannot exceed 100 characters"],
    },
    income: {
      type: Number,
      required: [true, "Income is required"],
      min: [0, "Income cannot be negative"],
    },
    familyType: {
      type: String,
      required: [true, "Family type is required"],
      enum: {
        values: ["Nuclear", "Joint", "Extended"],
        message: "Family type must be Nuclear, Joint, or Extended",
      },
    },
    familyStatus: {
      type: String,
      required: [true, "Family status is required"],
      enum: {
        values: ["Middle Class", "Upper Class", "Lower Class"],
        message:
          "Family status must be Middle Class, Upper Class, or Lower Class",
      },
    },
    familyValues: {
      type: String,
      required: [true, "Family values are required"],
      enum: {
        values: ["Traditional", "Moderate", "Liberal"],
        message: "Family values must be Traditional, Moderate, or Liberal",
      },
    },
    partnerAgeMin: {
      type: Number,
      required: [true, "Minimum partner age is required"],
      min: [18, "Minimum partner age must be at least 18"],
      max: [100, "Minimum partner age cannot exceed 100"],
    },
    partnerAgeMax: {
      type: Number,
      required: [true, "Maximum partner age is required"],
      min: [18, "Maximum partner age must be at least 18"],
      max: [100, "Maximum partner age cannot exceed 100"],
    },
    partnerReligion: {
      type: String,
      required: [true, "Partner religion is required"],
      enum: {
        values: [
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
        message: "Invalid partner religion value",
      },
    },
    partnerCaste: {
      type: String,
      required: [true, "Partner caste is required"],
      enum: {
        values: ["General", "OBC", "SC/ST"],
        message: "Partner caste must be General, OBC, or SC/ST",
      },
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
      trim: true,
      minlength: [1, "Bio cannot be empty"],
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },
    photos: {
      type: [String],
      required: [true, "At least one photo is required"],
      validate: {
        validator: (arr) =>
          arr.length >= 1 &&
          arr.length <= 3 &&
          arr.every((url) => /^https?:\/\/.+$/.test(url)),
        message: "1 to 3 valid URLs required for photos",
      },
    },
    hobbies: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every((hobby) => typeof hobby === "string" && hobby.length <= 50),
        message: "Hobbies must be strings with max length of 50 characters",
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be pending, approved, or rejected",
      },
      default: "pending",
      index: true,
    },
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ProfileSchema.index({ userId: 1, status: 1 });
ProfileSchema.index({ status: 1, createdAt: -1 });

// Pre-save hook to update timestamps
ProfileSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusUpdatedAt = new Date();
  }
  next();
});

export const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
