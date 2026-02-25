import { useState } from 'react';
import {
  X, Star, MapPin,
  Heart, MessageCircle, Camera,
  ChevronLeft, ChevronRight,
  BadgeCheck, Clock, Languages, Info, Sparkles
} from 'lucide-react';
import { User } from '../types';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import { SEO } from './SEO';

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
  const priceLabel = priceTypeMapping[pricing.priceType || 'hora'] || 'tarifa base';

  const availability = user.availability || {};
  const startTime = (typeof availability === 'object' && !Array.isArray(availability)) ? availability.hours?.start : (user.horarioInicio || '10:00 AM');
  const endTime = (typeof availability === 'object' && !Array.isArray(availability)) ? availability.hours?.end : (user.horarioFin || '10:00 PM');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 lg:p-6 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      <SEO
        title={`${user.displayName || user.name} - Escort en ${city || 'Colombia'} | SafeConnect`}
        description={user.bio || user.description || `Perfil verificado de ${user.name} en SafeConnect. Reserva ahora y disfruta de la mejor compañía.`}
        type="profile"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": user.displayName || user.name,
          "description": user.bio || user.description,
          "provider": {
            "@type": "Person",
            "name": user.displayName || user.name,
            "gender": user.gender,
            "image": user.avatar,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": city || 'Colombia'
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": user.rating || 5,
            "reviewCount": user.reviewCount || 1,
            "bestRating": "5",
            "worstRating": "1"
          },
          "offers": {
            "@type": "Offer",
            "price": price?.replace(/[^0-9]/g, '') || "0",
            "priceCurrency": "COP",
            "availability": "https://schema.org/InStock"
          }
        }}
      />
      {/* Editorial Backdrop */}
      <div
        className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="relative bg-[#fcfcfd] w-full max-w-7xl h-full md:h-[92vh] md:rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col border border-white animate-in zoom-in slide-in-from-bottom-4 duration-500">

        {/* HEADER */}
        <div className="px-6 md:px-10 py-5 bg-white border-b border-gray-100 shrink-0 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                  {user.name}
                </h1>
                {user.verified && <BadgeCheck className="w-5 h-5 text-blue-500" fill="currentColor" color="white" />}
              </div>
              <div className="flex items-center gap-2.5 mt-0.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100/50">
                  <div className={cn("w-1.5 h-1.5 rounded-full", user.isOnline ? "bg-emerald-500" : "bg-gray-300")} />
                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">{user.isOnline ? 'En línea' : 'Desconectado'}</span>
                </div>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  {locationData?.department ? `${locationData.department} • ` : ''}{city}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end border-r border-gray-100 pr-5">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">VALORACIÓN</span>
                <div className="flex items-center gap-1">
                  <span className="text-base font-black text-gray-900">{user.rating || 5.0}</span>
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 relative">
          <div className="grid grid-cols-12 gap-6 lg:gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* LEFT: GALLERY & BIO */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl relative h-[450px] md:h-[600px] border border-white group">
                {gallery.length > 0 ? (
                  <img
                    src={gallery[activeImgIndex]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    alt={user.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <Camera className="w-12 h-12 text-gray-200" />
                  </div>
                )}

                {/* Strengthened Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

                {/* ANCHORED PRICE TAG */}
                <div className="absolute top-6 right-6 z-30">
                  <div className="px-5 py-3 bg-gray-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-0.5">
                    <span className="text-xl font-black text-white tracking-tighter">{price || '$0'}</span>
                    <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none pb-0.5">{priceLabel}</span>
                  </div>
                </div>

                {/* Floating Info */}
                <div className="absolute bottom-8 left-8 right-8 z-20 flex items-end justify-between gap-6">
                  <div className="flex-1 space-y-2.5">
                    <h3 className="text-white text-3xl md:text-4xl font-black tracking-tight drop-shadow-lg">{user.displayName || user.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(user.placeType || ['Domicilio']).map(p => (
                        <span key={p} className="px-3.5 py-1.5 bg-gray-900/60 backdrop-blur-md rounded-xl text-white text-[9px] font-black uppercase tracking-wider border border-white/10">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {gallery.length > 1 && (
                    <div className="hidden md:flex items-center gap-1.5 p-1.5 bg-black/30 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl">
                      {gallery.slice(0, 4).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImgIndex(idx)}
                          className={cn(
                            "w-11 h-11 rounded-xl overflow-hidden border-2 transition-all active:scale-90",
                            activeImgIndex === idx ? "border-white scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={img} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nav Arrows - Only if > 1 img */}
                {gallery.length > 1 && (
                  <>
                    <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-black/40">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-black/40">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* BIO / SOBRE MÍ */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2.5 opacity-80">
                    <Languages className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">SOBRE MÍ</h4>
                  </div>
                  <div className="border-l-2 border-indigo-100 pl-6">
                    <p className="text-sm md:text-base font-medium text-gray-600 leading-relaxed max-w-3xl">
                      {user.description || user.bio || 'Disponible para una experiencia inolvidable. Contáctame para más información.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: BENTO STATS */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 lg:gap-8">

              {/* Timing & Location */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-white shadow-sm">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div className="text-center">
                      <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-0.5">HORARIO</span>
                      <span className="text-xs font-bold text-gray-900">{startTime} - {endTime}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-indigo-50/50 rounded-2xl border border-white shadow-sm">
                    <MapPin className="w-5 h-5 text-indigo-700" />
                    <div className="text-center">
                      <span className="block text-[8px] font-black text-indigo-700 uppercase tracking-widest mb-0.5">UBICACIÓN</span>
                      <span className="text-xs font-bold text-gray-900 uppercase">{city}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">DISPONIBILIDAD</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </div>
                  <div className="flex flex-wrap justify-start gap-1.5">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                      <div key={i} className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border",
                        i < 5
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100/50"
                          : "bg-gray-50 border-gray-100 text-gray-400"
                      )}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Services & Personal Details */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 opacity-80">
                    <Sparkles className="w-5 h-5 text-rose-600" />
                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">SERVICIOS</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...(user.services || []), ...(user.customServices || [])].slice(0, 10).map((s, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-50 text-[9px] font-bold text-gray-800 uppercase tracking-wider rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex items-center gap-2.5 opacity-80">
                    <Info className="w-5 h-5 text-indigo-500" />
                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">INFO EXTRA</h4>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50">
                    <p className="text-xs font-semibold text-indigo-900/80 italic leading-relaxed">
                      {[locationData?.department, locationData?.city, neighborhood, specificZone].filter(Boolean).join(' • ') || 'El punto exacto se compartirá al confirmar la reserva.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="h-32" />
        </div>

        {/* FLOATING ACTIONS */}
        <div className="absolute bottom-8 right-8 z-[70] flex flex-col items-end gap-5 group/actions shadow-2xl">
          {/* Favorite Bubble */}
          <button
            onClick={onToggleFavorite}
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 relative border border-white backdrop-blur-md",
              isFavorite
                ? "bg-rose-500 text-white border-rose-600 shadow-rose-200"
                : "bg-white/90 text-gray-500 hover:text-rose-600"
            )}
          >
            <Heart className={cn("w-5 h-5 md:w-6 md:h-6 transition-transform", isFavorite && "fill-current")} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-rose-500 text-[8px] font-black text-rose-500">
              {isFavorite ? '!' : '+'}
            </span>
          </button>

          {/* Contacts Stack */}
          <div className="flex flex-col gap-3 p-2.5 bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white/40 shadow-2xl transform transition-all group-hover/actions:-translate-y-1">
            {user.whatsapp && (
              <a
                href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white rounded-[1.25rem] flex items-center justify-center hover:scale-105 transition-all shadow-md group/wa"
              >
                <svg className="w-6 h-6 md:w-8 md:h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.52c1.54.914 3.382 1.403 5.26 1.404.006 0 0 0 0 0 5.464 0 9.903-4.439 9.906-9.903.001-2.648-1.03-5.136-2.903-7.01s-4.362-2.903-7.011-2.903c-5.463 0-9.903 4.44-9.906 9.903-.001 2.074.547 4.1 1.584 5.867l-1.035 3.784 3.882-1.018zm11.366-7.44c-.312-.156-1.848-.912-2.134-1.017-.286-.104-.494-.156-.701.156s-.805 1.017-.986 1.222-.364.234-.676.078c-.312-.156-1.316-.484-2.508-1.548-.928-.827-1.554-1.85-1.736-2.16-.182-.312-.019-.481.137-.636.141-.14.312-.364.468-.546s.208-.312.312-.52c.104-.208.052-.39-.026-.546s-.701-1.691-.962-2.313c-.254-.607-.513-.526-.701-.536-.182-.009-.39-.011-.597-.011s-.546.078-.831.39c-.286.312-1.091 1.067-1.091 2.6s1.117 3.016 1.274 3.224 2.193 3.352 5.313 4.697c.742.32 1.32.511 1.768.653.746.237 1.424.204 1.961.124.598-.089 1.848-.755 2.108-1.483.26-.728.26-1.353.182-1.483-.078-.13-.286-.234-.598-.39z" />
                </svg>
              </a>
            )}
            <button
              onClick={() => onMessage?.(user.uid || user.id || '', user.id || user._id)}
              disabled={isOwner}
              className="w-12 h-12 md:w-14 md:h-14 bg-gray-950 text-white rounded-[1.25rem] flex items-center justify-center hover:scale-105 transition-all shadow-md active:rotate-12 disabled:opacity-30 group/msg"
            >
              <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
