// server/src/controllers/authController.js
import { supabase } from '../../config/db.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Validar credenciales reales con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 2. Obtener los datos extendidos del perfil y su empresa
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*, companies(name)')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ error: 'Perfil de usuario no encontrado' });
    }

    // 3. Generar Token JWT
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role || 'admin',
      rol: user.role || 'admin',
      company_id: user.company_id
    };

    const token = jwt.sign(
      tokenPayload, 
      process.env.JWT_SECRET || 'SamandTech_Secret_Key_2027_Secure',
      { expiresIn: '12h' }
    );

    console.log(`✅ Login exitoso para: ${user.full_name || user.email} (${user.role})`);

    return res.json({
      token,
      user: {
        id: user.id,
        nombre: user.full_name || user.email,
        full_name: user.full_name || user.email,
        email: user.email,
        rol: user.role || 'admin',
        role: user.role || 'admin',
        phone: user.phone || '',
        company_id: user.company_id,
        company_name: user.companies?.name || 'SAMAND TECH'
      }
    });
  } catch (err) {
    console.error('💥 Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};