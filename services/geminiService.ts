
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchBookDetailsByISBN = async (isbn: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Proporciona los detalles del libro con ISBN: ${isbn}. Si no lo encuentras, inventa campos coherentes basados en el ISBN si parece válido o devuelve campos vacíos.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            publisher: { type: Type.STRING },
            suggestedPrice: { type: Type.NUMBER },
          },
          required: ["title", "author", "publisher"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error("Error fetching book details:", error);
    return null;
  }
};
