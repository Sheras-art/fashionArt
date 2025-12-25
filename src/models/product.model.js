import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
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
  image: [
    { 
        type: String,
         required: true 
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
}, {timestamps: true});

export const Product = mongoose.model("Product", productSchema);