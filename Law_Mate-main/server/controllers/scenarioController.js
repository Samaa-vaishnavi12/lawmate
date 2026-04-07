import asyncHandler from 'express-async-handler';
import Scenario from '../models/Scenario.js';
import Section from '../models/Section.js';
import SearchService from '../services/searchService.js';

// ── Keyword-based scenario matcher ──────────────────────────────────────────
function scenarioScore(scenario, query) {
    const q = query.toLowerCase();
    const words = q.split(/\s+/);
    let score = 0;

    // Exact keyword match (highest weight)
    for (const kw of scenario.keywords) {
        if (q.includes(kw.toLowerCase())) score += 10;
        else if (words.some(w => kw.toLowerCase().includes(w) || w.includes(kw.toLowerCase()))) score += 4;
    }

    // Title match
    const titleWords = scenario.title.toLowerCase().split(/\s+/);
    for (const w of words) {
        if (w.length > 3 && titleWords.some(tw => tw.includes(w))) score += 3;
    }

    // Description match
    const desc = scenario.description.toLowerCase();
    for (const w of words) {
        if (w.length > 3 && desc.includes(w)) score += 1;
    }

    // Category match
    if (q.includes(scenario.category.toLowerCase())) score += 5;

    return score;
}

// @desc    Search scenarios by query text
// @route   GET /api/scenarios/search?q=...
// @access  Private
export const searchScenarios = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
        return res.status(400).json({ message: 'Query must be at least 3 characters.' });
    }

    // 1. Get all scenarios and score them
    const all = await Scenario.find({});
    const scored = all
        .map(s => ({ scenario: s, score: scenarioScore(s, q) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    // 2. Also run semantic search for relevant sections
    let sections = [];
    try {
        sections = await SearchService.search('all', q, 5);
    } catch (e) {
        console.warn('Section search failed:', e.message);
    }

    // 3. If no scenario matched but sections found, build a generic response
    if (scored.length === 0 && sections.length > 0) {
        return res.json({
            matched: false,
            query: q,
            scenarios: [],
            sections,
            message: 'No exact scenario found, but here are the most relevant law sections.'
        });
    }

    res.json({
        matched: scored.length > 0,
        query: q,
        scenarios: scored.map(x => x.scenario),
        sections,
        topScore: scored[0]?.score || 0
    });
});

// @desc    Get all scenarios (for browsing)
// @route   GET /api/scenarios
// @access  Private
export const getAllScenarios = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const filter = category ? { category: new RegExp(category, 'i') } : {};
    const scenarios = await Scenario.find(filter).select('scenarioId title category keywords description');
    res.json(scenarios);
});

// @desc    Get a single scenario by ID
// @route   GET /api/scenarios/:id
// @access  Private
export const getScenario = asyncHandler(async (req, res) => {
    const scenario = await Scenario.findOne({ scenarioId: req.params.id });
    if (!scenario) {
        res.status(404);
        throw new Error('Scenario not found');
    }
    res.json(scenario);
});
