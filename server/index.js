import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './src/routes/authRoutes.js'; // 👈 Importante
import ticketRoutes from './src/routes/ticketRoutes.js';
import companyRoutes from './src/routes/companyRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// RUTAS API
app.use('/api/auth', authRoutes); // 👈 Esta es la ruta que te faltaba
app.use('/api/tickets', ticketRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo exitosamente en el puerto ${PORT}`);
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo exitosamente en el puerto ${PORT}`);
  });
}

export default app;