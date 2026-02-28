import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, MapPin, Star, BadgeCheck, Users, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { User } from '../types';
import { apiService } from '../services/api';
import { cn } from '../utils/cn';
import { SEO } from './SEO';
import { UserCardSkeleton } from './UserCardSkeleton';

interface UserListingViewProps {
    role: 'user' | 'announcer';
    onUserClick: (user: User) => void;
    onBack: () => void;
}

export function UserListingView({ role, onUserClick, onBack }: UserListingViewProps) {
    const [userList, setUserList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sexFilter, setSexFilter] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchUsers = useCallback(async (isNewSearch = false) => {
        if (isNewSearch) {
            setLoading(true);
            setPage(1);
        } else {
            setLoadingMore(true);
        }

        try {
            const currentPage = isNewSearch ? 1 : page;
            const res = await apiService.getUsers({
                role,
                search: searchTerm,
                gender: sexFilter,
                page: currentPage,
                limit: 12
            });

            if (res.data.success) {
                const newData = res.data.data;
                if (isNewSearch) {
                    setUserList(newData);
                } else {
                    setUserList(prev => [...prev, ...newData]);
                }
                setHasMore(currentPage < res.data.pages);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [role, searchTerm, sexFilter, page]);

    // Initial fetch and filter change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(true);
        }, 400); // 400ms debounce for search

        return () => clearTimeout(timer);
    }, [role, searchTerm, sexFilter]);

    const handleLoadMore = () => {
        if (!hasMore || loadingMore) return;
        setPage(prev => prev + 1);
    };

    // Trigger fetch when page changes (but not on first load which is handled by useEffect above)
    useEffect(() => {
        if (page > 1) {
            fetchUsers(false);
        }
    }, [page]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SEO
                title={`${role === 'user' ? 'Directorio de Clientes' : 'Directorio de Anunciantes'} | SafeConnect Colombia`}
                description={`Explora nuestro directorio verificado de ${role === 'user' ? 'clientes' : 'anunciantes'} en SafeConnect. Transparencia y seguridad en cada perfil.`}
                keywords={`${role === 'user' ? 'clientes' : 'anunciantes'}, perfiles verificados, safeconnect colombia, directorio acompañantes`}
            />
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all active:scale-95 text-gray-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Users className="w-7 h-7 text-rose-500" />
                            {role === 'user' ? 'Directorio de Clientes' : 'Directorio de Anunciantes'}
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                            Explora perfiles en SafeConnect
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                        value={sexFilter}
                        onChange={(e) => setSexFilter(e.target.value)}
                        className="bg-gray-50 border-none rounded-2xl font-black text-[10px] uppercase tracking-wider py-4 px-4 focus:ring-2 focus:ring-rose-500 shadow-inner"
                    >
                        <option value="">Género</option>
                        <option value="woman">Mujer</option>
                        <option value="man">Hombre</option>
                        <option value="transgender">Trans</option>
                        <option value="other">Otro</option>
                    </select>

                    <div className="relative group flex-1 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Nombre, ciudad o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 font-bold text-xs shadow-inner"
                        />
                    </div>
                </div>
            </div>

            {/* CONTENT GRID */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <UserCardSkeleton key={i} />
                    ))}
                </div>
            ) : userList.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {userList.map((u) => (
                            <div
                                key={u.id}
                                onClick={() => onUserClick(u)}
                                className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-rose-200 transition-all duration-500 group cursor-pointer flex flex-col gap-5 relative overflow-hidden h-full"
                            >
                                {u.premium && (
                                    <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
                                        <div className="absolute top-2 -right-8 bg-rose-500 text-white text-[7px] font-black uppercase py-1 w-24 text-center rotate-45 shadow-lg">
                                            Premium
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-3xl bg-gray-100 overflow-hidden border-4 border-white shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                                        <img
                                            src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`}
                                            className="w-full h-full object-cover"
                                            alt={u.name}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="font-black text-gray-900 truncate text-lg">{u.displayName || u.name}</h4>
                                            {u.verified && <BadgeCheck className="w-4 h-4 text-blue-500" fill="currentColor" color="white" />}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">
                                                {(typeof u.location === 'object' ? (u.location as any).city : (u.locationData?.city || u.location)) || 'Colombia'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 flex-1">
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed italic line-clamp-3">
                                        {u.bio || u.description || 'Este usuario aún no ha redactado su presentación.'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-xs font-black text-gray-900">{u.rating || '5.0'}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-300 font-bold">•</span>
                                        <span className="text-[9px] font-black text-gray-400 uppercase">{u.reviewCount || 0} reviews</span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {u.isOnline && (
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                        )}
                                        <span className={cn(
                                            "text-[8px] font-black uppercase tracking-widest",
                                            u.isOnline ? "text-emerald-500" : "text-gray-300"
                                        )}>
                                            {u.isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center mt-12 pb-20">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="group flex items-center gap-3 px-10 py-5 bg-white border-2 border-gray-100 rounded-3xl hover:border-rose-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Cargando...</span>
                                    </>
                                ) : (
                                    <>
                                        <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                                        <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Cargar más perfiles</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-32 bg-white rounded-[4rem] border-4 border-dashed border-gray-50 shadow-inner max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Búsqueda sin resultados</h3>
                    <p className="text-sm font-bold text-gray-400 px-10">No encontramos perfiles que coincidan con tus filtros. Intenta con otros términos o géneros.</p>
                    <button
                        onClick={() => { setSearchTerm(''); setSexFilter(''); }}
                        className="mt-8 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-rose-500 shadow-xl"
                    >
                        Limpiar filtros
                    </button>
                </div>
            )}
        </div>
    );
}
