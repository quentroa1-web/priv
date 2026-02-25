import { Home, Star, MessageCircle, X, User, LayoutDashboard, Wallet, Heart, Users, BadgeCheck } from 'lucide-react';

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
  { id: 'home', label: 'Inicio', icon: Home, roles: ['user', 'announcer', 'admin'] },
  { id: 'profile', label: 'Mi Perfil', icon: User, roles: ['user', 'announcer', 'admin'] },
  { id: 'clients', label: 'Clientes', icon: Users, roles: ['user', 'announcer', 'admin'] },
  { id: 'announcers', label: 'Anunciantes', icon: BadgeCheck, roles: ['user', 'announcer', 'admin'] },
  { id: 'favorites', label: 'Favoritos', icon: Heart, roles: ['user', 'announcer', 'admin'] },
  { id: 'messages', label: 'Mensajes', icon: MessageCircle, roles: ['user', 'announcer', 'admin'] },
  { id: 'wallet', label: 'Billetera & Premium', icon: Wallet, roles: ['user', 'announcer'] },
  { id: 'reviews', label: 'Reseñas', icon: Star, roles: ['announcer', 'admin'] },
  { id: 'admin', label: 'Panel Admin', icon: LayoutDashboard, roles: ['admin'] },
];

export function Sidebar({ isOpen, onClose, activeSection, onSectionChange, role, unreadCount = 0 }: SidebarProps) {
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
        fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-2rem)] w-48 glass-sidebar border-r border-gray-100/50 
        transform transition-all duration-300 ease-in-out z-50 lg:z-0 lg:mt-4 lg:ml-4 lg:rounded-3xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold uppercase tracking-tighter">Menú</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.filter(item => role && item.roles.includes(role)).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl font-black text-xs transition-all uppercase tracking-tight
                    ${isActive
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200 scale-[1.02]'
                      : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'messages' && unreadCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom actions removed as per user request */}
        </div>
      </aside>
    </>
  );
}
