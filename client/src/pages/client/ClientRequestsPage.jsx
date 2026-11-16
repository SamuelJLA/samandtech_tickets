import { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import api from '../../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faClock, 
  faUserGear, 
  faEye, 
  faXmark, 
  faPaperPlane,
  faCircleCheck,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

export default function ClientRequestsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'in_progress' | 'on_hold'
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Seguimiento y Respuesta
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      // Solo mostramos las solicitudes que aún no han finalizado
      const activeOnly = (res.data || []).filter(
        t => t.status !== 'closed' && t.status !== 'resolved'
      );
      setTickets(activeOnly);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setSendingReply(true);
      // Si el ticket estaba 'En Espera' por el cliente, al responder pasa automáticamente a 'En Proceso'
      const nextStatus = selectedTicket.status === 'on_hold' ? 'in_progress' : selectedTicket.status;

      const updated = await api.patch(`/tickets/${selectedTicket.id}`, {
        status: nextStatus,
        on_hold_reason: null,
        note: `[Respuesta del Cliente]: ${replyText.trim()}`
      });

      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updated.data : t));
      setSelectedTicket(updated.data);
      setReplyText('');
      alert('✅ Tu mensaje ha sido enviado al técnico asignado.');
    } catch (err) {
      console.error('Error al enviar respuesta:', err);
      alert('❌ No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setSendingReply(false);
    }
  };

  // Filtrado por estado y búsqueda
  const filteredTickets = tickets.filter(t => {
    const normalizedStatus = t.status === 'open' ? 'pending' : t.status;
    const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus;
    const matchesSearch = searchTerm === '' || 
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const renderFriendlyBadge = (ticket) => {
  const status = ticket.status?.toLowerCase();
  const hasTech = Boolean(ticket.assigned_to || ticket.profiles?.full_name);

  // 1. Caso pendiente o en proceso pero sin técnico asignado todavía
  if (status === 'pending' || status === 'open' || (status === 'in_progress' && !hasTech)) {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-bold border inline-flex items-center gap-2 whitespace-nowrap bg-blue-500/15 text-blue-800 border-blue-500/30">
        <FontAwesomeIcon icon={faClock} />
        Recibido — Asignando especialista
      </span>
    );
  }

  // 2. Caso en proceso con técnico ya asignado
  if (status === 'in_progress' && hasTech) {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-bold border inline-flex items-center gap-2 whitespace-nowrap bg-amber-500/15 text-amber-800 border-amber-500/30">
        <FontAwesomeIcon icon={faUserGear} />
        Un técnico está trabajando en esto
      </span>
    );
  }

  // 3. Caso en espera por el cliente
  if (status === 'on_hold') {
    return (
      <span className="px-3 py-1.5 rounded-full text-xs font-bold border inline-flex items-center gap-2 whitespace-nowrap bg-purple-500/15 text-purple-800 border-purple-500/30">
        <FontAwesomeIcon icon={faExclamationCircle} />
        Esperando información tuya
      </span>
    );
  }

  return null;
};

  return (
    <MainLayout title="Mis Solicitudes en Curso">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* BARRA DE BÚSQUEDA Y FILTROS AMIGABLES */}
        <div className="glass-panel p-5 rounded-3xl border border-white/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por problema o número de caso..."
                className="w-full bg-white/80 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00877D]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'pending', label: 'Recibidos' },
                { id: 'in_progress', label: 'En atención' },
                { id: 'on_hold', label: 'Esperando respuesta' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    filterStatus === tab.id
                      ? 'bg-[#1E293B] text-white shadow-xs'
                      : 'bg-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LISTADO DE SOLICITUDES ACTIVAS */}
        <div className="space-y-4">
          {loading ? (
            <div className="glass-panel p-8 rounded-3xl text-center text-xs text-slate-500">
              Cargando tus solicitudes...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl text-center space-y-2 border border-white/80">
              <FontAwesomeIcon icon={faCircleCheck} className="text-3xl text-emerald-500" />
              <h3 className="text-base font-black text-slate-900">No hay solicitudes en esta categoría</h3>
              <p className="text-xs text-slate-500">
                Si necesitas reportar un problema nuevo o agendar una visita, puedes hacerlo desde la pestaña <strong>Inicio</strong>.
              </p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className="glass-panel p-5 rounded-3xl border border-white/80 bg-white/60 hover:bg-white/90 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black text-[#00877D]">
                      {ticket.ticket_type === 'maintenance' ? '📅 Visita Técnica' : '🚨 Reporte de Problema'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#{ticket.id?.substring(0, 6)}</span>
                    <span className="text-[11px] text-slate-400">
                      • {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{ticket.subject}</h3>

                  <p className="text-xs text-slate-600">
                    Técnico encargado: <strong className="text-slate-800">{ticket.profiles?.full_name || 'Asignando especialista...'}</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {renderFriendlyBadge(ticket.status)}

                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <FontAwesomeIcon icon={faEye} className="text-[#11C6EA]" />
                    Ver detalle / Responder
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODAL DETALLE Y RESPUESTA AL TÉCNICO */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-white/80 animate-fadeIn">
            
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#11C6EA]">
                  Caso #{selectedTicket.id?.substring(0, 8)}
                </span>
                <h3 className="text-base font-extrabold mt-0.5">{selectedTicket.subject}</h3>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Resumen amigable */}
              <div className="grid grid-cols-2 gap-4 bg-white/60 p-4 rounded-2xl border border-white">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Estado Actual</span>
                  <div className="mt-1">{renderFriendlyBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Técnico Asignado</span>
                  <span className="block text-xs font-extrabold text-slate-900 mt-1.5">
                    {selectedTicket.profiles?.full_name || 'Por asignar'}
                  </span>
                </div>
              </div>

              {/* Descripción enviada */}
              <div>
                <span className="block text-xs font-extrabold text-slate-700 mb-1">Lo que nos reportaste:</span>
                <div className="bg-white/70 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  {selectedTicket.description || 'Sin detalles adicionales.'}
                </div>
              </div>

              {/* Alerta si el técnico está esperando respuesta */}
              {selectedTicket.status === 'on_hold' && (
                <div className="bg-purple-500/10 border border-purple-500/30 p-3.5 rounded-2xl text-xs text-purple-900 font-medium">
                  ⏳ <strong>Necesitamos tu ayuda:</strong> El técnico puso este caso en pausa esperando información o confirmación de tu parte. Escribe tu respuesta abajo para continuar.
                </div>
              )}

              {/* Formulario para enviar comentario/respuesta al técnico */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block text-xs font-extrabold text-slate-800">
                  💬 Enviar mensaje o información adicional al técnico
                </label>
                <textarea
                  rows="3"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escribe aquí si deseas agregar algún dato o responder al técnico..."
                  className="w-full bg-white border border-slate-300 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#00877D]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={sendingReply}
                    className="px-5 py-2 rounded-xl bg-[#00877D] text-white text-xs font-bold flex items-center gap-2 hover:opacity-90 shadow-md"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {sendingReply ? 'Enviando...' : 'Enviar Mensaje'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </MainLayout>
  );
}