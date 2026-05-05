import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: `Lo-fi aesthetic diary illustration, soft warm tones, cozy atmosphere: ${prompt}`,
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    console.error("Image generation failed:", e);
    return null;
  }
}

export async function generateVideo(prompt: string): Promise<string | null> {
  try {
    let op = await ai.models.generateVideos({
      model: "veo-2.0-generate-001",
      source: { prompt: `Lo-fi cozy vibe, soft colors, gentle motion: ${prompt}` },
      config: { numberOfVideos: 1 },
    });

    while (!op.done) {
      await new Promise((r) => setTimeout(r, 10000));
      op = await ai.operations.getVideosOperation({ operation: op });
    }

    const video = op.response?.generatedVideos?.[0]?.video;
    if (video?.uri) return video.uri;
    return null;
  } catch (e) {
    console.error("Video generation failed:", e);
    return null;
  }
}
