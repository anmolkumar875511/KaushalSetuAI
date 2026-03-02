export const safeJsonParse = (text) => {
    try {
        if (!text) return null;

        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error('No JSON found in LLM response:', text);
            return null;
        }

        return JSON.parse(jsonMatch[0]);
    } catch (err) {
        console.error('Invalid JSON from LLM:', text);
        return null;
    }
};
