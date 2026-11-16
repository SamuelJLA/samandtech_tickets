// server/src/routes/userRoutes.js
import { Router } from 'express';
import { getUsers } from '../controllers/userController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(verifyToken);

router.get('/', checkRole(['admin']), getUsers);

export default router;