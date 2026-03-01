import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api: any = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (userData: any) =>
  api.post('/auth/register', userData);

export const getMe = () =>
  api.get('/auth/me');

export const updateProfile = (userData: any) =>
  api.put('/auth/updatedetails', userData);

export const heartbeat = () =>
  api.post('/auth/heartbeat');

export const changePassword = (data: any) =>
  api.put('/auth/updatepassword', data);

export const deleteAccount = () =>
  api.delete('/auth/delete');

export const updatePaymentMethods = (methods: any[]) =>
  api.put('/auth/updatedetails', { paymentMethods: methods });

export const uploadProof = (formData: FormData) => {
  return api.post('/upload/proof', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadAvatar = (formData: FormData) => {
  return api.post('/upload/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const requestVerification = (formData: FormData) => {
  return api.post('/users/verify', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadImages = (formData: FormData) => {
  return api.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadPacks = (formData: FormData) => {
  return api.post('/upload/packs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getUsers = (filters?: any) =>
  api.get('/users', { params: filters });

// Ads
export const getAds = (filters?: any) =>
  api.get('/ads', { params: filters });

export const getAd = (id: string) =>
  api.get(`/ads/${id}`);

export const createAd = (adData: any) =>
  api.post('/ads', adData);

export const updateAd = (id: string, data: any) =>
  api.put(`/ads/${id}`, data);

export const deleteAd = (id: string) =>
  api.delete(`/ads/${id}`);

export const getMyAds = () =>
  api.get('/ads/myads');

export const boostAd = (id: string) =>
  api.post(`/ads/${id}/boost`);

// Messages
export const getConversations = () =>
  api.get('/messages');

export const getMessages = (userId: string) =>
  api.get(`/messages/${userId}`);

export const sendMessage = (recipientId: string, content: string, options?: { isLocked?: boolean; price?: number }) =>
  api.post('/messages', { recipientId, content, ...options });

export const getUnreadCount = () =>
  api.get('/messages/unread/count');

export const deleteConversation = (userId: string) =>
  api.delete(`/messages/${userId}`);

// Appointments
export const createAppointment = (appointmentData: any) =>
  api.post('/appointments', appointmentData);

export const getMyAppointments = () =>
  api.get('/appointments');

export const updateAppointmentStatus = (id: string, status: string) =>
  api.put(`/appointments/${id}`, { status });

// Reviews
export const createReview = (reviewData: any) =>
  api.post('/reviews', reviewData);

export const getUserReviews = (userId: string) =>
  api.get(`/reviews/user/${userId}`);

export const respondToReview = (id: string, content: string) =>
  api.post(`/reviews/${id}/response`, { content });

export const markReviewHelpful = (id: string) =>
  api.post(`/reviews/${id}/helpful`);


// Admin
export const getAllUsers = () =>
  api.get('/admin/users');

export const adminApi = {
  getAdminStats: () => api.get('/admin/stats'),
  getAdminUsers: () => api.get('/admin/users'),
  updateUserAdmin: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUserAdmin: (id: string) => api.delete(`/admin/users/${id}`),
  getAdminAds: () => api.get('/admin/ads'),
  updateAdAdmin: (id: string, data: any) => api.put(`/admin/ads/${id}`, data),
  deleteAdAdmin: (id: string) => api.delete(`/admin/ads/${id}`),
  verifyAdAdmin: (id: string) => api.put(`/admin/ads/${id}/verify`),
  getVerifications: () => api.get('/admin/verifications'),
  handleVerification: (id: string, data: { status: string; rejectionReason?: string }) =>
    api.put(`/admin/verifications/${id}`, data),
  getPayments: () => api.get('/admin/payments'),
  handlePayment: (id: string, data: { status: string; rejectionReason?: string }) =>
    api.put(`/admin/payments/${id}`, data),
  getReviewsAdmin: () => api.get('/admin/reviews'),
  deleteReviewAdmin: (id: string) => api.delete(`/admin/reviews/${id}`),
};

export const apiService = {
  login,
  register,
  getMe,
  updateProfile,
  uploadAvatar,
  uploadProof,
  uploadImages,
  uploadPacks,
  getUsers,
  getAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  getMyAds,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  deleteConversation,
  createAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  createReview,
  getUserReviews,
  respondToReview,
  markReviewHelpful,
  ...adminApi
};

export default api;
