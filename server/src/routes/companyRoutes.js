// server/src/routes/companyRoutes.js
import { Router } from 'express';
import { getCompanies, createCompany } from '../controllers/companyController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(verifyToken);

router.get('/', getCompanies);
router.post('/', checkRole(['admin']), createCompany);

export default router;