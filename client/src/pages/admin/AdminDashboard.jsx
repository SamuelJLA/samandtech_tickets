// client/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import api from '../../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faPenToSquare, 
  faPlus, 
  faCalendarDays, 
  faChevronLeft, 
  faChevronRight,
  faXmark,
  faUserGear,
  faBuilding,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal Gestión de Ticket
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [modalForm, setModalForm] = useState({
    status: '',
    assigned_to: '',
    client_id: '',
    note: ''
  });

  // Modal Nuevo Ticket
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    description: '',
    ticket_type: 'incidence',
    priority: 'medium',
    client_id: '',
    scheduled_date: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [resTickets, resCompanies, resUsers] = await Promise.all([
        api.get('/tickets'),
        api.get('/companies').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] }))
      ]);

      setTickets(resTickets.data || []);
      setCompanies(resCompanies.data || []);
      
      const availableTechs = (resUsers.data || []).filter(u => u.role === 'tech' || u.role === 'admin');
      setTechs(availableTechs);
    } catch (err) {
      console.error('Error cargando datos centralizados:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. En la función openTicketModal, inicializa el subcampo 'on_hold_reason'
  const openTicketModal = (ticket, readOnlyMode = false) => {
  setSelectedTicket(ticket);
  setIsReadOnly(readOnlyMode); // 👈 Guardamos si es solo lectura
  setModalForm({
    status: ticket.status || 'pending',
    assigned_to: ticket.assigned_to || '',
    client_id: ticket.client_id || '',
    note: '',
    on_hold_reason: ticket.on_hold_reason || ''
  });
  setIsModalOpen(true);
};

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setUpdating(true);
      const updated = await api.patch(`/tickets/${selectedTicket.id}`, modalForm);
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updated.data : t));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error al actualizar el ticket:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await api.post('/tickets', newTicketForm);
      setTickets(prev => [res.data, ...prev]);
      setIsNewTicketModalOpen(false);
      setNewTicketForm({
        subject: '',
        description: '',
        ticket_type: 'incidence',
        priority: 'medium',
        client_id: '',
        scheduled_date: ''
      });
    } catch (err) {
      console.error('Error al crear ticket:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Excluimos 'closed' y 'resolved' para que solo aparezcan tickets activos en el Dashboard
  const incidencias = tickets.filter(t => 
    (t.ticket_type === 'incidence' || !t.ticket_type) && 
    t.status !== 'closed' && 
    t.status !== 'resolved'
  );

  const mantenimientos = tickets.filter(t => 
    t.ticket_type === 'maintenance' && 
    t.status !== 'closed' && 
    t.status !== 'resolved'
  );

  // Lógica de Calendario
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // 1. Actualizar el helper de formateo de estado (formatStatus)
const formatStatus = (status) => {
  const statusMap = {
    pending: { label: 'Por Atender', class: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
    open: { label: 'Por Atender', class: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
    in_progress: { label: 'En Proceso', class: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
    on_hold: { label: 'En Espera', class: 'bg-purple-500/15 text-purple-700 border-purple-500/30' },
    resolved: { label: 'Finalizado', class: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
    closed: { label: 'Finalizado', class: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
    cancelled: { label: 'Cancelado', class: 'bg-gray-500/15 text-gray-600 border-gray-500/30' }
  };

  const current = statusMap[status?.toLowerCase()] || {
    label: status || 'Por Atender',
    class: 'bg-slate-500/15 text-slate-700 border-slate-500/30'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border whitespace-nowrap inline-flex items-center justify-center min-w-max ${current.class}`}>
      {current.label}
    </span>
  );
};

  return (
    <MainLayout title="Dashboard de Tickets & Operaciones">
      <div className="space-y-6">

        {/* 1. MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border-l-4 border-l-blue-500">
          <div className="text-slate-600 text-xs font-bold uppercase tracking-wider">Tickets Por Atender</div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {tickets.filter(t => t.status === 'pending').length}
          </div>
        </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border-l-4 border-l-red-500">
            <div className="text-slate-600 text-xs font-bold uppercase tracking-wider">Incidencias Críticas</div>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {tickets.filter(t => t.priority === 'critical').length}
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border-l-4 border-l-[#00877D]">
            <div className="text-slate-600 text-xs font-bold uppercase tracking-wider">Mantenimientos Mes</div>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {mantenimientos.length}
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border-l-4 border-l-[#11C6EA]">
            <div className="text-slate-600 text-xs font-bold uppercase tracking-wider">Empresas Conectadas</div>
            <div className="text-3xl font-black text-slate-900 mt-2">{companies.length}</div>
          </div>
        </div>

        {/* 2. TABLAS PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* INCIDENCIAS */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/60 flex items-center justify-between bg-white/20">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm tracking-wide">
                ⚠️ Incidencias y Requerimientos
              </h3>
              <button 
                onClick={() => {
                  setNewTicketForm(prev => ({ ...prev, ticket_type: 'incidence' }));
                  setIsNewTicketModalOpen(true);
                }}
                className="bg-[#1E293B] hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3 text-[#11C6EA]" />
                Nuevo Ticket
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-white/30 text-slate-600 font-bold uppercase border-b border-white/40">
                  <tr>
                    <th className="p-3.5">Ticket</th>
                    <th className="p-3.5">Empresa Cliente</th>
                    <th className="p-3.5">Asunto</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  {incidencias.length === 0 ? (
                    <tr><td colSpan="5" className="p-6 text-center text-slate-500">Sin incidencias registradas.</td></tr>
                  ) : (
                    incidencias.slice(0, 5).map(t => (
                      <tr key={t.id} className="hover:bg-white/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#00877D]">#{t.id?.substring(0, 5)}</td>
                        <td className="p-3.5 font-bold text-slate-800">
                          {t.companies?.name || 'Cliente Directo'}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900">{t.subject}</td>
                        <td className="p-3.5">{formatStatus(t.status)}</td>
                        <td className="p-3.5 text-right flex items-center justify-end gap-1.5">
                          {/* Botón SOLO LECTURA (Ojo) */}
                          <button 
                            onClick={() => openTicketModal(t, true)}
                            title="Ver Detalle (Solo Lectura)" 
                            className="w-7 h-7 rounded-lg bg-white/60 hover:bg-[#11C6EA] hover:text-slate-900 text-slate-600 transition-all shadow-xs border border-white/80 inline-flex items-center justify-center"
                          >
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón EDITAR (Libreta) */}
                          <button 
                            onClick={() => openTicketModal(t, false)}
                            title="Gestionar / Editar Ticket" 
                            className="w-7 h-7 rounded-lg bg-white/60 hover:bg-[#00877D] hover:text-white text-slate-600 transition-all shadow-xs border border-white/80 inline-flex items-center justify-center"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MANTENIMIENTOS */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/60 flex items-center justify-between bg-white/20">
              <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm tracking-wide">
                🛠️ Mantenimientos Programados
              </h3>
              <button 
                onClick={() => {
                  setNewTicketForm(prev => ({ ...prev, ticket_type: 'maintenance' }));
                  setIsNewTicketModalOpen(true);
                }}
                className="bg-[#1E293B] hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faPlus} className="w-3 h-3 text-[#11C6EA]" />
                Programar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="bg-white/30 text-slate-600 font-bold uppercase border-b border-white/40">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Empresa Cliente</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Técnico Asignado</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30">
                  {mantenimientos.length === 0 ? (
                    <tr><td colSpan="5" className="p-6 text-center text-slate-500">Sin mantenimientos programados.</td></tr>
                  ) : (
                    mantenimientos.slice(0, 5).map(m => (
                      <tr key={m.id} className="hover:bg-white/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#00877D]">#{m.id?.substring(0, 5)}</td>
                        <td className="p-3.5 font-bold text-slate-800">{m.companies?.name || 'Cliente Directo'}</td>
                        <td className="p-3.5 text-slate-600">{new Date(m.created_at).toLocaleDateString()}</td>
                        <td className="p-3.5 font-medium text-slate-800">
                          {m.profiles?.full_name || 'Sin Asignar'}
                        </td>
                        <td className="p-3.5 text-right flex items-center justify-end gap-1.5">
                        {/* Botón SOLO LECTURA (Ojo) */}
                        <button 
                          onClick={() => openTicketModal(m, true)}
                          title="Ver Detalle (Solo Lectura)" 
                          className="w-7 h-7 rounded-lg bg-white/60 hover:bg-[#11C6EA] hover:text-slate-900 text-slate-600 transition-all shadow-xs border border-white/80 inline-flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón EDITAR (Libreta) */}
                        <button 
                          onClick={() => openTicketModal(m, false)}
                          title="Gestionar / Editar Mantenimiento" 
                          className="w-7 h-7 rounded-lg bg-white/60 hover:bg-[#00877D] hover:text-white text-slate-600 transition-all shadow-xs border border-white/80 inline-flex items-center justify-center"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* 3. CRONOGRAMA */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/60">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm tracking-wide">
              <FontAwesomeIcon icon={faCalendarDays} className="text-[#00877D]" />
              Cronograma de Operaciones SAMANDTECH
            </h3>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-800">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <div className="flex gap-1">
                <button onClick={handlePrevMonth} className="w-7 h-7 rounded-lg bg-white/60 hover:bg-[#1E293B] hover:text-white text-slate-700 border border-white/80 inline-flex items-center justify-center">
                  <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                </button>
                <button onClick={handleNextMonth} className="w-7 h-7 rounded-lg bg-white/60 hover:bg-[#1E293B] hover:text-white text-slate-700 border border-white/80 inline-flex items-center justify-center">
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-600 uppercase mb-2">
            <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 bg-white/10 rounded-xl border border-white/20"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayTickets = tickets.filter(t => (t.scheduled_date || t.created_at)?.substring(0, 10) === dateStr);

              return (
                <div key={day} className="h-20 bg-white/30 backdrop-blur-xs rounded-xl p-1.5 border border-white/50 flex flex-col justify-between hover:bg-white/50 transition-colors">
                  <div className="text-right text-[11px] font-extrabold text-slate-700">{day}</div>
                  <div className="space-y-1 overflow-y-auto max-h-12">
                    {dayTickets.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => openTicketModal(t)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate text-white cursor-pointer hover:opacity-80 transition-opacity ${
                          t.ticket_type === 'maintenance' ? 'bg-[#00877D]' : 'bg-red-500'
                        }`}
                        title={`${t.companies?.name || 'Cliente'}: ${t.subject}`}
                      >
                        {t.ticket_type === 'maintenance' ? '🛠️' : '⚠️'} {t.companies?.name || 'Cliente'}: {t.subject}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MODAL GESTIÓN DE TICKET (MODO SOLO LECTURA Y EDICIÓN) */}
        {isModalOpen && selectedTicket && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-white/80">
              
              {/* Header del Modal */}
              <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#11C6EA]">
                    {isReadOnly ? '👁️ Detalle del Ticket' : '✏️ Gestión de Ticket'} #{selectedTicket.id?.substring(0, 8)}
                  </span>
                  <h3 className="text-base font-extrabold mt-0.5">{selectedTicket.subject}</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateTicket} className="p-6 space-y-4">
                
                {/* Empresa y Estado del Ticket */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faBuilding} className="text-[#00877D]" />
                      Empresa Cliente
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={modalForm.client_id}
                      onChange={(e) => setModalForm({ ...modalForm, client_id: e.target.value })}
                      className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D] disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Cliente Directo (Sin Empresa)</option>
                      {companies.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estado del Ticket</label>
                    <select
                      disabled={isReadOnly}
                      value={modalForm.status}
                      onChange={(e) => setModalForm({ 
                        ...modalForm, 
                        status: e.target.value,
                        on_hold_reason: e.target.value === 'on_hold' ? modalForm.on_hold_reason : ''
                      })}
                      className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D] disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="pending">Por Atender</option>
                      <option value="in_progress">En Proceso</option>
                      <option value="on_hold">En Espera</option>
                      <option value="closed">Finalizado</option>
                    </select>
                  </div>
                </div>

                {/* Subcampo condicional: Motivo de Espera (Solo visible si el status es 'on_hold') */}
                {modalForm.status === 'on_hold' && (
                  <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-xl transition-all">
                    <label className="block text-xs font-bold text-purple-900 mb-1">
                      ⏳ Motivo de la Espera (Pausa de SLA)
                    </label>
                    <select
                      disabled={isReadOnly}
                      value={modalForm.on_hold_reason}
                      onChange={(e) => setModalForm({ ...modalForm, on_hold_reason: e.target.value })}
                      className="w-full bg-white border border-purple-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-purple-600 disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Seleccionar causa de la pausa --</option>
                      <option value="user_pending">Por el Usuario (Respuesta, pruebas o aprobación)</option>
                      <option value="vendor_pending">Por Proveedor / Tercero (Falla de ISP, garantía, repuestos)</option>
                    </select>
                  </div>
                )}

                {/* Técnico Asignado */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <FontAwesomeIcon icon={faUserGear} className="text-[#00877D]" />
                    Técnico Responsable
                  </label>
                  <select
                    disabled={isReadOnly}
                    value={modalForm.assigned_to}
                    onChange={(e) => setModalForm({ ...modalForm, assigned_to: e.target.value })}
                    className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D] disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Sin Asignar</option>
                    {techs.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.full_name} ({tech.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nota de Avance */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nota de Avance / Observación
                  </label>
                  <textarea
                    disabled={isReadOnly}
                    rows="3"
                    value={modalForm.note}
                    onChange={(e) => setModalForm({ ...modalForm, note: e.target.value })}
                    className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00877D] transition-all disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    placeholder={isReadOnly ? "Sin notas adicionales registradas." : "Escribe un apunte breve del trabajo realizado..."}
                  />
                </div>

                {/* Pie del Modal: Botón dinámico según modo lectura u edición */}
                <div className="flex justify-end gap-3 pt-3 border-t border-white/60">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all"
                  >
                    {isReadOnly ? 'Cerrar' : 'Cancelar'}
                  </button>

                  {!isReadOnly && (
                    <button 
                      type="submit" 
                      disabled={updating} 
                      className="px-5 py-2 rounded-xl bg-[#1E293B] text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faCheck} className="text-[#11C6EA]" />
                      {updating ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>
        )}

        {/* MODAL CREAR TICKET */}
        {isNewTicketModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/80">
              <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
                <h3 className="text-base font-extrabold">
                  {newTicketForm.ticket_type === 'maintenance' ? '🛠️ Programar Mantenimiento' : '⚠️ Registrar Nuevo Ticket'}
                </h3>
                <button onClick={() => setIsNewTicketModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center">
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Empresa Cliente *</label>
                  <select
                    required
                    value={newTicketForm.client_id}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, client_id: e.target.value })}
                    className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                  >
                    <option value="">-- Seleccionar Empresa --</option>
                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asunto / Título *</label>
                  <input
                    type="text"
                    required
                    value={newTicketForm.subject}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                    className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00877D]"
                    placeholder="Ej: Mantenimiento preventivo Servidor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad</label>
                    <select
                      value={newTicketForm.priority}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                      className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Programada</label>
                    <input
                      type="date"
                      value={newTicketForm.scheduled_date}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, scheduled_date: e.target.value })}
                      className="w-full bg-white/70 border border-slate-300 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-[#00877D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                  <textarea
                    rows="2"
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                    className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00877D]"
                    placeholder="Detalles técnicos..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-white/60">
                  <button type="button" onClick={() => setIsNewTicketModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold">
                    Cancelar
                  </button>
                  <button type="submit" disabled={updating} className="px-5 py-2 rounded-xl bg-[#1E293B] text-white font-bold text-xs flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="text-[#11C6EA]" />
                    {updating ? 'Guardando...' : 'Crear Ticket'}
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