
import { GoogleGenAI } from "@google/genai";
import { Genre } from '../types';

// IMPORTANT: This check is a placeholder. In a real environment,
// the API key would be securely managed.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn("API_KEY environment variable not set. Gemini API calls will be mocked.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMovieSynopsis = async (title: string, genre: Genre): Promise<string> => {
  if (!apiKey) {
    return `This is a placeholder synopsis for '${title}', a gripping ${genre} film. It's a tale of adventure, love, and betrayal that will keep you on the edge of your seat.`;
  }

  try {
    const prompt = `Generate a short, exciting, one-paragraph movie synopsis for a ${genre} film titled "${title}". Make it sound like a blockbuster hit.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating synopsis:", error);
    return `Failed to generate synopsis for '${title}'. Please try again.`;
  }
};
