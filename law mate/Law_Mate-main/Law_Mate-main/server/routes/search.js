import express from 'express';
import searchService from '../services/searchService.js';
import SearchLog from '../models/SearchLog.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { law, q, top_k } = req.query;
        console.log(`Received search query: law=${law}, q=${q}, top_k=${top_k}`);

        if (!law || !q) {
            return res.status(400).json({ error: "Missing 'law' or 'q' parameter" });
        }

        const results = await searchService.search(law, q, parseInt(top_k) || 5);

        if (!results) {
            return res.status(404).json({ error: "Law not found or data missing" });
        }

        // Log the search asynchronously
        try {
            await SearchLog.create({
                query: q,
                law,
                user: req.user._id
            });
        } catch (logError) {
            console.error('Failed to log search:', logError);
        }

        res.json({ law, query: q, results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
