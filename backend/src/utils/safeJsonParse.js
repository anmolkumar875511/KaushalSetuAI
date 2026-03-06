export const safeJsonParse = (text) => {
    try {
        if (!text) return null;

        if (typeof text === 'object') {
            text = JSON.stringify(text);
        }

        const cleaned = text
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        try {
            return JSON.parse(cleaned);
        } catch (_) {
            const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

            if (!jsonMatch) {
                console.error('No JSON found in LLM response:', text);
                return null;
            }

            return JSON.parse(jsonMatch[0]);
        }
    } catch (err) {
        console.error('Invalid JSON from LLM:', text);
        return null;
    }
};
