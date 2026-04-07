import express from 'express';
const router = express.Router();
import { saveQuery, getSavedQueries, deleteQuery } from '../controllers/queryController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, saveQuery)
    .get(protect, getSavedQueries);

router.route('/:id')
    .delete(protect, deleteQuery);

export default router;
