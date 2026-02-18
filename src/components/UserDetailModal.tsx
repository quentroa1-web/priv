import { useState, useEffect } from 'react';
import {
  X, Star, MapPin, Crown,
  Heart, MessageCircle, Camera,
  ChevronLeft, ChevronRight,
  BadgeCheck, Loader2, Plane, Clock, Globe, Languages, Info, ExternalLink, Sparkles, Share2
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

export function UserDetailModal({
  user,
  onClose,
  onMessage,
  isFavorite,
  onToggleFavorite
}: UserDetailModalProps) {
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
          console.error(err);
        } finally {
          setLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [user]);

  if (!user) return null;

  const gallery = user.gallery || (user.images?.length ? user.images : [user.avatar].filter(Boolean)) as string[];

  const nextImg = () =>
    setActiveImgIndex((prev) => (prev + 1) % gallery.length);

  const prevImg = () =>
    setActiveImgIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  const isOwner = !!(
    currentUser &&
    (user.uid === currentUser.id || user.id === currentUser.id)
  );

  const locationData = user.locationData || (typeof user.location === 'object' ? user.location : null);
  const neighborhood = locationData?.neighborhood || '';
  const specificZone = locationData?.specificZone || '';
  const city = locationData?.city || (typeof user.location === 'string' ? user.location : 'Colombia');

  const pricing = user.pricing || {};
  const price = pricing.basePrice
    ? `$${pricing.basePrice.toLocaleString()}`
    : (user.price || '$0');

  const priceTypeMapping: Record<string, string> = {
    hora: 'por hora',
    sesion: 'por sesión',
    negociable: 'negociable'
  };
  const priceLabel = pricing.priceType
    ? priceTypeMapping[pricing.priceType]
    : 'tarifa base';

  const availability = user.availability || {};
  const activeDays = (typeof availability === 'object' && !Array.isArray(availability))
    ? availability.days || []
    : (Array.isArray(availability) ? availability : []);
  const hours = (typeof availability === 'object' && !Array.isArray(availability)) ? availability.hours : null;
  const startTime = hours?.start || user.horarioInicio || '10:00 AM';
  const endTime = hours?.end || user.horarioFin || '10:00 PM';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 lg:p-6 overflow-hidden">
      {/* Editorial Backdrop */}
      <div
        className="absolute inset-0 bg-gray-50/90 backdrop-blur-md transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Main Modal Container - Bento Norway Edition */}
      <div className="relative bg-[#f8f9fa] w-full max-w-7xl h-full md:h-[95vh] md:rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-white animate-in zoom-in slide-in-from-bottom-5 duration-700">

        {/* REFINED HEADER - COMPACT & ELEGANT */}
        <div className="px-6 md:px-12 py-5 bg-white border-b border-gray-100 shrink-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">
                    {user.name}
                  </h1>
                  {user.verified && <BadgeCheck className="w-6 h-6 text-blue-500" fill="currentColor" color="white" />}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                    <div className={cn("w-1.5 h-1.5 rounded-full", user.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300")} />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{user.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Colombia • {city}</span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <div className="flex flex-col items-end border-r border-gray-100 pr-8">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">VALORACIÓN</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-gray-900">{user.rating || 5.0}</span>
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button onClick={onClose} className="md:hidden w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT GRID (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-12 gap-6 lg:auto-rows-min">

            {/* HERO GALLERY TILE - IMMERSIVE */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative h-[500px] md:h-[650px] border border-white">
              {gallery.length > 0 ? (
                <img
                  src={gallery[activeImgIndex]}
                  className="w-full h-full object-cover transition-all duration-1000"
                  alt={user.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Camera className="w-16 h-16 text-gray-200" />
                </div>
              )}

              {/* Dynamic Overlay for Contrast */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Info on Image */}
              <div className="absolute bottom-8 left-8 right-8 z-20 flex items-end justify-between">
                <div className="space-y-2">
                  <h3 className="text-white text-4xl font-black tracking-tight drop-shadow-2xl">
                    {user.displayName || user.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeDays.slice(0, 3).map(d => (
                      <span key={d} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Thumbnails Overlay */}
                {gallery.length > 1 && (
                  <div className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl">
                    {gallery.slice(0, 4).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={cn(
                          "w-12 h-12 rounded-xl overflow-hidden border-2 transition-all active:scale-90",
                          activeImgIndex === idx ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                        )}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {gallery.length > 4 && (
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white text-[10px] font-black backdrop-blur-md border border-white/10">
                        +{gallery.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gallery Nav */}
              {gallery.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 flex justify-between z-20 pointer-events-none">
                  <button onClick={prevImg} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all pointer-events-auto active:scale-90">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={nextImg} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all pointer-events-auto active:scale-90">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>

            {/* LOCATION / ZONE TILE (Top Right Small) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-[2rem] p-8 border border-white shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Zona de Encuentro</h4>
                </div>
                <button className="text-gray-300 hover:text-indigo-600">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-12 bg-indigo-600 rounded-full" />
                  <div>
                    <p className="text-sm font-black text-gray-950 uppercase tracking-tighter leading-none mb-1">{city}</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{neighborhood || 'Barrio Principal'}</p>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                  <Info className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">ZONA ESPECÍFICA</p>
                    <p className="text-xs font-bold text-gray-700 leading-relaxed italic">
                      {specificZone || 'Referencia privada (disponible al contactar)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {(user.placeType?.length ? user.placeType : ['Domicilio']).map(p => (
                  <span key={p} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">{p}</span>
                ))}
              </div>
            </div>

            {/* CLEAN PRICING TILE */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group border border-gray-800 flex flex-col justify-between">
              <div className="relative z-10 flex flex-col items-center text-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">INVERSIÓN EXCLUSIVA</p>
                <h2 className="text-6xl font-black tracking-tighter mb-2">{price}</h2>
                <div className="px-5 py-2 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/30">
                  {priceLabel}
                </div>

                <div className="mt-10 flex items-center gap-6 w-full pt-10 border-t border-white/5">
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">DURACIÓN</span>
                    <span className="text-sm font-bold">1 HORA</span>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">CITA</span>
                    <span className="text-sm font-bold">PREVIA</span>
                  </div>
                </div>
              </div>
              {/* Visual Flair */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px]" />
            </div>

            {/* QUICK STATS BENTO */}
            <div className="col-span-12 md:col-span-6 lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col items-center gap-3 text-center transition-all hover:bg-gray-50">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-1">
                  <MapPin className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">UBICACIÓN</p>
                  <p className="text-xs font-black text-gray-900 uppercase">{city}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{neighborhood}</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col items-center gap-3 text-center transition-all hover:bg-gray-50">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-1">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">HORARIO</p>
                  <p className="text-xs font-black text-gray-900 uppercase">{startTime}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">a {endTime}</p>
                </div>
              </div>
              <div className="col-span-2 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">DISPONIBILIDAD</span>
                  <div className="flex gap-1">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                      <div key={i} className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold", i < 5 ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-300")}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Agenda vía chat con anticipación</p>
              </div>
            </div>

            {/* SERVICES MINI TILE */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">SERVICIOS DESTACADOS</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...(user.services || []), ...(user.customServices || [])].slice(0, 10).map((s, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-50 text-[10px] font-black text-gray-700 uppercase tracking-wider rounded-xl border border-gray-100 transition-all hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 pointer-default">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* LANGUAGES & ATTENTION MINI TILE */}
            <div className="col-span-12 md:col-span-8 lg:col-span-8 bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">IDIOMAS</p>
                  <div className="flex flex-wrap gap-3">
                    {(user.languages || ['Español']).map(l => (
                      <span key={l} className="text-sm font-black text-gray-900 uppercase border-b-2 border-indigo-200 pb-0.5">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">RECOMENDADO PARA</p>
                  <div className="flex flex-wrap gap-3">
                    {(user.attendsTo || ['Hombres']).map(a => (
                      <span key={a} className="text-sm font-black text-gray-900 uppercase border-b-2 border-indigo-200 pb-0.5">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">MODALIDAD</p>
                  <p className="text-lg font-black text-gray-900 uppercase tracking-tight">{(user.placeType || ['Domicilio']).join(', ')}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                  <Globe className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            </div>

            {/* BIO TILE */}
            <div className="col-span-12 md:col-span-8 lg:col-span-8 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Languages className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">MI HISTORIA</h4>
                </div>
                <p className="text-2xl font-black text-gray-800 leading-[1.3] italic border-l-4 border-indigo-500 pl-8">
                  "{user.description || user.bio || 'Una experiencia inolvidable te espera. Contacta ahora para más detalles.'}"
                </p>
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-5 grayscale pointer-events-none">
                <BadgeCheck className="w-32 h-32" />
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="col-span-12 py-12 space-y-12">
              <div className="flex items-center justify-between px-4">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 tracking-tighter">RESEÑAS</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">TESTIMONIOS REALES Y VERIFICADOS</p>
                </div>
                <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                  <span className="text-2xl font-black text-gray-900">{user.rating || 5.0}</span>
                  <div className="flex gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
                {loadingReviews ? (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando...</span>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.slice(0, 3).map((rev) => (
                    <div key={rev._id} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xs font-black">
                            {rev.reviewer?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{rev.reviewer?.name || 'Cliente'}</span>
                        </div>
                        <div className="px-3 py-1.5 bg-amber-50 rounded-xl text-amber-600 text-xs font-black border border-amber-100 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-current" /> {rev.rating}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm font-medium italic leading-relaxed pl-4 border-l-2 border-indigo-100">"{rev.comment}"</p>
                      <div className="mt-auto pt-4 flex justify-between items-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 text-gray-300">
                    <Star className="w-12 h-12" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">No hay reseñas registradas aún</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Spacing */}
          <div className="h-24 md:h-32" />
        </div>

        {/* REFINED ACTION BAR */}
        <div className="px-8 md:px-12 py-8 bg-white/95 backdrop-blur-3xl border-t border-gray-100 shrink-0 z-30 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleFavorite}
              className={cn(
                "w-16 h-16 rounded-[1.25rem] flex items-center justify-center border transition-all active:scale-90 shadow-sm",
                isFavorite ? "bg-rose-500 text-white border-rose-600 shadow-xl shadow-rose-200" : "bg-white text-gray-300 border-gray-200 hover:text-rose-500 hover:border-rose-100"
              )}
            >
              <Heart className={cn("w-7 h-7", isFavorite && "fill-current")} />
            </button>
            <button className="w-16 h-16 bg-white rounded-[1.25rem] flex items-center justify-center text-gray-300 border border-gray-200 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm">
              <Share2 className="w-7 h-7" />
            </button>
          </div>

          <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onMessage?.(user.uid || user.id || '', user.id || user._id)}
              disabled={isOwner}
              className="flex-[1.5] w-full h-16 bg-gray-950 text-white rounded-[1.25rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-30 shadow-2xl shadow-gray-300/50 group"
            >
              <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="tracking-[0.1em]">{isOwner ? 'GESTIONAR MI PERFIL' : 'INICIAR CHAT PRIVADO'}</span>
            </button>

            {user.whatsapp && (
              <a
                href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 w-full h-16 bg-[#25D366] text-white rounded-[1.25rem] font-black text-sm flex items-center justify-center gap-4 hover:bg-[#22c35e] hover:scale-[1.01] transition-all active:scale-[0.98] shadow-2xl shadow-green-200/50"
              >
                <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.52c1.54.914 3.382 1.403 5.26 1.404.006 0 0 0 0 0 5.464 0 9.903-4.439 9.906-9.903.001-2.648-1.03-5.136-2.903-7.01s-4.362-2.903-7.011-2.903c-5.463 0-9.903 4.44-9.906 9.903-.001 2.074.547 4.1 1.584 5.867l-1.035 3.784 3.882-1.018zm11.366-7.44c-.312-.156-1.848-.912-2.134-1.017-.286-.104-.494-.156-.701.156s-.805 1.017-.986 1.222-.364.234-.676.078c-.312-.156-1.316-.484-2.508-1.548-.928-.827-1.554-1.85-1.736-2.16-.182-.312-.019-.481.137-.636.141-.14.312-.364.468-.546s.208-.312.312-.52c.104-.208.052-.39-.026-.546s-.701-1.691-.962-2.313c-.254-.607-.513-.526-.701-.536-.182-.009-.39-.011-.597-.011s-.546.078-.831.39c-.286.312-1.091 1.067-1.091 2.6s1.117 3.016 1.274 3.224 2.193 3.352 5.313 4.697c.742.32 1.32.511 1.768.653.746.237 1.424.204 1.961.124.598-.089 1.848-.755 2.108-1.483.26-.728.26-1.353.182-1.483-.078-.13-.286-.234-.598-.39z" />
                  </svg>
                </div>
                <span className="tracking-[0.1em]">WHATSAPP</span>
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
