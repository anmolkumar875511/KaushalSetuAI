import { parseResumeWithLLM } from '../parserLLM/parseResumeWithLLM.js';
import { ruleBasedParse } from '../parserRule/ruleBasedParse.service.js';
import { mergeParsedData } from './mergeParsedData.service.js';

export const parseResumeText = async (rawText) => {
    const ruleData = ruleBasedParse(rawText);
    const aiData = await parseResumeWithLLM(rawText);
    return mergeParsedData(ruleData, aiData);
};
