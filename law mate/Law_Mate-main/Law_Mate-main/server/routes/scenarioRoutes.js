import express from 'express';
import { searchScenarios, getAllScenarios, getScenario } from '../controllers/scenarioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchScenarios);
router.get('/',       protect, getAllScenarios);
router.get('/:id',    protect, getScenario);

export default router;
