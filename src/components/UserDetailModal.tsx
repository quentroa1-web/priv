import { useState, useEffect } from 'react';
import {
  X, CheckCircle, Star, MapPin, Crown,
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

        {/* TOP STAT BAR (Norway Inspired Header) */}
        <div className="px-6 md:px-12 py-8 bg-white border-b border-gray-100 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">ANUNCIO VERIFICADO</p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                {user.name}
                {user.verified && <BadgeCheck className="w-8 h-8 text-blue-500" fill="currentColor" color="white" />}
              </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">CUIDAD</span>
                <span className="text-base font-bold text-gray-800 tracking-tight whitespace-nowrap">{city}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">VALORACIÓN</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-gray-800">{user.rating || 5.0}</span>
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ESTADO</span>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full", user.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300")} />
                  <span className="text-base font-bold text-gray-800">{user.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">TIPO</span>
                <span className="text-base font-bold text-gray-800 tracking-tight">{user.gender || 'Modelo'}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 lg:static w-10 h-10 bg-gray-50/80 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT GRID (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-12 gap-6 lg:auto-rows-min">

            {/* HERO GALLERY TILE (Large Left) */}
            <div className="col-span-12 lg:col-span-8 bg-white rounded-[2rem] overflow-hidden border border-white shadow-sm relative group h-[400px] md:h-[500px]">
              {gallery.length > 0 ? (
                <img
                  src={gallery[activeImgIndex]}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                  alt={user.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Camera className="w-16 h-16 text-gray-200" />
                </div>
              )}

              {/* Title Overlay (Norway Inspired) */}
              <div className="absolute top-8 left-8 z-20">
                <h3 className="text-white text-3xl font-black tracking-tight drop-shadow-lg">
                  {user.displayName || user.name} en {neighborhood || city}
                </h3>
              </div>

              {/* Floating Thumbnails (Norway Inspired) */}
              {gallery.length > 1 && (
                <div className="absolute top-8 right-8 z-20 flex items-center gap-2 p-2 bg-black/10 backdrop-blur-md rounded-2xl border border-white/10">
                  {gallery.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={cn(
                        "w-10 h-10 rounded-xl overflow-hidden border-2 transition-all active:scale-90",
                        activeImgIndex === idx ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {gallery.length > 5 && (
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-[10px] font-black">
                      +{gallery.length - 5}
                    </div>
                  )}
                </div>
              )}

              {/* Gallery Nav Buttons */}
              {gallery.length > 1 && (
                <div className="absolute inset-x-0 bottom-8 flex justify-center gap-4 z-20">
                  <button onClick={prevImg} className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white hover:bg-white transition-all active:scale-90">
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <button onClick={nextImg} className="w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white hover:bg-white transition-all active:scale-90">
                    <ChevronRight className="w-6 h-6 text-gray-900" />
                  </button>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
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

            {/* PRICING TILE (Middle Left) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-gradient-to-br from-[#1a1a1a] to-black rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">INVERSIÓN EXCLUSIVA</p>
                <div className="flex flex-col">
                  <span className="text-5xl font-black tracking-tighter text-white">{price}</span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">{priceLabel}</span>
                </div>
              </div>

              <div className="mt-8 relative z-10 space-y-4 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black text-white/40 uppercase">RESPUESTA</span>
                  </div>
                  <span className="text-xs font-black tracking-widest">{user.responseTime || '15 min'}</span>
                </div>
              </div>

              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] -mr-16 -mt-16" />
            </div>

            {/* AVAILABILITY TILE (Middle Right) */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-[2rem] p-8 border border-white shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Disponibilidad</h4>
                </div>
                <div className="px-4 py-2 bg-amber-50 rounded-xl text-amber-600 font-black text-[10px] tracking-widest border border-amber-100">
                  {startTime} — {endTime}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => {
                  const dayLower = day.toLowerCase();
                  const isActive = activeDays.some(d =>
                    d.toLowerCase().includes(dayLower) ||
                    (day === 'Mié' && d.toLowerCase().includes('miercoles')) ||
                    (day === 'Sáb' && d.toLowerCase().includes('sabado'))
                  );
                  return (
                    <div key={day} className="flex flex-col items-center gap-3">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{day}</span>
                      <div className={cn(
                        "w-full aspect-square rounded-xl border-2 transition-all duration-500 flex items-center justify-center",
                        isActive ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-gray-50 border-gray-100 text-transparent"
                      )}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] font-medium text-gray-400 italic text-center uppercase tracking-widest">
                Agenda tu cita con anticipación vía chat.
              </p>
            </div>

            {/* SERVICES TILE (Full Width) */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-[2rem] p-8 border border-white shadow-sm flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-rose-600" />
                </div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Servicios</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {[...(user.services || []), ...(user.customServices || [])].map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl transition-all duration-300 group">
                    <div className="w-2 h-2 rounded-full bg-rose-300 group-hover:bg-rose-500 transition-colors" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LANGUAGES & ATTENTION TILE */}
            <div className="col-span-12 md:col-span-4 bg-white rounded-[2rem] p-8 border border-white shadow-sm flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Detalles</h4>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 pb-2">IDIOMAS</p>
                  <div className="flex flex-wrap gap-2">
                    {(user.languages?.length ? user.languages : ['Español']).map(l => (
                      <span key={l} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 pb-2">RECOMENDADO PARA</p>
                  <div className="flex flex-wrap gap-2">
                    {(user.attendsTo?.length ? user.attendsTo : ['Hombres']).map(a => (
                      <span key={a} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BIO TILE */}
            <div className="col-span-12 md:col-span-8 lg:col-span-8 bg-indigo-50/50 rounded-[2rem] p-8 md:p-10 border border-indigo-100 shadow-sm relative overflow-hidden group">
              <div className="relative z-10 space-y-6 opacity-0 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300 fill-mode-forwards">
                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Sobre el Anuncio</h4>
                </div>
                <p className="text-xl md:text-2xl font-bold text-indigo-900/80 leading-snug italic">
                  "{user.description || user.bio || 'Sin descripción detallada disponible para este anuncio.'}"
                </p>
              </div>
              {/* Aesthetic Circle */}
              <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px]" />
            </div>

            {/* REVIEWS SECTION */}
            <div className="col-span-12 py-12 space-y-10">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Experiencias Verificadas</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400">{reviews.length} testimonios</span>
                  <div className="w-px h-4 bg-gray-200 mx-2" />
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Ver todas</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loadingReviews ? (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cargando experiencias...</span>
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.slice(0, 2).map((rev) => (
                    <div key={rev._id} className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-black border border-gray-100 uppercase">
                            {rev.reviewer?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-base font-black text-gray-900">{rev.reviewer?.name || 'Cliente'}</span>
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          <span className="text-sm font-black text-amber-600">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 font-medium italic leading-relaxed pl-6 border-l-2 border-indigo-50">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 grayscale opacity-40">
                    <Star className="w-12 h-12" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sin reseñas registradas aún</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Spacing */}
          <div className="h-24 md:h-32" />
        </div>

        {/* INTEGRATED ACTION BAR (Clean Bottom) */}
        <div className="px-8 md:px-12 py-8 bg-white/80 backdrop-blur-3xl border-t border-gray-100 shrink-0 z-50 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onToggleFavorite}
              className={cn(
                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-all active:scale-90",
                isFavorite ? "bg-rose-50 text-rose-500 border-rose-100 shadow-xl shadow-rose-100/20" : "bg-gray-50 text-gray-300 border-gray-100 hover:text-rose-500 hover:bg-white"
              )}
            >
              <Heart className={cn("w-7 h-7", isFavorite && "fill-current")} />
            </button>
            <button className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center text-gray-300 border border-gray-100 hover:text-gray-900 hover:bg-white transition-all">
              <Share2 className="w-7 h-7" />
            </button>
          </div>

          <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => onMessage?.(user.uid || user.id || '', user.id || user._id)}
              disabled={isOwner}
              className="flex-1 w-full h-16 bg-gray-950 text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-30 shadow-2xl shadow-gray-400 group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              {isOwner ? 'GESTIONAR MI PERFIL' : 'INICIAR CHAT PRIVADO'}
            </button>

            {user.whatsapp && (
              <a
                href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 w-full h-16 bg-[#25D366] text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-4 hover:bg-[#22c35e] transition-all active:scale-[0.98] shadow-2xl shadow-green-200"
              >
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.52c1.54.914 3.382 1.403 5.26 1.404.006 0 0 0 0 0 5.464 0 9.903-4.439 9.906-9.903.001-2.648-1.03-5.136-2.903-7.01s-4.362-2.903-7.011-2.903c-5.463 0-9.903 4.44-9.906 9.903-.001 2.074.547 4.1 1.584 5.867l-1.035 3.784 3.882-1.018zm11.366-7.44c-.312-.156-1.848-.912-2.134-1.017-.286-.104-.494-.156-.701.156s-.805 1.017-.986 1.222-.364.234-.676.078c-.312-.156-1.316-.484-2.508-1.548-.928-.827-1.554-1.85-1.736-2.16-.182-.312-.019-.481.137-.636.141-.14.312-.364.468-.546s.208-.312.312-.52c.104-.208.052-.39-.026-.546s-.701-1.691-.962-2.313c-.254-.607-.513-.526-.701-.536-.182-.009-.39-.011-.597-.011s-.546.078-.831.39c-.286.312-1.091 1.067-1.091 2.6s1.117 3.016 1.274 3.224 2.193 3.352 5.313 4.697c.742.32 1.32.511 1.768.653.746.237 1.424.204 1.961.124.598-.089 1.848-.755 2.108-1.483.26-.728.26-1.353.182-1.483-.078-.13-.286-.234-.598-.39z" />
                </svg>
                WHATSAPP
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
