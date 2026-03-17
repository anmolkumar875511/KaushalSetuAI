import Opportunity from '../../models/opportunity.model.js';
import { enrichJobWithAI } from './jobEnricher.service.js';
import {
    extractSkillsRuleBased,
    inferExperienceLevel,
    extractSalaryFromText,
    benchmarkSalary,
} from './jobEnricher.service.js';
import { mapDomain } from '../../utils/domainMapper.js';

const DAILY_ENRICHMENT_BUDGET = 50;

export const runAIEnrichmentBatch = async (budget = DAILY_ENRICHMENT_BUDGET) => {
    const jobs = await Opportunity.find({ aiEnriched: false, isActive: true })
        .sort({ createdAt: 1 }) // oldest-first — enrich in arrival order
        .limit(budget)
        .select('_id title description location category experienceLevel')
        .lean();

    if (!jobs.length) {
        console.log('[Enrichment] No un-enriched jobs found — nothing to do.');
        return { processed: 0, enriched: 0, failed: 0 };
    }

    console.log(
        `[Enrichment] Starting AI enrichment batch — ${jobs.length} jobs (budget: ${budget})`
    );

    let enriched = 0;
    let failed = 0;

    for (const job of jobs) {
        try {
            const ai = await enrichJobWithAI(job.title, job.description ?? '');

            let skills = null;
            let experienceLevel = null;
            let salaryMin = null;
            let salaryMax = null;

            if (ai) {
                skills = ai.skills?.length ? ai.skills : null;
                experienceLevel = ai.experienceLevel ?? null;
                salaryMin = ai.salaryMin != null ? ai.salaryMin : null;
                salaryMax = ai.salaryMax != null ? ai.salaryMax : null;
            }

            if (!skills?.length) {
                skills = extractSkillsRuleBased(job.description ?? '');
            }
            if (!experienceLevel) {
                experienceLevel = inferExperienceLevel(job.title, job.description ?? '');
            }
            if (salaryMin == null || salaryMax == null) {
                const textSalary = extractSalaryFromText(`${job.title} ${job.description ?? ''}`);
                if (textSalary) {
                    salaryMin = textSalary.min;
                    salaryMax = textSalary.max;
                } else {
                    const bench = benchmarkSalary(job.category, experienceLevel);
                    salaryMin = bench.min;
                    salaryMax = bench.max;
                }
            }

            await Opportunity.updateOne(
                { _id: job._id },
                {
                    $set: {
                        requiredSkills: skills,
                        experienceLevel,
                        'stipendOrSalary.min': salaryMin,
                        'stipendOrSalary.max': salaryMax,
                        aiEnriched: true,
                        aiEnrichedAt: new Date(),
                    },
                }
            );

            enriched++;
            console.log(`[Enrichment] ✓ ${job.title} (${ai ? 'AI' : 'rule-based fallback'})`);
        } catch (err) {
            failed++;
            console.error(`[Enrichment] ✗ Failed for job ${job._id} "${job.title}":`, err.message);

            await Opportunity.updateOne(
                { _id: job._id },
                { $set: { aiEnriched: true, aiEnrichedAt: new Date() } }
            );
        }
    }

    console.log(
        `[Enrichment] Complete — ${enriched} enriched, ${failed} failed out of ${jobs.length} processed`
    );
    return { processed: jobs.length, enriched, failed };
};
