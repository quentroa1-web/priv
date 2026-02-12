import { useState } from 'react';
import { User } from '../../types';
import {
  Star, Search, ThumbsUp, Flag,
  CheckCircle, Shield, MoreVertical, ArrowLeft,
  X, Reply, Send,
  Award as AwardIcon, Sparkles
} from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
  helpful: number;
  response?: {
    id: string;
    userId: string;
    userName: string;
    comment: string;
    date: Date;
  };
  categories: {
    service: number;
    punctuality: number;
    communication: number;
    value: number;
  };
}

interface ReviewsProps {
  user: User;
  onBack: () => void;
}

export function Reviews({ user, onBack }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Carlos M.',
      userAvatar: 'https://i.pravatar.cc/100?img=1',
      rating: 5,
      comment: 'Excelente servicio, muy profesional y puntual. Superó todas mis expectativas. Definitivamente recomiendo!',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      verified: true,
      helpful: 12,
      categories: {
        service: 5,
        punctuality: 5,
        communication: 5,
        value: 4
      }
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Ana L.',
      userAvatar: 'https://i.pravatar.cc/100?img=2',
      rating: 4,
      comment: 'Muy buena experiencia, aunque el lugar podría mejorar. En general todo bien.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      verified: true,
      helpful: 8,
      response: {
        id: 'resp1',
        userId: user.uid || 'current',
        userName: user.displayName || 'Tú',
        comment: 'Gracias por tu feedback Ana. Estamos mejorando nuestras instalaciones.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)
      },
      categories: {
        service: 4,
        punctuality: 5,
        communication: 4,
        value: 4
      }
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Roberto G.',
      userAvatar: 'https://i.pravatar.cc/100?img=3',
      rating: 5,
      comment: 'Increíble atención al detalle. Volveré sin duda. El mejor servicio que he recibido.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      verified: false,
      helpful: 5,
      categories: {
        service: 5,
        punctuality: 5,
        communication: 5,
        value: 5
      }
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResponse, setShowResponse] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const filteredReviews = reviews.filter(review => {
    if (filter === 'verified' && !review.verified) return false;
    if (filter === '5star' && review.rating < 5) return false;
    if (filter === 'withResponse' && !review.response) return false;
    if (searchTerm && !review.comment.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    averageRating: 4.7,
    totalReviews: reviews.length,
    fiveStar: reviews.filter(r => r.rating === 5).length,
    verifiedReviews: reviews.filter(r => r.verified).length,
    categories: {
      service: 4.8,
      punctuality: 4.9,
      communication: 4.6,
      value: 4.5
    }
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );
  };

  const handleSendResponse = (reviewId: string) => {
    if (!responseText.trim()) return;

    const newResponse = {
      id: `resp_${Date.now()}`,
      userId: user.uid || 'current',
      userName: user.displayName || 'Tú',
      comment: responseText,
      date: new Date()
    };

    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { ...review, response: newResponse }
          : review
      )
    );

    setResponseText('');
    setShowResponse(null);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 1000 * 60 * 60 * 24) {
      return 'Hoy';
    } else if (diff < 1000 * 60 * 60 * 24 * 2) {
      return 'Ayer';
    } else if (diff < 1000 * 60 * 60 * 24 * 7) {
      return `${Math.floor(diff / (1000 * 60 * 60 * 24))} días`;
    }
    return date.toLocaleDateString();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Reseñas y Calificaciones</h1>
            <p className="text-sm text-gray-500">Feedback verificados de usuarios reales</p>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-6">
              {/* Overall Rating */}
              <div className="text-center mb-8">
                <div className="text-5xl font-black text-gray-900 mb-2">{stats.averageRating}</div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {renderStars(stats.averageRating)}
                </div>
                <p className="text-sm text-gray-500">{stats.totalReviews} reseñas verificadas</p>
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Desglose por estrellas</h3>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
                  const percentage = (count / reviews.length) * 100;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-bold text-gray-900">{rating}</span>
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Category Ratings */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Por categoría</h3>
                {Object.entries(stats.categories).map(([category, rating]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 capitalize">{category}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900">{rating}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                  <AwardIcon className="w-4 h-4 text-amber-600" />
                  Insignias
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs font-bold text-amber-800">Excelente Servicio</div>
                      <div className="text-[10px] text-amber-700">4.8+ rating promedio</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-blue-800">Verificado</div>
                      <div className="text-[10px] text-blue-700">+10 reseñas reales</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Todas las reseñas</h2>
                  <p className="text-sm text-gray-500">Feedback de usuarios verificados</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar en reseñas..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filter === 'all'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setFilter('verified')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filter === 'verified'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Verificadas
                    </button>
                    <button
                      onClick={() => setFilter('5star')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        filter === '5star'
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      5★
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
                  <div className="text-2xl font-black text-amber-900 mb-1">{stats.averageRating}</div>
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Rating promedio</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="text-2xl font-black text-blue-900 mb-1">{stats.totalReviews}</div>
                  <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Reseñas totales</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="text-2xl font-black text-green-900 mb-1">{stats.fiveStar}</div>
                  <div className="text-xs font-bold text-green-800 uppercase tracking-wider">5 estrellas</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                  <div className="text-2xl font-black text-purple-900 mb-1">{stats.verifiedReviews}</div>
                  <div className="text-xs font-bold text-purple-800 uppercase tracking-wider">Verificadas</div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map(review => (
                  <div key={review.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{review.userName}</h3>
                            {review.verified && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                <CheckCircle className="w-3 h-3" /> Verificado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                              <span className="text-sm font-bold text-gray-900 ml-1">{review.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleHelpful(review.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Útil ({review.helpful})
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Review Content */}
                    <p className="text-gray-700 mb-4">{review.comment}</p>

                    {/* Category Ratings */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {Object.entries(review.categories).map(([category, rating]) => (
                        <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="text-xs font-medium text-gray-700 capitalize">{category}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-900">{rating}</span>
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Response */}
                    {review.response ? (
                      <div className="mt-4 pl-4 border-l-4 border-amber-300">
                        <div className="bg-amber-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-800 text-sm">{review.response.userName}</span>
                              <span className="text-xs text-amber-600">(Respuesta)</span>
                            </div>
                            <span className="text-xs text-amber-600">{formatDate(review.response.date)}</span>
                          </div>
                          <p className="text-amber-700 text-sm">{review.response.comment}</p>
                        </div>
                      </div>
                    ) : showResponse === review.id ? (
                      <div className="mt-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={responseText}
                            onChange={e => setResponseText(e.target.value)}
                            placeholder="Escribe tu respuesta..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <button
                            onClick={() => handleSendResponse(review.id)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowResponse(null)}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowResponse(review.id)}
                        className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-bold text-sm"
                      >
                        <Reply className="w-4 h-4" />
                        Responder a esta reseña
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {searchTerm ? 'No se encontraron reseñas' : 'Aún no hay reseñas'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Sé el primero en dejar una reseña'}
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    Escribir reseña
                  </button>
                </div>
              )}
            </div>

            {/* Safety Notice */}
            <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Reseñas Verificadas</h4>
                  <p className="text-xs text-gray-700">
                    Todas las reseñas provienen de usuarios que han tenido contacto real. 
                    Reporta reseñas falsas usando el botón <Flag className="w-3 h-3 inline" />.
                    Nuestro sistema de verificación garantiza autenticidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}