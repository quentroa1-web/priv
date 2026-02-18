import { useMemo, useState } from 'react';
import { User } from '../types';
import { UserCard } from './UserCard';
import { FilterPanel } from './FilterPanel';
import { Shield, TrendingUp, Search, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { TFunction } from 'i18next';

interface HomeViewProps {
    t: TFunction;
    searchFilters: any;
    onFilterChange: (filters: any) => void;
    filteredUsers: User[];
    loading: boolean;
    favorites: User[];
    onToggleFavorite: (user: User) => void;
    onUserClick: (user: User) => void;
}

export function HomeView({
    t,
    searchFilters,
    onFilterChange,
    filteredUsers,
    loading,
    favorites,
    onToggleFavorite,
    onUserClick
}: HomeViewProps) {
    const topUsers = useMemo(() => filteredUsers.filter((u) => u.isBoosted), [filteredUsers]);
    const vipUsers = useMemo(() => filteredUsers.filter((u) => u.isVip && !u.isBoosted), [filteredUsers]);
    const regularUsers = useMemo(() => filteredUsers.filter((u) => !u.isVip && !u.isBoosted), [filteredUsers]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    return (
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
                        <h1 className="text-lg md:text-xl font-black tracking-tight drop-shadow-sm flex items-center gap-2 flex-wrap">
                            {t('hero.safety')}
                            <div className="flex items-center gap-1 bg-green-400/20 text-green-100 border border-green-400/30 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold shrink-0">
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
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bg} ${stat.border} border rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg shadow-inner`}>
                                {stat.icon}
                            </div>
                            <div>
                                <div className={`text-lg sm:text-xl font-black ${stat.color} tracking-tight leading-none mb-1`}>
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

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all w-full justify-center"
                >
                    <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                    {showMobileFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    {showMobileFilters && <X className="w-4 h-4 ml-auto" />}
                </button>
                {showMobileFilters && (
                    <div className="mt-3 animate-in slide-in-from-top duration-200">
                        <FilterPanel
                            filters={searchFilters}
                            onFilterChange={onFilterChange}
                        />
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Filters - Desktop */}
                <div className="hidden lg:block w-[240px] shrink-0">
                    <FilterPanel
                        filters={searchFilters}
                        onFilterChange={onFilterChange}
                    />
                </div>

                {/* User Content */}
                <div className="flex-1 min-w-0">
                    {/* Top Ads Section */}
                    {topUsers.length > 0 && (
                        <div className="mb-12 relative group">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl shadow-lg ring-2 ring-cyan-100 animate-pulse">
                                        <TrendingUp className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="animate-gold-text text-2xl tracking-tighter uppercase">
                                            {t('profiles.topAds') || 'ELITE DIAMOND ADS'}
                                        </h2>
                                        <p className="text-[10px] text-cyan-600 font-black uppercase tracking-[0.2em] -mt-1 ml-0.5">Prioridad Máxima</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex overflow-x-auto gap-4 md:gap-5 pb-6 pt-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                                {topUsers.map((u: User) => (
                                    <div
                                        key={`top-${u.id}`}
                                        className="snap-center shrink-0 w-[180px] sm:w-[220px] md:w-[260px] lg:w-[280px] transition-transform hover:-translate-y-1"
                                    >
                                        <UserCard
                                            user={u}
                                            variant="compact"
                                            onClick={() => onUserClick(u)}
                                            isFavorite={favorites.some(f => f.id === u.id)}
                                            onToggleFavorite={(e) => {
                                                e.stopPropagation();
                                                onToggleFavorite(u);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* VIP Section */}
                    {vipUsers.length > 0 && (
                        <div className="mb-10 relative group">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-amber-100 rounded-lg shadow-sm ring-1 ring-amber-200">
                                    <TrendingUp className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                    {t('profiles.vipGold') || 'VIP GOLD'}
                                    <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">Destacado</span>
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
                                            onClick={() => onUserClick(u)}
                                            isFavorite={favorites.some(f => f.id === u.id)}
                                            onToggleFavorite={(e) => {
                                                e.stopPropagation();
                                                onToggleFavorite(u);
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
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                            {filteredUsers.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    onClick={() => onUserClick(user)}
                                    isFavorite={favorites.some(f => f.id === user.id)}
                                    onToggleFavorite={(e) => {
                                        e.stopPropagation();
                                        onToggleFavorite(user);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 md:py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
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
    );
}
