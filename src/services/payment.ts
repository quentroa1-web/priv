import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');


// Create axios instance with auth header
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getWallet = () => api.get('/payment/wallet');
export const getTransactions = () => api.get('/payment/history');
export const submitPaymentProof = (data: any) => api.post('/payment/submit-proof', data);
export const transferCoins = (data: any) => api.post('/payment/transfer', data);
export const submitWithdrawalRequest = (data: any) => api.post('/payment/withdraw', data);
export const buySubscription = (planId: string) => api.post('/payment/buy-subscription', { planId });
export const boostAd = (adId: string) => api.post('/payment/boost-ad', { adId });
