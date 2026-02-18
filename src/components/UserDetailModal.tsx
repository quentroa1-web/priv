import { useState, useEffect } from 'react';
import {
  X, CheckCircle, Star, MapPin, Crown,
  Heart, MessageCircle, Camera,
  ChevronLeft, ChevronRight,
  BadgeCheck, Loader2
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center">

      {/* Luxury backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
      />

      <div className="relative w-full max-w-7xl h-full md:h-[95vh] md:rounded-[32px] overflow-hidden flex flex-col lg:flex-row bg-[#0b0b0e] border border-white/5 shadow-[0_100px_200px_-40px_rgba(0,0,0,0.9)]">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4 mx-auto" />
        </button>

        {/* LEFT — CINEMATIC GALLERY */}
        <div className="relative w-full lg:w-[50%] h-[55vh] lg:h-full bg-black overflow-hidden">

          {gallery.length > 0 ? (
            <img
              src={gallery[activeImgIndex]}
              alt={user.name}
              className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">
              <Camera className="w-16 h-16" />
            </div>
          )}

          {/* Deep gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          {/* VIP badge */}
          {user.isVip && (
            <div className="absolute top-6 left-6 bg-[#d6b25e] text-black px-4 py-1.5 rounded-full text-xs tracking-widest font-semibold shadow-xl flex items-center gap-2">
              <Crown className="w-4 h-4" />
              ELITE
            </div>
          )}

          {/* Gallery controls */}
          {gallery.length > 1 && (
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4">
              <button
                onClick={prevImg}
                className="w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-4 py-1 text-xs bg-black/60 text-white border border-white/20 rounded-full">
                {activeImgIndex + 1} / {gallery.length}
              </div>

              <button
                onClick={nextImg}
                className="w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — EDITORIAL INFO */}
        <div className="flex-1 flex flex-col text-white">

          <div className="flex-1 overflow-y-auto px-10 md:px-16 py-14 space-y-12">

            {/* HEADER */}
            <div className="space-y-5">

              <div className="flex items-end gap-4">
                <h1 className="text-6xl font-extralight tracking-tight">
                  {user.name}
                </h1>

                {user.verified && (
                  <BadgeCheck className="w-6 h-6 text-[#d6b25e]" />
                )}

                <span className="text-xl text-white/40">
                  {user.age}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">

                <div className="flex items-center gap-2 text-white/60">
                  <MapPin className="w-4 h-4 text-[#d6b25e]" />
                  {displayLocation}
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i <= (user.rating || 5)
                          ? "text-[#d6b25e] fill-current"
                          : "text-white/20"
                      )}
                    />
                  ))}
                  <span className="ml-2 text-white/40">
                    {reviews.length}
                  </span>
                </div>

              </div>
            </div>

            {/* PRICE BLOCK */}
            <div className="relative p-10 rounded-3xl border border-[#d6b25e]/30 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl">

              <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />

              <p className="text-xs uppercase tracking-[0.4em] text-[#d6b25e] font-medium">
                Experiencia Privada
              </p>

              <div className="mt-4 flex items-end gap-4">
                <span className="text-6xl font-thin text-white">
                  {price}
                </span>
                <span className="text-white/50 text-sm mb-2">
                  {priceLabel}
                </span>
              </div>

              <p className="mt-4 text-xs text-white/40">
                Agenda limitada • Confirmación prioritaria
              </p>

            </div>

            {/* DESCRIPTION */}
            <div>
              <p className="text-lg leading-relaxed text-white/70 italic border-l border-[#d6b25e] pl-6">
                {user.description || user.bio || 'Perfil exclusivo de alto nivel.'}
              </p>
            </div>

          </div>

          {/* FOOTER CTA */}
          <div className="p-8 border-t border-white/10 bg-[#0a0a0c] flex items-center gap-6">

            <button
              onClick={onToggleFavorite}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
                isFavorite
                  ? "bg-[#d6b25e] text-black border-[#d6b25e]"
                  : "bg-white/5 text-white/40 border-white/10 hover:border-[#d6b25e] hover:text-[#d6b25e]"
              )}
            >
              <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
            </button>

            <button
              onClick={() =>
                onMessage?.(user.uid || user.id || '', user.id || user._id)
              }
              disabled={isOwner}
              className="flex-1 h-14 rounded-2xl bg-[#d6b25e] text-black font-medium text-lg flex items-center justify-center gap-3 shadow-[0_20px_60px_-10px_rgba(214,178,94,0.5)] hover:scale-[1.015] transition-all disabled:opacity-40"
            >
              <MessageCircle className="w-5 h-5" />
              {isOwner ? 'Administrar Perfil' : 'Solicitar Reserva'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
