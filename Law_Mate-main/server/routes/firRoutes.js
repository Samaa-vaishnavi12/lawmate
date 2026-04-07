import express from 'express';
import {
    createFIR,
    getFIRs,
    getFIRById,
    updateFIR,
    deleteFIR,
    getDrafts,
    fileFIR
} from '../controllers/firController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Main CRUD routes
router.route('/')
    .get(getFIRs)
    .post(createFIR);

router.get('/drafts', getDrafts);

router.route('/:id')
    .get(getFIRById)
    .put(updateFIR)
    .delete(deleteFIR);

router.put('/:id/file', fileFIR);

export default router;
