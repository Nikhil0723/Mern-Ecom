import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: "",
      trim: true,
    },

    buttonText: {
      type: String,
      default: "Shop Now",
      trim: true,
    },

    buttonLink: {
      type: String,
      default: "/shop",
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;