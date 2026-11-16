// server/src/routes/aiRoutes.js
import { Router } from 'express';
import { enhanceTechnicalNote } from '../controllers/aiController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(verifyToken);

router.post('/enhance-note', enhanceTechnicalNote);

export default router;