// client/src/pages/client/ClientHistoryPage.jsx
import { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import api from '../../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faCircleCheck, 
  faCalendarCheck, 
  faWrench, 
  faEye, 
  faXmark,
  faUserCheck,
  faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';

export default function ClientHistoryPage() {
  const [historyTickets, setHistoryTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'maintenance' | 'incidence'
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Comprobante / Resumen
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      // Filtramos únicamente los tickets y visitas que ya fueron finalizados
      const completed = (res.data || []).filter(
        t => t.status === 'closed' || t.status === 'resolved'
      );
      setHistoryTickets(completed);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por tipo de atención y búsqueda de texto
  const filteredHistory = historyTickets.filter(item => {
    const type = item.ticket_type || 'incidence';
    const matchesType = filterType === 'all' || type === filterType;
    const matchesSearch = searchTerm === '' ||
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  // Contadores rápidos para las tarjetas superiores
  const totalVisitas = historyTickets.filter(t => t.ticket_type === 'maintenance').length;
  const totalFallas = historyTickets.filter(t => t.ticket_type === 'incidence' || !t.ticket_type).length;

  return (
    <MainLayout title="Historial y Visitas Realizadas">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 1. TARJETAS DE RESUMEN RÁPIDO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-panel p-5 rounded-3xl border border-white/80 bg-white/60 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faClipboardCheck} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">Total Atenciones</div>
              <div className="text-2xl font-black text-slate-900">{historyTickets.length}</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-white/80 bg-white/60 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00877D]/15 text-[#00877D] flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">Visitas / Mantenimientos</div>
              <div className="text-2xl font-black text-slate-900">{totalVisitas}</div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-3xl border border-white/80 bg-white/60 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center text-xl">
              <FontAwesomeIcon icon={faWrench} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">Fallas Resueltas</div>
              <div className="text-2xl font-black text-slate-900">{totalFallas}</div>
            </div>
          </div>
        </div>

        {/* 2. BARRA DE BÚSQUEDA Y FILTRO SIMPLE */}
        <div className="glass-panel p-5 rounded-3xl border border-white/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por equipo, servicio o nombre del técnico..."
              className="w-full bg-white/80 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00877D]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todo el Historial' },
              { id: 'maintenance', label: '📅 Solo Visitas' },
              { id: 'incidence', label: '🛠️ Solo Fallas Resueltas' }
            ].map(btn => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilterType(btn.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  filterType === btn.id
                    ? 'bg-[#1E293B] text-white shadow-xs'
                    : 'bg-white/60 text-slate-600 hover:bg-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. LISTADO DE HISTORIAL */}
        <div className="space-y-3">
          {loading ? (
            <div className="glass-panel p-8 rounded-3xl text-center text-xs text-slate-500">
              Cargando historial de atenciones...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl text-center space-y-2 border border-white/80">
              <FontAwesomeIcon icon={faCircleCheck} className="text-3xl text-slate-400" />
              <h3 className="text-base font-black text-slate-900">Aún no hay registros en esta sección</h3>
              <p className="text-xs text-slate-500">
                Cuando nuestro equipo finalice una visita o repare una falla, aparecerá guardada aquí como comprobante.
              </p>
            </div>
          ) : (
            filteredHistory.map(record => (
              <div 
                key={record.id}
                className="glass-panel p-5 rounded-3xl border border-white/80 bg-white/60 hover:bg-white/90 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-black ${
                      record.ticket_type === 'maintenance' ? 'text-[#00877D]' : 'text-blue-600'
                    }`}>
                      {record.ticket_type === 'maintenance' ? '📅 Visita Técnica' : '🛠️ Reparación / Soporte'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#{record.id?.substring(0, 6)}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      • Fecha: {new Date(record.scheduled_date || record.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{record.subject}</h3>

                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUserCheck} className="text-[#00877D]" />
                    Atendido por: <strong className="text-slate-800">{record.profiles?.full_name || 'Equipo SAMANDTECH'}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold border bg-emerald-500/15 text-emerald-800 border-emerald-500/30 inline-flex items-center gap-1.5 whitespace-nowrap">
                    <FontAwesomeIcon icon={faCircleCheck} />
                    Completado
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedRecord(record)}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-[#1E293B] text-slate-700 hover:text-white border border-slate-300 text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    Ver comprobante
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* MODAL COMPROBANTE DE ATENCIÓN (SOLO LECTURA) */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/80 animate-fadeIn">
            
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#11C6EA]">
                  Comprobante de Servicio #{selectedRecord.id?.substring(0, 8)}
                </span>
                <h3 className="text-base font-extrabold mt-0.5">{selectedRecord.subject}</h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-4 bg-white/60 p-4 rounded-2xl border border-white">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Tipo de Servicio</span>
                  <span className="block font-extrabold text-slate-900 mt-1">
                    {selectedRecord.ticket_type === 'maintenance' ? '📅 Visita / Mantenimiento' : '🛠️ Soporte Técnico'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Especialista Asignado</span>
                  <span className="block font-extrabold text-slate-900 mt-1">
                    {selectedRecord.profiles?.full_name || 'Equipo SAMANDTECH'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Fecha de Solicitud</span>
                  <span className="block font-bold text-slate-700 mt-1">
                    {new Date(selectedRecord.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Estado Final</span>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                    COMPLETADO
                  </span>
                </div>
              </div>

              <div>
                <span className="block font-extrabold text-slate-700 mb-1">Detalle de lo solicitado:</span>
                <div className="bg-white/70 p-3.5 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedRecord.description || 'Sin descripción adicional registrada.'}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-white/60">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-5 py-2 rounded-xl bg-[#1E293B] text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Cerrar Comprobante
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </MainLayout>
  );
}