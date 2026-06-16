import { pipeline, env } from "@xenova/transformers";

// Optional optimization for running in Node.js
env.allowLocalModels = false;

class MLPipeline {
  static task = "feature-extraction" as const;
  static textModel = "Xenova/all-MiniLM-L6-v2";
  static textInstance: any = null;
  // NOTE: For image embeddings, we'd use a clip model, but to keep memory low locally in Node:
  // We'll primarily rely on text and location initially, but we can set up the image singleton if needed.

  static async getTextPipeline() {
    if (!this.textInstance) {
      this.textInstance = await pipeline(this.task, this.textModel);
    }
    return this.textInstance;
  }

  // Calculate cosine similarity between two 1D arrays
  static cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export default MLPipeline;
