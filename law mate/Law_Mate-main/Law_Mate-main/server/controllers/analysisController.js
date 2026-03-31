import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import asyncHandler from 'express-async-handler';
import searchService from '../services/searchService.js';
import SearchLog from '../models/SearchLog.js';

// Legal keywords that should appear in genuine legal documents
const LEGAL_KEYWORDS = [
    'section', 'ipc', 'crpc', 'fir', 'offence', 'offense', 'accused',
    'plaintiff', 'defendant', 'court', 'judge', 'magistrate', 'petition',
    'complaint', 'charge', 'bail', 'arrest', 'police', 'investigation',
    'witness', 'evidence', 'act', 'law', 'legal', 'case', 'crime',
    'criminal', 'civil', 'theft', 'assault', 'murder', 'fraud', 'penalty',
    'punishment', 'conviction', 'acquittal', 'appeal', 'verdict', 'order',
    'summons', 'warrant', 'cognizable', 'non-cognizable', 'bailable',
    'non-bailable', 'suo motu', 'affidavit', 'deponent', 'respondent'
];

// Minimum number of legal keywords required to be considered a legal document
const MIN_LEGAL_KEYWORD_COUNT = 3;
const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 50000;

function detectLegalContent(text) {
    const lower = text.toLowerCase();
    const foundKeywords = LEGAL_KEYWORDS.filter(kw => lower.includes(kw));
    return {
        isLegal: foundKeywords.length >= MIN_LEGAL_KEYWORD_COUNT,
        foundKeywords,
        keywordCount: foundKeywords.length
    };
}

// @desc    Analyze legal document for mistakes and missing info
// @route   POST /api/analysis
// @access  Private
export const analyzeDocument = asyncHandler(async (req, res) => {
    let { text } = req.body;
    let fileInfo = null;

    // ── 1. Handle PDF upload ──────────────────────────────────────────────────
    if (req.file) {
        // Validate file type strictly
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({
                message: 'Invalid file type. Only PDF files are accepted.',
                isInvalidDocument: true
            });
        }

        // Validate file size (max 10MB)
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                message: 'File too large. Maximum size is 10MB.',
                isInvalidDocument: true
            });
        }

        try {
            const data = await pdf(req.file.buffer);
            text = data.text?.trim() || '';
            fileInfo = {
                pages: data.numpages,
                name: req.file.originalname
            };
        } catch (pdfError) {
            console.error('PDF Parse Error:', pdfError);
            return res.status(400).json({
                message: 'Could not read this PDF. It may be scanned, encrypted, or corrupted.',
                isInvalidDocument: true
            });
        }

        // Check if PDF extracted any meaningful text
        if (!text || text.length < MIN_TEXT_LENGTH) {
            return res.status(400).json({
                message: 'This PDF appears to be a scanned image or contains no readable text. Please upload a text-based legal PDF.',
                isInvalidDocument: true,
                extractedLength: text?.length || 0
            });
        }
    }

    // ── 2. Validate text length ───────────────────────────────────────────────
    if (!text || text.trim().length < MIN_TEXT_LENGTH) {
        return res.status(400).json({
            message: `Document too short. Please provide at least ${MIN_TEXT_LENGTH} characters of legal text.`,
            isInvalidDocument: true
        });
    }

    if (text.trim().length > MAX_TEXT_LENGTH) {
        text = text.trim().substring(0, MAX_TEXT_LENGTH);
    }

    // ── 3. LEGAL CONTENT VALIDATION ──────────────────────────────────────────
    // This is the key check — reject non-legal documents
    const { isLegal, foundKeywords, keywordCount } = detectLegalContent(text);

    if (!isLegal) {
        return res.status(422).json({
            message: 'This does not appear to be a legal document.',
            isInvalidDocument: true,
            reason: `Only ${keywordCount} legal keyword(s) found (minimum ${MIN_LEGAL_KEYWORD_COUNT} required).`,
            hint: 'Please upload a legal document such as an FIR, court order, legal notice, petition, affidavit, or any document containing legal terminology.',
            foundKeywords
        });
    }

    // ── 4. Identify cited sections ────────────────────────────────────────────
    const mentionedSections = text.match(/Section\s+\d+[A-Z]?|u\/s\s+\d+|S\.\s*\d+/gi) || [];
    const citedNumbers = [...new Set(mentionedSections.map(s => s.match(/\d+/)[0]))];

    // ── 5. Semantic search across all laws ───────────────────────────────────
    const searchResults = await searchService.search('all', text, 5);

    if (!searchResults || searchResults.length === 0) {
        return res.status(422).json({
            message: 'Could not find relevant legal sections for this document. Please check the content.',
            isInvalidDocument: true
        });
    }

    const insights = [];
    let consistencyScore = 100;
    const suggestedSections = searchResults.map(r => r.section);

    // ── 6. Compare cited vs suggested ────────────────────────────────────────
    citedNumbers.forEach(cited => {
        const isHighlyRelevant = suggestedSections.some(s => s.toString().includes(cited));
        if (!isHighlyRelevant) {
            insights.push({
                type: 'warning',
                title: `Potential Mismatch: Section ${cited}`,
                description: `You cited Section ${cited}, but based on the narrative, sections ${suggestedSections.slice(0, 2).join(', ')} might be more relevant.`,
                impact: -15
            });
            consistencyScore -= 15;
        } else {
            insights.push({
                type: 'success',
                title: `Correct Citation: Section ${cited}`,
                description: `The narrative strongly supports the use of Section ${cited}.`,
                impact: 0
            });
        }
    });

    // ── 7. Check for missing information ─────────────────────────────────────
    searchResults.forEach(result => {
        const description = result.description?.toLowerCase() || '';
        const lowerText = text.toLowerCase();
        if (description.includes('weapon') && !lowerText.includes('weapon') && !lowerText.includes('gun') && !lowerText.includes('knife') && !lowerText.includes('rod')) {
            insights.push({
                type: 'info',
                title: `Clarification Needed: ${result.law?.toUpperCase()} Section ${result.section}`,
                description: 'This section references weapons. If a weapon was involved, specify the type for stronger legal alignment.',
                impact: -5
            });
        }
    });

    // ── 8. No sections cited ──────────────────────────────────────────────────
    if (citedNumbers.length === 0) {
        insights.push({
            type: 'suggestion',
            title: 'No Sections Cited',
            description: `Based on your document, consider referencing: ${suggestedSections.slice(0, 3).join(', ')}.`,
            impact: -10
        });
        consistencyScore -= 10;
    }

    consistencyScore = Math.max(0, consistencyScore);

    // ── 9. Case summary ───────────────────────────────────────────────────────
    let caseSummary = 'Unable to generate summary.';
    if (searchResults.length > 0) {
        const top = searchResults[0];
        const offenseTitle = top.title || top.description?.split('.')[0] || 'Legal Procedure';
        caseSummary = `This document primarily concerns **${top.law?.toUpperCase()} Section ${top.section}**, which pertains to **${offenseTitle}**. `;

        if (top.description) {
            const keyTheme = top.description.length > 150
                ? top.description.substring(0, 150) + '...'
                : top.description;
            caseSummary += `\n\n**Main Theme:** ${keyTheme} `;
        }

        caseSummary += `\n\n**Legal Alignment:** `;
        if (consistencyScore > 75) {
            caseSummary += 'Strong correlation with the cited legal sections. The narrative adequately supports the legal elements required.';
        } else if (consistencyScore > 40) {
            caseSummary += 'Partial alignment detected. Some key legal requirements may be missing or loosely described.';
        } else {
            caseSummary += 'Significant mismatch between the narrative and cited sections. Review and correct before formal filing.';
        }
    }

    // ── 10. Log ───────────────────────────────────────────────────────────────
    try {
        await SearchLog.create({
            query: `Analysis: ${text.substring(0, 50)}...`,
            law: 'analysis',
            user: req.user._id
        });
    } catch (logError) {
        console.error('Failed to log analysis:', logError);
    }

    res.json({
        text,
        score: consistencyScore,
        summary: caseSummary,
        insights,
        suggestedSections: searchResults,
        legalKeywordsFound: foundKeywords.slice(0, 10),
        fileInfo
    });
});
