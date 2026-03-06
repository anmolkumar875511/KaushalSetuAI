import mongoose from 'mongoose';

const skillDemandSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      index: true,
    },
    region: {
      type: String,
      required: true,
      index: true,
    },
    demandScore: {
      type: Number,
      required: true,
    },
    avgSalary: Number,
    growthTrend: Number,
  },
  { timestamps: true }
);

skillDemandSchema.index({ skill: 1, region: 1 }, { unique: true });

export default mongoose.model('SkillDemand', skillDemandSchema);