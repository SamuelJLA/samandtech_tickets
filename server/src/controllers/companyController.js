// server/src/controllers/companyController.js
import { supabase } from '../../config/db.js';

export const getCompanies = async (req, res) => {
  try {
    const { data, error } = await supabase.from('companies').select('*').order('name');
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener empresas' });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { name, rif_tax_id, contact_email, contact_phone } = req.body;
    const { data, error } = await supabase
      .from('companies')
      .insert([{ name, rif_tax_id, contact_email, contact_phone }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Error al registrar empresa' });
  }
};