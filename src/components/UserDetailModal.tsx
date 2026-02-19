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
  const startTime = (typeof availability === 'object' && !Array.isArray(availability)) ? availability.hours?.start : (user.horarioInicio || '10:00 AM');
  const endTime = (typeof availability === 'object' && !Array.isArray(availability)) ? availability.hours?.end : (user.horarioFin || '10:00 PM');

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 lg:p-6 overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Editorial Backdrop */}
      <div
        className="absolute inset-0 bg-gray-50/90 backdrop-blur-md transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="relative bg-[#f8f9fa] w-full max-w-7xl h-full md:h-[95vh] md:rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-white animate-in zoom-in slide-in-from-bottom-5 duration-700">

        {/* HEADER */}
        <div className="px-6 md:px-12 py-5 bg-white border-b border-gray-100 shrink-0 z-20">
          <div className="flex items-center justify-between gap-4">
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

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end border-r border-gray-100 pr-8">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">VALORACIÓN</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-gray-900">{user.rating || 5.0}</span>
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95 border border-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
          <div className="grid grid-cols-12 gap-8 lg:gap-10">

            {/* LEFT: GALLERY & BIO */}
            <div className="col-span-12 lg:col-span-8 space-y-10">
              <div className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl relative h-[500px] md:h-[700px] border border-white group">
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

                {/* Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* ANCHORED PRICE TAG */}
                <div className="absolute top-10 right-10 z-30">
                  <div className="px-8 py-4 bg-gray-950/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center gap-1 group-hover:bg-black transition-colors">
                    <span className="text-3xl font-black text-white tracking-tighter leading-none">{price}</span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{priceLabel}</span>
                  </div>
                </div>

                {/* Floating Info & Thumbnails */}
                <div className="absolute bottom-10 left-10 right-10 z-20 flex items-end justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <h3 className="text-white text-5xl font-black tracking-tight drop-shadow-2xl">{user.displayName || user.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(user.placeType || ['Domicilio']).map(p => (
                        <span key={p} className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {gallery.length > 1 && (
                    <div className="hidden md:flex items-center gap-2 p-2.5 bg-white/10 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl">
                      {gallery.slice(0, 4).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImgIndex(idx)}
                          className={cn(
                            "w-14 h-14 rounded-3xl overflow-hidden border-2 transition-all active:scale-90",
                            activeImgIndex === idx ? "border-white scale-110 shadow-xl" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={img} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nav Arrows */}
                {gallery.length > 1 && (
                  <>
                    <button onClick={prevImg} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-white/20">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextImg} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-white/20">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* BIO */}
              <div className="bg-white rounded-[3rem] p-12 lg:p-16 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-10">
                    <Languages className="w-6 h-6 text-indigo-500" />
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">MI HISTORIA</h4>
                  </div>
                  <p className="text-3xl font-black text-gray-800 leading-[1.3] italic border-l-8 border-indigo-500 pl-10 max-w-4xl">
                    "{user.description || user.bio || 'Una experiencia inolvidable te espera. Contacta ahora para más detalles.'}"
                  </p>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                  <BadgeCheck className="w-64 h-64" />
                </div>
              </div>
            </div>

            {/* RIGHT: BENTO STATS */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8 lg:gap-10">

              {/* Quick Info Bento */}
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col gap-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-[2.5rem] border border-white shadow-inner">
                    <Clock className="w-6 h-6 text-amber-500" />
                    <div className="text-center">
                      <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">HORARIO</span>
                      <span className="text-sm font-black text-gray-900">{startTime} - {endTime}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3 p-6 bg-indigo-50/50 rounded-[2.5rem] border border-white shadow-inner">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                    <div className="text-center">
                      <span className="block text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">CITY</span>
                      <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">{city}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">AVAILABILITY</span>
                    <span className="text-[9px] font-black text-indigo-500 uppercase">WEEKLY</span>
                  </div>
                  <div className="flex justify-between gap-1.5">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                      <div key={i} className={cn(
                        "flex-1 aspect-square rounded-2xl flex items-center justify-center text-xs font-black transition-all border",
                        i < 5
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                          : "bg-gray-50 border-gray-100 text-gray-300"
                      )}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Services & Personal Bento */}
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-rose-500" />
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">SERVICIOS</h4>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {[...(user.services || []), ...(user.customServices || [])].slice(0, 12).map((s, idx) => (
                      <span key={idx} className="px-4 py-2 bg-gray-50 text-[10px] font-black text-gray-700 uppercase tracking-wide rounded-2xl border border-gray-100 hover:bg-white hover:border-indigo-100 hover:text-indigo-600 transition-all cursor-default">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50 space-y-6">
                  <div className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-indigo-400" />
                    <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">DETAILS</h4>
                  </div>
                  <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100/50">
                    <p className="text-sm font-bold text-indigo-900/60 italic leading-relaxed">
                      {specificZone || neighborhood || 'The exact meeting point will be provided once the appointment is confirmed.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="col-span-12 py-16 border-t border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 px-6">
                <div>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter">CLIENT REVIEWS</h3>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">REAL DISPATCHED TESTIMONIES</p>
                </div>
                <div className="bg-white px-10 py-5 rounded-[2.5rem] border border-gray-100 shadow-xl flex items-center gap-5">
                  <span className="text-4xl font-black text-gray-900 tabular-nums">{user.rating || 5.0}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5 text-amber-400 fill-current" />)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
                {reviews.length > 0 ? (
                  reviews.slice(0, 3).map((rev) => (
                    <div key={rev._id} className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col gap-8 relative overflow-hidden group">
                      <div className="flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-950 flex items-center justify-center text-white text-sm font-black">
                            {rev.reviewer?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-base font-black text-gray-900 uppercase tracking-tight">{rev.reviewer?.name || 'V.I.P Client'}</span>
                        </div>
                        <div className="px-4 py-2 bg-amber-50 rounded-2xl text-amber-600 text-sm font-black border border-amber-100 flex items-center gap-2">
                          <Star className="w-4 h-4 fill-current" /> {rev.rating}
                        </div>
                      </div>
                      <p className="text-gray-600 text-lg font-medium italic leading-relaxed pl-8 border-l-4 border-indigo-100 group-hover:border-indigo-500 transition-colors">"{rev.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-32 bg-white rounded-[3.5rem] border-4 border-dashed border-gray-50 flex flex-col items-center justify-center gap-6 text-gray-200">
                    <Star className="w-20 h-20" />
                    <p className="text-sm font-black uppercase tracking-[0.4em]">Become the first to review</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="h-40" />
        </div>

        {/* FLOATING ACTIONS - BOTTOM RIGHT */}
        <div className="absolute bottom-12 right-12 z-[70] flex flex-col items-end gap-6 group/actions">
          {/* Top Favorite Bubble */}
          <button
            onClick={onToggleFavorite}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-3xl transition-all active:scale-90 relative",
              isFavorite
                ? "bg-rose-500 text-white shadow-rose-200"
                : "bg-white/80 text-gray-400 border border-white hover:text-rose-500 hover:bg-white"
            )}
          >
            <Heart className={cn("w-9 h-9 transition-transform hover:scale-125", isFavorite && "fill-current")} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-rose-500 text-[10px] font-black text-rose-500">
              {isFavorite ? '!' : '+'}
            </span>
          </button>

          {/* Contact Actions Stack */}
          <div className="flex flex-col gap-4 p-3 bg-white/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 shadow-2xl transform transition-transform group-hover/actions:translate-y-[-5px]">
            {user.whatsapp && (
              <a
                href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-20 h-20 bg-[#25D366] text-white rounded-[2.5rem] flex items-center justify-center hover:scale-110 transition-all shadow-xl hover:-rotate-12 group/wa"
              >
                <svg className="w-11 h-11 fill-current group-hover/wa:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.52c1.54.914 3.382 1.403 5.26 1.404.006 0 0 0 0 0 5.464 0 9.903-4.439 9.906-9.903.001-2.648-1.03-5.136-2.903-7.01s-4.362-2.903-7.011-2.903c-5.463 0-9.903 4.44-9.906 9.903-.001 2.074.547 4.1 1.584 5.867l-1.035 3.784 3.882-1.018zm11.366-7.44c-.312-.156-1.848-.912-2.134-1.017-.286-.104-.494-.156-.701.156s-.805 1.017-.986 1.222-.364.234-.676.078c-.312-.156-1.316-.484-2.508-1.548-.928-.827-1.554-1.85-1.736-2.16-.182-.312-.019-.481.137-.636.141-.14.312-.364.468-.546s.208-.312.312-.52c.104-.208.052-.39-.026-.546s-.701-1.691-.962-2.313c-.254-.607-.513-.526-.701-.536-.182-.009-.39-.011-.597-.011s-.546.078-.831.39c-.286.312-1.091 1.067-1.091 2.6s1.117 3.016 1.274 3.224 2.193 3.352 5.313 4.697c.742.32 1.32.511 1.768.653.746.237 1.424.204 1.961.124.598-.089 1.848-.755 2.108-1.483.26-.728.26-1.353.182-1.483-.078-.13-.286-.234-.598-.39z" />
                </svg>
              </a>
            )}
            <button
              onClick={() => onMessage?.(user.uid || user.id || '', user.id || user._id)}
              disabled={isOwner}
              className="w-20 h-20 bg-gray-950 text-white rounded-[2.5rem] flex items-center justify-center hover:scale-110 transition-all shadow-xl hover:rotate-12 disabled:opacity-30 group/msg"
            >
              <MessageCircle className="w-11 h-11 transition-transform group-hover/msg:rotate-[-12deg]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
