import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

import searchRouter   from '../server/routes/search.js';
import authRouter     from '../server/routes/authRoutes.js';
import userRouter     from '../server/routes/userRoutes.js';
import firRouter      from '../server/routes/firRoutes.js';
import statsRouter    from '../server/routes/statsRoutes.js';
import analysisRouter from '../server/routes/analysisRoutes.js';
import queryRouter    from '../server/routes/queryRoutes.js';
import adminRouter    from '../server/routes/adminRoutes.js';
import chatRouter     from '../server/routes/chatRoutes.js';
import scenarioRouter from '../server/routes/scenarioRoutes.js';
import { errorHandler } from '../server/middleware/errorMiddleware.js';
import { protect }      from '../server/middleware/authMiddleware.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── MongoDB (cached connection for serverless) ────────────────────────────────
let isConnected = false;
async function connectDB() {
    if (isConnected && mongoose.connection.readyState === 1) return;
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI environment variable is not set');
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false,
    });
    isConnected = true;
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRouter);
app.use('/api/users',     userRouter);
app.use('/api/fir',       firRouter);
app.use('/api/stats',     statsRouter);
app.use('/api/analysis',  analysisRouter);
app.use('/api/queries',   queryRouter);
app.use('/api/admin',     adminRouter);
app.use('/api/chat',      chatRouter);
app.use('/api/scenarios', scenarioRouter);
app.use('/api/search',    protect, searchRouter);
app.use('/search',        protect, searchRouter);

app.get('/api',  (_, res) => res.json({ status: 'ok', message: '✅ Law Mate API is running' }));
app.get('/',     (_, res) => res.json({ status: 'ok', message: '✅ Law Mate API is running' }));

app.use(errorHandler);

// ── Vercel serverless handler ─────────────────────────────────────────────────
export default async function handler(req, res) {
    try {
        await connectDB();
    } catch (err) {
        return res.status(500).json({ error: 'Database connection failed', detail: err.message });
    }
    return app(req, res);
}
