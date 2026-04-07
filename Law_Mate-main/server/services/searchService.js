import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import EmbeddingService from './embeddingService.js';
import similarity from 'compute-cosine-similarity';
import Section from '../models/Section.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

class SearchService {
    constructor() {
        this.cache = {};
    }

    async loadLaw(lawName) {
        if (this.cache[lawName]) return this.cache[lawName];

        const embPath = path.join(DATA_DIR, lawName, 'embeddings.json');
        if (!fs.existsSync(embPath)) {
            console.warn(`⚠️  No embeddings for ${lawName} — will use keyword search`);
            return null;
        }

        const embeddings = JSON.parse(fs.readFileSync(embPath, 'utf-8'));

        // Fetch ALL fields including description from MongoDB
        const sections = await Section.find({ law: lawName })
            .sort({ order: 1 })
            .select('section title description law order')
            .lean();

        if (sections.length === 0) {
            console.warn(`⚠️  No sections in MongoDB for ${lawName}`);
            return null;
        }

        this.cache[lawName] = { sections, embeddings };
        console.log(`📖 Loaded ${lawName}: ${sections.length} sections`);
        return this.cache[lawName];
    }

    // Clear cache so fresh DB data is used after re-seed
    clearCache() {
        this.cache = {};
        console.log('🗑️  Search cache cleared');
    }

    async search(lawName, query, topK = 5) {
        if (lawName === 'all') {
            const allLaws = ['ipc', 'crpc', 'mv_act', 'iea', 'cpc', 'hma', 'ida', 'nia'];
            let allResults = [];
            for (const law of allLaws) {
                try {
                    const results = await this.searchSingleLaw(law, query, topK);
                    if (results?.length) {
                        allResults = [...allResults, ...results];
                    }
                } catch (e) {
                    console.warn(`Skipping ${law}: ${e.message}`);
                }
            }
            return allResults.sort((a, b) => b.score - a.score).slice(0, topK);
        }
        return this.searchSingleLaw(lawName, query, topK);
    }

    async searchSingleLaw(lawName, query, topK = 5) {
        const lawData = await this.loadLaw(lawName);

        // Fallback: MongoDB keyword search if no embeddings
        if (!lawData) {
            const keywords = query.split(' ').filter(w => w.length > 3).slice(0, 6);
            if (keywords.length === 0) return [];

            const regexes = keywords.map(k => new RegExp(k, 'i'));
            const sections = await Section.find({
                law: lawName,
                $or: [
                    { title: { $in: regexes } },
                    { description: { $in: regexes } }
                ]
            })
            .select('section title description law')
            .limit(topK)
            .lean();

            return sections.map(s => ({
                law: s.law,
                section: s.section,
                title: s.title,
                description: s.description || 'No description available',
                score: 0.4
            }));
        }

        // Semantic search using embeddings
        const { sections, embeddings } = lawData;
        const len = Math.min(sections.length, embeddings.length);
        if (len === 0) return [];

        const queryEmbedding = await EmbeddingService.getEmbedding(query);

        const scores = embeddings.slice(0, len).map((emb, idx) => ({
            index: idx,
            score: similarity(queryEmbedding, emb) ?? 0
        }));

        scores.sort((a, b) => b.score - a.score);

        return scores.slice(0, topK).map(item => {
            const sec = sections[item.index];
            if (!sec) return null;
            return {
                law: sec.law || lawName,
                section: sec.section,
                title: sec.title,
                description: sec.description || 'No description available',
                score: item.score
            };
        }).filter(Boolean);
    }
}

export default new SearchService();
