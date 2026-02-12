import { Home, Star, MessageCircle, X, User, LayoutDashboard, Coins, Heart } from 'lucide-react';

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
  { id: 'favorites', label: 'Favoritos', icon: Heart, roles: ['user', 'announcer', 'admin'] },
  { id: 'messages', label: 'Mensajes', icon: MessageCircle, roles: ['user', 'announcer', 'admin'] },
  { id: 'wallet', label: 'Billetera', icon: Coins, roles: ['user', 'announcer'] },
  { id: 'premium-info', label: 'Premium & Monedas', icon: Star, roles: ['user', 'announcer', 'admin'] },
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
        fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-4rem)] w-52 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out z-50 lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Menú</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                    ${isActive
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-200'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.id === 'messages' && unreadCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
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
