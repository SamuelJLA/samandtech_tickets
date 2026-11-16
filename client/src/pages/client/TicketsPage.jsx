// client/src/pages/client/TicketsPage.jsx
import { useState, useEffect, useContext } from 'react';
import MainLayout from '../../components/MainLayout';
import api from '../../api/client';
import { AuthContext } from '../../context/AuthContext';

export default function TicketsPage() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Estado del formulario de nuevo ticket
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    ticket_type: 'incidence',
    priority: 'medium'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', formData);
      setIsModalOpen(false);
      setFormData({ subject: '', description: '', ticket_type: 'incidence', priority: 'medium' });
      fetchTickets(); // Recargar lista
    } catch (error) {
      console.error('Error al crear ticket:', error);
    }
  };

  // Filtrado dinámico
  const filteredTickets = tickets.filter(t => 
    filterStatus === 'all' ? true : t.status === filterStatus
  );

  // Colores visuales según el estado
  const statusBadges = {
    open: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    in_progress: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    resolved: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    closed: 'bg-slate-500/10 border-slate-500/30 text-slate-400'
  };

  return (
    <MainLayout title="Módulo HelpDesk — Gestión de Tickets">
      <div className="space-y-6">
        {/* Barra Superior: Métricas + Botón Crear */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">Tickets de Soporte</h2>
            <p className="text-sm text-slate-400">Administra y da seguimiento a las incidencias técnicas</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            ➕ Nuevo Ticket
          </button>
        </div>

        {/* Filtros de Estado */}
        <div className="flex gap-2 border-b border-slate-700 pb-2">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filterStatus === status 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {status === 'all' ? 'Todos' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tabla de Tickets */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">Cargando tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center text-slate-400">
            No hay tickets registrados en esta categoría.
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700 uppercase text-xs">
                <tr>
                  <th className="p-4">Asunto</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Prioridad</th>
                  <th className="p-4">Asignado a</th>
                  <th className="p-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      {ticket.subject}
                      {ticket.description && (
                        <span className="block text-xs font-normal text-slate-400 truncate max-w-xs">
                          {ticket.description}
                        </span>
                      )}
                    </td>
                    <td className="p-4 capitalize">{ticket.ticket_type}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs border rounded-full capitalize ${statusBadges[ticket.status]}`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 capitalize">{ticket.priority}</td>
                    <td className="p-4 text-slate-400">
                      {ticket.profiles?.full_name || 'Sin asignar'}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Crear Ticket */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-lg space-y-4">
              <h3 className="text-xl font-bold text-white">Generar Nuevo Ticket</h3>
              
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Asunto / Título</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Ej: Impresora de RRHH sin conexión"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Tipo de Ticket</label>
                    <select
                      value={formData.ticket_type}
                      onChange={(e) => setFormData({ ...formData, ticket_type: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="incidence">Incidencia</option>
                      <option value="maintenance">Mantenimiento</option>
                      <option value="requirement">Requerimiento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">Prioridad</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Descripción Detallada</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Detalla el problema o requerimiento..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors"
                  >
                    Guardar Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}