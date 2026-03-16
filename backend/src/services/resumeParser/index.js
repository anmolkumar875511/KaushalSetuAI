import { parseResumeWithLLM } from '../parserLLM/parseResumeWithLLM.js';
import { ruleBasedParse } from '../parserRule/ruleBasedParse.service.js';
import { mergeParsedData } from './mergeParsedData.service.js';

export const parseResumeText = async (rawText) => {
    if (!rawText?.trim()) {
        throw new Error('Resume text is empty — cannot parse.');
    }

    const [ruleData, aiData] = await Promise.all([
        Promise.resolve(ruleBasedParse(rawText)),
        parseResumeWithLLM(rawText),
    ]);

    return mergeParsedData(ruleData, aiData);
};
