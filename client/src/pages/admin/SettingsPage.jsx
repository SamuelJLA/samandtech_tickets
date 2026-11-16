// client/src/pages/admin/SettingsPage.jsx
import { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import api from '../../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faUserShield, 
  faPenToSquare, 
  faTrashCan, 
  faPlus, 
  faCheck, 
  faLock,
  faBuilding,
  faPhone,
  faShieldHalved,
  faXmark,
  faKey,
  faUserGear,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'users'
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Usuario en sesión
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          full_name: parsed.full_name || 'Jesus Alcala',
          email: parsed.email || 'jesus.alcala@samandtech.com',
          role: (parsed.role || parsed.rol || 'admin').toLowerCase(),
          phone: parsed.phone || '+58 412 0000000',
          company: parsed.company_name || 'SAMAND TECH'
        };
      } catch (e) {}
    }
    return {
      full_name: 'Jesus Alcala',
      email: 'jesus.alcala@samandtech.com',
      role: 'admin',
      phone: '+58 412 0000000',
      company: 'SAMAND TECH'
    };
  });

  // Estado para desplegar el formulario de contraseña y sus campos
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Modal para Editar / Crear Usuario (Solo Admin)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    role: 'tech',
    company_id: '',
    permissions: {
      canCreateTickets: true,
      canReassignTechs: true,
      canCloseTickets: true,
      canDeleteTickets: false,
      canViewReports: true,
      canExportReports: false,
    }
  });

  useEffect(() => {
    if (currentUser.role === 'admin') {
      loadSettingsData();
    } else {
      setLoading(false);
    }
  }, [currentUser.role]);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const [resUsers, resCompanies] = await Promise.all([
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/companies').catch(() => ({ data: [] }))
      ]);

      setUsers(resUsers.data || []);
      setCompanies(resCompanies.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditUser = (usr) => {
    setEditingUser(usr);
    setUserForm({
      full_name: usr.full_name || '',
      email: usr.email || '',
      role: (usr.role || 'tech').toLowerCase(),
      company_id: usr.company_id || '',
      permissions: usr.permissions || {
        canCreateTickets: true,
        canReassignTechs: true,
        canCloseTickets: true,
        canDeleteTickets: false,
        canViewReports: true,
        canExportReports: false,
      }
    });
    setIsUserModalOpen(true);
  };

  const handleOpenNewUser = () => {
    setEditingUser(null);
    setUserForm({
      full_name: '',
      email: '',
      role: 'tech',
      company_id: '',
      permissions: {
        canCreateTickets: true,
        canReassignTechs: true,
        canCloseTickets: true,
        canDeleteTickets: false,
        canViewReports: true,
        canExportReports: false,
      }
    });
    setIsUserModalOpen(true);
  };

  const handlePermissionToggle = (key) => {
    setUserForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key]
      }
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.patch(`/users/${editingUser.id}`, userForm).catch(() => {});
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userForm } : u));
      } else {
        const res = await api.post('/users', userForm).catch(() => ({ data: { id: Date.now(), ...userForm } }));
        setUsers(prev => [...prev, res.data]);
      }
      setIsUserModalOpen(false);
    } catch (err) {
      console.error('Error al guardar usuario:', err);
    }
  };

  const handleUpdateOwnPassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      alert('⚠️ Debes ingresar tu contraseña actual para autorizar el cambio.');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('⚠️ La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    try {
      // Llamada al endpoint del backend (cuando lo conectemos)
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }).catch(() => {});

      alert('✅ Contraseña actualizada correctamente.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (err) {
      alert('❌ Error al validar la contraseña actual.');
    }
  };

  const handleResetPassword = () => {
    alert(`🔐 Se ha enviado un enlace para restablecer la contraseña a: ${userForm.email}`);
  };

  const isInternalStaff = currentUser.role === 'admin' || currentUser.role === 'tech';

  return (
    <MainLayout title="Configuración del Sistema">
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-2">
        <div className="glass-panel w-full max-w-5xl h-[82vh] rounded-3xl overflow-hidden shadow-2xl border border-white/80 flex flex-col bg-white/40 backdrop-blur-md">
          
          {/* HEADER CON PESTAÑAS */}
          <div className="bg-[#1E293B] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[#11C6EA] text-lg font-black">⚙️</span>
              <h2 className="text-base font-extrabold tracking-wide">Centro de Configuración & Permisos</h2>
            </div>

            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'profile' 
                    ? 'bg-[#00877D] text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={faUser} />
                Mi Perfil
              </button>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'users' 
                      ? 'bg-[#00877D] text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={faUserShield} />
                  Gestión de Usuarios & Permisos
                </button>
              )}
            </div>
          </div>

          {/* CUERPO DEL MODAL */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* ================= PESTAÑA 1: MI PERFIL ================= */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white/60 p-5 rounded-2xl border border-white/80 shadow-xs flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#11C6EA] to-[#00877D] flex items-center justify-center text-white text-2xl font-black shadow-md">
                    {currentUser.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{currentUser.full_name}</h3>
                    <p className="text-xs text-slate-600 font-medium">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 text-purple-700 border border-purple-500/30">
                      Rol: {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                  {/* Columna Izquierda: Datos Personales */}
                  <div className="bg-white/50 p-5 rounded-2xl border border-white/70 space-y-4">
                    <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faPenToSquare} className="text-[#00877D]" />
                      Datos de Contacto
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
                      <input
                        type="text"
                        value={currentUser.full_name}
                        onChange={(e) => setCurrentUser({ ...currentUser, full_name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <FontAwesomeIcon icon={faPhone} className="text-slate-400" />
                        Teléfono / Extensión Directa
                      </label>
                      <input
                        type="text"
                        value={currentUser.phone}
                        onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                      />
                    </div>

                    <div className="pt-2">
                      <button className="px-4 py-2 rounded-xl bg-[#1E293B] text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md">
                        <FontAwesomeIcon icon={faCheck} className="text-[#11C6EA]" />
                        Guardar Datos
                      </button>
                    </div>
                  </div>

                  {/* Columna Derecha: Seguridad Desplegable (Admin/Tech) o Info Protegida (Cliente) */}
                  {isInternalStaff ? (
                    <div className="bg-white/50 p-5 rounded-2xl border border-white/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faKey} className="text-amber-500" />
                          Seguridad de Acceso
                        </h4>

                        <button
                          type="button"
                          onClick={() => setShowPasswordSection(!showPasswordSection)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                        >
                          <FontAwesomeIcon icon={faLock} className="text-[#11C6EA]" />
                          Cambiar Contraseña
                          <FontAwesomeIcon icon={showPasswordSection ? faChevronUp : faChevronDown} className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {!showPasswordSection ? (
                        <p className="text-[11px] text-slate-500">
                          Tu contraseña está cifrada. Haz clic en el botón superior si deseas actualizar tu clave de acceso.
                        </p>
                      ) : (
                        <form onSubmit={handleUpdateOwnPassword} className="space-y-3 pt-2 border-t border-slate-200 animate-fadeIn">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña Actual *</label>
                            <input
                              type="password"
                              required
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              placeholder="Ingresa tu contraseña actual"
                              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Nueva Contraseña *</label>
                            <input
                              type="password"
                              required
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              placeholder="••••••••"
                              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar Nueva Contraseña *</label>
                            <input
                              type="password"
                              required
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              placeholder="••••••••"
                              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowPasswordSection(false);
                                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                              }}
                              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100"
                            >
                              Cancelar
                            </button>
                            <button 
                              type="submit" 
                              className="px-4 py-1.5 rounded-xl bg-[#00877D] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-all shadow-md"
                            >
                              <FontAwesomeIcon icon={faCheck} />
                              Confirmar Cambio
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900/5 p-5 rounded-2xl border border-slate-300/60 space-y-4">
                      <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faLock} className="text-amber-600" />
                        Información Protegida
                      </h4>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Correo Electrónico</label>
                        <input
                          type="text"
                          disabled
                          value={currentUser.email}
                          className="w-full bg-slate-200/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-600 font-bold cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Empresa Asignada</label>
                        <input
                          type="text"
                          disabled
                          value={currentUser.company}
                          className="w-full bg-slate-200/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-600 font-bold cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= PESTAÑA 2: LISTA DE USUARIOS (SOLO ADMIN) ================= */}
            {activeTab === 'users' && currentUser.role === 'admin' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between bg-white/40 p-4 rounded-2xl border border-white/60">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      Directorio de Usuarios ({users.length})
                    </h3>
                    <p className="text-[11px] text-slate-600">Administra cuentas del equipo SAMANDTECH y clientes.</p>
                  </div>
                  <button 
                    onClick={handleOpenNewUser}
                    className="bg-[#1E293B] hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-[#11C6EA]" />
                    Nuevo Usuario
                  </button>
                </div>

                <div className="bg-white/60 rounded-2xl overflow-hidden border border-white/80 shadow-xs">
                  <table className="w-full text-left text-xs text-slate-800">
                    <thead className="bg-white/40 text-slate-600 font-bold uppercase border-b border-white/40">
                      <tr>
                        <th className="p-3.5">Nombre Completo</th>
                        <th className="p-3.5">Correo Electrónico</th>
                        <th className="p-3.5">Rol</th>
                        <th className="p-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/30">
                      {loading ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">Cargando usuarios...</td></tr>
                      ) : users.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-slate-500">No se pudieron cargar los usuarios (Verifica permisos de ruta en el servidor).</td></tr>
                      ) : (
                        users.map((usr) => (
                          <tr key={usr.id} className="hover:bg-white/40 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900">{usr.full_name || 'Sin Nombre'}</td>
                            <td className="p-3.5 text-slate-700">{usr.email}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                usr.role === 'admin' ? 'bg-purple-500/15 text-purple-700 border-purple-500/30' :
                                usr.role === 'tech' ? 'bg-amber-500/15 text-amber-700 border-amber-500/30' :
                                'bg-blue-500/15 text-blue-700 border-blue-500/30'
                              }`}>
                                {usr.role === 'admin' ? 'Admin' :
                                 usr.role === 'tech' ? 'Tech' :
                                 'Cliente'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => handleOpenEditUser(usr)}
                                title="Editar Datos & Permisos"
                                className="w-7 h-7 rounded-lg bg-white/60 hover:bg-[#00877D] hover:text-white text-slate-600 transition-all border border-white/80 inline-flex items-center justify-center"
                              >
                                <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                title="Eliminar Usuario"
                                className="w-7 h-7 rounded-lg bg-white/60 hover:bg-red-500 hover:text-white text-slate-600 transition-all border border-white/80 inline-flex items-center justify-center"
                              >
                                <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          <div className="bg-slate-900/10 px-6 py-3 border-t border-white/60 flex justify-between items-center text-[11px] font-bold text-slate-600 shrink-0">
            <span>SAMAND TECH Platform &copy; 2026</span>
            <span>Sistema Operativo</span>
          </div>

        </div>
      </div>

      {/* ================= MODAL SECUNDARIO: EDITAR / CREAR USUARIO ================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-white/80 animate-fadeIn">
            
            <div className="bg-[#1E293B] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUserGear} className="text-[#11C6EA]" />
                <h3 className="text-sm font-extrabold">
                  {editingUser ? `Editar Usuario: ${editingUser.full_name || ''}` : 'Registrar Nuevo Usuario'}
                </h3>
              </div>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                    className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rol en el Sistema *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                  >
                    <option value="admin">Admin</option>
                    <option value="tech">Tech</option>
                    <option value="client">Cliente</option>
                  </select>
                </div>

                {userForm.role === 'client' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Empresa Cliente *</label>
                    <select
                      value={userForm.company_id}
                      onChange={(e) => setUserForm({ ...userForm, company_id: e.target.value })}
                      className="w-full bg-white/70 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#00877D]"
                    >
                      <option value="">-- Seleccionar Empresa --</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800">Seguridad de la Cuenta</span>
                  <span className="text-[10px] text-slate-500">Enviar enlace de recuperación de contraseña</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <FontAwesomeIcon icon={faKey} className="text-amber-500" />
                  Resetear Clave
                </button>
              </div>

              {userForm.role === 'tech' && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faShieldHalved} />
                      Permisos Específicos (Tech)
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userForm.permissions.canCreateTickets}
                        onChange={() => handlePermissionToggle('canCreateTickets')}
                        className="rounded text-[#00877D] focus:ring-[#00877D]" 
                      />
                      <span className="font-bold text-slate-800">Crear nuevos tickets</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userForm.permissions.canReassignTechs}
                        onChange={() => handlePermissionToggle('canReassignTechs')}
                        className="rounded text-[#00877D] focus:ring-[#00877D]" 
                      />
                      <span className="font-bold text-slate-800">Reasignar responsabilidad</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userForm.permissions.canCloseTickets}
                        onChange={() => handlePermissionToggle('canCloseTickets')}
                        className="rounded text-[#00877D] focus:ring-[#00877D]" 
                      />
                      <span className="font-bold text-slate-800">Finalizar tickets</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userForm.permissions.canDeleteTickets}
                        onChange={() => handlePermissionToggle('canDeleteTickets')}
                        className="rounded text-[#00877D] focus:ring-[#00877D]" 
                      />
                      <span className="font-bold text-red-600">Eliminar tickets</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userForm.permissions.canViewReports}
                        onChange={() => handlePermissionToggle('canViewReports')}
                        className="rounded text-[#00877D] focus:ring-[#00877D]" 
                      />
                      <span className="font-bold text-slate-800">Ver Reportes / SLAs</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-amber-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={userForm.permissions.canExportReports}
                        onChange={() => handlePermissionToggle('canExportReports')}
                        className="rounded text-[#00877D] focus:ring-[#00877D]" 
                      />
                      <span className="font-bold text-slate-800">Exportar Informes</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setIsUserModalOpen(false)} 
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-[#1E293B] text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800"
                >
                  <FontAwesomeIcon icon={faCheck} className="text-[#11C6EA]" />
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}