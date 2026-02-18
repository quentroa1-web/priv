import { useState, useEffect } from 'react';
import {
  X, Shield, CheckCircle, Star, MapPin, Clock, Crown,
  Heart, MessageCircle, Camera, ChevronLeft, ChevronRight,
  Users, Home, Sparkles, BadgeCheck, Loader2, ArrowRight,
  ShieldCheck, Share2, Flag, ExternalLink
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
  const neighborhood = locationData?.neighborhood || '';
  const specificZone = locationData?.specificZone || '';
  const displayLocation = locationData
    ? [locationData.city, locationData.department].filter(Boolean).join(', ')
    : (typeof user.location === 'string' ? user.location : 'Colombia');

  const isOwner = !!(currentUser && (user.uid === currentUser.id || user.id === currentUser.id));

  // Pricing Logic
  const price = user.pricing?.basePrice
    ? `$${user.pricing.basePrice.toLocaleString()}`
    : (user.price || '$0');

  const priceTypeMapping: Record<string, string> = {
    'hora': 'POR HORA',
    'sesion': 'POR SESIÓN',
    'negociable': 'NEGOCIABLE'
  };
  const priceLabel = user.pricing?.priceType
    ? priceTypeMapping[user.pricing.priceType]
    : 'TARIFA BASE';

  // Availability Logic
  const availabilityData = typeof user.availability === 'object' && !Array.isArray(user.availability)
    ? user.availability
    : null;
  const activeDays = availabilityData?.days || (Array.isArray(user.availability) ? user.availability : []);
  const startTime = availabilityData?.hours?.start || user.horarioInicio || '10:00 AM';
  const endTime = availabilityData?.hours?.end || user.horarioFin || '10:00 PM';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 lg:p-6 overflow-hidden">
      {/* Backdrop with extreme blur and dark tint */}
      <div
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-3xl transition-opacity animate-in fade-in duration-700"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="relative bg-[#fafafa] w-full max-w-7xl h-full md:h-[95vh] md:rounded-[2.5rem] shadow-[0_32px_128px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row border border-white/20 animate-in fade-in zoom-in slide-in-from-bottom-12 duration-700">

        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden absolute top-0 inset-x-0 z-50 px-5 py-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleFavorite}
              className={cn(
                "w-10 h-10 backdrop-blur-xl rounded-full flex items-center justify-center border transition-all",
                isFavorite
                  ? "bg-rose-500 text-white border-rose-400"
                  : "bg-white/20 text-white border-white/20"
              )}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </button>
          </div>
        </div>

        {/* LEFT: Immersive Media Gallery (Sticky on Desktop) */}
        <div className="relative w-full lg:w-[48%] xl:w-[45%] h-[55vh] lg:h-full bg-gray-900 overflow-hidden shrink-0">
          <div className="h-full relative group">
            {gallery.length > 0 ? (
              <img
                src={gallery[activeImgIndex]}
                alt={user.name}
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 gap-4">
                <Camera className="w-16 h-16 text-gray-700" />
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Sin imágenes</span>
              </div>
            )}

            {/* Navigation Overlays */}
            {gallery.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-start pl-4 cursor-pointer group/nav" onClick={prevImg}>
                  <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover/nav:opacity-100 transition-opacity border border-white/10">
                    <ChevronLeft className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end pr-4 cursor-pointer group/nav" onClick={nextImg}>
                  <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover/nav:opacity-100 transition-opacity border border-white/10">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </>
            )}

            {/* Artistic Gradients & Status */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between z-10">
              <div className="flex flex-col gap-2">
                {user.isVip && (
                  <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-white/20 w-max">
                    <Crown className="w-3.5 h-3.5" /> VIP GOLD
                  </div>
                )}
                {user.isOnline && (
                  <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> En línea ahora
                  </div>
                )}
              </div>

              {/* Image Counter */}
              {gallery.length > 1 && (
                <div className="bg-black/40 backdrop-blur-xl px-3 py-1 rounded-lg border border-white/10 text-white text-[10px] font-black">
                  {activeImgIndex + 1} / {gallery.length}
                </div>
              )}
            </div>

            {/* Subtle Thumbnail Bar (Desktop Only) */}
            {gallery.length > 1 && (
              <div className="absolute inset-y-0 right-4 hidden lg:flex flex-col justify-center gap-3">
                {gallery.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={cn(
                      "w-10 h-14 rounded-lg overflow-hidden border-2 transition-all duration-300 shadow-xl",
                      activeImgIndex === idx ? "border-amber-400 scale-110" : "border-white/20 opacity-40 hover:opacity-100"
                    )}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Bento Content Area (Scrollable) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">

          {/* Desktop Header Actions (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center justify-between px-10 py-6 border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400 cursor-help group/tip relative">
                <ShieldCheck className="w-4 h-4" />
                <div className="absolute top-full left-0 mt-2 w-48 p-3 bg-gray-900 text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50">
                  Perfil verificado y asegurado por SafeConnect.
                </div>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SafeConnect Certified</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleFavorite}
                className={cn(
                  "w-11 h-11 rounded-[14px] flex items-center justify-center border transition-all active:scale-90",
                  isFavorite ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-200" : "bg-gray-50 text-gray-400 border-gray-100 hover:text-rose-500 hover:bg-white"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
              </button>
              <button className="w-11 h-11 bg-gray-50 text-gray-400 rounded-[14px] flex items-center justify-center border border-gray-100 hover:text-gray-900 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="w-11 h-11 bg-gray-50 text-gray-400 rounded-[14px] flex items-center justify-center border border-gray-100 hover:text-red-500 transition-all">
                <Flag className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-100 mx-2" />
              <button
                onClick={onClose}
                className="w-11 h-11 bg-gray-950 text-white rounded-[14px] flex items-center justify-center hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Scroll Area */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 lg:py-10 space-y-8 custom-scrollbar">

            {/* 1. Profile Title Slab */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-black text-gray-950 tracking-tight flex items-center gap-3">
                    {user.name}
                    {user.verified && (
                      <BadgeCheck className="w-8 h-8 md:w-10 md:h-10 text-blue-500 shrink-0" fill="currentColor" color="white" />
                    )}
                  </h1>
                  <span className="text-2xl font-black text-gray-300">— {user.age} años</span>
                </div>
                <div className="flex items-center gap-2 text-rose-500 font-black text-xs uppercase tracking-[0.15em]">
                  <MapPin className="w-4 h-4" />
                  {displayLocation}
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={cn("w-4 h-4", i <= (user.rating || 5) ? "text-amber-400 fill-current" : "text-gray-200")} />
                  ))}
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{reviews.length} Reseñas</span>
              </div>
            </div>

            {/* 2. BENTO GRID SYSTEM */}
            <div className="grid grid-cols-12 gap-5">

              {/* Bio & Intro - Large Tile (8 cols) */}
              <div className="col-span-12 lg:col-span-8 bg-gray-50/50 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-rose-500 animate-pulse" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Acerca del anuncio</h3>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 leading-tight italic">
                    "{user.description || user.bio || 'Sin descripción disponible.'}"
                  </p>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] group-hover:bg-rose-500/10 transition-colors duration-1000" />
              </div>

              {/* Pricing Tile - Medium (4 cols) */}
              <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden border border-white/10">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Inversión</p>
                  <div className="flex flex-col">
                    <span className="text-4xl md:text-5xl font-black tracking-tighter text-amber-100">{price}</span>
                    <span className="text-xs font-black text-white/40 uppercase tracking-widest mt-1">{priceLabel}</span>
                  </div>
                </div>
                <div className="mt-8 relative z-10 flex items-center gap-3 border-t border-white/10 pt-6">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Respuesta</p>
                    <p className="text-xs font-black text-white tracking-widest leading-none mt-1">{user.responseTime || '15 min'}</p>
                  </div>
                </div>
                {/* Premium glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] -mr-16 -mt-16" />
              </div>

              {/* Location Detailed - (6 cols) */}
              <div className="col-span-12 md:col-span-6 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                      <MapPin className="w-5 h-5 text-rose-500" />
                    </div>
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Zona de Encuentro</h3>
                  </div>
                  <button className="text-[10px] font-black text-rose-500 flex items-center gap-1.5 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100/50 hover:bg-rose-500 hover:text-white transition-all">
                    Ver Mapa <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Barrio</p>
                      <p className="text-sm font-black text-gray-900 truncate">{neighborhood || 'Localidad'}</p>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Sitio</p>
                      <p className="text-sm font-black text-gray-900 truncate">{user.placeType?.[0] || 'Domicilio'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 flex items-start gap-3">
                    <Home className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Zona Específica</p>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed italic">
                        {specificZone || 'Referencia privada (disponible al contactar)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences - (6 cols) */}
              <div className="col-span-12 md:col-span-6 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                    <Users className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Preferencias</h3>
                </div>
                <div className="flex-1 flex flex-col gap-5 justify-center">
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Público Atendido</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(user.attendsTo?.length ? user.attendsTo : ['Hombres']).map(a => (
                        <span key={a} className="px-5 py-2.5 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Idiomas</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(user.languages?.length ? user.languages : ['Español']).map(l => (
                        <span key={l} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black border border-gray-100 uppercase">{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services & Amenities - Full Width (12 cols) */}
              <div className="col-span-12 bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-gray-950 flex items-center gap-4">
                    <div className="w-2 h-10 bg-gradient-to-b from-rose-500 to-pink-600 rounded-full" />
                    Servicios Ofrecidos
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 font-black text-[10px] uppercase tracking-[0.2em]">
                    {(user.services?.length || 0) + (user.customServices?.length || 0)} Items Disponibles
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...(user.services || []), ...(user.customServices || [])].map((s, idx) => (
                    <div key={idx} className="group flex items-center gap-4 p-5 bg-gray-50/50 hover:bg-rose-50/30 border border-transparent hover:border-rose-100 rounded-3xl transition-all duration-300">
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-700 text-sm md:text-base group-hover:text-gray-950 transition-colors uppercase tracking-tight">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability Slab - Full Width (12 cols) */}
              <div className="col-span-12 bg-[#141414] rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                  <div className="space-y-6 max-w-sm shrink-0 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-black tracking-tight">Disponibilidad</h3>
                    </div>
                    <p className="text-white/40 font-medium leading-relaxed">Cada anuncio tiene su propia agenda configurada. Si tienes dudas, pregunta por disponibilidad inmediata vía chat.</p>
                    <div className="flex items-center justify-center lg:justify-start gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl w-max mx-auto lg:mx-0">
                      <span className="text-lg font-black tracking-widest text-emerald-400">{startTime} — {endTime}</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full max-w-2xl">
                    <div className="grid grid-cols-7 gap-2 md:gap-4">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => {
                        const dayLower = day.toLowerCase();
                        const isActive = activeDays.some(d =>
                          d.toLowerCase().includes(dayLower) ||
                          (day === 'Mié' && d.toLowerCase().includes('miercoles')) ||
                          (day === 'Sáb' && d.toLowerCase().includes('sabado'))
                        );
                        return (
                          <div key={day} className="flex flex-col items-center gap-3">
                            <div className={cn(
                              "w-full aspect-[4/5] rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-700",
                              isActive
                                ? "bg-gradient-to-br from-emerald-400 to-green-600 border-emerald-300 text-white shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] scale-110"
                                : "bg-white/5 border-white/5 text-white/20 grayscale"
                            )}>
                              <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter mb-1">{day}</span>
                              {isActive ? <CheckCircle className="w-4 h-4 text-emerald-100" /> : <X className="w-3 h-3 text-white/10" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* Subtle texture background */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-10 pointer-events-none" />
              </div>

              {/* Verified Trust Section (12 cols) */}
              <div className="col-span-12 bg-gradient-to-r from-blue-600 to-indigo-800 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden group">
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                  <div className="flex items-center gap-8">
                    <div className="p-6 bg-white rounded-[2rem] shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                      <ShieldCheck className="w-16 h-16 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-3xl font-black tracking-tight">Protección SafeConnect</h4>
                      <p className="text-blue-100/70 font-medium max-w-md">Este anuncio cuenta con auditoría de veracidad. Reporta cualquier perfil que no coincida con la realidad.</p>
                    </div>
                  </div>
                  <button className="px-10 py-5 bg-white text-blue-800 rounded-3xl font-black text-lg shadow-2xl hover:bg-blue-50 transition-all active:scale-95 shrink-0">
                    Reportar Anuncio
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] -mr-32 -mt-32" />
              </div>

            </div>

            {/* Bottom Spacing */}
            <div className="h-24 md:h-32" />
          </div>

          {/* FLOATING ACTION BAR - Bottom Component */}
          <div className="absolute bottom-6 inset-x-6 md:bottom-10 md:inset-x-10 z-[40]">
            <div className="bg-white/70 backdrop-blur-3xl p-3 md:p-4 rounded-[3rem] border border-white shadow-[0_32px_80px_-20px_rgba(0,0,0,0.4)] flex items-center gap-4">
              <button
                onClick={() => onMessage?.(user.uid || user.id || '', user.id || user._id)}
                disabled={isOwner}
                className="flex-1 h-14 md:h-16 bg-gray-950 hover:bg-black text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                {isOwner ? 'TU ANUNCIO' : 'INICIAR CHAT'}
              </button>

              {user.whatsapp && (
                <a
                  href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-90 transition-all shrink-0"
                >
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.52c1.54.914 3.382 1.403 5.26 1.404.006 0 0 0 0 0 5.464 0 9.903-4.439 9.906-9.903.001-2.648-1.03-5.136-2.903-7.01s-4.362-2.903-7.011-2.903c-5.463 0-9.903 4.44-9.906 9.903-.001 2.074.547 4.1 1.584 5.867l-1.035 3.784 3.882-1.018zm11.366-7.44c-.312-.156-1.848-.912-2.134-1.017-.286-.104-.494-.156-.701.156s-.805 1.017-.986 1.222-.364.234-.676.078c-.312-.156-1.316-.484-2.508-1.548-.928-.827-1.554-1.85-1.736-2.16-.182-.312-.019-.481.137-.636.141-.14.312-.364.468-.546s.208-.312.312-.52c.104-.208.052-.39-.026-.546s-.701-1.691-.962-2.313c-.254-.607-.513-.526-.701-.536-.182-.009-.39-.011-.597-.011s-.546.078-.831.39c-.286.312-1.091 1.067-1.091 2.6s1.117 3.016 1.274 3.224 2.193 3.352 5.313 4.697c.742.32 1.32.511 1.768.653.746.237 1.424.204 1.961.124.598-.089 1.848-.755 2.108-1.483.26-.728.26-1.353.182-1.483-.078-.13-.286-.234-.598-.39z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
