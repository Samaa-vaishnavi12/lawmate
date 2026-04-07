import asyncHandler from 'express-async-handler';
import FIR from '../models/FIR.js';

// @desc    Create new FIR
// @route   POST /api/fir
// @access  Private (Police only)
export const createFIR = asyncHandler(async (req, res) => {
    const firData = {
        ...req.body,
        createdBy: req.user._id
    };

    const fir = await FIR.create(firData);
    res.status(201).json(fir);
});

// @desc    Get all FIRs (with filters)
// @route   GET /api/fir
// @access  Private
export const getFIRs = asyncHandler(async (req, res) => {
    const { status, policeStation, startDate, endDate, page = 1, limit = 10 } = req.query;

    let query = {};

    // Police/Standard users can only see their own FIRs unless admin specifies global
    const isGlobal = req.query.global === 'true';

    if (req.user.isAdmin && isGlobal) {
        // Admin can see everything
    } else {
        query.createdBy = req.user._id;
    }

    if (status) query.status = status;
    if (policeStation) query['policeStation.name'] = policeStation;
    if (startDate || endDate) {
        query.registrationDate = {};
        if (startDate) query.registrationDate.$gte = new Date(startDate);
        if (endDate) query.registrationDate.$lte = new Date(endDate);
    }

    // Pagination logic
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await FIR.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    const firs = await FIR.find(query)
        .populate('createdBy', 'name email')
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(limitNum);

    res.json({
        firs,
        pagination: {
            totalCount,
            totalPages,
            currentPage: pageNum,
            limit: limitNum
        }
    });
});

// @desc    Get single FIR by ID
// @route   GET /api/fir/:id
// @access  Private
export const getFIRById = asyncHandler(async (req, res) => {
    const fir = await FIR.findById(req.params.id).populate('createdBy', 'name email');

    if (!fir) {
        res.status(404);
        throw new Error('FIR not found');
    }

    // Check authorization
    if (req.user.role === 'police' && fir.createdBy._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this FIR');
    }

    res.json(fir);
});

// @desc    Update FIR
// @route   PUT /api/fir/:id
// @access  Private (Police only)
export const updateFIR = asyncHandler(async (req, res) => {
    const fir = await FIR.findById(req.params.id);

    if (!fir) {
        res.status(404);
        throw new Error('FIR not found');
    }

    // Check authorization
    if (!req.user.isAdmin && fir.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this FIR');
    }

    // Only allow editing drafts
    if (fir.status !== 'draft') {
        res.status(400);
        throw new Error('Cannot edit filed FIR. Only drafts can be edited.');
    }

    const updatedFIR = await FIR.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: false } // Disable validation for drafts
    );

    res.json(updatedFIR);
});

// @desc    Delete FIR
// @route   DELETE /api/fir/:id
// @access  Private (Police only)
export const deleteFIR = asyncHandler(async (req, res) => {
    const fir = await FIR.findById(req.params.id);

    if (!fir) {
        res.status(404);
        throw new Error('FIR not found');
    }

    // Check authorization
    if (!req.user.isAdmin && fir.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this FIR');
    }

    // Only allow deletion of drafts
    if (fir.status !== 'draft') {
        res.status(400);
        throw new Error('Cannot delete filed FIR');
    }

    await FIR.findByIdAndDelete(req.params.id);
    res.json({ message: 'FIR deleted successfully' });
});

// @desc    Get FIR drafts
// @route   GET /api/fir/drafts
// @access  Private (Police only)
export const getDrafts = asyncHandler(async (req, res) => {
    const drafts = await FIR.find({
        createdBy: req.user._id,
        status: 'draft'
    }).sort({ updatedAt: -1 });

    res.json(drafts);
});

// @desc    File FIR (change status from draft to filed)
// @route   PUT /api/fir/:id/file
// @access  Private (Police only)
export const fileFIR = asyncHandler(async (req, res) => {
    const fir = await FIR.findById(req.params.id);

    if (!fir) {
        res.status(404);
        throw new Error('FIR not found');
    }

    if (fir.createdBy.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    if (fir.status !== 'draft') {
        res.status(400);
        throw new Error('FIR already filed');
    }

    // Update FIR details with data from request body before filing
    // This ensures any last-minute changes in the generator are saved
    const { rank, badgeNumber, ...otherData } = req.body;

    // Merge other FIR data fields
    Object.assign(fir, otherData);

    fir.status = 'filed';
    fir.registrationDate = new Date();

    // Set officer details from logged-in user
    fir.officer = {
        name: req.user.name,
        rank: rank || 'Sub-Inspector',
        badgeNumber: badgeNumber,
        policeStation: fir.policeStation.name
    };

    await fir.save();
    res.json(fir);
});
