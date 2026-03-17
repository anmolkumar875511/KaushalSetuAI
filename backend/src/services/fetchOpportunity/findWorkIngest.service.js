import Opportunity from '../../models/opportunity.model.js';
import { fetchJobsFromFindWork } from '../fetchOpportunity/findWork.service.js';
import { normalizeFindWorkJob }  from '../../utils/findWorkNormalizer.js';

/* ─────────────────────────────────────────────
   ingestFindWorkJobs

   Fetches jobs for a keyword, normalises each one (with AI enrichment
   only for NEW jobs), then bulk-upserts into Opportunity collection.

   Why serial AI calls:
     Gemini free tier = 10 RPM. enrichJobWithAI already throttles to
     1 call per 6s minimum. Running concurrently would still burst the
     quota when multiple keywords run back-to-back. Serial is safer.

   Why skip AI for known jobs:
     If externalId already exists, the job was already AI-enriched on
     first ingest. We still update mutable fields (lastSeenAt, isActive)
     but skip the Gemini call entirely — saves quota for genuinely new jobs.
───────────────────────────────────────────── */
export const ingestFindWorkJobs = async (keyword) => {
    const jobs = await fetchJobsFromFindWork(keyword);
    if (!jobs.length) return 0;

    /* ── Identify which externalIds already exist in the DB ── */
    const incomingIds = jobs.map((j) => String(j.id)).filter(Boolean);

    const existingDocs = await Opportunity.find(
        { externalId: { $in: incomingIds }, externalSource: 'findwork' },
        { externalId: 1, _id: 0 }
    ).lean();

    const knownIds = new Set(existingDocs.map((d) => d.externalId));

    const newJobs   = jobs.filter((j) => !knownIds.has(String(j.id)));
    const staleJobs = jobs.filter((j) =>  knownIds.has(String(j.id)));

    console.log(`[Ingest:"${keyword}"] ${jobs.length} total — ${newJobs.length} new, ${staleJobs.length} existing`);

    const bulkOps = [];

    /* ── Process NEW jobs (with AI enrichment, serial) ── */
    for (const job of newJobs) {
        const normalized = await normalizeFindWorkJob(job, /* useAI */ true).catch((err) => {
            console.error(`[Ingest] Normalisation failed for job id=${job.id}:`, err.message);
            return null;
        });

        if (!normalized) continue;

        bulkOps.push({
            updateOne: {
                filter: { externalId: normalized.externalId, externalSource: 'findwork' },
                update: {
                    $setOnInsert: {
                        title:           normalized.title,
                        company:         normalized.company,
                        description:     normalized.description,
                        applicationLink: normalized.applicationLink,
                        source:          normalized.source,
                        externalSource:  normalized.externalSource,
                        externalId:      normalized.externalId,
                        opportunityType: normalized.opportunityType,
                    },
                    $set: {
                        requiredSkills:  normalized.requiredSkills,
                        category:        normalized.category,
                        experienceLevel: normalized.experienceLevel,
                        location:        normalized.location,
                        stipendOrSalary: normalized.stipendOrSalary,
                        isActive:        normalized.isActive,
                        lastSeenAt:      normalized.lastSeenAt,
                    },
                },
                upsert: true,
            },
        });
    }

    /* ── Process EXISTING jobs (no AI — just refresh lastSeenAt + isActive) ── */
    for (const job of staleJobs) {
        bulkOps.push({
            updateOne: {
                filter: { externalId: String(job.id), externalSource: 'findwork' },
                update: {
                    $set: {
                        isActive:   true,
                        lastSeenAt: new Date(),
                    },
                },
            },
        });
    }

    if (!bulkOps.length) return 0;

    try {
        const result = await Opportunity.bulkWrite(bulkOps, { ordered: false });
        const count  = (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
        console.log(`[Ingest:"${keyword}"] ✓ ${count} documents written`);
        return count;
    } catch (err) {
        console.error(`[Ingest] bulkWrite failed for keyword "${keyword}":`, err.message);
        return 0;
    }
};