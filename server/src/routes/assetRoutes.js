// server/src/routes/assetRoutes.js
import { Router } from 'express';
import { getAssets, updateAssetPosition } from '../controllers/assetController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyToken);

router.get('/', getAssets);
router.patch('/:id/position', checkRole(['admin', 'tech']), updateAssetPosition);

export default router;