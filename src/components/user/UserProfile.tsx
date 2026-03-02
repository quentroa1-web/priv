import { useState, useMemo, useEffect, useRef } from 'react';
import { User } from '../../types';
import { hapticFeedback } from '../../utils/haptics';
import { useTranslation } from 'react-i18next';
import {
  uploadAvatar,
  getMyAds,
  deleteAd as deleteAdApi,
  changePassword,
  deleteAccount,
  requestVerification,
  boostAd,
  apiService
} from '../../services/api';
import {
  User as UserIcon, Mail, Phone, MapPin, Shield,
  Eye, Edit, Camera, Save, X, Globe, Clock, Heart,
  MessageCircle, CreditCard, Settings, ArrowLeft,
  TrendingUp, CheckCircle, Crown, AlertCircle, Loader2,
  Trash2, PlusCircle, Rocket, Calendar, Star, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SEO } from '../SEO';

const GENDER_LABELS: Record<string, string> = {
  woman: 'Mujer',
  man: 'Hombre',
  transgender: 'Transexual',
  gigolo: 'Gigoló'
};

const GenderIcon = ({ gender, className }: { gender?: string, className?: string }) => {
  if (gender === 'man') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="14" r="5" />
        <path d="M14 10l7-7" />
        <path d="M14 3h7v7" />
      </svg>
    );
  }
  if (gender === 'woman') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="9" r="6" />
        <path d="M12 15v7" />
        <path d="M9 19h6" />
      </svg>
    );
  }
  if (gender === 'transgender') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 16v7" />
        <path d="M9 19h6" />
        <path d="M15 9l6-6" />
        <path d="M15 3h6v6" />
      </svg>
    );
  }
  return <UserIcon className={className} />;
};

interface UserProfileProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  onLogout: () => void;
  onBack: () => void;
  onCreateAd?: () => void;
  onEditAd?: (ad: any) => void;
}

export function UserProfile({ user, onUpdateProfile, onBack, onCreateAd, onEditAd }: UserProfileProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isUploading, setIsUploading] = useState(false);
  const [userAds, setUserAds] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.displayName || user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || user.description || '',
    location: typeof user.location === 'object' ? (user.location as any).city || '' : user.location || '',
    languages: user.languages || ['Español'],
    age: user.age || 0,
    gender: user.gender || '',
    priceList: user.priceList || []
  });

  // Sync formData when user prop changes
  useEffect(() => {
    setFormData({
      displayName: user.displayName || user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || user.description || '',
      location: typeof user.location === 'object' ? (user.location as any).city || '' : user.location || '',
      languages: user.languages || ['Español'],
      age: user.age || 0,
      gender: user.gender || '',
      priceList: user.priceList || []
    });
  }, [user]);

  // Settings state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null);
  const [appointmentViewMode, setAppointmentViewMode] = useState<'list' | 'calendar'>('list');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    categories: {} as Record<string, number>
  });

  // Determine review criteria based on user role
  const getReviewCategories = () => {
    const isAnnouncer = user.role === 'announcer' || (user as any).accountType === 'announcer';
    if (isAnnouncer) {
      // Announcer reviewing a client
      return [
        { key: 'respect', label: 'Respeto' },
        { key: 'punctuality', label: 'Puntualidad' },
        { key: 'communication', label: 'Comunicación' },
        { key: 'tidiness', label: 'Limpieza / Trato' }
      ];
    } else {
      // Client reviewing an announcer
      return [
        { key: 'service', label: 'Servicio prestado' },
        { key: 'punctuality', label: 'Puntualidad' },
        { key: 'communication', label: 'Comunicación' },
        { key: 'hygiene', label: 'Higiene' }
      ];
    }
  };

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>(user.paymentMethods || []);
  const [newPaymentMethod, setNewPaymentMethod] = useState({ type: '', details: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [idProof, setIdProof] = useState<File | null>(null);
  const [photoProof, setPhotoProof] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idProof || !photoProof) {
      toast.error('Por favor sube ambos documentos (Foto sosteniendo hoja con nombre y fecha, y Documento de identidad)');
      return;
    }

    const formData = new FormData();
    formData.append('idProof', idProof);
    formData.append('photoProof', photoProof);

    try {
      setIsVerifying(true);
      await requestVerification(formData);
      toast.success('Solicitud enviada con éxito. Un administrador revisará tus documentos pronto.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(error);
      toast.error('Error al enviar solicitud de verificación');
    } finally {
      setIsVerifying(false);
    }
  };

  const completionMetrics = useMemo(() => {
    const fields = [
      { key: 'displayName', weight: 15, value: !!user.displayName },
      { key: 'email', weight: 10, value: !!user.email },
      { key: 'phone', weight: 15, value: !!user.phone },
      { key: 'bio', weight: 15, value: !!(user.bio || user.description) },
      { key: 'location', weight: 15, value: !!user.location },
      { key: 'avatar', weight: 15, value: !!user.avatar },
      { key: 'age', weight: 5, value: !!user.age },
      { key: 'gender', weight: 5, value: !!user.gender },
      { key: 'languages', weight: 5, value: (user.languages || []).length > 0 }
    ];

    const percentage = fields.reduce((acc, field) => acc + (field.value ? field.weight : 0), 0);
    const missing = fields.filter(f => !f.value).map(f => f.key);

    return { percentage, missing };
  }, [user]);

  useEffect(() => {
    // Only fetch ads if user is an announcer or admin
    if (activeTab === 'ads' && (user.role === 'announcer' || user.role === 'admin' || (user as any).accountType === 'announcer')) {
      fetchUserAds();
    }
  }, [activeTab]);

  // Sync payment methods from user prop
  useEffect(() => {
    if (user.paymentMethods) {
      setPaymentMethods(user.paymentMethods);
    }
  }, [user.paymentMethods]);

  const fetchUserAds = async () => {
    try {
      setLoadingAds(true);
      const res = await getMyAds();
      if (res.data && res.data.success) {
        setUserAds(res.data.data);
      }
    } catch (error: any) {
      // 403 Forbidden usually means the user is not an announcer yet or permission issue
      // We handle this gracefully by showing an empty ads list
      if (error?.response?.status === 403) {
        setUserAds([]);
      } else {
        console.error('Error fetching ads:', error);
      }
    } finally {
      setLoadingAds(false);
    }
  };

  const handleDeleteAd = async (adId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este anuncio? Esta acción no se puede deshacer.')) {
      try {
        const res = await deleteAdApi(adId);
        if (res.data.success) {
          setUserAds(userAds.filter(ad => (ad._id || ad.id) !== adId));
        }
      } catch (error) {
        console.error('Error deleting ad:', error);
        toast.error('No se pudo eliminar el anuncio');
      }
    }
  };

  const handleBoostAd = async (adId: string) => {
    // Check if any ad already has an active boost
    const activeBoost = userAds.find(ad => ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date());

    if (activeBoost) {
      toast.error(`Ya tienes un Boost activo en el anuncio: "${activeBoost.title}". Solo puedes tener un Boost activo a la vez.`);
      return;
    }

    if (window.confirm('¿Quieres impulsar este anuncio por 100 monedas? Subirá al inicio de su categoría por 12 horas.')) {
      try {
        const res = await boostAd(adId);
        if (res.data.success) {
          toast.success('¡Anuncio impulsado con éxito!');
          fetchUserAds(); // Refresh list
        }
      } catch (error: any) {
        console.error('Error boosting ad:', error);
        toast.error(error.response?.data?.error || 'No se pudo impulsar el anuncio. Verifica tu saldo.');
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdateProfile(formData);
      toast.success('Perfil actualizado correctamente');
      setEditing(false);
    } catch (error) {
      toast.error('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      setIsUploading(true);
      const response = await uploadAvatar(uploadFormData);

      if (response.data && response.data.success) {
        await onUpdateProfile({ avatar: response.data.url });
        toast.success('Foto de perfil actualizada');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const stats = [
    { label: 'Visitas al perfil', value: '1,247', icon: Eye, color: 'text-blue-600', change: '+12%' },
    { label: 'Mensajes recibidos', value: '89', icon: MessageCircle, color: 'text-green-600', change: '+23%' },
    { label: 'Favoritos recibidos', value: '42', icon: Heart, color: 'text-rose-600', change: '+8%' },
    { label: 'Tasa de respuesta', value: '94%', icon: Clock, color: 'text-amber-600', change: '+5%' }
  ];

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: UserIcon },
    { id: 'ads', label: 'Mis Anuncios', icon: Eye },
    { id: 'appointments', label: 'Mis Citas', icon: Calendar },
    { id: 'stats', label: 'Estadísticas', icon: TrendingUp },
    { id: 'settings', label: 'Configuración', icon: Settings },
    { id: 'verification', label: 'Verificación', icon: Shield },
    { id: 'billing', label: 'Facturación', icon: CreditCard }
  ];

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const res = await apiService.getMyAppointments() as any;
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setIsUpdatingStatus(id);
      const res = await apiService.updateAppointmentStatus(id, status) as any;
      if (res.data.success) {
        toast.success(`Cita marcada como ${status}`);
        await fetchAppointments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al actualizar estado');
    } finally {
      setIsUpdatingStatus(null);
    }
  };


  const handleSubmitReview = async () => {
    if (!showReviewModal) return;
    try {
      const res = await apiService.createReview({
        appointmentId: showReviewModal,
        ...reviewForm
      }) as any;
      if (res.data.success) {
        toast.success('¡Calificación enviada con éxito!');
        setShowReviewModal(null);
        setReviewForm({ rating: 5, comment: '', categories: {} });
        fetchAppointments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al enviar calificación');
    }
  };


  return (
    <div className="animate-in fade-in duration-500 min-h-screen pb-12 bg-gray-50/20">
      <SEO
        title={`Panel de Control | ${user.displayName || user.name} - SafeConnect`}
        description="Gestiona tu perfil, anuncios y estadísticas en SafeConnect Colombia."
        keywords="panel de control, mi perfil, gestionar anuncios, safeconnect"
      />

      <div className="mb-4">
        <button
          onClick={onBack}
          className="p-3 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all text-gray-700 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Volver</span>
        </button>

        {/* Banner Verification Promo - Super Compact */}
        {!user.verified && user.verificationRequests?.status !== 'pending' && (
          <div className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3 text-white shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-100 hidden sm:block" />
              <div>
                <h3 className="text-sm font-black m-0">Verifica tu cuenta y destaca</h3>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('verification')}
              className="px-3 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:scale-105 transition-all whitespace-nowrap"
            >
              Verificar
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white p-6 sticky top-6 ring-1 ring-gray-900/5 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-gradient-to-br from-rose-400/20 to-pink-500/20 blur-2xl rounded-full pointer-events-none"></div>
              {/* User Card */}
              <div className="relative text-center mb-8">
                <div className="relative mx-auto w-28 h-28 mb-5 group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-3xl rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-300"></div>
                  {user.avatar && !user.avatar.includes('demo/image/upload') ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="relative w-full h-full rounded-3xl object-cover border-4 border-white shadow-lg z-10"
                    />
                  ) : (
                    <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 border-4 border-white shadow-lg flex items-center justify-center text-rose-400 z-10">
                      <GenderIcon gender={user.gender} className="w-12 h-12 drop-shadow-sm" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      hapticFeedback('light');
                      avatarInputRef.current?.click();
                    }}
                    disabled={isUploading}
                    className="absolute -bottom-3 -right-3 w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl flex items-center justify-center border-4 border-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50 z-20 shadow-lg shadow-rose-200"
                    aria-label={t('nav.upload')}
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                  </button>
                  <input
                    ref={avatarInputRef}
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
                <h2 className="text-lg font-black text-gray-900 mb-1">{user.displayName || user.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                    {user.accountType === 'announcer' ? 'Anunciante' : 'Usuario'}
                  </span>
                  {user.premium && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-bold rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">Miembro desde {user.memberSince || 'Recientemente'}</p>
              </div>

              {/* Profile Completion Bar */}
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">Completado</span>
                  <span className={`text-xs font-black ${completionMetrics.percentage === 100 ? 'text-green-500' : 'text-rose-500'}`}>
                    {completionMetrics.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${completionMetrics.percentage < 40 ? 'bg-rose-500' :
                      completionMetrics.percentage < 80 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${completionMetrics.percentage}%` }}
                  ></div>
                </div>
                {completionMetrics.percentage < 100 && (
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    Completa tu {completionMetrics.missing[0]} para un perfil perfecto
                  </p>
                )}
              </div>

              {/* Tabs */}
              <nav className="grid grid-cols-4 gap-2 relative z-10">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const shortLabel = tab.label.includes(' ') ? tab.label.split(' ')[1] : tab.label;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        hapticFeedback('light');
                        setActiveTab(tab.id);
                      }}
                      title={tab.label}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative overflow-hidden group ${activeTab === tab.id
                        ? 'text-rose-700 bg-rose-50 border border-rose-100 shadow-sm'
                        : 'text-gray-500 bg-gray-50 border border-transparent hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-rose-600 drop-shadow-sm' : 'text-gray-400 group-hover:text-gray-600'}`} />
                      <span className="relative z-10 text-[8px] sm:text-[9px] font-bold leading-tight text-center truncate w-full">{shortLabel}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Stats Summary */}
              <div className="mt-8 pt-6 border-t border-gray-100/50 relative z-10">
                <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Visitas totales</span>
                  <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">1,247</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            {activeTab === 'profile' && (
              <div className="space-y-6">


                {/* Profile Header */}
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gray-50 to-transparent rounded-full opacity-50 pointer-events-none -mr-32 -mt-32"></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
                    <div>
                      <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">Información Personal</h2>
                      <p className="text-sm font-medium text-gray-500 mt-1">Gestiona los detalles públicos y privados de tu cuenta</p>
                    </div>
                    <button
                      onClick={() => editing ? handleSave() : setEditing(true)}
                      disabled={isSaving}
                      aria-busy={isSaving}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${editing
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5 focus-visible:ring-emerald-500'
                        : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-gray-300'
                        }`}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : (editing ? <Save className="w-4 h-4" aria-hidden="true" /> : <Edit className="w-4 h-4" aria-hidden="true" />)}
                      {isSaving ? 'Guardando...' : (editing ? 'Guardar Cambios' : 'Editar Perfil')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-rose-500" /> Nombre público
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.displayName}
                            onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                            placeholder="Tu nombre"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                            {user.displayName || user.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-rose-500" /> Correo electrónico
                        </label>
                        {editing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                            placeholder="correo@ejemplo.com"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                            {user.email}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Edad</label>
                          {editing ? (
                            <input
                              type="number"
                              value={formData.age}
                              onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white rounded-xl focus:border-rose-500 outline-none transition-all"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                              {user.age ? `${user.age} años` : 'No especificada'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Sexo</label>
                          {editing ? (
                            <select
                              value={formData.gender}
                              onChange={e => setFormData({ ...formData, gender: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white rounded-xl focus:border-rose-500 outline-none transition-all"
                            >
                              <option value="woman">Mujer</option>
                              <option value="man">Hombre</option>
                              <option value="transgender">Transexual</option>
                              <option value="gigolo">Gigoló</option>
                            </select>
                          ) : (
                            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium capitalize">
                              {user.gender ? (GENDER_LABELS[user.gender] || user.gender) : 'No especificado'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500" /> Ubicación
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white rounded-xl focus:border-rose-500 outline-none transition-all"
                            placeholder="Ciudad, Departamento"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                            {typeof user.location === 'object'
                              ? [(user.location as any).city, (user.location as any).department].filter(Boolean).join(', ')
                              : user.location || 'No especificada'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-rose-500" /> Teléfono
                        </label>
                        {editing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white rounded-xl focus:border-rose-500 outline-none transition-all"
                            placeholder="+57 300 000 0000"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                            {user.phone || 'No especificado'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-rose-500" /> Idiomas
                        </label>
                        {editing ? (
                          <div className="flex flex-wrap gap-2">
                            {['Español', 'Inglés', 'Francés', 'Portugués'].map(lang => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => {
                                  const langs = formData.languages.includes(lang)
                                    ? formData.languages.filter(l => l !== lang)
                                    : [...formData.languages, lang];
                                  setFormData({ ...formData, languages: langs });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.languages.includes(lang)
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl">
                            <div className="flex flex-wrap gap-2">
                              {(user.languages || []).map(lang => (
                                <span key={lang} className="px-2 py-1 bg-rose-100 text-rose-600 text-xs font-bold rounded">
                                  {lang}
                                </span>
                              ))}
                              {(user.languages || []).length === 0 && (
                                <span className="text-gray-400 text-xs italic">No especificados</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Biografía</label>
                    {editing ? (
                      <textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white rounded-xl focus:border-rose-500 outline-none transition-all resize-none"
                        placeholder="Cuéntanos sobre ti..."
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 leading-relaxed">
                        {user.bio || user.description || 'Sin biografía'}
                      </div>
                    )}
                  </div>
                </div>


              </div>
            )}

            {activeTab === 'ads' && (
              <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 animate-in slide-in-from-right duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-50 to-transparent rounded-full opacity-50 pointer-events-none -mr-32 -mt-32"></div>
                <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-6 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">Mis Anuncios</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Gestiona tus publicaciones activas y destaca tu perfil</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {/* Current Plan Mini Section */}
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-lg shadow-sm">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-amber-800 uppercase leading-none mb-1">Plan Actual</div>
                        <div className="text-xs font-black text-gray-900">
                          {user.premiumPlan === 'diamond' ? 'Diamante' : user.premiumPlan === 'gold' ? 'Oro' : 'Estándar'}
                        </div>
                      </div>
                    </div>

                    {/* Active Boosts Mini Section */}
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3">
                      <div className={`p-2 rounded-lg font-black text-xs ${userAds.some(ad => ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date()) ? 'bg-rose-500 text-white shadow-lg animate-pulse' : 'bg-gray-200 text-gray-500'}`}>
                        <Rocket className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-rose-800 uppercase leading-none mb-1">Boosts Activos</div>
                        <div className="text-xs font-black text-gray-900">
                          {userAds.filter(ad => ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date()).length} Activos
                        </div>
                      </div>
                    </div>

                    {/* Ad Limit Info */}
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center gap-3">
                      <div className={`p-2 rounded-lg font-black text-xs ${userAds.length >= (user.premiumPlan === 'diamond' ? 100 : user.premiumPlan === 'gold' ? 3 : 1) ? 'bg-rose-500 text-white' : 'bg-green-500 text-white'}`}>
                        {userAds.length}/{user.premiumPlan === 'diamond' ? '∞' : user.premiumPlan === 'gold' ? 3 : 1}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-900 uppercase leading-none mb-1">Límite</div>
                        <div className="text-[10px] text-gray-500 font-bold">
                          Anuncios
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {loadingAds ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Cargando tus anuncios...</p>
                  </div>
                ) : userAds.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userAds.map((ad) => (
                      <div key={ad._id || ad.id} className="group relative bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-rose-200 transition-all hover:bg-white hover:shadow-xl hover:shadow-rose-100/50">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-white shadow-sm">
                            <img
                              src={ad.photos?.find((p: any) => p.isMain)?.url || ad.photos?.[0]?.url || 'https://via.placeholder.com/150'}
                              alt={ad.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="font-black text-gray-900 truncate pr-8">{ad.title}</h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-rose-600 font-black text-sm">
                                ${ad.pricing?.basePrice?.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">/ {ad.pricing?.priceType}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {ad.isActive ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-black rounded-lg uppercase">Activo</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-500 text-[10px] font-black rounded-lg uppercase">Pausado</span>
                              )}
                              {ad.isVerified && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded-lg uppercase flex items-center gap-1">
                                  <Shield className="w-2 h-2" /> Verificado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions Overlay/Buttons */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200/50">
                          <button
                            onClick={() => onEditAd?.(ad)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white text-gray-700 rounded-xl text-xs font-black shadow-sm border border-gray-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleBoostAd(ad._id || ad.id)}
                            disabled={ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date()}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black shadow-sm border transition-all ${ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date()
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200'
                              }`}
                            title={ad.isBoosted ? 'Boost Activo' : 'Impulsar por 100 monedas'}
                          >
                            <Rocket className={`w-3.5 h-3.5 ${ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date() ? 'animate-bounce' : ''}`} />
                            {ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date() ? 'Impulsado' : 'Impulsar'}
                          </button>
                          <button
                            onClick={() => {
                              hapticFeedback('medium');
                              handleDeleteAd(ad._id || ad.id);
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                            aria-label={t('nav.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Stats Indicator */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-100">
                          <Eye className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{ad.views || 0}</span>
                        </div>
                      </div>
                    ))}

                    {/* Add New Slot if under limit */}
                    {userAds.length < (user.premiumPlan === 'diamond' ? 100 : user.premiumPlan === 'gold' ? 3 : 1) && (
                      <button
                        onClick={onCreateAd}
                        className="flex flex-col items-center justify-center p-6 bg-rose-50/30 rounded-2xl border-2 border-dashed border-rose-100 hover:bg-rose-50 hover:border-rose-300 transition-all group min-h-[160px]"
                      >
                        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform mb-3 border border-rose-50">
                          <PlusCircle className="w-6 h-6 text-rose-500" />
                        </div>
                        <span className="text-xs font-black text-rose-600 uppercase">Publicar Nuevo Anuncio</span>
                        <span className="text-[10px] text-gray-400 mt-1">Dispones de {(user.premiumPlan === 'diamond' ? 100 : user.premiumPlan === 'gold' ? 3 : 1) - userAds.length} espacios</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                      <Eye className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Aún no tienes anuncios</h3>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">Crea tu primer anuncio para empezar a recibir propuestas de contacto hoy mismo.</p>
                    <button
                      onClick={onCreateAd}
                      className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-200 flex items-center gap-2 mx-auto">
                      <PlusCircle className="w-5 h-5" />
                      Crear mi primer anuncio
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 animate-in slide-in-from-right duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-50 to-transparent rounded-full opacity-50 pointer-events-none -mr-32 -mt-32"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">Estadísticas</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Analiza el rendimiento y alcance de tu perfil</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all">7 días</button>
                    <button className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-200 transition-all">30 días</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl text-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-gray-400">Alcance total</span>
                      <TrendingUp className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-4xl font-black mb-2">5,842</div>
                    <div className="text-xs text-green-400 font-bold">+18.2% vs mes anterior</div>
                  </div>
                  <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-rose-600">Interacciones</span>
                      <MessageCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-4xl font-black text-gray-900 mb-2">412</div>
                    <div className="text-xs text-rose-500 font-bold">12.5% de conversión</div>
                  </div>
                </div>


                <div className="mb-0">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Métricas en Detalle</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      const isPositive = stat.change.startsWith('+');
                      return (
                        <div key={index} className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-5 hover:shadow-xl hover:shadow-rose-100/40 transition-all cursor-pointer relative overflow-hidden">
                          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                          <div className="relative z-10 flex items-center justify-between mb-4">
                            <div className={`p-2.5 ${stat.color.replace('text-', 'bg-')}/10 rounded-2xl ring-1 ring-inset ring-${stat.color.replace('text-', '')}/20`}>
                              <Icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                              {stat.change}
                            </span>
                          </div>
                          <div className="relative z-10 text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight mb-1">{stat.value}</div>
                          <div className="relative z-10 text-[8px] sm:text-[9px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-in slide-in-from-right duration-300">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Configuración</h2>

                {/* Settings Header */}
                <div className="mb-8 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gray-50 to-transparent rounded-full opacity-50 pointer-events-none -mr-32 -mt-32"></div>

                  {/* Password Change Section */}
                  <div className="mb-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900">Cambiar Contraseña</h3>
                          <p className="text-sm font-medium text-gray-500">Actualiza tu clave de acceso periódico</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:scale-95 transition-all w-full sm:w-auto"
                      >
                        Actualizar
                      </button>
                    </div>
                  </div>

                  {/* MFA Section */}
                  <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900">Autenticación de Dos Factores (MFA)</h3>
                          <p className="text-sm font-medium text-gray-500">Agrega una capa de protección adicional</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMfaEnabled(!mfaEnabled)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${mfaEnabled ? 'bg-rose-500' : 'bg-gray-300'
                          }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${mfaEnabled ? 'translate-x-7' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                    {mfaEnabled && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Estado:</strong> MFA Activado (Frontend Only)
                        </p>
                        <p className="text-xs text-gray-500">
                          La implementación del backend será completada posteriormente.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Deletion Section */}
                <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                    <h3 className="text-lg font-bold text-rose-900">Zona Peligrosa</h3>
                  </div>
                  <p className="text-sm text-rose-700 mb-4">
                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, está seguro.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all"
                  >
                    Eliminar Mi Cuenta
                  </button>

                  {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">¿Estás seguro?</h3>
                        <p className="text-gray-600 mb-6">
                          Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await deleteAccount();
                                toast.success('Cuenta eliminada');
                                window.location.href = '/';
                              } catch (error) {
                                toast.error('Error al eliminar la cuenta');
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all"
                          >
                            Sí, Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 animate-in fade-in slide-in-from-right duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Estado de Verificación
                </h3>

                {user.verified ? (
                  <div className="bg-green-100 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700">
                    <CheckCircle className="w-8 h-8" />
                    <div>
                      <div className="font-bold text-lg">¡Tu perfil está verificado!</div>
                      <p className="text-sm opacity-90">Tu insignia de verificación es visible para todos los usuarios.</p>
                    </div>
                  </div>
                ) : user.verificationRequests?.status === 'pending' ? (
                  <div className="bg-amber-100 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-700">
                    <Clock className="w-8 h-8" />
                    <div>
                      <div className="font-bold text-lg">Verificación en proceso</div>
                      <p className="text-sm opacity-90">Tus documentos han sido enviados y están siendo revisados por nuestro equipo. Esto puede tomar hasta 24 horas.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.verificationRequests?.status === 'rejected' && (
                      <div className="bg-red-100 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                        <div>
                          <div className="font-bold">Solicitud rechazada</div>
                          <p className="text-sm">{user.verificationRequests.rejectionReason || 'La documentación no cumplía con los requisitos.'}</p>
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm">
                      <p className="text-sm text-gray-600 mb-4">
                        Para verificar tu perfil y obtener la insignia <Shield className="w-3 h-3 inline text-blue-500" />, por favor sube los siguientes documentos:
                      </p>

                      <form onSubmit={handleVerificationSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                            <input
                              type="file"
                              id="idProof"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => setIdProof(e.target.files?.[0] || null)}
                            />
                            <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <div className="font-bold text-sm text-gray-700">Documento de Identidad</div>
                            <div className="text-xs text-gray-500">Frente del documento</div>
                            {idProof && (
                              <div className="mt-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                                {idProof.name}
                              </div>
                            )}
                          </div>

                          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                            <input
                              type="file"
                              id="photoProof"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => setPhotoProof(e.target.files?.[0] || null)}
                            />
                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <div className="font-bold text-sm text-gray-700">Selfie con Documento y Nota</div>
                            <div className="text-xs text-gray-500">Sosteniendo el documento y una hoja con nombre y fecha</div>
                            {photoProof && (
                              <div className="mt-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                                {photoProof.name}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isVerifying || !idProof || !photoProof}
                          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Enviar solicitud de verificación'
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Billing/Payment Methods Tab */}
            {activeTab === 'billing' && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Métodos de Pago</h2>

                {/* Payment Methods List */}
                <div className="space-y-4 mb-6">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-rose-500" />
                        <div>
                          <div className="font-bold text-gray-900">{method.type}</div>
                          <div className="text-sm text-gray-500">{method.details}</div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const newMethods = paymentMethods.filter((_, i) => i !== index);
                            setPaymentMethods(newMethods);
                            await onUpdateProfile({ paymentMethods: newMethods });
                            toast.success('Método de pago eliminado');
                          } catch (error) {
                            console.error('Error deleting payment method:', error);
                            toast.error('Error al eliminar el método de pago');
                            // Revert on error
                            setPaymentMethods(paymentMethods);
                          }
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {paymentMethods.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No tienes métodos de pago guardados</p>
                    </div>
                  )}
                </div>

                {/* Add Payment Method Form */}
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Agregar Método de Pago</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                      <select
                        value={newPaymentMethod.type}
                        onChange={e => setNewPaymentMethod({ ...newPaymentMethod, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="Nequi">Nequi</option>
                        <option value="Daviplata">Daviplata</option>
                        <option value="Bancolombia">Bancolombia</option>
                        <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                        <option value="Efecty">Efecty</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Detalles</label>
                      <input
                        type="text"
                        value={newPaymentMethod.details}
                        onChange={e => setNewPaymentMethod({ ...newPaymentMethod, details: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Número de teléfono, cuenta, etc."
                      />
                    </div>
                    <button
                      onClick={async () => {
                        const { type, details } = newPaymentMethod;
                        if (type && details) {
                          try {
                            setSavingPayment(true);
                            const updatedMethods = [...paymentMethods, { type, details }];
                            setPaymentMethods(updatedMethods);

                            // Save to backend
                            await onUpdateProfile({ paymentMethods: updatedMethods });

                            setNewPaymentMethod({ type: '', details: '' });
                            toast.success('Método de pago agregado exitosamente');
                          } catch (error: any) {
                            console.error('Error saving payment method:', error);
                            toast.error(error?.response?.data?.message || 'Error al guardar el método de pago');
                            // Revert on error
                            setPaymentMethods(paymentMethods);
                          } finally {
                            setSavingPayment(false);
                          }
                        } else {
                          toast.error('Por favor completa todos los campos');
                        }
                      }}
                      disabled={savingPayment}
                      className="w-full px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {savingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4 inline mr-2" />
                          Agregar Método
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-50 to-transparent rounded-full opacity-50 pointer-events-none -mr-32 -mt-32"></div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
                    <div>
                      <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">Mis Citas</h2>
                      <p className="text-sm font-medium text-gray-500 mt-1">Gestiona tus encuentros y califica a los usuarios</p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => setAppointmentViewMode('list')}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${appointmentViewMode === 'list' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      > Lista </button>
                      <button
                        onClick={() => setAppointmentViewMode('calendar')}
                        className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${appointmentViewMode === 'calendar' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      > Calendario </button>
                    </div>
                  </div>
                  {/* Calendar View Toggle Here */}
                  {loadingAppointments ? (
                    <div className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
                    </div>
                  ) : appointmentViewMode === 'list' ? (
                    <div className="space-y-4">
                      {appointments.length > 0 ? (
                        appointments.map((appt: any) => {
                          const isAnnouncer = user.role === 'announcer' || (user as any).accountType === 'announcer';
                          const partner = isAnnouncer ? appt.client : appt.announcer;
                          const canRate = appt.status === 'completed' && (
                            (isAnnouncer && !appt.clientReviewed) ||
                            (!isAnnouncer && !appt.announcerReviewed)
                          );

                          return (
                            <div key={appt._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <img src={partner?.avatar || `https://ui-avatars.com/api/?name=${partner?.name}`} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                  <div className="font-black text-gray-900">{partner?.name}</div>
                                  <div className="text-[10px] text-gray-500 flex items-center gap-1 font-bold uppercase tracking-wider">
                                    <Calendar className="w-3 h-3" /> {new Date(appt.date).toLocaleDateString()} - {appt.time}
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-medium">📍 {appt.location}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isUpdatingStatus === appt._id ? (
                                  <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                                ) : (
                                  <>
                                    {appt.status === 'pending' && isAnnouncer && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateStatus(appt._id, 'confirmed')}
                                          className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-black rounded-lg hover:bg-green-600 transition-all uppercase tracking-widest"
                                        > Confirmar </button>
                                        <button
                                          onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                                          className="px-3 py-1.5 bg-gray-200 text-gray-600 text-[10px] font-black rounded-lg hover:bg-gray-300 transition-all uppercase tracking-widest"
                                        > Cancelar </button>
                                      </>
                                    )}
                                    {appt.status === 'confirmed' && (
                                      <button
                                        onClick={() => handleUpdateStatus(appt._id, 'completed')}
                                        className="px-3 py-1.5 bg-blue-500 text-white text-[10px] font-black rounded-lg hover:bg-blue-600 transition-all uppercase tracking-widest"
                                      > Finalizar </button>
                                    )}
                                    {appt.status === 'completed' && (
                                      <span className="px-3 py-1.5 bg-green-100 text-green-600 text-[10px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Completada
                                      </span>
                                    )}
                                    {canRate && (
                                      <button
                                        onClick={() => setShowReviewModal(appt._id)}
                                        className="px-3 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-lg hover:bg-amber-600 transition-all shadow-md shadow-amber-100 uppercase tracking-widest flex items-center gap-1"
                                      >
                                        <Star className="w-3 h-3" /> Calificar
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                          <p className="text-gray-400 font-bold italic">Aún no tienes citas programadas</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex items-center justify-between mb-6 bg-rose-50 p-4 rounded-2xl">
                        <button
                          onClick={() => {
                            setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
                            setSelectedCalendarDay(null);
                          }}
                          className="p-2 hover:bg-white rounded-xl transition-all text-rose-600 shadow-sm"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-black text-rose-900 uppercase tracking-widest">
                          {currentCalendarDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                          onClick={() => {
                            setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
                            setSelectedCalendarDay(null);
                          }}
                          className="p-2 hover:bg-white rounded-xl transition-all text-rose-600 shadow-sm"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                          <div key={d} className="text-center py-2 text-[10px] font-black text-gray-400 uppercase tracking-wider">{d}</div>
                        ))}

                        {(() => {
                          const year = currentCalendarDate.getFullYear();
                          const month = currentCalendarDate.getMonth();
                          const firstDay = new Date(year, month, 1).getDay();
                          const daysInMonth = new Date(year, month + 1, 0).getDate();
                          const days = [];

                          // Empty spots for previous month
                          for (let i = 0; i < firstDay; i++) {
                            days.push(<div key={`empty-${i}`} className="aspect-square bg-gray-50/50 rounded-xl"></div>);
                          }

                          // Days of current month
                          for (let day = 1; day <= daysInMonth; day++) {
                            const dateObj = new Date(year, month, day);
                            const dateStr = dateObj.toLocaleDateString('en-CA');
                            const dayAppts = appointments.filter((a: any) => {
                              try {
                                const aDate = new Date(a.date);
                                // Normalize both to YYYY-MM-DD for comparison
                                return aDate.toLocaleDateString('en-CA') === dateStr;
                              } catch (e) { return false; }
                            });
                            const isToday = new Date().toLocaleDateString('en-CA') === dateStr;
                            const isSelected = selectedCalendarDay === dateStr;

                            days.push(
                              <button
                                key={day}
                                onClick={() => setSelectedCalendarDay(isSelected ? null : dateStr)}
                                className={`aspect-square relative flex flex-col items-center justify-center rounded-xl border transition-all ${isSelected ? 'bg-rose-600 border-rose-600 shadow-lg scale-105 z-10' :
                                  isToday ? 'bg-rose-50 border-rose-200' :
                                    'bg-white border-gray-100 hover:border-rose-100'
                                  }`}
                              >
                                <span className={`text-xs font-black ${isSelected ? 'text-white' : isToday ? 'text-rose-600' : 'text-gray-600'}`}>{day}</span>
                                {dayAppts.length > 0 && (
                                  <div className="absolute bottom-1.5 flex gap-0.5">
                                    {dayAppts.slice(0, 3).map((a: any, idx: number) => (
                                      <div key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/40' : a.status === 'confirmed' ? 'bg-green-500' : a.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                    ))}
                                    {dayAppts.length > 3 && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-300'}`}></div>}
                                  </div>
                                )}
                              </button>
                            );
                          }
                          return days;
                        })()}
                      </div>

                      <div className="mt-8 flex flex-wrap gap-4 justify-center border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pendiente</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Confirmada</div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Finalizada</div>
                      </div>

                      {selectedCalendarDay && (
                        <div className="mt-8 animate-in slide-in-from-bottom duration-300">
                          <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-rose-500" />
                            Citas para el {new Date(selectedCalendarDay + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                          </h4>
                          <div className="space-y-3">
                            {appointments.filter(a => new Date(a.date).toLocaleDateString('en-CA') === selectedCalendarDay).map(appt => {
                              const isAnnouncer = user.role === 'announcer' || (user as any).accountType === 'announcer';
                              const partner = isAnnouncer ? appt.client : appt.announcer;
                              return (
                                <div key={appt._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <img src={partner?.avatar || `https://ui-avatars.com/api/?name=${partner?.name}`} className="w-10 h-10 rounded-lg object-cover" />
                                    <div>
                                      <div className="text-xs font-black text-gray-900">{partner?.name}</div>
                                      <div className="text-[10px] text-gray-500 font-bold">{appt.time} - {appt.location}</div>
                                    </div>
                                  </div>
                                  <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${appt.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                                    appt.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                      'bg-blue-100 text-blue-600'
                                    }`}>
                                    {appt.status}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {showReviewModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative">
                <button onClick={() => setShowReviewModal(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
                  <X className="w-5 h-5" />
                </button>

                <div className="p-8">
                  <div className="p-4 bg-amber-50 rounded-2xl w-fit mb-6">
                    <Star className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Calificar Encuentro</h3>
                  <p className="text-gray-500 font-medium text-sm mb-6 leading-relaxed">Tu opinión ayuda a mantener la seguridad de la comunidad.</p>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Calificación General</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                            <Star className={`w-8 h-8 ${reviewForm.rating >= s ? 'text-amber-500 fill-amber-500' : 'text-gray-200'} transition-all hover:scale-110`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {getReviewCategories().map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-600">{label}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                onClick={() => setReviewForm({
                                  ...reviewForm,
                                  categories: { ...reviewForm.categories, [key]: s }
                                })}
                                className={`w-5 h-5 rounded-full ${(reviewForm.categories[key] || 0) >= s ? 'bg-amber-500' : 'bg-gray-100'} transition-all`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Comentario</label>
                      <textarea
                        placeholder="Cuéntanos cómo fue tu experiencia..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold text-sm resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSubmitReview}
                      className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black shadow-xl shadow-amber-200 hover:bg-amber-600 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                    >
                      Enviar Calificación
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                      toast.error('Las contraseñas no coinciden');
                      return;
                    }
                    if (!passwordData.currentPassword || !passwordData.newPassword) {
                      toast.error('Por favor completa todos los campos');
                      return;
                    }
                    try {
                      await changePassword({
                        currentPassword: passwordData.currentPassword,
                        newPassword: passwordData.newPassword
                      });
                      toast.success('Contraseña cambiada exitosamente');
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowPasswordModal(false);
                    } catch (error: any) {
                      toast.error(error?.response?.data?.message || 'Error al cambiar la contraseña');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}