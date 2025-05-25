import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "mutual", "declined"],
    default: "pending",
  },
  message: {
    type: String,
    default: "",
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// Add indexes for faster queries
invitationSchema.index({ senderId: 1 });
invitationSchema.index({ receiverId: 1 });

// Update updatedAt on save
invitationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent model redefinition
const Invitation =
  mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);

export { Invitation };
