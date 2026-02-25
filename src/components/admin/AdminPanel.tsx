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

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStats();
    resetPagination();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'verifications') fetchVerifications();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'reviews') fetchReviews();
    if (activeTab === 'ads') fetchAds();
  }, [activeTab]);

  const resetPagination = () => {
    setCurrentPage(1);
    setSearchTerm('');
  };

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
    { id: 'payments', label: 'Finanzas', icon: CreditCard, count: payments.filter(p => p.status === 'pending').length },
    { id: 'reviews', label: 'Reseñas', icon: Star },
    { id: 'ads', label: 'Anuncios', icon: FileText }
  ];

  const Pagination = ({ total, current, onChange }: { total: number, current: number, onChange: (p: number) => void }) => {
    if (total <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 py-8">
        <button
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className="p-3 rounded-xl border border-gray-100 bg-white disabled:opacity-50 hover:bg-gray-50 transition-all font-black text-xs uppercase"
        >
          Anterior
        </button>
        {[...Array(total)].map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={cn(
              "w-10 h-10 rounded-xl font-black text-sm transition-all",
              current === i + 1 ? "bg-gray-900 text-white shadow-lg" : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
            )}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={current === total}
          onClick={() => onChange(current + 1)}
          className="p-3 rounded-xl border border-gray-100 bg-white disabled:opacity-50 hover:bg-gray-50 transition-all font-black text-xs uppercase"
        >
          Siguiente
        </button>
      </div>
    );
  };

  const EmptyState = ({ icon: Icon, title, desc }: any) => (
    <div className="bg-white p-8 md:p-20 rounded-[2rem] md:rounded-[3rem] text-center border-4 border-dashed border-gray-50 animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-gray-200">
        <Icon className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-400 font-bold max-w-xs mx-auto text-sm">{desc}</p>
    </div>
  );

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
        <div className="mb-4 md:mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Admin Console</h1>
              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest">Gestión Central de SafeConnect</p>
            </div>
          </div>
          <div className="bg-rose-50 text-rose-600 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-rose-100 font-bold flex items-center gap-2 text-xs md:text-sm">
            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Modo Root</span> Admin
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Sidebar Navigation — horizontal pills on mobile, vertical on desktop */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-2 lg:p-3 lg:sticky lg:top-6">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 [&::-webkit-scrollbar]:hidden">
                {sidebarTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 lg:gap-4 px-3 lg:px-5 py-2.5 lg:py-4 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-black transition-all group whitespace-nowrap shrink-0 lg:w-full",
                        isActive
                          ? "bg-gray-900 text-white shadow-xl shadow-gray-200"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:scale-110 shrink-0", isActive ? "text-rose-400" : "text-gray-400")} />
                      <span className="hidden sm:inline lg:inline">{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-full animate-pulse">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                  {dashboardStats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-lg border border-gray-100 hover:shadow-xl transition-all group">
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className={cn("p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                          <stat.icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
                        </div>
                        <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                      </div>
                      <div className="text-xl md:text-3xl font-black text-gray-900 mb-0.5 md:mb-1">{stat.value}</div>
                      <div className="text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions / Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black mb-2">Pendientes hoy</h3>
                      <p className="text-gray-300 font-bold mb-6">Tienes {verifications.length} verificaciones esperando tu revisión.</p>
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
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping inline-block" />
                          ONLINE
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-500">Cloudinary API</span>
                        <span className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping inline-block" />
                          ONLINE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (() => {
              const filtered = users.filter(u =>
                u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.name?.toLowerCase().includes(searchTerm.toLowerCase())
              );
              const totalItems = filtered.length;
              const pages = Math.ceil(totalItems / itemsPerPage);
              const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

              return (
                <div className="space-y-6">
                  <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">Gestión de Usuarios</h2>
                        <p className="text-gray-500 font-bold">Monitoriza y modera a todos los miembros</p>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Email, nombre o ID..."
                          value={searchTerm}
                          className="pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 font-bold text-sm w-full md:w-80 shadow-inner"
                          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-[0.2em]">
                          <tr>
                            <th className="px-4 md:px-8 py-3 md:py-5">Usuario</th>
                            <th className="px-4 md:px-8 py-3 md:py-5 hidden sm:table-cell">Rol</th>
                            <th className="px-4 md:px-8 py-3 md:py-5">Estado</th>
                            <th className="px-4 md:px-8 py-3 md:py-5 hidden md:table-cell">Verificado</th>
                            <th className="px-4 md:px-8 py-3 md:py-5 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {currentItems.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/30 transition-colors group">
                              <td className="px-4 md:px-8 py-4 md:py-6">
                                <div className="flex items-center gap-3 md:gap-4">
                                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-100 overflow-hidden shadow-inner border-2 border-white group-hover:scale-105 transition-transform shrink-0">
                                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-black text-gray-900 text-sm md:text-base truncate">{u.name}</div>
                                    <div className="text-[10px] md:text-xs font-bold text-gray-400 truncate">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-6 hidden sm:table-cell">
                                <span className={cn(
                                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider",
                                  u.role === 'admin' ? "bg-purple-50 text-purple-600 border border-purple-100" :
                                    u.role === 'announcer' ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-gray-50 text-gray-600 border border-gray-100"
                                )}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-6">
                                <span className={cn(
                                  "flex items-center gap-2 font-black text-[10px] tracking-widest uppercase",
                                  u.status === 'banned' ? "text-rose-500" : "text-emerald-500"
                                )}>
                                  <span className={cn("w-2 h-2 rounded-full inline-block shrink-0", u.status === 'banned' ? "bg-rose-500" : "bg-emerald-500 animate-pulse")} />
                                  {u.status === 'banned' ? 'BANEADO' : 'ACTIVO'}
                                </span>
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-6 hidden md:table-cell">
                                {u.verified ? (
                                  <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase">
                                    <ShieldCheck className="w-5 h-5" fill="currentColor" />
                                    SI
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-gray-300 font-black text-[10px] uppercase">
                                    <X className="w-5 h-5" />
                                    NO
                                  </div>
                                )}
                              </td>
                              <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                                <button
                                  onClick={() => handleBanUser(u.id || '', u.status || 'active')}
                                  title={u.status === 'active' ? 'Banear Usuario' : 'Activar Usuario'}
                                  className={cn(
                                    "p-2.5 md:p-3 rounded-xl md:rounded-2xl border transition-all inline-flex items-center justify-center",
                                    u.status === 'active' ? "border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white" : "border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                                  )}
                                >
                                  {u.status === 'active' ? <Ban className="w-4 h-4 md:w-5 md:h-5" /> : <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <Pagination total={pages} current={currentPage} onChange={setCurrentPage} />
                </div>
              );
            })()}

            {/* VERIFICATIONS TAB */}
            {activeTab === 'verifications' && (
              <div className="space-y-6">
                {verifications.length === 0 ? (
                  <EmptyState
                    icon={ShieldCheck}
                    title="Sin verificaciones pendientes"
                    desc="Todo está al día. No hay nuevas solicitudes por revisar."
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {verifications.map(v => (
                      <div key={v.id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between hover:border-rose-200 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 overflow-hidden shadow-inner border-4 border-white">
                            <img src={v.avatar || `https://ui-avatars.com/api/?name=${v.name}&background=random`} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-xl tracking-tight">{v.name}</h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                              <span className="text-gray-400 font-bold">{v.email}</span>
                              <div className="w-1 h-1 bg-gray-200 rounded-full" />
                              <span className="text-rose-500 font-black text-[10px] uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                                {v.verificationRequests?.requestedAt ? `Hace ${Math.floor((Date.now() - new Date(v.verificationRequests.requestedAt).getTime()) / (1000 * 60 * 60 * 24))} días` : 'Reciente'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedVerification(v)}
                          className="mt-4 md:mt-0 w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 active:scale-95"
                        >
                          <FileText className="w-5 h-5 text-rose-400" />
                          REVISAR DOCUMENTOS
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (() => {
              const pendingCount = payments.filter(p => p.status === 'pending').length;
              return (
                <div className="space-y-6">
                  {payments.length === 0 ? (
                    <EmptyState
                      icon={CreditCard}
                      title="No hay pagos registrados"
                      desc="El historial de transacciones aparecerá aquí."
                    />
                  ) : (
                    <div className="space-y-6">
                      {pendingCount > 0 && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                          <CheckCircle className="w-6 h-6 text-amber-600" />
                          <p className="text-amber-800 font-black text-sm uppercase">Atención: {pendingCount} transacciones requieren acción inmediata</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-6">
                        {payments.map(p => (
                          <div key={p._id || p.id} className={cn(
                            "bg-white rounded-[2.5rem] shadow-xl border overflow-hidden p-8 flex flex-col md:flex-row gap-8 items-center transition-all",
                            p.status === 'pending' ? "border-amber-200 bg-amber-50/20" : "border-gray-100"
                          )}>
                            <div className="w-full md:w-36 h-40 md:h-56 rounded-2xl md:rounded-3xl bg-gray-900 border-4 border-white shadow-2xl overflow-hidden group relative shrink-0">
                              <img src={p.proofUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div onClick={() => setSelectedImage(p.proofUrl)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-[10px] tracking-tighter uppercase transition-opacity cursor-pointer text-center px-4">
                                CLIC PARA AMPLIAR COMPROBANTE
                              </div>
                            </div>
                            <div className="flex-1 space-y-4 text-center md:text-left">
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className={cn(
                                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm",
                                  p.status === 'pending' ? "bg-amber-100 text-amber-700 border-amber-200" :
                                    p.status === 'approved' || p.status === 'completed' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-rose-100 text-rose-700 border-rose-200"
                                )}>
                                  {p.status}
                                </span>
                                <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-50">{new Date(p.createdAt).toLocaleString()}</span>
                              </div>
                              <div>
                                <h4 className="text-2xl font-black text-gray-900 tracking-tight">{p.user?.name}</h4>
                                <p className="text-gray-400 font-bold text-sm">{p.user?.email}</p>
                              </div>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm min-w-[120px]">
                                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Concepto</p>
                                  <p className="text-sm font-black text-rose-500">{p.type?.toUpperCase() || 'PAGO'}</p>
                                </div>
                                <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm min-w-[120px]">
                                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Monto</p>
                                  <p className="text-sm font-black text-gray-900">${p.amount?.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm min-w-[120px]">
                                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Banco</p>
                                  <p className="text-sm font-black text-blue-600">{p.bankName || 'NEQUI'}</p>
                                </div>
                                {p.type === 'withdrawal' && p.description && (
                                  <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 min-w-[150px]">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Cuenta Destino</p>
                                    <p className="text-[11px] font-bold text-gray-900 truncate">{p.description.replace('Solicitud de retiro a cuenta: ', '')}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {p.status === 'pending' && (
                              <div className="flex flex-col gap-3 w-full md:w-auto">
                                <button
                                  onClick={() => handlePaymentAction((p._id || p.id), 'approved')}
                                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all transform active:scale-95"
                                >
                                  APROBAR Y ACCIÓN
                                </button>
                                <button
                                  onClick={() => setRejectModal({ id: (p._id || p.id), type: 'payment' })}
                                  className="px-8 py-4 bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black transition-all active:scale-95 shadow-sm"
                                >
                                  RECHAZAR PAGO
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 gap-4">
                {reviews.length === 0 ? (
                  <EmptyState
                    icon={Star}
                    title="Cero reseñas"
                    desc="Aún no hay opiniones publicadas en la plataforma."
                  />
                ) : (
                  reviews.map(r => (
                    <div key={r.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row gap-6 items-start hover:border-amber-200 transition-all group">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 flex items-center justify-center flex-shrink-0 border-2 border-amber-100 group-hover:scale-110 transition-transform">
                        <Star className="w-8 h-8 text-amber-500" fill="currentColor" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                          <div>
                            <h4 className="font-black text-gray-900 text-lg tracking-tight">{r.reviewer?.name}</h4>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                              para <ArrowUpRight className="w-3 h-3" /> {r.ad?.title}
                            </p>
                          </div>
                          <div className="flex gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4" fill={i < r.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-gray-600 font-medium italic relative">
                          <span className="absolute -top-3 left-6 bg-white px-2 text-rose-500 text-2xl font-serif">“</span>
                          {r.comment}
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-gray-100">
                            {new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            onClick={() => handleDeleteReview(r.id)}
                            className="bg-rose-50 text-rose-500 px-4 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 border border-rose-100 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" /> BORRAR RESEÑA
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ADS TAB */}
            {activeTab === 'ads' && (() => {
              const filtered = ads.filter(ad =>
                ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ad.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
              );
              const totalItems = filtered.length;
              const pages = Math.ceil(totalItems / (itemsPerPage * 2)); // Double density for grid
              const currentItems = filtered.slice((currentPage - 1) * itemsPerPage * 2, currentPage * itemsPerPage * 2);

              return (
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Gestión de Anuncios</h2>
                      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Moderación de Catálogo</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Título, usuario, ciudad..."
                        value={searchTerm}
                        className="pl-14 pr-8 py-5 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-rose-500 font-black text-sm w-full md:w-80 lg:w-[28rem] shadow-inner"
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      />
                    </div>
                  </div>

                  {currentItems.length === 0 ? (
                    <EmptyState
                      icon={FileText}
                      title="No se encontraron anuncios"
                      desc="Intenta con otro término de búsqueda o revisa el catálogo general."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                      {currentItems.map(ad => (
                        <div key={ad._id || ad.id} className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col sm:flex-row gap-4 md:gap-6 hover:shadow-2xl transition-all group relative overflow-hidden">
                          {ad.plan && ad.plan !== 'gratis' && (
                            <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                              <div className="absolute top-2 -right-8 bg-amber-400 text-white text-[8px] font-black uppercase py-1 w-32 text-center rotate-45 shadow-sm">
                                {ad.plan}
                              </div>
                            </div>
                          )}

                          <div className="relative shrink-0 mx-auto sm:mx-0">
                            <div className="w-full sm:w-28 md:w-32 h-36 sm:h-40 md:h-44 rounded-2xl md:rounded-[1.8rem] bg-gray-100 shadow-inner border-4 border-white overflow-hidden group-hover:scale-[1.02] transition-transform">
                              <img
                                src={ad.photos?.find((p: any) => p.isMain)?.url || ad.photos?.[0]?.url || ad.images?.[0] || ad.avatar || `https://ui-avatars.com/api/?name=${ad.title}`}
                                className="w-full h-full object-cover"
                                alt={ad.title}
                              />
                            </div>
                            <div className="absolute -bottom-2 -right-2">
                              {ad.isActive ? (
                                <div className="p-2 bg-emerald-500 rounded-2xl shadow-lg border-4 border-white animate-pulse">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="p-2 bg-rose-500 rounded-2xl shadow-lg border-4 border-white">
                                  <Ban className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <h4 className="font-black text-gray-900 truncate text-xl tracking-tight leading-tight">
                                {ad.title || ad.name}, {ad.age}
                              </h4>
                              <p className="text-xs font-black text-gray-400 flex items-center gap-1.5 mt-1">
                                <Users className="w-3.5 h-3.5 text-rose-500" /> {ad.user?.name || 'Cargando...'}
                              </p>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shrink-0" />
                                {typeof ad.location === 'object'
                                  ? ad.location.city
                                  : ad.location}
                              </span>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className={cn(
                                  "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border shadow-sm",
                                  ad.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                )}>
                                  {ad.isActive ? 'ACTIVO' : 'SUSPENDIDO'}
                                </span>
                                {ad.isVerified && <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                  <ShieldCheck className="w-3 h-3" fill="currentColor" /> VERIF.
                                </span>}
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => handleAdStatus(ad._id || ad.id, ad.isActive)}
                                className={cn(
                                  "flex-1 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-sm",
                                  ad.isActive
                                    ? "bg-gray-900 hover:bg-black text-white"
                                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                )}
                              >
                                {ad.isActive ? <Ban className="w-4 h-4 text-rose-400" /> : <CheckCircle className="w-4 h-4 text-white" />}
                                {ad.isActive ? 'Suspender' : 'Activar'}
                              </button>
                              <button
                                onClick={() => handleDeleteAd(ad._id || ad.id)}
                                className="px-4 py-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 border border-red-100 rounded-2xl transition-all shadow-sm active:scale-95"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Pagination total={pages} current={currentPage} onChange={setCurrentPage} />
                </div>
              );
            })()}

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
            <div className="p-4 md:p-6 border-t border-gray-100 bg-white flex flex-wrap gap-3 md:gap-4 justify-end">
              <button
                onClick={() => {
                  setRejectModal({ id: selectedVerification.id || selectedVerification._id || '', type: 'verification' });
                }}
                className="px-5 md:px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-black transition-all text-sm md:text-base"
              >
                RECHAZAR SOLICITUD
              </button>
              <button
                onClick={() => {
                  handleVerificationAction(selectedVerification.id || selectedVerification._id || '', 'approved');
                  setSelectedVerification(null);
                }}
                className="px-5 md:px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 text-sm md:text-base"
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