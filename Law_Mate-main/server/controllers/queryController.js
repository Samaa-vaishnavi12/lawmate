import asyncHandler from 'express-async-handler';
import SavedQuery from '../models/SavedQuery.js';

// @desc    Save a search query
// @route   POST /api/queries
// @access  Private
const saveQuery = asyncHandler(async (req, res) => {
    const { query, law, title } = req.body;

    if (!query) {
        res.status(400);
        throw new Error('Query text is required');
    }

    const savedQuery = await SavedQuery.create({
        user: req.user._id,
        query,
        law: law || 'all',
        title: title || query.substring(0, 30)
    });

    res.status(201).json(savedQuery);
});

// @desc    Get all saved queries for a user (or all if admin)
// @route   GET /api/queries
// @access  Private
const getSavedQueries = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const global = req.query.global === 'true';

    let query = { user: req.user._id };

    // Admins can see all queries if global param is set
    if (global && req.user.isAdmin) {
        query = {};
    }

    const total = await SavedQuery.countDocuments(query);
    const queries = await SavedQuery.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        queries,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Delete a saved query
// @route   DELETE /api/queries/:id
// @access  Private
const deleteQuery = asyncHandler(async (req, res) => {
    const query = await SavedQuery.findById(req.params.id);

    if (!query) {
        res.status(404);
        throw new Error('Query not found');
    }

    if (!req.user.isAdmin && query.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await query.deleteOne();
    res.json({ message: 'Query removed' });
});

export {
    saveQuery,
    getSavedQueries,
    deleteQuery
};
