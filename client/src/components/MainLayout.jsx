// client/src/components/MainLayout.jsx
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTicket, 
  faUsers, 
  faShoppingCart, 
  faChartLine, 
  faGear, 
  faRightFromBracket, 
  faShieldHalved,
  faHouse,
  faClipboardList,
  faClockRotateLeft,
  faWandMagicSparkles
} from '@fortawesome/free-solid-svg-icons';

export default function MainLayout({ children, title }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Normalizamos el rol para evitar problemas entre 'role' y 'rol'
  const userRole = (user?.role || user?.rol || 'client').toLowerCase();

  // Opciones de menú para personal interno (Admin / Tech)
  const internalMenuItems = [
    { name: 'Tickets', path: '/admin', icon: faTicket, roles: ['admin', 'tech'] },
    { name: 'Clientes', path: '/companies', icon: faUsers, roles: ['admin'] },
    { name: 'Pedidos', path: '/orders', icon: faShoppingCart, roles: ['admin', 'tech'] },
    { name: 'Reportes', path: '/reports', icon: faChartLine, roles: ['admin', 'tech'] },
    { name: 'Configuración', path: '/settings', icon: faGear, roles: ['admin', 'tech'] },
  ];

  // Opciones de menú simplificadas para el Cliente
  const clientMenuItems = [
    { name: 'Inicio', path: '/client', icon: faHouse, roles: ['client'] },
    { name: 'Mis Solicitudes', path: '/client/requests', icon: faClipboardList, roles: ['client'] },
    { name: 'Historial y Visitas', path: '/client/history', icon: faClockRotateLeft, roles: ['client'] },
    { name: 'Servicios Adicionales', path: '/client/services', icon: faWandMagicSparkles, roles: ['client'] },
    { name: 'Mi Perfil', path: '/settings', icon: faGear, roles: ['client'] },
  ];

  const menuItems = userRole === 'client' ? clientMenuItems : internalMenuItems;

  return (
    <div className="min-h-screen bg-[#EAF4F9] text-slate-800 flex font-sans selection:bg-[#11C6EA]/20">
      {/* SIDEBAR ENTERPRISE ELEGANTE */}
      <aside className="w-64 h-screen sticky top-0 shrink-0 bg-[#1E293B] text-slate-300 flex flex-col justify-between p-4 shadow-2xl z-20 border-r border-slate-700/30">
        <div className="flex-1 overflow-y-auto pr-1">
          {/* ISOTIPO & HEADER CORPORATIVO */}
          <div className="mb-8 px-2 py-1 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00877D] to-[#11C6EA] flex items-center justify-center text-slate-950 font-black tracking-tighter shadow-md shadow-[#11C6EA]/10 border border-white/20 shrink-0">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-widest text-white leading-none">
                SAMANDTECH
              </span>
              <span className="text-[10px] text-[#11C6EA] font-semibold tracking-wider uppercase mt-1">
                {userRole === 'admin' ? 'Enterprise Admin' : userRole === 'tech' ? 'Soporte Técnico' : 'Portal de Clientes'}
              </span>
            </div>
          </div>

          {/* MENÚ DE NAVEGACIÓN PULIDO */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {userRole === 'client' ? 'Menú Principal' : 'Navegación'}
            </div>
            {menuItems.map((item) => {
              if (item.roles && !item.roles.includes(userRole)) return null;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium outline-none focus:outline-none transition-colors duration-150 group relative ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold border border-slate-700/80'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-[#11C6EA] to-[#00877D] rounded-r-full" />
                  )}

                  <FontAwesomeIcon 
                    icon={item.icon} 
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#11C6EA]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* PERFIL & CERRAR SESIÓN (FIJO ABAJO) */}
        <div className="border-t border-slate-800 pt-4 px-1 shrink-0 bg-[#1E293B]">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-slate-200 text-xs shadow-inner shrink-0">
              {(user?.full_name || user?.nombre || 'U').charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-100 truncate">
                {user?.full_name || user?.nombre || 'Usuario'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium capitalize flex items-center gap-1">
                <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#00877D]" />
                {userRole === 'client' ? 'Cliente' : userRole}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-slate-800/60 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700/50 hover:border-red-500/30 text-xs font-medium py-2 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE TRABAJO PASTEL / GLASS */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-[#EAF4F9] via-[#E2F1F8] to-[#DBEFEF]">
        <header className="h-16 bg-white/60 backdrop-blur-md border-b border-white/80 flex items-center justify-between px-8 shadow-xs">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
          <div className="flex items-center gap-2.5 bg-white/70 px-3.5 py-1.5 rounded-full border border-white/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-700">Sistema Activo</span>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}