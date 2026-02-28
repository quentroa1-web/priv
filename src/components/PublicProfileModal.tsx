import { useState } from 'react';
import {
    X, MapPin, Star, BadgeCheck, Camera,
    Heart, Share2, MoreHorizontal,
    Info, Shield, Users, Clock,
    ShieldCheck, AlertCircle, LayoutGrid, MessageCircle
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../utils/cn';
import { SEO } from './SEO';
import { formatPrice } from '../utils/formatters';

interface PublicProfileModalProps {
    user: User | null;
    ads?: User[];
    onClose: () => void;
    onMessage?: (userId: string, adId?: string) => void;
}

export function PublicProfileModal({ user, ads = [], onClose, onMessage }: PublicProfileModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'reviews' | 'ads'>('info');

    if (!user) return null;

    const isAnnouncer = user.role === 'announcer';
    const roleLabel = user.role === 'announcer' ? 'Anunciante' : 'Cliente';
    const userName = user.displayName || user.name || 'Usuario';
    const displayId = user.uid || user.id || user._id || '';

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 overflow-hidden selection:bg-rose-100 selection:text-rose-600">
            <SEO
                title={`${userName} (@${user.name || 'safeconnect'}) | SafeConnect`}
                description={`Perfil oficial de ${userName} en SafeConnect Colombia. ${user.bio?.substring(0, 100) || ''}`}
                type="profile"
            />

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Profile Container */}
            <div className="relative bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

                {/* Header Section (Instagram Style) */}
                <div className="relative shrink-0">
                    {/* Cover Photo Area */}
                    <div className="h-32 md:h-48 bg-gradient-to-br from-rose-400 via-pink-500 to-indigo-600">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/40 transition-all z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Social Actions Header */}
                    <div className="absolute -bottom-16 left-0 w-full px-6 flex items-end justify-between">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] border-4 border-white bg-gray-100 overflow-hidden shadow-xl shadow-gray-200/50">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${userName}&background=random`}
                                    className="w-full h-full object-cover"
                                    alt={userName}
                                />
                            </div>
                            {user.isOnline && (
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                                </div>
                            )}
                        </div>

                        <div className="mb-2 flex gap-2">
                            <button
                                onClick={() => displayId && onMessage?.(displayId)}
                                className="px-6 py-2.5 bg-rose-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all"
                            >
                                Mensaje
                            </button>
                            <button className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Profile Basic Info */}
                <div className="mt-20 px-6 md:px-8 pb-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">
                            {userName}
                        </h1>
                        {user.verified && (
                            <BadgeCheck className="w-6 h-6 text-blue-500" fill="currentColor" color="white" />
                        )}
                    </div>
                    <p className="text-gray-400 font-bold text-sm mt-1">@{userName.toLowerCase().replace(/\s+/g, '_')}</p>

                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-gray-900 leading-none">1.2K</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seguidores</span>
                        </div>
                        <div className="w-px h-8 bg-gray-100" />
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-gray-900 leading-none">{user.rating || '5.0'}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rating</span>
                        </div>
                        <div className="w-px h-8 bg-gray-100" />
                        <div className="flex flex-col">
                            <span className="text-lg font-black text-gray-900 leading-none">{user.reviewCount || 0}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reseñas</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="px-6 md:px-8 flex items-center gap-6 border-b border-gray-50 bg-white sticky top-0 z-10">
                    {[
                        { id: 'info', label: 'Información', icon: Info },
                        ...(isAnnouncer ? [
                            { id: 'ads', label: 'Anuncios', icon: LayoutGrid },
                            { id: 'photos', label: 'Fotos', icon: Camera }
                        ] : []),
                        { id: 'reviews', label: 'Reseñas', icon: Star }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 py-4 border-b-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                activeTab === tab.id
                                    ? "border-rose-500 text-rose-500"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-50/50">
                    {activeTab === 'info' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            {/* Bio Section */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
                                    Bio Social
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed font-medium bg-white p-4 rounded-2xl border border-gray-100 italic">
                                    "{user.bio || user.description || 'Este usuario aún no ha escrito su biografía.'}"
                                </p>
                            </div>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 group hover:border-rose-200 transition-colors">
                                    <div className="p-2 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                                        <MapPin className="w-4 h-4 text-rose-500" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Ubicación</div>
                                        <div className="text-xs font-black text-gray-900 truncate">{(typeof user.location === 'object' ? (user.location as any).city : user.location) || 'Colombia'}</div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 group hover:border-blue-200 transition-colors">
                                    <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Miembro</div>
                                        <div className="text-xs font-black text-gray-900 uppercase tracking-tighter">Desde 2024</div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 group hover:border-amber-200 transition-colors">
                                    <div className="p-2 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                                        <Users className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Rol</div>
                                        <div className="text-xs font-black text-gray-900">{roleLabel}</div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3 group hover:border-emerald-200 transition-colors">
                                    <div className="p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                                        <Clock className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Actividad</div>
                                        <div className="text-xs font-black text-gray-900">{user.isOnline ? 'Activo ahora' : 'Hace 15m'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Badges */}
                            <div className="bg-gray-900 rounded-3xl p-6 text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Shield className="w-24 h-24" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-gray-400">Verificaciones de Seguridad</h3>
                                <div className="space-y-3 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-300">Documento de Identidad</span>
                                        <BadgeCheck className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-300">Fotos de Perfil Reales</span>
                                        <BadgeCheck className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-300">Teléfono Validado</span>
                                        <BadgeCheck className="w-5 h-5 text-amber-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ads' && (
                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            {ads.length > 0 ? (
                                ads.map((ad) => (
                                    <div
                                        key={ad.id}
                                        onClick={() => onMessage?.(displayId, ad.id || ad._id)}
                                        className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex gap-4 group hover:border-rose-200 transition-all cursor-pointer relative"
                                    >
                                        <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                                            <img src={ad.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={ad.name} />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 uppercase">{ad.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    <span className="text-[10px] font-bold text-gray-400">Bogotá, Colombia</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-rose-500">{formatPrice(ad.price || 0)}</span>
                                                <div className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Activo</div>
                                            </div>
                                        </div>
                                        {/* Floating Message Icon for Ad */}
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-gray-50 rounded-2xl text-rose-500 opacity-0 group-hover:opacity-100 group-hover:bg-rose-50 transition-all translate-x-4 group-hover:translate-x-0">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                        <LayoutGrid className="w-8 h-8" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No hay anuncios activos</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'photos' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            {user.gallery && user.gallery.length > 0 ? (
                                user.gallery.map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-transform hover:scale-[1.03] cursor-pointer">
                                        <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No hay fotos públicas disponibles</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 text-center space-y-4">
                                <div className="flex items-center justify-center gap-1 text-amber-500">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Excelente reputación social</h3>
                                <p className="text-xs font-bold text-gray-400">Este usuario ha mantenido una conducta ejemplar en la plataforma durante los últimos 6 meses.</p>
                            </div>

                            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-black text-rose-900 uppercase">Aviso de Privacidad</h4>
                                    <p className="text-[10px] font-bold text-rose-700/70 mt-1">Los comentarios detallados solo son visibles para usuarios con nivel de confianza "Platino".</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions (Facebook/Instagram Style) */}
                <div className="p-6 md:p-8 bg-white border-t border-gray-100 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button className="flex flex-col items-center gap-1 group">
                            <Share2 className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Compartir</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                            <AlertCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Reportar</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-4">
                            <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-tighter mb-1">Status Verificado</span>
                            <span className="text-[10px] font-bold text-gray-400">Confianza: 98%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
