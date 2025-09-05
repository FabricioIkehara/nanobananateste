
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. The application may not function correctly.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const withRetry = async <T,>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    let lastError: Error | unknown;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${i + 1} failed:`, error);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
};

export const generateImage = async (base64Image: string, instruction: string): Promise<string> => {
    return withRetry(async () => {
        const imageWithoutPrefix = base64Image.split(',')[1];
        if (!imageWithoutPrefix) {
            throw new Error("Invalid base64 image format.");
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageWithoutPrefix,
                            mimeType: 'image/png',
                        },
                    },
                    {
                        text: instruction,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        let base64ImageData: string | undefined;
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                base64ImageData = part.inlineData.data;
                break;
            }
        }

        if (base64ImageData) {
            return `data:image/png;base64,${base64ImageData}`;
        }
        
        throw new Error("API returned no image data.");
    });
};

export const generateDynamicPrompt = async (themeDescription: string): Promise<string> => {
     return withRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: themeDescription,
        });
        
        const text = response.text;
        if (text) {
            return text;
        }

        throw new Error("API returned no text data for dynamic prompt.");
    });
};
