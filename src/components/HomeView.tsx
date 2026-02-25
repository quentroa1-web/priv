import { useMemo, useState } from 'react';
import { User } from '../types';
import { UserCard } from './UserCard';
import { UserCardSkeleton } from './UserCardSkeleton';
import { FilterPanel } from './FilterPanel';
import { SEO } from './SEO';
import { Shield, Search, SlidersHorizontal, X, Crown, MapPin as MapPinIcon, BadgeCheck as VerifiedIcon, Users as UsersIcon } from 'lucide-react';
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

    // Dynamic Stats Logic
    const stats = useMemo(() => {
        const total = filteredUsers.length;
        const verified = filteredUsers.filter(u => u.verified).length;
        const online = filteredUsers.filter(u => u.isOnline || u.online).length;
        const reviews = filteredUsers.reduce((acc, u) => acc + (u.reviewCount || 0), 0);

        return [
            { label: 'Perfiles', value: `${total.toLocaleString()}`, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Verificados', value: `${total > 0 ? Math.round((verified / total) * 100) : 98}%`, icon: '🛡️', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'En Línea', value: online.toLocaleString(), icon: '🟢', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Reseñas', value: reviews > 1000 ? `${(reviews / 1000).toFixed(1)}k` : reviews.toString(), icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50' },
        ];
    }, [filteredUsers]);

    return (
        <>
            <SEO
                title={`${searchFilters.ciudad ? `Escorts y Acompañantes en ${searchFilters.ciudad}` : 'Escorts y Clasificados Verificados en Colombia'} | SafeConnect`}
                description={`Encuentra los mejores anuncios de acompañantes y escorts en ${searchFilters.ciudad || 'toda Colombia'}. Perfiles 100% verificados, seguridad y discreción total.`}
                keywords={`escorts ${searchFilters.ciudad || 'colombia'}, acompañantes ${searchFilters.ciudad || 'bogota'}, masajes ${searchFilters.ciudad || 'medellin'}, modelos independientes, clasificados adultos`}
            />
            {/* Extreme Compact Hero Banner */}
            <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-rose-500 bg-[length:200%_100%] animate-[gradient_8s_ease_infinite] rounded-xl md:rounded-2xl p-2 md:p-4 mb-3 md:mb-5 text-white shadow-lg flex items-center justify-between gap-3 overflow-hidden relative border border-white/10">
                <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-2xl"></div>

                <div className="flex items-center gap-2 md:gap-3 relative z-10 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-lg md:rounded-xl flex items-center justify-center border border-white/30 shrink-0 shadow-inner">
                        <Shield className="w-4 h-4 md:w-5 md:h-5 text-white drop-shadow-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xs md:text-lg font-black tracking-tight drop-shadow-sm flex items-center gap-2">
                            {t('hero.safety')}
                            <div className="flex items-center gap-1 bg-green-400/20 text-green-100 border border-green-400/30 px-1.5 py-0.5 rounded-full text-[7px] md:text-[8px] uppercase tracking-wider font-bold shrink-0">
                                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                                IA Check
                            </div>
                        </h1>
                        <p className="text-rose-50 text-[9px] md:text-xs font-medium opacity-90 truncate">
                            {t('hero.safety_desc')}
                        </p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-4 relative z-10 bg-black/10 px-4 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm shrink-0">
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] text-rose-100 uppercase tracking-widest font-bold leading-none mb-0.5">Trust</span>
                        <span className="text-sm font-black text-amber-300">4.9/5 ★</span>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="flex flex-col items-center text-center">
                        <span className="text-[8px] text-rose-100 uppercase tracking-widest font-bold leading-none mb-0.5">Soporte</span>
                        <span className="text-sm font-black">24/7</span>
                    </div>
                </div>
            </div>

            {/* Extreme Compact Stats Bar - Horizontal Scroll on Mobile */}
            <div className="flex overflow-x-auto md:flex-nowrap gap-2 md:gap-3 mb-5 md:mb-6 pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 md:flex-1 min-w-[90px] md:min-w-[100px] bg-white rounded-lg md:rounded-xl p-1.5 md:p-2.5 shadow-sm border border-gray-100 flex items-center gap-2 group transition-all hover:border-indigo-100 hover:shadow-md"
                    >
                        <div className={`w-7 h-7 md:w-8 md:h-8 ${stat.bg} rounded-lg flex items-center justify-center text-xs md:text-sm shrink-0 transition-transform group-hover:scale-110`}>
                            {stat.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={`text-[13px] md:text-sm font-black ${stat.color} leading-none truncate`}>
                                {stat.value}
                            </span>
                            <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">
                                {stat.label}
                            </span>
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
                    {/* Elite Carousel (Top + VIP) */}
                    {(topUsers.length > 0 || vipUsers.length > 0) && (
                        <div className="mb-10 relative group">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-lg ring-2 ring-rose-100 animate-pulse">
                                        <Crown className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="animate-gold-text text-2xl tracking-tighter uppercase leading-none">
                                            MIEMBROS ÉLITE
                                        </h2>
                                        <p className="text-[9px] text-rose-600 font-black uppercase tracking-[0.2em] mt-1 ml-0.5">Top & VIP Gold Access</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex overflow-x-auto gap-3 md:gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                                {[...topUsers, ...vipUsers].map((u: User) => (
                                    <div
                                        key={`elite-${u.id}`}
                                        className="snap-center shrink-0 w-[140px] sm:w-[180px] md:w-[200px] lg:w-[210px] transition-transform hover:-translate-y-1"
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
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                            {[...Array(8)].map((_, i) => (
                                <UserCardSkeleton key={i} />
                            ))}
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

            {/* SEO SEMANTIC CONTENT SECTION */}
            <section className="mt-20 pt-12 border-t border-gray-100 pb-10">
                <div className="max-w-4xl mx-auto space-y-8 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-gray-500 font-medium">
                        <article>
                            <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-tighter">
                                SafeConnect: La Revolución de los Clasificados en Colombia
                            </h2>
                            <p>
                                SafeConnect nace con el objetivo de superar las limitaciones de plataformas tradicionales como <strong>mileroticos</strong> o <strong>skokka</strong>, ofreciendo un entorno donde la seguridad es la prioridad. En nuestro portal, cada anunciante pasa por un proceso de verificación riguroso, asegurando que los usuarios encuentren perfiles reales y servicios de alta calidad en ciudades como <strong>Bogotá</strong>, <strong>Medellín</strong>, <strong>Cali</strong> y <strong>Barranquilla</strong>.
                            </p>
                        </article>
                        <article>
                            <h2 className="text-sm font-black text-gray-900 mb-3 uppercase tracking-tighter">
                                Escorts y Acompañantes Verificadas 24/7
                            </h2>
                            <p>
                                Si buscas <strong>escorts en Colombia</strong> o <strong>modelos independientes</strong>, SafeConnect te ofrece herramientas avanzadas de filtrado. Puedes buscar por ubicación exacta, servicios específicos y disponibilidad inmediata. Nuestra tecnología de "Live Check" permite saber quién está en línea en este preciso momento, optimizando tu tiempo y garantizando discreción total.
                            </p>
                        </article>
                    </div>

                    <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPinIcon className="w-3 h-3" /> Directorio Regional de Clasificados
                        </h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Cúcuta', 'Ibagué'].map(city => (
                                <a
                                    key={city}
                                    href={`#?city=${city}`}
                                    className="text-[11px] font-bold text-gray-500 hover:text-rose-600 transition-colors"
                                >
                                    Acompañantes en {city}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest pt-4">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><VerifiedIcon className="w-2.5 h-2.5" /> 100% Verified Profiles</span>
                            <span className="flex items-center gap-1"><UsersIcon className="w-2.5 h-2.5" /> +5,000 active members</span>
                        </div>
                        <p>© 2026 SafeConnect Colombia</p>
                    </div>
                </div>
            </section>
        </>
    );
}
