import asyncHandler from 'express-async-handler';
import FIR from '../models/FIR.js';
import SearchLog from '../models/SearchLog.js';
import SavedQuery from '../models/SavedQuery.js';
import User from '../models/User.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
    const isAdmin = req.user.isAdmin;
    const userId = req.user._id;

    if (isAdmin) {
        const [totalSearches, documentsDrafted, totalFiledDocs, totalAnalyzed, savedQueries, totalUsers, recentFIRs, recentQueries] = await Promise.all([
            SearchLog.countDocuments({}),
            FIR.countDocuments({ status: 'draft' }),
            FIR.countDocuments({ status: { $ne: 'draft' } }),
            SearchLog.countDocuments({ law: 'analysis' }),
            SavedQuery.countDocuments({}),
            User.countDocuments({}),
            FIR.find({}).populate('createdBy', 'name').sort({ updatedAt: -1 }).limit(10),
            SavedQuery.find({}).populate('user', 'name').sort({ createdAt: -1 }).limit(10)
        ]);

        return res.json({
            totalSearches, documentsDrafted, totalFiledDocs, totalAnalyzed,
            savedQueries, totalUsers,
            recentActivity: recentFIRs.map(f => ({
                type: 'FIR',
                action: f.status === 'draft' ? 'Updated Draft' : 'Filed FIR',
                identifier: f.firNumber || 'Draft',
                description: `${f.incident?.natureOfOffence || 'FIR'} — ${f.createdBy?.name || 'Unknown'}`,
                timestamp: f.updatedAt
            })),
            recentQueries,
            global: true
        });
    }

    // Individual stats — count actual records properly
    const [totalSearches, documentsDrafted, totalFiledDocs, totalAnalyzed, savedQueriesCount, recentFIRs, recentQueriesList] = await Promise.all([
        SearchLog.countDocuments({ user: userId }),
        FIR.countDocuments({ createdBy: userId, status: 'draft' }),
        FIR.countDocuments({ createdBy: userId, status: { $ne: 'draft' } }),
        SearchLog.countDocuments({ user: userId, law: 'analysis' }),
        SavedQuery.countDocuments({ user: userId }),
        FIR.find({ createdBy: userId }).sort({ updatedAt: -1 }).limit(5),
        SavedQuery.find({ user: userId }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
        totalSearches,
        documentsDrafted,
        totalFiledDocs,
        totalAnalyzed,
        savedQueries: savedQueriesCount,
        recentActivity: recentFIRs.map(f => ({
            type: 'FIR',
            action: f.status === 'draft' ? 'Updated Draft' : 'Filed FIR',
            identifier: f.firNumber || 'Draft',
            description: `${f.incident?.natureOfOffence || 'FIR'} — ${f.complainant?.name || 'Unknown'}`,
            timestamp: f.updatedAt
        })),
        recentQueries: recentQueriesList,
        global: false
    });
});
