import { useState, useEffect } from 'react';
import {
  X, Shield, CheckCircle, Star, MapPin, Clock, Crown,
  Heart, MessageCircle, Flag, Camera, ChevronLeft, ChevronRight,
  Users, Home, Globe, Sparkles, BadgeCheck, Loader2, ArrowRight
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';


interface UserDetailModalProps {
  user: User | null;
  onClose: () => void;
  onMessage?: (userId: string, adId?: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function UserDetailModal({ user, onClose, onMessage, isFavorite, onToggleFavorite }: UserDetailModalProps) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (user?.id || user?.uid) {
      const fetchReviews = async () => {
        try {
          setLoadingReviews(true);
          const res = await apiService.getUserReviews(user.id || user.uid || '') as any;
          if (res.data.success) {
            setReviews(res.data.data);
          }
        } catch (err) {
          console.error('Error fetching reviews:', err);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [user]);

  if (!user) return null;

  const gallery = user.gallery || (user.images?.length ? user.images : [user.avatar].filter(Boolean)) as string[];

  const nextImg = () => setActiveImgIndex((prev) => (prev + 1) % gallery.length);
  const prevImg = () => setActiveImgIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  const locationData = user.locationData || (typeof user.location === 'object' ? user.location : null);
  const displayLocation = locationData
    ? [locationData.city, locationData.department].filter(Boolean).join(', ')
    : (typeof user.location === 'string' ? user.location : 'Colombia');

  const neighborhood = locationData?.neighborhood || '';
  const specificZone = locationData?.specificZone || '';

  const isOwner = !!(currentUser && (user.uid === currentUser.id || user.id === currentUser.id));

  // Pricing Logic
  const price = user.pricing?.basePrice
    ? `$${user.pricing.basePrice.toLocaleString()}`
    : (user.price || '$0');

  const priceTypeMapping: Record<string, string> = {
    'hora': 'por hora',
    'sesion': 'por sesión',
    'negociable': 'negociable'
  };
  const priceLabel = user.pricing?.priceType
    ? priceTypeMapping[user.pricing.priceType]
    : 'tarifa base';

  // Availability Logic
  const availabilityData = typeof user.availability === 'object' && !Array.isArray(user.availability)
    ? user.availability
    : null;
  const activeDays = availabilityData?.days || (Array.isArray(user.availability) ? user.availability : []);
  const startTime = availabilityData?.hours?.start || user.horarioInicio;
  const endTime = availabilityData?.hours?.end || user.horarioFin;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-2 md:p-6 lg:p-8">
        <div className="relative bg-white rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] max-w-6xl w-full max-h-[92vh] overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col lg:flex-row">

          {/* Close Button - Integrated but floating */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/20 backdrop-blur-3xl rounded-2xl flex items-center justify-center hover:bg-white text-white hover:text-gray-950 transition-all shadow-2xl border border-white/20 hover:scale-110 active:scale-95 group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>

          {/* Left: Premium Hero Gallery */}
          <div className="lg:w-[45%] relative bg-gray-100 h-[60vh] lg:h-auto overflow-hidden">
            <div className="h-full relative overflow-hidden group">
              {gallery.length > 0 ? (
                <img
                  src={gallery[activeImgIndex]}
                  alt={user.name}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 gap-4">
                  <Camera className="w-16 h-16 text-gray-300" />
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Sin fotos disponibles</span>
                </div>
              )}

              {/* Navigation Overlays */}
              {gallery.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={prevImg}
                    className="w-12 h-12 bg-black/30 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center hover:bg-black/50 transition-all border border-white/10"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button
                    onClick={nextImg}
                    className="w-12 h-12 bg-black/30 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center hover:bg-black/50 transition-all border border-white/10"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </div>
              )}

              {/* Artistic Gradients */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

              {/* Floating ID & Status Badge */}
              <div className="absolute top-8 left-8 flex flex-col gap-3 z-10">
                <div className="flex flex-wrap gap-2">
                  {user.isOnline && (
                    <div className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border border-emerald-400/50">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      En línea
                    </div>
                  )}
                  {user.isVip ? (
                    <div className="bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 text-white px-5 py-2 rounded-full text-[10px] font-black shadow-2xl flex items-center gap-2 border border-white/20 uppercase tracking-widest">
                      <Crown className="w-4 h-4" /> VIP GOLD
                    </div>
                  ) : user.premium && (
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2 rounded-full text-[10px] font-black shadow-xl border border-white/10 uppercase tracking-widest">
                      Premium
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails Bar - Slim & Elegant */}
              {gallery.length > 1 && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-8 z-10 overflow-x-auto no-scrollbar py-2">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={cn(
                        "w-12 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-500 shadow-2xl transform",
                        activeImgIndex === idx
                          ? "border-white scale-110 shadow-white/30"
                          : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                      )}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Content Area - Scrollable */}
          <div className="lg:w-[55%] bg-white flex flex-col h-full relative overflow-hidden">

            {/* Action Header - Sticky Top */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-0.5 shadow-lg">
                  <img
                    src={user.avatar || gallery[0]}
                    className="w-full h-full rounded-[14px] object-cover border-2 border-white/20"
                    alt=""
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
                    {user.name}
                    {user.verified && (
                      <BadgeCheck className="w-6 h-6" fill="#3b82f6" color="white" />
                    )}
                  </h2>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {displayLocation}
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={onToggleFavorite}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all active:scale-90 border",
                    isFavorite
                      ? "bg-rose-500 text-white border-rose-400 shadow-rose-100"
                      : "bg-gray-50 text-gray-400 border-gray-100 hover:text-rose-500 hover:bg-rose-50"
                  )}
                >
                  <Heart className={cn("w-6 h-6", isFavorite && "fill-white")} />
                </button>
                <button className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 hover:text-red-500 hover:bg-red-50 transition-all">
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div className="p-8 space-y-10">

                {/* Intro Section with Pricing */}
                <div className="flex flex-col md:flex-row gap-8 justify-between">
                  <div className="space-y-4 max-w-sm">
                    <div className="flex items-center gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Edad</p>
                        <p className="text-xl font-black text-gray-900">{user.age} años</p>
                      </div>
                      <div className="w-px h-8 bg-gray-100" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</p>
                        <div className="flex items-center gap-1 text-xl font-black text-amber-500">
                          <Star className="w-5 h-5" fill="currentColor" />
                          {user.rating || '5.0'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Sobre mí
                      </p>
                      <p className="text-gray-600 font-medium leading-relaxed italic text-lg">
                        "{user.description || user.bio}"
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-[2rem] p-6 flex flex-col items-center justify-center min-w-[200px] shadow-sm">
                    <div className="text-4xl font-black text-rose-600 tracking-tighter">
                      {price}
                    </div>
                    <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">
                      {priceLabel}
                    </div>
                    <div className="mt-4 pt-4 border-t border-rose-200/50 w-full flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Response</p>
                        <p className="text-xs font-black text-gray-700">{user.responseTime || '15 min'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid Details: Location, Attendance, Places */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">

                  {/* Location Detailed */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" /> Ubicación Detallada
                    </h3>
                    <div className="space-y-3 bg-gray-50 rounded-3xl p-5 border border-gray-100">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-bold">Localidad/Barrio</span>
                        <span className="text-gray-900 font-black">{neighborhood || '—'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-bold">Zona Específica</span>
                        <span className="text-gray-900 font-black truncate max-w-[150px]">{specificZone || 'Referencia no disponible'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-[10px] text-rose-600 font-black uppercase tracking-widest bg-rose-50/50 py-2 px-3 rounded-xl border border-rose-100/30">
                        <Home className="w-3.5 h-3.5" />
                        Atiende en: {user.placeType?.join(', ') || 'Domicilio'}
                      </div>
                    </div>
                  </div>

                  {/* Attendance & Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4 text-rose-500" /> Preferencias de Atención
                    </h3>
                    <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 space-y-4">
                      <div>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-2">Público Objetivo</p>
                        <div className="flex flex-wrap gap-2">
                          {(user.attendsTo?.length ? user.attendsTo : ['Hombres']).map(a => (
                            <span key={a} className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold text-gray-700 border border-gray-200 shadow-sm">{a}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase mb-2">Idiomas</p>
                        <div className="flex flex-wrap gap-2">
                          {(user.languages?.length ? user.languages : ['Español']).map(l => (
                            <span key={l} className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold text-gray-500 border border-gray-100">{l}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Section - Major Visual Element */}
                <div className="space-y-5">
                  <h3 className="text-lg font-black text-gray-950 flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                      Servicios Ofrecidos
                    </span>
                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest">
                      {(user.services?.length || 0) + (user.customServices?.length || 0)} items
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...(user.services || []), ...(user.customServices || [])].map((s, idx) => (
                      <div key={idx} className="group p-4 bg-white border border-gray-100 rounded-2xl hover:border-rose-200 hover:bg-rose-50/20 transition-all flex items-center gap-4 shadow-sm hover:shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-all shadow-inner">
                          <CheckCircle className="w-5 h-5 text-rose-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-rose-900">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                      Disponibilidad
                    </h3>
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-black text-emerald-700">{startTime} — {endTime}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-3">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => {
                      const dayLower = day.toLowerCase();
                      const isActive = activeDays.some(d =>
                        d.toLowerCase().includes(dayLower) ||
                        (day === 'Mié' && d.toLowerCase().includes('miercoles')) ||
                        (day === 'Sáb' && d.toLowerCase().includes('sabado'))
                      );
                      return (
                        <div
                          key={day}
                          className={cn(
                            "flex flex-col items-center gap-2 transition-all duration-300",
                            !isActive && "opacity-40 grayscale"
                          )}
                        >
                          <div className={cn(
                            "w-full aspect-[4/5] rounded-[1.25rem] flex flex-col items-center justify-center border-2 transition-all",
                            isActive
                              ? "bg-gradient-to-br from-emerald-400 to-green-600 text-white border-emerald-300 shadow-xl shadow-emerald-100"
                              : "bg-white text-gray-400 border-gray-100"
                          )}>
                            <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">{day}</span>
                            <CheckCircle className={cn("w-4 h-4 mt-1", isActive ? "text-white" : "text-gray-200")} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews Summary */}
                <div className="pt-4 space-y-8">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                    <h3 className="text-xl font-black text-gray-950 flex items-center gap-3">
                      <Star className="w-7 h-7 text-amber-500" fill="currentColor" />
                      Reseñas Verificadas
                    </h3>
                    <button className="text-xs font-black text-rose-500 hover:text-rose-600 flex items-center gap-1 group">
                      Ver todas <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {loadingReviews ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Cargando experiencias...</p>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {reviews.slice(0, 2).map((rev) => (
                          <div key={rev._id} className="group p-8 bg-gray-50/50 hover:bg-white rounded-[2.5rem] border border-gray-100 hover:border-rose-100/50 hover:shadow-2xl hover:shadow-rose-100/20 transition-all duration-500">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-rose-600 text-xl font-black shadow-inner">
                                  {rev.reviewer?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="text-lg font-black text-gray-900">{rev.reviewer?.name || 'Usuario'}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                                <span className="text-base font-black text-gray-950">{rev.rating}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 font-medium italic mb-6 leading-relaxed relative pl-6">
                              <span className="absolute left-0 top-0 text-4xl text-rose-200 font-serif">"</span>
                              {rev.comment}
                            </p>

                            {rev.response && (
                              <div className="mt-6 bg-white rounded-3xl p-6 border border-rose-50 shadow-sm relative">
                                <div className="absolute -top-3 left-6 px-3 bg-white text-[9px] font-black text-rose-500 uppercase tracking-widest border border-rose-100 rounded-full">Propietario</div>
                                <p className="text-sm text-gray-500 italic leading-relaxed">"{rev.response.content}"</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center gap-4 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                        <div className="p-4 bg-white rounded-3xl shadow-sm">
                          <Shield className="w-10 h-10 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-black italic text-center max-w-xs">Aún no hay reseñas para este perfil. ¡Sé el primero en calificar!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trust Section */}
                <div className="bg-gray-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-rose-500/20 transition-all duration-1000" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                      <h4 className="text-2xl font-black tracking-tight">Anuncio Verificado SafeConnect</h4>
                      <p className="text-gray-400 font-medium text-sm max-w-md">Para tu seguridad, todos los perfiles Premium pasan por un estricto proceso de validación. Reporta cualquier irregularidad.</p>
                    </div>
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-12 h-12 rounded-2xl border-4 border-gray-950 bg-gray-800 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-gray-600" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Spacing */}
                <div className="h-20" />
              </div>
            </div>

            {/* ACTION BAR - Floating Sticky Bottom */}
            <div className="absolute bottom-6 left-6 right-6 z-40">
              <div className="bg-gray-900/80 backdrop-blur-2xl px-6 py-5 rounded-[2rem] border border-white/10 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)] flex items-center gap-4">
                <button
                  onClick={() => onMessage?.(user.uid || user.id || '', user.id || user._id)}
                  disabled={isOwner}
                  className="flex-[2] h-14 bg-gradient-to-r from-rose-500 via-rose-600 to-pink-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-rose-500/30 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-6 h-6" />
                  {isOwner ? 'Es tu anuncio' : 'Chatear ahora'}
                </button>

                {user.whatsapp && (
                  <a
                    href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] hover:-translate-y-1 active:scale-95 transition-all"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.52c1.54.914 3.382 1.403 5.26 1.404.006 0 0 0 0 0 5.464 0 9.903-4.439 9.906-9.903.001-2.648-1.03-5.136-2.903-7.01s-4.362-2.903-7.011-2.903c-5.463 0-9.903 4.44-9.906 9.903-.001 2.074.547 4.1 1.584 5.867l-1.035 3.784 3.882-1.018zm11.366-7.44c-.312-.156-1.848-.912-2.134-1.017-.286-.104-.494-.156-.701.156s-.805 1.017-.986 1.222-.364.234-.676.078c-.312-.156-1.316-.484-2.508-1.548-.928-.827-1.554-1.85-1.736-2.16-.182-.312-.019-.481.137-.636.141-.14.312-.364.468-.546s.208-.312.312-.52c.104-.208.052-.39-.026-.546s-.701-1.691-.962-2.313c-.254-.607-.513-.526-.701-.536-.182-.009-.39-.011-.597-.011s-.546.078-.831.39c-.286.312-1.091 1.067-1.091 2.6s1.117 3.016 1.274 3.224 2.193 3.352 5.313 4.697c.742.32 1.32.511 1.768.653.746.237 1.424.204 1.961.124.598-.089 1.848-.755 2.108-1.483.26-.728.26-1.353.182-1.483-.078-.13-.286-.234-.598-.39z" />
                    </svg>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
