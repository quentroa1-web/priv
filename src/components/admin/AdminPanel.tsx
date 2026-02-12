import { useState, useEffect } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/api';
import {
  BarChart3, DollarSign,
  Trash2, X, ArrowLeft,
  Star, ChevronRight, Search,
  Users, ShieldCheck, Ban, CheckCircle,
  FileText, ExternalLink, CreditCard, Grid3x3, ArrowUpRight
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Data lists
  const [users, setUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<User[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);

  // Modals
  const [selectedVerification, setSelectedVerification] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string, type: 'verification' | 'payment' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'verifications') fetchVerifications();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'reviews') fetchReviews();
    if (activeTab === 'ads') fetchAds();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await apiService.getAdminStats() as any;
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiService.getAdminUsers() as any;
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVerifications = async () => {
    try {
      const res = await apiService.getVerifications() as any;
      setVerifications(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await apiService.getPayments() as any;
      setPayments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await apiService.getReviewsAdmin() as any;
      setReviews(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await apiService.getAdminAds() as any;
      setAds(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBanUser = async (userId: string, currentStatus: string) => {
    if (!window.confirm(`¿Seguro que deseas ${currentStatus === 'active' ? 'banear' : 'activar'} a este usuario?`)) return;
    try {
      await apiService.updateUserAdmin(userId, { status: currentStatus === 'active' ? 'banned' : 'active' });
      fetchUsers();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleVerificationAction = async (userId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await apiService.handleVerification(userId, { status, rejectionReason: reason });
      fetchVerifications();
      setRejectModal(null);
      setRejectionReason('');
      setSelectedVerification(null);
    } catch (err) {
      alert('Error en verificación');
    }
  };

  const handlePaymentAction = async (paymentId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await apiService.handlePayment(paymentId, { status, rejectionReason: reason });
      fetchPayments();
      setRejectModal(null);
      setRejectionReason('');
    } catch (err) {
      alert('Error en pago');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('¿Eliminar esta reseña permanentemente?')) return;
    try {
      await apiService.deleteReviewAdmin(reviewId);
      fetchReviews();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const handleAdStatus = async (adId: string, currentStatus: boolean) => {
    if (!window.confirm(`¿Seguro que deseas ${currentStatus ? 'suspender' : 'activar'} este anuncio?`)) return;
    try {
      await apiService.updateAdAdmin(adId, { isActive: !currentStatus });
      fetchAds();
    } catch (err) {
      alert('Error al actualizar estado del anuncio');
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!window.confirm('¿ELIMINAR este anuncio permanentemente? Esta acción no se puede deshacer.')) return;
    try {
      await apiService.deleteAdAdmin(adId);
      fetchAds();
    } catch (err) {
      alert('Error al eliminar el anuncio');
    }
  };

  const dashboardStats = [
    { label: 'Usuarios', value: stats?.totalUsers || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Anuncios', value: stats?.totalAds || '0', icon: Grid3x3, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ingresos', value: `$${stats?.totalRevenue?.[0]?.total || 0}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pend. Verificar', value: stats?.pendingVerifications || '0', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Pagos Pend.', value: stats?.pendingPayments || '0', icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Rating Global', value: '4.8', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  const sidebarTabs = [
    { id: 'dashboard', label: 'Consola', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'verifications', label: 'Verificaciones', icon: ShieldCheck, count: verifications.length },
    { id: 'payments', label: 'Pagos/Facturas', icon: CreditCard, count: payments.filter(p => p.status === 'pending').length },
    { id: 'reviews', label: 'Reseñas', icon: Star },
    { id: 'ads', label: 'Anuncios', icon: FileText }
  ];

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
    </div>
  );

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
    return `${baseUrl}/${cleanPath}`;
  };


  return (
    <>
      <div className="animate-in fade-in duration-300">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Console</h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Gestión Central de SafeConnect</p>
            </div>
          </div>
          <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-2xl border border-rose-100 font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Modo Root Admin
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-3 sticky top-6">
              <nav className="space-y-1">
                {sidebarTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-black transition-all group",
                        isActive
                          ? "bg-gray-900 text-white shadow-xl shadow-gray-200"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-rose-400" : "text-gray-400")} />
                      {tab.label}
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">

            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {dashboardStats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 hover:shadow-xl transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                          <stat.icon className={cn("w-6 h-6", stat.color)} />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions / Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-2">Pendientes hoy</h3>
                      <p className="text-gray-400 font-bold mb-6">Tienes {verifications.length} verificaciones esperando tu revisión.</p>
                      <button
                        onClick={() => setActiveTab('verifications')}
                        className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-2xl font-black transition-all flex items-center gap-2 group"
                      >
                        Ir a Verificaciones
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    <ShieldCheck className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border-4 border-emerald-50 shadow-xl">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Salud del Sistema</h3>
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-500">Base de Datos</span>
                        <span className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                          ONLINE
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-500">Cloudinary API</span>
                        <span className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                          ONLINE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Gestión de Usuarios</h2>
                    <p className="text-gray-500 font-bold">Monitoriza y modera a todos los miembros</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por email o nombre..."
                      className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 font-bold text-sm w-80"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-4">Usuario</th>
                        <th className="px-8 py-4">Rol</th>
                        <th className="px-8 py-4">Estado</th>
                        <th className="px-8 py-4">Verificado</th>
                        <th className="px-8 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.filter(u => u.email?.includes(searchTerm) || u.name?.includes(searchTerm)).map(u => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <div className="font-black text-gray-900">{u.name}</div>
                                <div className="text-xs font-bold text-gray-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                              u.role === 'admin' ? "bg-purple-100 text-purple-700" :
                                u.role === 'announcer' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "flex items-center gap-1.5 font-black text-xs",
                              u.status === 'banned' ? "text-red-500" : "text-emerald-500"
                            )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full", u.status === 'banned' ? "bg-red-500" : "bg-emerald-500")} />
                              {u.status === 'banned' ? 'BANEADO' : 'ACTIVO'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            {u.verified ? (
                              <CheckCircle className="w-5 h-5 text-blue-500" fill="currentColor" />
                            ) : (
                              <X className="w-5 h-5 text-gray-300" />
                            )}
                          </td>
                          <td className="px-8 py-5 text-right space-x-2">
                            <button
                              onClick={() => handleBanUser(u.id || '', u.status || 'active')}
                              className={cn(
                                "p-2 rounded-xl border transition-all",
                                u.status === 'active' ? "border-red-100 text-red-500 hover:bg-red-50" : "border-emerald-100 text-emerald-500 hover:bg-emerald-50"
                              )}
                            >
                              {u.status === 'active' ? <Ban className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VERIFICATIONS TAB */}
            {activeTab === 'verifications' && (
              <div className="space-y-4">
                {verifications.length === 0 && (
                  <div className="bg-white p-20 rounded-[3rem] text-center border-4 border-dashed border-gray-100">
                    <ShieldCheck className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900">Sin verificaciones pendientes</h3>
                    <p className="text-gray-400 font-bold">Todo está bajo control por aquí.</p>
                  </div>
                )}
                {verifications.map(v => (
                  <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                        {v.avatar ? (
                          <img src={v.avatar} className="w-full h-full object-cover" alt={v.name} />
                        ) : (
                          <Users className="w-6 h-6 text-gray-400 m-3" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-lg">{v.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-bold">{v.email}</span>
                          <span>•</span>
                          <span>Solicitado: {v.verificationRequests?.requestedAt ? new Date(v.verificationRequests.requestedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        console.log('Review Documents clicked for:', v);
                        setSelectedVerification(v);
                      }}
                      className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                    >
                      <FileText className="w-4 h-4" />
                      Revisar Documentos
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                {payments.length === 0 && (
                  <div className="bg-white p-20 rounded-[3rem] text-center border-4 border-dashed border-gray-100">
                    <CreditCard className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-gray-900">No hay pagos registrados</h3>
                  </div>
                )}
                {payments.map(p => (
                  <div key={p._id || p.id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-32 h-44 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden group relative">
                      <img src={p.proofUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <button
                        onClick={() => setSelectedImage(p.proofUrl)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-xs transition-opacity cursor-pointer">
                        VER COMPROBANTE
                      </button>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          p.status === 'pending' ? "bg-amber-100 text-amber-700" :
                            p.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {p.status}
                        </span>
                        <span className="text-xs font-bold text-gray-400">{new Date(p.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium bg-gray-50 p-2 rounded-lg inline-flex">
                        <span>Ref: {p.referenceId || 'N/A'}</span>
                        <span>|</span>
                        <span>Banco: {p.bankName || 'Nequi'}</span>
                        <span>|</span>
                        <span>Fecha: {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <h4 className="text-xl font-black text-gray-900">{p.user?.name}</h4>
                      <p className="text-sm font-bold text-gray-500">Plan solicitado: <span className="text-rose-600 uppercase text-lg">{p.planDetails?.plan || p.packageId || p.description}</span></p>
                      <div className="text-2xl font-black text-gray-900">${p.amount}</div>
                    </div>
                    {p.status === 'pending' && (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => handlePaymentAction((p._id || p.id), 'approved')}
                          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all"
                        >
                          Activar Plan
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: (p._id || p.id), type: 'payment' })}
                          className="px-8 py-4 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-2xl font-black transition-all"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 gap-6">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex gap-6 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                      <Star className="w-7 h-7 text-rose-500" fill="currentColor" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black text-gray-900">{r.reviewer?.name} <span className="text-gray-400 font-bold ml-2">→ {r.ad?.title}</span></h4>
                        <div className="flex text-amber-500">
                          {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4" fill="currentColor" />)}
                        </div>
                      </div>
                      <p className="text-gray-600 font-medium italic border-l-4 border-rose-100 pl-4 py-2">"{r.comment}"</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleString()}</span>
                        <button
                          onClick={() => handleDeleteReview(r.id)}
                          className="text-red-500 font-black text-xs hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> ELIMINAR RESEÑA
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ADS TAB */}
            {activeTab === 'ads' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Gestión de Anuncios</h2>
                    <p className="text-gray-500 font-bold">Modera el contenido de la plataforma</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por título o anunciante..."
                      className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 font-bold text-sm w-80"
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ads.filter(ad =>
                    ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ad.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(ad => (
                    <div key={ad._id || ad.id} className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-gray-100 flex gap-6 hover:shadow-2xl transition-all group">
                      <div className="relative shrink-0">
                        <img
                          src={ad.photos?.find((p: any) => p.isMain)?.url || ad.photos?.[0]?.url || ad.images?.[0] || ad.avatar || ''}
                          className="w-32 h-40 rounded-3xl object-cover bg-gray-100 shadow-inner"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={cn(
                            "w-3 h-3 rounded-full border-2 border-white block",
                            ad.isActive ? "bg-emerald-500" : "bg-gray-400"
                          )} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-gray-900 truncate text-lg">
                              {ad.title || ad.name}, {ad.age}
                            </h4>
                          </div>
                          <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {ad.user?.name || 'Cargando...'}
                          </p>
                          <p className="text-xs font-bold text-gray-400 mt-1">
                            {typeof ad.location === 'object'
                              ? `${ad.location.city}, ${ad.location.department}`
                              : ad.location}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                              ad.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                            )}>
                              {ad.isActive ? 'ACTIVO' : 'SUSPENDIDO'}
                            </span>
                            {ad.isVerified && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> VERIFICADO
                            </span>}
                            {ad.plan && ad.plan !== 'gratis' && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Star className="w-3 h-3" fill="currentColor" /> {ad.plan}
                            </span>}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                          <button
                            onClick={() => handleAdStatus(ad._id || ad.id, ad.isActive)}
                            className={cn(
                              "flex-1 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-1.5",
                              ad.isActive
                                ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                            )}
                          >
                            {ad.isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {ad.isActive ? 'Suspender' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad._id || ad.id)}
                            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-all"
                            title="Eliminar permanentemente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div >


      </div>
      {/* Image Modal */}
      {
        selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} className="max-w-full max-h-full rounded-2xl" />
            <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full">
              <X className="w-8 h-8" />
            </button>
          </div>
        )
      }

      {/* Rejection Modal */}
      {
        rejectModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Rechazar Solicitud</h3>
              <p className="text-gray-500 mb-6">Por favor selecciona un motivo para el rechazo.</p>

              <div className="space-y-3 mb-6">
                {['Comprobante ilegible', 'Monto incorrecto', 'Referencia no encontrada', 'Fecha no coincide', 'Posible fraude', 'Otro'].map(reason => (
                  <button
                    key={reason}
                    onClick={() => setRejectionReason(reason)}
                    className={`w-full p-3 rounded-xl border font-bold text-left transition-all ${rejectionReason === reason ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {reason}
                  </button>
                ))}
                {rejectionReason === 'Otro' && (
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-xl mt-2"
                    placeholder="Especifique el motivo..."
                    onChange={e => setRejectionReason(e.target.value)}
                  />
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { setRejectModal(null); setRejectionReason(''); }}
                  className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (rejectModal.type === 'verification') handleVerificationAction(rejectModal.id, 'rejected', rejectionReason);
                    else handlePaymentAction(rejectModal.id, 'rejected', rejectionReason);
                  }}
                  disabled={!rejectionReason}
                  className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 disabled:bg-gray-300 transition-all shadow-lg shadow-rose-200"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Verification Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm overflow-hidden border-2 border-white">
                  <img src={selectedVerification.avatar || `https://ui-avatars.com/api/?name=${selectedVerification.name}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">{selectedVerification.name}</h3>
                  <p className="text-sm text-gray-500 font-bold">Solicitud de Verificación</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* ID Proof */}
                <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-rose-500" />
                      Documento de Identidad
                    </h4>
                    <a
                      href={getImageUrl(selectedVerification.verificationRequests?.idProof)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Abrir original <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative group flex items-center justify-center">
                    {selectedVerification.verificationRequests?.idProof ? (
                      <img
                        src={getImageUrl(selectedVerification.verificationRequests.idProof)}
                        className="max-w-full max-h-[500px] object-contain"
                        alt="ID Proof"
                      />
                    ) : (
                      <div className="text-gray-500 flex flex-col items-center">
                        <Ban className="w-10 h-10 mb-2" />
                        No hay imagen
                      </div>
                    )}
                  </div>
                </div>

                {/* Selfie Proof */}
                <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-rose-500" />
                      Selfie de Validación
                    </h4>
                    <a
                      href={getImageUrl(selectedVerification.verificationRequests?.photoProof)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Abrir original <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative group flex items-center justify-center">
                    {selectedVerification.verificationRequests?.photoProof ? (
                      <img
                        src={getImageUrl(selectedVerification.verificationRequests.photoProof)}
                        className="max-w-full max-h-[500px] object-contain"
                        alt="Selfie Proof"
                      />
                    ) : (
                      <div className="text-gray-500 flex flex-col items-center">
                        <Ban className="w-10 h-10 mb-2" />
                        No hay imagen
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-white flex gap-4 justify-end">
              <button
                onClick={() => {
                  setRejectModal({ id: selectedVerification.id || selectedVerification._id || '', type: 'verification' });
                }}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-black transition-all"
              >
                RECHAZAR SOLICITUD
              </button>
              <button
                onClick={() => {
                  handleVerificationAction(selectedVerification.id || selectedVerification._id || '', 'approved');
                  setSelectedVerification(null);
                }}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                APROBAR SOLICITUD
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}