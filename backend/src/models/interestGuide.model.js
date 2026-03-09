import mongoose from "mongoose";

const roadmapStageSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true
  },

  skills: [
    {
      type: String
    }
  ],

  projects: [
    {
      type: String
    }
  ],

  resources: [
    {
      title: String,
      url: String
    }
  ]
});

const interestGuideSchema = new mongoose.Schema(
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

    description: {
      type: String
    },

    roadmap: [roadmapStageSchema],

    estimatedDuration: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("InterestGuide", interestGuideSchema);