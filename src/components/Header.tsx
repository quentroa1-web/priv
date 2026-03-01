import { Shield, Bell, User, Menu, LogOut, PlusCircle, Coins, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdvancedSearchBar } from './AdvancedSearchBar';
import { hapticFeedback } from '../utils/haptics';

interface HeaderProps {
  onMenuClick: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoutClick: () => void;
  onCreateAdClick?: () => void;
  onServicesClick?: () => void;
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
  onServicesClick,
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
    hapticFeedback('light');
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
              onClick={() => {
                hapticFeedback('light');
                onMenuClick();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={t('nav.toggleMenu')}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-200">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="hidden min-[450px]:block text-lg font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                SafeConnect
              </h1>
            </div>
          </div>

          {/* Search Bar - HIDDEN in top row for all sizes as we want mobile design */}
          {/* {!isMessagingView && (
            <div className="hidden lg:block flex-1 max-w-sm xl:max-w-xl mx-auto px-4">
              <AdvancedSearchBar onSearch={handleSearch} />
            </div>
          )} */}

          {/* Acciones */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto overflow-visible">
            {/* ... acciones remain same ... */}
            {/* Idioma */}
            <button
              onClick={handleLanguageChange}
              className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px] sm:text-xs font-bold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label={t('nav.changeLanguage')}
            >
              {i18n.language === 'es' ? 'EN' : 'ES'}
            </button>

            {isLoggedIn ? (
              <>
                {(role === 'announcer' || role === 'admin') && (
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {/* Servicios — visible en todos los tamaños */}
                    <button
                      onClick={() => {
                        hapticFeedback('light');
                        onServicesClick?.();
                      }}
                      className="flex items-center gap-1 p-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-all"
                      aria-label="Gestionar Servicios"
                      title="Gestionar Servicios"
                    >
                      <ShoppingBag className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden min-[550px]:inline">Servicios</span>
                    </button>
                    {/* Publicar — visible en todos los tamaños */}
                    <button
                      onClick={() => {
                        hapticFeedback('light');
                        onCreateAdClick?.();
                      }}
                      className="flex items-center gap-1 p-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all"
                      aria-label={t('nav.publishAd')}
                      title={t('nav.publishAd')}
                    >
                      <PlusCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden min-[550px]:inline">{t('nav.publishAd')}</span>
                    </button>
                  </div>
                )}

                {/* Wallet Button */}
                <button
                  onClick={() => {
                    hapticFeedback('light');
                    onWalletClick?.();
                  }}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors mr-1"
                  aria-label={`${t('nav.wallet')}: ${coins?.toLocaleString() || 0}`}
                >
                  <Coins className="w-4 h-4" />
                  <span>{coins?.toLocaleString() || 0}</span>
                </button>

                <button
                  onClick={() => {
                    hapticFeedback('light');
                    onNavigate?.('messages');
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  aria-label={t('nav.messages')}
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                  )}
                </button>
                <div className="flex items-center gap-1 pl-1.5 ml-1 border-l border-gray-200">
                  <button
                    onClick={() => {
                      hapticFeedback('light');
                      onProfileClick?.();
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 hover:ring-2 hover:ring-rose-500/20 transition-all"
                    aria-label={t('nav.profile')}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={t('nav.profile')} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      hapticFeedback('medium');
                      onLogoutClick();
                    }}
                    className="p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors text-gray-500"
                    title={t('auth.logout')}
                    aria-label={t('auth.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    hapticFeedback('light');
                    onRegisterClick();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all"
                  aria-label={t('nav.publishAd')}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('nav.publishAd')}</span>
                </button>
                <button
                  onClick={() => {
                    hapticFeedback('light');
                    onLoginClick();
                  }}
                  className="px-2 sm:px-3 py-1.5 text-gray-700 font-bold hover:bg-gray-100 rounded-lg transition-all text-xs sm:text-sm whitespace-nowrap"
                >
                  <span className="min-[450px]:inline hidden">{t('auth.login')}</span>
                  <User className="w-4 h-4 min-[450px]:hidden" />
                </button>
                <button
                  onClick={() => {
                    hapticFeedback('light');
                    onRegisterClick();
                  }}
                  className="px-2 sm:px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all text-xs sm:text-sm whitespace-nowrap"
                >
                  <span className="min-[450px]:inline hidden">{t('auth.register')}</span>
                  <PlusCircle className="w-4 h-4 min-[450px]:hidden" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* === FILA INFERIOR: Barra de búsqueda (visible en todos) === */}
        {!isMessagingView && (
          <div className="pb-3">
            <AdvancedSearchBar onSearch={handleSearch} />
          </div>
        )}
      </div>
    </header>
  );
}
