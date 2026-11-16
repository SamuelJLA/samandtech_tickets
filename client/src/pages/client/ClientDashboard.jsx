// client/src/pages/client/ClientDashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import MainLayout from '../../components/MainLayout';
import api from '../../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTriangleExclamation, 
  faCalendarCheck, 
  faCheck, 
  faXmark,
  faClock,
  faUserGear,
  faCircleCheck
} from '@fortawesome/free-solid-svg-icons';

export default function ClientDashboard() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal de creación amigable
  const [modalType, setModalType] = useState(null); // 'incidence' | 'maintenance' | null
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    description: '',
    isUrgent: false,
    scheduled_date: ''
  });

  useEffect(() => {
    loadMyTickets();
  }, []);

  const loadMyTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      setTickets(res.data || []);
    } catch (err) {
      console.error('Error al cargar tus solicitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = (type) => {
    setModalType(type);
    setForm({
      subject: '',
      description: '',
      isUrgent: false,
      scheduled_date: ''
    });
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        subject: form.subject,
        description: form.description,
        ticket_type: modalType,
        priority: form.isUrgent ? 'high' : 'medium',
        scheduled_date: modalType === 'maintenance' ? form.scheduled_date : null
      };

      const res = await api.post('/tickets', payload);
      setTickets(prev => [res.data, ...prev]);
      setModalType(null);
      alert('✅ ¡Solicitud enviada! Nuestro equipo técnico la atenderá pronto.');
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      alert('❌ Hubo un problema al enviar tu solicitud. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar las solicitudes que siguen en curso
  const activeTickets = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved');

  // Traducción de estados técnicos a lenguaje humano y claro
  const renderFriendlyStatus = (status) => {
    const map = {
      pending: { 
        text: 'Recibido — En espera de revisión', 
        style: 'bg-blue-500/15 text-blue-800 border-blue-500/30',
        icon: faClock
      },
      open: { 
        text: 'Recibido — En espera de revisión', 
        style: 'bg-blue-500/15 text-blue-800 border-blue-500/30',
        icon: faClock
      },
      in_progress: { 
        text: 'Un técnico está trabajando en esto', 
        style: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
        icon: faUserGear
      },
      on_hold: { 
        text: 'En pausa — Revisando detalles', 
        style: 'bg-purple-500/15 text-purple-800 border-purple-500/30',
        icon: faClock
      }
    };

    const current = map[status?.toLowerCase()] || map.pending;

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border inline-flex items-center gap-2 ${current.style}`}>
        <FontAwesomeIcon icon={current.icon} />
        {current.text}
      </span>
    );
  };

  return (
    <MainLayout title="Bienvenido a tu Portal de Soporte">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* SALUDO AMIGABLE */}
        <div className="glass-panel p-6 rounded-3xl border border-white/80 shadow-xs">
          <h2 className="text-xl font-black text-slate-900">
            ¡Hola, {user?.full_name || user?.nombre || 'Bienvenido'}! 👋
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            ¿En qué podemos ayudarte hoy? Selecciona una de las dos opciones principales para comenzar.
          </p>
        </div>

        {/* DOS TARJETAS GRANDES DE ACCIÓN DIRECTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta 1: Reportar Falla */}
          <button
            onClick={() => openRequestModal('incidence')}
            className="group text-left glass-panel p-7 rounded-3xl border-2 border-transparent hover:border-red-400/60 bg-white/70 hover:bg-white transition-all shadow-md hover:shadow-xl flex flex-col justify-between gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-red-600 transition-colors">
                Reportar un Problema
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                ¿No tienes internet, falla una impresora o tu computadora no enciende? Avísanos aquí para ayudarte rápido.
              </p>
            </div>
            <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider">
              Pedir ayuda ahora →
            </span>
          </button>

          {/* Tarjeta 2: Agendar Visita */}
          <button
            onClick={() => openRequestModal('maintenance')}
            className="group text-left glass-panel p-7 rounded-3xl border-2 border-transparent hover:border-[#00877D]/60 bg-white/70 hover:bg-white transition-all shadow-md hover:shadow-xl flex flex-col justify-between gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#00877D]/15 text-[#00877D] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-[#00877D] transition-colors">
                Agendar una Visita Técnica
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Programa un mantenimiento preventivo, limpieza de equipos o revisión en tus oficinas para el día que prefieras.
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#00877D] uppercase tracking-wider">
              Elegir fecha de visita →
            </span>
          </button>

        </div>

        {/* SOLICITUDES ACTUALMENTE EN CURSO */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-white/80 shadow-xs">
          <div className="p-5 border-b border-white/60 bg-white/30 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">
              📌 Tus Solicitudes en Curso ({activeTickets.length})
            </h3>
          </div>

          <div className="p-5">
            {loading ? (
              <p className="text-center text-xs text-slate-500 py-6">Cargando tus solicitudes...</p>
            ) : activeTickets.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <FontAwesomeIcon icon={faCircleCheck} className="text-3xl text-emerald-500" />
                <p className="text-sm font-bold text-slate-800">¡Todo está funcionando al día!</p>
                <p className="text-xs text-slate-500">No tienes fallas ni visitas pendientes en este momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white/70 p-4 rounded-2xl border border-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#00877D]">
                          {ticket.ticket_type === 'maintenance' ? '📅 Visita Programada' : '🚨 Reporte de Falla'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">#{ticket.id?.substring(0, 6)}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">{ticket.subject}</h4>
                      {ticket.profiles?.full_name && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          Técnico asignado: <strong className="text-slate-800">{ticket.profiles.full_name}</strong>
                        </p>
                      )}
                    </div>

                    <div>
                      {renderFriendlyStatus(ticket.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL AMIGABLE PARA CREAR SOLICITUD O AGENDAR VISITA */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/80 animate-fadeIn">
            
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-extrabold">
                {modalType === 'incidence' ? '🚨 Cuéntanos qué problema tienes' : '📅 Agenda tu Visita Técnica'}
              </h3>
              <button 
                onClick={() => setModalType(null)} 
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  {modalType === 'incidence' ? '¿Qué está fallando?' : '¿Qué servicio o revisión necesitas? *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={modalType === 'incidence' ? 'Ej: La impresora de recepción no imprime' : 'Ej: Revisión general de 3 computadoras'}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#00877D]"
                />
              </div>

              {modalType === 'maintenance' && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    ¿Qué día te gustaría que vayamos? *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.scheduled_date}
                    onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#00877D]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Explícanos un poco más con tus palabras
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ej: Desde esta mañana enciende una luz naranja y no saca las hojas..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#00877D]"
                />
              </div>

              {modalType === 'incidence' && (
                <label className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isUrgent}
                    onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-red-900">
                    Es urgente (Me impide seguir trabajando)
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/60">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)} 
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#00877D] text-white font-bold text-xs flex items-center gap-2 hover:opacity-90 shadow-md"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </MainLayout>
  );
}