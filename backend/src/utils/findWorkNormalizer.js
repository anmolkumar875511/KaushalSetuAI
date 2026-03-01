import { mapDomain } from './domainMapper.js';

export function normalizeFindWorkJob(job) {
    return {
        title: job.role,
        company: { name: job.company_name },
        description: job.text,
        requiredSkills: job.keywords || [],
        category: mapDomain(job.role, job.text),
        opportunityType: 'job',
        experienceLevel: 'beginner',
        location: job.location || 'Remote',
        stipendOrSalary: { min: 0, max: 0, currency: 'INR' },
        applicationLink: job.url,
        source: 'external',
        externalSource: 'findwork',
        externalId: job.id,
        isActive: true,
    };
}
