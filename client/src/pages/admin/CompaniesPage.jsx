import { useState, useEffect } from 'react';
import MainLayout from '../../components/MainLayout';
import api from '../../api/client';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', rif_tax_id: '', contact_email: '', contact_phone: '' });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies');
      setCompanies(res.data || []);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await api.post('/companies', newCompany);
      setIsModalOpen(false);
      setNewCompany({ name: '', rif_tax_id: '', contact_email: '', contact_phone: '' });
      fetchCompanies();
    } catch (err) {
      console.error('Error al crear empresa:', err);
    }
  };

  return (
    <MainLayout title="Directorio de Clientes y Empresas">
      <div className="space-y-6">
        <div className="flex justify-between items-center glass-panel p-5 rounded-2xl">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Gestión de Empresas</h2>
            <p className="text-xs text-slate-600">Registro de organizaciones clientes vinculadas al sistema</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1E293B] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all"
          >
            ➕ Nueva Empresa
          </button>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-white/30 text-slate-600 font-bold uppercase border-b border-white/40">
              <tr>
                <th className="p-4">Nombre / Razón Social</th>
                <th className="p-4">RIF</th>
                <th className="p-4">Email Contacto</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/30">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-500">Cargando empresas...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-slate-500">No hay empresas registradas.</td></tr>
              ) : (
                companies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-white/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{comp.name}</td>
                    <td className="p-4 font-mono text-slate-600">{comp.rif_tax_id || 'N/A'}</td>
                    <td className="p-4 text-slate-700">{comp.contact_email || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{comp.contact_phone || 'N/A'}</td>
                    <td className="p-4 text-slate-500">{new Date(comp.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Crear Empresa */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-slate-900">Registrar Nueva Empresa</h3>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">Nombre de la Empresa</label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00877D]"
                    placeholder="Ej: Pizzolante C.A."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">RIF / Identificación Fiscal</label>
                  <input
                    type="text"
                    value={newCompany.rif_tax_id}
                    onChange={(e) => setNewCompany({ ...newCompany, rif_tax_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00877D]"
                    placeholder="J-12345678-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-slate-700">Email de Contacto</label>
                  <input
                    type="email"
                    value={newCompany.contact_email}
                    onChange={(e) => setNewCompany({ ...newCompany, contact_email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#00877D]"
                    placeholder="contacto@empresa.com"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Guardar Empresa
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