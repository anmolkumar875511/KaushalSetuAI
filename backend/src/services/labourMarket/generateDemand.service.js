import Opportunity from '../../models/opportunity.model.js';
import SkillDemand from '../../models/skillDemand.model.js';

export const generateSkillDemand = async () => {
    try {
        console.log('Generating skill demand...');

        const regionTotals = await Opportunity.aggregate([
            {
                $group: {
                    _id: '$location',
                    totalJobs: { $sum: 1 },
                },
            },
        ]);

        const regionMap = {};
        regionTotals.forEach((r) => {
            regionMap[r._id] = r.totalJobs;
        });

        const skillAggregation = await Opportunity.aggregate([
            { $unwind: '$skills' },
            {
                $group: {
                    _id: {
                        skill: '$skills',
                        region: '$location',
                    },
                    count: { $sum: 1 },
                    avgSalary: { $avg: '$salary' },
                },
            },
        ]);

        const bulkOps = [];

        for (const item of skillAggregation) {
            const skill = item._id.skill;
            const region = item._id.region;
            const count = item.count;
            const avgSalary = item.avgSalary || null;

            const totalJobsInRegion = regionMap[region] || 1;

            const demandScore = count / totalJobsInRegion;

            const growthTrend = Number((demandScore * 20).toFixed(2));

            bulkOps.push({
                updateOne: {
                    filter: { skill, region },
                    update: {
                        $set: {
                            skill,
                            region,
                            demandScore: Number(demandScore.toFixed(3)),
                            avgSalary,
                            growthTrend,
                        },
                    },
                    upsert: true,
                },
            });
        }

        if (bulkOps.length > 0) {
            await SkillDemand.bulkWrite(bulkOps);
        }

        console.log(`Skill demand updated for ${bulkOps.length} entries`);
    } catch (error) {
        console.error('Failed to generate skill demand:', error.message);
    }
};
