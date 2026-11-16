// server/src/routes/ticketRoutes.js
import { Router } from 'express';
import { getTickets, createTicket, updateTicket } from '../controllers/ticketController.js';
import { verifyToken, checkRole } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(verifyToken);

router.get('/', getTickets);
router.post('/', createTicket);
router.patch('/:id', checkRole(['admin', 'tech']), updateTicket);

export default router;