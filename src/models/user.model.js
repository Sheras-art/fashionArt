import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { boolean } from "zod";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    Addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address"
      }
    ],
    role: {
      type: String,
      required: true,
      enum: ["user", "admin", "owner"],
      default: "user"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    preferences: {
      defaultPaymentMethod: {
        type: String,
        enum: ["Cash On Delivery", "jazzcash", "easypaisa", "card"],
        default: "Cash On Delivery",
      },

      saveCartAcrossDevices: {
        type: Boolean,
        default: true,
      },
    },

    notificationPreferences: {
      orderUpdates: {
        type: Boolean,
        default: true,
      },

      shippingUpdates: {
        type: Boolean,
        default: true,
      },

      stockAlerts: {
        type: Boolean,
        default: true,
      },

      priceDrop: {
        type: Boolean,
        default: true,
      },

      promotionalOffers: {
        type: Boolean,
        default: true,
      },

      newArrivals: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      personalizedRecommendations: {
        type: Boolean,
        default: true,
      },
      personalizedPromotions: {
        type: Boolean,
        default: true,
      },
      saveSearchHistory: {
        type: Boolean,
        default: true,
      },
      anonymousAnalytics: {
        type: Boolean,
        default: true,
      },
    },
    refreshToken: {
      type: String,
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  // checking if password is not modified then we return no need to perform any action like (hashing).
  if (!this.isModified("password")) return;
  // and if password is modified or new then we will hash the password first then save it in DB.
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      userName: this.userName,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);