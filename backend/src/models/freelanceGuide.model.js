import mongoose from "mongoose";

const freelanceGuideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    interest: {
      type: String,
      required: true
    },

    platforms: [
      {
        name: String,
        url: String
      }
    ],

    servicesToOffer: [
      {
        type: String
      }
    ],

    portfolioProjects: [
      {
        type: String
      }
    ],

    pricingStrategy: [
      {
        level: String,
        priceRange: String
      }
    ],

    tips: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model("FreelanceGuide", freelanceGuideSchema);