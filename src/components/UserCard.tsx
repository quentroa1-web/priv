import React from 'react';
import { MapPin, Star, Clock, Heart, MessageCircle, Crown, BadgeCheck, Rocket } from 'lucide-react';
import { User } from '../types';
import { cn } from '../utils/cn';
import { hapticFeedback } from '../utils/haptics';
import { formatPrice } from '../utils/formatters';

interface UserCardProps {
  user: User;
  onClick: () => void;
  variant?: 'compact' | 'standard';
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const UserCard = React.memo(function UserCard({ user, onClick, variant = 'standard', isFavorite, onToggleFavorite }: UserCardProps) {
  const isVip = user.isVip;

  const handleMouseEnter = () => {
    // Speculative preloading of the main image
    const mainImg = (user.gallery && user.gallery.length > 0) ? user.gallery[0] : user.avatar;
    if (mainImg) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = mainImg;
      document.head.appendChild(link);
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer border",
        (user.premiumPlan === 'diamond' || isVip)
          ? "border-transparent animate-tornasol premium-glow-cyan hover:scale-[1.02] ring-1 ring-cyan-400/30"
          : user.premiumPlan === 'gold'
            ? "border-amber-200 premium-glow-gold hover:scale-[1.01] ring-1 ring-amber-400/20"
            : user.isBoosted
              ? "border-rose-200 shadow-[0_4px_20px_rgba(225,29,72,0.1)] hover:shadow-[0_8px_30px_rgba(225,29,72,0.2)]"
              : "border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-200"
      )}
    >
      {(user.premiumPlan === 'diamond' || isVip) && (
        <>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-300 via-blue-500 to-pink-400 z-10 animate-gradient-x" />
          <div className="holo-glint-overlay" />
        </>
      )}
      {(user.premiumPlan === 'gold' && !isVip) && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 z-10" />
      )}

      {/* Image Container */}
      <div className={cn(
        "relative overflow-hidden bg-gray-100",
        variant === 'compact' ? "aspect-square" : "aspect-[3/4]"
      )}>
        <img
          src={(user.gallery && user.gallery.length > 0) ? user.gallery[0] : user.avatar}
          alt={user.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Improved Gradients for visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 opacity-70" />

        <div className="absolute top-2 left-2 pointer-events-none flex flex-col gap-1.5">
          {user.online && (
            <div className="flex items-center gap-1.5 bg-green-500/80 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_5px_white]"></span>
              Live
            </div>
          )}
          {user.isBoosted && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-pink-600 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-lg border border-white/20">
              <Rocket className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              TOP
            </div>
          )}
        </div>

        {/* Top Right: Plan & Favorite */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
          {(user.premiumPlan === 'diamond' || isVip) ? (
            <div className="bg-gradient-to-r from-cyan-400 to-blue-600 text-white p-1 rounded-lg shadow-lg ring-1 ring-white/20" title="Diamond Member">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          ) : user.premiumPlan === 'gold' ? (
            <div className="bg-gradient-to-r from-amber-400 to-yellow-600 text-white p-1 rounded-lg shadow-lg ring-1 ring-white/20" title="Gold Member">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          ) : user.premium && (
            <div className="bg-rose-500 text-white p-1.5 rounded-lg text-[8px] font-black shadow-lg">
              PREMIUM
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              hapticFeedback(isFavorite ? 'light' : 'medium');
              onToggleFavorite?.(e);
            }}
            className={cn(
              "p-2.5 rounded-full backdrop-blur-lg transition-all shadow-xl active:scale-75 group/fav",
              isFavorite
                ? "bg-rose-500 text-white scale-110 shadow-rose-200"
                : "bg-black/30 text-white hover:bg-rose-500/50"
            )}
          >
            <Heart className={cn("w-4 h-4 transition-transform duration-300 group-hover/fav:scale-125", isFavorite && "fill-current")} />
          </button>
        </div>

        {/* Bottom Left: Verifications */}
        <div className="absolute bottom-2 left-2 flex gap-1 z-20 pointer-events-none">
          {user.verified && (
            <div className="bg-white rounded-full p-0.5 shadow-lg">
              <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="#3b82f6" color="white" />
            </div>
          )}
        </div>

        {/* Bottom Right: Price */}
        <div className={cn(
          "absolute bottom-2 right-2 bg-white/95 text-rose-600 rounded-xl font-black shadow-2xl transform rotate-1",
          variant === 'compact' ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[10px] sm:text-xs"
        )}>
          {formatPrice(user.price || 0)}
        </div>
      </div>

      {/* Info Container */}
      <div className={cn(
        "space-y-1 sm:space-y-1.5",
        variant === 'compact' ? "p-2" : "p-2.5 sm:p-4"
      )}>
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 truncate">
            {user.online && (
              <div className="relative flex h-2 w-2 shrink-0">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 bg-green-500 border-2 border-white shadow-sm"></div>
              </div>
            )}
            <h3 className={cn(
              "font-black text-gray-900 truncate tracking-tight",
              variant === 'compact' ? "text-[11px]" : "text-xs sm:text-base"
            )}>
              {user.name}
            </h3>
          </div>
          <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
            <Star className={cn(
              "fill-current",
              variant === 'compact' ? "w-2 h-2" : "w-2.5 h-2.5 sm:w-3 sm:h-3"
            )} />
            <span className={cn(
              "font-bold text-gray-900",
              variant === 'compact' ? "text-[9px]" : "text-[10px] sm:text-[11px]"
            )}>{user.rating || '—'}</span>
            {variant !== 'compact' && (user.reviewCount || 0) > 0 && (
              <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold ml-0.5">({user.reviewCount})</span>
            )}
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-1 text-gray-500 font-bold uppercase tracking-tight",
          variant === 'compact' ? "text-[8px]" : "text-[9px] sm:text-[11px]"
        )}>
          <MapPin className={cn(
            "text-rose-400 shrink-0",
            variant === 'compact' ? "w-2 h-2" : "w-2.5 h-2.5"
          )} />
          <span className="truncate">{typeof user.location === 'object' ? (user.location as any).city : user.location}</span>
        </div>

        {variant !== 'compact' && (
          <div className="hidden sm:flex pt-1.5 border-t border-gray-50 items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
              <Clock className="w-3.5 h-3.5" />
              {user.responseTime}
            </div>
            <MessageCircle className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
});
