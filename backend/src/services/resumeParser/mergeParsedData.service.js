const mergeByKey = (base = [], incoming = [], key = 'name') => {
    const map = new Map();

    base.forEach((item) => {
        if (item?.[key]) map.set(item[key], { ...item });
    });

    incoming.forEach((item) => {
        if (!item?.[key]) return;

        if (!map.has(item[key])) {
            map.set(item[key], item);
        } else {
            const existing = map.get(item[key]);
            map.set(item[key], {
                ...existing,
                ...item,
                confidence: Math.max(existing.confidence ?? 0, item.confidence ?? 0),
                source: existing.source === 'resume' ? 'resume' : item.source,
            });
        }
    });

    return Array.from(map.values());
};

export const mergeParsedData = (ruleData, aiData) => {
    if (!aiData) {
        console.log('LLM failed → using rule-based data only');
        return ruleData;
    }

    return {
        categories: mergeByKey(ruleData.categories, aiData.categories, 'name'),

        skills: mergeByKey(ruleData.skills, aiData.skills, 'name'),

        experience: aiData.experience?.length ? aiData.experience : ruleData.experience,

        education: aiData.education?.length ? aiData.education : ruleData.education,

        projects: aiData.projects?.length ? aiData.projects : ruleData.projects,
    };
};
