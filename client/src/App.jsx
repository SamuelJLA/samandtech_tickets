// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas Admin / Tech
import AdminDashboard from './pages/admin/AdminDashboard';
import CompaniesPage from './pages/admin/CompaniesPage';
import OrdersPage from './pages/admin/OrdersPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';


// Páginas Cliente
import ClientDashboard from './pages/client/ClientDashboard';
import ClientRequestsPage from './pages/client/ClientRequestsPage';
import MainLayout from './components/MainLayout';
import ClientHistoryPage from './pages/client/ClientHistoryPage';
import ClientServicesPage from './pages/client/ClientServicesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rutas de Administración y Soporte */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'tech']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Configuración compartida (Admin ve usuarios, Tech y Client ven solo su perfil) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'tech', 'client']} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Portal Exclusivo para Clientes */}
          <Route element={<ProtectedRoute allowedRoles={['client']} />}>
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/client/requests" element={<ClientRequestsPage />} />
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/client/requests" element={<ClientDashboard />} />
            <Route path="/client/history" element={<ClientHistoryPage />} />
            <Route path="/client/services" element={<ClientServicesPage />} />
            <Route path="/client/history" element={
              <MainLayout title="Historial y Visitas Realizadas">
                <div className="glass-panel p-8 rounded-3xl text-center">
                  <h2 className="text-base font-extrabold text-slate-900">📋 Historial de Atenciones</h2>
                  <p className="text-xs text-slate-600 mt-1">Aquí verás el registro detallado de cada visita y reparación completada.</p>
                </div>
              </MainLayout>
            } />
            <Route path="/client/services" element={
              <MainLayout title="Servicios Adicionales SAMANDTECH">
                <div className="glass-panel p-8 rounded-3xl text-center space-y-2">
                  <span className="text-3xl">✨</span>
                  <h2 className="text-base font-extrabold text-slate-900">Catálogo de Soluciones & Servicios Adicionales</h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Próximamente podrás solicitar instalación de cámaras de seguridad, cableado estructurado, compra de equipos y licencias desde aquí.
                  </p>
                </div>
              </MainLayout>
            } />
          </Route>

          <Route path="/unauthorized" element={<div className="p-8 text-red-500 font-bold">Acceso no autorizado</div>} />
          <Route path="*" element={<div className="p-8 text-slate-700 font-bold">Página no encontrada</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}