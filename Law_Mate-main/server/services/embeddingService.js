import { pipeline } from '@xenova/transformers';

class EmbeddingService {
    static instance = null;

    static async getInstance() {
        if (!EmbeddingService.instance) {
            console.log("Loading model...");
            EmbeddingService.instance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            console.log("Model loaded.");
        }
        return EmbeddingService.instance;
    }

    static async getEmbedding(text) {
        const extractor = await EmbeddingService.getInstance();
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}

export default EmbeddingService;
