import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

export const queryGroq = async (prompt) => {
    const response = await client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
    });

    return response.choices[0].message.content;
};
