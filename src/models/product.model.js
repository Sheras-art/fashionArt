import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  coverImage: {
    type: String,
    required: true
  },
  images: [
    {
      type: String,
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
    max: 5
  }
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);