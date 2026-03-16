const mergeByKey = (base = [], incoming = [], key = 'name') => {
    const map = new Map();

    for (const item of base) {
        if (item?.[key]) map.set(item[key], { ...item });
    }

    for (const item of incoming) {
        if (!item?.[key]) continue;

        const k = item[key];

        if (!map.has(k)) {
            map.set(k, item);
        } else {
            const existing = map.get(k);
            const aiConf = item.confidence ?? 0;
            const baseConf = existing.confidence ?? 0;

            map.set(k, {
                ...(aiConf >= baseConf ? { ...existing, ...item } : existing),
                [key]: k,
                confidence: Math.max(baseConf, aiConf),
                source:
                    existing.source === 'resume' || item.source === 'resume'
                        ? 'resume'
                        : (item.source ?? existing.source),
            });
        }
    }

    return Array.from(map.values());
};

const pickBetter = (ruleArr = [], aiArr = []) => {
    const hasRule = Array.isArray(ruleArr) && ruleArr.length > 0;
    const hasAI = Array.isArray(aiArr) && aiArr.length > 0;

    if (hasAI && hasRule) return aiArr.length >= ruleArr.length ? aiArr : ruleArr;
    if (hasAI) return aiArr;
    if (hasRule) return ruleArr;
    return [];
};

export const mergeParsedData = (ruleData, aiData) => {
    if (!aiData) {
        console.log('[ResumeParser] LLM failed — using rule-based data only');
        return ruleData;
    }

    if (!ruleData) {
        console.log('[ResumeParser] Rule-based failed — using AI data only');
        return aiData;
    }

    return {
        categories: mergeByKey(ruleData.categories ?? [], aiData.categories ?? [], 'name'),
        skills: mergeByKey(ruleData.skills ?? [], aiData.skills ?? [], 'name'),
        experience: pickBetter(ruleData.experience, aiData.experience),
        education: pickBetter(ruleData.education, aiData.education),
        projects: pickBetter(ruleData.projects, aiData.projects),
    };
};
