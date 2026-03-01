import { normalizeText } from '../../utils/normalizeText.js';
import { splitSections } from '../../utils/splitSections.js';

import { extractSkills } from './extractSkills.service.js';
import { extractEducation } from './extractEducation.service.js';
import { extractProjects } from './extractProject.service.js';
import { extractExperience } from './extractExperience.service.js';

export const ruleBasedParse = (rawText = '') => {
    const normalizedText = normalizeText(rawText);
    const sections = splitSections(normalizedText);

    return {
        skills: extractSkills(sections.skills),
        education: extractEducation(sections.education),
        projects: extractProjects(sections.projects),
        experience: extractExperience(sections.experience, sections.positions),
    };
};
