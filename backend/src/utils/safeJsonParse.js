export const safeJsonParse = (text) => {
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error('Invalid JSON from LLM:', text);
        return null;
    }
};
