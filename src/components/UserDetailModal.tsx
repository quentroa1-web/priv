import { useState } from 'react';
import {
  X, Shield, CheckCircle, Star, MapPin, Clock, Crown,
  Heart, MessageCircle, Flag, Camera, ChevronLeft, ChevronRight,
  Users, Home, Globe, Sparkles, BadgeCheck
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
  onMessage?: (userId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function UserDetailModal({ user, onClose, onMessage, isFavorite, onToggleFavorite }: UserDetailModalProps) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const { user: currentUser } = useAuth();

  if (!user) return null;

  const gallery = user.gallery || [user.avatar].filter(Boolean) as string[];

  const nextImg = () => setActiveImgIndex((prev) => (prev + 1) % gallery.length);
  const prevImg = () => setActiveImgIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  const displayLocation = typeof user.location === 'object'
    ? [(user.location as any).city, (user.location as any).department].filter(Boolean).join(', ')
    : user.location;

  const isOwner = !!(currentUser && (user.uid === currentUser.id || user.id === currentUser.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-2 md:p-6">
        <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in duration-300">

          {/* Close Button - More prominent */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:bg-white transition-all shadow-2xl border border-gray-100 hover:scale-110 active:scale-95 group"
          >
            <X className="w-6 h-6 text-gray-900 group-hover:rotate-90 transition-transform" />
          </button>

          <div className="flex flex-col lg:flex-row h-full">

            {/* Left: Image Gallery (Stickied on Desktop) */}
            <div className="lg:w-1/2 relative bg-gray-50 border-r border-gray-100">
              <div className="aspect-[4/5] lg:aspect-auto lg:h-full relative overflow-hidden">
                {gallery.length > 0 ? (
                  <img
                    src={gallery[activeImgIndex]}
                    alt={user.name}
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Image Navigation Arrows */}
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-black/40 transition-all border border-white/20"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-black/40 transition-all border border-white/20"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Gradients */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                {/* Thumbnails Overlay */}
                {gallery.length > 1 && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4 z-10">
                    {gallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={cn(
                          "w-12 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-lg",
                          activeImgIndex === idx
                            ? "border-white scale-110 shadow-white/20"
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Badges on Image */}
              <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-10">
                {user.isOnline && (
                  <div className="flex items-center gap-2 bg-green-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl border border-white/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    En línea
                  </div>
                )}
                {user.isVip ? (
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-600 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-xl flex items-center gap-2 border border-white/20">
                    <Crown className="w-4 h-4" /> VIP GOLD
                  </div>
                ) : user.premium && (
                  <div className="bg-rose-600/95 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black shadow-xl border border-white/10 uppercase tracking-widest">
                    Premium
                  </div>
                )}
              </div>
            </div>

            {/* Right: Detailed Content */}
            <div className="lg:w-1/2 p-6 md:p-10 lg:max-h-[90vh] lg:overflow-y-auto">

              {/* Header Info */}
              <div className="space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight flex flex-wrap items-center gap-2 md:gap-3">
                      {user.name}, {user.age}
                      {user.verified && (
                        <BadgeCheck className="w-6 h-6 md:w-8 h-8 shrink-0" fill="#3b82f6" color="white" />
                      )}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-500 mt-2 font-bold text-base md:text-lg truncate">
                      <div className="flex items-center gap-2 shrink-0">
                        {user.isOnline && <span className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm shrink-0"></span>}
                        <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                      </div>
                      <span className="truncate">{displayLocation}</span>
                    </div>
                  </div>
                  <div className="bg-rose-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:text-right border border-rose-100 sm:border-none">
                    <div className="text-3xl md:text-4xl font-black text-rose-600 tracking-tight">
                      {user.price}
                    </div>
                    <div className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                      Tarifa base
                    </div>
                  </div>
                </div>


                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-100 shadow-sm">
                    <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                    <span className="font-black text-amber-700 text-lg">{user.rating || '5.0'}</span>
                    <span className="text-amber-500/50 text-sm font-bold">({user.reviewCount || 0} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 font-bold text-sm uppercase tracking-tight">
                    <Clock className="w-5 h-5 text-gray-300" />
                    Respuesta: {user.responseTime || '15 min'}
                  </div>
                </div>
              </div>

              {/* Stats Grid - Verification State */}
              <div className="mb-8">
                {(user.idVerified || user.photoVerified || user.verified) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.idVerified && (
                      <div className="p-4 rounded-3xl border-2 transition-all flex items-center gap-3 bg-blue-50 border-blue-100 text-blue-700">
                        <div className="p-2 rounded-xl bg-blue-100">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Identidad</p>
                          <p className="text-sm font-black">Verificada con ID</p>
                        </div>
                        <CheckCircle className="w-4 h-4 ml-auto text-blue-500" />
                      </div>
                    )}

                    {user.photoVerified && (
                      <div className="p-4 rounded-3xl border-2 transition-all flex items-center gap-3 bg-green-50 border-green-100 text-green-700">
                        <div className="p-2 rounded-xl bg-green-100">
                          <Camera className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Fotos</p>
                          <p className="text-sm font-black">Fotos verificadas</p>
                        </div>
                        <CheckCircle className="w-4 h-4 ml-auto text-green-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-3xl border-2 bg-gray-50 border-gray-200 text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gray-200">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Estado de Verificación</p>
                        <p className="text-sm font-black">Sin verificar</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                {/* Description */}
                <section>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    Sobre mi perfil
                  </h3>
                  <p className="text-gray-700 leading-relaxed font-medium text-lg italic pr-4 border-l-4 border-rose-100 pl-4 bg-rose-50/30 py-4 rounded-r-3xl">
                    "{user.description}"
                  </p>
                </section>

                {/* Multi-Select Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Atención a */}
                  <section>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Atiendo a
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(user.attendsTo && user.attendsTo.length > 0 ? user.attendsTo : ['Todos']).map((target, idx) => (
                        <span key={idx} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black border border-rose-100 shadow-sm flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {target}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Lugares */}
                  <section>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Lugares
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(user.placeType && user.placeType.length > 0 ? user.placeType : ['Domicilio']).map((place, idx) => (
                        <span key={idx} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-xs font-black border border-blue-100 shadow-sm flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {place}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Languages */}
                {user.languages && user.languages.length > 0 && (
                  <section>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Idiomas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((lang, idx) => (
                        <span key={idx} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-2xl text-xs font-black border border-gray-100">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Services */}
                <section>
                  <h3 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                    Servicios ofrecidos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {user.services?.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white hover:bg-rose-50 rounded-2xl border border-gray-100 hover:border-rose-200 transition-all group scale-100 active:scale-95"
                      >
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                          <CheckCircle className="w-4 h-4 text-rose-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-rose-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Availability */}
                <section>
                  <h3 className="text-base font-black text-gray-900 mb-4 flex items-baseline justify-between">
                    Disponibilidad
                    <span className="text-xs text-rose-500 font-black uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">30 días activo</span>
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => {
                      const isActive = user.availability?.includes(day);
                      return (
                        <div
                          key={day}
                          className={cn(
                            "aspect-square rounded-2xl flex items-center justify-center text-xs font-black transition-all border-2",
                            isActive
                              ? "bg-green-500 text-white border-green-400 shadow-lg shadow-green-100 scale-105"
                              : "bg-gray-50 text-gray-300 border-transparent shadow-inner"
                          )}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Final Actions */}
                <div className="pt-10 pb-4 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => onMessage?.(user.uid || user.id || '')}
                    disabled={isOwner}
                    className="flex-1 h-14 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:shadow-rose-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <MessageCircle className="w-6 h-6" />
                    {isOwner ? 'Es tu anuncio' : 'Enviar mensaje'}
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={onToggleFavorite}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 border group",
                        isFavorite ? "bg-rose-500 text-white border-rose-400" : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                      )}
                    >
                      <Heart className={cn("w-7 h-7 group-hover:animate-bounce", isFavorite && "fill-white")} />
                    </button>
                    <button className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-gray-100 hover:bg-gray-100 transition-all active:scale-90 border border-gray-200 group">
                      <Flag className="w-6 h-6 group-hover:text-red-500" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
