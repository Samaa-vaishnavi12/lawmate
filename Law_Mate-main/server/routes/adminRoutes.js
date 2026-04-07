import express from 'express';
import {
    getAllUsers,
    deleteUser,
    getAllFIRs,
    getAllLaws,
    createLawSection,
    updateLawSection,
    deleteLawSection
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin flag
router.use(protect);
router.use(adminOnly);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/firs', getAllFIRs);
router.get('/laws', getAllLaws);
router.post('/laws', createLawSection);
router.put('/laws/:id', updateLawSection);
router.delete('/laws/:id', deleteLawSection);

export default router;
