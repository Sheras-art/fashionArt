import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    subject: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "read", "resolved"],
      default: "pending",
    },

    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

export const Contact =  mongoose.model("Contact", contactSchema);