import { User } from '../types';
import { UserCard } from './UserCard';
import { Heart } from 'lucide-react';

interface FavoritesViewProps {
    favorites: User[];
    onNavigate: (view: any) => void;
    onUserClick: (user: User) => void;
    onToggleFavorite: (user: User) => void;
}

export function FavoritesView({ favorites, onNavigate, onUserClick, onToggleFavorite }: FavoritesViewProps) {
    return (
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
                            onClick={() => onUserClick(user)}
                            isFavorite={true}
                            onToggleFavorite={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(user);
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
                        onClick={() => onNavigate('home')}
                        className="mt-6 px-6 py-2 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
                    >
                        Explorar perfiles
                    </button>
                </div>
            )}
        </div>
    );
}
