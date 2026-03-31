import asyncHandler from 'express-async-handler';
import SearchService from '../services/searchService.js';
import ChatHistory from '../models/ChatHistory.js';
import Section from '../models/Section.js';
import Scenario from '../models/Scenario.js';

// Clear embedding cache on startup so fresh DB data is always used
SearchService.clearCache();

// @desc    Send a message to the AI chat assistant
// @route   POST /api/chat
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { message, law = 'all', sessionId } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    // ── 1. Fetch relevant sections from MongoDB ──────────────────────────────
    let contextSections = [];

    try {
        const results = await SearchService.search(law, message, 5);
        if (results && results.length > 0) {
            contextSections = results;
        }
    } catch (err) {
        console.warn('Semantic search failed, trying keyword fallback:', err.message);
    }

    if (contextSections.length === 0) {
        try {
            const keywords = message.split(' ').filter(w => w.length > 3).slice(0, 5);
            const regexes = keywords.map(k => new RegExp(k, 'i'));
            const query = law === 'all'
                ? { $or: [{ title: { $in: regexes } }, { description: { $in: regexes } }] }
                : { law, $or: [{ title: { $in: regexes } }, { description: { $in: regexes } }] };

            const fallbackResults = await Section.find(query).limit(5).lean();
            if (fallbackResults.length > 0) {
                contextSections = fallbackResults.map(s => ({
                    law: s.law, section: s.section, title: s.title,
                    description: s.description || 'No description available', score: 0.5
                }));
            }
        } catch (fallbackErr) {
            console.error('MongoDB fallback search failed:', fallbackErr.message);
        }
    }

    // ── 1b. Search scenario database for matching real-life situations ───────
    let scenarioContext = '';
    try {
        const words = message.split(/\s+/).filter(w => w.length > 3).slice(0, 8);
        if (words.length > 0) {
            const regexes = words.map(w => new RegExp(w, 'i'));
            const matched = await Scenario.find({
                $or: [
                    { keywords: { $in: regexes } },
                    { scenario: { $in: regexes } }
                ]
            }).limit(2);

            if (matched.length > 0) {
                scenarioContext = '\n\nRELATED REAL-LIFE SCENARIOS FROM DATABASE:\n' +
                    matched.map(s =>
                        `Situation: ${s.scenario}\nApplicable Laws: ${s.laws.map(l => `${l.law.toUpperCase()} Section ${l.section} (${l.title})`).join(', ')}\nAdvice: ${s.advice}`
                    ).join('\n---\n');
            }
        }
    } catch (err) {
        console.warn('Scenario search error:', err.message);
    }

    // ── 2. Build context string ──────────────────────────────────────────────
    const sectionsText = contextSections.length > 0
        ? contextSections.map(r => `[${(r.law || law).toUpperCase()} §${r.section}: ${r.title}]\n${r.description}`).join('\n\n')
        : 'No specific sections found.';

    const contextText = sectionsText + scenarioContext;

    // ── 3. Load or create chat session ───────────────────────────────────────
    const sid = sessionId || `session_${req.user._id}_${Date.now()}`;
    let session = sessionId
        ? await ChatHistory.findOne({ user: req.user._id, sessionId })
        : null;

    if (!session) {
        session = await ChatHistory.create({
            user: req.user._id, sessionId: sid,
            title: message.substring(0, 50), law, messages: []
        });
    }

    const conversationHistory = [
        ...session.messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
    ];

    // ── 4. Check API key ─────────────────────────────────────────────────────
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    const hasApiKey = ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

    // ── 5. Fallback mode (no API key) ────────────────────────────────────────
    if (!hasApiKey) {
        const fallbackReply = contextSections.length > 0
            ? `Based on your query, here are the most relevant Indian law sections:\n\n` +
              contextSections.map((r, i) =>
                `**${i + 1}. ${(r.law || law).toUpperCase()} – Section ${r.section}: ${r.title}**\n${r.description}`
              ).join('\n\n') +
              (scenarioContext ? '\n\n' + scenarioContext : '') +
              '\n\n⚠️ For serious legal matters, please consult a qualified advocate.'
            : `I could not find relevant law sections for your query. Please try rephrasing or select a specific law from the dropdown.\n\n⚠️ For serious legal matters, please consult a qualified advocate.`;

        session.messages.push({ role: 'user', content: message });
        session.messages.push({ role: 'assistant', content: fallbackReply });
        await session.save();

        return res.json({ reply: fallbackReply, sessionId: sid, sources: contextSections, mode: 'search' });
    }

    // ── 6. AI mode ───────────────────────────────────────────────────────────
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: `You are LawMate, an expert Indian legal assistant. You ONLY answer questions about Indian law.

RELEVANT LAW SECTIONS FROM DATABASE (use these as your primary source):
${contextText}

STRICT RULES:
1. Answer ONLY based on the law sections provided above. Do NOT make up sections or laws.
2. Always cite the exact section (e.g. "Under IPC Section 323...").
3. If no relevant section was found above, say: "I could not find a specific law section for this — please consult a lawyer."
4. If the user describes a real situation (assault, theft, fraud, etc.), identify the applicable sections from the context above and explain what legal steps they can take.
5. Structure your answer clearly: first identify the applicable law, then explain rights/options, then suggest next steps.
6. Keep language simple, empathetic, and clear. No heavy legal jargon.
7. Do NOT answer questions unrelated to Indian law (e.g. coding, cooking, general knowledge). Politely decline.
8. End every answer with: "⚠️ For serious legal matters, please consult a qualified advocate."`,
            messages: conversationHistory
        })
    });

    if (!claudeResponse.ok) {
        const errBody = await claudeResponse.json().catch(() => ({}));
        console.error('Claude API error:', errBody);
        res.status(502);
        throw new Error('AI service is unavailable. Please try again shortly.');
    }

    const claudeData = await claudeResponse.json();
    const assistantReply = claudeData.content?.[0]?.text || 'Sorry, I could not generate a response.';

    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: assistantReply });
    await session.save();

    res.json({ reply: assistantReply, sessionId: sid, sources: contextSections, mode: 'ai' });
});

// @desc    Get all chat sessions for a user
const getSessions = asyncHandler(async (req, res) => {
    const sessions = await ChatHistory.find({ user: req.user._id })
        .select('sessionId title law createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(20);
    res.json(sessions);
});

// @desc    Get a specific chat session
const getSession = asyncHandler(async (req, res) => {
    const session = await ChatHistory.findOne({ user: req.user._id, sessionId: req.params.sessionId });
    if (!session) { res.status(404); throw new Error('Session not found'); }
    res.json(session);
});

// @desc    Delete a chat session
const deleteSession = asyncHandler(async (req, res) => {
    await ChatHistory.deleteOne({ user: req.user._id, sessionId: req.params.sessionId });
    res.json({ message: 'Session deleted' });
});

export { sendMessage, getSessions, getSession, deleteSession };
