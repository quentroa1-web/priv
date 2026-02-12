import { useState, useMemo, useEffect } from 'react';
import { User } from '../../types';
import { uploadAvatar, getMyAds, deleteAd as deleteAdApi, changePassword, deleteAccount, requestVerification, boostAd } from '../../services/api';
import {
  User as UserIcon, Mail, Phone, MapPin, Shield,
  Eye, Edit, Camera, Save, X, Globe, Clock, Heart,
  MessageCircle, CreditCard, Settings, ArrowLeft,
  TrendingUp, CheckCircle, Crown, AlertCircle, Loader2,
  Trash2, PlusCircle, Rocket
} from 'lucide-react';

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
  const [editing, setEditing] = useState(false);
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
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>(user.paymentMethods || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [idProof, setIdProof] = useState<File | null>(null);
  const [photoProof, setPhotoProof] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idProof || !photoProof) {
      alert('Por favor sube ambos documentos (Foto sosteniendo hoja con nombre y fecha, y Documento de identidad)');
      return;
    }

    const formData = new FormData();
    formData.append('idProof', idProof);
    formData.append('photoProof', photoProof);

    try {
      setIsVerifying(true);
      await requestVerification(formData);
      alert('Solicitud enviada con éxito. Un administrador revisará tus documentos pronto.');
      window.location.reload(); // Simple reload to refresh user data for now
    } catch (error) {
      console.error(error);
      alert('Error al enviar solicitud de verificación');
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

  // Load payment methods from user or localStorage (temporary until backend is fixed)
  useEffect(() => {
    if (user.paymentMethods && user.paymentMethods.length > 0) {
      setPaymentMethods(user.paymentMethods);
      localStorage.setItem(`paymentMethods_${user.id || user._id}`, JSON.stringify(user.paymentMethods));
    } else {
      // Try to load from localStorage as fallback
      const stored = localStorage.getItem(`paymentMethods_${user.id || user._id}`);
      if (stored) {
        try {
          setPaymentMethods(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing stored payment methods:', e);
        }
      }
    }
  }, [user.paymentMethods, user.id, user._id]);

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
        alert('No se pudo eliminar el anuncio');
      }
    }
  };

  const handleBoostAd = async (adId: string) => {
    if (window.confirm('¿Quieres impulsar este anuncio por 100 monedas? Subirá al inicio de su categoría.')) {
      try {
        const res = await boostAd(adId);
        if (res.data.success) {
          alert('¡Anuncio impulsado con éxito!');
          fetchUserAds(); // Refresh list
          // Update local user wallet if needed (optional, or refresh profile)
          window.location.reload();
        }
      } catch (error: any) {
        console.error('Error boosting ad:', error);
        alert(error.response?.data?.error || 'No se pudo impulsar el anuncio. Verifica tu saldo.');
      }
    }
  };

  const handleSave = async () => {
    try {
      await onUpdateProfile(formData);
      setEditing(false);
    } catch (error) {
      alert('Error al guardar los cambios');
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
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
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
    { id: 'stats', label: 'Estadísticas', icon: TrendingUp },
    { id: 'settings', label: 'Configuración', icon: Settings },
    ...(user.role === 'announcer' || (user as any).accountType === 'announcer' ? [{ id: 'services', label: 'Servicios/Precios', icon: Crown }] : []),
    { id: 'verification', label: 'Verificación', icon: Shield },
    { id: 'billing', label: 'Facturación', icon: CreditCard }
  ];

  return (
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
            <h1 className="text-2xl font-black text-gray-900">Mi Perfil</h1>
            <p className="text-sm text-gray-500">Gestiona tu cuenta y anuncios</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sticky top-6">
              {/* User Card */}
              <div className="text-center mb-6">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  {user.avatar && !user.avatar.includes('demo/image/upload') ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-full h-full rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-rose-50 border-4 border-white shadow-lg flex items-center justify-center text-rose-300">
                      <GenderIcon gender={user.gender} className="w-12 h-12" />
                    </div>
                  )}
                  <button
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center border-2 border-white hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  </button>
                  <input
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
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>

              {/* Stats Summary */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visitas totales</span>
                  <span className="text-lg font-black text-gray-900">1,247</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Banner Verification Promo - Only if not verified and not pending */}
                {!user.verified && user.verificationRequests?.status !== 'pending' && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10 flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/20">
                          <Shield className="w-3.5 h-3.5" /> Verificación disponible
                        </div>
                        <h3 className="text-xl font-black mb-2">¡Verifica tu cuenta y destaca!</h3>
                        <p className="text-blue-100 text-sm mb-4 leading-relaxed max-w-lg">
                          Obtén tu insignia de verificado para generar más confianza, mejorar tu visibilidad en las búsquedas y acceder a soporte prioritario.
                        </p>
                        <button
                          onClick={() => setActiveTab('verification')}
                          className="px-5 py-2.5 bg-white text-blue-600 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          Verificar mi identidad <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                      </div>
                      <div className="hidden sm:flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm border border-white/30 shrink-0">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Información del Perfil</h2>
                      <p className="text-sm text-gray-500">Actualiza tu información personal</p>
                    </div>
                    <button
                      onClick={() => editing ? handleSave() : setEditing(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${editing
                        ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-green-100'
                        : 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-rose-100'
                        }`}
                    >
                      {editing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      {editing ? 'Guardar cambios' : 'Editar perfil'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              {user.gender || 'No especificado'}
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
                            {user.location || 'No especificada'}
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

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 ${stat.color.replace('text-', 'bg-')} bg-opacity-10 rounded-lg`}>
                            <Icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <span className="text-xs font-bold text-green-600">{stat.change}</span>
                        </div>
                        <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'ads' && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Mis Anuncios</h2>
                    <p className="text-sm text-gray-500">Gestiona tus publicaciones activas</p>
                  </div>

                  {/* Ad Limit Info */}
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3">
                    <div className={`p-2 rounded-lg font-black text-xs ${userAds.length >= (user.premium ? 3 : 1) ? 'bg-rose-500 text-white' : 'bg-green-500 text-white'}`}>
                      {userAds.length}/{user.premium ? 3 : 1}
                    </div>
                    <div>
                      <div className="text-xs font-black text-gray-900 uppercase">Límite de Anuncios</div>
                      <div className="text-[10px] text-gray-500">
                        {user.premium ? 'Plan Premium: 3 anuncios' : 'Plan Gratis: 1 anuncio'}
                      </div>
                    </div>
                    {!user.premium && userAds.length >= 1 && (
                      <button className="ml-2 px-3 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg hover:bg-rose-600 transition-all">
                        Mejorar a Premium
                      </button>
                    )}
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
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-black shadow-sm border border-amber-200 hover:bg-amber-200 transition-all"
                            title="Impulsar por 100 monedas"
                          >
                            <Rocket className="w-3.5 h-3.5" />
                            Impulsar
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad._id || ad.id)}
                            className="w-10 h-10 flex items-center justify-center bg-white text-gray-400 rounded-xl shadow-sm border border-gray-100 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
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
                    {userAds.length < (user.premium ? 3 : 1) && (
                      <button
                        onClick={onCreateAd}
                        className="flex flex-col items-center justify-center p-6 bg-rose-50/30 rounded-2xl border-2 border-dashed border-rose-100 hover:bg-rose-50 hover:border-rose-300 transition-all group min-h-[160px]"
                      >
                        <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform mb-3 border border-rose-50">
                          <PlusCircle className="w-6 h-6 text-rose-500" />
                        </div>
                        <span className="text-xs font-black text-rose-600 uppercase">Publicar Nuevo Anuncio</span>
                        <span className="text-[10px] text-gray-400 mt-1">Dispones de {(user.premium ? 3 : 1) - userAds.length} espacios</span>
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
                    <button className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-200 flex items-center gap-2 mx-auto">
                      <PlusCircle className="w-5 h-5" />
                      Crear mi primer anuncio
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Estadísticas</h2>
                    <p className="text-sm text-gray-500">Analiza el rendimiento de tu perfil</p>
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

                <div className="h-48 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-400 font-bold text-sm italic">
                  Gráfico de rendimiento (Próximamente)
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-in slide-in-from-right duration-300">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Configuración</h2>

                {/* Password Change Section */}
                <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-rose-500" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Cambiar Contraseña</h3>
                        <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>

                {/* MFA Section */}
                <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-rose-500" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Autenticación de Dos Factores (MFA)</h3>
                        <p className="text-sm text-gray-500">Agrega una capa extra de seguridad</p>
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
                                alert('Cuenta eliminada');
                                window.location.href = '/';
                              } catch (error) {
                                alert('Error al eliminar la cuenta');
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

                            // Save to localStorage (temporary workaround)
                            localStorage.setItem(`paymentMethods_${(user as any).id || (user as any)._id}`, JSON.stringify(newMethods));

                            await onUpdateProfile({ paymentMethods: newMethods });
                            alert('Método de pago eliminado');
                          } catch (error) {
                            console.error('Error deleting payment method:', error);
                            alert('Error al eliminar el método de pago');
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
                        id="payment-type"
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
                        id="payment-details"
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        placeholder="Número de teléfono, cuenta, etc."
                      />
                    </div>
                    <button
                      onClick={async () => {
                        const typeSelect = document.getElementById('payment-type') as HTMLSelectElement;
                        const detailsInput = document.getElementById('payment-details') as HTMLInputElement;
                        const type = typeSelect.value;
                        const details = detailsInput.value;

                        if (type && details) {
                          try {
                            setSavingPayment(true);
                            const newMethods = [...paymentMethods, { type, details }];
                            setPaymentMethods(newMethods);

                            // Save to localStorage (temporary workaround)
                            localStorage.setItem(`paymentMethods_${user.id || user._id}`, JSON.stringify(newMethods));

                            // Save to backend
                            await onUpdateProfile({ paymentMethods: newMethods });

                            typeSelect.value = '';
                            detailsInput.value = '';
                            alert('Método de pago agregado exitosamente');
                          } catch (error: any) {
                            console.error('Error saving payment method:', error);
                            alert(error?.response?.data?.message || 'Error al guardar el método de pago');
                            // Revert on error
                            setPaymentMethods(paymentMethods);
                          } finally {
                            setSavingPayment(false);
                          }
                        } else {
                          alert('Por favor completa todos los campos');
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

            {activeTab === 'services' && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Mis Servicios y Precios</h2>
                    <p className="text-sm text-gray-500">Define los paquetes que puedes ofrecer en el chat</p>
                  </div>
                  <button
                    onClick={() => {
                      const label = prompt('Nombre del servicio (ej: Pack 5 fotos):');
                      const price = parseInt(prompt('Precio en monedas:', '100') || '0');
                      if (label && price > 0) {
                        const newList = [...(formData.priceList || []), { label, price, description: '' }];
                        setFormData({ ...formData, priceList: newList });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Agregar Servicio
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.priceList || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                      <div>
                        <div className="font-black text-gray-900">{item.label}</div>
                        <div className="flex items-center gap-1 text-rose-600 font-black">
                          <Crown className="w-3 h-3" /> {item.price} monedas
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newList = formData.priceList.filter((_: any, i: number) => i !== idx);
                          setFormData({ ...formData, priceList: newList });
                        }}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(formData.priceList || []).length === 0 && (
                    <div className="md:col-span-2 py-10 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                      <p className="text-gray-400 font-bold italic">No has definido servicios aún. Agrégalos para vender contenido en el chat.</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-green-500 text-white rounded-xl font-black hover:bg-green-600 shadow-lg shadow-green-100 transition-all"
                  >
                    Guardar Precios
                  </button>
                </div>
              </div>
            )}
          </div>
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
                      alert('Las contraseñas no coinciden');
                      return;
                    }
                    if (!passwordData.currentPassword || !passwordData.newPassword) {
                      alert('Por favor completa todos los campos');
                      return;
                    }
                    try {
                      await changePassword({
                        currentPassword: passwordData.currentPassword,
                        newPassword: passwordData.newPassword
                      });
                      alert('Contraseña cambiada exitosamente');
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowPasswordModal(false);
                    } catch (error: any) {
                      alert(error?.response?.data?.message || 'Error al cambiar la contraseña');
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