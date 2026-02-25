import { Shield, Bell, User, Menu, LogOut, PlusCircle, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdvancedSearchBar } from './AdvancedSearchBar';

interface HeaderProps {
  onMenuClick: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoutClick: () => void;
  onCreateAdClick?: () => void;
  onProfileClick?: () => void;
  onSearch?: (filters: any) => void;
  role?: 'user' | 'announcer' | 'admin';
  unreadCount?: number;
  onNavigate?: (view: any) => void;
  onWalletClick?: () => void;
  coins?: number;
  user?: any;
  currentView?: string;
}

export function Header({
  onMenuClick,
  isLoggedIn,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  onCreateAdClick,
  onProfileClick,
  onSearch,
  role,
  unreadCount = 0,
  onNavigate,
  onWalletClick,
  coins,
  user,
  currentView
}: HeaderProps) {
  const { t, i18n } = useTranslation();

  const isMessagingView = currentView === 'messages';

  const handleLanguageChange = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleSearch = (filters: any) => {
    if (onSearch) onSearch(filters);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* === FILA SUPERIOR: Logo + Barra búsqueda (desktop) + Acciones === */}
        <div className="flex items-center h-14 sm:h-16 gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-200">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="hidden sm:block text-lg font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                SafeConnect
              </h1>
            </div>
          </div>

          {/* Search Bar - SOLO Desktop (md+) */}
          {!isMessagingView && (
            <div className="hidden md:block flex-1 max-w-xl mx-auto px-4">
              <AdvancedSearchBar onSearch={handleSearch} />
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* Idioma */}
            <button
              onClick={handleLanguageChange}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px] sm:text-xs font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              {i18n.language === 'es' ? 'EN' : 'ES'}
            </button>

            {isLoggedIn ? (
              <>
                {(role === 'announcer' || role === 'admin') && (
                  <button
                    onClick={onCreateAdClick}
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Publicar</span>
                  </button>
                )}

                {/* Wallet Button */}
                <button
                  onClick={onWalletClick}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors mr-1"
                >
                  <Coins className="w-4 h-4" />
                  <span>{coins?.toLocaleString() || 0}</span>
                </button>

                <button
                  onClick={() => onNavigate?.('messages')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                  )}
                </button>
                <div className="flex items-center gap-1 pl-1.5 ml-1 border-l border-gray-200">
                  <button
                    onClick={onProfileClick}
                    className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 hover:ring-2 hover:ring-rose-500/20 transition-all"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={onLogoutClick}
                    className="p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors text-gray-500"
                    title={t('auth.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={onRegisterClick}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Publicar</span>
                </button>
                <button
                  onClick={onLoginClick}
                  className="px-2 sm:px-3 py-1.5 text-gray-700 font-bold hover:bg-gray-100 rounded-lg transition-all text-xs sm:text-sm"
                >
                  {t('auth.login')}
                </button>
                <button
                  onClick={onRegisterClick}
                  className="px-2 sm:px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all text-xs sm:text-sm whitespace-nowrap"
                >
                  {t('auth.register')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* === FILA INFERIOR MÓVIL: Barra de búsqueda === */}
        {!isMessagingView && (
          <div className="md:hidden pb-3">
            <AdvancedSearchBar onSearch={handleSearch} />
          </div>
        )}
      </div>
    </header>
  );
}
