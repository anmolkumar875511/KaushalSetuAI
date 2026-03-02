import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function queryGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  console.log('Result: ', result)
  const response = await result.response;
  console.log('Response: ', response)
  console.log('Response text: ', response.text())
  return response.text();
}