import { GoogleGenAI } from "@google/genai";

export interface ExternalSearchResult {
  title: string;
  description: string;
  url: string;
  source: string;
}

export async function searchExternalBotswanaTravel(query: string): Promise<ExternalSearchResult[]> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Skipping external search.");
      return [];
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find businesses, lodges, safari camps, and points of interest in Botswana related to: "${query}". 
      
      CRITICAL INSTRUCTIONS:
      1. Specifically find reputable businesses and locations that might not be registered on our platform yet.
      2. For each discovery, provide an official website URL or a major travel platform link (TripAdvisor, Booking.com, etc.).
      3. Return a JSON array of objects with 'title', 'description', 'url', and 'source'.
      4. The description should be professional and highlight what makes them unique.
      5. The source should be the name of the website or platform found (e.g., 'Official Website', 'TripAdvisor', 'Botswana Tourism').`,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    const results = JSON.parse(response.text || "[]");
    return Array.isArray(results) ? results : [];
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return [];
  }
}
