import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';
import { jobReadinessPrompt } from './jobReadinessPrompt.js';
import JobReadinessReport from '../../models/jobReadinessReport.model.js';

export const generateJobReadiness = async (userId, resumeId, resumeData, interest) => {
    try {
        console.log('Generating job readiness report');

        const prompt = jobReadinessPrompt(resumeData, interest);
        const raw = await queryGemini(prompt);

        const parsed = safeJsonParse(raw);
        if (!parsed) throw new Error('Invalid JSON from AI');

        const report = await JobReadinessReport.create({
            user: userId,
            resume: resumeId,
            interest,
            ...parsed
        });

        console.log('Job readiness report created');
        return report;

    } catch (err) {
        console.error('Job readiness generation failed:', err.message);
        return null;
    }
};