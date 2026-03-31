import express from 'express';
const router = express.Router();
import { updateUserProfile, updateUserPassword, forgotPassword } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/profile').put(protect, updateUserProfile);
router.route('/password-change').put(protect, updateUserPassword);
router.post('/forgot-password', forgotPassword);

export default router;
