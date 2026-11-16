// server/src/controllers/ticketController.js
import { supabase } from '../../config/db.js';

// Obtener todos los tickets con sus empresas y perfiles
export const getTickets = async (req, res) => {
  try {
    const { rol, role, company_id } = req.user;
    const userRole = role || rol;

    let query = supabase
      .from('tickets')
      .select('*, companies:client_id(*), profiles:assigned_to(*)');

    // Si es cliente y tiene empresa asociada, filtrar por su empresa
    if (userRole === 'client' && company_id) {
      query = query.eq('client_id', company_id);
    }

    const { data: tickets, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error de Supabase en getTickets:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.json(tickets || []);
  } catch (err) {
    console.error('💥 Error en getTickets:', err);
    return res.status(500).json({ error: 'Error al consultar tickets' });
  }
};

// Crear nuevo ticket (Estado por defecto: 'pending')
export const createTicket = async (req, res) => {
  try {
    const { subject, description, ticket_type, priority, client_id, scheduled_date } = req.body;
    const user_id = req.user.id;

    const finalClientId = client_id || req.user.company_id || null;

    const { data: newTicket, error } = await supabase
      .from('tickets')
      .insert([{
        subject,
        description,
        ticket_type: ticket_type || 'incidence',
        priority: priority || 'medium',
        status: 'pending', // 👈 Estado alineado al nuevo flujo 'Por Atender'
        user_id,
        client_id: finalClientId,
        scheduled_date: scheduled_date || null
      }])
      .select('*, companies:client_id(*), profiles:assigned_to(*)')
      .single();

    if (error) throw error;

    // Log inicial de creación
    await supabase.from('ticket_logs').insert([{
      ticket_id: newTicket.id,
      changed_by: user_id,
      previous_status: null,
      new_status: 'pending',
      note: 'Ticket registrado en la plataforma'
    }]);

    return res.status(201).json(newTicket);
  } catch (err) {
    console.error('Error al crear ticket:', err);
    return res.status(500).json({ error: 'Error al registrar el ticket' });
  }
};

// Actualizar Ticket (Estado, Técnico, Empresa, Motivo de Espera y Log de Nota)
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, client_id, note, on_hold_reason } = req.body;
    const user_id = req.user.id;

    // 1. Obtener el estado anterior para el log
    const { data: oldTicket } = await supabase
      .from('tickets')
      .select('status')
      .eq('id', id)
      .single();

    // 2. Preparar los datos a actualizar
    const updateData = {};
    if (status) updateData.status = status;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to || null;
    if (client_id !== undefined) updateData.client_id = client_id || null;
    if (on_hold_reason !== undefined) updateData.on_hold_reason = on_hold_reason || null;

    const { data: updatedTicket, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id)
      .select('*, companies:client_id(*), profiles:assigned_to(*)')
      .single();

    if (error) {
      console.error('❌ Error actualizando ticket:', error.message);
      return res.status(500).json({ error: error.message });
    }

    // 3. Registrar el log de cambio y/o la nota de avance si existe
    if (note || (status && oldTicket?.status !== status)) {
      await supabase.from('ticket_logs').insert([{
        ticket_id: id,
        changed_by: user_id,
        previous_status: oldTicket?.status || null,
        new_status: status || oldTicket?.status,
        note: note || `Estado actualizado a ${status}`
      }]);
    }

    return res.json(updatedTicket);
  } catch (error) {
    console.error('❌ Error interno en updateTicket:', error);
    return res.status(500).json({ error: 'Error al actualizar el ticket' });
  }
};