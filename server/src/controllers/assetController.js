// server/src/controllers/assetController.js
import { supabase } from '../../config/db.js';

// Obtener inventario de activos
export const getAssets = async (req, res) => {
  try {
    const { company_id } = req.query;
    let query = supabase.from('assets').select('*, departments(name), components(*)');

    if (company_id) {
      query = query.eq('company_id', company_id);
    }

    const { data: assets, error } = await query;
    if (error) throw error;

    return res.json(assets);
  } catch (err) {
    console.error('Error al obtener activos:', err);
    return res.status(500).json({ error: 'Error al consultar inventario ITAM' });
  }
};

// Actualizar posición Drag & Drop en el croquis (Coordenadas SVG)
export const updateAssetPosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { coord_x, coord_y } = req.body;

    const { data, error } = await supabase
      .from('assets')
      .update({ coord_x, coord_y, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error('Error al actualizar posición:', err);
    return res.status(500).json({ error: 'Error al guardar coordenadas del activo' });
  }
};