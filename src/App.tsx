import { Suspense, lazy, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiService, getAds, getMyAds } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FilterPanel } from './components/FilterPanel';
import { UserCard } from './components/UserCard';
import { UserDetailModal } from './components/UserDetailModal';
import { StoreModal } from './components/wallet/StoreModal';
import { COLOMBIA_LOCATIONS } from './data/colombiaLocations';
import { User } from './types';
import { TrendingUp, Shield, Loader2, Search, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Lazy load heavy components
const Login = lazy(() => import('./components/auth/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./components/auth/Register').then(module => ({ default: module.Register })));
const CreateAd = lazy(() => import('./components/CreateAd').then(module => ({ default: module.CreateAd })));
const UserProfile = lazy(() => import('./components/user/UserProfile').then(module => ({ default: module.UserProfile })));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(module => ({ default: module.AdminPanel })));
const Messaging = lazy(() => import('./components/messaging/Messaging').then(module => ({ default: module.Messaging })));
const Reviews = lazy(() => import('./components/reviews/Reviews').then(module => ({ default: module.Reviews })));
const PremiumInfo = lazy(() => import('./components/PremiumInfo').then(module => ({ default: module.PremiumInfo })));
const WalletView = lazy(() => import('./components/wallet/WalletView').then(module => ({ default: module.WalletView })));

type View = 'home' | 'login' | 'register' | 'createAd' | 'profile' | 'admin' | 'messages' | 'reviews' | 'favorites' | 'premium-info' | 'wallet';

function AppContent() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ads, setAds] = useState<User[]>([]);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [messageTargetUser, setMessageTargetUser] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchFilters, setSearchFilters] = useState<any>({
    sex: '',
    departamento: '',
    ciudad: '',
    barrio: '',
    zonaEspecifica: '',
    minPrice: 0,
    maxPrice: 5000000,
    minAge: 18,
    maxAge: 65,
    onlyVerified: false,
    onlyOnline: false,
    onlyPremium: false
  });

  const { user, logout, isAdmin, isAnnouncer, isLoggedIn, updateUser } = useAuth();
  const [favorites, setFavorites] = useState<User[]>([]);

  // Load favorites from local storage
  useEffect(() => {
    const stored = localStorage.getItem(`favorites_${user?.id || 'guest'}`);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing favorites', e);
      }
    }
  }, [user?.id]);

  const toggleFavorite = (targetUser: User) => {
    const isFavorite = favorites.some(f => f.id === targetUser.id);
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter(f => f.id !== targetUser.id);
    } else {
      newFavorites = [...favorites, targetUser];
    }
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${user?.id || 'guest'}`, JSON.stringify(newFavorites));
  };

  // Poll for unread messages
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchUnread = async () => {
      try {
        const res = await apiService.getUnreadCount();
        if (res.data.success) {
          setUnreadCount(res.data.count);
        }
      } catch (error) {
        console.error('Error fetching unread count', error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setSidebarOpen(false);
    if (view === 'wallet') {
      setIsStoreOpen(false); // Close store modal if navigating to WalletView
    }
  };

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const res = await getAds();
        const mappedAds = res.data.data.map((ad: any) => {
          // Normalize gender for filtering
          let gender = ad.category?.toLowerCase();
          if (gender === 'mujer') gender = 'woman';
          if (gender === 'hombre') gender = 'man';
          if (gender === 'trans') gender = 'transgender';

          return {
            ...ad,
            id: ad._id,
            uid: ad.user?._id || ad.user,
            name: ad.title,
            displayName: ad.title,
            gender: gender, // Use normalized gender
            age: ad.age, // Ensure age is mapped
            location: `${ad.location.city}, ${ad.location.department}`,
            locationData: ad.location, // Store raw location data for precise filtering
            avatar: ad.photos.find((p: any) => p.isMain)?.url || ad.photos[0]?.url || '',
            photoURL: ad.photos.find((p: any) => p.isMain)?.url || ad.photos[0]?.url || '',
            images: ad.photos.map((p: any) => p.url),
            gallery: ad.photos.map((p: any) => p.url),
            bio: ad.description,
            description: ad.description,
            price: `$${ad.pricing.basePrice.toLocaleString()}`,
            services: [...(ad.services || []), ...(ad.customServices || [])],
            availability: (ad.availability?.days || []).map((d: string) => {
              const map: any = { 'lunes': 'Lun', 'martes': 'Mar', 'miercoles': 'Mié', 'jueves': 'Jue', 'viernes': 'Vie', 'sabado': 'Sáb', 'domingo': 'Dom' };
              return map[d] || d;
            }),
            rating: 5.0,
            reviewCount: 0,
            memberSince: new Date(ad.createdAt).toLocaleDateString(),
            responseTime: '15 min',
            premium: ad.plan === 'premium' || ad.plan === 'vip' || ad.plan === 'gold' || ad.plan === 'diamond',
            premiumPlan: ad.plan,
            priority: ad.priority,
            lastBumpDate: ad.lastBumpDate,
            attendsTo: (ad.attendsTo || []).map((a: string) => {
              const map: any = { 'hombres': 'Hombres', 'mujeres': 'Mujeres', 'parejas': 'Parejas', 'todos': 'Todos' };
              return map[a] || a;
            }),
            placeType: Array.isArray(ad.location?.placeType) ? ad.location.placeType : [ad.location?.placeType].filter(Boolean),
            priceList: ad.user?.priceList || [],
            role: ad.user?.role || 'announcer',
            verified: ad.isVerified || ad.user?.verified,
            idVerified: ad.isVerified || ad.user?.verified,
            photoVerified: ad.isVerified || ad.user?.verified,
            online: ad.user?.isOnline,
            isOnline: ad.user?.isOnline,
          };
        });

        setAds(mappedAds);
      } catch (error) {
        console.error('Error fetching ads:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMyAds = async () => {
      if (isLoggedIn && isAnnouncer) {
        try {
          const res = await getMyAds();
          setMyAds(res.data.data || []);
        } catch (error) {
          console.error('Error fetching my ads:', error);
        }
      }
    };

    fetchAds();
    fetchMyAds();
  }, [currentView, isLoggedIn, isAnnouncer]);

  const handleProtectedNavigation = (view: View) => {
    if (!isLoggedIn && view !== 'home' && view !== 'login' && view !== 'register') {
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
  };

  const handleLogout = () => {
    logout();
    setCurrentView('home');
  };

  const handleOpenMessage = (userId: string) => {
    setMessageTargetUser(userId);
    setCurrentView('messages');
    // Modal will close because we're changing view
    // selectedUser will be cleared after Messaging uses it
  };

  // Filter users based on search
  const filteredUsers = ads.filter((u: User) => {
    // Keyword Search
    if (searchFilters.keyword) {
      const kw = searchFilters.keyword.toLowerCase();
      const match =
        u.name?.toLowerCase().includes(kw) ||
        u.displayName?.toLowerCase().includes(kw) ||
        u.bio?.toLowerCase().includes(kw) ||
        u.description?.toLowerCase().includes(kw) ||
        u.location?.toLowerCase().includes(kw) ||
        u.locationData?.neighborhood?.toLowerCase().includes(kw) ||
        u.locationData?.specificZone?.toLowerCase().includes(kw);
      if (!match) return false;
    }

    // Basic Search/Gender Filter
    if (searchFilters.sex && searchFilters.sex !== 'all') {
      const sex = searchFilters.sex.toLowerCase();
      if (u.gender?.toLowerCase() !== sex) return false;
    }

    // Location Filter
    if (searchFilters.departamento && searchFilters.departamento !== 'all') {
      const depto = COLOMBIA_LOCATIONS.find(d => d.id === searchFilters.departamento);
      // Compare by name if found, otherwise simple includes
      if (depto && u.locationData?.department) {
        if (u.locationData.department !== depto.name) return false;
      } else {
        // Fallback to string includes if exact data missing
        const deptoId = searchFilters.departamento.toLowerCase();
        const match = u.location?.toLowerCase().includes(deptoId) ||
          u.location?.toLowerCase().includes(deptoId.replace(/_/g, ' '));
        if (!match) return false;
      }
    }

    if (searchFilters.ciudad && searchFilters.ciudad !== 'all') {
      // Find the city name
      let cityName = '';
      if (searchFilters.departamento) {
        const depto = COLOMBIA_LOCATIONS.find(d => d.id === searchFilters.departamento);
        const city = depto?.ciudades.find(c => c.id === searchFilters.ciudad);
        if (city) cityName = city.name;
      }

      if (cityName && u.locationData?.city) {
        if (u.locationData.city !== cityName) return false;
      } else {
        const ciudadId = searchFilters.ciudad.toLowerCase();
        const match = u.location?.toLowerCase().includes(ciudadId) ||
          u.location?.toLowerCase().includes(ciudadId.replace(/_/g, ' '));
        if (!match) return false;
      }
    }

    if (searchFilters.barrio && searchFilters.barrio !== 'all') {
      // Find the barrio name
      let barrioName = '';
      if (searchFilters.departamento && searchFilters.ciudad) {
        const depto = COLOMBIA_LOCATIONS.find(d => d.id === searchFilters.departamento);
        const city = depto?.ciudades.find(c => c.id === searchFilters.ciudad);
        const barrio = city?.barrios.find(b => b.id === searchFilters.barrio);
        if (barrio) barrioName = barrio.name;
      }

      if (barrioName && u.locationData?.neighborhood) {
        if (u.locationData.neighborhood !== barrioName) return false;
      }
    }

    // Age Filter
    const age = u.age || 25;
    if (age < searchFilters.minAge || age > searchFilters.maxAge) return false;

    // Price Filter
    const price = parseInt(u.price?.replace(/[^0-9]/g, '') || '0');
    if (price < searchFilters.minPrice || (searchFilters.maxPrice > 0 && price > searchFilters.maxPrice)) return false;

    // Verification & Status Filters
    if (searchFilters.onlyVerified && !u.verified) return false;
    if (searchFilters.onlyOnline && !u.isOnline) return false;
    if (searchFilters.onlyPremium && !u.premium && !u.isVip) return false;

    return true;
  });

  const regularUsers = filteredUsers.filter((u: User) => !u.isVip);
  const vipUsers = filteredUsers.filter((u: User) => u.isVip);

  // If on auth pages, show them full screen
  if (currentView === 'login') return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-rose-500" /></div>}>
      <Login
        onLogin={() => setCurrentView('home')}
        onNavigateToRegister={() => setCurrentView('register')}
        onBack={() => setCurrentView('home')}
      />
    </Suspense>
  );

  if (currentView === 'register') return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin text-rose-500" /></div>}>
      <Register
        onRegister={(role) => {
          if (role === 'announcer') {
            setCurrentView('profile');
          } else {
            setCurrentView('home');
          }
        }}
        onNavigateToLogin={() => setCurrentView('login')}
        onBack={() => setCurrentView('home')}
      />
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        isLoggedIn={isLoggedIn}
        role={user?.role as any}
        onLoginClick={() => handleNavigate('login')}
        onRegisterClick={() => handleNavigate('register')}
        onLogoutClick={handleLogout}
        onCreateAdClick={() => {
          setEditingAd(null);
          handleProtectedNavigation('createAd');
        }}
        onProfileClick={() => {
          setEditingAd(null);
          handleProtectedNavigation('profile');
        }}
        onSearch={(newFilters) => setSearchFilters({ ...searchFilters, ...newFilters })}
        unreadCount={unreadCount}
        onNavigate={handleNavigate}
        onWalletClick={() => handleNavigate('wallet')}
        coins={user?.wallet?.coins || 0}
        user={user}
        currentView={currentView}
      />

      <div className="flex">
        {currentView !== 'messages' && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeSection={currentView}
            onSectionChange={(section) => handleNavigate(section as View)}
            role={user?.role as any}
            onCreateAdClick={() => handleNavigate('createAd')}
            unreadCount={unreadCount}
          />
        )}

        <main className={`flex-1 ${currentView === 'messages' ? 'p-0 md:p-0 h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)]' : 'p-4 md:p-6'} overflow-hidden`}>
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin text-rose-500" /></div>}>
            <div className={`${currentView === 'messages' ? 'w-full h-full' : 'max-w-7xl mx-auto w-full'}`}>
              {currentView === 'createAd' && isAnnouncer ? (
                <CreateAd
                  onBack={() => {
                    setEditingAd(null);
                    setCurrentView('profile');
                  }}
                  onPublish={() => {
                    setEditingAd(null);
                    setCurrentView('profile');
                  }}
                  currentUser={{ ...user, adCount: myAds.length } as any}
                  editingAd={editingAd}
                />
              ) : currentView === 'profile' && isLoggedIn && user ? (
                <UserProfile
                  user={{ ...user, adCount: myAds.length } as any}
                  onUpdateProfile={async (updates) => {
                    await updateUser(updates);
                  }}
                  onLogout={handleLogout}
                  onBack={() => setCurrentView('home')}
                  onCreateAd={() => {
                    setEditingAd(null);
                    setCurrentView('createAd');
                  }}
                  onEditAd={(ad) => {
                    setEditingAd(ad);
                    setCurrentView('createAd');
                  }}
                />
              ) : currentView === 'admin' && isAdmin && user ? (
                <AdminPanel
                  onBack={() => setCurrentView('home')}
                />
              ) : currentView === 'messages' && isLoggedIn && user ? (
                <Messaging
                  currentUser={user}
                  onBack={() => {
                    setCurrentView('home');
                    setSelectedUser(null);
                    setMessageTargetUser(null);
                  }}
                  targetUserId={messageTargetUser}
                  targetUser={selectedUser}
                  onTargetUserCleared={() => {
                    setMessageTargetUser(null);
                    setSelectedUser(null);
                  }}
                />
              ) : currentView === 'reviews' && isLoggedIn && user ? (
                <Reviews user={user} onBack={() => setCurrentView('home')} />
              ) : currentView === 'premium-info' ? (
                <PremiumInfo
                  onOpenStore={() => setIsStoreOpen(true)}
                  role={user?.role as 'user' | 'announcer' | 'admin'}
                  user={user}
                />
              ) : currentView === 'wallet' && isLoggedIn && user ? (
                <WalletView
                  onBack={() => setCurrentView('home')}
                  onStoreClick={() => setIsStoreOpen(true)}
                  onAddBillingClick={() => setCurrentView('profile')}
                />
              ) : currentView === 'favorites' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                        Mis Favoritos
                      </h2>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                        {favorites.length} guardados
                      </p>
                    </div>
                  </div>

                  {favorites.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                      {favorites.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onClick={() => setSelectedUser(user)}
                          isFavorite={true}
                          onToggleFavorite={(e) => {
                            e.stopPropagation();
                            toggleFavorite(user);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Heart className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes favoritos</h3>
                      <p className="text-gray-500 max-w-xs text-center">Guarda los perfiles que más te gusten para verlos aquí más tarde.</p>
                      <button
                        onClick={() => setCurrentView('home')}
                        className="mt-6 px-6 py-2 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
                      >
                        Explorar perfiles
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Hero Banner */}
                  <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500 bg-[length:200%_100%] animate-[gradient_8s_ease_infinite] rounded-2xl p-4 md:p-5 mb-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden relative">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shrink-0 shadow-inner">
                        <Shield className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                      <div>
                        <h1 className="text-lg md:text-xl font-black tracking-tight drop-shadow-sm flex items-center gap-2">
                          {t('hero.safety')}
                          <div className="flex items-center gap-1 bg-green-400/20 text-green-100 border border-green-400/30 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            100% Real
                          </div>
                        </h1>
                        <p className="text-rose-50 text-xs md:text-sm font-medium mt-0.5">
                          {t('hero.safety_desc')}
                        </p>
                      </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-6 relative z-10 bg-black/10 px-6 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-rose-100 uppercase tracking-wider font-bold">Trust Score</span>
                        <span className="text-lg font-black text-amber-300 drop-shadow-md">4.9/5.0 ★</span>
                      </div>
                      <div className="w-px h-8 bg-white/20"></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-rose-100 uppercase tracking-wider font-bold">Soporte</span>
                        <span className="text-lg font-black drop-shadow-md">24/7</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                    {[
                      { label: 'Perfiles Activos', value: '1,500+', icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                      { label: 'Verificados con IA', value: '98%', icon: '🛡️', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                      { label: 'En Línea Ahora', value: '234', icon: '🟢', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                      { label: 'Reseñas Reales', value: '12.4k', icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="relative overflow-hidden bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 group"
                      >
                        <div className={`absolute -right-4 -top-4 w-16 h-16 ${stat.bg} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
                        <div className="relative z-10 flex items-center gap-3">
                          <div className={`w-10 h-10 ${stat.bg} ${stat.border} border rounded-xl flex items-center justify-center text-lg shadow-inner`}>
                            {stat.icon}
                          </div>
                          <div>
                            <div className={`text-xl font-black ${stat.color} tracking-tight leading-none mb-1`}>
                              {stat.value}
                            </div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters - Desktop */}
                    <div className="hidden lg:block w-[240px] shrink-0">
                      <FilterPanel
                        filters={searchFilters}
                        onFilterChange={setSearchFilters}
                      />
                    </div>

                    {/* User Content */}
                    <div className="flex-1 min-w-0">
                      {/* VIP Section */}
                      {vipUsers.length > 0 && (
                        <div className="mb-10 relative group">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-amber-100 rounded-lg shadow-sm ring-1 ring-amber-200">
                              <TrendingUp className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                              {t('profiles.vipGold')}
                              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">Premium</span>
                            </h2>
                          </div>
                          <div className="flex overflow-x-auto gap-4 md:gap-5 pb-6 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                            {vipUsers.map((u: User) => (
                              <div
                                key={`vip-${u.id}`}
                                className="snap-center shrink-0 w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] transition-transform hover:-translate-y-1"
                              >
                                <UserCard
                                  user={u}
                                  variant="compact"
                                  onClick={() => setSelectedUser(u)}
                                  isFavorite={favorites.some(f => f.id === u.id)}
                                  onToggleFavorite={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(u);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-6 pt-6 border-t border-gray-100">
                        <div>
                          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                            {t('profiles.standard')}
                          </h2>
                          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                            {regularUsers.length} disponibles
                          </p>
                        </div>
                      </div>

                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
                          <p className="text-gray-500 font-medium">Cargando anuncios...</p>
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                          {filteredUsers.map((user) => (
                            <UserCard
                              key={user.id}
                              user={user}
                              onClick={() => setSelectedUser(user)}
                              isFavorite={favorites.some(f => f.id === user.id)}
                              onToggleFavorite={(e) => {
                                e.stopPropagation();
                                toggleFavorite(user);
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-10 h-10 text-gray-300" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron resultados</h3>
                          <p className="text-gray-500 max-w-xs text-center">Intenta ajustar tus filtros de búsqueda para encontrar lo que buscas.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </Suspense>
        </main>
      </div>

      {/* Modal only shows on home or favorites view */}
      {(currentView === 'home' || currentView === 'favorites') && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onMessage={handleOpenMessage}
          isFavorite={selectedUser ? favorites.some(f => f.id === selectedUser.id) : false}
          onToggleFavorite={() => selectedUser && toggleFavorite(selectedUser)}
        />
      )}

      <StoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
