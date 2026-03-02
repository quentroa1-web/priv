import { Suspense, useState, useEffect, useMemo } from 'react';
import { lazyRetry } from './utils/lazyRetry';
import { AuthProvider, useAuth } from './context/AuthContext';
import { apiService, getAds, getMyAds } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { UserDetailModal } from './components/UserDetailModal';
import { StoreModal } from './components/wallet/StoreModal';
import { COLOMBIA_LOCATIONS } from './data/colombiaLocations';
import { User } from './types';
import { Loader2, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SEO } from './components/SEO';
import { FavoritesView } from './components/FavoritesView';
import { PublicProfileModal } from './components/PublicProfileModal';
import { HomeView } from './components/HomeView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';
import { InfoPage } from './components/info/InfoPage';
import { SupportContent } from './components/info/SupportContent';
import { LegalContent } from './components/info/LegalContent';
import { PaymentContent } from './components/info/PaymentContent';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { HelpCircle, FileText, CreditCard } from 'lucide-react';
import { UserListingView } from './components/UserListingView';
import { ServicesManager } from './components/ServicesManager';
import { Toaster } from 'react-hot-toast';

// Lazy load heavy components
const Login = lazyRetry(() => import('./components/auth/Login').then(module => module.Login));
const Register = lazyRetry(() => import('./components/auth/Register').then(module => module.Register));
const CreateAd = lazyRetry(() => import('./components/CreateAd').then(module => module.CreateAd));
const UserProfile = lazyRetry(() => import('./components/user/UserProfile').then(module => module.UserProfile));
const AdminPanel = lazyRetry(() => import('./components/admin/AdminPanel').then(module => module.AdminPanel));
const Messaging = lazyRetry(() => import('./components/messaging/Messaging').then(module => module.Messaging));
const Reviews = lazyRetry(() => import('./components/reviews/Reviews').then(module => module.Reviews));
const WalletView = lazyRetry(() => import('./components/wallet/WalletView').then(module => module.WalletView));

type View = 'home' | 'login' | 'register' | 'createAd' | 'profile' | 'admin' | 'messages' | 'reviews' | 'favorites' | 'wallet' | 'support' | 'legal' | 'privacy' | 'payments' | 'clients' | 'announcers';

function AppContent() {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ads, setAds] = useState<User[]>([]);
  const [myAds, setMyAds] = useState<any[]>([]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = '¡Te extrañamos! - SafeConnect';
      } else {
        document.title = 'SafeConnect - Escorts y Clasificados Verificados';
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewingPublicProfile, setViewingPublicProfile] = useState<User | null>(null);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [messageTargetUser, setMessageTargetUser] = useState<string | null>(null);
  const [messageTargetAdId, setMessageTargetAdId] = useState<string | null>(null);
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

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Don't clear selectedUser if we are going to messages, 
    // as Messaging component needs it for temporary conversations
    if (currentView !== 'messages') {
      setSelectedUser(null);
      setViewingPublicProfile(null);
    }
  }, [currentView]);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setSidebarOpen(false);
    if (view === 'wallet') {
      setIsStoreOpen(false); // Close store modal if navigating to WalletView
    }
  };

  useEffect(() => {
    const shouldFetch = ads.length === 0 || currentView === 'home';

    const fetchAds = async () => {
      if (!shouldFetch) return;
      try {
        if (ads.length === 0) setLoading(true);
        const res = await getAds();

        if (!res.data || !Array.isArray(res.data.data)) {
          console.warn('API returned non-array data for ads');
          setAds([]);
          return;
        }

        const mappedAds = res.data.data.map((ad: any) => {
          let gender = ad.category?.toLowerCase();
          if (gender === 'mujer') gender = 'woman';
          if (gender === 'hombre') gender = 'man';
          if (gender === 'trans') gender = 'transgender';

          return {
            ...ad,
            id: ad._id,
            uid: ad.user?._id || ad.user,
            name: ad.title || 'Sin título',
            displayName: ad.title || 'Sin título',
            gender: gender,
            age: ad.age || 0,
            location: ad.location ? `${ad.location.city || ''}, ${ad.location.department || ''}` : 'Ubicación no especificada',
            locationData: ad.location || {},
            avatar: ad.photos?.find((p: any) => p.isMain)?.url || ad.photos?.[0]?.url || '',
            photoURL: ad.photos?.find((p: any) => p.isMain)?.url || ad.photos?.[0]?.url || '',
            images: ad.photos?.map((p: any) => p.url) || [],
            gallery: ad.photos?.map((p: any) => p.url) || [],
            bio: ad.description || '',
            description: ad.description || '',
            price: ad.pricing?.basePrice ? `$${ad.pricing.basePrice.toLocaleString()}` : '$0',
            services: [...(ad.services || []), ...(ad.customServices || [])],
            availability: (ad.availability?.days || []).map((d: string) => {
              const map: any = { 'lunes': 'Lun', 'martes': 'Mar', 'miercoles': 'Mié', 'jueves': 'Jue', 'viernes': 'Vie', 'sabado': 'Sáb', 'domingo': 'Dom' };
              return map[d] || d;
            }),
            rating: ad.user?.rating || 0,
            reviewCount: ad.user?.reviewCount || 0,
            memberSince: ad.createdAt ? new Date(ad.createdAt).toLocaleDateString() : 'Desconocido',
            responseTime: ad.user?.responseTime || '15 min',
            premium: (ad.plan === 'premium' || ad.plan === 'vip' || ad.plan === 'gold' || ad.plan === 'diamond') && (!ad.user?.premiumUntil || new Date(ad.user.premiumUntil) > new Date()),
            premiumPlan: ad.plan || 'none',
            isVip: (ad.user?.isVip || ad.plan === 'vip' || ad.plan === 'diamond') && (!ad.user?.premiumUntil || new Date(ad.user.premiumUntil) > new Date()),
            isBoosted: ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date(),
            boostedUntil: ad.boostedUntil,
            priority: ad.priority || 0,
            lastBumpDate: ad.lastBumpDate,
            attendsTo: (ad.attendsTo || []).map((a: string) => {
              const map: any = { 'hombres': 'Hombres', 'mujeres': 'Mujeres', 'parejas': 'Parejas', 'todos': 'Todos' };
              return map[a] || a;
            }),
            placeType: Array.isArray(ad.location?.placeType) ? ad.location.placeType : (ad.location?.placeType ? [ad.location.placeType] : []),
            priceList: ad.user?.priceList || [],
            role: ad.user?.role || 'announcer',
            verified: ad.isVerified || ad.user?.verified || false,
            idVerified: ad.isVerified || ad.user?.verified || false,
            photoVerified: ad.isVerified || ad.user?.verified || false,
            online: ad.user?.online || ad.user?.isOnline || false,
            isOnline: ad.user?.online || ad.user?.isOnline || false,
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
          if (res.data && Array.isArray(res.data.data)) {
            setMyAds(res.data.data);
          } else {
            setMyAds([]);
          }
        } catch (error) {
          console.error('Error fetching my ads:', error);
          setMyAds([]);
        }
      }
    };

    fetchAds();
    fetchMyAds();
  }, [currentView === 'home', isLoggedIn, isAnnouncer]);

  const handleProtectedNavigation = (view: View) => {
    if (!isLoggedIn && view !== 'home' && view !== 'login' && view !== 'register' && view !== 'support' && view !== 'legal' && view !== 'privacy' && view !== 'payments' && view !== 'clients' && view !== 'announcers') {
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
  };

  const handleLogout = () => {
    logout();
    setCurrentView('home');
  };

  const handleOpenMessage = (userId: string, adId?: string) => {
    setMessageTargetUser(userId);
    setMessageTargetAdId(adId || null);
    handleProtectedNavigation('messages');
  };

  const filteredUsers = useMemo(() => {
    return ads.filter((u: User) => {
      if (searchFilters.keyword) {
        const kw = searchFilters.keyword.toLowerCase();
        const match =
          u.name?.toLowerCase().includes(kw) ||
          u.displayName?.toLowerCase().includes(kw) ||
          u.bio?.toLowerCase().includes(kw) ||
          u.description?.toLowerCase().includes(kw) ||
          (typeof u.location === 'object' ? (u.location as any).city : u.location)?.toLowerCase().includes(kw) ||
          u.locationData?.neighborhood?.toLowerCase().includes(kw) ||
          u.locationData?.specificZone?.toLowerCase().includes(kw);
        if (!match) return false;
      }

      if (searchFilters.sex && searchFilters.sex !== 'all') {
        const sex = searchFilters.sex.toLowerCase();
        if (u.gender?.toLowerCase() !== sex) return false;
      }

      if (searchFilters.departamento && searchFilters.departamento !== 'all') {
        const depto = COLOMBIA_LOCATIONS.find(d => d.id === searchFilters.departamento);
        if (depto && u.locationData?.department) {
          if (u.locationData.department !== depto.name) return false;
        } else {
          const deptoId = searchFilters.departamento.toLowerCase();
          const locStr = (typeof u.location === 'object' ? (u.location as any).city : u.location)?.toLowerCase() || '';
          const match = locStr.includes(deptoId) ||
            locStr.includes(deptoId.replace(/_/g, ' '));
          if (!match) return false;
        }
      }

      if (searchFilters.ciudad && searchFilters.ciudad !== 'all') {
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
          const locStr = (typeof u.location === 'object' ? (u.location as any).city : u.location)?.toLowerCase() || '';
          const match = locStr.includes(ciudadId) ||
            locStr.includes(ciudadId.replace(/_/g, ' '));
          if (!match) return false;
        }
      }

      if (searchFilters.barrio && searchFilters.barrio !== 'all') {
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

      const age = u.age || 25;
      if (age < searchFilters.minAge || age > searchFilters.maxAge) return false;

      const price = parseInt(u.price?.replace(/[^0-9]/g, '') || '0');
      if (price < searchFilters.minPrice || (searchFilters.maxPrice > 0 && price > searchFilters.maxPrice)) return false;

      if (searchFilters.onlyVerified && !u.verified) return false;
      if (searchFilters.onlyOnline && !u.isOnline) return false;
      if (searchFilters.onlyPremium && !u.premium && !u.isVip) return false;

      return true;
    });
  }, [ads, searchFilters]);


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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO />
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
        onServicesClick={() => setIsServicesOpen(true)}
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

      <div className="flex flex-1">
        {isLoggedIn && (
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

        <main className={`flex-1 flex flex-col ${currentView === 'messages' ? 'p-0 h-[calc(100dvh-56px)] sm:h-[calc(100dvh-64px)]' : 'p-4 md:p-6'} overflow-x-hidden`}>
          <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-10 h-10 animate-spin text-rose-500" /></div>}>
            <div className={`flex-1 ${currentView === 'messages' ? 'w-full h-full' : 'max-w-7xl mx-auto w-full flex flex-col'}`}>
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
                  targetAdId={messageTargetAdId}
                  onTargetUserCleared={() => {
                    setMessageTargetUser(null);
                    setMessageTargetAdId(null);
                    setSelectedUser(null);
                  }}
                />
              ) : currentView === 'reviews' && isLoggedIn && user ? (
                <Reviews user={user} onBack={() => setCurrentView('home')} />
              ) : currentView === 'wallet' && isLoggedIn && user ? (
                <WalletView
                  onBack={() => setCurrentView('home')}
                  onStoreClick={() => setIsStoreOpen(true)}
                  onAddBillingClick={() => setCurrentView('profile')}
                />
              ) : currentView === 'favorites' ? (
                <FavoritesView
                  favorites={favorites}
                  onNavigate={handleNavigate}
                  onUserClick={setSelectedUser}
                  onToggleFavorite={toggleFavorite}
                />
              ) : currentView === 'clients' ? (
                <UserListingView
                  role="user"
                  onBack={() => setCurrentView('home')}
                  onUserClick={setViewingPublicProfile}
                />
              ) : currentView === 'announcers' ? (
                <UserListingView
                  role="announcer"
                  onBack={() => setCurrentView('home')}
                  onUserClick={setViewingPublicProfile}
                />
              ) : currentView === 'support' ? (
                <InfoPage
                  title="Soporte y Ayuda"
                  subtitle="¿Tienes dudas o necesitas asistencia? Nuestro equipo está aquí para garantizar una experiencia segura."
                  icon={<HelpCircle className="w-7 h-7" />}
                  onBack={() => setCurrentView('home')}
                >
                  <SupportContent />
                </InfoPage>
              ) : currentView === 'legal' ? (
                <InfoPage
                  title="Términos y Condiciones"
                  subtitle="Reglas de convivencia y uso de la plataforma SafeConnect."
                  icon={<Shield className="w-7 h-7" />}
                  onBack={() => setCurrentView('home')}
                >
                  <LegalContent />
                </InfoPage>
              ) : currentView === 'privacy' ? (
                <InfoPage
                  title="Privacidad"
                  subtitle="Tu seguridad y privacidad de datos es lo que nos hace líderes."
                  icon={<FileText className="w-7 h-7" />}
                  onBack={() => setCurrentView('home')}
                >
                  <LegalContent />
                </InfoPage>
              ) : currentView === 'payments' ? (
                <InfoPage
                  title="Pagos y Tarifas"
                  subtitle="Conoce nuestros planes, packs de monedas y métodos de pago verificados."
                  icon={<CreditCard className="w-7 h-7" />}
                  onBack={() => setCurrentView('home')}
                >
                  <PaymentContent />
                </InfoPage>
              ) : (
                <HomeView
                  t={t}
                  searchFilters={searchFilters}
                  onFilterChange={setSearchFilters}
                  filteredUsers={filteredUsers}
                  loading={loading}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onUserClick={setSelectedUser}
                />
              )}
              {currentView !== 'messages' && <Footer onNavigate={handleNavigate} />}
            </div>
          </Suspense>
        </main>
      </div>

      {(currentView === 'home' || currentView === 'favorites') && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onMessage={handleOpenMessage}
          isFavorite={selectedUser ? favorites.some(f => f.id === selectedUser.id) : false}
          onToggleFavorite={() => selectedUser && toggleFavorite(selectedUser)}
        />
      )}

      <PublicProfileModal
        user={viewingPublicProfile}
        ads={ads.filter(a => a.uid === viewingPublicProfile?.id || a.uid === viewingPublicProfile?._id)}
        onClose={() => setViewingPublicProfile(null)}
        onMessage={(userId) => {
          setViewingPublicProfile(null);
          handleOpenMessage(userId);
        }}
      />

      <ServicesManager
        isOpen={isServicesOpen}
        onClose={() => setIsServicesOpen(false)}
        user={user}
        onSave={async (packs) => {
          await updateUser({ priceList: packs });
        }}
      />

      <StoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
      />

      <CookieConsent />
      <AgeVerificationModal />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
