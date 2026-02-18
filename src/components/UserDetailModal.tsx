import { useState, useEffect } from 'react';
import {
  X, Shield, CheckCircle, Star, MapPin, Clock, Crown,
  Heart, MessageCircle, Camera, ChevronLeft, ChevronRight,
  Sparkles, BadgeCheck, Loader2,
  ArrowRight
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

  const price = user.pricing?.basePrice
    ? `$${user.pricing.basePrice.toLocaleString()}`
    : (user.price || '$0');

  const priceTypeMapping: Record<string, string> = {
    hora: 'por hora',
    sesion: 'por sesión',
    negociable: 'negociable'
  };

  const priceLabel = user.pricing?.priceType
    ? priceTypeMapping[user.pricing.priceType]
    : 'tarifa base';

  const displayLocation =
    typeof user.location === 'string'
      ? user.location
      : 'Colombia';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">

      {/* Dark Luxury Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-lg"
      />

      {/* Modal */}
      <div className="relative w-full max-w-7xl h-full md:h-[94vh] md:rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-[0_80px_180px_-30px_rgba(0,0,0,0.85)] bg-[#0f0f12] border border-white/10">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-11 h-11 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5 mx-auto" />
        </button>

        {/* LEFT - GALLERY */}
        <div className="relative w-full lg:w-[48%] h-[55vh] lg:h-full bg-black">

          {gallery.length > 0 ? (
            <img
              src={gallery[activeImgIndex]}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40">
              <Camera className="w-14 h-14" />
            </div>
          )}

          {/* Golden Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* VIP BADGE */}
          {user.isVip && (
            <div className="absolute top-6 left-6 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-2">
              <Crown className="w-4 h-4" />
              VIP ELITE
            </div>
          )}

          {/* Gallery Controls */}
          {gallery.length > 1 && (
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4">
              <button
                onClick={prevImg}
                className="w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-black"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="px-4 py-1 bg-black/60 text-white text-xs rounded-full border border-white/20">
                {activeImgIndex + 1} / {gallery.length}
              </div>

              <button
                onClick={nextImg}
                className="w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center border border-white/20 hover:bg-black"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col h-full text-white">

          <div className="flex-1 overflow-y-auto px-10 md:px-16 py-14 space-y-12">

            {/* HEADER */}
            <div className="space-y-6">

              <div className="flex items-end gap-4">
                <h1 className="text-5xl md:text-6xl font-light tracking-tight">
                  {user.name}
                </h1>

                {user.verified && (
                  <BadgeCheck className="w-7 h-7 text-amber-400" />
                )}

                <span className="text-2xl text-white/40">
                  {user.age}
                </span>
              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2 text-white/60">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{displayLocation}</span>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i <= (user.rating || 5)
                          ? "text-amber-400 fill-current"
                          : "text-white/20"
                      )}
                    />
                  ))}
                  <span className="text-sm text-white/50">
                    ({reviews.length})
                  </span>
                </div>

              </div>
            </div>

            {/* PRICE — PSYCHOLOGY FOCUS */}
            <div className="bg-gradient-to-br from-white/5 to-white/2 border border-amber-400/30 rounded-3xl p-8 backdrop-blur-md">

              <p className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
                Inversión Exclusiva
              </p>

              <div className="mt-3 flex items-end gap-3">
                <span className="text-5xl font-extralight text-white">
                  {price}
                </span>
                <span className="text-white/50 text-sm">
                  {priceLabel}
                </span>
              </div>

              <p className="text-xs text-white/40 mt-3">
                Disponibilidad limitada • Reserva anticipada recomendada
              </p>

            </div>

            {/* DESCRIPTION */}
            <div>
              <p className="text-lg leading-relaxed text-white/70 italic border-l-2 border-amber-400 pl-6">
                {user.description || user.bio || 'Perfil exclusivo.'}
              </p>
            </div>

          </div>

          {/* FOOTER CTA */}
          <div className="p-8 border-t border-white/10 bg-[#0c0c0f] flex items-center gap-6">

            <button
              onClick={onToggleFavorite}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
                isFavorite
                  ? "bg-amber-400 text-black border-amber-400 shadow-lg"
                  : "bg-white/5 text-white/50 border-white/10 hover:border-amber-400 hover:text-amber-400"
              )}
            >
              <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
            </button>

            <button
              onClick={() =>
                onMessage?.(user.uid || user.id || '', user.id || user._id)
              }
              disabled={isOwner}
              className="flex-1 h-14 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-black rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_-10px_rgba(251,191,36,0.6)] hover:scale-[1.02] transition disabled:opacity-40"
            >
              <MessageCircle className="w-5 h-5" />
              {isOwner ? 'GESTIONAR PERFIL' : 'RESERVAR EXPERIENCIA'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
