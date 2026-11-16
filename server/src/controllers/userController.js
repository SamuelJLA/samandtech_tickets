// server/src/controllers/userController.js
import { supabase } from '../../config/db.js';

export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};