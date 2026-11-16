// server/src/routes/authRoutes.js
import { Router } from 'express';
import { login } from '../controllers/authController.js';

const router = Router();

// Ruta pública POST /api/auth/login
router.post('/login', login);

export default router;