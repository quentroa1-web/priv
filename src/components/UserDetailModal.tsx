import { useState, useEffect } from 'react';
import {
  X, Shield, CheckCircle, Star, MapPin, Clock, Crown,
  Heart, MessageCircle, Camera, ChevronLeft, ChevronRight,
  Users, Home, Sparkles, BadgeCheck, Loader2, ArrowRight,
  Share2, Flag, ExternalLink, Calendar, Map
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
  const startTime = availabilityData?.hours?.start || user.horarioInicio || '10:00 AM';
  const endTime = availabilityData?.hours?.end || user.horarioFin || '10:00 PM';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-hidden">
      {/* Editorial Backdrop */}
      <div
        className="absolute inset-0 bg-white/95 backdrop-blur-sm transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Main Container - Minimal & Airy */}
      <div className="relative bg-white w-full max-w-7xl h-full md:h-[90vh] md:rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col lg:flex-row border border-gray-100 animate-in fade-in zoom-in duration-500">

        {/* Floating Close Button (Consistent) */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT: Clean Gallery Sidebar (Sticky on Desktop) */}
        <div className="relative w-full lg:w-[45%] h-[50vh] lg:h-full bg-[#f8f8f8] shrink-0 lg:border-r border-gray-50">
          <div className="h-full relative group">
            {gallery.length > 0 ? (
              <img
                src={gallery[activeImgIndex]}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-4">
                <Camera className="w-12 h-12 text-gray-300" />
                <span className="text-gray-400 font-medium uppercase tracking-[0.2em] text-[10px]">Sin imágenes</span>
              </div>
            )}

            {/* Subtle Controls */}
            {gallery.length > 1 && (
              <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3 z-10">
                <button onClick={prevImg} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-gray-100/50 hover:bg-white active:scale-90 transition-all">
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-gray-100/50 text-gray-900 text-[10px] font-black tracking-widest flex items-center shadow-sm">
                  {activeImgIndex + 1} / {gallery.length}
                </div>
                <button onClick={nextImg} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-gray-100/50 hover:bg-white active:scale-90 transition-all">
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>
              </div>
            )}

            <div className="absolute top-8 left-8 flex flex-col gap-2 pointer-events-none">
              {user.isVip && (
                <div className="bg-white/90 backdrop-blur-md text-amber-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em] shadow-sm border border-amber-100 w-max flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5" /> VIP GOLD
                </div>
              )}
              {user.isOnline && (
                <div className="bg-white/90 backdrop-blur-md text-emerald-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max border border-emerald-50 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> En línea
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Editorial Content (Vertical Flow) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">

          <div className="flex-1 overflow-y-auto px-8 md:px-12 py-12 space-y-16 custom-scrollbar">

            {/* 1. Header Section */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-5xl md:text-6xl font-black text-gray-950 tracking-tight leading-none">
                  {user.name}
                </h1>
                {user.verified && (
                  <BadgeCheck className="w-10 h-10 text-blue-500" fill="currentColor" color="white" />
                )}
                <span className="text-3xl font-light text-gray-400">/ {user.age}</span>
              </div>

              <div className="flex flex-wrap items-center gap-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">{displayLocation}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={cn("w-3.5 h-3.5", i <= (user.rating || 5) ? "text-amber-400 fill-current" : "text-gray-100")} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{reviews.length} Reseñas</span>
                </div>
              </div>
            </div>

            {/* 2. Abstract / Description */}
            <div className="max-w-2xl">
              <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-[1.3] italic border-l-4 border-rose-100 pl-8">
                "{user.description || user.bio || 'Sin descripción disponible.'}"
              </p>
            </div>

            {/* 3. Essential Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-10 border-y border-gray-50">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inversión</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-950">{price}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{priceLabel}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Atención</p>
                <span className="text-lg font-bold text-gray-800">{user.responseTime || '15 min'}</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Sitio</p>
                <span className="text-lg font-bold text-gray-800">{user.placeType?.[0] || 'Domicilio'}</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Público</p>
                <span className="text-lg font-bold text-gray-800">Hombres / Mujeres</span>
              </div>
            </div>

            {/* 4. Details Flow (Vertical Sections) */}
            <div className="space-y-20">

              {/* Services Section */}
              <section className="space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 border-b border-rose-50 pb-4 flex items-center gap-3">
                  <Sparkles className="w-4 h-4" /> Servicios & Especialidades
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {[...(user.services || []), ...(user.customServices || [])].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between group py-2 border-b border-gray-50/50">
                      <span className="text-gray-700 font-medium text-lg group-hover:text-gray-950 transition-colors uppercase tracking-tight">{s}</span>
                      <CheckCircle className="w-5 h-5 text-gray-100 group-hover:text-rose-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Location & Maps Section */}
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                    <MapPin className="w-4 h-4" /> Ubicación Detallada
                  </h3>
                  <button className="text-[10px] font-black text-gray-900 flex items-center gap-1.5 uppercase hover:underline transition-all">
                    Ver en el mapa
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Zona / Barrio</span>
                      <span className="text-xl font-bold text-gray-900">{neighborhood || 'Localidad Principal'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Punto de Referencia</span>
                      <p className="text-gray-500 font-medium italic leading-relaxed">
                        {specificZone || 'Referencia privada (disponible al contactar)'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-gray-100/50">
                    <Map className="w-8 h-8 text-gray-200" />
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Mapa interactivo no disponible en vista previa</p>
                  </div>
                </div>
              </section>

              {/* Availability (Minimalist) */}
              <section className="space-y-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-50 pb-4 flex items-center gap-3">
                  <Calendar className="w-4 h-4" /> Disponibilidad Semanal
                </h3>
                <div className="flex flex-wrap gap-4">
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
                          "w-14 h-14 rounded-xl flex flex-col items-center justify-center border transition-all",
                          isActive
                            ? "bg-gray-950 border-gray-950 text-white shadow-xl shadow-gray-200"
                            : "bg-white border-gray-100 text-gray-200"
                        )}
                      >
                        <span className="text-[9px] font-black uppercase">{day}</span>
                        {isActive && <div className="w-1 h-1 bg-rose-500 rounded-full mt-1" />}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-center justify-center gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Desde</span>
                    <span className="text-base font-black text-gray-900 uppercase tracking-tighter">{startTime}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-200" />
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Hasta</span>
                    <span className="text-base font-black text-gray-900 uppercase tracking-tighter">{endTime}</span>
                  </div>
                </div>
              </section>

              {/* Reviews Preview */}
              <section className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                    <Star className="w-4 h-4" /> Experiencias Verificadas
                  </h3>
                  <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">
                    Ver {reviews.length} todas
                  </button>
                </div>

                <div className="space-y-6">
                  {loadingReviews ? (
                    <div className="py-12 flex items-center justify-center gap-3 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Cargando...</span>
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.slice(0, 2).map((rev) => (
                      <div key={rev._id} className="group space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 font-black text-xs">
                              {rev.reviewer?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-950">{rev.reviewer?.name || 'Anónimo'}</p>
                              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 border border-gray-100 px-3 py-1 rounded-full">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-xs font-black text-gray-900">{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 font-medium italic border-l-2 border-gray-50 pl-6 text-base">{rev.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] font-medium text-gray-300 uppercase tracking-[0.2em] italic py-8 text-center">Sin reseñas históricas registradas.</p>
                  )}
                </div>
              </section>

            </div>

            {/* Bottom Spacing */}
            <div className="h-32" />
          </div>

          {/* INTEGRATED ACTION AREA (Clean Footer) */}
          <div className="p-8 md:p-10 bg-white border-t border-gray-50 flex items-center gap-6">
            <button
              onClick={onToggleFavorite}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all active:scale-90",
                isFavorite ? "bg-rose-50 text-rose-500 border-rose-100 shadow-xl shadow-rose-100/20" : "bg-white text-gray-300 border-gray-100 hover:text-rose-500"
              )}
            >
              <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
            </button>

            <button
              onClick={() => onMessage?.(user.uid || user.id || '', user.id || user._id)}
              disabled={isOwner}
              className="flex-1 h-16 bg-gray-950 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-30 shadow-2xl shadow-gray-300"
            >
              <MessageCircle className="w-6 h-6" />
              {isOwner ? 'PANEL DE CONTROL' : 'COTIZAR AHORA'}
            </button>

            {user.whatsapp && (
              <a
                href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all active:scale-95 border border-[#25D366]/20"
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
  );
}
