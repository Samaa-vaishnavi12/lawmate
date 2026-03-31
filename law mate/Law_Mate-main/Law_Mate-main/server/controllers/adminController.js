import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import FIR from '../models/FIR.js';
import SavedQuery from '../models/SavedQuery.js';
import SearchLog from '../models/SearchLog.js';
import Section from '../models/Section.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { isAdmin: { $ne: true } };
    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        users,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Delete user (Cascade Delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete admin user');
    }

    // CASCADE DELETE START
    // 1. Delete all FIRs created by user
    await FIR.deleteMany({ createdBy: user._id });

    // 2. Delete all saved queries
    await SavedQuery.deleteMany({ user: user._id });

    // 3. Delete all search logs
    await SearchLog.deleteMany({ user: user._id });

    // 4. Finally delete the user
    await user.deleteOne();

    res.json({ message: 'User and all associated data deleted successfully' });
});

// @desc    Get all FIRs (Global Oversight)
// @route   GET /api/admin/firs
// @access  Private/Admin
export const getAllFIRs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await FIR.countDocuments({});
    const firs = await FIR.find({})
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        firs,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get all Law Sections
// @route   GET /api/admin/laws
// @access  Private/Admin
export const getAllLaws = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Section.countDocuments({});
    const laws = await Section.find({})
        .sort({ law: 1, order: 1 })
        .skip(skip)
        .limit(limit);

    res.json({
        laws,
        page,
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Create new Law Section
// @route   POST /api/admin/laws
// @access  Private/Admin
export const createLawSection = asyncHandler(async (req, res) => {
    const { section, title, description, law, punishment, bailsilver, offenseType } = req.body;

    if (!section || !title || !description || !law) {
        res.status(400);
        throw new Error('Please provide all required fields (section, title, description, law)');
    }

    const sectionExists = await Section.findOne({ section, law });

    if (sectionExists) {
        res.status(400);
        throw new Error(`Section ${section} already exists in ${law}`);
    }

    // Auto-calculate order if not provided
    const lastSection = await Section.findOne({ law }).sort({ order: -1 });
    const order = lastSection ? lastSection.order + 1 : 1;

    const newSection = await Section.create({
        section,
        title,
        description,
        law,
        punishment,
        bailsilver,
        offenseType,
        order
    });

    res.status(201).json(newSection);
});

// @desc    Update Law Section
// @route   PUT /api/admin/laws/:id
// @access  Private/Admin
export const updateLawSection = asyncHandler(async (req, res) => {
    const { section, title, description, law, punishment, bailsilver, offenseType } = req.body;
    const sectionItem = await Section.findById(req.params.id);

    if (sectionItem) {
        sectionItem.section = section || sectionItem.section;
        sectionItem.title = title || sectionItem.title;
        sectionItem.description = description || sectionItem.description;
        sectionItem.law = law || sectionItem.law;
        sectionItem.punishment = punishment !== undefined ? punishment : sectionItem.punishment;
        sectionItem.bailsilver = bailsilver !== undefined ? bailsilver : sectionItem.bailsilver;
        sectionItem.offenseType = offenseType || sectionItem.offenseType;

        const updatedSection = await sectionItem.save();
        res.json(updatedSection);
    } else {
        res.status(404);
        throw new Error('Law section not found');
    }
});

// @desc    Delete Law Section
// @route   DELETE /api/admin/laws/:id
// @access  Private/Admin
export const deleteLawSection = asyncHandler(async (req, res) => {
    const section = await Section.findById(req.params.id);

    if (section) {
        await section.deleteOne();
        res.json({ message: 'Law section removed' });
    } else {
        res.status(404);
        throw new Error('Law section not found');
    }
});
