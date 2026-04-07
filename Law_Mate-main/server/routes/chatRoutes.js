import express from 'express';
import { sendMessage, getSessions, getSession, deleteSession } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/sessions', protect, getSessions);
router.get('/sessions/:sessionId', protect, getSession);
router.delete('/sessions/:sessionId', protect, deleteSession);

export default router;
