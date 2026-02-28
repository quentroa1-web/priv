import { Home, Star, MessageCircle, X, User, LayoutDashboard, Wallet, Heart, Users, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { hapticFeedback } from '../utils/haptics';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCreateAdClick?: () => void;
  role?: 'user' | 'announcer' | 'admin';
  unreadCount?: number;
}

const menuItems = [
  { id: 'home', labelKey: 'nav.home', icon: Home, roles: ['user', 'announcer', 'admin'] },
  { id: 'profile', labelKey: 'nav.profile', icon: User, roles: ['user', 'announcer', 'admin'] },
  { id: 'clients', labelKey: 'nav.clients', icon: Users, roles: ['user', 'announcer', 'admin'] },
  { id: 'announcers', labelKey: 'nav.announcers', icon: BadgeCheck, roles: ['user', 'announcer', 'admin'] },
  { id: 'favorites', labelKey: 'nav.favorites', icon: Heart, roles: ['user', 'announcer', 'admin'] },
  { id: 'messages', labelKey: 'nav.messages', icon: MessageCircle, roles: ['user', 'announcer', 'admin'] },
  { id: 'wallet', labelKey: 'nav.walletAndPremium', icon: Wallet, roles: ['user', 'announcer'] },
  { id: 'reviews', labelKey: 'nav.reviews', icon: Star, roles: ['announcer', 'admin'] },
  { id: 'admin', labelKey: 'nav.adminPanel', icon: LayoutDashboard, roles: ['admin'] },
];

export function Sidebar({ isOpen, onClose, activeSection, onSectionChange, role, unreadCount = 0 }: SidebarProps) {
  const { t } = useTranslation();
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-2rem)] w-72 lg:w-48 bg-white lg:glass-sidebar border-r border-gray-100/50 
        transform transition-all duration-300 ease-in-out z-50 lg:z-0 lg:mt-4 lg:ml-4 lg:rounded-3xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Profile Header */}
          <div className="lg:hidden p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                    <User className="w-6 h-6 text-rose-500" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-gray-900 leading-none">SafeConnect</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{t('common.online')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  hapticFeedback('light');
                  onClose();
                }}
                className="p-2 bg-gray-100/50 hover:bg-gray-100 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
                aria-label={t('nav.close')}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-2.5 flex items-center gap-2 shadow-sm">
                <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase leading-none">{t('nav.balance')}</span>
                  <span className="text-xs font-black text-gray-900">{t('nav.tokens')}</span>
                </div>
              </div>
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-2.5 flex items-center gap-2 shadow-sm">
                <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase leading-none">{t('nav.status')}</span>
                  <span className="text-xs font-black text-gray-900 uppercase">{t('common.verified')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            <h3 className="px-3 pb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:block">{t('nav.navigation')}</h3>
            {menuItems.filter(item => role && item.roles.includes(role)).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    hapticFeedback('light');
                    onSectionChange(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 lg:py-2.5 rounded-2xl font-black text-[13px] lg:text-xs transition-all uppercase tracking-tight group focus-visible:ring-2 focus-visible:ring-rose-500 outline-none
                    ${isActive
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200 scale-[1.02]'
                      : 'text-gray-500 hover:bg-rose-50 hover:text-rose-600'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 lg:w-4 lg:h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-rose-500'}`} />
                  <span>{t(item.labelKey)}</span>
                  {item.id === 'messages' && unreadCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Footer */}
          <div className="lg:hidden p-6 mt-auto border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>SafeConnect © 2024</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>

          {/* Bottom actions removed as per user request */}
        </div>
      </aside>
    </>
  );
}
