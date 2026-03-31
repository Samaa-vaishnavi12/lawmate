import express from 'express';
import { analyzeDocument } from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', protect, upload.single('file'), analyzeDocument);

export default router;
