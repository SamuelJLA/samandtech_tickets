import { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import api from '../../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen,
  faBriefcase,
  faServer,
  faClock,
  faCheckCircle,
  faEye,
  faXmark,
  faPaperPlane,
  faBuilding,
  faUser,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL'); // 'ALL' | 'HARDWARE' | 'SERVICE' | 'PENDING'
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de gestión del pedido
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('open');
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      const allTickets = Array.isArray(res.data) ? res.data : (res.data?.tickets || []);

      // Filtramos los que entran como requerimientos comerciales / pedidos
      const requirements = allTickets.filter(t =>
        t.ticket_type === 'requirement' ||
        t.subject?.includes('[Solicitud de Cotización]') ||
        t.subject?.includes('[Cotización Pieza Específica]') ||
        t.subject?.includes('[Proyecto / Servicio]')
      );

      setOrders(requirements);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrderType = (subject = '') => {
    if (subject.includes('[Proyecto / Servicio]')) return 'SERVICE';
    return 'HARDWARE';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
      case 'open':
        return { label: 'Pendiente por Cotizar', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'in_progress':
        return { label: 'Cotizado / En Gestión', classes: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'resolved':
      case 'closed':
        return { label: 'Aprobado / Entregado', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: status, classes: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const openManageModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
    setAdminNote('');
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      // Actualiza el estado del requerimiento en el backend
      await api.patch(`/tickets/${selectedOrder.id}`, {
        status: newStatus,
        ...(adminNote.trim() ? { note: adminNote } : {})
      });

      await fetchOrders();
      setSelectedOrder(null);
      setAdminNote('');
    } catch (err) {
      console.error('Error actualizando pedido:', err);
      alert('No se pudo actualizar el estado del pedido.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const type = getOrderType(order.subject);
    const companyName = order.companies?.name || order.company_name || '';
    const matchesCat =
      filterCategory === 'ALL' ||
      (filterCategory === 'HARDWARE' && type === 'HARDWARE') ||
      (filterCategory === 'SERVICE' && type === 'SERVICE') ||
      (filterCategory === 'PENDING' && (order.status === 'pending' || order.status === 'open'));

    const matchesSearch =
      searchTerm === '' ||
      order.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCat && matchesSearch;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending' || o.status === 'open').length,
    hardware: orders.filter(o => getOrderType(o.subject) === 'HARDWARE').length,
    services: orders.filter(o => getOrderType(o.subject) === 'SERVICE').length
  };

  return (
    <MainLayout title="Gestión de Pedidos & Consumibles">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TARJETAS DE RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Solicitudes</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase">Pendientes</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.pending}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#00877D] uppercase">Hardware y Piezas</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.hardware}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#00877D]/10 text-[#00877D] flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faServer} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase">Servicios / Proyectos</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.services}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-lg">
              <FontAwesomeIcon icon={faBriefcase} />
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS Y BÚSQUEDA */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'PENDING', label: 'Pendientes' },
              { id: 'HARDWARE', label: 'Hardware y Piezas' },
              { id: 'SERVICE', label: 'Servicios y Proyectos' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                  filterCategory === tab.id
                    ? 'bg-[#1E293B] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-3 text-slate-400 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, empresa o equipo..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#00877D]"
            />
          </div>
        </div>

        {/* LISTADO DE PEDIDOS / REQUERIMIENTOS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-500">
              Cargando requerimientos comerciales...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm font-extrabold text-slate-800">
                No hay solicitudes de pedidos en esta categoría
              </p>
              <p className="text-xs text-slate-500">
                Cuando un cliente solicite equipos, repuestos o proyectos desde su portal, aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map(order => {
                const isService = getOrderType(order.subject) === 'SERVICE';
                const badge = getStatusBadge(order.status);

                return (
                  <div
                    key={order.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          #{order.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isService
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-[#00877D]/10 text-[#00877D] border border-[#00877D]/20'
                        }`}>
                          {isService ? 'Proyecto / Servicio' : 'Hardware / Piezas'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.classes}`}>
                          {badge.label}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-slate-900">
                        {order.subject}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {(order.companies?.name || order.company_name) && (
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <FontAwesomeIcon icon={faBuilding} className="text-slate-400 w-3 h-3" />
                            {order.companies?.name || order.company_name}
                          </span>
                        )}
                        {order.client_name && (
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faUser} className="text-slate-400 w-3 h-3" />
                            {order.client_name}
                          </span>
                        )}
                        {order.created_at && (
                          <span>
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openManageModal(order)}
                      className="px-4 py-2.5 rounded-xl bg-[#1E293B] hover:bg-[#00877D] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0"
                    >
                      <FontAwesomeIcon icon={faEye} />
                      <span>Ver Detalle y Gestionar</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* MODAL DETALLE Y GESTIÓN DEL PEDIDO */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#11C6EA]">
                  Requerimiento #{selectedOrder.id}
                </span>
                <h3 className="text-base font-extrabold">{selectedOrder.subject}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleUpdateOrder} className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="block text-[11px] font-bold uppercase text-slate-400">
                  Detalle solicitado por el cliente
                </span>
                <pre className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedOrder.description}
                </pre>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Estado del Pedido / Cotización
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00877D]"
                >
                  <option value="pending">Pendiente por Cotizar</option>
                  <option value="in_progress">Cotizado / En Proceso de Entrega</option>
                  <option value="resolved">Completado / Entregado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nota comercial o respuesta de cotización (Opcional)
                </label>
                <textarea
                  rows="3"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ej: Cotización #104 enviada al correo del cliente. Tiempo de entrega estimado: 24h..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#00877D]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-[#00877D] hover:bg-[#00736A] text-white text-xs font-bold flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  {updating ? 'Guardando...' : 'Actualizar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}