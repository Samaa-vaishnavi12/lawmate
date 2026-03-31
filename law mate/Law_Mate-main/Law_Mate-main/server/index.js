import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import searchRouter   from './routes/search.js';
import authRouter     from './routes/authRoutes.js';
import userRouter     from './routes/userRoutes.js';
import firRouter      from './routes/firRoutes.js';
import statsRouter    from './routes/statsRoutes.js';
import analysisRouter from './routes/analysisRoutes.js';
import queryRouter    from './routes/queryRoutes.js';
import adminRouter    from './routes/adminRoutes.js';
import chatRouter     from './routes/chatRoutes.js';
import scenarioRouter from './routes/scenarioRoutes.js';
import EmbeddingService from './services/embeddingService.js';
import SearchService    from './services/searchService.js';
import connectDB        from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { protect }      from './middleware/authMiddleware.js';
import Section  from './models/Section.js';
import Scenario from './models/Scenario.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Map JSON fields → Section schema ─────────────────────────────────────────
function mapSection(item, index, law) {
    return {
        law,
        section: String(item.section || item.Section || index + 1),
        title: item.title || item.section_title || item.chapter_title || 'Untitled',
        description: (
            item.description || item.section_desc || item.section_description ||
            item.desc || item.content || item.text || 'No description available'
        ).trim(),
        order: index
    };
}

// ── Seed all data ─────────────────────────────────────────────────────────────
async function seedAll() {
    const DATA_DIR = path.join(__dirname, 'data');
    if (!fs.existsSync(DATA_DIR)) { console.warn('⚠️  Data directory not found'); return; }

    const dirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name !== 'scenarios')
        .map(d => d.name);

    // Seed law sections
    for (const law of dirs) {
        const dataPath = path.join(DATA_DIR, law, 'data.json');
        if (!fs.existsSync(dataPath)) continue;

        const rawData  = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const sections = rawData.map((item, i) => mapSection(item, i, law));

        const totalInDB = await Section.countDocuments({ law });
        const goodInDB  = await Section.countDocuments({ law, description: { $exists: true, $nin: ['No description available', '', null] } });
        const needsReseed = totalInDB === 0 || goodInDB < Math.floor(sections.length * 0.5);

        if (!needsReseed) { console.log(`✅ ${law.toUpperCase()}: ${goodInDB}/${totalInDB} OK`); continue; }

        await Section.deleteMany({ law });
        await Section.insertMany(sections, { ordered: false }).catch(e => console.error(`❌ ${law}:`, e.message));
        const sample = await Section.findOne({ law, description: { $nin: ['No description available', ''] } });
        console.log(`🔄 ${law.toUpperCase()} seeded ${sections.length} — e.g. §${sample?.section}: "${sample?.description?.substring(0,60)}..."`);
    }

    SearchService.clearCache();

    // Seed scenarios
    const scenarioCount = await Scenario.countDocuments();
    if (scenarioCount === 0) {
        const scenPath = path.join(DATA_DIR, 'scenarios/data.json');
        if (fs.existsSync(scenPath)) {
            const items = JSON.parse(fs.readFileSync(scenPath, 'utf-8'));
            await Scenario.insertMany(items.map((s, i) => ({ ...s, order: i })), { ordered: false });
            console.log(`✅ Seeded ${items.length} legal scenarios`);
        }
    } else {
        console.log(`✅ ${scenarioCount} scenarios in DB`);
    }

    console.log('🎉 All data seeded!');
}

// ── Boot ──────────────────────────────────────────────────────────────────────
async function startServer() {
    await connectDB();
    try { await seedAll(); } catch (e) { console.error('❌ Seed error:', e.message); }
    EmbeddingService.getInstance().catch(e => console.error('⚠️  Embedding failed:', e.message));
    app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/search',        protect, (req,_,next)=>{console.log('/search'); next();}, searchRouter);
app.use('/api/search',    protect, (req,_,next)=>{console.log('/api/search'); next();}, searchRouter);
app.use('/api/auth',      authRouter);
app.use('/api/users',     userRouter);
app.use('/api/fir',       firRouter);
app.use('/api/stats',     statsRouter);
app.use('/api/analysis',  analysisRouter);
app.use('/api/queries',   queryRouter);
app.use('/api/admin',     adminRouter);
app.use('/api/chat',      chatRouter);
app.use('/api/scenarios', scenarioRouter);

app.get('/', (_, res) => res.send('✅ Law Mate API running.'));
app.use(errorHandler);

startServer();
