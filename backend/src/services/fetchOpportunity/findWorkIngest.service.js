import Opportunity from '../../models/opportunity.model.js';
import { fetchJobsFromFindWork } from '../fetchOpportunity/findWork.service.js';
import { normalizeFindWorkJob } from '../../utils/findWorkNormalizer.js';

export const ingestFindWorkJobs = async (keyword) => {
    const jobs = await fetchJobsFromFindWork(keyword);

    let saved = 0;

    for (const job of jobs) {
        const normalized = normalizeFindWorkJob(job);

        await Opportunity.updateOne(
            {
                externalId: normalized.externalId,
                externalSource: 'findwork',
            },
            { $setOnInsert: normalized },
            { upsert: true }
        );

        saved++;
    }

    return saved;
};
