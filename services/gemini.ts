
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

export class BrandSentinelService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeImage(base64Image: string, mimeType: string): Promise<AnalysisResult> {
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      Act as an elite brand protection and digital forensics specialist. 
      Analyze this ${mimeType.startsWith('video/') ? 'video' : 'image'} for:
      
      1. AI Generation/Manipulation: Check for synthetic markers (GAN/Diffusion artifacts, lighting inconsistencies, unnatural textures).
      2. Brand Integrity: Identify logos/assets and determine if they are genuine, modified, or misused in an impersonation context.
      3. Fraud/Impersonation: Evaluate if this context looks like a phishing attempt, fake profile, or bot-generated identity.
      4. Web Presence: Find visually similar images across the web.

      Focus specifically on highlighting potential AI-created visuals so the user can understand if a profile uses genuine or synthetic visuals.
      
      Respond ONLY in JSON format following this schema:
      {
        "isAiGenerated": boolean,
        "aiConfidence": number (0-1),
        "manipulationNotes": string[],
        "fraudRisk": "Low" | "Medium" | "High",
        "brandAuthenticityScore": number (0-100),
        "detectedContext": string,
        "moderationFlags": string[]
      }
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType } },
            { text: prompt }
          ]
        },
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const rawResult = JSON.parse(response.text || '{}');
      
      // Extract grounding info
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const foundSources = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title || 'Web Match',
          uri: chunk.web.uri
        }));

      return {
        ...rawResult,
        foundSources: foundSources.slice(0, 6)
      };
    } catch (error) {
      console.error("Analysis failed:", error);
      throw error;
    }
  }
}

export const sentinelService = new BrandSentinelService();
