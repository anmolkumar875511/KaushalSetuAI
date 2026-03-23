import { generateResumeImprovementPrompt } from './resumeImprovementPrompt.js';
import { queryGemini } from '../../utils/geminiClient.js';
import { safeJsonParse } from '../../utils/safeJsonParse.js';

export const analyseResume = async (resume) => {
    const prompt = generateResumeImprovementPrompt(resume);
    const response = await queryGemini(prompt);
    const parsed = safeJsonParse(response);

    if (!parsed || typeof parsed.overallScore !== 'number') {
        throw new Error('Failed to generate resume improvement report');
    }

    parsed.overallScore = Math.min(100, Math.max(0, parsed.overallScore));

    const dims = ['summary', 'skills', 'experience', 'projects', 'overall'];
    for (const dim of dims) {
        if (!parsed.dimensions?.[dim]) {
            parsed.dimensions = parsed.dimensions || {};
            parsed.dimensions[dim] = { score: 5, severity: 'warning', tips: [] };
        }
    }

    return parsed;
};
