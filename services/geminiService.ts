
import { GoogleGenAI, Type } from "@google/genai";
import { ProducerTask } from "../types";

export class GeminiService {
  // Fixed: Helper method for system instructions to reduce redundancy
  private getSystemInstruction(task: ProducerTask): string {
    const instructions = {
      [ProducerTask.LYRICS]: "You are a multi-platinum songwriter. Generate creative, metaphorical lyrics based on the user's theme. Focus on flow and emotional resonance.",
      [ProducerTask.BEAT_IDEAS]: "You are a world-class music producer like Max Martin or Rick Rubin. Suggest instrumentation, tempo ranges, and rhythmic structures for a track.",
      [ProducerTask.MIXING_ADVICE]: "You are a professional mixing engineer. Provide technical advice on EQ, compression, and spatial effects based on the user's audio description.",
      [ProducerTask.VIBE_CHECK]: "You are a music critic and trend analyst. Analyze a track's description and suggest its target audience and marketing vibe."
    };
    return instructions[task];
  }

  async generateProducerInsight(task: ProducerTask, prompt: string) {
    // Fixed: Initializing GoogleGenAI directly with process.env.API_KEY before use
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: this.getSystemInstruction(task),
          temperature: 0.8,
          topP: 0.9,
        },
      });

      // Fixed: Accessing text as a property, not a method
      return response.text || "I couldn't generate an insight at this moment.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "An error occurred while connecting to my creative circuits.";
    }
  }

  async streamProducerInsight(task: ProducerTask, prompt: string, onChunk: (text: string) => void) {
    // Fixed: Initializing GoogleGenAI directly with process.env.API_KEY before use
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: this.getSystemInstruction(task),
        },
      });

      // Fixed: Correctly iterating through stream chunks and accessing text property
      for await (const chunk of responseStream) {
        onChunk(chunk.text || "");
      }
    } catch (error) {
      console.error("Streaming error:", error);
    }
  }
}

export const geminiService = new GeminiService();
