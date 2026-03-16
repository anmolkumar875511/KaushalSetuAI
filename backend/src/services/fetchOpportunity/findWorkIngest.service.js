import Opportunity from '../../models/opportunity.model.js';
import { fetchJobsFromFindWork } from '../fetchOpportunity/findWork.service.js';
import { normalizeFindWorkJob } from '../../utils/findWorkNormalizer.js';

const BATCH_SIZE = 5;

export const ingestFindWorkJobs = async (keyword) => {
    const jobs = await fetchJobsFromFindWork(keyword);
    if (!jobs.length) return 0;

    let upserted = 0;

    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);

        const normalised = await Promise.all(
            batch.map((job) =>
                normalizeFindWorkJob(job).catch((err) => {
                    console.error(
                        `[Ingest] Normalisation failed for job id=${job.id}:`,
                        err.message
                    );
                    return null;
                })
            )
        );

        const validJobs = normalised.filter(Boolean);
        if (!validJobs.length) continue;

        const bulkOps = validJobs.map((job) => ({
            updateOne: {
                filter: { externalId: job.externalId, externalSource: 'findwork' },
                update: {
                    $setOnInsert: {
                        title: job.title,
                        company: job.company,
                        description: job.description,
                        applicationLink: job.applicationLink,
                        source: job.source,
                        externalSource: job.externalSource,
                        externalId: job.externalId,
                        opportunityType: job.opportunityType,
                    },
                    $set: {
                        requiredSkills: job.requiredSkills,
                        category: job.category,
                        experienceLevel: job.experienceLevel,
                        location: job.location,
                        stipendOrSalary: job.stipendOrSalary,
                        isActive: job.isActive,
                        lastSeenAt: job.lastSeenAt,
                    },
                },
                upsert: true,
            },
        }));

        try {
            const result = await Opportunity.bulkWrite(bulkOps, { ordered: false });
            upserted += (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
        } catch (err) {
            console.error(
                `[Ingest] bulkWrite failed for keyword "${keyword}" batch ${i}:`,
                err.message
            );
        }
    }

    return upserted;
};
