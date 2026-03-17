import Opportunity from '../../models/opportunity.model.js';
import { fetchJobsFromFindWork } from '../fetchOpportunity/findWork.service.js';
import { normalizeFindWorkJob } from '../../utils/findWorkNormalizer.js';

export const ingestFindWorkJobs = async (keyword) => {
    const { results: jobs, pagesFetched } = await fetchJobsFromFindWork(keyword);
    if (!jobs.length) return { count: 0, pagesFetched };

    const incomingIds = jobs.map((j) => String(j.id)).filter(Boolean);

    const existingDocs = await Opportunity.find(
        { externalId: { $in: incomingIds }, externalSource: 'findwork' },
        { externalId: 1, _id: 0 }
    ).lean();

    const knownIds = new Set(existingDocs.map((d) => d.externalId));

    const newJobs = jobs.filter((j) => !knownIds.has(String(j.id)));
    const staleJobs = jobs.filter((j) => knownIds.has(String(j.id)));

    console.log(
        `[Ingest:"${keyword}"] ${jobs.length} total — ${newJobs.length} new, ${staleJobs.length} existing`
    );

    const bulkOps = [];

    for (const job of newJobs) {
        const normalized = await normalizeFindWorkJob(job, false).catch((err) => {
            console.error(`[Ingest] Normalisation failed for job id=${job.id}:`, err.message);
            return null;
        });

        if (!normalized) continue;

        bulkOps.push({
            updateOne: {
                filter: { externalId: normalized.externalId, externalSource: 'findwork' },
                update: {
                    $setOnInsert: {
                        title: normalized.title,
                        company: normalized.company,
                        description: normalized.description,
                        applicationLink: normalized.applicationLink,
                        source: normalized.source,
                        externalSource: normalized.externalSource,
                        externalId: normalized.externalId,
                        opportunityType: normalized.opportunityType,
                        aiEnriched: false,
                    },
                    $set: {
                        requiredSkills: normalized.requiredSkills,
                        category: normalized.category,
                        experienceLevel: normalized.experienceLevel,
                        location: normalized.location,
                        stipendOrSalary: normalized.stipendOrSalary,
                        isActive: normalized.isActive,
                        lastSeenAt: normalized.lastSeenAt,
                    },
                },
                upsert: true,
            },
        });
    }

    for (const job of staleJobs) {
        bulkOps.push({
            updateOne: {
                filter: { externalId: String(job.id), externalSource: 'findwork' },
                update: { $set: { isActive: true, lastSeenAt: new Date() } },
            },
        });
    }

    if (!bulkOps.length) return { count: 0, pagesFetched };

    try {
        const result = await Opportunity.bulkWrite(bulkOps, { ordered: false });
        const count = (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
        console.log(
            `[Ingest:"${keyword}"] ✓ ${count} documents written (rule-based, pending AI enrichment)`
        );
        return { count, pagesFetched };
    } catch (err) {
        console.error(`[Ingest] bulkWrite failed for keyword "${keyword}":`, err.message);
        return { count: 0, pagesFetched };
    }
};
